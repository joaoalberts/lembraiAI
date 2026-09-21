import '@testing-library/react-native/matchers';
import { render, screen } from '@testing-library/react-native';
import { useIsFocused } from 'expo-router';
import NovoLembreteScreen from '../../app/(app)/novo';
import { comAreaSegura } from '../test-utils/area-segura';
import { useReminders } from '../state/reminders';

jest.mock('expo-router', () => ({ useIsFocused: jest.fn(), router: { back: jest.fn(), navigate: jest.fn(), replace: jest.fn(), canGoBack: jest.fn(() => true) } }));
jest.mock('../state/reminders', () => ({ useReminders: jest.fn() }));
jest.mock('../state/geo', () => ({ useGeo: () => ({ position: null, getCurrentPosition: jest.fn() }) }));
jest.mock('../components/MapaDeEscolha', () => ({ MapaDeEscolha: () => null }));

beforeEach(() => {
  jest.mocked(useReminders).mockReturnValue({ create: jest.fn(), update: jest.fn() } as unknown as ReturnType<typeof useReminders>);
});

describe('tela Novo lembrete', () => {
  it('em foco mostra o formulário em branco', async () => {
    jest.mocked(useIsFocused).mockReturnValue(true);
    await render(comAreaSegura(<NovoLembreteScreen />));
    expect(screen.getByRole('header', { name: 'Novo lembrete' })).toBeTruthy();
    expect(screen.getByLabelText('Descrição')).toHaveProp('value', '');
  });

  it('fora de foco não mostra nada: a aba continua montada, mas o formulário é jogado fora e volta em branco', async () => {
    jest.mocked(useIsFocused).mockReturnValue(false);
    await render(comAreaSegura(<NovoLembreteScreen />));
    expect(screen.queryByLabelText('Descrição')).toBeNull();
    expect(screen.queryByText('Novo lembrete')).toBeNull();
  });
});
