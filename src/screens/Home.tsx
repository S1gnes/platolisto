import { Link, Navigate } from 'react-router';
import { DealTile } from '../components/DealTile';
import { Icon } from '../components/Icon';
import { LangSwitch } from '../components/LangSwitch';
import { Logo } from '../components/Logo';
import { TabBar } from '../components/TabBar';
import { DEALS } from '../core/deals';
import { useT, type MessageKey } from '../i18n';
import { useApp } from '../state/store';
import s from './Home.module.css';

const HOT_DEALS = DEALS.slice(0, 8);

function greetingKey(hour: number): MessageKey {
  if (hour >= 5 && hour < 12) return 'home.greeting.morning';
  if (hour >= 12 && hour < 20) return 'home.greeting.afternoon';
  return 'home.greeting.evening';
}

export function Home() {
  const t = useT();
  const onboarded = useApp((state) => state.onboarded);
  if (!onboarded) return <Navigate to="/onboarding" replace />;

  return (
    <>
      <main className={s.page}>
        <header className={s.header}>
          <Logo size={24} />
          <LangSwitch />
        </header>

        <section className={s.intro}>
          <p className={s.greeting}>{t(greetingKey(new Date().getHours()))}</p>
          <h1 className={s.title}>{t('home.title')}</h1>
        </section>

        <div className={s.actions}>
          <Link to="/scan" className={s.scan}>
            <svg aria-hidden="true" width="150" height="150" viewBox="0 0 150 150" className={s.scanDeco}>
              <circle cx="75" cy="75" r="73" fill="none" stroke="var(--primary-deco)" strokeWidth="2" />
              <circle cx="75" cy="75" r="52" fill="none" stroke="var(--primary-deco)" strokeWidth="2" />
              <circle cx="75" cy="75" r="31" fill="var(--primary-deco-fill)" />
            </svg>
            <span className={s.scanIcon}>
              <Icon name="camera" size={26} />
            </span>
            <span className={s.scanText}>
              <span className={s.scanTitle}>{t('home.scanTitle')}</span>
              <span className={s.scanSub}>{t('home.scanText')}</span>
            </span>
          </Link>

          <div className={s.tiles}>
            <Link to="/dishes?from=deals" className={`${s.tile} ${s.dealsTile}`}>
              <Icon name="tag" />
              <span>{t('home.deals')}</span>
            </Link>
            <Link to="/scan?mode=type" className={`${s.tile} ${s.typeTile}`}>
              <Icon name="pencil" />
              <span>{t('home.type')}</span>
            </Link>
          </div>
        </div>

        <section className={s.hot} aria-labelledby="hot-deals">
          <div className={s.hotHead}>
            <h2 id="hot-deals" className={s.hotTitle}>
              {t('home.hotDeals')}
            </h2>
            <Link to="/deals" className={s.seeAll}>
              {t('home.seeAll')}
            </Link>
          </div>
          <ul className={s.strip} tabIndex={0} aria-labelledby="hot-deals">
            {HOT_DEALS.map((deal) => (
              <li key={deal.id}>
                <DealTile deal={deal} />
              </li>
            ))}
          </ul>
        </section>
      </main>
      <TabBar />
    </>
  );
}
