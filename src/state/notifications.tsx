import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { repeatLabel, type Reminder } from '../data/reminders';
import { planNotifications, type Plan } from '../lib/schedule';
import { useAuth } from './auth';

/** O Expo não oferece notificações locais na web: lá o provedor fica inerte. */
const supported = Platform.OS !== 'web';
const CHANNEL_ID = 'lembretes';

if (supported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

function toTrigger(plan: Plan): Notifications.NotificationTriggerInput {
  const T = Notifications.SchedulableTriggerInputTypes;
  const channelId = Platform.OS === 'android' ? CHANNEL_ID : undefined;
  switch (plan.type) {
    case 'date': return { type: T.DATE, date: plan.date, channelId };
    case 'daily': return { type: T.DAILY, hour: plan.hour, minute: plan.minute, channelId };
    case 'weekly': return { type: T.WEEKLY, weekday: plan.weekday, hour: plan.hour, minute: plan.minute, channelId };
    case 'monthly': return { type: T.MONTHLY, day: plan.day, hour: plan.hour, minute: plan.minute, channelId };
    case 'yearly': return { type: T.YEARLY, month: plan.month, day: plan.day, hour: plan.hour, minute: plan.minute, channelId };
  }
}

export interface NotifyInput { title: string; body?: string; data?: Record<string, unknown> }

interface NotificationsState {
  supported: boolean;
  permissionGranted: boolean;
  /** Avisos por horário que estão agendados no aparelho agora. */
  scheduledCount: number;
  notifyNow: (n: NotifyInput) => Promise<void>;
  /** Deixa o agendamento do aparelho idêntico à lista: cancela tudo e agenda de novo os lembretes por horário ativos. */
  syncReminders: (reminders: Reminder[]) => Promise<void>;
}

const Ctx = createContext<NotificationsState | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [scheduledCount, setScheduledCount] = useState(0);
  const chain = useRef<Promise<void>>(Promise.resolve());
  const latest = useRef(0);

  // pede a permissão só depois do login (não na tela de entrar)
  useEffect(() => {
    if (!supported || !userId) return;
    let vivo = true;
    (async () => {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
          name: 'Lembretes',
          importance: Notifications.AndroidImportance.HIGH,
        });
      }
      const atual = await Notifications.getPermissionsAsync();
      const ok = atual.granted || (atual.canAskAgain && (await Notifications.requestPermissionsAsync()).granted);
      if (vivo) setPermissionGranted(ok);
    })().catch(() => { if (vivo) setPermissionGranted(false); });
    return () => { vivo = false; };
  }, [userId]);

  // tocar no aviso abre a lista
  useEffect(() => {
    if (!supported) return;
    const sub = Notifications.addNotificationResponseReceivedListener(() => { router.navigate('/'); });
    return () => sub.remove();
  }, []);

  const notifyNow = useCallback(async ({ title, body, data }: NotifyInput) => {
    if (!supported || !permissionGranted) return;
    try {
      await Notifications.scheduleNotificationAsync({
        content: { title, body, data },
        trigger: Platform.OS === 'android' ? { channelId: CHANNEL_ID } : null,
      });
    } catch (e) {
      console.warn('Não foi possível exibir a notificação', e);
    }
  }, [permissionGranted]);

  const syncReminders = useCallback((reminders: Reminder[]) => {
    if (!supported) return Promise.resolve();
    const id = ++latest.current;
    // uma sincronização por vez, e só a mais recente vale: evita dois "cancelar tudo + agendar" se sobreporem e duplicarem avisos
    chain.current = chain.current.then(async () => {
      if (id !== latest.current) return;
      await Notifications.cancelAllScheduledNotificationsAsync();
      if (permissionGranted) {
        for (const r of reminders) {
          for (const plan of planNotifications(r)) {
            if (id !== latest.current) return;
            await Notifications.scheduleNotificationAsync({
              content: {
                title: r.title,
                body: r.repeat === 'never' ? `Lembrete das ${r.time}` : `Lembrete das ${r.time} · ${repeatLabel(r.repeat)}`,
                data: { reminderId: r.id },
              },
              trigger: toTrigger(plan),
            });
          }
        }
      }
      if (id === latest.current) setScheduledCount((await Notifications.getAllScheduledNotificationsAsync()).length);
    }).catch((e) => console.warn('Falha ao sincronizar os avisos', e));
    return chain.current;
  }, [permissionGranted]);

  const value = useMemo<NotificationsState>(
    () => ({ supported, permissionGranted, scheduledCount, notifyNow, syncReminders }),
    [permissionGranted, scheduledCount, notifyNow, syncReminders],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useNotifications(): NotificationsState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useNotifications fora do NotificationsProvider');
  return ctx;
}
