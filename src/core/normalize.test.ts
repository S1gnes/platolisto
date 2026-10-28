import { describe, expect, it } from 'vitest';
import { catalogEntry } from './catalog';
import { DEALS } from './deals';
import { normalizeIngredient, singularize } from './normalize';
import { RECIPES } from '../data/recipes';
import { PRESETS } from './presets';

describe('normalizeIngredient', () => {
  it.each([
    ['Eggs', 'egg'],
    ['  GREEK Yogurt ', 'greek yogurt'],
    ['Limón', 'lemon'],
    ['Espinacas', 'spinach'],
    ['champiñones', 'mushroom'],
  ])('lowercases and strips accents: %s → %s', (raw, key) => {
    expect(normalizeIngredient(raw)).toBe(key);
  });

  it.each([
    ['Cherry tomatoes 500 g', 'cherry tomato'],
    ['Chicken thighs 1 kg', 'chicken thigh'],
    ['Free-range eggs ×12', 'egg'],
    ['Huevos camperos x12', 'egg'],
    ['2 cans chickpeas', 'chickpea'],
    ['Semi-skimmed milk 1 L', 'milk'],
    ['1,5 kg potatoes', 'potato'],
  ])('strips sizes and counts: %s → %s', (raw, key) => {
    expect(normalizeIngredient(raw)).toBe(key);
  });

  it.each([
    ['Hacendado garbanzos', 'chickpea'],
    ['Milbona greek yogurt', 'greek yogurt'],
    ['Central Lechera Asturiana leche entera', 'milk'],
  ])('strips brands: %s → %s', (raw, key) => {
    expect(normalizeIngredient(raw)).toBe(key);
  });

  it.each([
    ['scallion', 'green onion'],
    ['spring onions', 'green onion'],
    ['garbanzo', 'chickpea'],
    ['garbanzo beans', 'chickpea'],
    ['courgette', 'zucchini'],
    ['spaghetti', 'pasta'],
    ['tomate triturado', 'canned tomato'],
    ['contramuslos de pollo', 'chicken thigh'],
  ])('maps synonyms in English and Spanish: %s → %s', (raw, key) => {
    expect(normalizeIngredient(raw)).toBe(key);
  });

  it('keeps the spice and the vegetable apart', () => {
    expect(normalizeIngredient('black pepper')).toBe('pepper');
    expect(normalizeIngredient('pimienta')).toBe('pepper');
    expect(normalizeIngredient('red pepper')).toBe('bell pepper');
    expect(normalizeIngredient('peppers')).toBe('bell pepper');
    expect(normalizeIngredient('pimientos')).toBe('bell pepper');
  });

  it('falls back to the head noun', () => {
    expect(normalizeIngredient('roma tomatoes')).toBe('tomato');
    expect(normalizeIngredient('extra large brown eggs')).toBe('egg');
    expect(normalizeIngredient('queso de cabra')).toBe('cheese');
    expect(normalizeIngredient('chicken breast fillets')).toBe('chicken breast');
  });

  it('returns unknown ingredients cleaned and singular, so they still match each other', () => {
    expect(normalizeIngredient('Dragon fruits')).toBe('dragon fruit');
    expect(normalizeIngredient('dragon fruit')).toBe('dragon fruit');
    expect(normalizeIngredient('')).toBe('');
  });
});

describe('singularize', () => {
  it.each([
    ['tomatoes', 'tomato'],
    ['berries', 'berry'],
    ['peaches', 'peach'],
    ['leaves', 'leaf'],
    ['olives', 'olive'],
    ['lentils', 'lentil'],
    ['hummus', 'hummus'],
    ['glass', 'glass'],
  ])('%s → %s', (word, singular) => {
    expect(singularize(word)).toBe(singular);
  });
});

describe('bundled data uses catalog keys', () => {
  it('every deal maps to a catalog ingredient', () => {
    for (const deal of DEALS) expect(catalogEntry(deal.key), deal.id).toBeDefined();
  });

  it('every recipe ingredient is a catalog key', () => {
    for (const recipe of RECIPES) {
      for (const { key } of recipe.ingredients) expect(catalogEntry(key), `${recipe.id}: ${key}`).toBeDefined();
    }
  });

  it('every preset detection maps to a catalog ingredient', () => {
    for (const preset of PRESETS) {
      for (const detection of preset.detections) {
        expect(catalogEntry(normalizeIngredient(detection.name)), `${preset.id}: ${detection.name}`).toBeDefined();
      }
    }
  });

  it('recipes have steps in both languages', () => {
    for (const recipe of RECIPES) {
      expect(recipe.steps.en.length, recipe.id).toBeGreaterThan(0);
      expect(recipe.steps.es.length, recipe.id).toBe(recipe.steps.en.length);
    }
  });
});
