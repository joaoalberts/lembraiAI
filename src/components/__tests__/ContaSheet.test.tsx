import '@testing-library/react-native/matchers';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import { comAreaSegura } from '../../test-utils/area-segura';
import { useAuth } from '../../state/auth';
import { ContaSheet } from '../ContaSheet';

jest.mock('../../state/auth', () => ({ useAuth: jest.fn() }));

const sair = jest.fn();
const trocarSenha = jest.fn();
const onClose = jest.fn();
const ESCONDIDO = { includeHiddenElements: true } as const;

const entrar = (extra: { nome?: string; email?: string | null } = {}) => {
  const { nome = '', email = 'joao.teste@exemplo.com' } = extra;
  jest.mocked(useAuth).mockReturnValue({ user: email === null ? null : { email }, nome, sair, trocarSenha } as unknown as ReturnType<typeof useAuth>);
};
const conta = (visible: boolean) => comAreaSegura(<ContaSheet visible={visible} onClose={onClose} />);
const abrir = (visible = true) => render(conta(visible));

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
  sair.mockResolvedValue(undefined);
  trocarSenha.mockResolvedValue(null);
  entrar();
});

const digitar = async (rotulo: string, texto: string) => { await fireEvent.changeText(screen.getByLabelText(rotulo), texto); };
const preencher = async (atual: string, nova: string, confirmacao: string) => {
  await digitar('Senha atual', atual);
  await digitar('Nova senha', nova);
  await digitar('Confirmar nova senha', confirmacao);
};
const irParaSenha = async () => { await fireEvent.press(screen.getByRole('button', { name: /^Alterar senha/ })); };
const salvar = async () => { await fireEvent.press(screen.getByRole('button', { name: 'Salvar nova senha' })); };

