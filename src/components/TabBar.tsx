import { House, List, MapPin, Settings, type LucideIcon } from 'lucide-react';
import { cx, du } from '../lib/du';
import { Icon } from './Icon';
import s from './TabBar.module.css';

export type TabKey = 'inicio' | 'lembretes' | 'mapa' | 'config';
// centros em x (du) medidos em ref/5.png
const TABS: { key: TabKey; label: string; icon: LucideIcon; x: number }[] = [
  { key: 'inicio', label: 'Início', icon: House, x: 111 },
  { key: 'lembretes', label: 'Lembretes', icon: List, x: 318 },
  { key: 'mapa', label: 'Mapa', icon: MapPin, x: 529 },
  { key: 'config', label: 'Configurações', icon: Settings, x: 738 },
];

export function TabBar({ active, onSelect }: { active: TabKey; onSelect?: (k: TabKey) => void }) {
  return (
    <nav className={s.bar} aria-label="Navegação principal">
      {TABS.map((t) => (
        <button key={t.key} type="button" aria-current={t.key === active ? 'page' : undefined}
                onClick={() => onSelect?.(t.key)} style={{ left: du(t.x) }}
                className={cx(s.tab, t.key === active && s.active)}>
          <Icon icon={t.icon} size={42} stroke={t.key === active ? 2 : 1.8} />
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
