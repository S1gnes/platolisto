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
- **Fonts:** self-hosted with @fontsource (latin subsets of Fraunces 500/600 and DM Sans 400–700).

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
  - "Try a sample bar" loads the mockup's bar, so the demo works without a camera or network.
- **Drink times** are estimated (TheCocktailDB has none): 2 minutes, plus 2 for more than three ingredients, plus 1 for muddling, 1 for shaking and 2 for blending.
- **Dataset size.** About 300 KB of JSON in its own chunk, loaded only by bartender mode. Rejected: calling TheCocktailDB live (its multi-ingredient filter is premium-only).

## Git identity

Commits use the GitHub no-reply address of the owner's account, so a personal email is not published in a public repository.
