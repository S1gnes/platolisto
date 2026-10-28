import { cleanText, createNormalizer } from './normalize';
import type { Lang } from './types';

// Bartender mode works on its own small catalog: cocktail ingredients have their own synonyms
// ("light rum" = "white rum", "club soda" = "soda water") and Spanish names.

export interface BarEntry {
  key: string;
  en: string;
  es: string;
  parent?: string;
  aliases?: string[];
}

export const BAR_CATALOG: BarEntry[] = [
  { key: 'rum', en: 'Rum', es: 'Ron' },
  { key: 'white rum', en: 'White rum', es: 'Ron blanco', parent: 'rum', aliases: ['light rum', 'silver rum', 'bacardi', 'bacardi limon', 'ron blanco'] },
  { key: 'dark rum', en: 'Dark rum', es: 'Ron añejo', parent: 'rum', aliases: ['gold rum', 'anejo rum', 'ron anejo', 'ron negro'] },
  { key: 'spiced rum', en: 'Spiced rum', es: 'Ron especiado', parent: 'rum' },
  { key: 'overproof rum', en: 'Overproof rum', es: 'Ron de alta graduación', parent: 'rum', aliases: ['151 proof rum'] },
  { key: 'coconut rum', en: 'Coconut rum', es: 'Ron de coco', parent: 'rum', aliases: ['malibu rum', 'malibu'] },
  { key: 'vodka', en: 'Vodka', es: 'Vodka', aliases: ['absolut vodka', 'smirnoff', 'absolut citron', 'citrus vodka', 'absolut kurant', 'lemon vodka'] },
  { key: 'gin', en: 'Gin', es: 'Ginebra', aliases: ['london dry gin', 'dry gin', 'ginebra'] },
  { key: 'tequila', en: 'Tequila', es: 'Tequila', aliases: ['silver tequila', 'gold tequila', 'tequila blanco', 'blanco tequila'] },
  { key: 'whiskey', en: 'Whisky', es: 'Whisky', aliases: ['whisky', 'blended whiskey', 'blended scotch', 'crown royal', 'canadian whisky', 'rye whiskey'] },
  { key: 'bourbon', en: 'Bourbon', es: 'Bourbon', parent: 'whiskey', aliases: ['wild turkey', 'jack daniels', 'jim beam', 'tennessee whiskey'] },
  { key: 'scotch', en: 'Scotch', es: 'Whisky escocés', parent: 'whiskey', aliases: ['scotch whisky'] },
  { key: 'irish whiskey', en: 'Irish whiskey', es: 'Whisky irlandés', parent: 'whiskey', aliases: ['jameson'] },
  { key: 'brandy', en: 'Brandy', es: 'Brandy', aliases: ['cognac', 'conac'] },
  { key: 'cachaca', en: 'Cachaça', es: 'Cachaza', aliases: ['cachaza'] },
  { key: 'vermouth', en: 'Vermouth', es: 'Vermut', aliases: ['vermut'] },
  { key: 'dry vermouth', en: 'Dry vermouth', es: 'Vermut seco', parent: 'vermouth', aliases: ['vermut seco'] },
  { key: 'sweet vermouth', en: 'Sweet vermouth', es: 'Vermut rojo', parent: 'vermouth', aliases: ['red vermouth', 'vermut rojo'] },
  { key: 'triple sec', en: 'Triple sec', es: 'Triple seco', aliases: ['cointreau', 'orange liqueur', 'grand marnier', 'curacao', 'blue curacao'] },
  { key: 'amaretto', en: 'Amaretto', es: 'Amaretto' },
  { key: 'coffee liqueur', en: 'Coffee liqueur', es: 'Licor de café', aliases: ['kahlua', 'licor de cafe'] },
  { key: 'irish cream', en: 'Irish cream', es: 'Crema de whisky', aliases: ['baileys irish cream', 'baileys'] },
  { key: 'campari', en: 'Campari', es: 'Campari' },
  { key: 'peach schnapps', en: 'Peach schnapps', es: 'Licor de melocotón', aliases: ['peach liqueur'] },
  { key: 'champagne', en: 'Sparkling wine', es: 'Cava', aliases: ['prosecco', 'cava', 'sparkling wine', 'champan'] },
  { key: 'wine', en: 'Wine', es: 'Vino' },
  { key: 'red wine', en: 'Red wine', es: 'Vino tinto', parent: 'wine', aliases: ['vino tinto'] },
  { key: 'white wine', en: 'White wine', es: 'Vino blanco', parent: 'wine', aliases: ['vino blanco'] },
  { key: 'beer', en: 'Beer', es: 'Cerveza', aliases: ['lager', 'ale', 'corona', 'cerveza'] },
  { key: 'soda water', en: 'Soda water', es: 'Soda', aliases: ['club soda', 'carbonated water', 'sparkling water', 'seltzer', 'soda', 'agua con gas'] },
  { key: 'cola', en: 'Cola', es: 'Cola', aliases: ['coca cola', 'coca-cola', 'coke', 'pepsi', 'refresco de cola'] },
  { key: 'tonic water', en: 'Tonic water', es: 'Tónica', aliases: ['tonic', 'tonica'] },
  { key: 'ginger ale', en: 'Ginger ale', es: 'Ginger ale' },
  { key: 'ginger beer', en: 'Ginger beer', es: 'Ginger beer' },
  { key: 'lemon lime soda', en: 'Lemon-lime soda', es: 'Refresco de lima-limón', aliases: ['7 up', '7-up', 'sprite', 'lemon-lime soda'] },
  { key: 'lemonade', en: 'Lemonade', es: 'Limonada' },
  { key: 'orange juice', en: 'Orange juice', es: 'Zumo de naranja', parent: 'orange', aliases: ['zumo de naranja'] },
  { key: 'lemon juice', en: 'Lemon juice', es: 'Zumo de limón', parent: 'lemon', aliases: ['zumo de limon'] },
  { key: 'lime juice', en: 'Lime juice', es: 'Zumo de lima', parent: 'lime', aliases: ['zumo de lima'] },
  { key: 'pineapple juice', en: 'Pineapple juice', es: 'Zumo de piña', parent: 'pineapple', aliases: ['zumo de pina'] },
  { key: 'cranberry juice', en: 'Cranberry juice', es: 'Zumo de arándanos' },
  { key: 'grapefruit juice', en: 'Grapefruit juice', es: 'Zumo de pomelo', parent: 'grapefruit' },
  { key: 'apple juice', en: 'Apple juice', es: 'Zumo de manzana', parent: 'apple' },
  { key: 'tomato juice', en: 'Tomato juice', es: 'Zumo de tomate' },
  { key: 'sweet and sour', en: 'Sweet and sour mix', es: 'Mezcla agridulce', aliases: ['sour mix'] },
  { key: 'grenadine', en: 'Grenadine', es: 'Granadina', aliases: ['granadina'] },
  { key: 'sugar syrup', en: 'Sugar syrup', es: 'Sirope de azúcar', parent: 'sugar', aliases: ['simple syrup', 'syrup', 'sirope'] },
  { key: 'bitters', en: 'Bitters', es: 'Amargo', aliases: ['angostura bitters', 'orange bitters', 'angostura'] },
  { key: 'coconut milk', en: 'Coconut milk', es: 'Leche de coco', aliases: ['coconut cream', 'cream of coconut', 'crema de coco', 'leche de coco'] },
  { key: 'cream', en: 'Cream', es: 'Nata', aliases: ['light cream', 'heavy cream', 'single cream', 'double cream', 'nata'] },
  { key: 'milk', en: 'Milk', es: 'Leche', aliases: ['leche'] },
  { key: 'coffee', en: 'Coffee', es: 'Café', aliases: ['espresso', 'hot coffee', 'black coffee', 'cafe'] },
  { key: 'egg', en: 'Egg', es: 'Huevo', aliases: ['eggs', 'huevo'] },
  { key: 'egg white', en: 'Egg white', es: 'Clara de huevo', parent: 'egg' },
  { key: 'egg yolk', en: 'Egg yolk', es: 'Yema de huevo', parent: 'egg' },
  { key: 'lime', en: 'Lime', es: 'Lima', aliases: ['limes', 'lima', 'limas'] },
  { key: 'lemon', en: 'Lemon', es: 'Limón', aliases: ['lemons', 'limon', 'limones'] },
  { key: 'orange', en: 'Orange', es: 'Naranja', aliases: ['oranges', 'naranja', 'naranjas'] },
  { key: 'pineapple', en: 'Pineapple', es: 'Piña', aliases: ['pina'] },
  { key: 'grapefruit', en: 'Grapefruit', es: 'Pomelo', aliases: ['pomelo'] },
  { key: 'apple', en: 'Apple', es: 'Manzana', aliases: ['manzana'] },
  { key: 'strawberry', en: 'Strawberries', es: 'Fresas', aliases: ['strawberries', 'fresas', 'fresa'] },
  { key: 'mint', en: 'Fresh mint', es: 'Hierbabuena', aliases: ['fresh mint', 'mint leaves', 'mint sprig', 'hierbabuena', 'menta'] },
  { key: 'sugar', en: 'Sugar', es: 'Azúcar', aliases: ['powdered sugar', 'white sugar', 'brown sugar', 'caster sugar', 'sugar cube', 'azucar'] },
  { key: 'honey', en: 'Honey', es: 'Miel', aliases: ['miel'] },
  { key: 'salt', en: 'Salt', es: 'Sal', aliases: ['sal'] },
  { key: 'cinnamon', en: 'Cinnamon', es: 'Canela', aliases: ['canela'] },
  { key: 'nutmeg', en: 'Nutmeg', es: 'Nuez moscada' },
  { key: 'ginger', en: 'Ginger', es: 'Jengibre' },
  { key: 'vanilla extract', en: 'Vanilla extract', es: 'Extracto de vainilla', aliases: ['vanilla'] },
  { key: 'chocolate', en: 'Chocolate', es: 'Chocolate', aliases: ['chocolate syrup'] },
  { key: 'tea', en: 'Tea', es: 'Té', aliases: ['te'] },
  { key: 'yogurt', en: 'Yogurt', es: 'Yogur', aliases: ['yoghurt', 'yogur'] },
  { key: 'cherry', en: 'Cherry', es: 'Cereza', aliases: ['maraschino cherry', 'cherries', 'cereza'] },
  { key: 'olive', en: 'Olive', es: 'Aceituna', aliases: ['olives', 'aceituna'] },
  { key: 'lemon peel', en: 'Lemon peel', es: 'Piel de limón', parent: 'lemon', aliases: ['lemon twist', 'lemon zest'] },
  { key: 'orange peel', en: 'Orange peel', es: 'Piel de naranja', parent: 'orange', aliases: ['orange twist', 'orange zest'] },
  { key: 'ice', en: 'Ice', es: 'Hielo', aliases: ['ice cubes', 'crushed ice', 'cracked ice', 'hielo'] },
  { key: 'water', en: 'Water', es: 'Agua', aliases: ['cold water', 'hot water', 'boiling water', 'agua'] },
];

