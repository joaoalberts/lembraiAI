import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_DATE_ISO, DEFAULT_DATE_LABEL, DEFAULT_PLACE, SEED, type Reminder, type Section } from '../data/reminders';
import { todayISO } from '../lib/format';

export interface Draft {
  title: string;
  kind: 'local' | 'time';
  dateISO: string;
  dateLabel: string;
  time: string;
  repeat: string;
  place: string;
  radius: number;
  hasPlace: boolean;
}

interface Store {
  reminders: Reminder[];
  lastCreated: Reminder | null;
  toggle: (id: string) => void;
  create: (d: Draft) => Reminder;
  update: (id: string, d: Draft) => Reminder | null;
  remove: (id: string) => void;
}

const Ctx = createContext<Store | null>(null);
const uid = () => `n${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

/** Seção da lista pela data real de hoje (não pelas datas de exemplo). */
function sectionOf(iso: string): Section {
  if (iso === todayISO()) return 'Hoje';
  if (iso === todayISO(1)) return 'Amanhã';
  return 'Esta semana';
}

/** Lembrete -> rascunho do formulário (usado por "Editar"). */
export function toDraft(r: Reminder): Draft {
  return {
    title: r.title, kind: r.kind, dateISO: r.dateISO ?? DEFAULT_DATE_ISO, dateLabel: r.dateLabel, time: r.time,
    repeat: r.repeat, place: r.place ?? '', radius: r.radius ?? 150, hasPlace: Boolean(r.place),
  };
}

/** Rascunho do formulário -> lembrete. Estado local em memória (sem persistência nesta versão). */
function fromDraft(d: Draft, id: string): Reminder {
  const local = d.kind === 'local' || d.hasPlace;
  return {
    id,
    title: d.title.trim() || 'Comprar água no mercado',
    category: local ? 'green' : 'blue',
    icon: local ? 'cart' : 'bell',
    kind: local ? 'local' : 'time',
    place: local ? d.place.trim() || DEFAULT_PLACE : undefined,
    radius: local ? d.radius : undefined,
    dateISO: d.dateISO,
    dateLabel: d.dateLabel || DEFAULT_DATE_LABEL,
    time: d.time,
    repeat: d.repeat,
    section: sectionOf(d.dateISO),
    active: true,
    thumb: local ? '/assets/thumb-sucesso.jpg' : undefined,
  };
}

/**
 * Editar: parte do lembrete novo (fromDraft), mas mantém o que o formulário não edita — o status, o ícone e a categoria
 * "temáticos" (haltere, pílula…; o par verde/carrinho ou azul/sino é o padrão do formulário e acompanha o tipo), a
 * miniatura e a seção quando a data não mudou.
 */
function mergeEdit(old: Reminder, fresh: Reminder): Reminder {
  const padrao = (old.category === 'green' && old.icon === 'cart') || (old.category === 'blue' && old.icon === 'bell');
  return {
    ...fresh,
    active: old.active,
    ...(padrao ? {} : { category: old.category, icon: old.icon }),
    section: fresh.dateISO === old.dateISO ? old.section : fresh.section,
    thumb: fresh.kind === 'local' ? old.thumb ?? fresh.thumb : undefined,
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [reminders, setReminders] = useState<Reminder[]>(SEED);
  const [lastCreated, setLastCreated] = useState<Reminder | null>(null);

  const toggle = useCallback((id: string) => {
    setReminders((rs) => rs.map((r) => (r.id === id ? { ...r, active: !r.active } : r)));
  }, []);

  const create = useCallback((d: Draft) => {
    const r = fromDraft(d, uid());
    setReminders((rs) => [...rs, r]);
    setLastCreated(r);
    return r;
  }, []);

  const update = useCallback((id: string, d: Draft) => {
    const old = reminders.find((x) => x.id === id);
    const fresh = fromDraft(d, id);
    const r = old ? mergeEdit(old, fresh) : fresh;
    setReminders((rs) => rs.map((x) => (x.id === id ? r : x)));
    setLastCreated(r);
    return r;
  }, [reminders]);

  const remove = useCallback((id: string) => {
    setReminders((rs) => rs.filter((r) => r.id !== id));
    setLastCreated((l) => (l && l.id === id ? null : l));
  }, []);

  const value = useMemo(() => ({ reminders, lastCreated, toggle, create, update, remove }),
    [reminders, lastCreated, toggle, create, update, remove]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore fora do StoreProvider');
  return s;
}
