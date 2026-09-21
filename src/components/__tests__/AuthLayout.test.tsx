import '@testing-library/react-native/matchers';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text } from 'react-native';
import { colors, fontFamily, fontSize, gradients, shadow, size } from '../../design/tokens';
import { comAreaSegura } from '../../test-utils/area-segura';
import { AuthLayout } from '../AuthLayout';

jest.mock('expo-status-bar', () => ({ StatusBar: jest.fn(() => null) }));

const ESCONDIDO = { includeHiddenElements: true } as const;
const abrir = (ui: React.ReactElement, insets?: { top?: number; bottom?: number }) => render(comAreaSegura(ui, insets));
const estilo = (id: string) => StyleSheet.flatten(screen.getByTestId(id, ESCONDIDO).props.style) as Record<string, unknown>;
/** A imagem decorativa dentro da camada de testID dado (no Jest o arquivo vira `testUri`). */
const imagemDe = (id: string) => screen.getByTestId(id, ESCONDIDO).children[0] as unknown as { props: { source: { testUri: string }[]; contentFit: string; accessible: boolean } };

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

  it('a barra de status acompanha a cor do fundo do app: o texto (relógio, bateria) é sempre escuro', async () => {
    jest.mocked(StatusBar).mockClear();
    await abrir(<AuthLayout title="Entrar"><Text>corpo</Text></AuthLayout>);
    expect(jest.mocked(StatusBar).mock.calls.map(([props]) => props)).toEqual([{ style: 'dark' }]);
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
    // a caixa tem a altura da arte (520 du do original): com a do cabeçalho da lista (345 du) as curvas saíam achatadas
    expect(estilo('auth-curvas')).toMatchObject({ position: 'absolute', top: 0, left: 0, right: 0, height: size.auth.curvasAltura });
    expect(imagemDe('auth-curvas').props.source[0].testUri).toMatch(/assets\/art\/topo-contas\.webp$/);
  });

  it('o horizonte: as curvas do topo viradas e esticadas embaixo, de ponta a ponta, atrás de tudo (cartão, barra de vidro e nota), sem receber toque', async () => {
    await abrir(<AuthLayout title="Entrar" rodape={{ pergunta: 'Ainda não tem conta?', acao: 'Criar conta', onPress: jest.fn() }}><Text>corpo</Text></AuthLayout>);
    expect(estilo('auth-horizonte')).toMatchObject({
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: size.auth.horizonteBase,
      height: size.auth.horizonteAltura,
      pointerEvents: 'none',
    });
    // é a arte do horizonte (e não a do topo), esticada na faixa e escondida do leitor de tela
    expect(imagemDe('auth-horizonte').props.source[0].testUri).toMatch(/assets\/art\/horizonte-contas\.webp$/);
    expect(imagemDe('auth-horizonte').props).toMatchObject({ contentFit: 'fill', accessible: false });
    // o primeiro filho da rolagem: o que vem depois desenha por cima, o cartão inclusive (por cima dele as curvas riscariam de claro o botão laranja)
    const ids = irmaosDe('auth-horizonte').map((n) => n.props?.testID);
    expect(ids.indexOf('auth-horizonte')).toBe(0);
    expect(ids.indexOf('auth-horizonte')).toBeLessThan(ids.indexOf('auth-cartao'));
  });

  it('a pergunta da barra de vidro ocupa o espaço que sobra ao lado da pastilha: no Android um texto de largura justa era cortado ("Já tem conta?" saía "Já tem")', async () => {
    await abrir(<AuthLayout title="Criar conta" rodape={{ pergunta: 'Já tem conta?', acao: 'Entrar', onPress: jest.fn() }}><Text>corpo</Text></AuthLayout>);
    expect(screen.getByText('Já tem conta?')).toHaveStyle({ flex: 1 });
  });

  it('as telas de recuperação (só o link de voltar, sem barra) e as sem rodapé têm o mesmo horizonte', async () => {
    await abrir(<AuthLayout title="Esqueci minha senha" rodape={{ acao: 'Voltar para entrar', onPress: jest.fn() }}><Text>corpo</Text></AuthLayout>);
    expect(screen.getByTestId('auth-horizonte', ESCONDIDO)).toBeTruthy();
    await abrir(<AuthLayout title="Entrar"><Text>corpo</Text></AuthLayout>);
    expect(screen.getAllByTestId('auth-horizonte', ESCONDIDO).length).toBeGreaterThan(0);
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

  it('com entalhe o botão de voltar e a marca descem até o alvo de toque inteiro caber abaixo da barra de status', async () => {
    await abrir(<AuthLayout title="Entrar" voltar={jest.fn()}><Text>corpo</Text></AuthLayout>, { top: 59 });
    const respiro = (size.touch - size.auth.voltar) / 2; // a folga de cima do Toque (4)
    // a barra (59) mais a folga (4) passa dos 20 do botão: tudo desce essa diferença
    expect(screen.getByTestId('auth-voltar')).toHaveStyle({ top: 59 + respiro });
    const rolagem = StyleSheet.flatten(screen.getByTestId('auth-rolagem').props.contentContainerStyle) as Record<string, unknown>;
    expect(rolagem.paddingTop).toBe(size.auth.top + 59 + respiro - size.auth.voltarTop);
  });

  // O sistema fica com todo toque dentro da barra de status: se o botão encosta nela, a folga de cima do Toque se perde e o alvo
  // fica com 44 × 40 (medido no emulador). Decisão do João (21/09): alvo completo, com o respiro abaixo da barra.
  it.each([0, 20, 24, 47, 59, 100])('com a barra de status de %i o alvo de toque do voltar, a folga de cima inclusive, fica abaixo dela', async (barra) => {
    await abrir(<AuthLayout title="Entrar" voltar={jest.fn()}><Text>corpo</Text></AuthLayout>, { top: barra });
    const respiro = (size.touch - size.auth.voltar) / 2;
    const topo = estilo('auth-voltar').top as number;
    expect(topo - respiro).toBeGreaterThanOrEqual(barra);
    // sem barra que chegue perto (a web, o computador) fica o lugar do desenho
    if (barra + respiro <= size.auth.voltarTop) expect(topo).toBe(size.auth.voltarTop);
  });
});
