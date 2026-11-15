import { useT } from '../i18n';
import s from './Logo.module.css';

/** A plate with a tick ("plato listo") on the price-label yellow. */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#FFD60A" />
      <circle cx="16" cy="16" r="9.5" fill="none" stroke="#17191A" strokeWidth="2.2" />
      <path
        d="M11.5 16.4l3.1 3.1 6-6.6"
        fill="none"
        stroke="#17191A"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo() {
  const t = useT();
  return (
    <div className={s.logo} aria-label={t('brand.name')} role="img">
      <LogoMark />
      <span aria-hidden="true">{t('brand.name')}</span>
    </div>
  );
}
