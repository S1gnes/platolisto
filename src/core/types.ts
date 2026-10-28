export type Lang = 'en' | 'es';

export interface Localized {
  en: string;
  es: string;
}

export const ALLERGIES = ['gluten', 'lactose', 'nuts', 'eggs', 'shellfish', 'soy', 'fish'] as const;
export type Allergy = (typeof ALLERGIES)[number];

export const DIETS = ['anything', 'vegetarian', 'vegan', 'halal', 'pescatarian'] as const;
export type Diet = (typeof DIETS)[number];

export const LOVES = ['pasta', 'chicken', 'spicy', 'spanish', 'asian'] as const;
export type Love = (typeof LOVES)[number];

export const CHAINS = ['Mercadona', 'Lidl', 'Carrefour'] as const;
export type Chain = (typeof CHAINS)[number];

export interface Prefs {
  allergies: Allergy[];
  diet: Diet;
  loves: Love[];
  /** Budget per meal in EUR. */
  budget: number;
}

/** A deal as stored in deals.json (prices in EUR). */
export interface DealRecord {
  id: string;
  chain: Chain;
  name_en: string;
  name_es: string;
  ingredientKey: string;
  size: string;
  price: number;
  oldPrice: number;
  sponsored: boolean;
  validUntil: string;
}

/** A deal ready for matching: normalized key and prices in cents. */
export interface Deal {
  id: string;
  chain: Chain;
  name: Localized;
  size: string;
  key: string;
  priceCents: number;
  oldPriceCents: number;
  discountPct: number;
  sponsored: boolean;
  validUntil: string;
}

export interface RecipeIngredient {
  /** Canonical ingredient key (see core/normalize). */
  key: string;
  /** Display name for ingredients missing from the catalog. */
  name?: Localized;
}

export type PlateArtId = 'egg-fried-rice' | 'lemon-chicken-rice' | 'shakshuka' | 'tortilla';

export interface Recipe {
  id: string;
  title: Localized;
  minutes: number;
  servings: number;
  ingredients: RecipeIngredient[];
  steps: { en: string[]; es: string[] };
  tags: Love[];
  /** Hand-drawn plate from the mockups. */
  art?: PlateArtId;
  /** Procedural plate for every other recipe. */
  plate?: PlateSpec;
  /** Remote photo (live recipes). */
  image?: string;
  source?: { name: string; url: string };
}

export type ToppingKind =
  | 'grain'
  | 'dot'
  | 'pea'
  | 'tube'
  | 'noodle'
  | 'flake'
  | 'leaf'
  | 'chunk'
  | 'slice'
  | 'cube'
  | 'strip'
  | 'egg'
  | 'blob'
  | 'wedge'
  | 'pepper';

export interface Topping {
  kind: ToppingKind;
  color: string;
  count: number;
}

export interface PlateSpec {
  base: string;
  toppings: Topping[];
}

/** Box in Gemini's format: [ymin, xmin, ymax, xmax], normalized to 0–1000. */
export type Box2d = [number, number, number, number];

export interface Detection {
  key: string;
  label: Localized;
  qty?: string;
  confidence: number;
  box?: Box2d;
}

export interface InventoryItem {
  id: string;
  key: string;
  /** Name shown when the key is not in the catalog. */
  label?: Localized;
  qty?: string;
  box?: Box2d;
  /** Label drawn on the photo box. */
  boxLabel?: Localized;
}

export type PresetId = 'student' | 'market' | 'empty';
export type ScanSource = PresetId | 'photo' | 'typed';

export interface ListItem {
  id: string;
  key: string;
  dealId: string | null;
  recipes: { id: string; title: Localized }[];
  checked: boolean;
}
