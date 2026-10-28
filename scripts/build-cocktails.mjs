// Downloads the free TheCocktailDB dataset once (search by first letter a–z, 0–9),
// trims it to what bartender mode needs and writes src/data/cocktails.json.
// Usage: npm run build:cocktails
// Data and images: TheCocktailDB (https://www.thecocktaildb.com/), free key "1" for development and educational use.
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const API = 'https://www.thecocktaildb.com/api/json/v1/1/search.php?f=';
const LETTERS = [...'abcdefghijklmnopqrstuvwxyz0123456789'];
const OUT = fileURLToPath(new URL('../src/data/cocktails.json', import.meta.url));
const PAUSE_MS = 350;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function clean(value) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
}

function trim(drink) {
  const ingredients = [];
  for (let i = 1; i <= 15; i += 1) {
    const name = clean(drink[`strIngredient${i}`]);
    if (!name) continue;
    ingredients.push({ name, measure: clean(drink[`strMeasure${i}`]) });
  }
  const instructions = { en: clean(drink.strInstructions) };
  const es = clean(drink.strInstructionsES);
  if (es) instructions.es = es;
  return {
    id: String(drink.idDrink),
    name: clean(drink.strDrink),
    alcoholic: clean(drink.strAlcoholic).toLowerCase() !== 'non alcoholic',
    category: clean(drink.strCategory),
    glass: clean(drink.strGlass),
    thumb: clean(drink.strDrinkThumb),
    instructions,
    ingredients,
  };
}

const byId = new Map();
for (const letter of LETTERS) {
  const response = await fetch(`${API}${letter}`);
  if (!response.ok) throw new Error(`${letter}: HTTP ${response.status}`);
  const data = await response.json();
  const drinks = Array.isArray(data.drinks) ? data.drinks : [];
  for (const drink of drinks) {
    const trimmed = trim(drink);
    if (trimmed.name && trimmed.ingredients.length > 0) byId.set(trimmed.id, trimmed);
  }
  process.stdout.write(`${letter}:${drinks.length} `);
  await sleep(PAUSE_MS);
}

const drinks = [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
const output = {
  source: 'TheCocktailDB (https://www.thecocktaildb.com/)',
  fetchedAt: new Date().toISOString().slice(0, 10),
  drinks,
};
await writeFile(OUT, `${JSON.stringify(output)}\n`);
console.log(`\nSaved ${drinks.length} drinks to ${OUT}`);
