import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useNotifications } from './notifications';
import { useReminders } from './reminders';

/**
 * Não desenha nada: só mantém os avisos agendados no aparelho iguais à lista de lembretes. Deve existir uma única vez.
 * Agenda de novo quando a lista muda e quando o app volta ao primeiro plano: o app pode ter ficado fechado por dias, e a
 * data de início de uma repetição (que era uma janela de avisos datados) pode ter passado, hora de virar gatilho recorrente.
 */
export function ReminderScheduler() {
  const { reminders } = useReminders();
  const { syncReminders } = useNotifications();
  const atuais = useRef(reminders);
  atuais.current = reminders;

  useEffect(() => { void syncReminders(reminders); }, [reminders, syncReminders]);

  useEffect(() => {
    const ouvinte = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') void syncReminders(atuais.current);
    });
    return () => ouvinte.remove();
  }, [syncReminders]);

  return null;
}
