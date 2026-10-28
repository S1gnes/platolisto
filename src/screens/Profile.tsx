import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { cx } from '../components/cx';
import { Icon } from '../components/Icon';
import { LangSwitch } from '../components/LangSwitch';
import { Modal } from '../components/Modal';
import { PrefsForm } from '../components/PrefsForm';
import { TabBar } from '../components/TabBar';
import { toast } from '../components/Toast';
import { useT } from '../i18n';
import { usePhoto } from '../state/photo';
import { useApp } from '../state/store';
import ui from '../styles/ui.module.css';
import s from './Profile.module.css';

const SOURCES = [
  { key: 'about.recipes', href: 'https://spoonacular.com/food-api' },
  { key: 'about.cocktails', href: 'https://www.thecocktaildb.com/' },
  { key: 'about.ai', href: 'https://ai.google.dev/' },
  { key: 'about.deals' },
  { key: 'about.own' },
] as const;

export function Profile() {
  const t = useT();
  const navigate = useNavigate();
  const plus = useApp((state) => state.plus);
  const setPlus = useApp((state) => state.setPlus);
  const resetDemo = useApp((state) => state.resetDemo);
  const [confirming, setConfirming] = useState(false);

  const reset = () => {
    resetDemo();
    usePhoto.getState().clear();
    setConfirming(false);
    toast(t('profile.resetDone'));
    navigate('/onboarding', { replace: true });
  };

  return (
    <>
      <main className={s.page}>
        <section className={s.head}>
          <h1 className={ui.pageTitle}>{t('profile.title')}</h1>
        </section>

        <section className={s.group} aria-labelledby="food-prefs">
          <h2 id="food-prefs" className={s.groupTitle}>
            {t('profile.food')}
          </h2>
          <div className={s.card}>
            <PrefsForm />
          </div>
        </section>

        <section className={s.group} aria-labelledby="app-settings">
          <h2 id="app-settings" className={s.groupTitle}>
            {t('profile.app')}
          </h2>
          <ul className={cx(s.card, s.rows)}>
            <li className={s.row}>
              <span className={s.rowLabel}>{t('lang.label')}</span>
              <LangSwitch />
            </li>
            <li className={s.row}>
              <span className={s.rowLabel}>
                {t('profile.plus')}
                <span className={s.rowValue}>{plus ? t('profile.plusActive') : t('profile.plusInactive')}</span>
              </span>
              {plus ? (
                <button type="button" className={ui.textBtn} onClick={() => setPlus(false)}>
                  {t('profile.plusOff')}
                </button>
              ) : (
                <Link to="/plus" className={ui.textBtn}>
                  {t('profile.plusSee')}
                </Link>
              )}
            </li>
            {plus && (
              <li>
                <Link to="/bartender" className={cx(s.row, s.linkRow)}>
                  <span className={s.rowLabel}>{t('profile.bartender')}</span>
                  <Icon name="next" size={20} />
                </Link>
              </li>
            )}
            <li>
              <button type="button" className={cx(s.row, s.linkRow, s.danger)} onClick={() => setConfirming(true)}>
                <span className={s.rowLabel}>{t('profile.reset')}</span>
                <Icon name="refresh" size={20} />
              </button>
            </li>
          </ul>
        </section>

        <section className={s.group} aria-labelledby="about">
          <h2 id="about" className={s.groupTitle}>
            {t('profile.about')}
          </h2>
          <div className={cx(s.card, s.about)}>
            <p>{t('about.disclaimer')}</p>
            <div>
              <h3 className={ui.eyebrow}>{t('about.sources')}</h3>
              <ul className={s.sources}>
                {SOURCES.map((source) => (
                  <li key={source.key}>
                    {'href' in source ? (
                      <a href={source.href} target="_blank" rel="noreferrer">
                        {t(source.key)}
                      </a>
                    ) : (
                      t(source.key)
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className={ui.eyebrow}>{t('about.privacy')}</h3>
              <p>
                {t('about.privacyPhotos')} {t('about.privacyFreeTier')}
              </p>
              <p className={s.spaced}>{t('about.privacyLocal')}</p>
            </div>
          </div>
        </section>
      </main>
      <TabBar />

      <Modal open={confirming} onClose={() => setConfirming(false)} title={t('profile.reset')} variant="dialog">
        <p className={s.confirmText}>{t('profile.resetConfirm')}</p>
        <div className={s.confirmActions}>
          <button type="button" className={cx(ui.btn, ui.outline)} onClick={() => setConfirming(false)}>
            {t('common.cancel')}
          </button>
          <button type="button" className={cx(ui.btn, ui.primary)} onClick={reset}>
            {t('profile.resetYes')}
          </button>
        </div>
      </Modal>
    </>
  );
}
