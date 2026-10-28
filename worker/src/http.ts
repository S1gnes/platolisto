export interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export interface Env {
  GEMINI_API_KEY?: string;
  SPOONACULAR_API_KEY?: string;
  ALLOWED_ORIGINS: string;
  GEMINI_MODEL: string;
  GEMINI_FALLBACK_MODEL: string;
  TRANSLATE_MODEL: string;
  CHAT_MODEL: string;
  SPOONACULAR_CACHE_TTL?: string;
  RATE_LIMIT_PER_MINUTE?: string;
  LIMITER?: RateLimiter;
}

export type ErrorCode =
  | 'bad_request'
  | 'forbidden_origin'
  | 'not_found'
  | 'not_configured'
  | 'too_large'
  | 'rate_limited'
  | 'quota'
  | 'blocked'
  | 'upstream'
  | 'bad_response';

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode,
  ) {
    super(code);
  }
}

export function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  });
}

export function errorResponse(error: HttpError): Response {
  return json({ error: error.code }, error.status, error.status === 429 ? { 'Retry-After': '60' } : {});
}

/** Read a JSON body, refusing anything larger than `maxBytes`. */
export async function readJson<T>(request: Request, maxBytes: number): Promise<T> {
  const declared = Number(request.headers.get('Content-Length') ?? '0');
  if (declared > maxBytes) throw new HttpError(413, 'too_large');
  const text = await request.text();
  if (text.length > maxBytes) throw new HttpError(413, 'too_large');
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new HttpError(400, 'bad_request');
  }
}
