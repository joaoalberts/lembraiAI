import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import s from './BottomSheet.module.css';

interface Props { title: string; subtitle?: string; onClose: () => void; children: ReactNode }

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Folha inferior modal, presa ao frame do app (position: absolute). Fecha com Esc ou toque no fundo;
 * o foco entra na folha, fica preso nela e volta ao elemento que a abriu.
 */
export function BottomSheet({ title, subtitle, onClose, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    return () => opener?.focus?.();
  }, []);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { e.stopPropagation(); onClose(); return; }
    if (e.key !== 'Tab' || !ref.current) return;
    const items = [...ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  return (
    <>
      <div className={s.scrim} onClick={onClose} aria-hidden />
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} className={s.sheet} onKeyDown={onKeyDown}>
        <i className={s.grab} aria-hidden />
        <h2 id={titleId} className={s.title}>{title}</h2>
        {subtitle && <p className={s.subtitle}>{subtitle}</p>}
        {children}
      </div>
    </>
  );
}
