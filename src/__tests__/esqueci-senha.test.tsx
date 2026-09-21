import { fireEvent, render, screen } from '@testing-library/react-native';
import ForgotPasswordScreen from '../../app/auth/forgot-password';
import { comAreaSegura } from '../test-utils/area-segura';

const mockPedirRedefinicao = jest.fn();
jest.mock('expo-router', () => ({ router: { push: jest.fn(), navigate: jest.fn() } }));
jest.mock('../state/auth', () => ({ useAuth: () => ({ pedirRedefinicao: mockPedirRedefinicao }) }));

/**
 * Sem SMTP no servidor o e-mail de recuperação não sai, mas o pedido "dá certo": a tela não pode prometer só o e-mail.
 * Ela orienta a olhar o spam e, se nada chegar, a pedir ao administrador (deploy/scripts/reset-password.sh).
 */
describe('Esqueci minha senha', () => {
  beforeEach(() => mockPedirRedefinicao.mockReset());

  it('depois de pedir o código, orienta o que fazer se o e-mail não chegar', async () => {
    mockPedirRedefinicao.mockResolvedValue('');
    await render(comAreaSegura(<ForgotPasswordScreen />));
    await fireEvent.changeText(screen.getByPlaceholderText('nome@dominio.com'), 'pessoa@exemplo.com');
    await fireEvent.press(screen.getByText('Enviar código'));

    expect(await screen.findByText('Confira seu e-mail')).toBeTruthy();
    expect(screen.getByText(/caixa de spam/)).toBeTruthy();
    expect(screen.getByText(/peça ao administrador do app para redefinir sua senha/)).toBeTruthy();
  });

  it('se o pedido falhar, mostra o erro e NÃO a tela de "confira seu e-mail"', async () => {
    mockPedirRedefinicao.mockResolvedValue('Sem conexão com o servidor. Verifique sua internet.');
    await render(comAreaSegura(<ForgotPasswordScreen />));
    await fireEvent.changeText(screen.getByPlaceholderText('nome@dominio.com'), 'pessoa@exemplo.com');
    await fireEvent.press(screen.getByText('Enviar código'));

    expect(await screen.findByText('Sem conexão com o servidor. Verifique sua internet.')).toBeTruthy();
    expect(screen.queryByText('Confira seu e-mail')).toBeNull();
    expect(screen.queryByText(/peça ao administrador/)).toBeNull();
  });
});
