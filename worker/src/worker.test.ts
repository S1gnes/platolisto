import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildChat } from './chat';
import { corsHeaders, isAllowedOrigin } from './cors';
import { extractText, parseModelJson, simplifyConfig } from './gemini';
import type { Env } from './http';
import { memoryLimit } from './limits';
import { buildInfoUrl, buildSearchUrl, cacheTtl } from './spoonacular';
import { parseTranslations, validateTexts } from './translate';
import { parseDetections } from './vision';
import worker from './index';

const ENV: Env = {
  GEMINI_API_KEY: 'test-gemini',
  SPOONACULAR_API_KEY: 'test-spoon',
  ALLOWED_ORIGINS: 'https://s1gnes.github.io, http://localhost:5173',
  GEMINI_MODEL: 'model-a',
  GEMINI_FALLBACK_MODEL: 'model-b',
  TRANSLATE_MODEL: 'model-lite',
  CHAT_MODEL: 'model-a',
  SPOONACULAR_CACHE_TTL: '0',
  RATE_LIMIT_PER_MINUTE: '1000',
};
const CTX = { waitUntil: () => {}, passThroughOnException: () => {} } as unknown as ExecutionContext;
const ORIGIN = 'http://localhost:5173';

function geminiReply(text: string, status = 200): Response {
  return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: 'thinking…', thought: true }, { text }] } }] }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

afterEach(() => vi.unstubAllGlobals());

