import '@testing-library/react-native/matchers';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { StatusBar } from 'expo-status-bar';
import { Dimensions, StyleSheet } from 'react-native';
import { colors, fontFamily, fontSize, layout, radius, size } from '../../design/tokens';
import { comAreaSegura } from '../../test-utils/area-segura';
import { AppBrand } from '../AppBrand';
import { Onboarding } from '../Onboarding';

jest.mock('expo-status-bar', () => ({ StatusBar: jest.fn(() => null) }));

const abrir = async (props: Partial<React.ComponentProps<typeof Onboarding>> = {}, insets = {}) => {
  const acoes = { onSkip: jest.fn(), onStart: jest.fn() };
  await render(comAreaSegura(<Onboarding {...acoes} {...props} />, insets));
  return acoes;
};

const estilo = (el: { props: { style?: unknown } }) => StyleSheet.flatten(el.props.style as never) as Record<string, unknown>;

describe('Onboarding: barra de status', () => {
  it('fundo verde escuro: texto da barra de status é claro', async () => {
    jest.mocked(StatusBar).mockClear();
    await abrir();
    expect(jest.mocked(StatusBar).mock.calls.map(([props]) => props)).toEqual([{ style: 'light' }]);
  });
});

describe('Onboarding: conteúdo', () => {
  it('mostra a marca, o título, o subtítulo, os três benefícios e a frase de privacidade', async () => {
    await abrir();
    expect(screen.getByLabelText('LembreiAi. Sua rotina, mais leve.')).toBeTruthy();
    expect(screen.getByRole('header', { name: 'Lembre de tudo!' })).toBeTruthy();
    expect(screen.getByText('Lembre')).toBeTruthy();
    expect(screen.getByText('de tudo!')).toBeTruthy();
    expect(screen.getByText(/Alertas inteligentes que chegam na hora certa/)).toBeTruthy();
    for (const t of ['Por horário', 'Por localização', 'O que acontecer\nprimeiro']) expect(screen.getByText(t)).toBeTruthy();
    for (const t of ['Nunca mais\nesqueça', 'Lembre ao chegar\nno local', 'Mais praticidade\nno seu dia']) expect(screen.getByText(t)).toBeTruthy();
    expect(screen.getByText('Seus lembretes, sua privacidade.')).toBeTruthy();
  });

  it('o título é grande, em serifa, com "de tudo!" no destaque menta', async () => {
    await abrir();
    expect(estilo(screen.getByText('Lembre'))).toMatchObject({ fontFamily: fontFamily.serif, fontSize: fontSize.hero, color: colors.text.onDark });
    expect(estilo(screen.getByText('de tudo!'))).toMatchObject({ color: colors.text.onDarkAccent, fontSize: fontSize.hero });
  });

  it('os dois balões dizem "Na hora certa" e "No lugar certo", inclinados para lados opostos', async () => {
    await abrir();
    expect(screen.getByText('Na hora certa')).toBeTruthy();
    expect(screen.getByText('Lembra por você')).toBeTruthy();
    expect(screen.getByText('No lugar certo')).toBeTruthy();
    expect(screen.getByText('Avise quando\nchegar')).toBeTruthy();
    expect(estilo(screen.getByTestId('onboarding-balao-esquerdo')).transform).toEqual([{ rotate: '-14deg' }]);
    expect(estilo(screen.getByTestId('onboarding-balao-direito')).transform).toEqual([{ rotate: '14deg' }]);
  });

  it('o balão esquerdo fica atrás do pino 3D e o direito na frente dele (como na captura)', async () => {
    await abrir();
    const ordem = (screen.getByTestId('onboarding-cena').children as { props?: { testID?: string } }[]).map((f) => f.props?.testID).filter(Boolean);
    expect(ordem.indexOf('onboarding-balao-esquerdo')).toBeLessThan(ordem.indexOf('onboarding-pino'));
    expect(ordem.indexOf('onboarding-pino')).toBeLessThan(ordem.indexOf('onboarding-balao-direito'));
  });

  it('os balões são de vidro escuro com contorno claro', async () => {
    await abrir();
    expect(screen.getByTestId('onboarding-balao-esquerdo')).toHaveStyle({ backgroundColor: colors.glass.balloon, borderColor: colors.glass.balloonRing, borderRadius: radius.lg });
  });

  it('o letreiro manuscrito tem texto alternativo; as imagens de fundo e do pino são decorativas', async () => {
    await abrir();
    expect(screen.getByLabelText('Mais liberdade para o seu dia')).toBeTruthy();
    expect(screen.getByTestId('onboarding-pino')).toHaveProp('accessible', false);
  });

  it('há duas divisórias entre os três benefícios', async () => {
    await abrir();
    expect(screen.getAllByTestId('onboarding-divisoria')).toHaveLength(2);
  });

  it('o pager tem três pontos, o primeiro aceso e os outros apagados, escondidos do leitor de tela', async () => {
    await abrir();
    const pontos = screen.getAllByTestId('onboarding-pagina', { includeHiddenElements: true });
    expect(pontos.map((p) => estilo(p).backgroundColor)).toEqual([colors.onboarding.pagerOn, colors.onboarding.pagerOff, colors.onboarding.pagerOff]);
    expect(pontos[0]).toHaveStyle({ width: size.onboarding.pagerWidth, height: size.onboarding.pagerHeight, borderRadius: radius.pill });
    expect(screen.queryByTestId('onboarding-pagina')).toBeNull(); // fora da árvore de acessibilidade
  });
});

