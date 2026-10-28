import { DrinkArt } from '../art/DrinkArt';
import { BackButton } from '../components/BackButton';
import { cx } from '../components/cx';
import { Icon } from '../components/Icon';
import { BAR_DRINKS, BAR_ITEMS } from '../data/barMock';
import { useT } from '../i18n';
import s from './Bartender.module.css';

export function Bartender() {
  const t = useT();
  const ready = BAR_DRINKS.filter((drink) => drink.have === drink.total);
  const almost = BAR_DRINKS.filter((drink) => drink.have < drink.total);

  return (
    <main className={s.page}>
      <header className={s.header}>
        <BackButton fallback="/plus" />
        <span className={s.plus}>{t('common.plusBadge')}</span>
        <span className={s.age}>{t('bar.ageBadge')}</span>
      </header>

      <section className={s.intro}>
        <h1 className={s.title}>{t('bar.title')}</h1>
        <p className={s.subtitle}>{t('bar.subtitle')}</p>
      </section>

      <section className={s.section} aria-labelledby="your-bar">
        <div className={s.barHead}>
          <h2 id="your-bar" className={s.eyebrow}>
            {t('bar.yourBar', { n: BAR_ITEMS.length })}
          </h2>
          <button type="button" className={s.scan}>
            <Icon name="camera" size={18} strokeWidth={2} />
            {t('bar.scan')}
          </button>
        </div>
        <ul className={s.chips}>
          {BAR_ITEMS.map((item) => (
            <li key={item.en} className={s.chip}>
              {t.pick(item)}
            </li>
          ))}
          <li>
            <button type="button" className={s.add}>
              <Icon name="plus" size={14} strokeWidth={2.4} />
              {t('bar.add')}
            </button>
          </li>
        </ul>
      </section>

      <section className={s.section} aria-labelledby="can-mix">
        <h2 id="can-mix" className={s.mixTitle}>
          {t.plural('bar.canMix', ready.length)}
        </h2>
        <ul className={s.drinks}>
          {[...ready, ...almost].map((drink) => {
            const full = drink.have === drink.total;
            return (
              <li key={drink.id} className={cx(s.drink, !full && s.almost)}>
                <DrinkArt style={drink.style} muted={!full} />
                <div className={s.drinkText}>
                  <div className={s.drinkName}>{t.pick(drink.name)}</div>
                  <div className={s.drinkMeta}>
                    {full
                      ? `${t.pick(drink.summary)} · ${t('common.minutes', { n: drink.minutes })}`
                      : t('bar.missing', { items: drink.missing ? t.pick(drink.missing) : '' })}
                  </div>
                </div>
                <span
                  className={full ? s.coverage : s.coverageAlmost}
                  role="img"
                  aria-label={t('bar.coverageLabel', { have: drink.have, total: drink.total })}
                >
                  {t('bar.coverage', { have: drink.have, total: drink.total })}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <p className={s.footer}>{t('bar.footer')}</p>
    </main>
  );
}
