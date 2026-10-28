import { CATALOG } from './catalog';

// One normalizer for detections, typed input, recipe ingredients and deals,
// so all of them meet on the same canonical key.

const BRANDS = [
  'hacendado',
  'milbona',
  'carrefour',
  'mercadona',
  'lidl',
  'dia',
  'eroski',
  'alcampo',
  'auchan',
  'pascual',
  'puleva',
  'central lechera asturiana',
  'danone',
  'president',
  'el caserio',
  'garcia baquero',
  'calvo',
  'isabel',
  'gallo',
  'barilla',
  'bimbo',
  'heinz',
  'knorr',
  'maggi',
  'carbonell',
  'koipe',
  'hojiblanca',
  'el pozo',
  'elpozo',
  'campofrio',
  'navidul',
  'solis',
  'orlando',
  'deliplus',
  'golden seafood',
  'chef select',
  'deluxe',
  'bonduelle',
  'florette',
  'nestle',
  'kraft',
  'hellmanns',
  'philadelphia',
];

/** Words that never change what the ingredient is. */
const NOISE = new Set([
  'fresh',
  'organic',
  'free',
  'range',
  'large',
  'small',
  'medium',
  'ripe',
  'chopped',
  'diced',
  'sliced',
  'peeled',
  'boneless',
  'skinless',
  'raw',
  'bio',
  'eco',
  'pack',
  'of',
  'a',
  'an',
  'some',
  'the',
  'and',
  'or',
  'can',
  'tin',
  'jar',
  'bottle',
  'bag',
  'box',
  'tray',
  'carton',
  'fresco',
  'fresca',
  'frescos',
  'frescas',
  'ecologico',
  'ecologica',
  'de',
  'del',
  'la',
  'el',
  'los',
  'las',
  'y',
  'con',
  'en',
  'bolsa',
  'paquete',
  'bandeja',
  'tarrina',
  'brik',
  'botella',
  'lata',
  'bote',
]);

/** Words that look plural but are not. */
const INVARIANT = new Set(['hummus', 'couscous', 'asparagus', 'molasses', 'swiss', 'brussels', 'grits', 'species', 'series', 'feta', 'pasta']);
const IRREGULAR: Record<string, string> = {
  leaves: 'leaf',
  halves: 'half',
  loaves: 'loaf',
  cookies: 'cookie',
  pies: 'pie',
  fries: 'fries',
};

const UNIT =
  'kg|g|gr|grams?|gramos|mg|ml|cl|dl|l|ltr|litres?|liters?|litros?|oz|lb|lbs|pounds?|cups?|tbsp|tsp|tablespoons?|teaspoons?|pcs?|pieces?|uds?|unidades|packs?|cans?|tins?|bunch(?:es)?|cloves?|slices?';
const QUANTITY = new RegExp(`\\b\\d+(?:[.,]\\d+)?\\s?(?:${UNIT})\\b`, 'g');
const MULTIPLIER = /[×x]\s?\d+\b/g;
const NUMBER = /\b\d+(?:[.,/]\d+)?\b/g;
const BRAND = new RegExp(`\\b(?:${BRANDS.join('|')})\\b`, 'g');

/** Lowercase, strip accents and punctuation, collapse spaces. */
export function cleanText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9×\s-]/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function collapse(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

export function singularize(word: string): string {
  if (word.length < 4 || INVARIANT.has(word)) return word;
  if (IRREGULAR[word]) return IRREGULAR[word];
  if (word.endsWith('ies')) return `${word.slice(0, -3)}y`;
  if (word.endsWith('oes')) return word.slice(0, -2);
  if (/(?:ches|shes|xes|sses)$/.test(word)) return word.slice(0, -2);
  if (word.endsWith('s') && !/(?:ss|us|is)$/.test(word)) return word.slice(0, -1);
  return word;
}

/** Singularize the head noun (last word) of a phrase. */
function singularPhrase(phrase: string): string {
  const words = phrase.split(' ');
  words[words.length - 1] = singularize(words[words.length - 1]);
  return words.join(' ');
}

const lookup = new Map<string, string>();
for (const entry of CATALOG) {
  for (const name of [entry.key, entry.en, entry.es, ...(entry.aliases ?? [])]) {
    const cleaned = cleanText(name);
    if (!lookup.has(cleaned)) lookup.set(cleaned, entry.key);
  }
}
// Singular forms only where they don't shadow an exact name ("peppers" stays bell pepper, "pepper" stays the spice).
for (const [name, key] of [...lookup]) {
  const singular = singularPhrase(name);
  if (!lookup.has(singular)) lookup.set(singular, key);
}

function find(phrase: string): string | undefined {
  if (!phrase) return undefined;
  return lookup.get(phrase) ?? lookup.get(singularPhrase(phrase));
}

/**
 * Turn any ingredient text ("Cherry tomatoes 500 g", "Huevos camperos ×12", "scallions")
 * into a canonical key ("cherry tomato", "egg", "green onion").
 * Unknown ingredients come back cleaned and singularized so they still match each other.
 */
export function normalizeIngredient(raw: string): string {
  const base = cleanText(raw);
  if (!base) return '';
  const exact = find(base);
  if (exact) return exact;

  const noQuantity = collapse(base.replace(MULTIPLIER, ' ').replace(QUANTITY, ' ').replace(NUMBER, ' '));
  const noBrand = collapse(noQuantity.replace(BRAND, ' '));
  const direct = find(noQuantity) ?? find(noBrand);
  if (direct) return direct;

  const words = noBrand.split(' ').filter((word) => word && !NOISE.has(word));
  const core = words.join(' ');
  const coreHit = find(core);
  if (coreHit) return coreHit;

  // English puts the head noun last ("roma tomatoes"), Spanish first ("queso de cabra").
  for (let start = 1; start < words.length; start += 1) {
    const hit = find(words.slice(start).join(' '));
    if (hit) return hit;
  }
  for (let end = words.length - 1; end > 0; end -= 1) {
    const hit = find(words.slice(0, end).join(' '));
    if (hit) return hit;
  }
  return singularPhrase(core || noBrand || base);
}