describe('ContaSheet: menu', () => {
  it('fechada não mostra nada', async () => {
    await abrir(false);
    expect(screen.queryByText('Minha conta')).toBeNull();
  });

  it('mostra "Minha conta", o e-mail e as duas linhas, cada uma com a sua explicação', async () => {
    await abrir();
    expect(screen.getByText('Minha conta')).toBeTruthy();
    expect(screen.getByText('joao.teste@exemplo.com')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Alterar senha. Pede a senha atual antes de trocar.' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Sair. Encerra a sessão neste aparelho.' })).toBeTruthy();
    expect(screen.getByTestId('icone-key-round', ESCONDIDO)).toBeTruthy();
    expect(screen.getByTestId('icone-log-out', ESCONDIDO)).toBeTruthy();
  });

  it('com nome cadastrado o título é o nome; sem e-mail o subtítulo não aparece', async () => {
    entrar({ nome: 'Ana Exemplo', email: null });
    await abrir();
    expect(screen.getByText('Ana Exemplo')).toBeTruthy();
    expect(screen.queryByText('Minha conta')).toBeNull();
    expect(screen.queryByText('joao.teste@exemplo.com')).toBeNull();
  });

  it('Sair encerra a sessão e fecha a folha', async () => {
    await abrir();
    await fireEvent.press(screen.getByRole('button', { name: /^Sair/ }));
    expect(sair).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('tocar fora da folha fecha', async () => {
    await abrir();
    await fireEvent.press(screen.getByLabelText('Fechar', ESCONDIDO));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('ContaSheet: alterar senha', () => {
  it('abre a etapa da senha com os três campos, a dica da nova senha e o botão principal', async () => {
    await abrir();
    await irParaSenha();
    expect(screen.getByText('Alterar senha')).toBeTruthy();
    expect(screen.getByText('Confirme a senha atual e escolha a nova.')).toBeTruthy();
    expect(screen.getByPlaceholderText('Sua senha de hoje')).toHaveProp('autoComplete', 'current-password');
    expect(screen.getByPlaceholderText('Crie uma senha')).toHaveProp('autoComplete', 'new-password');
    expect(screen.getByPlaceholderText('Repita a senha')).toHaveProp('autoComplete', 'new-password');
    expect(screen.getByText('Pelo menos 8 caracteres, com letras e números.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Salvar nova senha' })).toBeTruthy();
  });

  it('"Voltar" leva de volta ao menu', async () => {
    await abrir();
    await irParaSenha();
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(screen.getByText('Minha conta')).toBeTruthy();
    expect(screen.queryByLabelText('Nova senha')).toBeNull();
  });

  it('sem preencher nada avisa em cada campo e não chama o servidor', async () => {
    await abrir();
    await irParaSenha();
    await salvar();
    expect(screen.getByText('Informe sua senha atual.')).toBeTruthy();
    expect(screen.getByText('Informe uma senha.')).toBeTruthy();
    expect(screen.getByText('Repita a senha.')).toBeTruthy();
    expect(trocarSenha).not.toHaveBeenCalled();
  });

  it('nova senha fraca e confirmação diferente: cada uma com a sua mensagem', async () => {
    await abrir();
    await irParaSenha();
    await preencher('segredo1', 'curta', 'outra');
    await salvar();
    expect(screen.getByText('A senha precisa de pelo menos 8 caracteres.')).toBeTruthy();
    expect(screen.getByText('As senhas não são iguais.')).toBeTruthy();
    expect(screen.queryByText('Informe sua senha atual.')).toBeNull();
    expect(trocarSenha).not.toHaveBeenCalled();
  });

  it('digitar num campo apaga o aviso dele e só dele', async () => {
    await abrir();
    await irParaSenha();
    await salvar();
    await digitar('Senha atual', 's');
    expect(screen.queryByText('Informe sua senha atual.')).toBeNull();
    expect(screen.getByText('Informe uma senha.')).toBeTruthy();
  });

  it('com tudo certo chama trocarSenha com a atual e a nova e mostra "Senha alterada"', async () => {
    await abrir();
    await irParaSenha();
    await preencher('segredo1', 'novasenha1', 'novasenha1');
    await salvar();
    expect(trocarSenha).toHaveBeenCalledWith('segredo1', 'novasenha1');
    expect(screen.getByText('Senha alterada')).toBeTruthy();
    expect(screen.getByText('Use a nova senha da próxima vez que entrar.')).toBeTruthy();
    expect(screen.getByText('Pronto, sua senha foi trocada.')).toBeTruthy();
    expect(screen.getByTestId('icone-circle-check', ESCONDIDO)).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Fechar', exact: true } as never));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('se o servidor recusar (senha atual errada) mostra o aviso vermelho e continua na etapa, com os campos preenchidos', async () => {
    trocarSenha.mockResolvedValue('Senha atual incorreta.');
    await abrir();
    await irParaSenha();
    await preencher('errada123', 'novasenha1', 'novasenha1');
    await salvar();
    const aviso = screen.getByText('Senha atual incorreta.');
    expect(aviso).toBeTruthy();
    expect(screen.getByTestId('icone-triangle-alert', ESCONDIDO)).toBeTruthy();
    expect(screen.getByLabelText('Nova senha')).toHaveProp('value', 'novasenha1');
    expect(screen.queryByText('Senha alterada')).toBeNull();
  });

  it('"Voltar" apaga o aviso do servidor', async () => {
    trocarSenha.mockResolvedValue('Senha atual incorreta.');
    await abrir();
    await irParaSenha();
    await preencher('errada123', 'novasenha1', 'novasenha1');
    await salvar();
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    await irParaSenha();
    expect(screen.queryByText('Senha atual incorreta.')).toBeNull();
  });

  it('enquanto salva o botão diz "Salvando…" e não aceita outro toque; os campos travam', async () => {
    let terminar: (erro: string | null) => void = () => {};
    trocarSenha.mockReturnValue(new Promise((ok) => { terminar = ok; }));
    await abrir();
    await irParaSenha();
    await preencher('segredo1', 'novasenha1', 'novasenha1');
    await salvar();
    const botao = screen.getByRole('button', { name: 'Salvando…' });
    expect(botao).toBeDisabled();
    await fireEvent.press(botao);
    expect(trocarSenha).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('Nova senha')).toHaveProp('editable', false);
    await act(async () => { terminar(null); });
    expect(screen.getByText('Senha alterada')).toBeTruthy();
  });

  it('depois do erro do servidor o botão volta a "Salvar nova senha" e os campos destravam, para tentar de novo', async () => {
    trocarSenha.mockResolvedValue('Senha atual incorreta.');
    await abrir();
    await irParaSenha();
    await preencher('errada123', 'novasenha1', 'novasenha1');
    await salvar();
    expect(screen.getByRole('button', { name: 'Salvar nova senha' })).toBeEnabled();
    expect(screen.getByLabelText('Nova senha')).toHaveProp('editable', true);
    trocarSenha.mockResolvedValue(null);
    await salvar();
    expect(screen.getByText('Senha alterada')).toBeTruthy();
  });

  it('fechar no meio da troca e abrir de novo recomeça do menu, sem nada digitado', async () => {
    const { rerender } = await abrir();
    await irParaSenha();
    await digitar('Senha atual', 'segredo1');
    await fireEvent.press(screen.getByLabelText('Fechar', ESCONDIDO));
    expect(onClose).toHaveBeenCalledTimes(1);
    await rerender(conta(false));
    await rerender(conta(true));
    expect(screen.getByText('Minha conta')).toBeTruthy();
    await irParaSenha();
    expect(screen.getByLabelText('Senha atual')).toHaveProp('value', '');
  });
});

describe('ContaSheet: a resposta que chega depois de fechar', () => {
  /** Salva com uma promessa em aberto (o servidor ainda não respondeu), fecha a folha e abre de novo; devolve quem responde. */
  const salvarFecharEReabrir = async (): Promise<(erro: string | null) => Promise<void>> => {
    let responder: (erro: string | null) => void = () => {};
    trocarSenha.mockReturnValue(new Promise((ok) => { responder = ok; }));
    const { rerender } = await abrir();
    await irParaSenha();
    await preencher('segredo1', 'novasenha1', 'novasenha1');
    await salvar();
    await fireEvent.press(screen.getByLabelText('Fechar', ESCONDIDO)); // no meio do "Salvando…"
    await rerender(conta(false));
    await rerender(conta(true));
    return (erro) => act(async () => { responder(erro); });
  };

  it('a troca que deu certo depois de a folha fechar não faz a folha nova abrir em "Senha alterada"', async () => {
    const responder = await salvarFecharEReabrir();
    await responder(null);
    expect(screen.getByText('Minha conta')).toBeTruthy();
    expect(screen.queryByText('Senha alterada')).toBeNull();
  });

  it('o erro que chega depois de a folha fechar não aparece num formulário vazio quando a folha abre de novo', async () => {
    const responder = await salvarFecharEReabrir();
    await responder('Senha atual incorreta.');
    await irParaSenha();
    expect(screen.queryByText('Senha atual incorreta.')).toBeNull();
    expect(screen.getByRole('button', { name: 'Salvar nova senha' })).toBeEnabled();
  });
});
