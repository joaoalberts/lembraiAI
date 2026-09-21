import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LatLng } from '../lib/geo';
import { useAuth } from './auth';

const STORAGE_KEY = 'lembreiai:monitorar-local';

export interface Position extends LatLng { accuracy: number | null; at: number }

interface GeoState {
  /** Vigia ligada pelo usuário (fica salva). Só acompanha a posição com ela ligada e com o usuário logado. */
  monitoring: boolean;
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
  const userId = user?.id;
  const [monitoring, setMonitoringState] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => setMonitoringState(v === '1')).catch(() => {});
  }, []);

  // estado atual da permissão, sem provocar o pedido
  useEffect(() => {
    if (!userId) { setPosition(null); return; }
    Location.getForegroundPermissionsAsync().then((p) => setPermissionGranted(p.granted)).catch(() => {});
  }, [userId]);

  const ensurePermission = useCallback(async () => {
    const atual = await Location.getForegroundPermissionsAsync();
    const ok = atual.granted || (atual.canAskAgain && (await Location.requestForegroundPermissionsAsync()).granted);
    setPermissionGranted(ok);
    return ok;
  }, []);

  const setMonitoring = useCallback(async (on: boolean) => {
    if (on && !(await ensurePermission())) {
      setError('Permissão de localização negada. Libere nos ajustes do aparelho.');
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

  // Segue o mesmo desenho do app web: GPS de alta precisão, leitura a cada ~5 s ou 10 m (quem decide é o sistema).
  useEffect(() => {
    if (!monitoring || !userId || !permissionGranted) return;
    let cancelado = false;
    let sub: Location.LocationSubscription | null = null;
    Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
      (loc) => { setPosition(toPosition(loc)); setError(null); },
    )
      .then((s) => { if (cancelado) s.remove(); else sub = s; })
      .catch(() => setError('Não foi possível acompanhar sua posição.'));
    return () => { cancelado = true; sub?.remove(); };
  }, [monitoring, userId, permissionGranted]);

  const value = useMemo<GeoState>(
    () => ({ monitoring, permissionGranted, position, error, setMonitoring, getCurrentPosition }),
    [monitoring, permissionGranted, position, error, setMonitoring, getCurrentPosition],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGeo(): GeoState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useGeo fora do GeoProvider');
  return ctx;
}
