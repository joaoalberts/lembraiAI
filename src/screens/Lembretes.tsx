import { useState } from 'react';
import { Ellipsis, Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppBrand } from '../components/AppBrand';
import { CtaButton, GlassButton } from '../components/Button';
import { FilterChip } from '../components/FilterChip';
import { Screen } from '../components/Frame';
import { HomeIndicator } from '../components/HomeIndicator';
import { Icon } from '../components/Icon';
import { ReminderCard } from '../components/ReminderCard';
import { TabBar } from '../components/TabBar';
import { TipCard } from '../components/TipCard';
import { SECTIONS, SECTION_DATES, type Reminder } from '../data/reminders';
import { at, box, cx, du } from '../lib/du';
import { useStore } from '../state/store';
import s from './Lembretes.module.css';

type FilterKey = 'todos' | 'hoje' | 'semana' | 'locais';
const FILTERS: { key: FilterKey; label: string; left: number; width: number; test: (r: Reminder) => boolean }[] = [
  { key: 'todos', label: 'Todos', left: 37, width: 171, test: () => true },
  { key: 'hoje', label: 'Hoje', left: 228, width: 156, test: (r) => r.section === 'Hoje' },
  { key: 'semana', label: 'Esta semana', left: 404, width: 215, test: (r) => r.section === 'Amanhã' || r.section === 'Esta semana' },
  { key: 'locais', label: 'Locais', left: 639, width: 173, test: (r) => r.kind === 'local' },
];

/** Tela 3 — Meus lembretes (ref/5.png, versão B). */
export function Lembretes() {
  const nav = useNavigate();
  const { reminders, toggle } = useStore();
  const [filter, setFilter] = useState<FilterKey>('todos');

  const test = FILTERS.find((f) => f.key === filter)!.test;
  const visible = reminders.filter(test);
  const groups = SECTIONS.map((sec) => ({ sec, items: visible.filter((r) => r.section === sec) })).filter((g) => g.items.length);
  const active = reminders.filter((r) => r.active).length;

  return (
    <Screen>
      <img className={s.hdrBg} src="/assets/bg-list-header.jpg" alt="" />
      <AppBrand variant="list" className={s.brand} />
      <GlassButton label="Buscar" style={box(612, 77, 84, 84)}><Icon icon={Search} size={40} stroke={2.2} /></GlassButton>
      <GlassButton label="Mais opções" style={box(730, 79, 82, 82)}><Icon icon={Ellipsis} size={42} stroke={2.6} /></GlassButton>

      <h1 className={cx('at', s.title)} style={at(40, 212)}>Meus lembretes</h1>
      <p className={cx('at', s.subtitle)} style={at(40, 262)}>{active} {active === 1 ? 'lembrete ativo' : 'lembretes ativos'}</p>
      <CtaButton variant="orange" size="compact" leading={Plus} style={box(561, 190)} onClick={() => nav('/novo')}>Novo lembrete</CtaButton>

      <div className={s.sheet} />

      {FILTERS.map((f) => (
        <FilterChip key={f.key} label={f.label} count={reminders.filter(f.test).length} active={filter === f.key}
                    width={f.width} style={{ position: 'absolute', left: du(f.left), top: du(317) }}
                    onClick={() => setFilter(f.key)} />
      ))}

      <div className={s.scroll}>
        {groups.map(({ sec, items }) => (
          <section key={sec} className={s.section}>
            <header className={s.head}>
              <h2>{sec}</h2>
              {SECTION_DATES[sec] && <span>{SECTION_DATES[sec]}</span>}
            </header>
            <div className={s.cards}>
              {items.map((r) => <ReminderCard key={r.id} r={r} onToggle={() => toggle(r.id)} />)}
            </div>
          </section>
        ))}
        <TipCard variant="list" className={s.tip} title="Dica para você"
                 text={'Ative lembretes por local para nunca mais\nesquecer das suas tarefas fora de casa.'} />
      </div>

      <TabBar active="lembretes" />
      <HomeIndicator variant="list" />
    </Screen>
  );
}
