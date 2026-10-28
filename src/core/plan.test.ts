import { describe, expect, it } from 'vitest';
import { RECIPES } from '../data/recipes';
import { DEALS } from './deals';
import { buildWeeklyPlan } from './plan';
import type { Prefs } from './types';

const PREFS: Prefs = { allergies: [], diet: 'anything', loves: [], budget: 3 };

describe('buildWeeklyPlan', () => {
  it('picks seven different dinners with at most two per main ingredient', () => {
    const plan = buildWeeklyPlan({ recipes: RECIPES, inventory: [], prefs: PREFS, deals: DEALS });
    const ids = plan.dinners.map((dish) => dish.recipe.id);
    expect(ids).toHaveLength(7);
    expect(new Set(ids).size).toBe(7);
    const mains = plan.dinners.map((dish) => dish.recipe.ingredients[0].key);
    for (const main of new Set(mains)) expect(mains.filter((m) => m === main).length).toBeLessThanOrEqual(2);
  });

  it('buys each missing ingredient once for the whole week', () => {
    const plan = buildWeeklyPlan({ recipes: RECIPES, inventory: [], prefs: PREFS, deals: DEALS });
    const keys = plan.shopping.items.map((item) => item.key);
    expect(new Set(keys).size).toBe(keys.length);
    const sum = plan.shopping.items.reduce((total, item) => total + (item.deal?.priceCents ?? 0), 0);
    expect(plan.shopping.totalCents).toBe(sum);
    expect(plan.perDinnerCents).toBe(Math.round(sum / 7));
  });

  it('uses what you already have and respects the diet', () => {
    const vegan = buildWeeklyPlan({ recipes: RECIPES, inventory: ['onion', 'garlic'], prefs: { ...PREFS, diet: 'vegan' }, deals: DEALS });
    expect(vegan.dinners.length).toBeGreaterThan(0);
    expect(vegan.dinners.length).toBeLessThanOrEqual(7);
    expect(vegan.shopping.items.map((item) => item.key)).not.toContain('onion');
    expect(vegan.dinners.map((d) => d.recipe.id)).not.toContain('spanish-tortilla');
  });
});
