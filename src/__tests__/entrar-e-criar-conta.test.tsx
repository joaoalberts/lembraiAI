import '@testing-library/react-native/matchers';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';
import LoginScreen from '../../app/auth/login';
import SignupScreen from '../../app/auth/signup';
import { AVISO_CONFIRMAR_EMAIL } from '../state/auth';
import { comAreaSegura } from '../test-utils/area-segura';

const mockEntrar = jest.fn();
const mockCadastrar = jest.fn();
jest.mock('expo-router', () => ({ router: { navigate: jest.fn(), replace: jest.fn() }, useLocalSearchParams: jest.fn() }));
jest.mock('../state/auth', () => ({
  AVISO_CONFIRMAR_EMAIL: 'Conta criada. Confirme o e-mail que enviamos para entrar.',
  useAuth: () => ({ entrar: mockEntrar, cadastrar: mockCadastrar }),
}));

const ESCONDIDO = { includeHiddenElements: true } as const;

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useLocalSearchParams).mockReturnValue({});
  mockEntrar.mockResolvedValue(null);
  mockCadastrar.mockResolvedValue(null);
});

describe('Entrar', () => {
  const abrir = () => render(comAreaSegura(<LoginScreen />));
  const preencher = async (email: string, senha: string) => {
    await fireEvent.changeText(screen.getByPlaceholderText('nome@dominio.com'), email);
    await fireEvent.changeText(screen.getByPlaceholderText('Sua senha'), senha);
  };

  it('título, subtítulo e a pergunta do rodapé da imagem 02', async () => {
    await abrir();
    expect(screen.getByRole('header', { name: 'Entrar' })).toBeTruthy();
    expect(screen.getByText('Acesse seus lembretes por hora e por lugar.')).toBeTruthy();
    expect(screen.getByText('Ainda não tem conta?')).toBeTruthy();
    expect(screen.getByLabelText('E-mail')).toBeTruthy();
    expect(screen.getByLabelText('Senha')).toBeTruthy();
  });

  it('entra com o e-mail, a senha e o "Lembrar-me" (marcado de saída)', async () => {
    await abrir();
    expect(screen.getByRole('checkbox', { name: 'Lembrar-me' })).toBeChecked();
    await preencher('pessoa@exemplo.com', 'segredo123');
    await fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));
    expect(mockEntrar).toHaveBeenCalledWith('pessoa@exemplo.com', 'segredo123', true);
  });

  it('desmarcar o "Lembrar-me" chega ao entrar', async () => {
    await abrir();
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Lembrar-me' }));
    await preencher('pessoa@exemplo.com', 'segredo123');
    await fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));
    expect(mockEntrar).toHaveBeenCalledWith('pessoa@exemplo.com', 'segredo123', false);
  });

  it('e-mail inválido ou senha vazia mostram o aviso e não chamam o servidor', async () => {
    await abrir();
    await preencher('sem-arroba', 'x');
    await fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));
    expect(screen.getByText(/E-mail inválido/)).toBeTruthy();
    await preencher('pessoa@exemplo.com', '');
    await fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));
    expect(screen.getByText('Informe sua senha.')).toBeTruthy();
    expect(mockEntrar).not.toHaveBeenCalled();
  });

  it('a recusa do servidor aparece no aviso vermelho com ícone', async () => {
    mockEntrar.mockResolvedValue('E-mail ou senha incorretos.');
    await abrir();
    await preencher('pessoa@exemplo.com', 'errada123');
    await fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));
    expect(screen.getByText('E-mail ou senha incorretos.')).toBeTruthy();
    expect(screen.getByTestId('icone-triangle-alert', ESCONDIDO)).toBeTruthy();
  });

  it('depois de redefinir a senha avisa em verde', async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ redefinida: '1' });
    await abrir();
    expect(screen.getByText('Senha redefinida. Entre com a nova senha.')).toBeTruthy();
    expect(screen.getByTestId('icone-circle-check', ESCONDIDO)).toBeTruthy();
  });

  it('enquanto entra o botão diz "Entrando…" e trava, e a caixinha também', async () => {
    let terminar: (erro: string | null) => void = () => {};
    mockEntrar.mockReturnValue(new Promise((ok) => { terminar = ok; }));
    await abrir();
    await preencher('pessoa@exemplo.com', 'segredo123');
    await fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));
    expect(screen.getByRole('button', { name: 'Entrando…' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'Lembrar-me' })).toBeDisabled();
    terminar(null);
  });

  it('"Esqueci minha senha", "Criar conta" e o voltar levam para onde dizem', async () => {
    await abrir();
    await fireEvent.press(screen.getByRole('button', { name: 'Esqueci minha senha' }));
    expect(router.navigate).toHaveBeenLastCalledWith('/auth/forgot-password');
    await fireEvent.press(screen.getByRole('button', { name: 'Criar conta' }));
    expect(router.navigate).toHaveBeenLastCalledWith('/auth/signup');
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(router.navigate).toHaveBeenLastCalledWith('/auth/bem-vindo');
  });
});

