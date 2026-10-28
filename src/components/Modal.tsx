import { useEffect, useId, useRef, type ReactNode } from 'react';
import { useT } from '../i18n';
import ui from '../styles/ui.module.css';
import { cx } from './cx';
import { Icon } from './Icon';
import s from './Modal.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Bottom sheet (default) or centered dialog. */
  variant?: 'sheet' | 'dialog';
  /** Hide the close button, e.g. for a required confirmation. */
  hideClose?: boolean;
  className?: string;
}

/** Native <dialog>: focus trap, Escape and inert background for free. */
export function Modal({ open, onClose, title, children, variant = 'sheet', hideClose, className }: Props) {
  const t = useT();
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={cx(s.modal, variant === 'sheet' ? s.sheet : s.dialog, className)}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current && !hideClose) onClose();
      }}
    >
      <div className={s.inner}>
        <div className={s.head}>
          <h2 id={titleId} className={s.title}>
            {title}
          </h2>
          {!hideClose && (
            <button type="button" className={ui.iconBtn} aria-label={t('common.close')} onClick={onClose}>
              <Icon name="close" size={20} strokeWidth={2.2} />
            </button>
          )}
        </div>
        {children}
      </div>
    </dialog>
  );
}
