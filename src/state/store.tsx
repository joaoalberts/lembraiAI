import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_DATE_ISO, DEFAULT_DATE_LABEL, DEFAULT_PLACE, SEED, type Reminder, type Section } from '../data/reminders';

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
  duplicate: (id: string) => Reminder | null;
}

const Ctx = createContext<Store | null>(null);
const uid = () => `n${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

function sectionOf(iso: string): Section {
  if (iso === DEFAULT_DATE_ISO) return 'Hoje';
  if (iso === '2026-09-17') return 'Amanhã';
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
    const r = fromDraft(d, id);
    setReminders((rs) => rs.map((x) => (x.id === id ? { ...r, active: x.active } : x)));
    setLastCreated(r);
    return r;
  }, []);

  const remove = useCallback((id: string) => {
    setReminders((rs) => rs.filter((r) => r.id !== id));
    setLastCreated((l) => (l && l.id === id ? null : l));
  }, []);

  const duplicate = useCallback((id: string) => {
    const src = reminders.find((r) => r.id === id);
    if (!src) return null;
    const copy = { ...src, id: uid() };
    setReminders((rs) => [...rs, copy]);
    return copy;
  }, [reminders]);

  const value = useMemo(() => ({ reminders, lastCreated, toggle, create, update, remove, duplicate }),
    [reminders, lastCreated, toggle, create, update, remove, duplicate]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore fora do StoreProvider');
  return s;
}
