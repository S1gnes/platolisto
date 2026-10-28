import { useNavigate } from 'react-router';
import { cx } from '../components/cx';
import { Logo } from '../components/Logo';
import { PrefsForm } from '../components/PrefsForm';
import { useT } from '../i18n';
import { useApp } from '../state/store';
import ui from '../styles/ui.module.css';
import s from './Onboarding.module.css';

export function Onboarding() {
  const t = useT();
  const navigate = useNavigate();
  const finish = useApp((state) => state.finishOnboarding);

  return (
    <main className={s.page}>
      <div className={s.content}>
        <Logo size={22} />
        <h1 className={s.title}>{t('prefs.title')}</h1>
        <p className={s.subtitle}>{t('prefs.subtitle')}</p>
        <div className={s.form}>
          <PrefsForm />
        </div>
      </div>
      <div className={ui.actionBar}>
        <button
          type="button"
          className={cx(ui.btn, ui.primary, s.start)}
          onClick={() => {
            finish();
            navigate('/', { replace: true });
          }}
        >
          {t('prefs.start')}
        </button>
      </div>
    </main>
  );
}
