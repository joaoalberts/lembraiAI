import { useState } from 'react';
import { Ellipsis, Plus, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppBrand } from '../components/AppBrand';
import { CtaButton, GlassButton } from '../components/Button';
import { FilterChip } from '../components/FilterChip';
import { Screen } from '../components/Frame';
import { HomeIndicator } from '../components/HomeIndicator';
import { Icon } from '../components/Icon';
import { ListHeaderBg } from '../components/ListHeaderBg';
import { ConfirmSheet } from '../components/ConfirmSheet';
import { ReminderCard } from '../components/ReminderCard';
import { ReminderMenu } from '../components/ReminderMenu';
import { SearchField } from '../components/SearchField';
import { TabBar } from '../components/TabBar';
import { TipCard } from '../components/TipCard';
import { SECTIONS, SECTION_DATES, type Reminder } from '../data/reminders';
import { at, box, cx, du } from '../lib/du';
import { fold } from '../lib/format';
import { toDraft, useStore } from '../state/store';
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
  const { reminders, toggle, remove } = useStore();
  const [menuFor, setMenuFor] = useState<Reminder | null>(null);       // lembrete cujo "⋯" está aberto
  const [deleting, setDeleting] = useState<Reminder | null>(null);     // aguardando confirmação de exclusão
  const [filter, setFilter] = useState<FilterKey>('todos');
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const closeSearch = () => { setSearching(false); setQuery(''); };

  // a busca (título, local, data, hora) vale junto com o filtro do chip; os contadores dos chips acompanham a busca
  const q = fold(query.trim());
  const matches = q ? reminders.filter((r) => fold([r.title, r.place, r.dateLabel, r.time].filter(Boolean).join(' ')).includes(q)) : reminders;
  const test = FILTERS.find((f) => f.key === filter)!.test;
  const visible = matches.filter(test);
  const groups = SECTIONS.map((sec) => ({ sec, items: visible.filter((r) => r.section === sec) })).filter((g) => g.items.length);
  const active = reminders.filter((r) => r.active).length;

  return (
    <Screen>
      <ListHeaderBg />
      {searching ? <SearchField value={query} onChange={setQuery} onClose={closeSearch} /> : <AppBrand variant="list" className={s.brand} />}
      <GlassButton label={searching ? 'Fechar busca' : 'Buscar'} style={box(612, 77, 84, 84)} onClick={searching ? closeSearch : () => setSearching(true)}>
        <Icon icon={searching ? X : Search} size={searching ? 36 : 40} stroke={searching ? 2.4 : 2.2} />
      </GlassButton>
      <GlassButton label="Mais opções" style={box(730, 79, 82, 82)}><Icon icon={Ellipsis} size={42} stroke={2.6} /></GlassButton>

      <h1 className={cx('at', s.title)} style={at(40, 212)}>Meus lembretes</h1>
      <p className={cx('at', s.subtitle)} style={at(40, 262)}>{active} {active === 1 ? 'lembrete ativo' : 'lembretes ativos'}</p>
      <CtaButton variant="orange" size="compact" leading={Plus} style={box(561, 190)} onClick={() => nav('/novo')}>Novo lembrete</CtaButton>

      <div className={s.sheet} />

      {FILTERS.map((f) => (
        <FilterChip key={f.key} label={f.label} count={matches.filter(f.test).length} active={filter === f.key}
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
              {items.map((r) => <ReminderCard key={r.id} r={r} onToggle={() => toggle(r.id)} onMore={() => setMenuFor(r)} />)}
            </div>
          </section>
        ))}
        {q && !groups.length && (
          <div className={s.empty}>
            <h2>Nenhum resultado para “{query.trim()}”</h2>
            <p>Confira a grafia ou busque por outro nome ou local.</p>
          </div>
        )}
        {!q && (
          <TipCard variant="list" className={s.tip} title="Dica para você"
                   text={'Ative lembretes por local para nunca mais\nesquecer das suas tarefas fora de casa.'} />
        )}
      </div>

      <TabBar active="lembretes" />
      <HomeIndicator />

      {menuFor && (
        <ReminderMenu r={menuFor} onClose={() => setMenuFor(null)}
                      onEdit={() => nav('/novo', { state: { draft: toDraft(menuFor), editId: menuFor.id, from: '/lembretes' } })}
                      onDelete={() => { setDeleting(menuFor); setMenuFor(null); }} />
      )}
      {deleting && (
        <ConfirmSheet title="Excluir lembrete?" message={`“${deleting.title}” será removido e você não receberá mais esse aviso.`}
                      confirmLabel="Excluir lembrete" onConfirm={() => { remove(deleting.id); setDeleting(null); }} onClose={() => setDeleting(null)} />
      )}
    </Screen>
  );
}
