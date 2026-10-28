import { useEffect } from 'react';
import { Link } from 'react-router';
import { create } from 'zustand';
import { useT } from '../i18n';
import { Icon } from './Icon';
import s from './Toast.module.css';

interface ToastState {
  id: number;
  message: string | null;
  action?: { label: string; to: string };
  show: (message: string, action?: { label: string; to: string }) => void;
  hide: () => void;
}

export const useToast = create<ToastState>((set) => ({
  id: 0,
  message: null,
  show: (message, action) => set((state) => ({ id: state.id + 1, message, action })),
  hide: () => set({ message: null, action: undefined }),
}));

export function toast(message: string, action?: { label: string; to: string }) {
  useToast.getState().show(message, action);
}

export function Toaster() {
  const t = useT();
  const { id, message, action, hide } = useToast();

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(hide, 4000);
    return () => window.clearTimeout(timer);
  }, [id, message, hide]);

  return (
    <div className={s.region} role="status" aria-live="polite">
      {message && (
        <div className={s.toast} key={id}>
          <span className={s.message}>{message}</span>
          {action && (
            <Link to={action.to} className={s.action} onClick={hide}>
              {action.label}
            </Link>
          )}
          <button type="button" className={s.dismiss} aria-label={t('toast.dismiss')} onClick={hide}>
            <Icon name="close" size={16} strokeWidth={2.4} />
          </button>
        </div>
      )}
    </div>
  );
}
