import { catalogEntry } from '../core/catalog';
import { buildSearchParams, liveId, toRecipe } from '../core/spoonacular';
import type { Prefs, Recipe } from '../core/types';
import { ApiError, fetchRecipe, searchRecipes, translateTexts } from './api';

// Live recipes and their translations live in memory for at most an hour and are never written
// to storage: Spoonacular's terms don't allow keeping recipe content.
const LIFETIME_MS = 60 * 60 * 1000;

interface Entry<T> {
  value: T;
  at: number;
}

const recipes = new Map<string, Entry<Recipe>>();
const searches = new Map<string, Entry<string[]>>();
const translated = new Map<string, Entry<Recipe>>();

function fresh<T>(entry: Entry<T> | undefined): T | undefined {
  return entry && Date.now() - entry.at < LIFETIME_MS ? entry.value : undefined;
}

function remember(recipe: Recipe) {
  recipes.set(recipe.id, { value: recipe, at: Date.now() });
}

export function cachedLiveRecipe(id: string): Recipe | undefined {
  return fresh(translated.get(id)) ?? fresh(recipes.get(id));
}

function searchKey(inventory: string[], prefs: Prefs): string {
  return JSON.stringify([[...inventory].sort(), [...prefs.allergies].sort(), prefs.diet]);
}

export async function loadLiveDishes(inventory: string[], prefs: Prefs): Promise<Recipe[]> {
  const key = searchKey(inventory, prefs);
  const ids = fresh(searches.get(key));
  if (ids) {
    const hits = ids.map(cachedLiveRecipe).filter((recipe): recipe is Recipe => Boolean(recipe));
    if (hits.length === ids.length) return hits;
  }
  const results = (await searchRecipes(buildSearchParams(inventory, prefs)))
    .map(toRecipe)
    .filter((recipe) => recipe.steps.en.length > 0);
  results.forEach(remember);
  searches.set(key, { value: results.map((recipe) => recipe.id), at: Date.now() });
  return results;
}

export async function loadLiveRecipe(id: string): Promise<Recipe> {
  const cached = cachedLiveRecipe(id);
  if (cached) return cached;
  const numeric = liveId(id);
  if (numeric === null) throw new ApiError('bad_response');
  const recipe = toRecipe(await fetchRecipe(numeric));
  remember(recipe);
  return recipe;
}

/** Spanish titles for a list of live recipes, in one request. */
export async function translateTitles(list: Recipe[]): Promise<Recipe[]> {
  const missing = list.filter((recipe) => !translated.has(recipe.id) && recipe.title.es === recipe.title.en);
  if (missing.length === 0) return list.map((recipe) => cachedLiveRecipe(recipe.id) ?? recipe);
  const titles = await translateTexts(missing.map((recipe) => recipe.title.en));
  missing.forEach((recipe, index) => {
    const updated = { ...recipe, title: { ...recipe.title, es: titles[index] } };
    remember(updated);
  });
  return list.map((recipe) => cachedLiveRecipe(recipe.id) ?? recipe);
}

/** Spanish title, ingredient names (where the catalog has none) and steps for one live recipe. */
export async function translateRecipe(recipe: Recipe): Promise<Recipe> {
  const done = fresh(translated.get(recipe.id));
  if (done) return done;
  const names = recipe.ingredients.filter((ingredient) => !catalogEntry(ingredient.key) && ingredient.name);
  const texts = [recipe.title.en, ...names.map((ingredient) => ingredient.name!.en), ...recipe.steps.en];
  const output = await translateTexts(texts);
  const title = output[0];
  const nameMap = new Map(names.map((ingredient, index) => [ingredient.key, output[1 + index]]));
  const steps = output.slice(1 + names.length);
  const result: Recipe = {
    ...recipe,
    title: { en: recipe.title.en, es: title },
    ingredients: recipe.ingredients.map((ingredient) =>
      nameMap.has(ingredient.key) && ingredient.name
        ? { ...ingredient, name: { en: ingredient.name.en, es: nameMap.get(ingredient.key)! } }
        : ingredient,
    ),
    steps: { en: recipe.steps.en, es: steps },
  };
  translated.set(recipe.id, { value: result, at: Date.now() });
  return result;
}
