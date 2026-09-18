import { useRef, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import s from './Slider.module.css';

interface Props {
  value: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
  label: string;
  className?: string;
  style?: CSSProperties;
}

/** Slider do raio de notificação. O polegar percorre a trilha inteira (como na imagem: 150/550 = 27,3 %). */
export function Slider({ value, max = 550, step = 10, onChange, label, className, style }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const clamp = (v: number) => Math.min(max, Math.max(0, v));

  const fromPointer = (e: PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    onChange(clamp(Math.round((f * max) / step) * step));
  };
  const onKey = (e: KeyboardEvent) => {
    const d = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? step : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -step : 0;
    if (d) { e.preventDefault(); onChange(clamp(value + d)); }
    if (e.key === 'Home') onChange(0);
    if (e.key === 'End') onChange(max);
  };

  return (
    <div ref={ref} role="slider" tabIndex={0} aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}
         className={[s.slider, className].filter(Boolean).join(' ')}
         style={{ ...style, ['--pct' as string]: `${(value / max) * 100}%` }}
         onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); fromPointer(e); }}
         onPointerMove={(e) => { if (e.currentTarget.hasPointerCapture(e.pointerId)) fromPointer(e); }}
         onKeyDown={onKey}>
      <span className={s.track} /><span className={s.fill} /><span className={s.thumb} />
    </div>
  );
}
