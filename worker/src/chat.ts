import { generate, type GeminiContent } from './gemini';
import { HttpError, readJson, type Env } from './http';

interface ChatContext {
  recipe?: { title?: string; servings?: number; ingredients?: string[]; steps?: string[] };
  have?: string[];
  allergies?: string[];
  diet?: string;
}

const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 2000;

function clip(value: unknown, max: number): string {
  return typeof value === 'string' ? value.slice(0, max) : '';
}

function list(value: unknown, maxItems: number, maxLength: number): string[] {
  return Array.isArray(value) ? value.slice(0, maxItems).map((item) => clip(item, maxLength)).filter(Boolean) : [];
}

export function buildChat(body: { messages?: unknown; context?: unknown; lang?: unknown }): {
  system: string;
  contents: GeminiContent[];
} {
  if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > MAX_MESSAGES) {
    throw new HttpError(400, 'bad_request');
  }
  const contents: GeminiContent[] = body.messages.map((message) => {
    const record = (message ?? {}) as { role?: unknown; text?: unknown };
    const text = clip(record.text, MAX_MESSAGE_LENGTH).trim();
    if (!text) throw new HttpError(400, 'bad_request');
    return { role: record.role === 'model' ? 'model' : 'user', parts: [{ text }] };
  });
  if (contents[contents.length - 1].role !== 'user') throw new HttpError(400, 'bad_request');

  const context = (body.context ?? {}) as ChatContext;
  const recipe = context.recipe ?? {};
  const language = body.lang === 'es' ? 'Spanish as spoken in Spain, informal "tú"' : 'English';
  const allergies = list(context.allergies, 10, 40);
  const system = [
    "You are PlatoListo's AI chef, helping a student cook on a budget.",
    `Always answer in ${language}.`,
    'Only talk about cooking, ingredients, food safety and this recipe. Politely decline anything else.',
    'Keep answers short: at most 120 words, plain text, no Markdown tables.',
    allergies.length
      ? `The user is allergic to: ${allergies.join(', ')}. Never suggest those ingredients.`
      : 'The user has no allergies listed.',
    `Diet: ${clip(context.diet, 40) || 'anything'}.`,
    `Recipe: ${clip(recipe.title, 120)} for ${Number(recipe.servings) || 2} servings.`,
    `Ingredients: ${list(recipe.ingredients, 40, 80).join(', ')}.`,
    `Steps: ${list(recipe.steps, 15, 400).join(' ')}`,
    `The user already has: ${list(context.have, 40, 60).join(', ') || 'nothing listed'}.`,
  ].join('\n');
  return { system, contents };
}

/** Streams Gemini's server-sent events straight through to the app. */
export async function handleChat(request: Request, env: Env): Promise<Response> {
  const body = await readJson<{ messages?: unknown; context?: unknown; lang?: unknown }>(request, 60_000);
  const { system, contents } = buildChat(body);
  const upstream = await generate(
    env,
    [env.CHAT_MODEL, env.GEMINI_FALLBACK_MODEL],
    {
      systemInstruction: { parts: [{ text: system }] },
      contents,
      generationConfig: { temperature: 0.6, maxOutputTokens: 600, thinkingConfig: { thinkingLevel: 'low' } },
    },
    true,
  );
  return new Response(upstream.body, {
    headers: { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
