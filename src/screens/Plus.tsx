import { Link, useNavigate, useSearchParams } from 'react-router';
import { config } from '../config';
import { useBack } from '../components/BackButton';
import { cx } from '../components/cx';
import { Icon } from '../components/Icon';
import { toast } from '../components/Toast';
import { useT } from '../i18n';
import { useApp } from '../state/store';
import ui from '../styles/ui.module.css';
import s from './Plus.module.css';

function Check({ yes, label }: { yes: boolean; label: string }) {
  return (
    <span className={yes ? s.yes : s.no}>
      {yes ? <Icon name="check" size={18} strokeWidth={2.6} /> : <Icon name="minus" size={18} strokeWidth={2} />}
      <span className="visually-hidden">{label}</span>
    </span>
  );
}

export function Plus() {
  const t = useT();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next');
  const plus = useApp((state) => state.plus);
  const setPlus = useApp((state) => state.setPlus);
  const close = useBack('/');

  const price =
    config.plusPriceEur === null
      ? t('plus.pricePlaceholder')
      : t('plus.price', { price: t.price(Math.round(config.plusPriceEur * 100)) });

  const unlock = () => {
    setPlus(true);
    toast(t('plus.unlocked'));
    if (next?.startsWith('/')) navigate(next, { replace: true });
  };

  const rows = [
    { label: t('plus.row1'), free: true },
    { label: t('plus.row2'), free: true },
    { label: t('plus.row3'), free: false },
  ];

  return (
    <main className={s.page}>
      <div className={s.top}>
        <button type="button" className={ui.iconBtn} aria-label={t('common.close')} onClick={close}>
          <Icon name="close" size={20} strokeWidth={2.2} />
        </button>
      </div>

      <span className={s.badge}>{t('plus.badge')}</span>
      <h1 className={s.title}>{t('plus.title')}</h1>
      <p className={s.subtitle}>{t('plus.subtitle')}</p>

      <ul className={s.features}>
        <li className={s.feature}>
          <span className={cx(s.featureIcon, s.chef)}>
            <Icon name="chef" size={22} />
          </span>
          <span className={s.featureText}>
            <span className={s.featureTitle}>{t('plus.chefTitle')}</span>
            <span className={s.featureBody}>{t('plus.chefText')}</span>
          </span>
        </li>
        {plus ? (
          <li>
            <Link to="/bartender" className={cx(s.feature, s.featureLink)}>
              <span className={cx(s.featureIcon, s.bar)}>
                <Icon name="glass" size={22} />
              </span>
              <span className={s.featureText}>
                <span className={s.featureTitle}>{t('plus.barTitle')}</span>
                <span className={s.featureBody}>{t('plus.barText')}</span>
              </span>
              <Icon name="next" size={20} className={s.featureArrow} />
            </Link>
          </li>
        ) : (
          <li className={s.feature}>
            <span className={cx(s.featureIcon, s.bar)}>
              <Icon name="glass" size={22} />
            </span>
            <span className={s.featureText}>
              <span className={s.featureTitle}>{t('plus.barTitle')}</span>
              <span className={s.featureBody}>{t('plus.barText')}</span>
            </span>
          </li>
        )}
        <li className={s.feature}>
          <span className={cx(s.featureIcon, s.plan)}>
            <Icon name="calendar" size={22} />
          </span>
          <span className={s.featureText}>
            <span className={s.featureTitle}>
              {t('plus.planTitle')} <span className={s.soon}>{t('plus.comingSoon')}</span>
            </span>
            <span className={s.featureBody}>{t('plus.planText')}</span>
          </span>
        </li>
      </ul>

      <table className={s.compare}>
        <caption className="visually-hidden">{t('plus.compare')}</caption>
        <thead>
          <tr>
            <th scope="col">
              <span className="visually-hidden">{t('plus.feature')}</span>
            </th>
            <th scope="col" className={s.colFree}>
              {t('plus.free')}
            </th>
            <th scope="col" className={s.colPlus}>
              {t('plus.plus')}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              <td>
                <Check yes={row.free} label={row.free ? t('plus.included') : t('plus.notIncluded')} />
              </td>
              <td>
                <Check yes label={t('plus.included')} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={s.cta}>
        {plus ? (
          <>
            <p className={s.active}>
              <Icon name="check" size={18} strokeWidth={2.6} />
              {t('plus.active')}
            </p>
            <button
              type="button"
              className={cx(ui.btn, ui.primary)}
              onClick={() => (next?.startsWith('/') ? navigate(next, { replace: true }) : close())}
            >
              {t('plus.continue')}
            </button>
          </>
        ) : (
          <button type="button" className={cx(ui.btn, ui.primary)} onClick={unlock}>
            {t('plus.unlock')}
          </button>
        )}
        <p className={s.price}>
          {price}
          {config.plusPriceEur === null && <> · {t('plus.priceTbd')}</>}
        </p>
        <p className={s.note}>{t('plus.demoNote')}</p>
      </div>
    </main>
  );
}
