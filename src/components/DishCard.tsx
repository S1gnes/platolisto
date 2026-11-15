import { useState } from 'react';
import { Link } from 'react-router';
import { PlateArt } from '../art/PlateArt';
import type { RankedDish } from '../core/rank';
import { useT } from '../i18n';
import ui from '../styles/ui.module.css';
import { Icon } from './Icon';
import s from './DishCard.module.css';

interface Props {
  dish: RankedDish;
  /** Deal the list was opened from; the recipe keeps using it. */
  dealId?: string;
}

export function DishCard({ dish, dealId }: Props) {
  const t = useT();
  const [brokenImage, setBrokenImage] = useState(false);
  const { recipe, analysis, pricing } = dish;
  const have = analysis.used.length;
  const missing = analysis.missing.length;
  const total = have + missing;

  const buyText =
    pricing.onSale === 0
      ? t('dishes.toBuyNone', { n: missing })
      : pricing.notOnSale > 0
        ? t('dishes.toBuyMixed', { n: missing, sale: pricing.onSale })
        : t('dishes.toBuy', { n: missing });

  return (
    <Link to={`/recipe/${recipe.id}${dealId ? `?deal=${encodeURIComponent(dealId)}` : ''}`} className={s.card}>
      {recipe.image && !brokenImage ? (
        <img
          className={s.photo}
          src={recipe.image}
          alt=""
          width={88}
          height={88}
          loading="lazy"
          onError={() => setBrokenImage(true)}
        />
      ) : (
        <span className={s.plate}>
          <PlateArt recipe={recipe} size={80} />
        </span>
      )}
      <span className={s.body}>
        <span className={s.title}>{t.pick(recipe.title)}</span>
        <span className={s.meta}>{t.plural('dish.meta', recipe.servings, { min: recipe.minutes })}</span>
        <span className={s.have} role="img" aria-label={t('dishes.haveLabel', { have, total })}>
          {/* One segment per ingredient. */}
          <span className={s.segments} aria-hidden="true">
            {Array.from({ length: total }, (_, index) => (
              <span key={index} className={index < have ? s.on : s.off} />
            ))}
          </span>
          <span aria-hidden="true">{t('dishes.have', { have, total })}</span>
        </span>
        {missing === 0 ? (
          <span className={s.nothing}>
            <Icon name="check" size={16} strokeWidth={2.6} />
            {t('dishes.nothingToBuy')}
          </span>
        ) : (
          <span className={s.buy}>
            <span>{buyText}</span>
            {pricing.onSale > 0 && (
              <span className={ui.priceTag}>
                <span className="visually-hidden">{t('dishes.costLabel')} </span>
                {t.price(pricing.totalCents)}
              </span>
            )}
          </span>
        )}
        {pricing.sponsoredChains.length > 0 && (
          <span className={s.sponsored}>{t('common.sponsoredBy', { chain: pricing.sponsoredChains.join(', ') })}</span>
        )}
      </span>
    </Link>
  );
}
