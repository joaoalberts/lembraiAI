import { useRef, type CSSProperties } from 'react';
import { ChevronDown, type LucideIcon } from 'lucide-react';
import { at, cx } from '../lib/du';
import { Icon } from './Icon';
import s from './SelectField.module.css';

interface Props {
  style: CSSProperties;
  icon: LucideIcon;
  value: string;
  label: string;
  iconX: number; textX: number; chevronX: number;
  /** Com `onOpen` o campo é um botão que abre um seletor próprio (ex.: TimeSheet). */
  onOpen?: () => void;
  /** Sem `onOpen`: seletor nativo do navegador (input date/time invisível sobre o campo). */
  inputType?: 'date' | 'time';
  inputValue?: string;
  onChange?: (v: string) => void;
}

/** Campo "select" (Data/Horário). O visual vem da imagem; o seletor é o nativo ou um próprio (`onOpen`). */
export function SelectField({ style, icon, value, label, iconX, textX, chevronX, onOpen, inputType = 'date', inputValue, onChange }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const face = (
    <>
      <span className="atc" style={at(iconX, 39.5)}><Icon icon={icon} size={32} stroke={2} /></span>
      <span className={['at', s.value].join(' ')} style={at(textX, 39.5)}>{value}</span>
      <span className="atc" style={at(chevronX, 39.5)}><Icon icon={ChevronDown} size={28} stroke={2.4} /></span>
    </>
  );

  if (onOpen) {
    return (
      <button type="button" className={cx(s.field, s.btn)} style={style} aria-haspopup="dialog" aria-label={`${label}: ${value}`} onClick={onOpen}>
        {face}
      </button>
    );
  }
  return (
    <div className={s.field} style={style} onClick={() => ref.current?.showPicker?.()}>
      {face}
      <input ref={ref} type={inputType} className={s.native} value={inputValue} aria-label={label}
             onChange={(e) => e.target.value && onChange?.(e.target.value)} />
    </div>
  );
}
