import { HttpError, type Env } from './http';

const API = 'https://generativelanguage.googleapis.com/v1beta/models';

export interface GeminiPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
  thought?: boolean;
}

export interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

export interface GeminiRequest {
  contents: GeminiContent[];
  systemInstruction?: { parts: GeminiPart[] };
  generationConfig?: Record<string, unknown>;
}

interface GeminiResponse {
  candidates?: { content?: { parts?: GeminiPart[] }; finishReason?: string }[];
  promptFeedback?: { blockReason?: string };
}

/** Text of the first candidate, without the model's thought parts. */
export function extractText(data: GeminiResponse): string {
  if (data.promptFeedback?.blockReason) throw new HttpError(422, 'blocked');
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  return parts
    .filter((part) => !part.thought && typeof part.text === 'string')
    .map((part) => part.text)
    .join('');
}

/** Drop optional config the API may reject (thinking level, JSON schema), keeping plain JSON mode. */
export function simplifyConfig(config: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (!config) return config;
  const { thinkingConfig: _thinking, responseJsonSchema: _schema, ...rest } = config;
  return rest;
}

export function callModel(env: Env, model: string, body: GeminiRequest, stream = false): Promise<Response> {
  const method = stream ? 'streamGenerateContent?alt=sse' : 'generateContent';
  return fetch(`${API}/${encodeURIComponent(model)}:${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY ?? '' },
    body: JSON.stringify(body),
  });
}

/**
 * Try each model in order. A 400 is retried once on the same model with a simpler config;
 * rate limits and server errors move on to the next model.
 */
export async function generate(env: Env, models: string[], body: GeminiRequest, stream = false): Promise<Response> {
  if (!env.GEMINI_API_KEY) throw new HttpError(503, 'not_configured');
  let lastStatus = 502;
  for (const model of [...new Set(models.filter(Boolean))]) {
    let response = await callModel(env, model, body, stream);
    if (response.status === 400 && body.generationConfig) {
      response = await callModel(env, model, { ...body, generationConfig: simplifyConfig(body.generationConfig) }, stream);
    }
    if (response.ok) return response;
    lastStatus = response.status;
    if (response.status !== 429 && response.status < 500) break;
  }
  if (lastStatus === 429) throw new HttpError(429, 'rate_limited');
  throw new HttpError(502, 'upstream');
}

export async function generateText(env: Env, models: string[], body: GeminiRequest): Promise<string> {
  const response = await generate(env, models, body);
  return extractText((await response.json()) as GeminiResponse);
}

/** Parse model JSON output, tolerating Markdown code fences. */
export function parseModelJson(text: string): unknown {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```$/, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new HttpError(502, 'bad_response');
  }
}
