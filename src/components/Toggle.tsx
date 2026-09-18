import { cx } from '../lib/du';
import s from './Toggle.module.css';

interface Props {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  /** 'sm' = lista (69×42 du) · 'lg' = formulário (85×52 du) */
  size?: 'sm' | 'lg';
  className?: string;
}

/** Interruptor. ON medido nas imagens; OFF é proposta do DS (trilho track-off, polegar à esquerda). */
export function Toggle({ checked, onChange, label, size = 'sm', className }: Props) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label}
            onClick={() => onChange(!checked)}
            className={cx(s.toggle, s[size], checked && s.on, className)}>
      <span className={s.thumb} />
    </button>
  );
}
