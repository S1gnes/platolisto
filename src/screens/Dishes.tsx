import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { config } from '../config';
import { BackButton } from '../components/BackButton';
import { cx } from '../components/cx';
import { DishCard } from '../components/DishCard';
import { ingredientName } from '../core/catalog';
import { CHAINS, dealById, dealName, DEALS } from '../core/deals';
import { pinDeal } from '../core/match';
import { applyFilter, rankDishes, type DishFilter } from '../core/rank';
import { SPOONACULAR_URL } from '../core/spoonacular';
import type { Chain, Recipe } from '../core/types';
import { RECIPES } from '../data/recipes';
import { useT, type MessageKey } from '../i18n';
import { errorCode, liveEnabled, type ApiErrorCode } from '../services/api';
import { loadLiveDishes, translateTitles } from '../services/live';
import { useApp } from '../state/store';
import ui from '../styles/ui.module.css';
import s from './Dishes.module.css';

const FILTERS: DishFilter[] = ['best', 'budget', 'quick', 'nothing'];

const FALLBACK_NOTES: Partial<Record<ApiErrorCode | 'empty', MessageKey>> = {
  quota: 'live.fallback.quota',
  offline: 'live.fallback.offline',
  empty: 'live.fallback.empty',
};

function asChain(value: string | null): Chain | null {
  return CHAINS.find((chain) => chain === value) ?? null;
}

function asFilter(value: string | null): DishFilter {
  return FILTERS.find((filter) => filter === value) ?? 'best';
}

interface LiveState {
  key: string;
  loading: boolean;
  recipes: Recipe[] | null;
  error: ApiErrorCode | 'empty' | null;
}

