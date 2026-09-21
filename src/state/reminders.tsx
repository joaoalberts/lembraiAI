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
  /** Salva a edição de um lembrete existente (o mesmo formulário da criação). */
  update: (id: string, d: Draft) => Promise<Reminder | null>;
  remove: (id: string) => Promise<void>;
}

const Ctx = createContext<Store | null>(null);

const ordenar = (a: Reminder, b: Reminder) => a.dateISO.localeCompare(b.dateISO) || a.time.localeCompare(b.time);

export function RemindersProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [emPedido, setEmPedido] = useState(false);
  // Conta cuja primeira resposta já chegou (com dados ou com erro). Até lá `carregando` vale desde o primeiro render: o efeito
  // que busca só roda depois dele, e um render sem lista e sem "carregando" faria as telas piscarem "não existe mais".
  const [respondeuPara, setRespondeuPara] = useState<string | undefined>(undefined);
  const [erro, setErro] = useState<string | null>(null);
  const pedido = useRef(0);
  const carregando = emPedido || (userId !== undefined && respondeuPara !== userId);

  const recarregar = useCallback(async () => {
    const id = ++pedido.current;
    if (!userId) { setReminders([]); setErro(null); setEmPedido(false); return; }
    setEmPedido(true);
    const { data, error } = await supabase.from('reminders').select('*').eq('user_id', userId)
      .order('remind_date').order('remind_time');
    if (id !== pedido.current) return;          // trocou de conta ou recarregou no meio: descarta a resposta velha
    if (error) setErro('Não foi possível carregar seus lembretes.');
    else { setReminders((data as Row[]).map(fromRow)); setErro(null); }
    setRespondeuPara(userId);
    setEmPedido(false);
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

  /**
   * Categoria e ícone saem de novo do título (como na criação). Os avisos agendados e os geofences dependem só da lista,
   * então se refazem sozinhos quando ela muda: não há nada a agendar aqui.
   */
  const update = useCallback(async (id: string, d: Draft) => {
    if (!userId) return null;
    const { user_id: _dono, ...campos } = toRow(d, userId);
    const { data, error } = await supabase.from('reminders').update(campos).eq('id', id).select().single();
    if (error || !data) { setErro('Não foi possível salvar o lembrete.'); return null; }
    const atualizado = fromRow(data as Row);
    setReminders((rs) => rs.map((r) => (r.id === id ? atualizado : r)).sort(ordenar));
    setErro(null);
    return atualizado;
  }, [userId]);

  const remove = useCallback(async (id: string) => {
    const antes = reminders;
    setReminders((rs) => rs.filter((r) => r.id !== id));
    const { error } = await supabase.from('reminders').delete().eq('id', id);
    if (error) { setReminders(antes); setErro('Não foi possível excluir o lembrete.'); }
  }, [reminders]);

  const value = useMemo<Store>(
    () => ({ reminders, carregando, erro, recarregar, toggle, create, update, remove }),
    [reminders, carregando, erro, recarregar, toggle, create, update, remove],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useReminders(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error('useReminders fora do RemindersProvider');
  return s;
}