/** Always optional: ice, water, garnishes and rims. */
const OPTIONAL_KEYS = new Set(['ice', 'water', 'cherry', 'olive', 'lemon peel', 'orange peel', 'nutmeg', 'salt']);
const OPTIONAL_MEASURE = /garnish|twist|wedge|slice|sprig|rim|to taste|for decoration/i;

export const normalizeBarIngredient = createNormalizer(BAR_CATALOG);

const byKey = new Map(BAR_CATALOG.map((entry) => [entry.key, entry]));

export function barName(key: string, lang: Lang): string {
  const entry = byKey.get(key);
  return entry ? entry[lang] : key.charAt(0).toUpperCase() + key.slice(1);
}

function barRelated(a: string, b: string): boolean {
  return a === b || byKey.get(a)?.parent === b || byKey.get(b)?.parent === a;
}

export interface DrinkRecord {
  id: string;
  name: string;
  alcoholic: boolean;
  category: string;
  glass: string;
  thumb: string;
  instructions: { en: string; es?: string };
  ingredients: { name: string; measure: string }[];
}

export interface DrinkIngredient {
  key: string;
  name: string;
  measure: string;
  optional: boolean;
}

export interface Drink extends Omit<DrinkRecord, 'ingredients'> {
  ingredients: DrinkIngredient[];
  minutes: number;
}

