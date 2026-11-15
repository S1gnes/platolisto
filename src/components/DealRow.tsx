import { Link } from 'react-router';
import { ProductIcon } from '../art/ProductIcon';
import { dealName } from '../core/deals';
import type { Deal } from '../core/types';
import { useT } from '../i18n';
import ui from '../styles/ui.module.css';
import { cx } from './cx';
import { Icon } from './Icon';
import s from './DealRow.module.css';

/** Where a deal leads: the dishes that use the product. */
export function dealDishesPath(deal: Deal): string {
  return `/dishes?from=deals&deal=${encodeURIComponent(deal.id)}`;
}

function Prices({ deal }: { deal: Deal }) {
  const t = useT();
  return (
    <>
      <span className={ui.priceTag}>{t.price(deal.priceCents)}</span>
      <span className={s.was}>
        <s className={ui.oldPrice}>
          <span className="visually-hidden">{t('common.was')} </span>
          {t.price(deal.oldPriceCents)}
        </s>
        <span className={ui.discount}>{t('common.discount', { pct: deal.discountPct })}</span>
      </span>
    </>
  );
}

function Labels({ deal }: { deal: Deal }) {
  const t = useT();
  return (
    <span className={s.store}>
      {deal.chain}
      {deal.sponsored && <span className={ui.tag}>{t('common.sponsored')}</span>}
      {deal.demo && <span className={ui.tag}>{t('common.example')}</span>}
    </span>
  );
}

interface Props {
  deal: Deal;
  /** Dishes this person can cook with the product; with none, the deal is not a link. */
  dishes: number;
}

/** One line of the deals list. */
export function DealRow({ deal, dishes }: Props) {
  const t = useT();
  const content = (
    <>
      <span className={s.icon}>
        <ProductIcon ingredientKey={deal.key} size={32} />
      </span>
      <span className={s.text}>
        <span className={s.name}>{dealName(deal, t.lang)}</span>
        <Labels deal={deal} />
        {dishes > 0 && (
          <span className={s.dishes}>
            {t.plural('deals.dishes', dishes)}
            <Icon name="next" size={14} strokeWidth={2.2} />
          </span>
        )}
      </span>
      <span className={s.prices}>
        <Prices deal={deal} />
      </span>
    </>
  );
  return dishes > 0 ? (
    <Link to={dealDishesPath(deal)} className={cx(s.row, s.link)}>
      {content}
    </Link>
  ) : (
    <div className={s.row}>{content}</div>
  );
}
