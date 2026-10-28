import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { FridgeArt, PresetThumb } from '../art/FridgeArt';
import { AddIngredient } from '../components/AddIngredient';
import { BackButton } from '../components/BackButton';
import { cx } from '../components/cx';
import { EditItemSheet } from '../components/EditItemSheet';
import { Icon } from '../components/Icon';
import { catalogEntry } from '../core/catalog';
import { itemName, qtySuffix } from '../core/display';
import { normalizeIngredient } from '../core/normalize';
import { detectionsToItems, itemId, PRESET_IDS, presetById } from '../core/presets';
import { suggestIngredients } from '../core/suggest';
import type { InventoryItem, PresetId, ScanSource } from '../core/types';
import { useT, type MessageKey } from '../i18n';
import { detectItems, errorCode, liveEnabled, type ApiErrorCode } from '../services/api';
import { prepareImage } from '../services/image';
import { usePhoto } from '../state/photo';
import { useApp } from '../state/store';
import ui from '../styles/ui.module.css';
import s from './Scan.module.css';

const SCAN_EFFECT_MS = 1100;

const PHOTO_ERRORS: Partial<Record<ApiErrorCode, MessageKey>> = {
  not_configured: 'scan.photoUnavailable',
  offline: 'scan.error.offline',
  rate_limited: 'scan.error.busy',
  quota: 'scan.error.busy',
  blocked: 'scan.error.blocked',
};

function isPreset(source: ScanSource | null): source is PresetId {
  return source === 'student' || source === 'market' || source === 'empty';
}

