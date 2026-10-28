import { describe, expect, it } from 'vitest';
import { buildSearchParams, liveId, toRecipe, type SpoonRecipe } from './spoonacular';
import type { Prefs } from './types';

const PREFS: Prefs = { allergies: [], diet: 'anything', loves: [], budget: 3 };

describe('buildSearchParams', () => {
  it('sends the fridge without pantry staples or duplicates', () => {
    const params = buildSearchParams(['egg', 'onion', 'salt', 'egg', 'oil'], PREFS);
    expect(params.get('includeIngredients')).toBe('egg,onion');
    expect(params.get('sort')).toBe('max-used-ingredients');
    expect(params.has('intolerances')).toBe(false);
    expect(params.has('diet')).toBe(false);
  });

  it('maps allergies to Spoonacular intolerances', () => {
    const params = buildSearchParams(['egg'], { ...PREFS, allergies: ['lactose', 'nuts', 'fish', 'eggs'] });
    expect(params.get('intolerances')).toBe('dairy,tree nut,peanut,seafood,egg');
  });

  it('maps diets, and halal to excluded pork and alcohol', () => {
    expect(buildSearchParams(['egg'], { ...PREFS, diet: 'pescatarian' }).get('diet')).toBe('pescetarian');
    expect(buildSearchParams(['egg'], { ...PREFS, diet: 'vegan' }).get('diet')).toBe('vegan');
    const halal = buildSearchParams(['egg'], { ...PREFS, diet: 'halal' });
    expect(halal.has('diet')).toBe(false);
    expect(halal.get('excludeIngredients')).toContain('pork');
    expect(halal.get('excludeIngredients')).toContain('wine');
  });
});

describe('toRecipe', () => {
  const sample: SpoonRecipe = {
    id: 716429,
    title: 'Pasta with Garlic, Scallions and Cauliflower',
    image: 'https://img.spoonacular.com/recipes/716429-312x231.jpg',
    readyInMinutes: 45,
    servings: 2,
    sourceName: 'Full Belly Sisters',
    sourceUrl: 'https://example.com/pasta',
    cuisines: [],
    usedIngredients: [{ name: 'scallions' }, { name: 'garlic' }],
    missedIngredients: [{ name: 'cauliflower florets', nameClean: 'cauliflower' }, { name: 'spaghetti' }, { name: 'garlic' }],
    analyzedInstructions: [{ steps: [{ step: 'Boil the pasta.' }, { step: ' ' }, { step: 'Add the garlic.' }] }],
  };

  it('normalizes ingredients and keeps the original names for display', () => {
    const recipe = toRecipe(sample);
    expect(recipe.id).toBe('sp-716429');
    expect(recipe.ingredients.map((i) => i.key)).toEqual(['green onion', 'garlic', 'cauliflower', 'pasta']);
    expect(recipe.ingredients[0].name).toEqual({ en: 'Scallions', es: 'Scallions' });
    expect(recipe.steps.en).toEqual(['Boil the pasta.', 'Add the garlic.']);
    expect(recipe.tags).toContain('pasta');
    expect(recipe.source).toEqual({ name: 'Full Belly Sisters', url: 'https://example.com/pasta' });
  });

  it('falls back to plain instructions and sane defaults', () => {
    const recipe = toRecipe({ id: 1, title: 'Soup', instructions: '<ol><li>Heat it.</li><li>Eat it!</li></ol>' });
    expect(recipe.steps.en).toEqual(['Heat it.', 'Eat it!']);
    expect(recipe.minutes).toBe(30);
    expect(recipe.servings).toBe(2);
    expect(recipe.source?.url).toBe('https://spoonacular.com/food-api');
  });

  it('reads live ids', () => {
    expect(liveId('sp-42')).toBe(42);
    expect(liveId('egg-fried-rice')).toBeNull();
    expect(liveId('sp-abc')).toBeNull();
  });
});
