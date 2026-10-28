import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { DrinkArt } from '../art/DrinkArt';
import { AddIngredient } from '../components/AddIngredient';
import { BackButton } from '../components/BackButton';
import { cx } from '../components/cx';
import { Icon } from '../components/Icon';
import { Modal } from '../components/Modal';
import { toast } from '../components/Toast';
import {
  barName,
  drinkStyle,
  normalizeBarIngredient,
  rankDrinks,
  SAMPLE_BAR,
  suggestBar,
  toDrink,
  type Drink,
  type DrinkMatch,
  type DrinkRecord,
} from '../core/bar';
import { useT, type MessageKey, type Translator } from '../i18n';
import { detectItems, errorCode, liveEnabled, type ApiErrorCode } from '../services/api';
import { prepareImage } from '../services/image';
import { useApp } from '../state/store';
import ui from '../styles/ui.module.css';
import s from './Bartender.module.css';

const SCAN_ERRORS: Partial<Record<ApiErrorCode, MessageKey>> = {
  not_configured: 'bar.scanUnavailable',
  offline: 'bar.scanOffline',
  rate_limited: 'bar.scanBusy',
  quota: 'bar.scanBusy',
};

// The dataset is ~300 KB, so it is only loaded when bartender mode opens.
let datasetPromise: Promise<Drink[]> | null = null;
function loadDrinks(): Promise<Drink[]> {
  datasetPromise ??= import('../data/cocktails.json').then((module) => (module.default.drinks as DrinkRecord[]).map(toDrink));
  return datasetPromise;
}

function summary(drink: Drink, t: Translator): string {
  const names = drink.ingredients.filter((i) => !i.optional).map((i) => barName(i.key, t.lang));
  const text = names.map((name, index) => (index === 0 ? name : name.toLowerCase())).join(', ');
  return `${text} · ${t('common.minutes', { n: drink.minutes })}`;
}

function DrinkPicture({ drink, size }: { drink: Drink; size: 'small' | 'medium' }) {
  const t = useT();
  const [broken, setBroken] = useState(false);
  if (!drink.thumb || broken) return <DrinkArt style={drinkStyle(drink)} />;
  return (
    <img
      className={size === 'small' ? s.thumb : s.photo}
      src={`${drink.thumb}/${size}`}
      alt={size === 'medium' ? t('bar.photoAlt', { name: drink.name }) : ''}
      loading="lazy"
      onError={() => setBroken(true)}
    />
  );
}

export function Bartender() {
  const plus = useApp((state) => state.plus);
  if (!plus) return <Navigate to={`/plus?next=${encodeURIComponent('/bartender')}`} replace />;
  return <BartenderScreen />;
}