export function Scan() {
  const t = useT();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const typeMode = params.get('mode') === 'type';
  const scan = useApp((state) => state.scan);
  const setScan = useApp((state) => state.setScan);
  const addItem = useApp((state) => state.addInventoryItem);
  const removeItem = useApp((state) => state.removeInventoryItem);
  const photo = usePhoto();
  // A counter instead of a boolean so picking another preset mid-scan restarts the effect.
  const [scanRun, setScanRun] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  // Bumped on every new photo or preset, so a late answer for an old photo is ignored.
  const request = useRef(0);
  const items = scan.items;

  const choosePreset = useCallback(
    (id: PresetId) => {
      request.current += 1;
      setAnalysing(false);
      usePhoto.getState().clear();
      setNotice(null);
      setScan(id, detectionsToItems(presetById(id).detections));
      setScanning(true);
      setScanRun((run) => run + 1);
    },
    [setScan],
  );

  useEffect(() => {
    if (!scanning) return;
    const timer = window.setTimeout(() => setScanning(false), SCAN_EFFECT_MS);
    return () => window.clearTimeout(timer);
  }, [scanning, scanRun]);

  // First visit: start with the student fridge so the demo flow is one tap away.
  useEffect(() => {
    if (!typeMode && !useApp.getState().scan.source) choosePreset('student');
  }, [typeMode, choosePreset]);

  const onPhoto = async (file: File | undefined) => {
    if (!file) return;
    const current = ++request.current;
    setScanning(false);
    setNotice(null);
    photo.set(file);
    setScan('photo', []);
    if (!liveEnabled()) {
      setNotice(t('scan.photoUnavailable'));
      return;
    }
    setAnalysing(true);
    try {
      const { base64, mimeType } = await prepareImage(file);
      const detections = await detectItems(base64, mimeType, 'fridge');
      if (current !== request.current) return;
      const found = detectionsToItems(detections);
      setScan('photo', found);
      if (found.length === 0) setNotice(t('scan.nothingFound'));
    } catch (error) {
      if (current === request.current) setNotice(t(PHOTO_ERRORS[errorCode(error)] ?? 'scan.error.failed'));
    } finally {
      if (current === request.current) setAnalysing(false);
    }
  };

  const suggest = useCallback(
    (query: string) => suggestIngredients(query, t.lang, items.map((item) => item.key)),
    [t.lang, items],
  );

  const onAdd = (text: string) => {
    const key = normalizeIngredient(text);
    if (!key) return;
    addItem({ id: itemId(), key, label: catalogEntry(key) ? undefined : { en: text, es: text } });
  };

  const preset = isPreset(scan.source) ? presetById(scan.source) : null;
  const showPhoto = scan.source === 'photo' && photo.url !== null;
  const aspect = showPhoto ? `${photo.width} / ${photo.height}` : `${preset?.width ?? 350} / ${preset?.height ?? 270}`;
  const busy = scanning || analysing;
  const boxes = busy ? [] : items.filter((item) => item.box);
  const photoLost = scan.source === 'photo' && !showPhoto && !notice;
  const detected = !typeMode && (isPreset(scan.source) || scan.source === 'photo');

  return (
    <main className={s.page}>
      <header className={s.header}>
        <BackButton fallback="/" />
        <h1 className={s.title}>{typeMode ? t('scan.typeTitle') : t('scan.title')}</h1>
        <span className={s.step}>{t('common.step', { n: 1, total: 2 })}</span>
      </header>

      {!typeMode && (
        <>
          <div className={s.photoWrap}>
            <div className={s.photo} style={{ '--ar': aspect } as CSSProperties}>
              <div className={s.frame}>
                {showPhoto ? (
                  <img src={photo.url ?? undefined} alt={t('scan.yourPhotoAlt')} className={s.img} />
                ) : preset?.photo ? (
                  <img src={`${import.meta.env.BASE_URL}${preset.photo}`} alt={t(`preset.${preset.id}`)} className={s.img} />
                ) : (
                  <FridgeArt preset={preset?.id ?? null} label={t(`preset.${preset?.id ?? 'empty'}.alt`)} />
                )}
                {busy && (
                  <div className={s.scanning}>
                    <span className={s.scanLine} />
                  </div>
                )}
              </div>
              {boxes.map((item) => {
                const [ymin, xmin, ymax, xmax] = item.box!;
                const label = `${item.boxLabel ? t.pick(item.boxLabel) : itemName(item, t.lang)}${qtySuffix(item.qty)}`;
                return (
                  <div
                    key={item.id}
                    className={s.box}
                    aria-hidden="true"
                    style={{
                      left: `${xmin / 10}%`,
                      top: `${ymin / 10}%`,
                      width: `${(xmax - xmin) / 10}%`,
                      height: `${(ymax - ymin) / 10}%`,
                    }}
                  >
                    <span className={cx(s.boxLabel, xmin > 700 && s.boxLabelEnd)}>{label}</span>
                  </div>
                );
              })}
            </div>
            <p className={analysing ? s.status : 'visually-hidden'} aria-live="polite">
              {analysing ? t('scan.analysing') : scanning ? t('scan.scanning') : ''}
            </p>
          </div>

          <div className={s.presets} role="group" aria-label={t('scan.presets')}>
            {PRESET_IDS.map((id) => (
              <button
                key={id}
                type="button"
                className={s.preset}
                aria-pressed={scan.source === id}
                onClick={() => choosePreset(id)}
              >
                <PresetThumb preset={id} />
                {t(`preset.${id}`)}
              </button>
            ))}
            <button
              type="button"
              className={cx(s.preset, s.yourPhoto)}
              aria-pressed={scan.source === 'photo'}
              onClick={() => fileInput.current?.click()}
            >
              <Icon name="camera" size={26} />
              {t('scan.yourPhoto')}
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              className="visually-hidden"
              tabIndex={-1}
              aria-hidden="true"
              onChange={(event) => {
                onPhoto(event.target.files?.[0]);
                event.target.value = '';
              }}
            />
          </div>
        </>
      )}

      {(notice || photoLost) && (
        <div className={s.notice} role="alert">
          <p>{notice ?? t('scan.photoGone')}</p>
          <button type="button" className={cx(ui.btn, ui.outline)} onClick={() => choosePreset('student')}>
            {t('scan.usePreset')}
          </button>
        </div>
      )}

      <section className={s.found} aria-labelledby="found-title">
        <div className={s.foundHead}>
          <h2 id="found-title" className={ui.sectionTitle}>
            {detected ? t.plural('scan.found', items.length) : t.plural('scan.count', items.length)}
          </h2>
          {detected && <span className={s.ai}>{t('scan.aiVision')}</span>}
        </div>
        <p className={cx(ui.note, s.check)}>{typeMode ? t('scan.typeIntro') : t('scan.check')}</p>
        <ul className={s.chips} aria-label={t('scan.itemsLabel')}>
          {items.map((item) => {
            const name = itemName(item, t.lang);
            return (
              <li key={item.id} className={s.chip}>
                <button
                  type="button"
                  className={s.chipLabel}
                  aria-label={t('scan.edit', { name: `${name}${qtySuffix(item.qty)}` })}
                  onClick={() => setEditing(item)}
                >
                  {name}
                  {qtySuffix(item.qty)}
                </button>
                <button
                  type="button"
                  className={s.remove}
                  aria-label={t('common.remove', { name })}
                  onClick={() => removeItem(item.id)}
                >
                  <Icon name="close" size={14} strokeWidth={2.4} />
                </button>
              </li>
            );
          })}
          <li className={s.addItem}>
            <AddIngredient
              onAdd={onAdd}
              suggest={suggest}
              addText={t('scan.add')}
              label={t('scan.addLabel')}
              placeholder={t('scan.addPlaceholder')}
              suggestionsLabel={t('scan.suggestions')}
              startOpen={typeMode}
            />
          </li>
        </ul>
      </section>

      <div className={cx(ui.actionBar, s.bar)}>
        {items.length === 0 && <p className={ui.note}>{t('scan.emptyList')}</p>}
        <button
          type="button"
          className={cx(ui.btn, ui.primary)}
          disabled={items.length === 0 || busy}
          onClick={() => navigate('/dishes')}
        >
          {t('scan.findDishes')}
          <Icon name="arrowRight" size={20} strokeWidth={2} />
        </button>
      </div>

      <EditItemSheet item={editing} onClose={() => setEditing(null)} />
    </main>
  );
}
