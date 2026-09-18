import type { CSSProperties, ReactNode } from 'react';
import { MapPin } from 'lucide-react';
import type { Category } from '../data/reminders';
import { cx } from '../lib/du';
import { Icon } from './Icon';
import s from './Tag.module.css';

/** Tag de categoria ("Por local" / "Por horário"): fundo, texto e ícone vêm da cor da categoria. */
export function Tag({ category, children, className, style }: { category: Category; children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <span className={cx(s.tag, s[category], className)} style={style}>
      <Icon icon={MapPin} size={20} stroke={2.4} color="var(--tag-icon)" />
      <span>{children}</span>
    </span>
  );
}
