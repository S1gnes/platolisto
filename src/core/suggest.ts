import { CATALOG, isPantry } from './catalog';
import { cleanText } from './normalize';
import type { Lang } from './types';

export interface Suggestion {
  key: string;
  name: string;
}

/** Catalog ingredients whose name or alias starts with (or contains) the query. */
export function suggestIngredients(query: string, lang: Lang, exclude: string[] = [], limit = 5): Suggestion[] {
  const q = cleanText(query);
  if (q.length < 2) return [];
  const starts: Suggestion[] = [];
  const contains: Suggestion[] = [];
  for (const entry of CATALOG) {
    if (isPantry(entry.key) || exclude.includes(entry.key)) continue;
    const names = [entry[lang], entry.en, entry.es, ...(entry.aliases ?? [])].map(cleanText);
    const suggestion = { key: entry.key, name: entry[lang] };
    if (names.some((name) => name.startsWith(q) || name.split(' ').some((word) => word.startsWith(q)))) {
      starts.push(suggestion);
    } else if (names.some((name) => name.includes(q))) {
      contains.push(suggestion);
    }
  }
  return [...starts, ...contains].slice(0, limit);
}
