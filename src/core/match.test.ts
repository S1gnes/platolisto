import { describe, expect, it } from 'vitest';
import { recipeById } from '../data/recipes';
import { sizeText, toDeal } from './deals';
import { DEMO_DEALS as DEALS } from './demoDeals';
import { analyzeRecipe, bestDeal, costPerServing, isAllowed, pinDeal, priceMissing, related } from './match';
import { detectionsToItems, presetById } from './presets';
import type { DealRecord, Prefs, Recipe } from './types';

const STUDENT = detectionsToItems(presetById('student').detections).map((item) => item.key);
const NO_PREFS: Prefs = { allergies: [], diet: 'anything', loves: [], budget: 3 };

function recipe(id: string): Recipe {
  const found = recipeById(id);
  if (!found) throw new Error(`missing recipe ${id}`);
  return found;
}

function deal(overrides: Partial<DealRecord>): ReturnType<typeof toDeal> {
  return toDeal({
    id: 'test',
    chain: 'Lidl',
    name_en: 'Test',
    name_es: 'Test',
    ingredientKey: 'onion',
    size: '',
    price: 1,
    oldPrice: 1.5,
    sponsored: false,
    validUntil: '2026-12-31',
    ...overrides,
  });
}

describe('related', () => {
  it('matches a generic ingredient with its variants, both ways', () => {
    expect(related('tomato', 'cherry tomato')).toBe(true);
    expect(related('cherry tomato', 'tomato')).toBe(true);
    expect(related('cooked rice', 'rice')).toBe(true);
  });

  it('does not match siblings', () => {
    expect(related('manchego', 'mozzarella')).toBe(false);
    expect(related('chicken thigh', 'chicken breast')).toBe(false);
  });
});

describe('analyzeRecipe', () => {
  it('splits used and missing, and assumes pantry staples', () => {
    const result = analyzeRecipe(recipe('lemon-chicken-rice'), STUDENT);
    expect(result.used).toEqual(['cooked rice', 'lemon', 'onion', 'spinach', 'greek yogurt']);
    expect(result.missing).toEqual(['chicken thigh', 'parsley']);
    expect(result.pantry).toEqual(['salt', 'pepper', 'oil']);
  });

  it('counts a generic fridge item for a specific recipe ingredient', () => {
    const result = analyzeRecipe(recipe('pan-con-tomate'), ['cherry tomato', 'bread']);
    expect(result.used).toContain('tomato');
  });
});

describe('bestDeal', () => {
  it('picks the cheapest matching deal', () => {
    const cheap = deal({ id: 'cheap', price: 0.9 });
    const pricey = deal({ id: 'pricey', price: 1.2 });
    expect(bestDeal('onion', [pricey, cheap])?.id).toBe('cheap');
  });

  it('lets a sponsored deal win a price tie', () => {
    const plain = deal({ id: 'plain', price: 1 });
    const sponsored = deal({ id: 'sponsored', price: 1, sponsored: true });
    expect(bestDeal('onion', [plain, sponsored])?.id).toBe('sponsored');
    expect(bestDeal('onion', [sponsored, plain])?.id).toBe('sponsored');
  });

  it('never lets sponsorship beat a lower price', () => {
    const cheaper = deal({ id: 'cheaper', price: 0.99 });
    const sponsored = deal({ id: 'sponsored', price: 1, sponsored: true });
    expect(bestDeal('onion', [sponsored, cheaper])?.id).toBe('cheaper');
  });

  it('uses the bundled tie: tuna goes to the sponsored Carrefour deal', () => {
    expect(bestDeal('tuna', DEALS)?.id).toBe('car-tuna');
  });

  it('matches a generic ingredient to the cheapest variant on sale', () => {
    expect(bestDeal('cheese', DEALS)?.id).toBe('car-mozzarella');
    expect(bestDeal('soy sauce', DEALS)).toBeNull();
  });
});

