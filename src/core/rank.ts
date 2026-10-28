import { config } from '../config';
import { analyzeRecipe, costPerServing, isAllowed, priceMissing, type DishAnalysis, type Pricing } from './match';
import type { Deal, Prefs, Recipe } from './types';

export type DishMode = 'inventory' | 'deals';
export type DishFilter = 'best' | 'budget' | 'quick' | 'nothing';

export interface RankedDish {
  recipe: Recipe;
  analysis: DishAnalysis;
  pricing: Pricing;
  /** Estimated cost to buy per serving, in cents. */
  costPerServingCents: number;
  score: number;
}

interface RankInput {
  recipes: Recipe[];
  inventory: string[];
  prefs: Prefs;
  deals: Deal[];
  mode: DishMode;
}

const MISSING_WEIGHT = 0.35;
const LOVE_BOOST = 0.5;
const MAX_LOVE_BOOST = 1;

function loveBoost(recipe: Recipe, prefs: Prefs): number {
  const hits = recipe.tags.filter((tag) => prefs.loves.includes(tag)).length;
  return Math.min(MAX_LOVE_BOOST, hits * LOVE_BOOST);
}

export function evaluateDish(recipe: Recipe, inventory: string[], deals: Deal[]): Omit<RankedDish, 'score'> {
  const analysis = analyzeRecipe(recipe, inventory);
  const pricing = priceMissing(analysis.missing, deals);
  return { recipe, analysis, pricing, costPerServingCents: costPerServing(pricing, recipe.servings) };
}

function inventoryScore(dish: Omit<RankedDish, 'score'>): number {
  return dish.analysis.used.length - MISSING_WEIGHT * dish.analysis.missing.length;
}

// "Cook from deals": dishes whose shopping is covered by deals (or the fridge) and stays cheap per serving come first.
function dealsScore(dish: Omit<RankedDish, 'score'>): number {
  const { used, missing } = dish.analysis;
  const { onSale, notOnSale, savingsCents } = dish.pricing;
  const total = Math.max(1, used.length + missing.length);
  const coverage = (used.length + onSale) / total;
  const eurosPerServing = dish.costPerServingCents / 100;
  return 2 * coverage + 0.25 * onSale - 0.5 * notOnSale - 0.4 * eurosPerServing + savingsCents / 1000;
}

/**
 * Rank recipes for the dishes screen.
 * - Hard filters: allergies and diet.
 * - "Love to eat" is a soft boost only.
 * - Ties go to the cheaper dish, then the quicker one.
 */
export function rankDishes({ recipes, inventory, prefs, deals, mode }: RankInput): RankedDish[] {
  const ranked: RankedDish[] = [];
  for (const recipe of recipes) {
    if (!isAllowed(recipe, prefs)) continue;
    const dish = evaluateDish(recipe, inventory, deals);
    if (mode === 'inventory' && dish.analysis.used.length === 0) continue;
    if (mode === 'deals' && dish.pricing.onSale === 0) continue;
    const base = mode === 'inventory' ? inventoryScore(dish) : dealsScore(dish);
    ranked.push({ ...dish, score: base + loveBoost(recipe, prefs) });
  }
  return ranked.sort(
    (a, b) =>
      b.score - a.score ||
      a.costPerServingCents - b.costPerServingCents ||
      a.recipe.minutes - b.recipe.minutes ||
      a.recipe.title.en.localeCompare(b.recipe.title.en),
  );
}

export function applyFilter(dishes: RankedDish[], filter: DishFilter, prefs: Prefs): RankedDish[] {
  switch (filter) {
    case 'budget':
      return dishes.filter((dish) => dish.costPerServingCents <= Math.round(prefs.budget * 100));
    case 'quick':
      return dishes.filter((dish) => dish.recipe.minutes <= config.quickMinutes);
    case 'nothing':
      return dishes.filter((dish) => dish.analysis.missing.length === 0);
    case 'best':
      return dishes;
  }
}
