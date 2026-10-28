import { isPantry } from './catalog';
import { normalizeIngredient } from './normalize';
import type { Allergy, Diet, Love, Prefs, Recipe, RecipeIngredient } from './types';

// Shapes of the Spoonacular fields the app reads (complexSearch with fillIngredients,
// addRecipeInformation and addRecipeInstructions, or recipes/{id}/information).
export interface SpoonIngredient {
  name?: string;
  nameClean?: string | null;
  original?: string;
}

export interface SpoonRecipe {
  id: number;
  title: string;
  image?: string;
  readyInMinutes?: number;
  servings?: number;
  sourceName?: string;
  sourceUrl?: string;
  spoonacularSourceUrl?: string;
  cuisines?: string[];
  dishTypes?: string[];
  extendedIngredients?: SpoonIngredient[];
  usedIngredients?: SpoonIngredient[];
  missedIngredients?: SpoonIngredient[];
  analyzedInstructions?: { steps?: { step?: string }[] }[];
  instructions?: string | null;
}

export const SPOONACULAR_URL = 'https://spoonacular.com/food-api';
export const LIVE_PREFIX = 'sp-';

const INTOLERANCES: Record<Allergy, string[]> = {
  lactose: ['dairy'],
  nuts: ['tree nut', 'peanut'],
  eggs: ['egg'],
  gluten: ['gluten'],
  shellfish: ['shellfish'],
  soy: ['soy'],
  fish: ['seafood'],
};

const DIETS: Partial<Record<Diet, string>> = {
  vegetarian: 'vegetarian',
  vegan: 'vegan',
  pescatarian: 'pescetarian',
};

// Spoonacular has no halal diet: exclude pork and alcohol instead.
const HALAL_EXCLUDE = ['pork', 'bacon', 'ham', 'chorizo', 'lard', 'pancetta', 'prosciutto', 'wine', 'beer', 'rum', 'brandy', 'sherry'];

const MAX_INGREDIENTS = 20;

/** complexSearch parameters for the user's fridge and preferences. The Worker adds the fixed flags. */
export function buildSearchParams(inventory: string[], prefs: Prefs, number = 12): URLSearchParams {
  const ingredients = [...new Set(inventory.filter((key) => key && !isPantry(key)))].slice(0, MAX_INGREDIENTS);
  const params = new URLSearchParams({
    includeIngredients: ingredients.join(','),
    number: String(number),
    sort: 'max-used-ingredients',
  });
  const intolerances = [...new Set(prefs.allergies.flatMap((allergy) => INTOLERANCES[allergy]))];
  if (intolerances.length) params.set('intolerances', intolerances.join(','));
  const diet = DIETS[prefs.diet];
  if (diet) params.set('diet', diet);
  if (prefs.diet === 'halal') params.set('excludeIngredients', HALAL_EXCLUDE.join(','));
  return params;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

const ASIAN = ['asian', 'chinese', 'japanese', 'thai', 'korean', 'vietnamese', 'indian'];

function guessTags(recipe: SpoonRecipe, keys: string[]): Love[] {
  const cuisines = (recipe.cuisines ?? []).map((c) => c.toLowerCase());
  const title = recipe.title.toLowerCase();
  const tags: Love[] = [];
  if (keys.includes('pasta') || /pasta|spaghetti|penne|macaroni|lasagn/.test(title)) tags.push('pasta');
  if (keys.some((key) => key.startsWith('chicken'))) tags.push('chicken');
  if (/spicy|chili|chilli|hot |curry|sriracha|jalape/.test(title)) tags.push('spicy');
  if (cuisines.includes('spanish') || /paella|tortilla|gazpacho|tapas/.test(title)) tags.push('spanish');
  if (cuisines.some((cuisine) => ASIAN.includes(cuisine))) tags.push('asian');
  return tags;
}

/** A Spoonacular recipe in the app's shape. Kept in memory only: Spoonacular content is never stored. */
export function toRecipe(recipe: SpoonRecipe): Recipe {
  const source = recipe.extendedIngredients?.length
    ? recipe.extendedIngredients
    : [...(recipe.usedIngredients ?? []), ...(recipe.missedIngredients ?? [])];
  const ingredients: RecipeIngredient[] = [];
  const seen = new Set<string>();
  for (const ingredient of source) {
    const name = (ingredient.nameClean || ingredient.name || '').trim();
    const key = normalizeIngredient(name);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    ingredients.push({ key, name: { en: capitalize(name), es: capitalize(name) } });
  }

  let steps = (recipe.analyzedInstructions ?? [])
    .flatMap((block) => block.steps ?? [])
    .map((step) => (step.step ?? '').trim())
    .filter(Boolean);
  if (!steps.length && recipe.instructions) {
    steps = stripHtml(recipe.instructions)
      .split(/(?<=[.!?])\s+/)
      .filter(Boolean);
  }

  return {
    id: `${LIVE_PREFIX}${recipe.id}`,
    title: { en: recipe.title, es: recipe.title },
    minutes: recipe.readyInMinutes && recipe.readyInMinutes > 0 ? recipe.readyInMinutes : 30,
    servings: recipe.servings && recipe.servings > 0 ? recipe.servings : 2,
    ingredients,
    steps: { en: steps, es: [] },
    tags: guessTags(recipe, ingredients.map((i) => i.key)),
    image: recipe.image || undefined,
    source: {
      name: recipe.sourceName || 'Spoonacular',
      url: recipe.sourceUrl || recipe.spoonacularSourceUrl || SPOONACULAR_URL,
    },
  };
}

export function liveId(id: string): number | null {
  if (!id.startsWith(LIVE_PREFIX)) return null;
  const value = Number(id.slice(LIVE_PREFIX.length));
  return Number.isInteger(value) && value > 0 ? value : null;
}
