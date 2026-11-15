import { Link, useNavigate, useSearchParams } from 'react-router';
import { config } from '../config';
import { useBack } from '../components/BackButton';
import { cx } from '../components/cx';
import { Icon, type IconName } from '../components/Icon';
import { toast } from '../components/Toast';
import { useT, type MessageKey } from '../i18n';
import { useApp } from '../state/store';
import ui from '../styles/ui.module.css';
import s from './Plus.module.css';

const FEATURES: { icon: IconName; title: MessageKey; text: MessageKey; to?: string; where?: MessageKey }[] = [
  { icon: 'chef', title: 'plus.chefTitle', text: 'plus.chefText', where: 'plus.chefWhere' },
  { icon: 'glass', title: 'plus.barTitle', text: 'plus.barText', to: '/bartender' },
  { icon: 'calendar', title: 'plus.planTitle', text: 'plus.planText', to: '/plan' },
];

function Check({ yes, label }: { yes: boolean; label: string }) {
  return (
    <span className={yes ? s.yes : s.no}>
      {yes ? <Icon name="check" size={20} strokeWidth={2.6} /> : <Icon name="minus" size={20} strokeWidth={2} />}
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
          <Icon name="close" size={22} strokeWidth={2} />
        </button>
      </div>

      <h1 className={ui.pageTitle}>{t('plus.title')}</h1>
      <p className={ui.subtitle}>{t('plus.subtitle')}</p>

      <ul className={cx(ui.rows, s.features)}>
        {FEATURES.map((feature) => {
          const content = (
            <>
              <span className={s.featureIcon}>
                <Icon name={feature.icon} size={22} />
              </span>
              <span className={s.featureText}>
                <span className={s.featureTitle}>{t(feature.title)}</span>
                <span className={s.featureBody}>{t(feature.text)}</span>
                {plus && feature.where && <span className={s.featureBody}>{t(feature.where)}</span>}
              </span>
              {plus && feature.to && <Icon name="next" size={20} className={s.featureArrow} />}
            </>
          );
          return (
            <li key={feature.title}>
              {plus && feature.to ? (
                <Link to={feature.to} className={cx(s.feature, s.featureLink)}>
                  {content}
                </Link>
              ) : (
                <div className={s.feature}>{content}</div>
              )}
            </li>
          );
        })}
      </ul>

      <table className={s.compare}>
        <caption className="visually-hidden">{t('plus.compare')}</caption>
        <thead>
          <tr>
            <th scope="col">
              <span className="visually-hidden">{t('plus.feature')}</span>
            </th>
            <th scope="col">{t('plus.free')}</th>
            <th scope="col">{t('plus.plus')}</th>
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
          {config.plusPriceEur === null
            ? t('plus.priceTbd')
            : t('plus.price', { price: t.price(Math.round(config.plusPriceEur * 100)) })}
        </p>
        <p className={s.note}>{t('plus.demoNote')}</p>
      </div>
    </main>
  );
}
