import type { CSSProperties } from 'react';
import { Check, type LucideIcon } from 'lucide-react';
import { at, box, cx } from '../lib/du';
import { Icon } from './Icon';
import { IconCircle } from './IconCircle';
import s from './OptionCard.module.css';

interface Props {
  style: CSSProperties;
  icon: LucideIcon;
  title: string;
  desc: string;
  selected: boolean;
  onSelect: () => void;
}

/** Card-opção (radio): selecionado = fundo branco + borda forest-700 + badge de check; senão anel de radio. */
export function OptionCard({ style, icon, title, desc, selected, onSelect }: Props) {
  return (
    <button type="button" role="radio" aria-checked={selected} onClick={onSelect} style={style}
            className={cx(s.card, selected && s.selected)}>
      <IconCircle size={76} bg="var(--mint-100)" style={box(25, 22)}><Icon icon={icon} size={34} stroke={2} /></IconCircle>
      <span className={cx('at', s.title)} style={at(120, 45)}>{title}</span>
      <span className={cx('at', s.desc)} style={at(120, 77)}>{desc}</span>
      {selected
        ? <span className={s.badge}><Icon icon={Check} size={24} stroke={3.4} color="#fff" /></span>
        : <span className={s.radio} />}
    </button>
  );
}
