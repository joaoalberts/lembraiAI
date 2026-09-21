import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Reminder } from '../data/reminders';
import { ocorrenciasEntre } from '../lib/ocorrencias';
import { corpoDoLembrete } from '../lib/schedule';
import { useAuth } from './auth';
import type { AvisoNaTela, NotificationsState, NotifyInput } from './notifications-tipos';

export type { NotificationsState, NotifyInput };

/**
 * Avisos na web. O navegador NÃO agenda avisos: com a aba fechada, nada acontece (só um servidor de Web Push conseguiria, e
 * exige HTTPS e, no iPhone, o app instalado na tela de início). Então, com o app aberto, um relógio confere os horários dos
 * lembretes e avisa (1) na tela do app, sempre, e (2) pelo navegador, se a pessoa permitiu e ele tiver a API de avisos.
 */

const CHAVE = 'lembreiai:avisos-web';
const PASSO = 5_000;
/** O app aberto (ou a aba acordando) depois disso não avisa de algo velho: a hora passou. */
const TOLERANCIA = 30 * 60_000;
const NA_TELA = 12_000;
const MAXIMO_NA_TELA = 3;
const UM_DIA = 24 * 60 * 60_000;
const ICONE = '/icons/icon-192.png';

interface Guardado { ultimo: number; avisados: string[] }
interface Interno extends AvisoNaTela { chave?: string }

interface ApiDeAvisos {
  permission: string;
  requestPermission: () => Promise<string>;
  new (titulo: string, opcoes?: object): unknown;
}
const apiDeAvisos = (): ApiDeAvisos | undefined => (globalThis as { Notification?: ApiDeAvisos }).Notification;
const servico = () => (globalThis.navigator as { serviceWorker?: { getRegistration: () => Promise<{ showNotification: (t: string, o?: object) => Promise<void> } | undefined> } } | undefined)?.serviceWorker;

function ler(): Guardado | null {
  try {
    const texto = globalThis.localStorage?.getItem(CHAVE);
    if (!texto) return null;
    const g = JSON.parse(texto) as Partial<Guardado>;
    return typeof g.ultimo === 'number' && Array.isArray(g.avisados) ? { ultimo: g.ultimo, avisados: g.avisados } : null;
  } catch {
    return null;
  }
}
function gravar(g: Guardado) {
  try { globalThis.localStorage?.setItem(CHAVE, JSON.stringify(g)); } catch { /* sem armazenamento (aba anônima): o aviso pode repetir ao recarregar */ }
}

async function mostrarNoNavegador({ title, body, data, identifier }: NotifyInput) {
  const N = apiDeAvisos();
  if (!N || N.permission !== 'granted') return;
  const opcoes = { body, tag: identifier, icon: ICONE, data: { url: '/', ...data } };
  try {
    const registro = await servico()?.getRegistration();
    if (registro) { await registro.showNotification(title, opcoes); return; }
  } catch { /* cai no aviso comum */ }
  try { new N(title, opcoes); } catch { /* sem aviso do navegador: fica o da tela */ }
}

const contarProximas24h = (lembretes: Reminder[], agora: number) =>
  lembretes.reduce((soma, r) => soma + ocorrenciasEntre(r, new Date(agora), new Date(agora + UM_DIA)).length, 0);

const Ctx = createContext<NotificationsState | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [avisosNaTela, setAvisosNaTela] = useState<Interno[]>([]);
  const [permissionGranted, setPermissionGranted] = useState(() => apiDeAvisos()?.permission === 'granted');
  const [scheduledCount, setScheduledCount] = useState(0);
  const lembretes = useRef<Reminder[]>([]);
  const seq = useRef(0);
  const temporizadores = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  useEffect(() => () => { temporizadores.current.forEach((t) => clearTimeout(t)); temporizadores.current.clear(); }, []);

  const dispensarAviso = useCallback((id: number) => {
    clearTimeout(temporizadores.current.get(id));
    temporizadores.current.delete(id);
    setAvisosNaTela((atual) => atual.filter((a) => a.id !== id));
  }, []);

  const notifyNow = useCallback(async (n: NotifyInput) => {
    const id = ++seq.current;
    setAvisosNaTela((atual) => {
      // o mesmo identificador troca o aviso que já está na tela
      const repetido = n.identifier ? atual.find((a) => a.chave === n.identifier) : undefined;
      if (repetido) { clearTimeout(temporizadores.current.get(repetido.id)); temporizadores.current.delete(repetido.id); }
      const outros = atual.filter((a) => a !== repetido);
      return [{ id, title: n.title, body: n.body, chave: n.identifier }, ...outros].slice(0, MAXIMO_NA_TELA);
    });
    temporizadores.current.set(id, setTimeout(() => dispensarAviso(id), NA_TELA));
    await mostrarNoNavegador(n);
  }, [dispensarAviso]);

  const syncReminders = useCallback(async (reminders: Reminder[]) => {
    lembretes.current = reminders;
    setScheduledCount(contarProximas24h(reminders, Date.now()));
  }, []);

  const requestPermission = useCallback(async () => {
    const N = apiDeAvisos();
    if (!N?.requestPermission) return false;
    try {
      const ok = (await N.requestPermission()) === 'granted';
      setPermissionGranted(ok);
      return ok;
    } catch {
      return false;
    }
  }, []);

  // o relógio: só com a pessoa logada e o app aberto
  useEffect(() => {
    if (!userId) return;
    const guardado = ler();
    const estado: Guardado = guardado ?? { ultimo: Date.now(), avisados: [] };
    const conferir = () => {
      const agora = Date.now();
      const de = new Date(Math.max(estado.ultimo, agora - TOLERANCIA));
      for (const r of lembretes.current) {
        for (const quando of ocorrenciasEntre(r, de, new Date(agora))) {
          const chave = `${r.id}@${quando.getTime()}`;
          if (estado.avisados.includes(chave)) continue;
          estado.avisados.push(chave);
          void notifyNow({ title: r.title, body: corpoDoLembrete(r), data: { reminderId: r.id }, identifier: chave });
        }
      }
      estado.ultimo = agora;
      estado.avisados = estado.avisados.slice(-100);
      gravar(estado);
      setScheduledCount((antes) => { const agoraContado = contarProximas24h(lembretes.current, agora); return agoraContado === antes ? antes : agoraContado; });
    };
    conferir();
    const relogio = setInterval(conferir, PASSO);
    const aoVoltar = () => { if (globalThis.document?.visibilityState === 'visible') conferir(); };
    globalThis.document?.addEventListener?.('visibilitychange', aoVoltar);
    return () => {
      clearInterval(relogio);
      globalThis.document?.removeEventListener?.('visibilitychange', aoVoltar);
    };
  }, [userId, notifyNow]);

  const value = useMemo<NotificationsState>(
    () => ({ supported: true, modo: 'so-com-o-app-aberto', permissionGranted, scheduledCount, notifyNow, syncReminders, requestPermission, avisosNaTela, dispensarAviso }),
    [permissionGranted, scheduledCount, notifyNow, syncReminders, requestPermission, avisosNaTela, dispensarAviso],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useNotifications(): NotificationsState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useNotifications fora do NotificationsProvider');
  return ctx;
}