describe('priceMissing and costPerServing', () => {
  it('matches the mockup for lemon chicken rice', () => {
    const pricing = priceMissing(['chicken thigh', 'parsley'], DEALS);
    expect(pricing.totalCents).toBe(469);
    expect(pricing.savingsCents).toBe(160);
    expect(pricing.onSale).toBe(2);
    expect(pricing.notOnSale).toBe(0);
    expect(pricing.sponsoredChains).toEqual(['Mercadona']);
    expect(costPerServing(pricing, 2)).toBe(235);
  });

  it('leaves items with no deal out of the estimate', () => {
    const pricing = priceMissing(['frozen vegetable', 'soy sauce'], DEALS);
    expect(pricing.totalCents).toBe(115);
    expect(pricing.onSale).toBe(1);
    expect(pricing.notOnSale).toBe(1);
    expect(pricing.items.find((item) => item.key === 'soy sauce')?.deal).toBeNull();
  });

  it('computes discount percentages from the prices', () => {
    const byId = Object.fromEntries(DEALS.map((d) => [d.id, d.discountPct]));
    expect(byId['mer-chicken-thighs']).toBe(25);
    expect(byId['lid-cherry-tomatoes']).toBe(32);
    expect(byId['lid-parsley']).toBe(28);
    expect(byId['mer-chickpeas']).toBe(21);
    expect(byId['car-potatoes']).toBe(20);
  });
});

describe('isAllowed', () => {
  it('drops recipes with an allergen', () => {
    expect(isAllowed(recipe('shakshuka-manchego'), { ...NO_PREFS, allergies: ['lactose'] })).toBe(false);
    expect(isAllowed(recipe('tuna-tomato-pasta'), { ...NO_PREFS, allergies: ['gluten'] })).toBe(false);
    expect(isAllowed(recipe('veggie-fried-rice'), { ...NO_PREFS, allergies: ['soy'] })).toBe(false);
    expect(isAllowed(recipe('spanish-tortilla'), { ...NO_PREFS, allergies: ['nuts'] })).toBe(true);
  });

  it('applies diets', () => {
    expect(isAllowed(recipe('lemon-chicken-rice'), { ...NO_PREFS, diet: 'vegetarian' })).toBe(false);
    expect(isAllowed(recipe('spanish-tortilla'), { ...NO_PREFS, diet: 'vegetarian' })).toBe(true);
    expect(isAllowed(recipe('spanish-tortilla'), { ...NO_PREFS, diet: 'vegan' })).toBe(false);
    expect(isAllowed(recipe('gazpacho'), { ...NO_PREFS, diet: 'vegan' })).toBe(true);
    expect(isAllowed(recipe('chickpea-tuna-salad'), { ...NO_PREFS, diet: 'pescatarian' })).toBe(true);
    expect(isAllowed(recipe('lemon-chicken-rice'), { ...NO_PREFS, diet: 'pescatarian' })).toBe(false);
  });

  it('treats halal as no pork and no alcohol', () => {
    expect(isAllowed(recipe('lentils-chorizo'), { ...NO_PREFS, diet: 'halal' })).toBe(false);
    expect(isAllowed(recipe('lemon-chicken-rice'), { ...NO_PREFS, diet: 'halal' })).toBe(true);
  });
});

describe('pinDeal', () => {
  const cheap = deal({ id: 'cheap', price: 1, oldPrice: 2 });
  const pinned = deal({ id: 'pinned', price: 1.5, oldPrice: 2 });
  const garlic = deal({ id: 'garlic', ingredientKey: 'garlic', price: 1, oldPrice: 2 });

  it('makes the pinned deal the one used, even when another is cheaper', () => {
    const deals = pinDeal([cheap, pinned, garlic], pinned);
    expect(bestDeal('onion', deals)?.id).toBe('pinned');
  });

  it('leaves the deals for other ingredients alone', () => {
    const deals = pinDeal([cheap, pinned, garlic], pinned);
    expect(bestDeal('garlic', deals)?.id).toBe('garlic');
  });

  it('also replaces deals for variants of the same ingredient', () => {
    const cheese = deal({ id: 'cheese', ingredientKey: 'cheese', price: 3, oldPrice: 4 });
    const manchego = deal({ id: 'manchego', ingredientKey: 'manchego', price: 2, oldPrice: 4 });
    expect(bestDeal('manchego', pinDeal([cheese, manchego], cheese))?.id).toBe('cheese');
  });

  it('changes nothing without a pinned deal', () => {
    expect(pinDeal(DEALS, null)).toBe(DEALS);
  });
});

describe('sizeText', () => {
  it('keeps the size as the Spanish store printed it', () => {
    expect(sizeText('0,33 l', 'es')).toBe('0,33 l');
    expect(sizeText('400 g peso esc.', 'es')).toBe('400 g peso esc.');
  });

  it('uses a decimal point and plain words in English', () => {
    expect(sizeText('1,5 kg', 'en')).toBe('1.5 kg');
    expect(sizeText('400 g peso esc.', 'en')).toBe('400 g drained');
    expect(sizeText('×12', 'en')).toBe('×12');
  });
});
