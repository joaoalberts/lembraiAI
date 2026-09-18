import type { CSSProperties } from 'react';
import { cx, du } from '../lib/du';
import s from './FilterChip.module.css';

interface Props { label: string; count: number; active: boolean; width: number; onClick: () => void; className?: string; style?: CSSProperties }

/** Chip de filtro ("Todos 5", "Hoje 2", ...). Largura fixa medida em ref/5.png. */
export function FilterChip({ label, count, active, width, onClick, className, style }: Props) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick} style={{ width: du(width), ...style }}
            className={cx(s.chip, active && s.active, className)}>
      <span>{label}</span><span className={s.count}>{count}</span>
    </button>
  );
}
