import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { ChefSheet } from '../components/ChefSheet';
import { PlateArt } from '../art/PlateArt';
import { ProductIcon } from '../art/ProductIcon';
import { BackButton } from '../components/BackButton';
import { cx } from '../components/cx';
import { Icon } from '../components/Icon';
import { toast } from '../components/Toast';
import { dealById, dealName, DEALS } from '../core/deals';
import { recipeIngredientName } from '../core/display';
import { fitsDiet, isFreeOf, pinDeal, recipeDiets } from '../core/match';
import { evaluateDish } from '../core/rank';
import { liveId, SPOONACULAR_URL } from '../core/spoonacular';
import type { Recipe } from '../core/types';
import { recipeById } from '../data/recipes';
import { useT } from '../i18n';
import { errorCode, type ApiErrorCode } from '../services/api';
import { cachedLiveRecipe, loadLiveRecipe, translateRecipe } from '../services/live';
import { useApp } from '../state/store';
import ui from '../styles/ui.module.css';
import s from './Recipe.module.css';

interface LiveRecipeState {
  id: string;
  recipe?: Recipe;
  error?: ApiErrorCode;
}

interface TranslationState {
  id: string;
  recipe?: Recipe;
  failed?: boolean;
}

/** Own recipes come from the bundle; live ones from memory, or the Worker after a reload. */
function useRecipe(id: string, lang: 'en' | 'es') {
  const own = recipeById(id);
  const isLive = liveId(id) !== null;
  const [live, setLive] = useState<LiveRecipeState>(() => ({ id, recipe: isLive ? cachedLiveRecipe(id) : undefined }));
  const [translation, setTranslation] = useState<TranslationState>({ id: '' });

  useEffect(() => {
    if (!isLive) return;
    const cached = cachedLiveRecipe(id);
    if (cached) {
      setLive({ id, recipe: cached });
      return;
    }
    let cancelled = false;
    setLive({ id });
    loadLiveRecipe(id)
      .then((recipe) => !cancelled && setLive({ id, recipe }))
      .catch((error) => !cancelled && setLive({ id, error: errorCode(error) }));
    return () => {
      cancelled = true;
    };
  }, [id, isLive]);

  const base = live.id === id ? live.recipe : undefined;
  useEffect(() => {
    if (!base || lang !== 'es' || base.steps.es.length) return;
    let cancelled = false;
    setTranslation({ id: base.id });
    translateRecipe(base)
      .then((recipe) => !cancelled && setTranslation({ id: base.id, recipe }))
      .catch(() => !cancelled && setTranslation({ id: base.id, failed: true }));
    return () => {
      cancelled = true;
    };
  }, [base, lang]);

  const translated = translation.id === id ? translation : undefined;
  return {
    recipe: own ?? translated?.recipe ?? base,
    loading: isLive && !base && !(live.id === id && live.error),
    error: live.id === id ? live.error : undefined,
    translating: lang === 'es' && Boolean(base) && !base?.steps.es.length && !translated?.recipe && !translated?.failed,
    translateFailed: lang === 'es' && Boolean(translated?.failed),
  };
}

