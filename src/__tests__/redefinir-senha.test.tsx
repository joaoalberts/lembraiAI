import '@testing-library/react-native/matchers';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';
import ResetPasswordScreen from '../../app/auth/reset-password';
import { comAreaSegura } from '../test-utils/area-segura';

let mockRecuperando = false;
const mockValidarToken = jest.fn();
const mockValidarCodigo = jest.fn();
const mockDefinirNovaSenha = jest.fn();
const mockCancelar = jest.fn();
jest.mock('expo-router', () => ({ router: { replace: jest.fn(), push: jest.fn(), navigate: jest.fn() }, useLocalSearchParams: jest.fn() }));
jest.mock('../state/auth', () => ({
  useAuth: () => ({
    recuperando: mockRecuperando,
    validarTokenRecuperacao: mockValidarToken,
    validarCodigoRecuperacao: mockValidarCodigo,
    definirNovaSenha: mockDefinirNovaSenha,
    cancelarRecuperacao: mockCancelar,
  }),
}));

const FORTE = 'Segredo123';
const abrir = () => render(comAreaSegura(<ResetPasswordScreen />));

beforeEach(() => {
  jest.clearAllMocks();
  mockRecuperando = false;
  jest.mocked(useLocalSearchParams).mockReturnValue({});
  mockValidarToken.mockResolvedValue(null);
  mockValidarCodigo.mockResolvedValue(null);
  mockDefinirNovaSenha.mockResolvedValue(null);
  mockCancelar.mockResolvedValue(undefined);
});

describe('Redefinir senha: o código do e-mail', () => {
  const preencher = async (email: string, codigo: string) => {
    await fireEvent.changeText(screen.getByPlaceholderText('nome@dominio.com'), email);
    await fireEvent.changeText(screen.getByPlaceholderText('000000'), codigo);
  };

  it('mostra o título, o subtítulo e os dois campos; o e-mail já vem preenchido do passo anterior', async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ email: 'pessoa@exemplo.com' });
    await abrir();
    expect(screen.getByRole('header', { name: 'Redefinir senha' })).toBeTruthy();
    expect(screen.getByText('Digite o código de 6 números que enviamos por e-mail.')).toBeTruthy();
    expect(screen.getByPlaceholderText('nome@dominio.com')).toHaveProp('value', 'pessoa@exemplo.com');
    expect(screen.getByPlaceholderText('000000')).toHaveProp('autoComplete', 'one-time-code');
  });

  it('o campo do código só aceita números', async () => {
    await abrir();
    await fireEvent.changeText(screen.getByPlaceholderText('000000'), '12ab34 5');
    expect(screen.getByPlaceholderText('000000')).toHaveProp('value', '12345');
  });

  it('código incompleto ou e-mail inválido avisam e não chamam o servidor', async () => {
    await abrir();
    await preencher('pessoa@exemplo.com', '123');
    await fireEvent.press(screen.getByRole('button', { name: 'Verificar código' }));
    expect(screen.getByText('O código tem 6 números.')).toBeTruthy();
    await preencher('sem-arroba', '123456');
    await fireEvent.press(screen.getByRole('button', { name: 'Verificar código' }));
    expect(screen.getByText(/E-mail inválido/)).toBeTruthy();
    expect(mockValidarCodigo).not.toHaveBeenCalled();
  });

  it('com e-mail e código certos pede a verificação ao servidor', async () => {
    await abrir();
    await preencher('pessoa@exemplo.com', '123456');
    await fireEvent.press(screen.getByRole('button', { name: 'Verificar código' }));
    expect(mockValidarCodigo).toHaveBeenCalledWith('pessoa@exemplo.com', '123456');
  });

  it('enquanto verifica o botão diz "Verificando…" e trava com os campos; ao terminar destrava', async () => {
    let terminar: (erro: string | null) => void = () => {};
    mockValidarCodigo.mockReturnValue(new Promise((ok) => { terminar = ok; }));
    await abrir();
    await preencher('pessoa@exemplo.com', '123456');
    await fireEvent.press(screen.getByRole('button', { name: 'Verificar código' }));
    expect(screen.getByRole('button', { name: 'Verificando…' })).toBeDisabled();
    expect(screen.getByPlaceholderText('000000')).toHaveProp('editable', false);
    await act(async () => { terminar(null); });
    expect(screen.getByRole('button', { name: 'Verificar código' })).toBeEnabled();
  });

  it('se o servidor recusar o código mostra o aviso e o botão volta a "Verificar código", para tentar de novo', async () => {
    mockValidarCodigo.mockResolvedValue('Este código ou link expirou, está incorreto ou já foi usado. Peça um novo e-mail de redefinição.');
    await abrir();
    await preencher('pessoa@exemplo.com', '123456');
    await fireEvent.press(screen.getByRole('button', { name: 'Verificar código' }));
    expect(screen.getByText(/expirou, está incorreto ou já foi usado/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Verificar código' })).toBeEnabled();
    expect(screen.getByPlaceholderText('000000')).toHaveProp('editable', true);
  });

  it('"Pedir um novo código" volta ao pedido, e "Voltar para entrar" cancela a recuperação antes de sair', async () => {
    await abrir();
    await fireEvent.press(screen.getByRole('button', { name: 'Pedir um novo código' }));
    expect(router.replace).toHaveBeenLastCalledWith('/auth/forgot-password');
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar para entrar' }));
    expect(mockCancelar).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenLastCalledWith('/auth/login');
  });
});

