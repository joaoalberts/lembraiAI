import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LatLng } from '../lib/geo';
import { fencesOf } from '../lib/geofence';
import { useAuth } from './auth';
import { useReminders } from './reminders';

const STORAGE_KEY = 'lembreiai:monitorar-local';
const PERMISSAO_NEGADA = 'Permissão de localização negada. Libere nos ajustes do aparelho.';

export interface Position extends LatLng { accuracy: number | null; at: number }

interface GeoState {
  /**
   * A escolha da pessoa (fica salva): vem LIGADA. O app só acompanha a posição de fato quando há um lembrete por local ativo, a
   * permissão foi dada e ela está logada (`watching`): sem lembrete por local não há o que avisar, então não gasta bateria.
   */
  monitoring: boolean;
  /** Acompanhando a posição agora. */
  watching: boolean;
  permissionGranted: boolean;
  position: Position | null;
  error: string | null;
  setMonitoring: (on: boolean) => Promise<void>;
  /** Leitura única (para "usar minha localização"); pede a permissão se ainda não houver. */
  getCurrentPosition: () => Promise<Position | null>;
}

const Ctx = createContext<GeoState | null>(null);

const toPosition = (loc: Location.LocationObject): Position => ({
  lat: loc.coords.latitude,
  lng: loc.coords.longitude,
  accuracy: loc.coords.accuracy,
  at: loc.timestamp,
});

export function GeoProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { reminders } = useReminders();
  const userId = user?.id;
  const temLembretePorLocal = useMemo(() => fencesOf(reminders).length > 0, [reminders]);
  const [monitoring, setMonitoringState] = useState(true);
  const [escolhaLida, setEscolhaLida] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [permissaoLida, setPermissaoLida] = useState(false);
  const [podePerguntar, setPodePerguntar] = useState(true);
  const [position, setPosition] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);
  const jaPediu = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => setMonitoringState(v !== '0')).catch(() => {}).finally(() => setEscolhaLida(true));
  }, []);

  // estado atual da permissão, sem provocar o pedido
  useEffect(() => {
    if (!userId) { setPermissaoLida(false); return; }
    let vivo = true;
    Location.getForegroundPermissionsAsync()
      .then((p) => { if (!vivo) return; setPermissionGranted(p.granted); setPodePerguntar(p.canAskAgain); setPermissaoLida(true); })
      .catch(() => { if (vivo) setPermissaoLida(true); });
    return () => { vivo = false; };
  }, [userId]);

  const ensurePermission = useCallback(async () => {
    const atual = await Location.getForegroundPermissionsAsync();
    const ok = atual.granted || (atual.canAskAgain && (await Location.requestForegroundPermissionsAsync()).granted);
    setPermissionGranted(ok);
    if (ok) setError((e) => (e === PERMISSAO_NEGADA ? null : e));
    return ok;
  }, []);

  // Existe lembrete por local e ainda falta a permissão: pede uma vez, no momento em que ela faz sentido (não na tela de entrar)
  useEffect(() => {
    if (!userId || !escolhaLida || !permissaoLida || !monitoring || !temLembretePorLocal || permissionGranted) return;
    if (!podePerguntar) { setError(PERMISSAO_NEGADA); return; }
    if (jaPediu.current) return;
    jaPediu.current = true;
    ensurePermission().then((ok) => { if (!ok) setError(PERMISSAO_NEGADA); }).catch(() => setError(PERMISSAO_NEGADA));
  }, [userId, escolhaLida, permissaoLida, monitoring, temLembretePorLocal, permissionGranted, podePerguntar, ensurePermission]);

  const setMonitoring = useCallback(async (on: boolean) => {
    if (on && !(await ensurePermission())) {
      setError(PERMISSAO_NEGADA);
      return;
    }
    setError(null);
    setMonitoringState(on);
    if (!on) setPosition(null);
    AsyncStorage.setItem(STORAGE_KEY, on ? '1' : '0').catch(() => {});
  }, [ensurePermission]);

  const getCurrentPosition = useCallback(async () => {
    if (!(await ensurePermission())) return null;
    try {
      return toPosition(await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }));
    } catch {
      return null;
    }
  }, [ensurePermission]);

  const watching = escolhaLida && monitoring && temLembretePorLocal && !!userId && permissionGranted;

  // Segue o mesmo desenho do app web: GPS de alta precisão, leitura a cada ~5 s ou 10 m (quem decide é o sistema).
  useEffect(() => {
    if (!watching) { setPosition(null); return; }
    let cancelado = false;
    let sub: Location.LocationSubscription | null = null;
    Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
      (loc) => { setPosition(toPosition(loc)); setError(null); },
    )
      .then((s) => { if (cancelado) s.remove(); else sub = s; })
      .catch(() => setError('Não foi possível acompanhar sua posição.'));
    return () => { cancelado = true; sub?.remove(); };
  }, [watching]);

  const value = useMemo<GeoState>(
    () => ({ monitoring, watching, permissionGranted, position, error, setMonitoring, getCurrentPosition }),
    [monitoring, watching, permissionGranted, position, error, setMonitoring, getCurrentPosition],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGeo(): GeoState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useGeo fora do GeoProvider');
  return ctx;
}
