import s from './StatusPill.module.css';

/** Pílula de status "Ativo" (ponto verde + texto). */
export function StatusPill({ children }: { children: string }) {
  return <span className={s.pill}><i className={s.dot} />{children}</span>;
}
