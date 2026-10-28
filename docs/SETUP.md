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

Without a Worker URL the app runs fully offline: presets, typed lists, "cook from deals", the weekly plan and bartender matching all use bundled data. Your own photos, the AI chef and bottle scanning show a "not connected yet" message with a fallback.

## Checks

```powershell
npm run typecheck
npm test
npx playwright install chromium
npm run test:e2e
```

- `npm test` runs the Vitest unit tests: normalization, matching, ranking, costs, the weekly plan, bartender matching, the Worker and the stream parser.
- `npm run test:e2e` builds the app, serves it on port 4173 and runs Playwright on a phone viewport. One test walks the whole preset flow with every non-local request blocked, and fails if anything tries to leave the machine. The other runs axe (WCAG 2.2 AA, serious and critical issues) and checks that touch targets are at least 44 px on every screen.

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

2. Check `ALLOWED_ORIGINS` in `worker/wrangler.jsonc`. It must contain the Pages origin (`https://s1gnes.github.io` by default). Keep `http://localhost:5173` while you test locally.
3. Deploy and add the keys as secrets (wrangler asks for each value; paste it there, not into chat or files):

   ```powershell
   npm run worker:deploy
   npx wrangler secret put GEMINI_API_KEY --config worker/wrangler.jsonc
   npx wrangler secret put SPOONACULAR_API_KEY --config worker/wrangler.jsonc
   ```

4. The deploy prints the Worker URL, for example `https://platolisto-proxy.<your-subdomain>.workers.dev`.

If the deploy rejects the `ratelimits` block on your plan, delete that block from `worker/wrangler.jsonc`. The Worker then falls back to an in-memory per-IP limit.

## Deploy the app to GitHub Pages

The workflow in `.github/workflows/deploy.yml` type-checks, runs the unit tests, builds and publishes `dist/` on every push to `main`.

1. In the GitHub repository go to *Settings → Pages* and set *Source* to **GitHub Actions**.
2. Optional, for live services: *Settings → Secrets and variables → Actions → Variables*, add `WORKER_URL` with the Worker URL. Without it the published site is the offline demo.
3. Push to `main` (or run the workflow by hand from the *Actions* tab). The site appears at `https://<user>.github.io/<repo>/`.

Make a QR code for the talk from that URL. Any deep link works too, for example `…/#/deals`.

## Preset photos

The presets ship with illustrated fridges and hand-written detections, so they work with zero network calls. To use real photos:

1. Save three photos as `public/presets/student.jpg`, `market.jpg` and `empty.jpg` (JPEG, PNG or WebP, any size). Don't use photos with people or personal items.
2. Start the Worker with your keys (`npm run worker:dev`).
3. Run the real recognition pipeline once:

   ```powershell
   npm run precompute
   ```

   The script makes a 1024 px copy of each photo (`public/presets/<id>-1024.jpg`), sends it to `/vision` and writes the boxes, labels and photo size into `src/data/presets.json`.
4. Open the scan screen and check the boxes. Fix the list by hand in `presets.json` if the model missed something, then commit the `-1024.jpg` files and the JSON. The originals don't need to be committed.

Recipes are not precomputed: presets rank PlatoListo's own recipes offline, and Spoonacular content may not be stored (see `docs/DECISIONS.md`).

## Cocktail dataset

Bartender mode matches drinks offline against `src/data/cocktails.json`, built from TheCocktailDB's free API (key `1`, for development and educational use). To refresh it:

```powershell
npm run build:cocktails
```

The script asks for drinks by first letter (a–z, 0–9), keeps only the fields the app uses and writes the JSON. The free API returns at most 25 drinks per letter, so the file has a few hundred drinks. The app loads it only when bartender mode opens.

## App icons

`npm run build:icons` renders the PWA icons in `public/` from the logo with headless Chromium. The manifest (`public/manifest.webmanifest`) lets people add the app to their home screen.

## Worker reference

| Endpoint | What it does |
|---|---|
| `GET /health` | Shows whether each key is configured. |
| `POST /vision` | `{ image, mimeType, kind: "fridge" \| "bar" }` → `{ items: [{ name, label_es, quantity, confidence, box_2d }] }` |
| `POST /translate` | `{ texts: string[] }` → `{ translations: string[] }` (English → Spain Spanish) |
| `POST /chat` | Streams the AI chef's reply as server-sent events. |
| `GET /recipes/search` | Spoonacular `complexSearch`, passed through. |
| `GET /recipes/:id` | Spoonacular recipe information, passed through. |

Settings in `worker/wrangler.jsonc`:

- `GEMINI_MODEL`, `GEMINI_FALLBACK_MODEL`, `TRANSLATE_MODEL`, `CHAT_MODEL`: model IDs. Free-tier models change often, so check https://ai.google.dev/gemini-api/docs/models before a demo.
- `SPOONACULAR_CACHE_TTL`: keep `0`. Spoonacular allows caching only with its written permission, and for at most 3600 seconds.
- `RATE_LIMIT_PER_MINUTE`: requests per minute per IP for the in-memory fallback.
- Requests must come from an origin in `ALLOWED_ORIGINS`. Bodies are size-limited (photos about 1.8 MB, text about 60 KB).

## Before the talk

- Open the published link on a phone with mobile data, not only Wi-Fi.
- Tap through one preset, the deals, the list, Plus and bartender mode once, so the phone has everything cached.
- If live services misbehave, everything except your own photo, the AI chef and bottle scanning keeps working offline.
