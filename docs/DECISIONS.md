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

## Git identity

Commits use the GitHub no-reply address of the owner's account, so a personal email is not published in a public repository.
