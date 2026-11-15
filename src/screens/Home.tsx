import { useMemo } from 'react';
import { Link, Navigate } from 'react-router';
import { cx } from '../components/cx';
import { DealRow } from '../components/DealRow';
import { Icon, type IconName } from '../components/Icon';
import { LangSwitch } from '../components/LangSwitch';
import { Logo } from '../components/Logo';
import { TabBar } from '../components/TabBar';
import { DEALS } from '../core/deals';
import { itemName } from '../core/display';
import { countDishesUsing } from '../core/rank';
import { RECIPES } from '../data/recipes';
import { useT, type MessageKey } from '../i18n';
import { useApp } from '../state/store';
import ui from '../styles/ui.module.css';
import s from './Home.module.css';

const TOP_DEALS = 3;
const PREVIEW_NAMES = 3;

interface Start {
  to: string;
  icon: IconName;
  title: MessageKey;
  text: MessageKey;
}

const STARTS: Start[] = [
  { to: '/scan', icon: 'camera', title: 'home.photo', text: 'home.photoText' },
  { to: '/scan?mode=type', icon: 'pencil', title: 'home.type', text: 'home.typeText' },
  { to: '/dishes?from=deals', icon: 'tag', title: 'home.deals', text: 'home.dealsText' },
];

function StartLink({ start, main }: { start: Start; main?: boolean }) {
  const t = useT();
  return (
    <Link to={start.to} className={cx(s.start, main && s.startMain)}>
      <span className={s.startIcon}>
        <Icon name={start.icon} />
      </span>
      <span className={s.startText}>
        <span className={s.startTitle}>{t(start.title)}</span>
        <span className={s.startSub}>{t(start.text)}</span>
      </span>
      <Icon name="next" size={20} className={s.chevron} />
    </Link>
  );
}

export function Home() {
  const t = useT();
  const onboarded = useApp((state) => state.onboarded);
  const scan = useApp((state) => state.scan);
  const prefs = useApp((state) => state.prefs);

  // The biggest discounts on products you can actually cook with.
  const topDeals = useMemo(
    () =>
      DEALS.map((deal) => ({ deal, dishes: countDishesUsing(deal.key, RECIPES, prefs) }))
        .filter((entry) => entry.dishes > 0)
        .sort((a, b) => b.deal.discountPct - a.deal.discountPct)
        .slice(0, TOP_DEALS),
    [prefs],
  );

  if (!onboarded) return <Navigate to="/onboarding" replace />;

  const saved = scan.items.length;
  const names = scan.items.slice(0, PREVIEW_NAMES).map((item) => itemName(item, t.lang)).join(', ');
  const preview = saved > PREVIEW_NAMES ? t('home.preview', { names, n: saved - PREVIEW_NAMES }) : names;
  const fromExample = scan.source === 'student' || scan.source === 'market' || scan.source === 'empty';

  return (
    <>
      <main className={s.page}>
        <header className={s.header}>
          <Logo />
          <LangSwitch />
        </header>

        <h1 className={cx(ui.pageTitle, s.title)}>{t('home.title')}</h1>

        {saved > 0 && (
          <section className={s.saved} aria-labelledby="saved-title">
            <h2 id="saved-title" className={ui.sectionTitle}>
              {t('home.saved')}
            </h2>
            <p className={s.savedCount}>
              {fromExample ? t.plural('home.savedExample', saved) : t.plural('scan.count', saved)}
            </p>
            <p className={ui.note}>{preview}</p>
            <div className={s.savedActions}>
              <Link to="/dishes" className={cx(ui.btn, ui.primary)}>
                {t('home.seeDishes')}
              </Link>
              <Link to={scan.source === 'typed' ? '/scan?mode=type' : '/scan'} className={cx(ui.btn, ui.secondary)}>
                {t('home.editItems')}
              </Link>
            </div>
          </section>
        )}

        {/* With nothing saved yet, the photo is the main way in. */}
        {saved === 0 && (
          <div className={s.mainStart}>
            <StartLink start={STARTS[0]} main />
          </div>
        )}
        <ul className={cx(ui.rows, s.starts)}>
          {STARTS.slice(saved === 0 ? 1 : 0).map((start) => (
            <li key={start.to}>
              <StartLink start={start} />
            </li>
          ))}
        </ul>

        {topDeals.length > 0 && (
          <section className={s.deals} aria-labelledby="home-deals">
            <div className={s.dealsHead}>
              <h2 id="home-deals" className={ui.sectionTitle}>
                {t('home.dealsTitle')}
              </h2>
              <Link to="/deals" className={ui.textBtn}>
                {t('home.seeAll')}
              </Link>
            </div>
            <ul className={cx(ui.rows, s.dealList)}>
              {topDeals.map(({ deal, dishes }) => (
                <li key={deal.id}>
                  <DealRow deal={deal} dishes={dishes} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <TabBar />
    </>
  );
}
