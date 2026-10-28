import { useT } from '../i18n';
import { useApp } from '../state/store';
import type { Lang } from '../core/types';
import s from './LangSwitch.module.css';

const LANGS: { code: Lang; short: string }[] = [
  { code: 'en', short: 'EN' },
  { code: 'es', short: 'ES' },
];

export function LangSwitch() {
  const t = useT();
  const lang = useApp((state) => state.lang);
  const setLang = useApp((state) => state.setLang);
  return (
    <div className={s.switch} role="group" aria-label={t('lang.label')}>
      {LANGS.map(({ code, short }) => (
        <button
          key={code}
          type="button"
          lang={code}
          className={s.option}
          aria-pressed={lang === code}
          aria-label={t(code === 'en' ? 'lang.en' : 'lang.es')}
          onClick={() => setLang(code)}
        >
          {short}
        </button>
      ))}
    </div>
  );
}