export function Dishes() {
  const t = useT();
  const [params, setParams] = useSearchParams();
  const fromDeals = params.get('from') === 'deals';
  const chain = asChain(params.get('chain'));
  // Opened from one deal: only dishes with that product, priced with that deal.
  const deal = (fromDeals && dealById(params.get('deal'))) || null;
  const source = useApp((state) => state.scan.source);
  const items = useApp((state) => state.scan.items);
  const prefs = useApp((state) => state.prefs);
  // The filter lives in the URL so coming back from a recipe keeps it.
  const filter = asFilter(params.get('filter'));
  const setFilter = (next: DishFilter) =>
    setParams(
      (current) => {
        const updated = new URLSearchParams(current);
        if (next === 'best') updated.delete('filter');
        else updated.set('filter', next);
        return updated;
      },
      { replace: true, preventScrollReset: true },
    );

  const inventory = useMemo(() => items.map((item) => item.key), [items]);
  // Example fridges always stay offline; your own photo or typed list goes to the online recipe search.
  const wantsLive = liveEnabled() && !fromDeals && (source === 'photo' || source === 'typed') && inventory.length > 0;
  const liveKey = JSON.stringify([inventory, prefs.allergies, prefs.diet, t.lang]);
  const [live, setLive] = useState<LiveState>({ key: '', loading: false, recipes: null, error: null });

  useEffect(() => {
    if (!wantsLive) return;
    let cancelled = false;
    setLive({ key: liveKey, loading: true, recipes: null, error: null });
    loadLiveDishes(inventory, prefs)
      .then(async (recipes) => {
        if (cancelled) return;
        if (recipes.length === 0) {
          setLive({ key: liveKey, loading: false, recipes: null, error: 'empty' });
          return;
        }
        setLive({ key: liveKey, loading: false, recipes, error: null });
        if (t.lang !== 'es') return;
        const translated = await translateTitles(recipes).catch(() => recipes);
        if (!cancelled) setLive((state) => (state.key === liveKey ? { ...state, recipes: translated } : state));
      })
      .catch((error) => {
        if (!cancelled) setLive({ key: liveKey, loading: false, recipes: null, error: errorCode(error) });
      });
    return () => {
      cancelled = true;
    };
    // liveKey already captures inventory, allergies, diet and language.
  }, [wantsLive, liveKey]);

  const current = wantsLive && live.key === liveKey ? live : null;
  const loading = wantsLive && (!current || current.loading);
  const usingLive = Boolean(current?.recipes);
  const fallbackNote = current?.error ? (FALLBACK_NOTES[current.error] ?? 'live.fallback.error') : null;

  const ranked = useMemo(() => {
    const dishes = rankDishes({
      recipes: current?.recipes ?? RECIPES,
      inventory,
      prefs,
      deals: pinDeal(DEALS, deal),
      mode: fromDeals ? 'deals' : 'inventory',
      item: deal?.key,
    });
    return chain ? dishes.filter((dish) => dish.pricing.items.some((item) => item.deal?.chain === chain)) : dishes;
  }, [current?.recipes, inventory, prefs, fromDeals, chain, deal]);

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

  const title = loading
    ? t('live.loading')
    : needsInventory
      ? t('scan.countNone')
      : deal
        ? t.plural('dishes.itemTitle', visible.length, { item: ingredientName(deal.key, t.lang).toLowerCase() })
        : fromDeals
          ? t.plural('dishes.dealsTitle', visible.length)
          : t.plural('dishes.title', visible.length);

  const subtitle = deal
    ? t('dishes.itemSubtitle', { chain: deal.chain, product: dealName(deal, t.lang), price: t.price(deal.priceCents) })
    : chain
      ? t('dishes.chainSubtitle', { chain })
      : fromDeals
        ? t('dishes.dealsSubtitle')
        : t('dishes.subtitle');

  return (
    <main className={s.page}>
      <header className={s.header}>
        <BackButton fallback={deal || chain ? '/deals' : fromDeals ? '/' : '/scan'} />
      </header>

      <section className={s.intro}>
        <h1 className={ui.pageTitle}>{title}</h1>
        {!needsInventory && <p className={ui.subtitle}>{subtitle}</p>}
        {usingLive && (
          <a className={s.attribution} href={SPOONACULAR_URL} target="_blank" rel="noreferrer">
            {t('live.by')}
          </a>
        )}
      </section>

      {fallbackNote && (
        <p className={cx(ui.notice, s.notice)} role="status">
          {t(fallbackNote)}
        </p>
      )}

      {!needsInventory && !loading && ranked.length > 0 && (
        <div className={ui.chipScroller} role="group" aria-label={t('dishes.filters')}>
          {FILTERS.map((f) => (
            <button key={f} type="button" className={ui.chip} aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {filterLabel(f)}
            </button>
          ))}
        </div>
      )}
      {filter === 'budget' && !loading && <p className={cx(ui.note, s.estimate)}>{t('dishes.estimate')}</p>}

      {loading ? (
        <ul className={s.list} aria-busy="true" aria-label={t('live.loading')}>
          {[0, 1, 2].map((n) => (
            <li key={n} className={s.skeleton}>
              <span className={s.skeletonPhoto} />
              <span className={s.skeletonLines} />
            </li>
          ))}
        </ul>
      ) : needsInventory ? (
        <div className={s.empty}>
          <p>{t('dishes.noInventory')}</p>
          <Link to="/scan" className={cx(ui.btn, ui.primary)}>
            {t('dishes.scanCta')}
          </Link>
        </div>
      ) : ranked.length === 0 ? (
        <div className={s.empty}>
          <p>{fromDeals ? t('dishes.noDeals') : t('dishes.noResults')}</p>
          <Link to={fromDeals ? '/deals' : '/scan'} className={cx(ui.btn, ui.secondary)}>
            {fromDeals ? t('dishes.dealsCta') : t('dishes.scanCta')}
          </Link>
        </div>
      ) : visible.length === 0 ? (
        <div className={s.empty}>
          <p>{t('dishes.emptyFilter')}</p>
          <button type="button" className={cx(ui.btn, ui.secondary)} onClick={() => setFilter('best')}>
            {t('dishes.showAll')}
          </button>
        </div>
      ) : (
        <ul className={cx(ui.rows, s.list)}>
          {visible.map((dish) => (
            <li key={dish.recipe.id}>
              <DishCard dish={dish} dealId={deal?.id} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
