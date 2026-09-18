import { CalendarDays, Ellipsis, MapPin } from 'lucide-react';
import type { Reminder } from '../data/reminders';
import { at, box, cx } from '../lib/du';
import { Icon, RadiusIcon } from './Icon';
import { IconCircle } from './IconCircle';
import { REMINDER_ICONS, REMINDER_ICON_ROTATION } from './ReminderIcon';
import { Tag } from './Tag';
import { Toggle } from './Toggle';
import s from './ReminderCard.module.css';

/** Item da lista (ref/5.png). Duas variações medidas: com local (miniatura de mapa) e por horário. */
export function ReminderCard({ r, onToggle }: { r: Reminder; onToggle: () => void }) {
  const Ic = REMINDER_ICONS[r.icon];
  const local = r.kind === 'local';
  const x = local ? 144 : 153; // início da coluna de texto
  return (
    <article className={cx(s.card, local ? s.local : s.time)}>
      <i className={s.bar} style={{ background: `var(--cat-${r.category}-bar)` }} />
      <IconCircle size={92} bg={`var(--cat-${r.category}-bg)`} style={box(28, 17)}>
        <Icon icon={Ic} size={50} stroke={1.9} rotate={REMINDER_ICON_ROTATION[r.icon]} color={`var(--cat-${r.category}-ink)`} />
      </IconCircle>

      <h3 className={cx('at', s.title)} style={at(x, 35)}>{r.title}</h3>

      {local ? (
        <>
          <span className="atc" style={at(156, 75)}><Icon icon={MapPin} size={30} stroke={2.2} /></span>
          <span className={cx('at', s.place)} style={at(183, 75)}>{r.place}</span>
          <span className="atc" style={at(156, 108)}><RadiusIcon size={26} color="#8B93A0" /></span>
          <span className={cx('at', s.meta)} style={at(183, 108)}>Raio de {r.radius} metros</span>
        </>
      ) : (
        <>
          <span className="atc" style={at(x + 13, 76)}><Icon icon={CalendarDays} size={30} stroke={2.1} /></span>
          <span className={cx('at', s.meta)} style={at(x + 41, 76)}>{r.dateLabel}</span>
        </>
      )}

      <Tag category={r.category} style={box(x, local ? 133 : 104)}>{local ? 'Por local' : 'Por horário'}</Tag>

      <button type="button" aria-label="Mais opções" className={cx('atc', s.more)} style={at(741, 35)}><Icon icon={Ellipsis} size={34} stroke={2.6} /></button>
      <span className={cx('atc', s.hour)} style={at(local ? 693 : 676, local ? 77 : 42)}>{r.time}</span>
      <div style={box(local ? 659 : 644, local ? 102 : 68)}>
        <Toggle checked={r.active} onChange={onToggle} label={`Ativar lembrete: ${r.title}`} />
      </div>

      {local && r.thumb && <img className={s.thumb} src={r.thumb} alt="" style={box(485, 22, 136, 138)} />}
    </article>
  );
}
