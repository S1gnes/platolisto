import { HttpError, json, type Env } from './http';

const API = 'https://api.spoonacular.com';
const PASSED_PARAMS = ['includeIngredients', 'excludeIngredients', 'intolerances', 'diet', 'sort', 'maxReadyTime', 'type'];
const SORTS = ['max-used-ingredients', 'min-missing-ingredients'];
const MAX_TTL = 3600;

/** Whitelisted complexSearch URL. The app never chooses the cost-related flags. */
export function buildSearchUrl(incoming: URLSearchParams): URL {
  const url = new URL('/recipes/complexSearch', API);
  for (const name of PASSED_PARAMS) {
    const value = incoming.get(name)?.trim();
    if (value && value.length <= 600) url.searchParams.set(name, value);
  }
  if (!SORTS.includes(url.searchParams.get('sort') ?? '')) url.searchParams.set('sort', 'max-used-ingredients');
  const number = Math.round(Number(incoming.get('number')));
  url.searchParams.set('number', String(Number.isFinite(number) ? Math.min(20, Math.max(1, number)) : 12));
  url.searchParams.set('fillIngredients', 'true');
  url.searchParams.set('addRecipeInformation', 'true');
  url.searchParams.set('addRecipeInstructions', 'true');
  url.searchParams.set('instructionsRequired', 'true');
  url.searchParams.set('ignorePantry', 'true');
  return url;
}

export function buildInfoUrl(id: string): URL {
  if (!/^\d{1,9}$/.test(id)) throw new HttpError(400, 'bad_request');
  const url = new URL(`/recipes/${id}/information`, API);
  url.searchParams.set('includeNutrition', 'false');
  return url;
}

export function cacheTtl(value: string | undefined): number {
  const ttl = Math.round(Number(value));
  return Number.isFinite(ttl) ? Math.min(MAX_TTL, Math.max(0, ttl)) : 0;
}

// Spoonacular content is passed straight through and only cached when the TTL setting allows it.
async function proxy(target: URL, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (!env.SPOONACULAR_API_KEY) throw new HttpError(503, 'not_configured');
  const ttl = cacheTtl(env.SPOONACULAR_CACHE_TTL);
  const cacheKey = new Request(target.toString());
  if (ttl > 0) {
    const hit = await caches.default.match(cacheKey);
    if (hit) return hit;
  }
  const upstream = await fetch(target, { headers: { 'x-api-key': env.SPOONACULAR_API_KEY } });
  if (upstream.status === 402) throw new HttpError(402, 'quota');
  if (upstream.status === 429) throw new HttpError(429, 'rate_limited');
  if (!upstream.ok) return json({ error: 'upstream', status: upstream.status }, 502);

  const response = new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': ttl > 0 ? `public, max-age=${ttl}` : 'no-store',
      'X-Quota-Left': upstream.headers.get('X-API-Quota-Left') ?? '',
    },
  });
  if (ttl > 0) ctx.waitUntil(caches.default.put(cacheKey, response.clone()));
  return response;
}

export function handleRecipeSearch(url: URL, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (!url.searchParams.get('includeIngredients')) throw new HttpError(400, 'bad_request');
  return proxy(buildSearchUrl(url.searchParams), env, ctx);
}

export function handleRecipeInfo(id: string, env: Env, ctx: ExecutionContext): Promise<Response> {
  return proxy(buildInfoUrl(id), env, ctx);
}
