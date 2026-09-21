import { fireEvent, render, screen } from '@testing-library/react-native';
import type { Reminder } from '../../data/reminders';
import { ReminderCard } from '../ReminderCard';

const porHorario: Reminder = {
  id: '1', title: 'Tomar remédio', category: 'blue', icon: 'pill', kind: 'time',
  dateISO: '2026-09-20', time: '09:00', repeat: 'daily', active: true,
};
const porLocal: Reminder = {
  id: '2', title: 'Comprar leite', category: 'green', icon: 'cart', kind: 'local',
  place: 'Mercado da esquina', lat: -3.75, lng: -38.48, radius: 300, dateISO: '2026-09-20', time: '09:00', repeat: 'never', active: true,
};

describe('ReminderCard', () => {
  it('por horário: mostra título, data, hora e repetição', async () => {
    await render(<ReminderCard reminder={porHorario} onToggle={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText('Tomar remédio')).toBeTruthy();
    expect(screen.getByText('Dom, 20 de set de 2026 · 09:00 · Todos os dias')).toBeTruthy();
  });

  it('por local: mostra o lugar e o raio', async () => {
    await render(<ReminderCard reminder={porLocal} onToggle={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText('Mercado da esquina · raio de 300 m')).toBeTruthy();
  });

  it('só mostra "Você está aqui" quando está dentro do raio', async () => {
    await render(<ReminderCard reminder={porLocal} onToggle={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.queryByText('📍 Você está aqui')).toBeNull();
    await render(<ReminderCard reminder={porLocal} nearby onToggle={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText('📍 Você está aqui')).toBeTruthy();
  });

  it('o interruptor e o botão de excluir chamam os callbacks', async () => {
    const onToggle = jest.fn();
    const onDelete = jest.fn();
    await render(<ReminderCard reminder={porHorario} onToggle={onToggle} onDelete={onDelete} />);

    await fireEvent(screen.getByLabelText('Ativar lembrete Tomar remédio'), 'valueChange', false);
    expect(onToggle).toHaveBeenCalledTimes(1);

    await fireEvent.press(screen.getByLabelText('Excluir lembrete Tomar remédio'));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