function BartenderScreen() {
  const t = useT();
  const navigate = useNavigate();
  const ageConfirmed = useApp((state) => state.ageConfirmed);
  const confirmAge = useApp((state) => state.confirmAge);
  const bar = useApp((state) => state.bar);
  const setBar = useApp((state) => state.setBar);
  const [drinks, setDrinks] = useState<Drink[] | null>(null);
  const [scanning, setScanning] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [selected, setSelected] = useState<DrinkMatch | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!ageConfirmed) return;
    let alive = true;
    loadDrinks().then((list) => alive && setDrinks(list));
    return () => {
      alive = false;
    };
  }, [ageConfirmed]);

  const { ready, almost } = useMemo(() => (drinks ? rankDrinks(drinks, bar) : { ready: [], almost: [] }), [drinks, bar]);

  const addKeys = useCallback(
    (keys: string[]) => setBar([...new Set([...useApp.getState().bar, ...keys.filter(Boolean)])]),
    [setBar],
  );
  const suggest = useCallback((query: string) => suggestBar(query, t.lang, bar), [t.lang, bar]);

  const onScan = async (file: File | undefined) => {
    if (!file) return;
    setNotice(null);
    if (!liveEnabled()) {
      setNotice(t('bar.scanUnavailable'));
      return;
    }
    setScanning(true);
    try {
      const { base64, mimeType } = await prepareImage(file);
      const detections = await detectItems(base64, mimeType, 'bar');
      const keys = [...new Set(detections.map((item) => normalizeBarIngredient(item.name)).filter(Boolean))];
      const fresh = keys.filter((key) => !useApp.getState().bar.includes(key));
      addKeys(keys);
      if (keys.length === 0) setNotice(t('bar.nothingFound'));
      else toast(t.plural('bar.scanAdded', fresh.length || keys.length));
    } catch (error) {
      setNotice(t(SCAN_ERRORS[errorCode(error)] ?? 'bar.scanFailed'));
    } finally {
      setScanning(false);
    }
  };

  const renderDrink = (match: DrinkMatch) => {
    const full = match.missing.length === 0;
    return (
      <li key={match.drink.id}>
        <button type="button" className={cx(s.drink, !full && s.almost)} onClick={() => setSelected(match)}>
          <DrinkPicture drink={match.drink} size="small" />
          <span className={s.drinkText}>
            <span className={s.drinkName}>{match.drink.name}</span>
            <span className={s.drinkMeta}>
              {full
                ? summary(match.drink, t)
                : t('bar.missing', { items: match.missing.map((key) => barName(key, t.lang).toLowerCase()).join(', ') })}
            </span>
          </span>
          <span
            className={full ? s.coverage : s.coverageAlmost}
            role="img"
            aria-label={t('bar.coverageLabel', { have: match.have.length, total: match.total })}
          >
            {t('bar.coverage', { have: match.have.length, total: match.total })}
          </span>
        </button>
      </li>
    );
  };

  const steps = selected ? (t.lang === 'es' && selected.drink.instructions.es) || selected.drink.instructions.en : '';

  return (
    <main className={s.page}>
      <header className={s.header}>
        <BackButton fallback="/plus" />
        <span className={s.plus}>{t('common.plusBadge')}</span>
        <span className={s.age}>{t('bar.ageBadge')}</span>
      </header>

      <section className={s.intro}>
        <h1 className={s.title}>{t('bar.title')}</h1>
        <p className={s.subtitle}>{t('bar.subtitle')}</p>
      </section>

      {ageConfirmed && (
        <>
          <section className={s.section} aria-labelledby="your-bar">
            <div className={s.barHead}>
              <h2 id="your-bar" className={s.eyebrow}>
                {t('bar.yourBar', { n: bar.length })}
              </h2>
              <button type="button" className={s.scan} disabled={scanning} onClick={() => fileInput.current?.click()}>
                <Icon name="camera" size={18} strokeWidth={2} />
                {t('bar.scan')}
              </button>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                className="visually-hidden"
                tabIndex={-1}
                aria-hidden="true"
                onChange={(event) => {
                  onScan(event.target.files?.[0]);
                  event.target.value = '';
                }}
              />
            </div>
            {scanning && (
              <p className={s.status} role="status">
                {t('bar.scanning')}
              </p>
            )}
            {notice && (
              <p className={s.notice} role="alert">
                {notice}
              </p>
            )}
            <ul className={s.chips}>
              {bar.map((key) => {
                const name = barName(key, t.lang);
                return (
                  <li key={key} className={s.chip}>
                    <span className={s.chipLabel}>{name}</span>
                    <button
                      type="button"
                      className={s.remove}
                      aria-label={t('common.remove', { name })}
                      onClick={() => setBar(bar.filter((item) => item !== key))}
                    >
                      <Icon name="close" size={14} strokeWidth={2.4} />
                    </button>
                  </li>
                );
              })}
              <li className={s.addItem}>
                <AddIngredient
                  onAdd={(text) => addKeys([normalizeBarIngredient(text)])}
                  suggest={suggest}
                  addText={t('bar.add')}
                  label={t('bar.addLabel')}
                  placeholder={t('bar.addPlaceholder')}
                  suggestionsLabel={t('scan.suggestions')}
                />
              </li>
            </ul>
            {bar.length === 0 && (
              <div className={s.empty}>
                <p>{t('bar.empty')}</p>
                <button type="button" className={cx(ui.btn, ui.saffron)} onClick={() => setBar(SAMPLE_BAR)}>
                  {t('bar.sample')}
                </button>
              </div>
            )}
          </section>

          {bar.length > 0 && (
            <section className={s.section} aria-labelledby="can-mix">
              <h2 id="can-mix" className={s.mixTitle}>
                {drinks ? t.plural('bar.canMix', ready.length) : t('bar.loading')}
              </h2>
              {drinks && ready.length === 0 && <p className={s.subtitle}>{t('bar.none')}</p>}
              <ul className={s.drinks}>{ready.map(renderDrink)}</ul>
              {almost.length > 0 && (
                <>
                  <h3 className={cx(s.eyebrow, s.almostTitle)}>{t('bar.almostTitle')}</h3>
                  <ul className={s.drinks}>{almost.map(renderDrink)}</ul>
                </>
              )}
            </section>
          )}
        </>
      )}

      <p className={s.footer}>{t('bar.footer')}</p>

      <Modal open={!ageConfirmed} onClose={() => navigate('/', { replace: true })} title={t('bar.ageTitle')} variant="dialog" hideClose className={s.dialog}>
        <p className={s.dialogText}>{t('bar.ageText')}</p>
        <div className={s.dialogActions}>
          <button type="button" className={cx(ui.btn, ui.saffron)} onClick={confirmAge}>
            {t('bar.ageYes')}
          </button>
          <button type="button" className={cx(ui.btn, s.ghost)} onClick={() => navigate('/', { replace: true })}>
            {t('bar.ageNo')}
          </button>
        </div>
      </Modal>

      <Modal open={selected !== null} onClose={() => setSelected(null)} title={selected?.drink.name ?? ''} className={s.dialog}>
        {selected && (
          <div className={s.detail}>
            <div className={s.detailTop}>
              <DrinkPicture drink={selected.drink} size="medium" />
              <p className={s.drinkMeta}>
                {t('bar.glass', { glass: selected.drink.glass })} · {t('common.minutes', { n: selected.drink.minutes })}
              </p>
            </div>
            <h3 className={s.eyebrow}>{t('bar.ingredients')}</h3>
            <ul className={s.ingredients}>
              {selected.drink.ingredients.map((ingredient) => {
                const has = selected.have.includes(ingredient.key);
                return (
                  <li key={ingredient.key} className={s.ingredient}>
                    <span className={has || ingredient.optional ? s.okDot : s.missDot} aria-hidden="true">
                      <Icon name={has ? 'check' : ingredient.optional ? 'minus' : 'plus'} size={12} strokeWidth={3} />
                    </span>
                    <span className={s.ingredientName}>
                      {barName(ingredient.key, t.lang)}
                      {ingredient.optional && <span className={s.optional}> · {t('bar.optional')}</span>}
                      <span className="visually-hidden">
                        {' '}
                        · {has ? t('bar.haveIt') : ingredient.optional ? t('bar.optional') : t('bar.needIt')}
                      </span>
                    </span>
                    <span className={s.measure}>{ingredient.measure}</span>
                  </li>
                );
              })}
            </ul>
            <h3 className={s.eyebrow}>{t('bar.method')}</h3>
            <p className={s.method}>{steps}</p>
            <p className={s.credit}>
              <a href="https://www.thecocktaildb.com/" target="_blank" rel="noreferrer">
                {t('bar.credit')}
              </a>
            </p>
          </div>
        )}
      </Modal>
    </main>
  );
}
