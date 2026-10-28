import { catalogEntry, ingredientName } from './catalog';
import type { InventoryItem, Lang } from './types';

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
