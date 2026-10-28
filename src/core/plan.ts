import { isPantry } from './catalog';
import { priceMissing, type Pricing } from './match';
import { rankDishes, type RankedDish } from './rank';
import type { Deal, Prefs, Recipe } from './types';

export interface WeeklyPlan {
  dinners: RankedDish[];
  /** Everything missing across the week, bought once, priced from the deals. */
  shopping: Pricing;
  perDinnerCents: number;
}

interface PlanInput {
  recipes: Recipe[];
  inventory: string[];
  prefs: Prefs;
  deals: Deal[];
  days?: number;
}

const MAX_SAME_MAIN = 2;

function mainIngredient(recipe: Recipe): string {
  return recipe.ingredients.find(({ key }) => !isPantry(key))?.key ?? recipe.id;
}

/**
 * Seven cheap dinners from this week's deals: the best "cook from deals" dishes,
 * with no more than two built on the same main ingredient.
 */
export function buildWeeklyPlan({ recipes, inventory, prefs, deals, days = 7 }: PlanInput): WeeklyPlan {
  const ranked = rankDishes({ recipes, inventory, prefs, deals, mode: 'deals' });
  const dinners: RankedDish[] = [];
  const mains = new Map<string, number>();
  for (const dish of ranked) {
    if (dinners.length >= days) break;
    const main = mainIngredient(dish.recipe);
    if ((mains.get(main) ?? 0) >= MAX_SAME_MAIN) continue;
    dinners.push(dish);
    mains.set(main, (mains.get(main) ?? 0) + 1);
  }
  // Few recipes fit (a strict diet, say): relax the variety rule rather than leave days empty.
  for (const dish of ranked) {
    if (dinners.length >= days) break;
    if (!dinners.includes(dish)) dinners.push(dish);
  }

  const missing = [...new Set(dinners.flatMap((dish) => dish.analysis.missing))];
  const shopping = priceMissing(missing, deals);
  return {
    dinners,
    shopping,
    perDinnerCents: dinners.length ? Math.round(shopping.totalCents / dinners.length) : 0,
  };
}
