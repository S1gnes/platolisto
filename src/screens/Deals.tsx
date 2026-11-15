import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { cx } from '../components/cx';
import { DealRow } from '../components/DealRow';
import { TabBar } from '../components/TabBar';
import { CHAINS, DEALS, DEALS_DATE } from '../core/deals';
import { countDishesUsing } from '../core/rank';
import type { Chain } from '../core/types';
import { RECIPES } from '../data/recipes';
import { useT } from '../i18n';
import { useApp } from '../state/store';
import ui from '../styles/ui.module.css';
import s from './Deals.module.css';

type StoreFilter = Chain | 'all';

export function Deals() {
  const t = useT();
  const prefs = useApp((state) => state.prefs);
  const [store, setStore] = useState<StoreFilter>('all');
  const deals = store === 'all' ? DEALS : DEALS.filter((deal) => deal.chain === store);
  const cta = store === 'all' ? '/dishes?from=deals' : `/dishes?from=deals&chain=${encodeURIComponent(store)}`;
  const date = DEALS_DATE
    ? new Intl.DateTimeFormat(t.locale, { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(DEALS_DATE))
    : null;

  // How many dishes each product appears in, for this person's allergies and diet.
  const dishes = useMemo(
    () => new Map(DEALS.map((deal) => [deal.id, countDishesUsing(deal.key, RECIPES, prefs)])),
    [prefs],
  );

  return (
    <>
      <main className={s.page}>
        <section className={s.head}>
          <h1 className={ui.pageTitle}>{t('deals.title')}</h1>
          <p className={ui.subtitle}>{date ? t('deals.subtitleReal', { date }) : t('deals.subtitle')}</p>
        </section>

        <div className={ui.chipScroller} role="group" aria-label={t('deals.stores')}>
          {(['all', ...CHAINS] as StoreFilter[]).map((option) => (
            <button
              key={option}
              type="button"
              className={ui.chip}
              aria-pressed={store === option}
              onClick={() => setStore(option)}
            >
              {option === 'all' ? t('deals.all') : option}
            </button>
          ))}
        </div>

        <ul className={cx(ui.rows, s.list)}>
          {deals.map((deal) => (
            <li key={deal.id}>
              <DealRow deal={deal} dishes={dishes.get(deal.id) ?? 0} />
            </li>
          ))}
        </ul>
      </main>
      <TabBar
        action={
          <Link to={cta} className={cx(ui.btn, ui.primary)}>
            {t('deals.cta')}
          </Link>
        }
      />
    </>
  );
}
