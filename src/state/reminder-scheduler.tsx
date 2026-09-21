import { useEffect } from 'react';
import { useNotifications } from './notifications';
import { useReminders } from './reminders';

/** Não desenha nada: só mantém os avisos agendados no aparelho iguais à lista de lembretes. Deve existir uma única vez. */
export function ReminderScheduler() {
  const { reminders } = useReminders();
  const { syncReminders } = useNotifications();

  useEffect(() => { void syncReminders(reminders); }, [reminders, syncReminders]);

  return null;
}
