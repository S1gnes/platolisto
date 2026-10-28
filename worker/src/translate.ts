import { generateText, parseModelJson } from './gemini';
import { HttpError, json, readJson, type Env } from './http';

const MAX_TEXTS = 80;
const MAX_TEXT_LENGTH = 1500;

export function validateTexts(value: unknown): string[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_TEXTS) throw new HttpError(400, 'bad_request');
  return value.map((text) => {
    if (typeof text !== 'string' || text.length > MAX_TEXT_LENGTH) throw new HttpError(400, 'bad_request');
    return text;
  });
}

export function parseTranslations(raw: unknown, expected: number): string[] {
  const list = (raw as { translations?: unknown } | null)?.translations;
  if (!Array.isArray(list) || list.length !== expected || list.some((item) => typeof item !== 'string')) {
    throw new HttpError(502, 'bad_response');
  }
  return list as string[];
}

export async function handleTranslate(request: Request, env: Env): Promise<Response> {
  const body = await readJson<{ texts?: unknown }>(request, 60_000);
  const texts = validateTexts(body.texts);
  const prompt = `Translate these recipe texts from English to Spanish as spoken in Spain.
Use informal "tú" in instructions, keep numbers, units and the order. Ingredient names should be the usual names in Spanish supermarkets.
Return JSON {"translations": [...]} with exactly ${texts.length} strings.

${JSON.stringify(texts)}`;

  const text = await generateText(env, [env.TRANSLATE_MODEL, env.GEMINI_MODEL], {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseJsonSchema: {
        type: 'object',
        properties: { translations: { type: 'array', items: { type: 'string' } } },
        required: ['translations'],
      },
      temperature: 0.2,
    },
  });
  return json({ translations: parseTranslations(parseModelJson(text), texts.length) });
}
