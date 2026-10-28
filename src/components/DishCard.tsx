import { useState, type CSSProperties } from 'react';
import { Link } from 'react-router';
import { PlateArt } from '../art/PlateArt';
import type { RankedDish } from '../core/rank';
import { useT } from '../i18n';
import ui from '../styles/ui.module.css';
import { cx } from './cx';
import s from './DishCard.module.css';

export function DishCard({ dish }: { dish: RankedDish }) {
  const t = useT();
  const [brokenImage, setBrokenImage] = useState(false);
  const { recipe, analysis, pricing } = dish;
  const have = analysis.used.length;
  const total = have + analysis.missing.length;
  const title = t.pick(recipe.title);

  let priceTag: string | null = null;
  const single = pricing.onSale === 1 && pricing.notOnSale === 0 ? pricing.items.find((item) => item.deal)?.deal : null;
  if (single) {
    priceTag = t('dishes.oneDeal', {
      price: t.price(single.priceCents),
      chain: single.chain,
      discount: t('common.discount', { pct: single.discountPct }),
    });
  } else if (pricing.onSale > 0) {
    priceTag = t.plural('dishes.onSale', pricing.onSale, { price: t.price(pricing.totalCents) });
  }

  return (
    <Link to={`/recipe/${recipe.id}`} className={s.card}>
      {recipe.image && !brokenImage ? (
        <img
          className={s.photo}
          src={recipe.image}
          alt=""
          width={92}
          height={92}
          loading="lazy"
          onError={() => setBrokenImage(true)}
        />
      ) : (
        <PlateArt recipe={recipe} size={92} />
      )}
      <span className={s.body}>
        <span className={s.title}>{title}</span>
        <span className={s.meta}>
          {t('common.minutes', { n: recipe.minutes })} · {t.plural('common.servings', recipe.servings)}
        </span>
        <span className={s.have} aria-label={t('dishes.haveLabel', { have, total })} role="img">
          <span className={s.bar} style={{ '--have': `${total ? (have / total) * 100 : 0}%` } as CSSProperties} />
          <span aria-hidden="true">{t('dishes.have', { have, total })}</span>
        </span>
        {analysis.missing.length === 0 ? (
          <span className={s.nothing}>{t('dishes.nothingToBuy')}</span>
        ) : (
          <span className={s.tags}>
            {priceTag && <span className={s.priceTag}>{priceTag}</span>}
            {pricing.notOnSale > 0 && <span className={s.muted}>{t.plural('dishes.notOnSale', pricing.notOnSale)}</span>}
            {pricing.sponsoredChains.length > 0 && (
              <span className={cx(ui.sponsored, s.sponsored)}>
                {t('common.sponsoredBy', { chain: pricing.sponsoredChains.join(', ') })}
              </span>
            )}
          </span>
        )}
      </span>
    </Link>
  );
}
