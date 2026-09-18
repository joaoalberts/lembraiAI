import type { KeyboardEvent } from 'react';
import { ChevronRight, Lightbulb } from 'lucide-react';
import { cx } from '../lib/du';
import { Icon } from './Icon';
import { IconCircle } from './IconCircle';
import s from './TipCard.module.css';

interface Props { variant: 'list' | 'success'; title: string; text: string; className?: string; style?: React.CSSProperties; onClick?: () => void }

/** Card de dica. `list` = fundo mint (ref/5.png) · `success` = fundo claro (ref/4.png). Com `onClick` vira botão. */
export function TipCard({ variant, title, text, className, style, onClick }: Props) {
  const list = variant === 'list';
  const Tag = onClick ? 'div' : 'aside';
  const press = onClick ? {
    role: 'button', tabIndex: 0, onClick,
    onKeyDown: (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } },
  } : {};
  return (
    <Tag className={cx(s.tip, s[variant], onClick && s.press, className)} style={style} {...press}>
      <IconCircle size={list ? 97 : 91} bg={list ? '#C3DFCE' : '#D6ECE0'} className={s.circle}>
        <Icon icon={Lightbulb} size={list ? 50 : 46} stroke={1.9} color={list ? '#013220' : '#040807'} />
      </IconCircle>
      <strong className={cx('at', s.title)}>{title}</strong>
      <p className={cx('at', s.text)}>{text}</p>
      <span className={cx('atc', s.chev)}><Icon icon={ChevronRight} size={list ? 34 : 32} stroke={2.4} /></span>
    </Tag>
  );
}
