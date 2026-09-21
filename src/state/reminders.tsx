import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Reminder } from '../data/reminders';
import { fromRow, toRow, type Draft, type Row } from '../lib/reminder-rows';
import { supabase } from '../lib/supabase';
import { useAuth } from './auth';

export type { Draft };

interface Store {
  reminders: Reminder[];
  carregando: boolean;
  erro: string | null;
  recarregar: () => Promise<void>;
  toggle: (id: string) => Promise<void>;
  create: (d: Draft) => Promise<Reminder | null>;
  remove: (id: string) => Promise<void>;
}

const Ctx = createContext<Store | null>(null);

const ordenar = (a: Reminder, b: Reminder) => a.dateISO.localeCompare(b.dateISO) || a.time.localeCompare(b.time);

export function RemindersProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const pedido = useRef(0);

  const recarregar = useCallback(async () => {
    const id = ++pedido.current;
    if (!userId) { setReminders([]); setErro(null); setCarregando(false); return; }
    setCarregando(true);
    const { data, error } = await supabase.from('reminders').select('*').eq('user_id', userId)
      .order('remind_date').order('remind_time');
    if (id !== pedido.current) return;          // trocou de conta ou recarregou no meio: descarta a resposta velha
    if (error) setErro('Não foi possível carregar seus lembretes.');
    else { setReminders((data as Row[]).map(fromRow)); setErro(null); }
    setCarregando(false);
  }, [userId]);

  useEffect(() => { void recarregar(); }, [recarregar]);

  /** O interruptor responde na hora e volta atrás se o banco recusar. */
  const toggle = useCallback(async (id: string) => {
    const alvo = reminders.find((r) => r.id === id);
    if (!alvo) return;
    const novo = !alvo.active;
    setReminders((rs) => rs.map((r) => (r.id === id ? { ...r, active: novo } : r)));
    const { error } = await supabase.from('reminders').update({ active: novo }).eq('id', id);
    if (error) {
      setReminders((rs) => rs.map((r) => (r.id === id ? { ...r, active: alvo.active } : r)));
      setErro('Não foi possível salvar a alteração.');
    }
  }, [reminders]);

  const create = useCallback(async (d: Draft) => {
    if (!userId) return null;
    const { data, error } = await supabase.from('reminders').insert(toRow(d, userId)).select().single();
    if (error || !data) { setErro('Não foi possível criar o lembrete.'); return null; }
    const novo = fromRow(data as Row);
    setReminders((rs) => [...rs, novo].sort(ordenar));
    setErro(null);
    return novo;
  }, [userId]);

  const remove = useCallback(async (id: string) => {
    const antes = reminders;
    setReminders((rs) => rs.filter((r) => r.id !== id));
    const { error } = await supabase.from('reminders').delete().eq('id', id);
    if (error) { setReminders(antes); setErro('Não foi possível excluir o lembrete.'); }
  }, [reminders]);

  const value = useMemo<Store>(
    () => ({ reminders, carregando, erro, recarregar, toggle, create, remove }),
    [reminders, carregando, erro, recarregar, toggle, create, remove],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useReminders(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error('useReminders fora do RemindersProvider');
  return s;
}
