import '@testing-library/react-native/matchers';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import { colors, fontFamily, fontSize, gradients, shadow, size } from '../../design/tokens';
import { comAreaSegura } from '../../test-utils/area-segura';
import { AuthLayout } from '../AuthLayout';

const ESCONDIDO = { includeHiddenElements: true } as const;
const abrir = (ui: React.ReactElement, insets?: { top?: number; bottom?: number }) => render(comAreaSegura(ui, insets));
const estilo = (id: string) => StyleSheet.flatten(screen.getByTestId(id, ESCONDIDO).props.style) as Record<string, unknown>;

/** Os filhos do elemento que contém o de testID dado (a ordem na árvore é a ordem do Tab na web). */
function irmaosDe(testID: string): { props?: { testID?: string } }[] {
  type No = { props?: { testID?: string }; children?: unknown[] | null };
  const achar = (no: unknown): No[] | null => {
    if (!no || typeof no !== 'object') return null;
    const n = no as No;
    const filhos = (n.children ?? []).filter((f): f is No => typeof f === 'object' && f !== null);
    if (filhos.some((f) => f.props?.testID === testID)) return filhos;
    for (const f of filhos) { const r = achar(f); if (r) return r; }
    return null;
  };
  const arvore = screen.toJSON();
  return (Array.isArray(arvore) ? arvore.map(achar).find(Boolean) : achar(arvore)) ?? [];
}

describe('AuthLayout (base das telas de conta)', () => {
  it('cartão creme flutuante com o título em serifa (cabeçalho para o leitor de tela) e o subtítulo em cinza', async () => {
    await abrir(<AuthLayout title="Entrar" subtitle="Acesse seus lembretes por hora e por lugar."><Text>corpo</Text></AuthLayout>);
    expect(screen.getByRole('header', { name: 'Entrar' })).toHaveStyle({ fontFamily: fontFamily.serif, fontSize: fontSize.contaTitulo, color: colors.text.primary });
    expect(screen.getByText('Acesse seus lembretes por hora e por lugar.')).toHaveStyle({ color: colors.text.secondary });
    expect(screen.getByText('corpo')).toBeTruthy();
    expect(screen.getByTestId('auth-cartao')).toHaveStyle({ backgroundColor: colors.bg.card, borderRadius: size.auth.cardRadius, boxShadow: shadow.cartaoDeConta });
  });

  it('sem título não desenha cabeçalho (a tela de "confira seu e-mail" usa o próprio bloco)', async () => {
    await abrir(<AuthLayout><Text>só o corpo</Text></AuthLayout>);
    expect(screen.queryByRole('header')).toBeNull();
    expect(screen.getByText('só o corpo')).toBeTruthy();
  });

  it('fundo verde em degradê com as curvas de nível por cima, ambos decorativos e sem receber toque', async () => {
    await abrir(<AuthLayout title="Entrar"><Text>corpo</Text></AuthLayout>);
    expect(JSON.stringify(estilo('auth-fundo'))).toContain('168deg');
    expect(gradients.contas).toContain('168deg');
    expect(estilo('auth-fundo')).toMatchObject({ pointerEvents: 'none' });
    expect(estilo('auth-curvas')).toMatchObject({ pointerEvents: 'none' });
  });

  it('a marca no alto: o tile menta com o símbolo e o nome em serifa', async () => {
    await abrir(<AuthLayout title="Entrar"><Text>corpo</Text></AuthLayout>);
    expect(screen.getByText('LembreiAi')).toHaveStyle({ fontFamily: fontFamily.serif, color: colors.text.onDarkWarm });
    expect(screen.getByTestId('icone-locate-fixed', ESCONDIDO)).toBeTruthy();
    expect(screen.getByLabelText('LembreiAi')).toHaveProp('accessible', true); // para o leitor de tela a marca é um bloco só, com o nome
    expect(screen.getByTestId('auth-marca-tile')).toHaveStyle({ width: size.auth.marcaTile, height: size.auth.marcaTile, borderRadius: size.auth.marcaRadius });
  });

  it('repassa keyboardShouldPersistTaps (a etapa do código precisa que o toque no botão não feche o teclado antes)', async () => {
    await abrir(<AuthLayout title="Redefinir" keyboardShouldPersistTaps="handled"><Text>corpo</Text></AuthLayout>);
    expect(screen.getByTestId('auth-rolagem')).toHaveProp('keyboardShouldPersistTaps', 'handled');
  });

  it('a nota do cadeado fecha a tela, em toda tela de conta', async () => {
    await abrir(<AuthLayout title="Entrar"><Text>corpo</Text></AuthLayout>);
    expect(screen.getByText('Por onde você passa fica no seu aparelho.')).toHaveStyle({ color: colors.conta.nota });
    expect(screen.getByTestId('icone-lock', ESCONDIDO)).toBeTruthy();
  });
});

