import { catalogEntry, ingredientName } from './catalog';
import type { InventoryItem, Lang, Recipe } from './types';

/** Name of a recipe ingredient: catalog name when known, otherwise the recipe's own (possibly translated) name. */
export function recipeIngredientName(recipe: Recipe, key: string, lang: Lang): string {
  if (catalogEntry(key)) return ingredientName(key, lang);
  const name = recipe.ingredients.find((ingredient) => ingredient.key === key)?.name;
  return name ? name[lang] || name.en : ingredientName(key, lang);
}

/** Name for an inventory chip: catalog name when known, otherwise the detected or typed label. */
export function itemName(item: Pick<InventoryItem, 'key' | 'label'>, lang: Lang): string {
  if (catalogEntry(item.key) || !item.label) return ingredientName(item.key, lang);
  return item.label[lang] || item.label.en;
}

/** " ×4" for counts, " · 500 g" for anything else. */
export function qtySuffix(qty: string | undefined): string {
  const value = qty?.trim();
  if (!value) return '';
  return /^\d+$/.test(value) ? ` ×${value}` : ` · ${value}`;
}
