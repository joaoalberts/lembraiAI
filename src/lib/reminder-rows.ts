import type { Category, IconKey, Reminder, RepeatKey } from '../data/reminders';
import { detectCategory } from './categorize';

/** Rascunho do formulário. Ícone e cor não fazem parte dele: saem da descrição (lib/categorize.ts). */
export interface Draft {
  title: string;
  kind: 'local' | 'time';
  dateISO: string;
  time: string;
  repeat: RepeatKey;
  place: string;
  lat?: number;
  lng?: number;
  radius: number;
}

/** Linha da tabela `public.reminders` (snake_case, data e hora separadas) — o mesmo schema do app web. */
export interface Row {
  id: string; user_id: string; title: string; kind: 'local' | 'time';
  category: Category; icon: IconKey;
  place: string | null; lat: number | null; lng: number | null; radius: number | null;
  remind_date: string; remind_time: string; repeat: RepeatKey; active: boolean;
}

export function fromRow(r: Row): Reminder {
  return {
    id: r.id,
    title: r.title,
    category: r.category,
    icon: r.icon,
    kind: r.kind,
    place: r.place ?? undefined,
    lat: r.lat ?? undefined,
    lng: r.lng ?? undefined,
    radius: r.radius ?? undefined,
    dateISO: r.remind_date,
    time: r.remind_time.slice(0, 5),          // o Postgres devolve "09:00:00"
    repeat: r.repeat,
    active: r.active,
  };
}

/** A tabela recusa um lembrete "por local" sem lat/lng/raio (constraint reminders_local_precisa_de_coordenadas). */
export function toRow(d: Draft, userId: string) {
  const local = d.kind === 'local';
  const title = d.title.trim();
  const { category, icon } = detectCategory(title, local);
  return {
    user_id: userId,
    title,
    kind: d.kind,
    category,
    icon,
    place: local ? d.place.trim() || null : null,
    lat: local ? d.lat ?? null : null,
    lng: local ? d.lng ?? null : null,
    radius: local ? d.radius : null,
    remind_date: d.dateISO,
    remind_time: d.time,
    repeat: d.repeat,
  };
}
