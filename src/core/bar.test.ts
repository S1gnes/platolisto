import { describe, expect, it } from 'vitest';
import data from '../data/cocktails.json';
import { estimateMinutes, matchDrink, normalizeBarIngredient, rankDrinks, SAMPLE_BAR, toDrink, type DrinkRecord } from './bar';

const DRINKS = (data.drinks as DrinkRecord[]).map(toDrink);
const byName = (name: string) => {
  const drink = DRINKS.find((d) => d.name.toLowerCase() === name.toLowerCase());
  if (!drink) throw new Error(`missing ${name}`);
  return drink;
};

describe('normalizeBarIngredient', () => {
  it.each([
    ['Light rum', 'white rum'],
    ['Bacardi', 'white rum'],
    ['Club soda', 'soda water'],
    ['Carbonated water', 'soda water'],
    ['Coca-Cola', 'cola'],
    ['Powdered sugar', 'sugar'],
    ['Kahlua', 'coffee liqueur'],
    ['Cointreau', 'triple sec'],
    ['Ron blanco', 'white rum'],
    ['Limas', 'lime'],
    ['Hierbabuena', 'mint'],
  ])('%s → %s', (raw, key) => {
    expect(normalizeBarIngredient(raw)).toBe(key);
  });
});

describe('drinks from the bundled dataset', () => {
  it('has a few hundred drinks, all with ingredients', () => {
    expect(DRINKS.length).toBeGreaterThan(300);
    expect(DRINKS.every((d) => d.ingredients.length > 0)).toBe(true);
  });

  it('treats ice, water and garnishes as optional', () => {
    const drink = toDrink({
      id: 'x',
      name: 'Test',
      alcoholic: true,
      category: 'Cocktail',
      glass: 'Highball glass',
      thumb: '',
      instructions: { en: 'Build over ice.' },
      ingredients: [
        { name: 'Gin', measure: '2 oz' },
        { name: 'Tonic water', measure: '4 oz' },
        { name: 'Ice', measure: '' },
        { name: 'Lime', measure: '1 wedge' },
        { name: 'Water', measure: '' },
      ],
    });
    expect(drink.ingredients.filter((i) => !i.optional).map((i) => i.key)).toEqual(['gin', 'tonic water']);
  });

  it('reproduces the mockup with the sample bar', () => {
    const { ready, almost } = rankDrinks(DRINKS, SAMPLE_BAR);
    const names = ready.map((match) => match.drink.name);
    expect(names).toEqual(expect.arrayContaining(['Mojito', 'Cuba Libre', 'Daiquiri']));
    expect(names[0]).toBe('Mojito');
    expect(matchDrink(byName('Mojito'), SAMPLE_BAR)).toMatchObject({ total: 5, missing: [] });
    expect(almost.length).toBeGreaterThan(0);
    expect(almost.every((match) => match.missing.length <= 2 && match.have.length > 0)).toBe(true);
  });

  it('lets a generic bottle cover a specific one and juice come from fruit', () => {
    const match = matchDrink(byName('Daiquiri'), ['rum', 'lime', 'sugar']);
    expect(match.missing).toEqual([]);
  });

  it('returns nothing for an empty bar', () => {
    expect(rankDrinks(DRINKS, [])).toEqual({ ready: [], almost: [] });
  });

  it('estimates time from the method', () => {
    expect(estimateMinutes(5, 'Muddle mint leaves with sugar and lime juice.')).toBe(5);
    expect(estimateMinutes(3, 'Build all ingredients in a Collins glass.')).toBe(2);
    expect(estimateMinutes(3, 'Shake well and strain.')).toBe(3);
  });
});
