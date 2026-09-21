import '@testing-library/react-native/matchers';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { colors, fontFamily, radius, shadow, size } from '../../design/tokens';
import { CartaoDeConfig, DadoDoCartao, ItemDeLimite } from '../CartaoDeConfig';

const ESCONDIDO = { includeHiddenElements: true } as const;

describe('CartaoDeConfig', () => {
  it('cabeçalho: círculo com o ícone em cinza, título em negrito (é um cabeçalho para o leitor de tela) e subtítulo em cinza de texto', async () => {
    await render(<CartaoDeConfig icon="bell" titulo="Notificações" subtitulo="Estado: permitida." />);
    const titulo = screen.getByRole('header', { name: 'Notificações' });
    expect(titulo).toHaveStyle({ color: colors.text.primary, fontFamily: fontFamily.bold });
    expect(screen.getByText('Estado: permitida.')).toHaveStyle({ color: colors.text.secondary });
    const circulo = screen.getByTestId('icone-bell', ESCONDIDO).parent;
    expect(circulo).toHaveStyle({ width: size.config.circle, height: size.config.circle, borderRadius: radius.pill, backgroundColor: colors.bg.iconCircle });
    expect(JSON.stringify(screen.getByTestId('icone-bell', ESCONDIDO).children)).toContain(colors.icon.muted);
  });

  it('é um cartão claro de cantos redondos com o anel branco por dentro e a sombra suave', async () => {
    await render(<CartaoDeConfig titulo="Notificações" />);
    expect(screen.getByTestId('cartao-de-config')).toHaveStyle({ backgroundColor: colors.bg.card, borderRadius: radius.form, boxShadow: shadow.formCard });
  });

  it('a ação (botão ou interruptor) fica à direita do cabeçalho', async () => {
    await render(<CartaoDeConfig icon="user-round" titulo="Minha conta" acao={<Text>Sair</Text>} />);
    expect(screen.getByText('Sair')).toBeTruthy();
  });

  it('sem ícone não tem círculo, e sem subtítulo não sobra linha', async () => {
    await render(<CartaoDeConfig titulo="Até onde vai o monitoramento" />);
    expect(screen.queryByTestId(/^icone-/, ESCONDIDO)).toBeNull();
    expect(screen.queryAllByText(/./)).toHaveLength(1);
  });

  it('mostra o que vem dentro (avisos, linhas) abaixo do cabeçalho', async () => {
    await render(<CartaoDeConfig titulo="Lembretes por local"><Text>dentro</Text></CartaoDeConfig>);
    expect(screen.getByText('dentro')).toBeTruthy();
  });

  it('o cartão de ação sem volta (excluir conta) tem o fundo e o contorno avermelhados', async () => {
    await render(<CartaoDeConfig perigo titulo="Excluir conta" />);
    expect(screen.getByTestId('cartao-de-config')).toHaveStyle({ backgroundColor: colors.feedback.dangerWash, borderColor: colors.border.dangerSoft });
    expect(screen.getByText('Excluir conta')).toHaveStyle({ color: colors.text.danger });
  });
});

describe('DadoDoCartao', () => {
  it('nome em cinza à esquerda e valor em negrito à direita', async () => {
    await render(<DadoDoCartao rotulo="Lembretes monitorados" valor="3" />);
    expect(screen.getByText('Lembretes monitorados')).toHaveStyle({ color: colors.text.secondary });
    expect(screen.getByText('3')).toHaveStyle({ color: colors.text.primary, fontFamily: fontFamily.bold, textAlign: 'right' });
  });
});

describe('ItemDeLimite', () => {
  it('marcador, o começo em negrito e o resto do texto em cinza', async () => {
    await render(<ItemDeLimite destaque="App aberto:">o aviso chega em segundos.</ItemDeLimite>);
    expect(screen.getByText('•')).toBeTruthy();
    expect(screen.getByText('App aberto:', { exact: false })).toHaveStyle({ color: colors.text.primary, fontFamily: fontFamily.bold });
    expect(screen.getByText('o aviso chega em segundos.', { exact: false })).toBeTruthy();
  });
});
