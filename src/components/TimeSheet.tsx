import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type RefObject } from 'react';
import { cx } from '../lib/du';
import { BottomSheet } from './BottomSheet';
import s from './TimeSheet.module.css';

const pad = (n: number) => String(n).padStart(2, '0');
const clamp = (n: number, max: number) => Math.min(max, Math.max(0, n));
const AUTO_CLOSE_MS = 800;   // depois que os minutos param de rolar

interface WheelProps {
  label: string; unit: string; count: number; initial: number;
  boxRef: RefObject<HTMLDivElement | null>;
  onSettle: (i: number) => void;   // o item parou no centro
  onActivity: () => void;          // qualquer toque/rolagem/tecla
}

/** Coluna rolável com "imã" (scroll-snap): o item que para no centro é o escolhido. Não reage a props depois de montada. */
function Wheel({ label, unit, count, initial, boxRef, onSettle, onActivity }: WheelProps) {
  const [active, setActive] = useState(initial);
  const settled = useRef(initial);
  const timer = useRef<number | undefined>(undefined);

  const rowH = () => boxRef.current!.firstElementChild!.getBoundingClientRect().height;   // px de uma linha (varia com a escala do frame)
  useLayoutEffect(() => { boxRef.current!.scrollTop = initial * rowH(); }, []);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onScroll = () => {
    const i = clamp(Math.round(boxRef.current!.scrollTop / rowH()), count - 1);
    setActive(i);
    onActivity();
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => { if (i !== settled.current) { settled.current = i; onSettle(i); } }, 120);
  };
  const goTo = (i: number, smooth: boolean) => {
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    boxRef.current!.scrollTo({ top: clamp(i, count - 1) * rowH(), behavior: smooth && !calm ? 'smooth' : 'auto' });
  };
  const onKeyDown = (e: KeyboardEvent) => {
    const step = ({ ArrowUp: -1, ArrowDown: 1, PageUp: -5, PageDown: 5 } as Record<string, number>)[e.key];
    const to = step !== undefined ? active + step : e.key === 'Home' ? 0 : e.key === 'End' ? count - 1 : null;
    if (to === null) return;
    e.preventDefault();
    onActivity();
    goTo(to, false);
  };

  return (
    <div ref={boxRef} role="spinbutton" tabIndex={0} aria-label={label} aria-valuemin={0} aria-valuemax={count - 1}
         aria-valuenow={active} aria-valuetext={`${pad(active)} ${unit}`} className={s.wheel}
         onScroll={onScroll} onKeyDown={onKeyDown} onPointerDown={onActivity}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} aria-hidden className={cx(s.item, i === active && s.on)} onClick={() => goTo(i, true)}>{pad(i)}</div>
      ))}
    </div>
  );
}

interface Props { value: string; onChange: (v: string) => void; onClose: () => void }

/**
 * Seletor de horário em rolagem (hora : minutos). Cada valor é registrado assim que a coluna para de rolar;
 * ao parar os minutos, a folha fecha sozinha. "Pronto", Esc ou o fundo fecham a qualquer momento.
 */
export function TimeSheet({ value, onChange, onClose }: Props) {
  const [h0, m0] = value.split(':').map(Number);
  const start = useRef({ h: h0, m: m0 });   // só o valor de abertura: as colunas não seguem o valor ao vivo
  const now = useRef({ h: h0, m: m0 });
  const hourBox = useRef<HTMLDivElement>(null);
  const minuteBox = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const cancelClose = () => window.clearTimeout(closeTimer.current);
  const apply = () => onChange(`${pad(now.current.h)}:${pad(now.current.m)}`);

  useEffect(() => { hourBox.current?.focus(); return cancelClose; }, []);

  return (
    <BottomSheet title="Horário" subtitle="Role a hora e os minutos. O horário é salvo ao escolher." onClose={onClose}>
      <button type="button" className={s.done} onClick={onClose}>Pronto</button>
      <div className={s.wheels}>
        <i className={s.band} aria-hidden />
        <Wheel label="Hora" unit="horas" count={24} initial={start.current.h} boxRef={hourBox} onActivity={cancelClose}
               onSettle={(i) => { now.current.h = i; apply(); }} />
        <b className={s.colon} aria-hidden>:</b>
        <Wheel label="Minutos" unit="minutos" count={60} initial={start.current.m} boxRef={minuteBox} onActivity={cancelClose}
               onSettle={(i) => { now.current.m = i; apply(); closeTimer.current = window.setTimeout(onClose, AUTO_CLOSE_MS); }} />
      </div>
    </BottomSheet>
  );
}
