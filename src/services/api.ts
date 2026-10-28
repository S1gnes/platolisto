import { config } from '../config';
import type { RawDetection } from '../core/presets';
import type { SpoonRecipe } from '../core/spoonacular';

export type ApiErrorCode =
  | 'not_configured'
  | 'offline'
  | 'timeout'
  | 'quota'
  | 'rate_limited'
  | 'too_large'
  | 'blocked'
  | 'bad_response'
  | 'upstream';

const KNOWN: ApiErrorCode[] = ['not_configured', 'quota', 'rate_limited', 'too_large', 'blocked', 'bad_response', 'upstream'];

export class ApiError extends Error {
  constructor(readonly code: ApiErrorCode) {
    super(code);
  }
}

export function errorCode(error: unknown): ApiErrorCode {
  return error instanceof ApiError ? error.code : 'upstream';
}

/** Live services are on when the app was built with a Worker URL. */
export function liveEnabled(): boolean {
  return config.workerUrl.trim().length > 0;
}

function offline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
}

async function call(path: string, init: RequestInit = {}, timeoutMs = 20_000): Promise<Response> {
  if (!liveEnabled()) throw new ApiError('not_configured');
  if (offline()) throw new ApiError('offline');
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  let response: Response;
  try {
    response = await fetch(`${config.workerUrl.replace(/\/$/, '')}${path}`, { ...init, signal: controller.signal });
  } catch {
    throw new ApiError(controller.signal.aborted ? 'timeout' : offline() ? 'offline' : 'upstream');
  } finally {
    window.clearTimeout(timer);
  }
  if (!response.ok) {
    let code: ApiErrorCode = response.status === 402 ? 'quota' : response.status === 429 ? 'rate_limited' : 'upstream';
    try {
      const body = (await response.json()) as { error?: string };
      if (KNOWN.includes(body.error as ApiErrorCode)) code = body.error as ApiErrorCode;
    } catch {
      // Keep the status-based code.
    }
    throw new ApiError(code);
  }
  return response;
}

async function readJson<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError('bad_response');
  }
}

function post(path: string, body: unknown, timeoutMs?: number): Promise<Response> {
  return call(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, timeoutMs);
}

export async function detectItems(image: string, mimeType: string, kind: 'fridge' | 'bar'): Promise<RawDetection[]> {
  const data = await readJson<{ items?: RawDetection[] }>(await post('/vision', { image, mimeType, kind }, 35_000));
  if (!Array.isArray(data.items)) throw new ApiError('bad_response');
  return data.items;
}

export async function searchRecipes(params: URLSearchParams): Promise<SpoonRecipe[]> {
  const data = await readJson<{ results?: SpoonRecipe[] }>(await call(`/recipes/search?${params}`));
  return Array.isArray(data.results) ? data.results : [];
}

export async function fetchRecipe(id: number): Promise<SpoonRecipe> {
  const data = await readJson<SpoonRecipe>(await call(`/recipes/${id}`));
  if (!data || typeof data.id !== 'number') throw new ApiError('bad_response');
  return data;
}

export async function translateTexts(texts: string[]): Promise<string[]> {
  const data = await readJson<{ translations?: string[] }>(await post('/translate', { texts }, 30_000));
  if (!Array.isArray(data.translations) || data.translations.length !== texts.length) throw new ApiError('bad_response');
  return data.translations;
}
