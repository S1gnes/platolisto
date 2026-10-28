import { useLocation, useNavigate } from 'react-router';
import { useT } from '../i18n';
import ui from '../styles/ui.module.css';
import { cx } from './cx';
import { Icon } from './Icon';

/** Go back inside the app; deep links with no history fall back to a parent screen. */
export function useBack(fallback: string): () => void {
  const navigate = useNavigate();
  const location = useLocation();
  return () => {
    if (location.key !== 'default') navigate(-1);
    else navigate(fallback, { replace: true });
  };
}

interface Props {
  fallback: string;
  surface?: boolean;
  className?: string;
}

export function BackButton({ fallback, surface, className }: Props) {
  const t = useT();
  const back = useBack(fallback);
  return (
    <button
      type="button"
      className={cx(ui.iconBtn, surface && ui.iconBtnSurface, className)}
      aria-label={t('common.back')}
      onClick={back}
    >
      <Icon name="back" size={22} strokeWidth={2} />
    </button>
  );
}