describe('Criar conta', () => {
  const abrir = () => render(comAreaSegura(<SignupScreen />));
  const preencher = async (nome: string, email: string, senha: string, confirmacao: string) => {
    await fireEvent.changeText(screen.getByPlaceholderText('Como podemos te chamar?'), nome);
    await fireEvent.changeText(screen.getByPlaceholderText('nome@dominio.com'), email);
    await fireEvent.changeText(screen.getByPlaceholderText('Crie uma senha'), senha);
    await fireEvent.changeText(screen.getByPlaceholderText('Repita a senha'), confirmacao);
  };

  it('título, subtítulo, dica da senha e a pergunta do rodapé', async () => {
    await abrir();
    expect(screen.getByRole('header', { name: 'Criar conta' })).toBeTruthy();
    expect(screen.getByText('Leva menos de um minuto.')).toBeTruthy();
    expect(screen.getByText('Pelo menos 8 caracteres, com letras e números.')).toBeTruthy();
    expect(screen.getByText('Já tem conta?')).toBeTruthy();
  });

  it('o medidor aparece com a senha digitada e acompanha a força', async () => {
    await abrir();
    expect(screen.queryByTestId('medidor')).toBeNull();
    await fireEvent.changeText(screen.getByPlaceholderText('Crie uma senha'), 'abc');
    expect(screen.getByText('Senha fraca')).toBeTruthy();
    await fireEvent.changeText(screen.getByPlaceholderText('Crie uma senha'), 'Abcdefghij1!');
    expect(screen.getByText('Senha forte')).toBeTruthy();
  });

  it('cria a conta com nome, e-mail e senha', async () => {
    await abrir();
    await preencher('Ana', 'ana@exemplo.com', 'segredo123', 'segredo123');
    await fireEvent.press(screen.getByRole('button', { name: 'Criar conta' }));
    expect(mockCadastrar).toHaveBeenCalledWith('Ana', 'ana@exemplo.com', 'segredo123');
  });

  it('senhas diferentes não chamam o servidor', async () => {
    await abrir();
    await preencher('Ana', 'ana@exemplo.com', 'segredo123', 'outra1234');
    await fireEvent.press(screen.getByRole('button', { name: 'Criar conta' }));
    expect(screen.getByText('As senhas não são iguais.')).toBeTruthy();
    expect(mockCadastrar).not.toHaveBeenCalled();
  });

  it('sem sessão (falta confirmar o e-mail) mostra o aviso e não recusa', async () => {
    mockCadastrar.mockResolvedValue(AVISO_CONFIRMAR_EMAIL);
    await abrir();
    await preencher('Ana', 'ana@exemplo.com', 'segredo123', 'segredo123');
    await fireEvent.press(screen.getByRole('button', { name: 'Criar conta' }));
    expect(screen.getByText(AVISO_CONFIRMAR_EMAIL)).toBeTruthy();
    expect(screen.getByTestId('icone-mail-check', ESCONDIDO)).toBeTruthy();
  });

  it('"Entrar" no rodapé e o voltar levam para onde dizem', async () => {
    await abrir();
    await fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));
    expect(router.navigate).toHaveBeenLastCalledWith('/auth/login');
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(router.navigate).toHaveBeenLastCalledWith('/auth/bem-vindo');
  });
});