/** Rough preparation time: TheCocktailDB has none, so it comes from the method. */
export function estimateMinutes(required: number, instructions: string): number {
  const text = instructions.toLowerCase();
  let minutes = 2 + (required > 3 ? 2 : 0);
  if (/muddle/.test(text)) minutes += 1;
  if (/shake|shaker/.test(text)) minutes += 1;
  if (/blend/.test(text)) minutes += 2;
  return Math.min(10, minutes);
}

export function toDrink(record: DrinkRecord): Drink {
  const seen = new Set<string>();
  const ingredients: DrinkIngredient[] = [];
  for (const { name, measure } of record.ingredients) {
    const key = normalizeBarIngredient(name);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    ingredients.push({ key, name, measure, optional: OPTIONAL_KEYS.has(key) || OPTIONAL_MEASURE.test(measure) });
  }
  const required = ingredients.filter((ingredient) => !ingredient.optional).length;
  return { ...record, ingredients, minutes: estimateMinutes(required, record.instructions.en) };
}

export interface DrinkMatch {
  drink: Drink;
  have: string[];
  missing: string[];
  total: number;
}

export function matchDrink(drink: Drink, bar: string[]): DrinkMatch {
  const required = drink.ingredients.filter((ingredient) => !ingredient.optional);
  const have: string[] = [];
  const missing: string[] = [];
  for (const { key } of required) {
    if (bar.some((item) => barRelated(item, key))) have.push(key);
    else missing.push(key);
  }
  return { drink, have, missing, total: required.length };
}

