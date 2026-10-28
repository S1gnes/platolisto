import { useMemo } from 'react';
import { Link, Navigate } from 'react-router';
import { BackButton } from '../components/BackButton';
import { cx } from '../components/cx';
import { DishCard } from '../components/DishCard';
import { toast } from '../components/Toast';
import { DEALS } from '../core/deals';
import { buildWeeklyPlan } from '../core/plan';
import { RECIPES } from '../data/recipes';
import { useT } from '../i18n';
import { useApp } from '../state/store';
import ui from '../styles/ui.module.css';
import s from './WeeklyPlan.module.css';

export function WeeklyPlan() {
  const plus = useApp((state) => state.plus);
  if (!plus) return <Navigate to={`/plus?next=${encodeURIComponent('/plan')}`} replace />;
  return <PlanScreen />;
}

function PlanScreen() {
  const t = useT();
  const items = useApp((state) => state.scan.items);
  const prefs = useApp((state) => state.prefs);
  const list = useApp((state) => state.list);
  const addToList = useApp((state) => state.addToList);

  const plan = useMemo(
    () => buildWeeklyPlan({ recipes: RECIPES, inventory: items.map((item) => item.key), prefs, deals: DEALS }),
    [items, prefs],
  );

  // Monday first; 1 January 2024 was a Monday.
  const weekdays = useMemo(() => {
    const format = new Intl.DateTimeFormat(t.locale, { weekday: 'long', timeZone: 'UTC' });
    return Array.from({ length: 7 }, (_, day) => {
      const name = format.format(new Date(Date.UTC(2024, 0, 1 + day, 12)));
      return name.charAt(0).toUpperCase() + name.slice(1);
    });
  }, [t.locale]);

  const toBuy = plan.shopping.items;
  const inList = toBuy.length > 0 && toBuy.every((item) => list.some((row) => row.key === item.key));

  const addAll = () => {
    addToList(
      plan.dinners.flatMap((dish) =>
        dish.pricing.items.map((item) => ({
          key: item.key,
          dealId: item.deal?.id ?? null,
          recipe: { id: dish.recipe.id, title: dish.recipe.title },
        })),
      ),
    );
    toast(t.plural('recipe.added', toBuy.length), { label: t('recipe.viewList'), to: '/list' });
  };

  return (
    <main className={s.page}>
      <header className={s.header}>
        <BackButton fallback="/plus" />
        <span className={ui.plusBadge}>{t('common.plusBadge')}</span>
      </header>

      <section className={s.intro}>
        <h1 className={ui.pageTitle}>{t('plan.title')}</h1>
        <p className={ui.subtitle}>{t('plan.subtitle')}</p>
      </section>

      <div className={s.summary}>
        <div>
          <div className={s.summaryLabel}>{t('plan.total')}</div>
          <div className={s.total}>{t.price(plan.shopping.totalCents)}</div>
          <div className={s.summaryLabel}>{t('plan.perDinner', { price: t.price(plan.perDinnerCents) })}</div>
        </div>
        <div className={s.saveBox}>
          <div className={s.summaryLabel}>{t('list.youSave')}</div>
          <div className={s.saved}>{t.price(plan.shopping.savingsCents)}</div>
        </div>
      </div>

      {plan.dinners.length < 7 && <p className={cx(ui.note, s.short)}>{t.plural('plan.short', plan.dinners.length)}</p>}

      <ol className={s.days}>
        {plan.dinners.map((dish, index) => (
          <li key={dish.recipe.id}>
            <h2 className={ui.eyebrow}>{weekdays[index]}</h2>
            <DishCard dish={dish} />
          </li>
        ))}
      </ol>

      <div className={ui.actionBar}>
        {toBuy.length === 0 ? (
          <p className={s.haveAll}>{t('plan.nothingToBuy')}</p>
        ) : inList ? (
          <Link to="/list" className={cx(ui.btn, ui.outline, s.grow)}>
            {t('recipe.inList')}
          </Link>
        ) : (
          <button type="button" className={cx(ui.btn, ui.primary, s.grow)} onClick={addAll}>
            {t.plural('plan.addAll', toBuy.length, { price: t.price(plan.shopping.totalCents) })}
          </button>
        )}
      </div>
    </main>
  );
}
