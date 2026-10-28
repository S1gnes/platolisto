import { dealById } from './deals';
import { CHAINS, type Chain, type Deal, type ListItem } from './types';

export interface ListRow {
  item: ListItem;
  deal: Deal | undefined;
}

export interface ListGroup {
  /** `null` groups the items that are not on sale. */
  chain: Chain | null;
  rows: ListRow[];
  subtotalCents: number;
}

export interface ListSummary {
  groups: ListGroup[];
  totalCents: number;
  savingsCents: number;
  itemCount: number;
  dishCount: number;
  storeCount: number;
}

/** Shopping list grouped by store, with totals from deal prices. Items are counted once even if several dishes need them. */
export function summarizeList(list: ListItem[], findDeal: (id: string | null) => Deal | undefined = dealById): ListSummary {
  const rows = list.map((item) => ({ item, deal: findDeal(item.dealId) }));
  const groups: ListGroup[] = CHAINS.map((chain) => {
    const chainRows = rows.filter((row) => row.deal?.chain === chain);
    return {
      chain,
      rows: chainRows,
      subtotalCents: chainRows.reduce((sum, row) => sum + (row.deal?.priceCents ?? 0), 0),
    };
  });
  groups.push({ chain: null, rows: rows.filter((row) => !row.deal), subtotalCents: 0 });
  const filled = groups.filter((group) => group.rows.length > 0);

  let totalCents = 0;
  let savingsCents = 0;
  for (const { deal } of rows) {
    if (!deal) continue;
    totalCents += deal.priceCents;
    savingsCents += deal.oldPriceCents - deal.priceCents;
  }

  return {
    groups: filled,
    totalCents,
    savingsCents,
    itemCount: list.length,
    dishCount: new Set(list.flatMap((item) => item.recipes.map((recipe) => recipe.id))).size,
    storeCount: filled.filter((group) => group.chain).length,
  };
}
