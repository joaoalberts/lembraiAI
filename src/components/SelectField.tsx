import { useRef, type CSSProperties } from 'react';
import { ChevronDown, type LucideIcon } from 'lucide-react';
import { at } from '../lib/du';
import { Icon } from './Icon';
import s from './SelectField.module.css';

interface Props {
  style: CSSProperties;
  icon: LucideIcon;
  value: string;
  label: string;
  inputType: 'date' | 'time';
  inputValue: string;
  onChange: (v: string) => void;
  iconX: number; textX: number; chevronX: number;
}

/** Campo "select" (Data/Horário). Visual da imagem; o seletor é o nativo do navegador (input date/time invisível). */
export function SelectField({ style, icon, value, label, inputType, inputValue, onChange, iconX, textX, chevronX }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className={s.field} style={style} onClick={() => ref.current?.showPicker?.()}>
      <span className="atc" style={at(iconX, 39.5)}><Icon icon={icon} size={32} stroke={2} /></span>
      <span className={['at', s.value].join(' ')} style={at(textX, 39.5)}>{value}</span>
      <span className="atc" style={at(chevronX, 39.5)}><Icon icon={ChevronDown} size={28} stroke={2.4} /></span>
      <input ref={ref} type={inputType} className={s.native} value={inputValue} aria-label={label}
             onChange={(e) => e.target.value && onChange(e.target.value)} />
    </div>
  );
}
