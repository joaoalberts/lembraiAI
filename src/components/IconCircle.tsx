import type { CSSProperties, ReactNode } from 'react';
import { cx, du } from '../lib/du';
import s from './IconCircle.module.css';

interface Props { size: number; bg: string; children: ReactNode; className?: string; style?: CSSProperties }

/** Círculo com ícone (mint no formulário/sucesso; cor da categoria na lista). */
export function IconCircle({ size, bg, children, className, style }: Props) {
  return <span className={cx(s.circle, className)} style={{ width: du(size), height: du(size), background: bg, ...style }}>{children}</span>;
}
