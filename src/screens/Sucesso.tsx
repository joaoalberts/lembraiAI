import { CalendarDays, Clock, Copy, MapPin, Pencil, RefreshCw, Share, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ActionButton, CtaButton, GlassButton, LinkButton } from '../components/Button';
import { Screen } from '../components/Frame';
import { Icon } from '../components/Icon';
import { IconCircle } from '../components/IconCircle';
import { REMINDER_ICONS } from '../components/ReminderIcon';
import { StatusPill } from '../components/StatusPill';
import { TipCard } from '../components/TipCard';
import { DEFAULT_DATE_LABEL, DEFAULT_PLACE, type Reminder } from '../data/reminders';
import { at, box, cx } from '../lib/du';
import { toDraft, useStore } from '../state/store';
import s from './Sucesso.module.css';

/** Exemplo exibido quando a tela é aberta sem ter criado um lembrete (ref/4.png). */
const SAMPLE: Reminder = {
  id: 'sample', title: 'Comprar água no mercado', category: 'green', icon: 'cart', kind: 'local', place: DEFAULT_PLACE,
  radius: 150, dateLabel: DEFAULT_DATE_LABEL, time: '09:00', repeat: 'Nunca', section: 'Hoje', active: true,
  thumb: '/assets/thumb-sucesso.jpg',
};

function InfoIcon({ icon, style }: { icon: typeof MapPin; style: React.CSSProperties }) {
  return <IconCircle size={70} bg="#F7F5F3" className={s.info} style={style}><Icon icon={icon} size={36} stroke={2} /></IconCircle>;
}

/** Tela 4 — Lembrete criado (ref/4.png). Fundo = arte (bg-success.jpg, com o ícone 3D); o resto é código. */
export function Sucesso() {
  const nav = useNavigate();
  const { lastCreated, remove, duplicate } = useStore();
  const r = lastCreated ?? SAMPLE;
  const Ic = REMINDER_ICONS[r.icon];
  const hasPlace = Boolean(r.place);
  const repeatTop = hasPlace ? 442 : 282;
  const real = r.id !== 'sample';

  const edit = () => nav('/novo', { state: { draft: toDraft(r), editId: real ? r.id : undefined } });
  const dup = () => { if (real) duplicate(r.id); nav('/lembretes'); };
  const del = () => { if (real) remove(r.id); nav('/lembretes'); };
  const share = async () => {
    const text = `${r.title} — ${r.dateLabel} às ${r.time}${r.place ? ` · ${r.place}` : ''}`;
    try {
      if (navigator.share) await navigator.share({ title: 'Lembrete Geo', text });
      else await navigator.clipboard.writeText(text);
    } catch { /* compartilhamento cancelado pelo usuário */ }
  };

  return (
    <Screen>
      <img className={s.bg} src="/assets/bg-success.jpg" alt="" />
      <GlassButton label="Fechar" style={box(741, 56, 76, 76)} onClick={() => nav('/lembretes')}><Icon icon={X} size={32} stroke={2.4} /></GlassButton>

      <h1 className={s.title}>{'Lembrete criado\ncom sucesso!'}</h1>
      <p className={s.sub}>{'Você será avisado na hora certa.\nPode ficar tranquilo.'}</p>

      <section className={s.card} style={box(33, 584, 783, hasPlace ? 544 : 384)}>
        <IconCircle size={102} bg="#D4EADE" style={box(35, 33)}><Icon icon={Ic} size={54} stroke={1.9} /></IconCircle>
        <h2 className={cx('at', s.cardTitle)} style={at(159, 84)}>{r.title}</h2>
        <div style={box(626, 40)}><StatusPill>Ativo</StatusPill></div>

        <InfoIcon icon={CalendarDays} style={box(35, 168)} />
        <span className={cx('at', s.label)} style={at(123, 186)}>Data</span>
        <span className={cx('at', s.value)} style={at(123, 220)}>{r.dateLabel}</span>
        <InfoIcon icon={Clock} style={box(451, 168)} />
        <span className={cx('at', s.label)} style={at(538, 186)}>Horário</span>
        <span className={cx('at', s.value)} style={at(538, 220)}>{r.time}</span>
        <hr className={s.divider} style={box(35, 263, 715)} />

        {hasPlace && (
          <>
            <InfoIcon icon={MapPin} style={box(35, 282)} />
            <span className={cx('at', s.label)} style={at(123, 300)}>Local</span>
            <span className={cx('at', s.value)} style={at(123, 333)}>{r.place}</span>
            <span className={cx('at', s.radius)} style={at(123, 364)}>Raio de {r.radius} metros</span>
            <img className={s.thumb} src={r.thumb ?? '/assets/thumb-sucesso.jpg'} alt="" style={box(586, 280, 164, 119)} />
            <hr className={s.divider} style={box(35, 420, 715)} />
          </>
        )}

        <InfoIcon icon={RefreshCw} style={box(35, repeatTop)} />
        <span className={cx('at', s.label)} style={at(123, repeatTop + 18)}>Repetir</span>
        <span className={cx('at', s.value)} style={at(123, repeatTop + 52)}>{r.repeat}</span>
      </section>

      <ActionButton icon={Pencil} label="Editar" style={box(57, 1158)} onClick={edit} />
      <ActionButton icon={Copy} label="Duplicar" style={box(250, 1158)} onClick={dup} />
      <ActionButton icon={Trash2} label="Excluir" style={box(445, 1158)} onClick={del} />
      <ActionButton icon={Share} label="Compartilhar" style={box(639, 1158)} onClick={share} />

      <TipCard variant="success" title="Dica inteligente" style={box(33, 1315)}
               text={'Crie lembretes recorrentes para não esquecer\ndas suas tarefas importantes.'} />

      <CtaButton variant="dark" size="success" arrow="inline" style={box(38, 1513)} onClick={() => nav('/lembretes')}>Ver todos os lembretes</CtaButton>
      <LinkButton style={{ position: 'absolute', left: 0, right: 0, top: `calc(1662 * var(--u))`, textAlign: 'center' }} onClick={() => nav('/novo')}>Criar outro lembrete</LinkButton>
    </Screen>
  );
}
