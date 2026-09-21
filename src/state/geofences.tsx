import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { evaluate, fencesOf, type Fence } from '../lib/geofence';
import { useGeo } from './geo';
import { useNotifications } from './notifications';
import { useReminders } from './reminders';

export interface Arrival { id: string; title: string; place: string; at: number }

interface GeofencesState {
  fences: Fence[];
  /** Ids dos lembretes por local cujo raio a pessoa está dentro agora. */
  insideIds: string[];
  nearest: { fence: Fence; meters: number } | null;
  arrivals: Arrival[];
}

const Ctx = createContext<GeofencesState | null>(null);

export function GeofencesProvider({ children }: { children: ReactNode }) {
  const { position } = useGeo();
  const { reminders } = useReminders();
  const { notifyNow } = useNotifications();
  const fences = useMemo(() => fencesOf(reminders), [reminders]);
  const fencesRef = useRef(fences);
  fencesRef.current = fences;
  const notifyRef = useRef(notifyNow);
  notifyRef.current = notifyNow;
  const inside = useRef<Set<string>>(new Set());
  const [insideIds, setInsideIds] = useState<string[]>([]);
  const [nearest, setNearest] = useState<GeofencesState['nearest']>(null);
  const [arrivals, setArrivals] = useState<Arrival[]>([]);

  useEffect(() => {
    if (!position) {
      inside.current = new Set();
      setInsideIds([]);
      setNearest(null);
      return;
    }
    // precisão desconhecida não dispara alerta (mesma regra do app web: na dúvida, sem alarme falso)
    const res = evaluate(position, position.accuracy ?? Infinity, fencesRef.current, inside.current);
    inside.current = res.inside;
    setInsideIds([...res.inside]);
    setNearest(res.nearest);
    if (res.entered.length) {
      const at = Date.now();
      setArrivals((prev) => [...res.entered.map((f) => ({ id: f.id, title: f.title, place: f.place, at })), ...prev].slice(0, 20));
      res.entered.forEach((f) => {
        void notifyRef.current({ title: `Você chegou: ${f.title}`, body: f.place || undefined, data: { reminderId: f.id } });
      });
    }
  }, [position]);

  const value = useMemo<GeofencesState>(
    () => ({ fences, insideIds, nearest, arrivals }),
    [fences, insideIds, nearest, arrivals],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGeofences(): GeofencesState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useGeofences fora do GeofencesProvider');
  return ctx;
}