describe('CORS', () => {
  it('allows only configured origins', () => {
    expect(isAllowedOrigin('https://s1gnes.github.io', ENV.ALLOWED_ORIGINS)).toBe(true);
    expect(isAllowedOrigin('https://evil.example', ENV.ALLOWED_ORIGINS)).toBe(false);
    expect(isAllowedOrigin(null, ENV.ALLOWED_ORIGINS)).toBe(false);
    expect(corsHeaders(null)['Access-Control-Allow-Origin']).toBeUndefined();
  });

  it('rejects requests from other sites before touching the APIs', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const response = await worker.fetch(
      new Request('https://proxy.test/recipes/search?includeIngredients=egg', { headers: { Origin: 'https://evil.example' } }),
      ENV,
      CTX,
    );
    expect(response.status).toBe(403);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('vision', () => {
  it('cleans detections and drops junk', () => {
    const items = parseDetections({
      items: [
        { name: ' Cherry Tomatoes ', label_es: 'Tomates cherry', quantity: null, confidence: 0.9, box_2d: [500, 80, 700, 280] },
        { name: 'eggs', label_es: 'Huevos', quantity: 4, confidence: 1.4, box_2d: [100, 50, 300, 360] },
        { name: 'cherry tomatoes', label_es: 'dup', quantity: null, confidence: 0.9, box_2d: null },
        { name: 'mystery', label_es: '', quantity: 'lots', confidence: 0.1, box_2d: [0, 0, 0, 0] },
        { name: 'milk', label_es: 'Leche', quantity: '1', confidence: 0.8, box_2d: [300, 300, 100, 400] },
        'not an object',
      ],
    });
    expect(items).toEqual([
      { name: 'cherry tomatoes', label_es: 'Tomates cherry', quantity: null, confidence: 0.9, box_2d: [500, 80, 700, 280] },
      { name: 'eggs', label_es: 'Huevos', quantity: '4', confidence: 1, box_2d: [100, 50, 300, 360] },
      { name: 'milk', label_es: 'Leche', quantity: '1', confidence: 0.8, box_2d: null },
    ]);
  });

  it('calls Gemini with the image and returns parsed items, skipping thought parts', async () => {
    const fetchSpy = vi.fn(async () => geminiReply('```json\n{"items":[{"name":"lemon","label_es":"Limón","quantity":"1","confidence":0.9,"box_2d":[10,10,200,200]}]}\n```'));
    vi.stubGlobal('fetch', fetchSpy);
    const response = await worker.fetch(
      new Request('https://proxy.test/vision', {
        method: 'POST',
        headers: { Origin: ORIGIN, 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: 'aGVsbG8=', mimeType: 'image/jpeg', kind: 'fridge' }),
      }),
      ENV,
      CTX,
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(ORIGIN);
    expect(await response.json()).toEqual({ items: [{ name: 'lemon', label_es: 'Limón', quantity: '1', confidence: 0.9, box_2d: [10, 10, 200, 200] }] });
    const [url, init] = fetchSpy.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toContain('/models/model-a:generateContent');
    expect((init.headers as Record<string, string>)['x-goog-api-key']).toBe('test-gemini');
    expect(String(init.body)).toContain('"inlineData":{"mimeType":"image/jpeg","data":"aGVsbG8="}');
  });

  it('falls back to the second model when the first is rate limited', async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(new Response('{}', { status: 429 }))
      .mockResolvedValueOnce(geminiReply('{"items":[]}'));
    vi.stubGlobal('fetch', fetchSpy);
    const response = await worker.fetch(
      new Request('https://proxy.test/vision', { method: 'POST', headers: { Origin: ORIGIN }, body: JSON.stringify({ image: 'aGVsbG8=' }) }),
      ENV,
      CTX,
    );
    expect(response.status).toBe(200);
    expect(String(fetchSpy.mock.calls[1][0])).toContain('/models/model-b:');
  });

  it('retries once without the optional config after a 400', async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(new Response('{"error":{}}', { status: 400 }))
      .mockResolvedValueOnce(geminiReply('{"items":[]}'));
    vi.stubGlobal('fetch', fetchSpy);
    await worker.fetch(
      new Request('https://proxy.test/vision', { method: 'POST', headers: { Origin: ORIGIN }, body: JSON.stringify({ image: 'aGVsbG8=' }) }),
      ENV,
      CTX,
    );
    const retryBody = String((fetchSpy.mock.calls[1] as unknown as [string, RequestInit])[1].body);
    expect(retryBody).not.toContain('thinkingConfig');
    expect(retryBody).not.toContain('responseJsonSchema');
    expect(retryBody).toContain('application/json');
  });

  it('says when it is not configured or the body is too large', async () => {
    const unconfigured = await worker.fetch(
      new Request('https://proxy.test/vision', { method: 'POST', headers: { Origin: ORIGIN }, body: JSON.stringify({ image: 'aGVsbG8=' }) }),
      { ...ENV, GEMINI_API_KEY: undefined },
      CTX,
    );
    expect(unconfigured.status).toBe(503);
    const tooLarge = await worker.fetch(
      new Request('https://proxy.test/vision', { method: 'POST', headers: { Origin: ORIGIN }, body: JSON.stringify({ image: 'a'.repeat(2_500_000) }) }),
      ENV,
      CTX,
    );
    expect(tooLarge.status).toBe(413);
  });
});

describe('gemini helpers', () => {
  it('extracts text and reports blocked prompts', () => {
    expect(extractText({ candidates: [{ content: { parts: [{ text: 'a', thought: true }, { text: 'b' }, { text: 'c' }] } }] })).toBe('bc');
    expect(() => extractText({ promptFeedback: { blockReason: 'SAFETY' } })).toThrow('blocked');
  });

  it('parses fenced JSON and drops optional config', () => {
    expect(parseModelJson('```json\n{"a":1}\n```')).toEqual({ a: 1 });
    expect(() => parseModelJson('nope')).toThrow('bad_response');
    expect(simplifyConfig({ responseMimeType: 'application/json', responseJsonSchema: {}, thinkingConfig: {} })).toEqual({
      responseMimeType: 'application/json',
    });
  });
});

describe('spoonacular', () => {
  it('whitelists params and fixes the expensive flags', () => {
    const url = buildSearchUrl(
      new URLSearchParams({ includeIngredients: 'egg,onion', diet: 'vegetarian', number: '500', apiKey: 'stolen', addRecipeNutrition: 'true' }),
    );
    expect(url.searchParams.get('includeIngredients')).toBe('egg,onion');
    expect(url.searchParams.get('number')).toBe('20');
    expect(url.searchParams.get('sort')).toBe('max-used-ingredients');
    expect(url.searchParams.get('fillIngredients')).toBe('true');
    expect(url.searchParams.has('apiKey')).toBe(false);
    expect(url.searchParams.has('addRecipeNutrition')).toBe(false);
  });

  it('only accepts numeric recipe ids and caps the cache TTL', () => {
    expect(buildInfoUrl('716429').pathname).toBe('/recipes/716429/information');
    expect(() => buildInfoUrl('../keys')).toThrow();
    expect(cacheTtl(undefined)).toBe(0);
    expect(cacheTtl('99999')).toBe(3600);
    expect(cacheTtl('-5')).toBe(0);
  });

  it('maps quota errors to 402 with the key sent as a header', async () => {
    const fetchSpy = vi.fn(async () => new Response('{"status":"failure"}', { status: 402 }));
    vi.stubGlobal('fetch', fetchSpy);
    const response = await worker.fetch(
      new Request('https://proxy.test/recipes/search?includeIngredients=egg', { headers: { Origin: ORIGIN } }),
      ENV,
      CTX,
    );
    expect(response.status).toBe(402);
    expect(await response.json()).toEqual({ error: 'quota' });
    const [target, init] = fetchSpy.mock.calls[0] as unknown as [URL, RequestInit];
    expect(String(target)).not.toContain('test-spoon');
    expect((init.headers as Record<string, string>)['x-api-key']).toBe('test-spoon');
  });
});

describe('translate and chat', () => {
  it('validates translation input and output', () => {
    expect(validateTexts(['a', 'b'])).toEqual(['a', 'b']);
    expect(() => validateTexts([])).toThrow();
    expect(() => validateTexts([1])).toThrow();
    expect(parseTranslations({ translations: ['x', 'y'] }, 2)).toEqual(['x', 'y']);
    expect(() => parseTranslations({ translations: ['x'] }, 2)).toThrow('bad_response');
  });

  it('builds a cooking-only system prompt with allergies and language', () => {
    const { system, contents } = buildChat({
      messages: [{ role: 'user', text: 'Make it spicier' }],
      context: { recipe: { title: 'Shakshuka', servings: 2, ingredients: ['eggs'], steps: ['Cook.'] }, allergies: ['nuts'], diet: 'vegetarian' },
      lang: 'es',
    });
    expect(system).toContain('Spanish as spoken in Spain');
    expect(system).toContain('allergic to: nuts');
    expect(system).toContain('Only talk about cooking');
    expect(contents).toEqual([{ role: 'user', parts: [{ text: 'Make it spicier' }] }]);
    expect(() => buildChat({ messages: [{ role: 'model', text: 'hi' }] })).toThrow();
  });
});

describe('rate limit fallback', () => {
  it('counts per key inside a one-minute window', () => {
    const now = 1_000_000;
    expect(memoryLimit('ip-1', 2, now)).toBe(true);
    expect(memoryLimit('ip-1', 2, now + 1)).toBe(true);
    expect(memoryLimit('ip-1', 2, now + 2)).toBe(false);
    expect(memoryLimit('ip-2', 2, now + 2)).toBe(true);
    expect(memoryLimit('ip-1', 2, now + 61_000)).toBe(true);
  });
});