export function RecipeScreen() {
  const t = useT();
  const { id = '' } = useParams();
  const { recipe, loading, error, translating, translateFailed } = useRecipe(id, t.lang);
  const items = useApp((state) => state.scan.items);
  const prefs = useApp((state) => state.prefs);
  const list = useApp((state) => state.list);
  const addToList = useApp((state) => state.addToList);
  const plus = useApp((state) => state.plus);
  const [brokenImage, setBrokenImage] = useState(false);
  const [chefOpen, setChefOpen] = useState(false);
  const [params, setParams] = useSearchParams();
  // Opened from one deal: that deal stays the one used for its ingredient.
  const pinned = dealById(params.get('deal'));

  // Coming back from the paywall with ?chef=1 opens the chat straight away.
  useEffect(() => {
    if (params.get('chef') !== '1' || !recipe) return;
    if (plus) setChefOpen(true);
    setParams(
      (current) => {
        const updated = new URLSearchParams(current);
        updated.delete('chef');
        return updated;
      },
      { replace: true },
    );
  }, [params, plus, recipe, setParams]);

  const dish = useMemo(
    () => (recipe ? evaluateDish(recipe, items.map((item) => item.key), pinDeal(DEALS, pinned)) : null),
    [recipe, items, pinned],
  );

  if (loading) {
    return (
      <main className={s.page} aria-busy="true">
        <div className={cx(s.hero, s.heroLoading)}>
          <BackButton fallback="/dishes" surface className={s.back} />
        </div>
        <p className={cx(ui.note, s.loadingText)} role="status">
          {t('live.loading')}
        </p>
      </main>
    );
  }

  if (!recipe || !dish) {
    return (
      <main className={s.page}>
        <div className={s.missing}>
          <BackButton fallback="/" />
          <p>{error ? t('live.recipeError') : t('recipe.notFound')}</p>
          <Link to="/" className={cx(ui.btn, ui.primary)}>
            {t('tabs.home')}
          </Link>
        </div>
      </main>
    );
  }

  const title = t.pick(recipe.title);
  const steps = recipe.steps[t.lang].length ? recipe.steps[t.lang] : recipe.steps.en;
  const { analysis, pricing } = dish;
  const toBuy = pricing.items;
  const have = analysis.used.length;
  const inList = toBuy.length > 0 && toBuy.every((item) => list.some((row) => row.key === item.key));
  const name = (key: string) => recipeIngredientName(recipe, key, t.lang);

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

  const chefLabel = (
    <>
      <Icon name="chef" size={20} />
      {t('recipe.aiChef')}
      <span className={ui.plusTag}>{t('common.plus')}</span>
    </>
  );

  return (
    <main className={s.page}>
      <div className={s.hero}>
        {recipe.image && !brokenImage ? (
          <img
            src={recipe.image}
            alt={t('recipe.plateAlt', { title })}
            className={s.photo}
            onError={() => setBrokenImage(true)}
          />
        ) : (
          <PlateArt recipe={recipe} size={176} label={t('recipe.plateAlt', { title })} />
        )}
        <BackButton fallback="/dishes" surface className={s.back} />
      </div>

      <section className={s.head}>
        <h1 className={ui.pageTitle}>{title}</h1>
        <ul className={s.facts}>
          <li>{t('common.minutes', { n: recipe.minutes })}</li>
          <li>{t.plural('common.servings', recipe.servings)}</li>
          {labels.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
        {translating && (
          <p className={cx(ui.note, s.translate)} role="status">
            {t('live.translating')}
          </p>
        )}
        {translateFailed && <p className={cx(ui.note, s.translate)}>{t('live.translateFailed')}</p>}
      </section>

      <section className={s.section} aria-labelledby="ingredients">
        <h2 id="ingredients" className={ui.sectionTitle}>
          {t('recipe.ingredients')}
        </h2>
        <p className={s.count}>{t('dishes.haveLabel', { have, total: have + toBuy.length })}</p>

        {have > 0 && (
          <>
            <h3 className={s.groupTitle}>{t('recipe.youHave')}</h3>
            <ul className={s.have}>
              {analysis.used.map((key) => (
                <li key={key}>
                  <Icon name="check" size={18} strokeWidth={2.6} className={s.tick} />
                  {name(key)}
                </li>
              ))}
            </ul>
          </>
        )}

        {toBuy.length > 0 && (
          <>
            <h3 className={s.groupTitle}>{t('recipe.toBuy')}</h3>
            <ul className={cx(ui.rows, s.buyList)}>
              {toBuy.map(({ key, deal }) => (
                <li key={key} className={s.buyRow}>
                  <span className={s.tile}>
                    <ProductIcon ingredientKey={key} size={30} />
                  </span>
                  <span className={s.buyName}>
                    <span className={s.product}>{deal ? dealName(deal, t.lang) : name(key)}</span>
                    <span className={s.chain}>
                      {deal ? deal.chain : t('recipe.notOnSale')}
                      {deal?.sponsored && <span className={ui.tag}>{t('common.sponsored')}</span>}
                      {deal?.demo && <span className={ui.tag}>{t('common.example')}</span>}
                    </span>
                  </span>
                  {deal && (
                    <span className={s.prices}>
                      <span className={ui.priceTag}>{t.price(deal.priceCents)}</span>
                      <s className={ui.oldPrice}>
                        <span className="visually-hidden">{t('common.was')} </span>
                        {t.price(deal.oldPriceCents)}
                      </s>
                    </span>
                  )}
                </li>
              ))}
            </ul>
            {pricing.onSale > 0 && (
              <div className={s.totals}>
                <p className={s.total}>
                  <span>{t('recipe.total')}</span>
                  <span className={s.totalValue}>{t.price(pricing.totalCents)}</span>
                </p>
                {pricing.savingsCents > 0 && (
                  <p className={cx(ui.save, s.saved)}>{t('recipe.youSave', { price: t.price(pricing.savingsCents) })}</p>
                )}
              </div>
            )}
          </>
        )}
        <p className={cx(ui.note, s.pantry)}>{t('recipe.pantryNote')}</p>
      </section>

      {steps.length > 0 && (
        <section className={s.section} aria-labelledby="steps">
          <h2 id="steps" className={ui.sectionTitle}>
            {t('recipe.steps')}
          </h2>
          <ol className={s.steps}>
            {steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </section>
      )}

      {recipe.source && (
        <p className={cx(ui.note, s.credit)}>
          <a href={recipe.source.url} target="_blank" rel="noreferrer">
            {t('recipe.original', { source: recipe.source.name })}
          </a>
          <a href={SPOONACULAR_URL} target="_blank" rel="noreferrer">
            {t('live.by')}
          </a>
        </p>
      )}

      <div className={s.tail} />

      <div className={ui.actionBar}>
        {plus ? (
          <button type="button" className={cx(ui.btn, ui.secondary, s.chef)} onClick={() => setChefOpen(true)}>
            {chefLabel}
          </button>
        ) : (
          <Link
            to={`/plus?next=${encodeURIComponent(`/recipe/${recipe.id}?chef=1`)}`}
            className={cx(ui.btn, ui.secondary, s.chef)}
          >
            {chefLabel}
          </Link>
        )}
        {toBuy.length === 0 ? (
          <p className={s.haveAll}>
            <Icon name="check" size={18} strokeWidth={2.6} />
            {t('recipe.haveAll')}
          </p>
        ) : inList ? (
          <Link to="/list" className={cx(ui.btn, ui.secondary, s.grow)}>
            <Icon name="check" size={18} strokeWidth={2.6} />
            {t('recipe.inList')}
          </Link>
        ) : (
          <button type="button" className={cx(ui.btn, ui.primary, s.grow)} onClick={add}>
            {t.plural('recipe.addToList', toBuy.length)}
          </button>
        )}
      </div>

      {plus && <ChefSheet open={chefOpen} onClose={() => setChefOpen(false)} recipe={recipe} have={analysis.used} />}
    </main>
  );
}
