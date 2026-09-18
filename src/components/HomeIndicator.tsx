import { cx } from '../lib/du';
import s from './HomeIndicator.module.css';

/** Barra "home" do iOS. Medida por tela: form (2.png) e lista (5.png). */
export function HomeIndicator({ variant }: { variant: 'form' | 'list' }) {
  return <i aria-hidden className={cx(s.bar, s[variant])} />;
}
