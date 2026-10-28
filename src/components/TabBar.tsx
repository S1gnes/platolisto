import type { ReactNode } from 'react';
import { NavLink } from 'react-router';
import { useT, type MessageKey } from '../i18n';
import { useApp } from '../state/store';
import { Icon, type IconName } from './Icon';
import s from './TabBar.module.css';

const TABS: { to: string; icon: IconName; label: MessageKey }[] = [
  { to: '/', icon: 'home', label: 'tabs.home' },
  { to: '/deals', icon: 'tag', label: 'tabs.deals' },
  { to: '/list', icon: 'list', label: 'tabs.list' },
  { to: '/profile', icon: 'user', label: 'tabs.profile' },
];

/** Bottom tab bar. `action` renders a call to action docked right above it. */
export function TabBar({ action }: { action?: ReactNode }) {
  const t = useT();
  const open = useApp((state) => state.list.filter((item) => !item.checked).length);
  return (
    <div className={s.dock}>
      {action && <div className={s.action}>{action}</div>}
      <nav aria-label={t('tabs.label')} className={s.bar}>
        {TABS.map((tab) => (
          <NavLink key={tab.to} to={tab.to} end={tab.to === '/'} className={s.tab}>
            <span className={s.iconWrap}>
              <Icon name={tab.icon} />
              {tab.to === '/list' && open > 0 && (
                <span className={s.badge} aria-hidden="true">
                  {open}
                </span>
              )}
            </span>
            <span>{t(tab.label)}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
