import { useCallback } from 'react';
import { Link } from 'react-router';
import { AddIngredient } from '../components/AddIngredient';
import { cx } from '../components/cx';
import { Icon } from '../components/Icon';
import { TabBar } from '../components/TabBar';
import { toast } from '../components/Toast';
import { catalogEntry, ingredientName } from '../core/catalog';
import { dealName, DEALS } from '../core/deals';
import { typedLabel } from '../core/display';
import { summarizeList, type ListRow, type ListSummary } from '../core/list';
import { bestDeal } from '../core/match';
import { normalizeIngredient } from '../core/normalize';
import { suggestIngredients } from '../core/suggest';
import { useT, type Translator } from '../i18n';
import { useApp } from '../state/store';
import ui from '../styles/ui.module.css';
import s from './List.module.css';

function rowName({ item, deal }: ListRow, t: Translator): string {
  if (deal) return dealName(deal, t.lang);
  return item.label ? t.pick(item.label) : ingredientName(item.key, t.lang);
}

function shareText(summary: ListSummary, t: Translator): string {
  const lines = [t('list.shareTitle'), ''];
  for (const group of summary.groups) {
    lines.push(group.chain ?? t('list.notOnSale'));
    for (const row of group.rows) {
      const mark = row.item.checked ? '[x]' : '[ ]';
      lines.push(`${mark} ${rowName(row, t)}${row.deal ? `, ${t.price(row.deal.priceCents)}` : ''}`);
    }
    lines.push('');
  }
  lines.push(t('list.shareTotal', { total: t.price(summary.totalCents), save: t.price(summary.savingsCents) }));
  return lines.join('\n');
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers and insecure contexts: fall back to a hidden textarea.
    try {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand('copy');
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

export function ShoppingList() {
  const t = useT();
  const list = useApp((state) => state.list);
  const toggle = useApp((state) => state.toggleListItem);
  const removeChecked = useApp((state) => state.removeCheckedItems);
  const addToList = useApp((state) => state.addToList);
  const summary = summarizeList(list);

  const suggest = useCallback(
    (query: string) =>
      suggestIngredients(
        query,
        t.lang,
        list.map((item) => item.key),
      ),
    [t.lang, list],
  );

  // Your own item gets this week's cheapest deal for it, when there is one.
  const addOwn = (text: string) => {
    const key = normalizeIngredient(text);
    if (!key) return;
    const known = catalogEntry(key);
    const added = addToList([
      { key, dealId: bestDeal(key, DEALS)?.id ?? null, label: known ? undefined : typedLabel(text) },
    ]);
    if (added === 0) toast(t('list.already', { name: known ? ingredientName(key, t.lang) : text }));
  };

  const adder = (
    <div className={s.adder}>
      <AddIngredient
        onAdd={addOwn}
        suggest={suggest}
        addText={t('scan.add')}
        label={t('list.addLabel')}
        placeholder={t('list.addPlaceholder')}
        suggestionsLabel={t('scan.suggestions')}
      />
    </div>
  );

  const share = async () => {
    const text = shareText(summary, t);
    if (navigator.share) {
      try {
        await navigator.share({ title: t('list.shareTitle'), text });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }
    toast((await copyText(text)) ? t('list.copied') : t('list.shareFailed'));
  };

  const empty = list.length === 0;
  const items = t.plural('list.items', summary.itemCount);
  const hasUnpriced = summary.groups.some((group) => !group.chain);

  return (
    <>
      <main className={s.page}>
        <section className={s.head}>
          <h1 className={ui.pageTitle}>{t('list.title')}</h1>
          {!empty && (
            <p className={ui.subtitle}>
              {summary.dishCount > 0
                ? t('list.summary', { items, dishes: t.plural('list.dishes', summary.dishCount) })
                : items}
            </p>
          )}
        </section>

        {/* One slot for either state, so the add field below keeps its place, and its focus, when the first item lands. */}
        {empty ? (
          <div className={s.empty}>
            <h2 className={ui.sectionTitle}>{t('list.emptyTitle')}</h2>
            <p className={ui.note}>{t('list.emptyText')}</p>
            <Link to="/scan" className={cx(ui.btn, ui.primary)}>
              {t('list.emptyCta')}
            </Link>
          </div>
        ) : (
          <div>
            {summary.storeCount > 0 && (
              <div className={s.totals}>
                <p className={s.total}>
                  <span>{t('list.total')}</span>
                  <span className={s.totalValue}>{t.price(summary.totalCents)}</span>
                </p>
                {summary.savingsCents > 0 && (
                  <p className={cx(s.saved, ui.save)}>
                    <span>{t('list.youSave')}</span>
                    <span>{t.price(summary.savingsCents)}</span>
                  </p>
                )}
                {hasUnpriced && <p className={ui.note}>{t('list.noPriceNote')}</p>}
              </div>
            )}

            <div className={s.groups}>
              {summary.groups.map((group) => {
                const groupId = `group-${group.chain ?? 'none'}`;
                return (
                  <section key={groupId} aria-labelledby={groupId}>
                    <div className={s.groupHead}>
                      <h2 id={groupId} className={ui.sectionTitle}>
                        {group.chain ?? t('list.notOnSale')}
                      </h2>
                      {group.chain && <span className={s.subtotal}>{t.price(group.subtotalCents)}</span>}
                    </div>
                    <ul className={cx(ui.rows, s.rows)}>
                      {group.rows.map((row) => (
                        <li key={row.item.id}>
                          <label className={cx(s.row, row.item.checked && s.checked)}>
                            <input
                              type="checkbox"
                              className={s.check}
                              checked={row.item.checked}
                              onChange={() => toggle(row.item.id)}
                            />
                            <span className={s.rowText}>
                              <span className={s.name}>{rowName(row, t)}</span>
                              {row.item.recipes.length > 0 && (
                                <span className={s.dish}>
                                  {row.item.recipes.map((recipe) => t.pick(recipe.title)).join(', ')}
                                </span>
                              )}
                            </span>
                            {row.deal && (
                              <span className={s.prices}>
                                <span className={cx(ui.priceTag, s.price)}>{t.price(row.deal.priceCents)}</span>
                                <s className={ui.oldPrice}>
                                  <span className="visually-hidden">{t('common.was')} </span>
                                  {t.price(row.deal.oldPriceCents)}
                                </s>
                              </span>
                            )}
                          </label>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          </div>
        )}

        {adder}

        {list.some((item) => item.checked) && (
          <div className={s.clear}>
            <button type="button" className={cx(ui.textBtn, ui.dangerText)} onClick={removeChecked}>
              {t('list.removeChecked')}
            </button>
          </div>
        )}
      </main>
      <TabBar
        action={
          empty ? undefined : (
            <button type="button" className={cx(ui.btn, ui.secondary)} onClick={share}>
              <Icon name="share" size={20} />
              {t('list.share')}
            </button>
          )
        }
      />
    </>
  );
}
