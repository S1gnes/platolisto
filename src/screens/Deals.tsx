import { useState } from 'react';
import { Link } from 'react-router';
import { cx } from '../components/cx';
import { DealTile } from '../components/DealTile';
import { Icon } from '../components/Icon';
import { TabBar } from '../components/TabBar';
import { DEALS } from '../core/deals';
import { CHAINS, type Chain } from '../core/types';
import { useT } from '../i18n';
import ui from '../styles/ui.module.css';
import s from './Deals.module.css';

type StoreFilter = Chain | 'all';

export function Deals() {
  const t = useT();
  const [store, setStore] = useState<StoreFilter>('all');
  const deals = store === 'all' ? DEALS : DEALS.filter((deal) => deal.chain === store);
  const cta = store === 'all' ? '/dishes?from=deals' : `/dishes?from=deals&chain=${store}`;

  return (
    <>
      <main className={s.page}>
        <section className={s.head}>
          <div className={s.titleRow}>
            <h1 className={ui.pageTitle}>{t('deals.title')}</h1>
            <span className={s.demo}>{t('common.demoPrices')}</span>
          </div>
          <p className={ui.subtitle}>{t('deals.subtitle')}</p>
        </section>

        <div className={ui.chipScroller} role="group" aria-label={t('deals.stores')}>
          {(['all', ...CHAINS] as StoreFilter[]).map((option) => (
            <button
              key={option}
              type="button"
              className={cx(ui.chip, ui.chipInk)}
              aria-pressed={store === option}
              onClick={() => setStore(option)}
            >
              {option === 'all' ? t('deals.all') : option}
            </button>
          ))}
        </div>

        <ul className={s.grid}>
          {deals.map((deal) => (
            <li key={deal.id}>
              <DealTile deal={deal} />
            </li>
          ))}
        </ul>
      </main>
      <TabBar
        action={
          <Link to={cta} className={cx(ui.btn, ui.olive)}>
            {t('deals.cta')}
            <Icon name="arrowRight" size={20} strokeWidth={2} />
          </Link>
        }
      />
    </>
  );
}
