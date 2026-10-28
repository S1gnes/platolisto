import { handleChat } from './chat';
import { corsHeaders, isAllowedOrigin, withHeaders } from './cors';
import { errorResponse, HttpError, json, type Env } from './http';
import { allowRequest } from './limits';
import { handleRecipeInfo, handleRecipeSearch } from './spoonacular';
import { handleTranslate } from './translate';
import { handleVision } from './vision';

async function route(request: Request, url: URL, env: Env, ctx: ExecutionContext): Promise<Response> {
  const { pathname } = url;
  if (request.method === 'POST' && pathname === '/vision') return handleVision(request, env);
  if (request.method === 'POST' && pathname === '/translate') return handleTranslate(request, env);
  if (request.method === 'POST' && pathname === '/chat') return handleChat(request, env);
  if (request.method === 'GET' && pathname === '/recipes/search') return handleRecipeSearch(url, env, ctx);
  const info = pathname.match(/^\/recipes\/(\d+)$/);
  if (request.method === 'GET' && info) return handleRecipeInfo(info[1], env, ctx);
  throw new HttpError(404, 'not_found');
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    const allowed = isAllowedOrigin(origin, env.ALLOWED_ORIGINS);
    const cors = corsHeaders(allowed ? origin : null);

    if (request.method === 'OPTIONS') return new Response(null, { status: allowed ? 204 : 403, headers: cors });
    if (url.pathname === '/health') {
      return json({ ok: true, vision: Boolean(env.GEMINI_API_KEY), recipes: Boolean(env.SPOONACULAR_API_KEY) }, 200, cors);
    }
    // Browsers always send Origin on cross-site requests; anything else is not the app.
    if (!allowed) return json({ error: 'forbidden_origin' }, 403, cors);
    if (!(await allowRequest(env, request.headers.get('CF-Connecting-IP') ?? 'local'))) {
      return withHeaders(errorResponse(new HttpError(429, 'rate_limited')), cors);
    }

    try {
      return withHeaders(await route(request, url, env, ctx), cors);
    } catch (error) {
      const failure = error instanceof HttpError ? error : new HttpError(502, 'upstream');
      if (!(error instanceof HttpError)) console.error('proxy error', error);
      return withHeaders(errorResponse(failure), cors);
    }
  },
} satisfies ExportedHandler<Env>;
