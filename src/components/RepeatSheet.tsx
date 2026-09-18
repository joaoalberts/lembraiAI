import { Check } from 'lucide-react';
import { REPEAT_OPTIONS } from '../data/reminders';
import { cx } from '../lib/du';
import { BottomSheet } from './BottomSheet';
import { Icon } from './Icon';
import s from './RepeatSheet.module.css';

interface Props { value: string; onSelect: (v: string) => void; onClose: () => void }

/** Seletor de recorrência em folha inferior: escolher uma opção aplica e fecha. */
export function RepeatSheet({ value, onSelect, onClose }: Props) {
  return (
    <BottomSheet title="Repetir" subtitle="Escolha com que frequência o lembrete deve se repetir." onClose={onClose}>
      <div role="radiogroup" aria-label="Repetir" className={s.list}>
        {REPEAT_OPTIONS.map((o) => {
          const on = o.value === value;
          return (
            <button key={o.value} type="button" role="radio" aria-checked={on} className={cx(s.row, on && s.on)} onClick={() => onSelect(o.value)}>
              <span className={s.text}><strong>{o.value}</strong><span>{o.desc}</span></span>
              {on ? <span className={s.badge}><Icon icon={Check} size={22} stroke={3.4} color="#fff" /></span> : <span className={s.radio} />}
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}
