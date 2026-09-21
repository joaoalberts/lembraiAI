import '@testing-library/react-native/matchers';
import { render, screen } from '@testing-library/react-native';
import { useIsFocused, useLocalSearchParams } from 'expo-router';
import EditarLembreteScreen from '../../app/(app)/editar';
import type { Reminder } from '../data/reminders';
import { comAreaSegura } from '../test-utils/area-segura';
import { useReminders } from '../state/reminders';

jest.mock('expo-router', () => ({ useLocalSearchParams: jest.fn(), useIsFocused: jest.fn(), router: { back: jest.fn(), navigate: jest.fn(), replace: jest.fn(), canGoBack: jest.fn(() => true) } }));
jest.mock('../state/reminders', () => ({ useReminders: jest.fn() }));
jest.mock('../state/auth', () => ({ useAuth: () => ({ user: { email: 'joao.teste@exemplo.com' }, nome: '', sair: jest.fn(), trocarSenha: jest.fn() }) }));
jest.mock('../state/geo', () => ({ useGeo: () => ({ position: null, getCurrentPosition: jest.fn() }) }));
jest.mock('../components/MapaDeEscolha', () => ({ MapaDeEscolha: () => null }));

const lembrete: Reminder = { id: 'a1', title: 'Tomar vitamina', category: 'blue', icon: 'pill', kind: 'time', dateISO: '2026-09-22', time: '08:00', repeat: 'daily', active: true };

function abrir(id: string | undefined, estado: { reminders: Reminder[]; carregando: boolean }, emFoco = true) {
  jest.mocked(useIsFocused).mockReturnValue(emFoco);
  jest.mocked(useLocalSearchParams).mockReturnValue({ id } as never);
  jest.mocked(useReminders).mockReturnValue({ ...estado, create: jest.fn(), update: jest.fn() } as unknown as ReturnType<typeof useReminders>);
  return render(comAreaSegura(<EditarLembreteScreen />));
}

describe('tela Editar lembrete', () => {
  it('com o lembrete na lista abre o formulário já preenchido', async () => {
    await abrir('a1', { reminders: [lembrete], carregando: false });
    expect(screen.getByRole('header', { name: 'Editar lembrete' })).toBeTruthy();
    expect(screen.getByLabelText('Descrição')).toHaveProp('value', 'Tomar vitamina');
    expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeTruthy();
  });

  it('enquanto a lista chega (página recarregada) espera em vez de abrir um formulário em branco', async () => {
    await abrir('a1', { reminders: [], carregando: true });
    expect(screen.queryByLabelText('Descrição')).toBeNull();
    expect(screen.queryByText('Esse lembrete não existe mais.')).toBeNull();
    expect(JSON.stringify(screen.toJSON())).toContain('ActivityIndicator');
  });

  it('se o lembrete não existe mais (foi excluído) avisa e não abre o formulário', async () => {
    await abrir('sumiu', { reminders: [lembrete], carregando: false });
    expect(screen.getByText('Esse lembrete não existe mais.')).toBeTruthy();
    expect(screen.queryByLabelText('Descrição')).toBeNull();
  });

  it('fora de foco (a pessoa foi para outra aba) não mostra nada, para não deixar um segundo formulário no ar', async () => {
    await abrir('a1', { reminders: [lembrete], carregando: false }, false);
    expect(screen.queryByLabelText('Descrição')).toBeNull();
    expect(screen.queryByText('Esse lembrete não existe mais.')).toBeNull();
  });

  it('sem id no endereço também avisa', async () => {
    await abrir(undefined, { reminders: [lembrete], carregando: false });
    expect(screen.getByText('Esse lembrete não existe mais.')).toBeTruthy();
  });
});
