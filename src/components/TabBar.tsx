import { House, List, MapPin, Settings, type LucideIcon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cx, du } from '../lib/du';
import { Icon } from './Icon';
import s from './TabBar.module.css';

export type TabKey = 'inicio' | 'lembretes' | 'mapa' | 'config';
// centros em x (du) medidos em ref/5.png
const TABS: { key: TabKey; label: string; icon: LucideIcon; x: number; to: string }[] = [
  { key: 'inicio', label: 'Início', icon: House, x: 111, to: '/' },
  { key: 'lembretes', label: 'Lembretes', icon: List, x: 318, to: '/lembretes' },
  { key: 'mapa', label: 'Mapa', icon: MapPin, x: 529, to: '/mapa' },
  { key: 'config', label: 'Configurações', icon: Settings, x: 738, to: '/config' },
];

/** Barra de menu inferior (ref/5.png). `active` é a aba em destaque; tocar em uma aba navega para a tela dela. */
export function TabBar({ active }: { active: TabKey }) {
  const nav = useNavigate();
  const { pathname } = useLocation();
  return (
    <nav className={s.bar} aria-label="Navegação principal">
      {TABS.map((t) => (
        <button key={t.key} type="button" aria-current={t.key === active ? 'page' : undefined}
                onClick={() => { if (pathname !== t.to) nav(t.to); }} style={{ left: du(t.x) }}
                className={cx(s.tab, t.key === active && s.active)}>
          <Icon icon={t.icon} size={42} stroke={t.key === active ? 2 : 1.8} />
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
