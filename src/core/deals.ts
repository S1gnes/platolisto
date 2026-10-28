import raw from '../data/deals.json';
import { normalizeIngredient } from './normalize';
import type { Deal, DealRecord, Lang } from './types';

export function toCents(euros: number): number {
  return Math.round(euros * 100);
}

export function toDeal(record: DealRecord): Deal {
  const priceCents = toCents(record.price);
  const oldPriceCents = toCents(record.oldPrice);
  return {
    id: record.id,
    chain: record.chain,
    name: { en: record.name_en, es: record.name_es },
    size: record.size,
    key: normalizeIngredient(record.ingredientKey),
    priceCents,
    oldPriceCents,
    discountPct: oldPriceCents > 0 ? Math.round(((oldPriceCents - priceCents) / oldPriceCents) * 100) : 0,
    sponsored: record.sponsored,
    validUntil: record.validUntil,
  };
}

export const DEALS: Deal[] = (raw as DealRecord[]).map(toDeal);

const byId = new Map(DEALS.map((deal) => [deal.id, deal]));

export function dealById(id: string | null | undefined): Deal | undefined {
  return id ? byId.get(id) : undefined;
}

/** "Chicken thighs 1 kg", "Fresh parsley". */
export function dealName(deal: Deal, lang: Lang): string {
  const name = deal.name[lang] || deal.name.en;
  return deal.size ? `${name} ${deal.size}` : name;
}
