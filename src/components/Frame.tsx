import type { ReactNode } from 'react';
import { cx } from '../lib/du';
import s from './Frame.module.css';

/** Coluna de celular: mantém a proporção 851:1848 das referências e escala tudo junto (--u). */
export function Frame({ children }: { children: ReactNode }) {
  return <div className={s.frame}>{children}</div>;
}

export function Screen({ children, className }: { children: ReactNode; className?: string }) {
  return <main className={cx(s.screen, className)}>{children}</main>;
}
