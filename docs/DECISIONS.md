# Decisions

Technical and product decisions made while building the demo, with the options that were rejected.

## Recipe data: own recipe pool for presets and offline, Spoonacular live only

The brief asked to bundle precomputed Spoonacular results and details (with Spanish translations) for the presets, and to cache Spoonacular aggressively.

Spoonacular's terms (checked 2026-10-28, spoonacular.com/food-api/terms) only allow caching with their prior written permission, for at most one hour. Only the recipe id, title and image URL may be stored indefinitely. Ingredients, instructions and any derived or transformed data (translations) may not be stored. The free plan is 50 points per day, 1 request per second, 2 concurrent requests, and requires a backlink.

Decision (approved by the owner):

- Presets and the offline fallback use PlatoListo's own recipes (`src/data/recipes.ts`), written for the demo in English and Spanish.
- Spoonacular is used only live (own photo or an edited list), through the Worker, without storing recipe content. The cache TTL is a setting that defaults to 0 and can go up to 3600 seconds once written permission exists.
- On quota errors (HTTP 402), rate limits (429) or no network, the app ranks the own pool and says so.
- `scripts/precompute-presets` runs the real Gemini detection on the preset photos and ranks the own pool. It does not save Spoonacular content.

Rejected: bundling Spoonacular content (breaks the terms); replacing Spoonacular with another API (not the owner's call).

## Mockup elements left out

Approved by the owner on 2026-10-28:

- Shopping list "Route" button: removed. No demo city and no store addresses.
- Recipe "Save" heart: removed. Not in the brief, and there is no saved-recipes screen.
- Onboarding two-dot progress indicator: removed, because onboarding is a single screen.

## Stack choices

- **Routing:** React Router `createHashRouter`, so deep links work on GitHub Pages without server rewrites.
- **State:** Zustand with the `persist` middleware. Storage goes through a wrapper that catches every localStorage error and falls back to memory, so private windows work. Photos are never persisted.
- **i18n:** a small typed dictionary instead of i18next. `es.ts` is typed against `en.ts`, so a missing Spanish string fails the type check. Plurals use `Intl.PluralRules`, prices use `Intl.NumberFormat` (`en-IE`, `es-ES`).
- **Styling:** CSS Modules and CSS variables for the design tokens. Tailwind was not needed.
- **Fonts:** self-hosted with @fontsource. One variable family, Archivo, with its weight and width axes (see "Redesign" below).

## Matching rules

- One normalizer (`src/core/normalize.ts`) for detections, typed input, recipe ingredients and deals: lowercase, accents and quantities stripped, brands and filler words removed, singular head noun, then a catalog of English and Spanish synonyms.
- A generic ingredient matches its variants in both directions (tomato ↔ cherry tomato, cheese ↔ manchego). Siblings do not match (manchego ≠ mozzarella).
- Missing ingredient → cheapest matching deal; a sponsored deal wins a price tie. Sponsorship never changes dish ranking.
- "Have X of Y" ignores salt, pepper, oil and water.
- "Under €X" uses the estimated cost to buy per serving from deal prices only. Items with no deal are shown as "not on sale" and add nothing to the estimate.
- Ranking: `used − 0.35 × missing`, plus up to +1 for "Love to eat" tags. Ties go to the cheaper dish, then the quicker one.

## Live services (milestone 3)

- **Thin proxy.** The Workers free plan allows 10 ms of CPU per request (checked 2026-10-28). So the Worker checks the origin, rate limit and body size, then forwards the request. Spoonacular responses are streamed straight through, and the app maps them to its own recipe shape.
- **Gemini via `generateContent`**, with `responseJsonSchema` and `thinkingLevel: "low"`. If the API rejects either option (HTTP 400), the Worker retries once in plain JSON mode. On 429 or 5xx it moves on to the fallback model. All model IDs are Worker settings.
  - Rejected: the newer Interactions API. It stores interactions by default (`store=true`), which would keep users' photos on Google's side.
- **What goes live.** Your own photo and typed lists use live search. Presets and "cook from deals" always use the bundled recipes, so they need no network and spend no quota. An edited preset stays offline too.
- **Dish photos.** PlatoListo's own recipes show a Spoonacular photo of a similar dish. Only the image URL is stored, which the terms allow; offline the drawn plate shows instead.
- **Spoonacular content is never stored.** Search results, recipes and their Spanish translations are kept in memory for at most an hour, never in localStorage or the Worker. Each live recipe credits its original source and Spoonacular.
- **Fallbacks.** On quota (402), rate limits (429), offline, timeouts or zero results, the app ranks the bundled recipes and says why. Photo errors always offer "Use a preset photo".
- **Abuse protection.** Requests from any origin outside `ALLOWED_ORIGINS` get a 403 before any upstream call. There is a per-IP limit (rate limiting binding, with an in-memory fallback) and body size limits. The Spoonacular cost flags are fixed by the Worker, not the app.

## Plus (milestone 4)

- **Demo unlock only.** "Unlock Plus (demo)" flips a local flag. The paywall remembers where you came from (`?next=`), so unlocking from a recipe opens the AI chef straight away.
- **AI chef.**
  - A bottom-sheet chat that streams the reply through `/chat`.
  - The context is the recipe (title, servings, ingredients, steps), what you already have, your allergies and diet.
  - The Worker's system prompt keeps it to cooking, answers in the UI language and never suggests the user's allergens.
  - History lives only in the component and resets per recipe.
- **Bartender mode.**
  - Needs Plus and a one-time 18+ confirmation, which is saved. The drinks stay hidden until you confirm.
  - Matching runs offline on the bundled TheCocktailDB data with its own small catalog of bar synonyms and Spanish names.
  - Ice, water, garnishes and salt rims are optional. A generic bottle covers a specific one (rum → white rum), and fruit covers its juice.
  - "Almost" drinks are one or two ingredients away.
  - "Use an example bar" loads the mockup's bar, so the demo works without a camera or network.
- **Drink times** are estimated (TheCocktailDB has none): 2 minutes, plus 2 for more than three ingredients, plus 1 for muddling, 1 for shaking and 2 for blending.
- **Dataset size.** About 300 KB of JSON in its own chunk, loaded only by bartender mode. Rejected: calling TheCocktailDB live (its multi-ingredient filter is premium-only).

## Ship (milestone 5)

- **Weekly plan** (Plus, stretch goal done). It takes the seven best "cook from deals" dinners, with at most two built on the same main ingredient, and builds one shopping list where each missing item is bought once. If a strict diet leaves fewer than seven dinners, the screen says so.
- **Precompute.** `scripts/precompute-presets` runs the real `/vision` pipeline through the Worker on the preset photos and saves a 1024 px copy plus the detections. It needs the owner's photos and key, so the shipped presets stay illustrated until then.
- **Tests.** Playwright runs on the production build with all non-local requests aborted. axe and a 44 px touch-target check cover every screen, including Plus and the dark bartender theme. The audit caught three problems, all fixed: language buttons whose name didn't contain the visible "EN/ES", 42 px chip buttons, and 18 px source links.
- **Bundle.** Plus screens load on demand (React Router `lazy`), and so does the cocktail data. The main chunk is about 150 KB gzipped.
- **PWA.** A manifest and icons only. Rejected: a service worker. A demo that gets fixed right before the talk shouldn't risk phones showing a cached old version.
- **CI.** GitHub Actions type-checks, runs the unit tests, builds with the optional `WORKER_URL` variable and deploys to Pages. Playwright runs locally (`npm run test:e2e`), so a flaky browser test can't block a deploy.

## Models after live testing (2026-11-07)

With real keys, `gemini-3.8-flash` was overloaded: a 503 on stream, and a photo request hanging for 171 s. `gemini-3.5-flash-lite` detected the same 8 items with matching boxes in about 3 s. Changes:

- Every model call now has a 20-second timeout. A hung model counts as a 504, and the next model is tried.
- Default models: `gemini-3.5-flash-lite` for vision, chat and translation; `gemini-3.1-flash-lite` as the fallback.

## Real supermarket prices (2026-11-07)

The owner asked for real prices from Spain's main chains, pointing at api-anything. That tool learns a site's internal requests by loading the page in a headless browser. Its catalog has no Spanish supermarkets. I used it in local-only mode, in a scratch folder (nothing shared, no agent configs touched), to find each chain's data source. Then `scripts/fetch-deals.mjs` reads those sources with plain headless Chromium.

| Chain | Result |
|---|---|
| Mercadona | Public JSON API of the online shop. It has no promotions ("always low prices"), so a deal is a product whose price just went down: 156 products, 4 matching recipe ingredients. |
| ALDI | The weekly offers page: about 110–130 discounted products with price and discount, 12 matching. |
| Carrefour | Product grid behind a Cloudflare bot challenge (HTTP 403). Skipped. |
| Dia | Bot challenge. Skipped. |
| Lidl | Food offers are published only as leaflets. Skipped. |
| Eroski | Offers page is a leaflet without prices. Skipped. |
| Alcampo, Consum | No offers page reachable without a session. Skipped. |

Rules the script follows:

- **No workarounds.** A bot challenge means the chain is skipped. Mercadona's category pages are read with a 150 ms pause between requests. The script runs by hand before a demo, not on a schedule.
- **Strict matching.** Product names lead with the ingredient in Spanish, so only the first one to four words may exactly equal a catalog name or alias. Ready-made products ("patatas fritas sabor…", "bebida sabor limón", "crema de cacao") are filtered out. An earlier fuzzy version turned "Rocas de cacahuete y chocolate con leche" into milk.
- **Snapshot plus demo.** Real deals come first. For ingredients no store had on offer, the brief's example deals stay in, marked `demo` and tagged "Example price" in the app, so the recipes still have something to buy. The Deals screen shows the snapshot date.
- **Sponsorship stays a demo.** No real chain pays PlatoListo, so only demo deals can be sponsored.
- **Tests don't depend on this week's prices.** Unit tests use `src/data/deals-demo.json` (the brief's fixed set). The app uses `src/data/deals.json`, with `src/data/deals-meta.json` recording what each chain returned.

The stores' terms generally forbid automated collection. This is a one-off, low-volume snapshot for a university demo, and the owner accepted that trade-off. Don't run it as a service.

## Redesign (2026-11-15)

The owner asked for a more serious and simpler design that does not look like a generated template, and for the app to be easier to use. This replaces the visual part of the brief (the cream and terracotta tokens, Fraunces and DM Sans, the mockups' layout) and all the interface copy. The features and the business model are unchanged.

### Look

Three colours, each with one job. Everything else is white, grey lines and the food photos.

| Token | Value | Job |
|---|---|---|
| `--ink` | `#17191A` | Acts: text, buttons, the selected state |
| `--tag` | `#FFD60A` | Money: the price label of anything with a deal, the Plus tag, the count of things left to buy |
| `--ok` | `#0B6B45` | What you already have, and what you save |
| `--bg` / `--fill` | `#FFFFFF` / `#F2F4F2` | Page, and quiet fills for icons and messages |
| `--muted` | `#5A6360` | Secondary text |
| `--line` / `--line-strong` | `#E1E4E1` / `#8A938E` | Hairlines between rows; borders of controls |

- **One typeface:** Archivo (variable, self-hosted). Its narrow, heavy cut is used only for prices on a yellow label, like a shelf label in a shop. That label is the one loud element.
- **Lists, not cards.** Rows divided by hairlines. A box is used only for a separate object: the photo, the saved ingredients, an input, a dialog.
- **Plain chrome.** Sentence case everywhere, no capital-letter labels, no decorative shapes, no dots between facts. Text is at least 13 px (12 px only on the photo's box labels and the tab badge).
- **Bartender mode** keeps the dark theme the brief asks for: the same tokens, inverted.
- **Logo:** a plate with a tick ("plato listo") on the label yellow, used for the favicon and the home-screen icons too.

### Copy

- Plain words, and a button says what it does ("Add 2 to list", "See dishes").
- One word per thing: "deal" everywhere (not "offer", "on sale" and "discount" mixed).
- Errors say what happened and what to do next. They don't apologise.
- The "Demo" tag on sample deals became "Example price", which says what is not real.
- Kept exactly as the brief has them: "Sponsored", "Unlock Plus (demo)", the "AI chef" name, the camera note on the ingredients screen and the 18+ line.
- The Plus price is still not invented. The paywall says "The monthly price is not decided yet." until `plusPriceEur` is set.

### Use

- **Home:** one question and three ways in. With ingredients saved, they sit on top with a "See dishes" button. Below are the three biggest discounts you can cook with.
- **Ingredients:** the add field is always visible. When typing, ten common ingredients are one-tap toggles (they don't move as you pick them). "Take a photo" is a full-width button, and the three presets are labelled as example fridges.
- **Dishes:** one segment per ingredient shows how much you have. The cost is "N to buy" plus the price label.
- **Recipe:** every step is in one numbered list (it was one step at a time). The total and the saving are under the list of things to buy.
- **Deals:** a list instead of a grid. A deal opens the dishes that use the product, and the recipe then keeps that deal for its ingredient even when another store is cheaper (`pinDeal`), so what you tapped is what you see.
- **Messages** appear at the top, clear of the action bars at the bottom.
- English sizes use a decimal point ("0.33 l"); Spanish keeps the stores' own wording.

### Changed against the brief

- Design tokens and fonts (above).
- Home: no greeting; "Hot deals near you" strip became three rows titled "This week's deals" (still no city name).
- Deals: list instead of a 2-column grid.
- Recipe: full step list instead of a pager.
- The "Step 1 of 2" counters and the preset thumbnails are gone.

### Rejected

- **Tuning the cream and terracotta look.** It is the look the owner asked to remove.
- **A green main colour.** It reads as one of the chains (Mercadona), and the app compares chains. Green would also mean both "press this" and "you have this".
- **System fonts.** The app would look different on every phone in the room.
- **An offline banner.** Phones on weak Wi-Fi flip between online and offline; the messages already say so at the moment something needs the network.

### Tests

Playwright now walks three flows with the network blocked (example fridge, a deal to its dishes, a typed list) and audits every screen. axe's own 24 px target rule is off, because it misfires on a control that sits half under the sticky tab bar; the 44 px check is stricter.

### Live check after publishing (2026-11-15)

With the owner's go-ahead, the live services were tried once each on the published site, with drawn test images and no real photos.

| Check | Result |
|---|---|
| Fridge photo | 8 items with boxes in the right places. It took 15 to 30 seconds. |
| Online recipes | 11 Spoonacular dishes in about 2 seconds; the recipe page shows deals, totals and both credits. |
| AI chef | Answer in about 6 seconds, using the recipe and what is missing. |
| Spanish | Titles translated in one request. The full recipe failed once, then worked when opened again. |
| Bottle photo | 4 labelled bottles found, 2 drinks offered. It took 10 to 20 seconds. |

What changed because of it:

- **Translation is retried once** after a failure that usually passes (a busy model, an answer in the wrong shape). Before, one failed request left the recipe in English until it was opened again. Timeouts, quota and offline errors are not retried.
- **The waiting text says how long it can take** ("This can take up to half a minute."). Recognition is slow when the first model times out after 20 seconds and the fallback answers.
- **A count of one is not shown.** The model returns "1" for single items, which gave "Cheese ×1" on every chip and box.

Rejected: retrying photo recognition automatically. A second try would double a wait that is already long, and taking another photo is one tap.

## Git identity

Commits use the GitHub no-reply address of the owner's account, so a personal email is not published in a public repository.
