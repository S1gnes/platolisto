# Setup

## Requirements

- Node.js 24 or newer (npm 11).
- Windows, macOS or Linux. The commands below are for PowerShell.

## Run locally (offline)

```powershell
npm install
npm run dev
```

Open http://localhost:5173. On a phone in the same Wi-Fi network, run `npm run dev -- --host` and open the printed network address.

Without a Worker URL the app runs fully offline: presets, typed lists and "cook from deals" use the bundled PlatoListo recipes. Your own photos show a "not connected yet" message with a preset fallback.

## Checks

```powershell
npm run typecheck
npm test
npm run build
```

`npm run build` writes a static site to `dist/`. It uses relative asset paths and a hash router, so it works from any GitHub Pages path.

## Live services: keys

The keys live only in the Cloudflare Worker, never in the app bundle and never in git.

1. **Gemini API key** (photo recognition, translation, AI chef): https://aistudio.google.com/apikey → *Create API key*. The free tier is enough for the demo. On the free tier Google may use the data to improve its products, which the app's privacy note says.
2. **Spoonacular API key** (live recipe search): sign up for the free plan at https://spoonacular.com/food-api/console and copy the key from *Profile*. The free plan has 50 points a day; one search costs about 2 points.

## Live services: run the Worker locally

```powershell
Copy-Item worker/.dev.vars.example worker/.dev.vars
notepad worker/.dev.vars
```

Paste both keys into `worker/.dev.vars` (it is git-ignored), then start the Worker:

```powershell
npm run worker:dev
```

It listens on http://127.0.0.1:8787. Check it with http://127.0.0.1:8787/health: `vision` and `recipes` should be `true`.

Point the app at it and restart `npm run dev`:

```powershell
Set-Content .env.local "VITE_WORKER_URL=http://127.0.0.1:8787"
```

## Live services: deploy the Worker

1. Create a free Cloudflare account, then sign in from the terminal:

   ```powershell
   npx wrangler login
   ```

2. Put the Pages origin into `ALLOWED_ORIGINS` in `worker/wrangler.jsonc` (for example `https://s1gnes.github.io`). Keep `http://localhost:5173` while you test locally.
3. Deploy and add the keys as secrets (wrangler asks for each value; paste it there, not into chat or files):

   ```powershell
   npm run worker:deploy
   npx wrangler secret put GEMINI_API_KEY --config worker/wrangler.jsonc
   npx wrangler secret put SPOONACULAR_API_KEY --config worker/wrangler.jsonc
   ```

4. The deploy prints the Worker URL, for example `https://platolisto-proxy.<your-subdomain>.workers.dev`. Use it as `VITE_WORKER_URL` when building the app.

If the deploy rejects the `ratelimits` block on your plan, delete that block from `worker/wrangler.jsonc`. The Worker then falls back to an in-memory per-IP limit.

## Worker reference

| Endpoint | What it does |
|---|---|
| `GET /health` | Shows whether each key is configured. |
| `POST /vision` | `{ image, mimeType, kind: "fridge" \| "bar" }` → `{ items: [{ name, label_es, quantity, confidence, box_2d }] }` |
| `POST /translate` | `{ texts: string[] }` → `{ translations: string[] }` (English → Spain Spanish) |
| `POST /chat` | Streams the AI chef's reply as server-sent events (used by Plus, milestone 4). |
| `GET /recipes/search` | Spoonacular `complexSearch`, passed through. |
| `GET /recipes/:id` | Spoonacular recipe information, passed through. |

Settings in `worker/wrangler.jsonc`:

- `GEMINI_MODEL`, `GEMINI_FALLBACK_MODEL`, `TRANSLATE_MODEL`, `CHAT_MODEL`: model IDs. Free-tier models change often, so check https://ai.google.dev/gemini-api/docs/models before a demo.
- `SPOONACULAR_CACHE_TTL`: keep `0`. Spoonacular allows caching only with its written permission, and for at most 3600 seconds.
- `RATE_LIMIT_PER_MINUTE`: requests per minute per IP for the in-memory fallback.
- Requests must come from an origin in `ALLOWED_ORIGINS`. Bodies are size-limited (photos about 1.8 MB, text about 60 KB).

## Cocktail dataset

Bartender mode matches drinks offline against `src/data/cocktails.json`, built from TheCocktailDB's free API (key `1`, for development and educational use). To refresh it:

```powershell
npm run build:cocktails
```

The script asks for drinks by first letter (a–z, 0–9), keeps only the fields the app uses and writes the JSON. The free API returns at most 25 drinks per letter, so the file has a few hundred drinks. The app loads it only when bartender mode opens.

## Still to come

- GitHub Pages deploy and `scripts/precompute-presets`: milestone 5.
