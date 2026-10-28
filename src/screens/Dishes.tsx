import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { config } from '../config';
import { BackButton } from '../components/BackButton';
import { cx } from '../components/cx';
import { DishCard } from '../components/DishCard';
import { DEALS } from '../core/deals';
import { applyFilter, rankDishes, type DishFilter } from '../core/rank';
import { CHAINS, type Chain } from '../core/types';
import { RECIPES } from '../data/recipes';
import { useT } from '../i18n';
import { useApp } from '../state/store';
import ui from '../styles/ui.module.css';
import s from './Dishes.module.css';

const FILTERS: DishFilter[] = ['best', 'budget', 'quick', 'nothing'];

function asChain(value: string | null): Chain | null {
  return CHAINS.find((chain) => chain === value) ?? null;
}

export function Dishes() {
  const t = useT();
  const [params] = useSearchParams();
  const fromDeals = params.get('from') === 'deals';
  const chain = asChain(params.get('chain'));
  const items = useApp((state) => state.scan.items);
  const prefs = useApp((state) => state.prefs);
  const [filter, setFilter] = useState<DishFilter>('best');

  const ranked = useMemo(() => {
    const dishes = rankDishes({
      recipes: RECIPES,
      inventory: items.map((item) => item.key),
      prefs,
      deals: DEALS,
      mode: fromDeals ? 'deals' : 'inventory',
    });
    return chain ? dishes.filter((dish) => dish.pricing.items.some((item) => item.deal?.chain === chain)) : dishes;
  }, [items, prefs, fromDeals, chain]);

  const visible = applyFilter(ranked, filter, prefs);
  const budget = t.priceShort(Math.round(prefs.budget * 100));
  const filterLabel = (f: DishFilter) =>
    f === 'best'
      ? t('filter.best')
      : f === 'budget'
        ? t('filter.budget', { price: budget })
        : f === 'quick'
          ? t('filter.quick', { n: config.quickMinutes })
          : t('filter.nothing');

  const needsInventory = !fromDeals && items.length === 0;

  return (
    <main className={s.page}>
      <header className={s.header}>
        <BackButton fallback={fromDeals ? '/' : '/scan'} />
        {!fromDeals && <span className={s.step}>{t('common.step', { n: 2, total: 2 })}</span>}
      </header>

      <section className={s.intro}>
        <h1 className={s.title}>
          {fromDeals ? t.plural('dishes.dealsTitle', visible.length) : t.plural('dishes.title', visible.length)}
        </h1>
        <p className={ui.subtitle}>
          {fromDeals ? t('dishes.dealsSubtitle') : t.plural('dishes.subtitle', items.length)}
        </p>
      </section>

      {!needsInventory && ranked.length > 0 && (
        <div className={ui.chipScroller} role="group" aria-label={t('dishes.filters')}>
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              className={cx(ui.chip, ui.chipInk)}
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
            >
              {filterLabel(f)}
            </button>
          ))}
        </div>
      )}
      {filter === 'budget' && <p className={cx(ui.note, s.estimate)}>{t('dishes.estimate')}</p>}

      {needsInventory ? (
        <div className={s.empty}>
          <p>{t('dishes.noInventory')}</p>
          <Link to="/scan" className={cx(ui.btn, ui.primary)}>
            {t('dishes.scanCta')}
          </Link>
        </div>
      ) : ranked.length === 0 ? (
        <div className={s.empty}>
          <p>{t('dishes.noResults')}</p>
          <Link to="/scan" className={cx(ui.btn, ui.outline)}>
            {t('dishes.scanCta')}
          </Link>
        </div>
      ) : visible.length === 0 ? (
        <div className={s.empty}>
          <p>{t('dishes.emptyFilter')}</p>
          <button type="button" className={cx(ui.btn, ui.outline)} onClick={() => setFilter('best')}>
            {t('dishes.showAll')}
          </button>
        </div>
      ) : (
        <ul className={s.list}>
          {visible.map((dish) => (
            <li key={dish.recipe.id}>
              <DishCard dish={dish} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
