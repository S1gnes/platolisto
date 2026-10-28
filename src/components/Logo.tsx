import { useT } from '../i18n';
import s from './Logo.module.css';

export function Logo({ size = 24 }: { size?: number }) {
  const t = useT();
  return (
    <div className={s.logo} style={{ fontSize: size }} aria-label={t('brand.name')} role="img">
      <span aria-hidden="true">{t('brand.first')}</span>
      <span aria-hidden="true" className={s.accent}>
        {t('brand.second')}
      </span>
    </div>
  );
}