describe('Onboarding: ações', () => {
  it('"Pular" chama onSkip e o botão grande chama onStart', async () => {
    const { onSkip, onStart } = await abrir();
    await fireEvent.press(screen.getByRole('button', { name: 'Pular' }));
    expect([onSkip.mock.calls.length, onStart.mock.calls.length]).toEqual([1, 0]);
    await fireEvent.press(screen.getByRole('button', { name: 'Criar meu primeiro lembrete' }));
    expect([onSkip.mock.calls.length, onStart.mock.calls.length]).toEqual([1, 1]);
  });

  it('o botão grande é laranja, alto e sem brilho, com a seta depois do rótulo', async () => {
    await abrir();
    const botao = screen.getByRole('button', { name: 'Criar meu primeiro lembrete' });
    expect(botao).toHaveStyle({ backgroundColor: colors.action.primary, minHeight: size.onboarding.heroButton });
    expect(estilo(botao)).not.toHaveProperty('boxShadow');
    expect(screen.getByTestId('icone-arrow-right', { includeHiddenElements: true })).toBeTruthy();
  });

  it('"Pular" é uma pílula de vidro com a seta', async () => {
    await abrir();
    expect(screen.getByRole('button', { name: 'Pular' })).toHaveStyle({ width: size.onboarding.skipWidth, height: size.onboarding.skipHeight, borderRadius: radius.pill, borderColor: colors.glass.border });
    expect(screen.getByTestId('icone-chevron-right', { includeHiddenElements: true })).toBeTruthy();
  });
});

describe('Onboarding: encaixe na tela', () => {
  it('a cena tem a proporção da arte e nunca passa de um terço da altura da janela', async () => {
    await abrir();
    const { width, height } = Dimensions.get('window');
    const coluna = Math.min(width, layout.columnMax);
    const altura = Math.min(coluna * layout.onboardingSceneRatio, height * 0.32);
    const cena = estilo(screen.getByTestId('onboarding-cena'));
    expect(cena.height).toBeCloseTo(altura, 5);
    expect(cena.width).toBeCloseTo(altura / layout.onboardingSceneRatio, 5);
    expect(altura).toBeLessThanOrEqual(height * 0.32 + 1e-9);
  });

  it('numa janela baixa a cena encolhe para um terço da altura, mantendo a proporção da arte', async () => {
    jest.spyOn(Dimensions, 'get').mockReturnValue({ width: 390, height: 640, scale: 2, fontScale: 1 });
    await abrir();
    const cena = estilo(screen.getByTestId('onboarding-cena'));
    expect(cena.height).toBeCloseTo(640 * 0.32, 5);
    expect(cena.width).toBeCloseTo((640 * 0.32) / layout.onboardingSceneRatio, 5);
    jest.restoreAllMocks();
  });

  it('é a tela de quem ainda não entrou, sem barra de abas: a base respeita a área segura do sistema', async () => {
    await abrir({}, { top: 47, bottom: 34 });
    expect(estilo(screen.getByTestId('onboarding').children[1] as never)).toMatchObject({ paddingTop: 47, paddingBottom: 34 });
  });

  it('as folgas são elásticas e proporcionais: a de cima pesa 113 e a última 156', async () => {
    await abrir();
    const fluxo = screen.getByTestId('onboarding').children[1] as { children: { props: { style?: unknown } }[] };
    const pesos = fluxo.children.map((f) => estilo(f).flexGrow).filter((g) => typeof g === 'number');
    expect(pesos).toEqual([113, 107, 32, 47, 43, 56, 96, 156]);
    expect(fluxo.children.map((f) => estilo(f).flexShrink).filter((g) => g === 1)).toHaveLength(8);
  });
});

describe('AppBrand na abertura', () => {
  it('o nome vai em sans negrito grande, com "Ai" em destaque, sobre o mesmo tile', async () => {
    await render(<AppBrand variant="onboarding" />);
    const nome = screen.getByText(/Lembrei/);
    expect(estilo(nome)).toMatchObject({ fontFamily: fontFamily.bold, fontSize: size.onboarding.brandName });
    expect(estilo(screen.getByText('Ai'))).toMatchObject({ color: colors.text.brandAccent });
    expect(screen.getByText('Sua rotina, mais leve.')).toBeTruthy();
  });

  it('na lista o nome continua em serifa e sem destaque', async () => {
    await render(<AppBrand />);
    expect(estilo(screen.getByText('LembreiAi'))).toMatchObject({ fontFamily: fontFamily.serif });
    expect(screen.queryByText('Ai')).toBeNull();
  });
});
