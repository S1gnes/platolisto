import { Link } from 'react-router';
import { cx } from '../components/cx';
import { Icon } from '../components/Icon';
import { TabBar } from '../components/TabBar';
import { toast } from '../components/Toast';
import { ingredientName } from '../core/catalog';
import { dealName } from '../core/deals';
import { summarizeList, type ListRow, type ListSummary } from '../core/list';
import { useT, type Translator } from '../i18n';
import { useApp } from '../state/store';
import ui from '../styles/ui.module.css';
import s from './List.module.css';

function rowName({ item, deal }: ListRow, t: Translator): string {
  return deal ? dealName(deal, t.lang) : ingredientName(item.key, t.lang);
}

function shareText(summary: ListSummary, t: Translator): string {
  const lines = [t('list.shareTitle'), ''];
  for (const group of summary.groups) {
    lines.push(group.chain ?? t('list.notOnSale'));
    for (const row of group.rows) {
      const mark = row.item.checked ? '[x]' : '[ ]';
      lines.push(`${mark} ${rowName(row, t)}${row.deal ? ` · ${t.price(row.deal.priceCents)}` : ''}`);
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
  const summary = summarizeList(list);

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
              dishes: t.plural('list.dishes', summary.dishCount),
              items: t.plural('list.items', summary.itemCount),
              stores: t.plural('list.stores', summary.storeCount),
            })}
          </p>
        </section>

        <div className={s.summary}>
          <div>
            <div className={s.summaryLabel}>{t('list.total')}</div>
            <div className={s.total}>{t.price(summary.totalCents)}</div>
          </div>
          <div className={s.saveBox}>
            <div className={s.summaryLabel}>{t('list.youSave')}</div>
            <div className={s.saved}>{t.price(summary.savingsCents)}</div>
          </div>
        </div>

        <div className={s.groups}>
          {summary.groups.map((group) => {
            const groupId = `group-${group.chain ?? 'none'}`;
            return (
              <section key={groupId} aria-labelledby={groupId}>
                <div className={s.groupHead}>
                  <h2 id={groupId} className={cx(ui.eyebrow, s.noMargin)}>
                    {group.chain ?? t('list.notOnSale')}
                  </h2>
                  {group.chain && <span className={s.subtotal}>{t.price(group.subtotalCents)}</span>}
                </div>
                <ul className={s.card}>
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
                          <span className={s.dish}>
                            {row.item.recipes.map((recipe) => t.pick(recipe.title)).join(', ')}
                          </span>
                        </span>
                        {row.deal && (
                          <span className={s.prices}>
                            <span className={s.price}>{t.price(row.deal.priceCents)}</span>
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

        {list.some((item) => item.checked) && (
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