describe('AuthLayout: voltar e rodapé', () => {
  it('o botão redondo de voltar só existe quando a tela diz para onde voltar', async () => {
    const voltar = jest.fn();
    const { rerender } = await abrir(<AuthLayout title="Entrar" voltar={voltar}><Text>corpo</Text></AuthLayout>);
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(voltar).toHaveBeenCalledTimes(1);
    await rerender(comAreaSegura(<AuthLayout title="Entrar"><Text>corpo</Text></AuthLayout>));
    expect(screen.queryByRole('button', { name: 'Voltar' })).toBeNull();
  });

  it('o botão de voltar vem antes do conteúdo na árvore (a ordem do Tab na web começa por ele, como a ordem visual) e o zIndex o mantém por cima', async () => {
    await abrir(<AuthLayout title="Entrar" voltar={jest.fn()}><Text>corpo</Text></AuthLayout>);
    const irmaos = irmaosDe('auth-voltar');
    const ids = irmaos.map((n) => n.props?.testID);
    expect(ids.indexOf('auth-voltar')).toBeGreaterThanOrEqual(0);
    expect(ids.indexOf('auth-voltar')).toBeLessThan(ids.indexOf('auth-rolagem'));
    expect(screen.getByTestId('auth-voltar')).toHaveStyle({ position: 'absolute', zIndex: 1 });
  });

  it('com pergunta o rodapé é uma barra de vidro com a pastilha de ação ("Ainda não tem conta?" / "Criar conta")', async () => {
    const criar = jest.fn();
    await abrir(<AuthLayout title="Entrar" rodape={{ pergunta: 'Ainda não tem conta?', acao: 'Criar conta', onPress: criar }}><Text>corpo</Text></AuthLayout>);
    expect(screen.getByText('Ainda não tem conta?')).toHaveStyle({ color: colors.conta.pergunta });
    expect(screen.getByTestId('auth-barra')).toHaveStyle({ backgroundColor: colors.conta.barra, borderRadius: size.auth.barraRadius, borderColor: colors.conta.barraAnel });
    const pastilha = screen.getByRole('button', { name: 'Criar conta' });
    expect(pastilha).toHaveStyle({ height: size.auth.pilula, borderRadius: size.auth.pilulaRadius, backgroundColor: colors.conta.pilula, borderColor: colors.conta.pilulaAnel });
    expect(screen.getByText('Criar conta')).toHaveStyle({ color: colors.conta.pilulaTexto, fontFamily: fontFamily.bold });
    await fireEvent.press(pastilha);
    expect(criar).toHaveBeenCalledTimes(1);
  });

  it('sem pergunta o rodapé é só o link de voltar, sem a barra', async () => {
    const volta = jest.fn();
    await abrir(<AuthLayout title="Esqueci minha senha" rodape={{ acao: 'Voltar para entrar', onPress: volta }}><Text>corpo</Text></AuthLayout>);
    expect(screen.queryByTestId('auth-barra')).toBeNull();
    expect(screen.getByText('Voltar para entrar')).toHaveStyle({ color: colors.conta.link });
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar para entrar' }));
    expect(volta).toHaveBeenCalledTimes(1);
  });

  it('com entalhe o botão de voltar e a marca descem o que a barra de status passar da distância do botão', async () => {
    await abrir(<AuthLayout title="Entrar" voltar={jest.fn()}><Text>corpo</Text></AuthLayout>, { top: 59 });
    expect(screen.getByTestId('auth-voltar')).toHaveStyle({ top: 59 }) // a barra de status (59) passa dos 20 do botão: tudo desce essa diferença;
  });
});