describe('Redefinir senha: a nova senha', () => {
  beforeEach(() => { mockRecuperando = true; });
  const preencher = async (senha: string, confirmacao: string) => {
    await fireEvent.changeText(screen.getByPlaceholderText('Sua nova senha'), senha);
    await fireEvent.changeText(screen.getByPlaceholderText('Repita a senha'), confirmacao);
  };

  it('depois de validar o código mostra "Nova senha" com a dica e o medidor aparece ao digitar', async () => {
    await abrir();
    expect(screen.getByRole('header', { name: 'Nova senha' })).toBeTruthy();
    expect(screen.getByText('Pelo menos 8 caracteres, com letras e números.')).toBeTruthy();
    expect(screen.queryByTestId('medidor')).toBeNull();
    await fireEvent.changeText(screen.getByPlaceholderText('Sua nova senha'), 'abc');
    expect(screen.getByTestId('medidor')).toBeTruthy();
  });

  it('senha fraca ou confirmação diferente avisam e não chamam o servidor', async () => {
    await abrir();
    await preencher('curta', 'curta');
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar nova senha' }));
    expect(screen.getByText('A senha precisa de pelo menos 8 caracteres.')).toBeTruthy();
    await preencher(FORTE, 'Outra1234');
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar nova senha' }));
    expect(screen.getByText('As senhas não são iguais.')).toBeTruthy();
    expect(mockDefinirNovaSenha).not.toHaveBeenCalled();
  });

  it('salva e leva à tela de entrar com o aviso de senha redefinida', async () => {
    await abrir();
    await preencher(FORTE, FORTE);
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar nova senha' }));
    expect(mockDefinirNovaSenha).toHaveBeenCalledWith(FORTE);
    expect(router.replace).toHaveBeenLastCalledWith({ pathname: '/auth/login', params: { redefinida: '1' } });
  });

  it('se o servidor recusar (ex.: a mesma senha de antes) mostra o aviso, não sai da tela e o botão destrava para tentar de novo', async () => {
    mockDefinirNovaSenha.mockResolvedValue('A nova senha precisa ser diferente da atual.');
    await abrir();
    await preencher(FORTE, FORTE);
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar nova senha' }));
    expect(screen.getByText('A nova senha precisa ser diferente da atual.')).toBeTruthy();
    expect(router.replace).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Salvar nova senha' })).toBeEnabled();
    expect(screen.getByPlaceholderText('Sua nova senha')).toHaveProp('editable', true);
  });

  it('enquanto salva o botão diz "Salvando…" e trava, com os campos', async () => {
    let terminar: (erro: string | null) => void = () => {};
    mockDefinirNovaSenha.mockReturnValue(new Promise((ok) => { terminar = ok; }));
    await abrir();
    await preencher(FORTE, FORTE);
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar nova senha' }));
    expect(screen.getByRole('button', { name: 'Salvando…' })).toBeDisabled();
    expect(screen.getByPlaceholderText('Repita a senha')).toHaveProp('editable', false);
    await act(async () => { terminar('Falhou.'); });
    expect(screen.getByRole('button', { name: 'Salvar nova senha' })).toBeEnabled();
  });

  it('"Cancelar" desfaz a recuperação e volta a entrar', async () => {
    await abrir();
    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
    expect(mockCancelar).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenLastCalledWith('/auth/login');
  });
});

describe('Redefinir senha: o link do e-mail (web)', () => {
  beforeEach(() => { jest.mocked(useLocalSearchParams).mockReturnValue({ token_hash: 'abc123' }); });

  it('valida sozinho o token do link, uma vez, e o subtítulo avisa; o botão trava enquanto isso', async () => {
    let terminar: (erro: string | null) => void = () => {};
    mockValidarToken.mockReturnValue(new Promise((ok) => { terminar = ok; }));
    await abrir();
    expect(screen.getByText('Validando o link do e-mail…')).toBeTruthy();
    expect(mockValidarToken).toHaveBeenCalledTimes(1);
    expect(mockValidarToken).toHaveBeenCalledWith('abc123');
    expect(screen.getByRole('button', { name: 'Verificando…' })).toBeDisabled();
    await act(async () => { terminar(null); });
    expect(screen.getByRole('button', { name: 'Verificar código' })).toBeEnabled();
  });

  it('se o link não vale mais mostra o aviso e destrava, para digitar o código no lugar', async () => {
    mockValidarToken.mockResolvedValue('Este código ou link expirou, está incorreto ou já foi usado. Peça um novo e-mail de redefinição.');
    await abrir();
    expect(screen.getByText(/expirou, está incorreto ou já foi usado/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Verificar código' })).toBeEnabled();
  });

  it('o token vale uma vez só: quando a tela volta a "não recuperando" com o mesmo link no endereço, não valida de novo', async () => {
    const { rerender } = await abrir();
    expect(mockValidarToken).toHaveBeenCalledTimes(1);
    mockRecuperando = true;
    await rerender(comAreaSegura(<ResetPasswordScreen />));
    mockRecuperando = false;
    await rerender(comAreaSegura(<ResetPasswordScreen />));
    expect(mockValidarToken).toHaveBeenCalledTimes(1);
  });

  it('um link já validado nem tenta quando a recuperação já está em andamento', async () => {
    mockRecuperando = true;
    await abrir();
    expect(mockValidarToken).not.toHaveBeenCalled();
  });

  it('sem link no endereço não há o que validar', async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({});
    await abrir();
    expect(mockValidarToken).not.toHaveBeenCalled();
  });
});
