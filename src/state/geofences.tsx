import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lembrarCercas, registrarEntrada, registrarSaida } from '../lib/chegadas';
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
  const { reminders, carregando } = useReminders();
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

  // O aparelho guarda título e endereço de cada lugar: com o app fechado, o evento do sistema só traz o id do lembrete.
  // Só depois que os lembretes chegam: uma lista vazia "de passagem" apagaria o que está guardado.
  useEffect(() => {
    if (carregando) return;
    void lembrarCercas(fences, AsyncStorage);
  }, [fences, carregando]);

  useEffect(() => {
    if (!position) {
      // parou de acompanhar: não se sabe mais onde a pessoa está, então nenhuma marca de "dentro" vale
      const estavaDentro = [...inside.current];
      inside.current = new Set();
      setInsideIds([]);
      setNearest(null);
      estavaDentro.forEach((id) => { void registrarSaida(id, AsyncStorage); });
      return;
    }
    // precisão desconhecida não dispara alerta (mesma regra do app web: na dúvida, sem alarme falso)
    const res = evaluate(position, position.accuracy ?? Infinity, fencesRef.current, inside.current);
    const saiu = [...inside.current].filter((id) => !res.inside.has(id));
    inside.current = res.inside;
    setInsideIds([...res.inside]);
    setNearest(res.nearest);
    saiu.forEach((id) => { void registrarSaida(id, AsyncStorage); });
    res.entered.forEach((f) => {
      // o sistema pode já ter avisado desta chegada com o app fechado (ou o app foi reaberto já dentro do raio): a memória do aparelho decide
      void registrarEntrada(f.id, Date.now(), AsyncStorage).then((deveAvisar) => {
        if (!deveAvisar) return;
        setArrivals((prev) => [{ id: f.id, title: f.title, place: f.place, at: Date.now() }, ...prev].slice(0, 20));
        void notifyRef.current({ title: `Você chegou: ${f.title}`, body: f.place || undefined, data: { reminderId: f.id }, identifier: `chegada-${f.id}` });
      });
    });
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