/** Drinks you can mix now (more elaborate first) and the ones one or two bottles away. */
export function rankDrinks(drinks: Drink[], bar: string[], almostLimit = 6): { ready: DrinkMatch[]; almost: DrinkMatch[] } {
  if (bar.length === 0) return { ready: [], almost: [] };
  const matches = drinks.map((drink) => matchDrink(drink, bar)).filter((match) => match.total >= 2);
  const ready = matches
    .filter((match) => match.missing.length === 0)
    .sort((a, b) => b.total - a.total || a.drink.name.localeCompare(b.drink.name));
  const almost = matches
    .filter((match) => match.missing.length > 0 && match.missing.length <= 2 && match.have.length > 0)
    .sort(
      (a, b) =>
        a.missing.length - b.missing.length ||
        b.have.length - a.have.length ||
        a.drink.name.localeCompare(b.drink.name),
    )
    .slice(0, almostLimit);
  return { ready, almost };
}

/** Starter bar from the mockup, for the demo. */
export const SAMPLE_BAR = ['white rum', 'lime', 'mint', 'sugar', 'soda water', 'cola'];

const NOT_SUGGESTED = new Set(['ice', 'water']);

/** Bar catalog entries whose name or alias starts with (or contains) the query. */
export function suggestBar(query: string, lang: Lang, exclude: string[] = [], limit = 5): { key: string; name: string }[] {
  const q = cleanText(query);
  if (q.length < 2) return [];
  const starts: { key: string; name: string }[] = [];
  const contains: { key: string; name: string }[] = [];
  for (const entry of BAR_CATALOG) {
    if (NOT_SUGGESTED.has(entry.key) || exclude.includes(entry.key)) continue;
    const names = [entry[lang], entry.en, entry.es, ...(entry.aliases ?? [])].map(cleanText);
    const suggestion = { key: entry.key, name: entry[lang] };
    if (names.some((name) => name.startsWith(q) || name.split(' ').some((word) => word.startsWith(q)))) starts.push(suggestion);
    else if (names.some((name) => name.includes(q))) contains.push(suggestion);
  }
  return [...starts, ...contains].slice(0, limit);
}

/** Which illustration to use when the drink photo can't load. */
export function drinkStyle(drink: Drink): 'mojito' | 'cola' | 'coupe' | 'tropical' | 'shot' {
  const keys = drink.ingredients.map((ingredient) => ingredient.key);
  const glass = drink.glass.toLowerCase();
  if (glass.includes('shot')) return 'shot';
  if (keys.includes('mint')) return 'mojito';
  if (keys.includes('cola')) return 'cola';
  if (keys.some((key) => key === 'pineapple' || key === 'pineapple juice' || key === 'coconut milk')) return 'tropical';
  if (/cocktail|martini|coupe|margarita|nick/.test(glass)) return 'coupe';
  return 'cola';
}
