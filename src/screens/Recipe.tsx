import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { PlateArt } from '../art/PlateArt';
import { ProductIcon } from '../art/ProductIcon';
import { BackButton } from '../components/BackButton';
import { cx } from '../components/cx';
import { Icon } from '../components/Icon';
import { toast } from '../components/Toast';
import { ingredientName } from '../core/catalog';
import { DEALS, dealName } from '../core/deals';
import { fitsDiet, isFreeOf, recipeDiets } from '../core/match';
import { evaluateDish } from '../core/rank';
import { recipeById } from '../data/recipes';
import { useT } from '../i18n';
import { useApp } from '../state/store';
import ui from '../styles/ui.module.css';
import s from './Recipe.module.css';

export function RecipeScreen() {
  const t = useT();
  const { id = '' } = useParams();
  const recipe = recipeById(id);
  const items = useApp((state) => state.scan.items);
  const prefs = useApp((state) => state.prefs);
  const list = useApp((state) => state.list);
  const addToList = useApp((state) => state.addToList);
  const [step, setStep] = useState(0);

  const dish = useMemo(
    () => (recipe ? evaluateDish(recipe, items.map((item) => item.key), DEALS) : null),
    [recipe, items],
  );

  if (!recipe || !dish) {
    return (
      <main className={s.page}>
        <div className={s.missing}>
          <BackButton fallback="/" />
          <p>{t('recipe.notFound')}</p>
          <Link to="/" className={cx(ui.btn, ui.primary)}>
            {t('tabs.home')}
          </Link>
        </div>
      </main>
    );
  }

  const title = t.pick(recipe.title);
  const steps = recipe.steps[t.lang].length ? recipe.steps[t.lang] : recipe.steps.en;
  const current = Math.min(step, steps.length - 1);
  const { analysis, pricing } = dish;
  const toBuy = pricing.items;
  const inList = toBuy.length > 0 && toBuy.every((item) => list.some((row) => row.key === item.key));

  const labels = [
    ...prefs.allergies.filter((allergy) => isFreeOf(recipe, allergy)).map((allergy) => t(`free.${allergy}`)),
    ...(prefs.diet !== 'anything'
      ? fitsDiet(recipe, prefs.diet)
        ? [t(`dietLabel.${prefs.diet}`)]
        : []
      : recipeDiets(recipe).map((diet) => t(`dietLabel.${diet}`))),
  ];

  const add = () => {
    const added = addToList(
      toBuy.map((item) => ({ key: item.key, dealId: item.deal?.id ?? null, recipe: { id: recipe.id, title: recipe.title } })),
    );
    toast(t.plural('recipe.added', Math.max(added, toBuy.length)), { label: t('recipe.viewList'), to: '/list' });
  };

  return (
    <main className={s.page}>
      <div className={s.hero}>
        <svg aria-hidden="true" className={s.heroDeco} viewBox="0 0 390 236" preserveAspectRatio="xMidYMid slice">
          <circle cx="40" cy="30" r="70" fill="var(--hero-deco)" />
          <circle cx="360" cy="210" r="90" fill="var(--hero-deco)" />
        </svg>
        <div className={s.plate}>
          {recipe.image ? (
            <img src={recipe.image} alt={t('recipe.plateAlt', { title })} className={s.photo} />
          ) : (
            <PlateArt recipe={recipe} size={214} label={t('recipe.plateAlt', { title })} />
          )}
        </div>
        <BackButton fallback="/dishes" surface className={s.back} />
      </div>

      <section className={s.head}>
        <h1 className={s.title}>{title}</h1>
        <ul className={s.pills}>
          <li className={ui.pill}>{t('common.minutes', { n: recipe.minutes })}</li>
          <li className={ui.pill}>{t.plural('common.servings', recipe.servings)}</li>
          {labels.map((label) => (
            <li key={label} className={ui.pill}>
              {label}
            </li>
          ))}
        </ul>
      </section>

      {analysis.used.length > 0 && (
        <section className={s.section} aria-labelledby="you-have">
          <h2 id="you-have" className={ui.eyebrow}>
            {t('recipe.youHave', { n: analysis.used.length })}
          </h2>
          <ul className={s.have}>
            {analysis.used.map((key) => (
              <li key={key} className={s.haveChip}>
                <Icon name="check" size={13} strokeWidth={3} />
                {ingredientName(key, t.lang)}
              </li>
            ))}
          </ul>
        </section>
      )}
      <p className={cx(ui.note, s.pantry)}>{t('recipe.pantryNote')}</p>

      {toBuy.length > 0 && (
        <section className={s.section} aria-labelledby="to-buy">
          <div className={s.buyHead}>
            <h2 id="to-buy" className={cx(ui.eyebrow, s.noMargin)}>
              {t('recipe.toBuy', { n: toBuy.length })}
            </h2>
            {pricing.savingsCents > 0 && (
              <span className={s.save}>{t('recipe.youSave', { price: t.price(pricing.savingsCents) })}</span>
            )}
          </div>
          <ul className={s.buyList}>
            {toBuy.map(({ key, deal }) => (
              <li key={key} className={s.buyRow}>
                <span className={s.tile}>
                  <ProductIcon ingredientKey={key} size={30} />
                </span>
                <span className={s.buyName}>
                  <span className={s.product}>{deal ? dealName(deal, t.lang) : ingredientName(key, t.lang)}</span>
                  <span className={s.chain}>
                    {deal ? deal.chain : t('recipe.notOnSale')}
                    {deal?.sponsored && <span className={ui.sponsored}>{t('common.sponsored')}</span>}
                  </span>
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
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={s.section} aria-labelledby="steps">
        <h2 id="steps" className="visually-hidden">
          {t('recipe.steps')}
        </h2>
        <div className={s.stepHead}>
          <h3 className={cx(ui.eyebrow, s.noMargin)}>{t('common.step', { n: current + 1, total: steps.length })}</h3>
          <div className={s.stepNav}>
            <button
              type="button"
              className={ui.iconBtn}
              aria-label={t('recipe.prevStep')}
              disabled={current === 0}
              onClick={() => setStep(current - 1)}
            >
              <Icon name="back" size={20} strokeWidth={2} />
            </button>
            <button
              type="button"
              className={ui.iconBtn}
              aria-label={t('recipe.nextStep')}
              disabled={current === steps.length - 1}
              onClick={() => setStep(current + 1)}
            >
              <Icon name="next" size={20} strokeWidth={2} />
            </button>
          </div>
        </div>
        <p className={s.stepText} aria-live="polite">
          {steps[current]}
        </p>
      </section>

      <div className={ui.actionBar}>
        {toBuy.length === 0 ? (
          <p className={s.haveAll}>{t('recipe.haveAll')}</p>
        ) : inList ? (
          <Link to="/list" className={cx(ui.btn, ui.outline, s.grow)}>
            {t('recipe.inList')}
          </Link>
        ) : (
          <button type="button" className={cx(ui.btn, ui.primary, s.grow)} onClick={add}>
            {pricing.onSale > 0
              ? t.plural('recipe.addToList', toBuy.length, { price: t.price(pricing.totalCents) })
              : t.plural('recipe.addToListNoPrice', toBuy.length)}
          </button>
        )}
        {/* The AI chef chat itself arrives with Plus (milestone 4); until then this opens the paywall. */}
        <Link to={`/plus?next=/recipe/${recipe.id}`} className={cx(ui.btn, ui.dark, s.chef)}>
          <Icon name="chef" size={20} />
          {t('recipe.aiChef')}
          <span className={ui.plusBadge}>{t('common.plusBadge')}</span>
        </Link>
      </div>
    </main>
  );
}
