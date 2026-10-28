import { useEffect, useId, useState } from 'react';
import { itemName } from '../core/display';
import type { InventoryItem } from '../core/types';
import { useT } from '../i18n';
import { useApp } from '../state/store';
import ui from '../styles/ui.module.css';
import { cx } from './cx';
import { Icon } from './Icon';
import { Modal } from './Modal';
import s from './EditItemSheet.module.css';

/** Edit the quantity of a detected or typed ingredient. */
export function EditItemSheet({ item, onClose }: { item: InventoryItem | null; onClose: () => void }) {
  const t = useT();
  const update = useApp((state) => state.updateInventoryItem);
  const remove = useApp((state) => state.removeInventoryItem);
  const [qty, setQty] = useState('');
  const qtyId = useId();
  const hintId = useId();

  useEffect(() => {
    setQty(item?.qty ?? '');
  }, [item]);

  const name = item ? itemName(item, t.lang) : '';
  const count = /^\d+$/.test(qty.trim()) ? Number(qty.trim()) : null;
  const step = (delta: number) => setQty(String(Math.max(1, (count ?? (delta > 0 ? 0 : 2)) + delta)));

  return (
    <Modal open={item !== null} onClose={onClose} title={t('scan.edit', { name })}>
      <form
        className={s.form}
        onSubmit={(event) => {
          event.preventDefault();
          if (item) update(item.id, { qty: qty.trim() || undefined });
          onClose();
        }}
      >
        <label htmlFor={qtyId} className={ui.eyebrow}>
          {t('scan.qty')}
        </label>
        <div className={s.stepper}>
          <button type="button" className={ui.iconBtn} aria-label={t('scan.less')} onClick={() => step(-1)}>
            <Icon name="minus" size={20} strokeWidth={2.2} />
          </button>
          <input
            id={qtyId}
            className={s.input}
            value={qty}
            onChange={(event) => setQty(event.target.value)}
            aria-describedby={hintId}
            autoComplete="off"
          />
          <button type="button" className={ui.iconBtn} aria-label={t('scan.more')} onClick={() => step(1)}>
            <Icon name="plus" size={20} strokeWidth={2.2} />
          </button>
        </div>
        <p id={hintId} className={ui.note}>
          {t('scan.qtyHint')}
        </p>
        <div className={s.actions}>
          <button
            type="button"
            className={cx(ui.btn, ui.outline)}
            onClick={() => {
              if (item) remove(item.id);
              onClose();
            }}
          >
            {t('common.remove', { name })}
          </button>
          <button type="submit" className={cx(ui.btn, ui.primary)}>
            {t('common.save')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
