import { useEffect, useRef, type CSSProperties } from 'react';
import { Search } from 'lucide-react';
import { Icon } from './Icon';
import s from './SearchField.module.css';

interface Props { value: string; onChange: (v: string) => void; onClose: () => void; className?: string; style?: CSSProperties }

/** Campo de busca de vidro sobre o header escuro. Foca ao abrir · Esc fecha · Enter recolhe o teclado. */
export function SearchField({ value, onChange, onClose, className, style }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <label className={[s.field, className].filter(Boolean).join(' ')} style={style}>
      <Icon icon={Search} size={32} stroke={2.2} />
      <input ref={ref} type="search" enterKeyHint="search" autoComplete="off" spellCheck={false}
             placeholder="Buscar lembretes" aria-label="Buscar lembretes" value={value}
             onChange={(e) => onChange(e.target.value)}
             onKeyDown={(e) => { if (e.key === 'Escape') onClose(); else if (e.key === 'Enter') e.currentTarget.blur(); }} />
    </label>
  );
}
