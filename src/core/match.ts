import { isPantry, parentOf, tagsOf, type IngredientTag } from './catalog';
import type { Allergy, Chain, Deal, Diet, Prefs, Recipe } from './types';

/** Same ingredient, or one is the more generic form of the other (cherry tomato ↔ tomato). */
export function related(a: string, b: string): boolean {
  return a === b || parentOf(a) === b || parentOf(b) === a;
}

export interface DishAnalysis {
  used: string[];
  missing: string[];
  /** Salt, pepper, oil and water: assumed at home and not counted. */
  pantry: string[];
}

export function analyzeRecipe(recipe: Recipe, inventory: string[]): DishAnalysis {
  const used: string[] = [];
  const missing: string[] = [];
  const pantry: string[] = [];
  const seen = new Set<string>();
  for (const { key } of recipe.ingredients) {
    if (seen.has(key)) continue;
    seen.add(key);
    if (isPantry(key)) pantry.push(key);
    else if (inventory.some((have) => related(have, key))) used.push(key);
    else missing.push(key);
  }
  return { used, missing, pantry };
}

/** Cheapest deal for an ingredient. A sponsored deal wins a price tie. */
export function bestDeal(key: string, deals: Deal[]): Deal | null {
  let best: Deal | null = null;
  for (const deal of deals) {
    if (!related(deal.key, key)) continue;
    if (
      !best ||
      deal.priceCents < best.priceCents ||
      (deal.priceCents === best.priceCents && deal.sponsored && !best.sponsored)
    ) {
      best = deal;
    }
  }
  return best;
}

export interface PricedItem {
  key: string;
  deal: Deal | null;
}

export interface Pricing {
  items: PricedItem[];
  totalCents: number;
  savingsCents: number;
  onSale: number;
  notOnSale: number;
  sponsoredChains: Chain[];
}

export function priceMissing(missing: string[], deals: Deal[]): Pricing {
  const items = missing.map((key) => ({ key, deal: bestDeal(key, deals) }));
  let totalCents = 0;
  let savingsCents = 0;
  const sponsoredChains: Chain[] = [];
  for (const { deal } of items) {
    if (!deal) continue;
    totalCents += deal.priceCents;
    savingsCents += deal.oldPriceCents - deal.priceCents;
    if (deal.sponsored && !sponsoredChains.includes(deal.chain)) sponsoredChains.push(deal.chain);
  }
  const onSale = items.filter((item) => item.deal).length;
  return { items, totalCents, savingsCents, onSale, notOnSale: items.length - onSale, sponsoredChains };
}

/** Estimated cost to buy per serving, from deal prices only. */
export function costPerServing(pricing: Pricing, servings: number): number {
  return Math.round(pricing.totalCents / Math.max(1, servings));
}

const ALLERGY_TAGS: Record<Allergy, IngredientTag> = {
  gluten: 'gluten',
  lactose: 'lactose',
  nuts: 'nuts',
  eggs: 'eggs',
  shellfish: 'shellfish',
  soy: 'soy',
  fish: 'fish',
};

// Halal has no Spoonacular diet: like the live search, exclude pork and alcohol.
const DIET_EXCLUDES: Record<Diet, IngredientTag[]> = {
  anything: [],
  vegetarian: ['meat', 'fish', 'shellfish'],
  vegan: ['meat', 'fish', 'shellfish', 'eggs', 'lactose', 'animal'],
  pescatarian: ['meat'],
  halal: ['pork', 'alcohol'],
};

function recipeTags(recipe: Recipe): Set<IngredientTag> {
  return new Set(recipe.ingredients.flatMap(({ key }) => tagsOf(key)));
}

export function fitsDiet(recipe: Recipe, diet: Diet): boolean {
  const tags = recipeTags(recipe);
  return DIET_EXCLUDES[diet].every((tag) => !tags.has(tag));
}

export function isFreeOf(recipe: Recipe, allergy: Allergy): boolean {
  return !recipeTags(recipe).has(ALLERGY_TAGS[allergy]);
}

export function isAllowed(recipe: Recipe, prefs: Prefs): boolean {
  const tags = recipeTags(recipe);
  if (prefs.allergies.some((allergy) => tags.has(ALLERGY_TAGS[allergy]))) return false;
  return DIET_EXCLUDES[prefs.diet].every((tag) => !tags.has(tag));
}

/** Diets a recipe qualifies for, most specific first, for the recipe chips. */
export function recipeDiets(recipe: Recipe): Exclude<Diet, 'anything'>[] {
  const diets: Exclude<Diet, 'anything'>[] = [];
  if (fitsDiet(recipe, 'vegan')) diets.push('vegan');
  else if (fitsDiet(recipe, 'vegetarian')) diets.push('vegetarian');
  else if (fitsDiet(recipe, 'pescatarian')) diets.push('pescatarian');
  return diets;
}
