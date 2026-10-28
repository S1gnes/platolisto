import { Link } from 'react-router';
import { cx } from '../components/cx';
import { Icon } from '../components/Icon';
import { TabBar } from '../components/TabBar';
import { toast } from '../components/Toast';
import { ingredientName } from '../core/catalog';
import { dealById, dealName } from '../core/deals';
import { CHAINS, type Chain, type Deal, type ListItem } from '../core/types';
import { useT, type Translator } from '../i18n';
import { useApp } from '../state/store';
import ui from '../styles/ui.module.css';
import s from './List.module.css';

interface Row {
  item: ListItem;
  deal: Deal | undefined;
  name: string;
}

interface Group {
  chain: Chain | null;
  rows: Row[];
  subtotalCents: number;
}

function buildGroups(list: ListItem[], t: Translator): Group[] {
  const rows: Row[] = list.map((item) => {
    const deal = dealById(item.dealId);
    return { item, deal, name: deal ? dealName(deal, t.lang) : ingredientName(item.key, t.lang) };
  });
  const groups: Group[] = CHAINS.map((chain) => {
    const chainRows = rows.filter((row) => row.deal?.chain === chain);
    return { chain, rows: chainRows, subtotalCents: chainRows.reduce((sum, row) => sum + (row.deal?.priceCents ?? 0), 0) };
  });
  groups.push({ chain: null, rows: rows.filter((row) => !row.deal), subtotalCents: 0 });
  return groups.filter((group) => group.rows.length > 0);
}

function shareText(groups: Group[], totalCents: number, savingsCents: number, t: Translator): string {
  const lines = [t('list.shareTitle'), ''];
  for (const group of groups) {
    lines.push(group.chain ?? t('list.notOnSale'));
    for (const row of group.rows) {
      const mark = row.item.checked ? '[x]' : '[ ]';
      lines.push(`${mark} ${row.name}${row.deal ? ` · ${t.price(row.deal.priceCents)}` : ''}`);
    }
    lines.push('');
  }
  lines.push(t('list.shareTotal', { total: t.price(totalCents), save: t.price(savingsCents) }));
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

  const groups = buildGroups(list, t);
  const deals = list.map((item) => dealById(item.dealId)).filter((deal): deal is Deal => Boolean(deal));
  const totalCents = deals.reduce((sum, deal) => sum + deal.priceCents, 0);
  const savingsCents = deals.reduce((sum, deal) => sum + deal.oldPriceCents - deal.priceCents, 0);
  const dishCount = new Set(list.flatMap((item) => item.recipes.map((recipe) => recipe.id))).size;
  const storeCount = groups.filter((group) => group.chain).length;
  const anyChecked = list.some((item) => item.checked);

  const share = async () => {
    const text = shareText(groups, totalCents, savingsCents, t);
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

  if (list.length === 0) {
    return (
      <>
        <main className={s.page}>
          <section className={s.head}>
            <h1 className={ui.pageTitle}>{t('list.title')}</h1>
          </section>
          <div className={s.empty}>
            <span className={s.emptyIcon}>
              <Icon name="list" size={28} />
            </span>
            <h2 className={ui.sectionTitle}>{t('list.emptyTitle')}</h2>
            <p className={ui.note}>{t('list.emptyText')}</p>
            <Link to="/scan" className={cx(ui.btn, ui.primary)}>
              {t('list.emptyCta')}
            </Link>
          </div>
        </main>
        <TabBar />
      </>
    );
  }

  return (
    <>
      <main className={s.page}>
        <section className={s.head}>
          <h1 className={ui.pageTitle}>{t('list.title')}</h1>
          <p className={ui.subtitle}>
            {t('list.summary', {
              dishes: t.plural('list.dishes', dishCount),
              items: t.plural('list.items', list.length),
              stores: t.plural('list.stores', storeCount),
            })}
          </p>
        </section>

        <div className={s.summary}>
          <div>
            <div className={s.summaryLabel}>{t('list.total')}</div>
            <div className={s.total}>{t.price(totalCents)}</div>
          </div>
          <div className={s.saveBox}>
            <div className={s.summaryLabel}>{t('list.youSave')}</div>
            <div className={s.saved}>{t.price(savingsCents)}</div>
          </div>
        </div>

        <div className={s.groups}>
          {groups.map((group) => (
            <section key={group.chain ?? 'none'} aria-labelledby={`group-${group.chain ?? 'none'}`}>
              <div className={s.groupHead}>
                <h2 id={`group-${group.chain ?? 'none'}`} className={cx(ui.eyebrow, s.noMargin)}>
                  {group.chain ?? t('list.notOnSale')}
                </h2>
                {group.chain && <span className={s.subtotal}>{t.price(group.subtotalCents)}</span>}
              </div>
              <ul className={s.card}>
                {group.rows.map(({ item, deal, name }) => (
                  <li key={item.id}>
                    <label className={cx(s.row, item.checked && s.checked)}>
                      <input
                        type="checkbox"
                        className={s.check}
                        checked={item.checked}
                        onChange={() => toggle(item.id)}
                      />
                      <span className={s.rowText}>
                        <span className={s.name}>{name}</span>
                        <span className={s.dish}>{item.recipes.map((recipe) => t.pick(recipe.title)).join(', ')}</span>
                      </span>
                      {deal && (
                        <span className={s.prices}>
                          <span className={s.price}>{t.price(deal.priceCents)}</span>
                          <s className={ui.oldPrice}>
                            <span className="visually-hidden">{t('common.was')} </span>
                            {t.price(deal.oldPriceCents)}
                          </s>
                        </span>
                      )}
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {anyChecked && (
          <div className={s.clear}>
            <button type="button" className={ui.textBtn} onClick={removeChecked}>
              {t('list.removeChecked')}
            </button>
          </div>
        )}
      </main>
      <TabBar
        action={
          <button type="button" className={cx(ui.btn, ui.outline)} onClick={share}>
            <Icon name="share" size={20} />
            {t('list.share')}
          </button>
        }
      />
    </>
  );
}
