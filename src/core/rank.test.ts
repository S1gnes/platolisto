import { describe, expect, it } from 'vitest';
import { RECIPES } from '../data/recipes';
import { DEALS } from './deals';
import { summarizeList } from './list';
import { detectionsToItems, presetById } from './presets';
import { applyFilter, rankDishes } from './rank';
import type { Prefs } from './types';

const PREFS: Prefs = { allergies: [], diet: 'anything', loves: [], budget: 3 };
const STUDENT = detectionsToItems(presetById('student').detections).map((item) => item.key);
const ids = (list: { recipe: { id: string } }[]) => list.map((dish) => dish.recipe.id);

describe('rankDishes from the fridge', () => {
  const ranked = rankDishes({ recipes: RECIPES, inventory: STUDENT, prefs: PREFS, deals: DEALS, mode: 'inventory' });

  it('puts the mockup dishes first for the student fridge', () => {
    expect(ids(ranked).slice(0, 3)).toEqual(['egg-fried-rice', 'lemon-chicken-rice', 'shakshuka-manchego']);
  });

  it('only shows dishes that use at least one item you have', () => {
    expect(ranked.every((dish) => dish.analysis.used.length > 0)).toBe(true);
  });

  it('respects hard filters from preferences', () => {
    const vegan = rankDishes({ recipes: RECIPES, inventory: STUDENT, prefs: { ...PREFS, diet: 'vegan' }, deals: DEALS, mode: 'inventory' });
    expect(ids(vegan)).not.toContain('egg-fried-rice');
    expect(vegan.length).toBeGreaterThan(0);
  });

  it('boosts "love to eat" without filtering anything out', () => {
    const loving = rankDishes({ recipes: RECIPES, inventory: STUDENT, prefs: { ...PREFS, loves: ['spanish'] }, deals: DEALS, mode: 'inventory' });
    expect(loving.length).toBe(ranked.length);
    expect(ids(loving).indexOf('spanish-tortilla')).toBeLessThan(ids(ranked).indexOf('spanish-tortilla'));
  });

  it('does not let sponsorship change the order', () => {
    const unsponsored = DEALS.map((d) => ({ ...d, sponsored: false }));
    const plain = rankDishes({ recipes: RECIPES, inventory: STUDENT, prefs: PREFS, deals: unsponsored, mode: 'inventory' });
    expect(ids(plain)).toEqual(ids(ranked));
  });

  it('returns nothing for an empty fridge', () => {
    expect(rankDishes({ recipes: RECIPES, inventory: [], prefs: PREFS, deals: DEALS, mode: 'inventory' })).toEqual([]);
  });
});

describe('applyFilter', () => {
  const ranked = rankDishes({ recipes: RECIPES, inventory: STUDENT, prefs: PREFS, deals: DEALS, mode: 'inventory' });

  it('"Nothing to buy" keeps only complete dishes', () => {
    const result = applyFilter(ranked, 'nothing', PREFS);
    expect(ids(result)).toContain('egg-fried-rice');
    expect(result.every((dish) => dish.analysis.missing.length === 0)).toBe(true);
  });

  it('"≤ 20 min" keeps quick dishes', () => {
    expect(applyFilter(ranked, 'quick', PREFS).every((dish) => dish.recipe.minutes <= 20)).toBe(true);
  });

  it('"Under €X" uses the estimated cost per serving and the budget', () => {
    const cheap = applyFilter(ranked, 'budget', { ...PREFS, budget: 1 });
    expect(cheap.every((dish) => dish.costPerServingCents <= 100)).toBe(true);
    expect(ids(applyFilter(ranked, 'budget', { ...PREFS, budget: 3 }))).toContain('lemon-chicken-rice');
    expect(ids(cheap)).not.toContain('lemon-chicken-rice');
  });

  it('"Best match" keeps the full ranking', () => {
    expect(applyFilter(ranked, 'best', PREFS)).toBe(ranked);
  });
});

describe('rankDishes from the deals', () => {
  const ranked = rankDishes({ recipes: RECIPES, inventory: [], prefs: PREFS, deals: DEALS, mode: 'deals' });

  it('works with an empty fridge and only shows dishes with something on sale', () => {
    expect(ranked.length).toBeGreaterThan(5);
    expect(ranked.every((dish) => dish.pricing.onSale > 0)).toBe(true);
  });

  it('prefers dishes whose shopping is fully on sale', () => {
    const top = ranked[0];
    expect(top.pricing.notOnSale).toBe(0);
  });
});

describe('summarizeList', () => {
  it('matches the mockup list: 2 dishes, 3 items, 3 stores, €6.29, save €2.00', () => {
    const summary = summarizeList([
      { id: 'a', key: 'chicken thigh', dealId: 'mer-chicken-thighs', recipes: [{ id: 'lemon-chicken-rice', title: { en: '', es: '' } }], checked: false },
      { id: 'b', key: 'parsley', dealId: 'lid-parsley', recipes: [{ id: 'lemon-chicken-rice', title: { en: '', es: '' } }], checked: true },
      { id: 'c', key: 'potato', dealId: 'car-potatoes', recipes: [{ id: 'spanish-tortilla', title: { en: '', es: '' } }], checked: false },
    ]);
    expect(summary.totalCents).toBe(629);
    expect(summary.savingsCents).toBe(200);
    expect(summary.dishCount).toBe(2);
    expect(summary.itemCount).toBe(3);
    expect(summary.storeCount).toBe(3);
    expect(summary.groups.map((g) => [g.chain, g.subtotalCents])).toEqual([
      ['Mercadona', 390],
      ['Lidl', 79],
      ['Carrefour', 160],
    ]);
  });

  it('groups items without a deal under "not on sale"', () => {
    const summary = summarizeList([
      { id: 'a', key: 'soy sauce', dealId: null, recipes: [{ id: 'veggie-fried-rice', title: { en: '', es: '' } }], checked: false },
    ]);
    expect(summary.groups).toHaveLength(1);
    expect(summary.groups[0].chain).toBeNull();
    expect(summary.storeCount).toBe(0);
    expect(summary.totalCents).toBe(0);
  });
});
