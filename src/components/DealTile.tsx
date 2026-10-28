import { ProductIcon } from '../art/ProductIcon';
import { dealName } from '../core/deals';
import type { Deal } from '../core/types';
import { useT } from '../i18n';
import ui from '../styles/ui.module.css';
import s from './DealTile.module.css';

export function DealTile({ deal }: { deal: Deal }) {
  const t = useT();
  return (
    <article className={s.tile}>
      <div className={s.top}>
        <div className={s.icon}>
          <ProductIcon ingredientKey={deal.key} />
        </div>
        <span className={ui.discount}>{t('common.discount', { pct: deal.discountPct })}</span>
      </div>
      <div className={s.chain}>{deal.chain}</div>
      {deal.sponsored && <span className={ui.sponsored}>{t('common.sponsored')}</span>}
      <h3 className={s.name}>{dealName(deal, t.lang)}</h3>
      <p className={s.prices}>
        <span className={s.price}>{t.price(deal.priceCents)}</span>
        <s className={ui.oldPrice}>
          <span className="visually-hidden">{t('common.was')} </span>
          {t.price(deal.oldPriceCents)}
        </s>
      </p>
    </article>
  );
}
