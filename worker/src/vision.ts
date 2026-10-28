import { generateText, parseModelJson } from './gemini';
import { HttpError, json, readJson, type Env } from './http';

export type VisionKind = 'fridge' | 'bar';

export interface Detection {
  name: string;
  label_es: string;
  quantity: string | null;
  confidence: number;
  box_2d: [number, number, number, number] | null;
}

const MAX_IMAGE_CHARS = 2_400_000; // ~1.8 MB of JPEG as base64; the app sends about 200 KB.
const MAX_ITEMS = 25;
const MIN_CONFIDENCE = 0.35;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const COMMON_RULES = `For every item give:
- "name": the generic English name that recipe APIs use, lowercase, plural where natural. No brands, no sizes.
- "label_es": the usual name in Spain Spanish.
- "quantity": a whole number as text when the items can be counted, otherwise null.
- "confidence": from 0 to 1.
- "box_2d": [ymin, xmin, ymax, xmax] around the item, normalized to 0-1000.
Merge duplicates into one item. Ignore people, hands and non-food objects. At most ${MAX_ITEMS} items.
Answer with JSON only: {"items": [...]}.`;

const PROMPTS: Record<VisionKind, string> = {
  fridge: `List the food ingredients you can see in this photo of a fridge, shelf or kitchen counter.
Names look like "cherry tomatoes", "greek yogurt", "chicken thighs", "eggs", "cooked rice". Skip alcoholic drinks and empty packaging.
${COMMON_RULES}`,
  bar: `List the bottles and cocktail ingredients you can see in this photo: spirits, liqueurs, mixers, juices, syrups, fruit, herbs, sugar.
Names look like cocktail recipe ingredients: "white rum", "vodka", "triple sec", "lime", "mint", "cola", "soda water".
${COMMON_RULES}`,
};

const SCHEMA = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      maxItems: MAX_ITEMS,
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          label_es: { type: 'string' },
          quantity: { type: ['string', 'null'] },
          confidence: { type: 'number', minimum: 0, maximum: 1 },
          box_2d: { type: 'array', items: { type: 'integer', minimum: 0, maximum: 1000 }, minItems: 4, maxItems: 4 },
        },
        required: ['name', 'label_es', 'quantity', 'confidence', 'box_2d'],
      },
    },
  },
  required: ['items'],
};

function toBox(value: unknown): Detection['box_2d'] {
  if (!Array.isArray(value) || value.length !== 4) return null;
  const numbers = value.map(Number);
  if (numbers.some((n) => !Number.isFinite(n))) return null;
  const [ymin, xmin, ymax, xmax] = numbers.map((n) => Math.round(Math.min(1000, Math.max(0, n))));
  return ymax > ymin && xmax > xmin ? [ymin, xmin, ymax, xmax] : null;
}

/** Validate and clean the model's detections. Anything malformed is dropped, never trusted. */
export function parseDetections(raw: unknown): Detection[] {
  const list = Array.isArray(raw) ? raw : (raw as { items?: unknown } | null)?.items;
  if (!Array.isArray(list)) return [];
  const seen = new Set<string>();
  const items: Detection[] = [];
  for (const entry of list) {
    if (!entry || typeof entry !== 'object') continue;
    const record = entry as Record<string, unknown>;
    const name = typeof record.name === 'string' ? record.name.trim().toLowerCase().slice(0, 60) : '';
    if (!name || seen.has(name)) continue;
    const confidence = Number(record.confidence);
    const score = Number.isFinite(confidence) ? Math.min(1, Math.max(0, confidence)) : 0.5;
    if (score < MIN_CONFIDENCE) continue;
    const qty = record.quantity;
    const quantity =
      typeof qty === 'number' && Number.isFinite(qty) && qty > 0
        ? String(Math.round(qty))
        : typeof qty === 'string' && /^\d{1,3}$/.test(qty.trim())
          ? qty.trim()
          : null;
    seen.add(name);
    items.push({
      name,
      label_es: typeof record.label_es === 'string' && record.label_es.trim() ? record.label_es.trim().slice(0, 60) : name,
      quantity,
      confidence: Math.round(score * 100) / 100,
      box_2d: toBox(record.box_2d),
    });
    if (items.length >= MAX_ITEMS) break;
  }
  return items;
}

export async function handleVision(request: Request, env: Env): Promise<Response> {
  const body = await readJson<{ image?: unknown; mimeType?: unknown; kind?: unknown }>(request, MAX_IMAGE_CHARS + 2000);
  const image = typeof body.image === 'string' ? body.image.replace(/^data:[^,]+,/, '') : '';
  const mimeType = typeof body.mimeType === 'string' && IMAGE_TYPES.includes(body.mimeType) ? body.mimeType : 'image/jpeg';
  const kind: VisionKind = body.kind === 'bar' ? 'bar' : 'fridge';
  if (!image || image.length > MAX_IMAGE_CHARS || !/^[A-Za-z0-9+/=]+$/.test(image.slice(0, 200))) {
    throw new HttpError(400, 'bad_request');
  }

  const text = await generateText(env, [env.GEMINI_MODEL, env.GEMINI_FALLBACK_MODEL], {
    contents: [{ role: 'user', parts: [{ text: PROMPTS[kind] }, { inlineData: { mimeType, data: image } }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseJsonSchema: SCHEMA,
      temperature: 0.2,
      thinkingConfig: { thinkingLevel: 'low' },
    },
  });
  return json({ items: parseDetections(parseModelJson(text)) });
}
