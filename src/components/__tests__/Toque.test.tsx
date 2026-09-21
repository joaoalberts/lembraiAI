import '@testing-library/react-native/matchers';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Platform, StyleSheet, Text } from 'react-native';
import { size } from '../../design/tokens';
import { Toque, folgaAteOAlvo, respiroDoToque } from '../Toque';

const ESCONDIDO = { includeHiddenElements: true } as const;
const medir = (largura: number, altura: number) =>
  fireEvent(screen.getByRole('button'), 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: largura, height: altura } } });

afterEach(() => jest.restoreAllMocks());

describe('folgaAteOAlvo (a conta)', () => {
  it('cada eixo ganha o que falta para o alvo, dividido pelos dois lados', () => {
    expect(folgaAteOAlvo({ largura: 36, altura: 36 }, 44)).toEqual({ top: 4, bottom: 4, left: 4, right: 4 });
    expect(folgaAteOAlvo({ largura: 94, altura: 21 }, 44)).toEqual({ top: 11.5, bottom: 11.5, left: 0, right: 0 });
    expect(folgaAteOAlvo({ largura: 38, altura: 46 }, 44)).toEqual({ top: 0, bottom: 0, left: 3, right: 3 });
  });

  it('o que já tem 44 ou mais não ganha folga (undefined), e sem medida também não', () => {
    expect(folgaAteOAlvo({ largura: 44, altura: 44 }, 44)).toBeUndefined();
    expect(folgaAteOAlvo({ largura: 300, altura: 60 }, 44)).toBeUndefined();
    expect(folgaAteOAlvo(null, 44)).toBeUndefined();
  });

  it('a folga pedida por quem usa vale se for maior, lado a lado (número vale para os quatro)', () => {
    expect(folgaAteOAlvo({ largura: 36, altura: 36 }, 44, 10)).toEqual({ top: 10, bottom: 10, left: 10, right: 10 });
    expect(folgaAteOAlvo({ largura: 36, altura: 36 }, 44, { top: 20 })).toEqual({ top: 20, bottom: 4, left: 4, right: 4 });
    expect(folgaAteOAlvo({ largura: 100, altura: 100 }, 44, { left: 6 })).toEqual({ top: 0, bottom: 0, left: 6, right: 0 });
  });

  it('alvo mínimo 0 desliga a folga automática', () => {
    expect(folgaAteOAlvo({ largura: 10, altura: 10 }, 0)).toBeUndefined();
  });
});

describe('respiroDoToque (quanto falta em cada borda para o alvo)', () => {
  it('metade do que falta para o alvo: é o quanto o toque passa do desenho de cada lado', () => {
    expect(respiroDoToque(36)).toBe(4);
    expect(respiroDoToque(38)).toBe(3);
    expect(respiroDoToque(20, 44)).toBe(12);
  });

  it('o que já tem o alvo (ou mais) não precisa de respiro, e o alvo mínimo 0 o desliga', () => {
    expect(respiroDoToque(44)).toBe(0);
    expect(respiroDoToque(60)).toBe(0);
    expect(respiroDoToque(10, 0)).toBe(0);
  });

  it('usa o alvo mínimo dos tokens (44)', () => {
    jest.replaceProperty(size, 'touch', 48 as never);
    expect(respiroDoToque(36)).toBe(6);
  });
});

describe('Toque no celular (iOS e Android)', () => {
  const abrir = (props: Partial<React.ComponentProps<typeof Toque>> = {}) =>
    render(<Toque accessibilityRole="button" accessibilityLabel="Voltar" onPress={jest.fn()} {...props}><Text>x</Text></Toque>);

  it('sem medida ainda não há folga', async () => {
    await abrir();
    expect(screen.getByRole('button')).not.toHaveProp('hitSlop');
  });

  it('depois de medido, completa o alvo até 44 com o hitSlop do sistema', async () => {
    await abrir();
    await medir(36, 36);
    expect(screen.getByRole('button')).toHaveProp('hitSlop', { top: 4, bottom: 4, left: 4, right: 4 });
  });

  it('só o eixo que falta ganha folga', async () => {
    await abrir();
    await medir(94, 21);
    expect(screen.getByRole('button')).toHaveProp('hitSlop', { top: 11.5, bottom: 11.5, left: 0, right: 0 });
  });

  it('controle que já tem 44 não ganha folga', async () => {
    await abrir();
    await medir(120, 52);
    expect(screen.getByRole('button')).not.toHaveProp('hitSlop');
  });

  it('usa o alvo mínimo dos tokens (44) e respeita o hitSlop pedido, se maior', async () => {
    expect(size.touch).toBe(44);
    await abrir({ hitSlop: 10 });
    await medir(36, 36);
    expect(screen.getByRole('button')).toHaveProp('hitSlop', { top: 10, bottom: 10, left: 10, right: 10 });
  });

  it('quando o tamanho muda a folga acompanha', async () => {
    await abrir();
    await medir(36, 36);
    await medir(44, 44);
    expect(screen.getByRole('button')).not.toHaveProp('hitSlop');
  });

  it('não desenha nada a mais: o celular não precisa da camada da web', async () => {
    await abrir();
    await medir(36, 36);
    expect(screen.queryByTestId('folga-de-toque', ESCONDIDO)).toBeNull();
  });

  it('o toque, os filhos em função (com o estado) e o onLayout de quem usa continuam funcionando', async () => {
    const onPress = jest.fn();
    const onLayout = jest.fn();
    await render(
      <Toque accessibilityRole="button" accessibilityLabel="Ir" onPress={onPress} onLayout={onLayout}>
        {(estado) => <Text>{estado.pressed ? 'apertado' : 'solto'}</Text>}
      </Toque>,
    );
    expect(screen.getByText('solto')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
    await medir(30, 30);
    expect(onLayout).toHaveBeenCalledTimes(1);
  });
});

describe('Toque no navegador (o react-native-web não tem hitSlop)', () => {
  beforeEach(() => { jest.replaceProperty(Platform, 'OS', 'web'); });
  const abrir = (props: Partial<React.ComponentProps<typeof Toque>> = {}) =>
    render(<Toque accessibilityRole="button" accessibilityLabel="Voltar" onPress={jest.fn()} {...props}><Text>x</Text></Toque>);

  it('depois de medido, uma camada transparente estende o alvo até 44 por dentro do botão (o clique nela vale como clique nele)', async () => {
    await abrir();
    await medir(36, 36);
    const folga = screen.getByTestId('folga-de-toque', ESCONDIDO);
    expect(StyleSheet.flatten(folga.props.style)).toMatchObject({ position: 'absolute', top: -4, bottom: -4, left: -4, right: -4 });
    expect(screen.getByRole('button')).not.toHaveProp('hitSlop');
  });

  it('só o eixo que falta estende', async () => {
    await abrir();
    await medir(94, 21);
    expect(StyleSheet.flatten(screen.getByTestId('folga-de-toque', ESCONDIDO).props.style)).toMatchObject({ top: -11.5, bottom: -11.5, left: 0, right: 0 });
  });

  it('com borda no botão a camada sai por fora da borda: o filho absoluto se mede pela borda de dentro e, sem descontá-la, o alvo ficaria curto', async () => {
    const original = Object.getOwnPropertyDescriptor(global, 'getComputedStyle');
    Object.defineProperty(global, 'getComputedStyle', {
      configurable: true,
      writable: true,
      value: jest.fn(() => ({ borderTopWidth: '1px', borderBottomWidth: '1px', borderLeftWidth: '1px', borderRightWidth: '2px' })),
    });
    try {
      await abrir();
      await medir(36, 36);
      expect(StyleSheet.flatten(screen.getByTestId('folga-de-toque', ESCONDIDO).props.style)).toMatchObject({ top: -5, bottom: -5, left: -5, right: -6 });
    } finally {
      if (original) Object.defineProperty(global, 'getComputedStyle', original);
      else delete (global as { getComputedStyle?: unknown }).getComputedStyle;
    }
  });

  it('sem estilo calculado (renderização no servidor) a borda vale 0', async () => {
    await abrir();
    await medir(36, 36);
    expect(StyleSheet.flatten(screen.getByTestId('folga-de-toque', ESCONDIDO).props.style)).toMatchObject({ top: -4, bottom: -4, left: -4, right: -4 });
  });

  it('a camada não aparece para o leitor de tela', async () => {
    await abrir();
    await medir(36, 36);
    const folga = screen.getByTestId('folga-de-toque', ESCONDIDO);
    expect(folga).toHaveProp('aria-hidden', true);
    expect(folga).toHaveProp('importantForAccessibility', 'no-hide-descendants');
  });

  it('sem falta de tamanho (44 ou mais) não há camada', async () => {
    await abrir();
    await medir(44, 60);
    expect(screen.queryByTestId('folga-de-toque', ESCONDIDO)).toBeNull();
  });

  it('os filhos, inclusive em função, aparecem junto da camada', async () => {
    await render(
      <Toque accessibilityRole="button" accessibilityLabel="Ir" onPress={jest.fn()}>
        {(estado) => <Text>{estado.pressed ? 'apertado' : 'solto'}</Text>}
      </Toque>,
    );
    await medir(30, 30);
    expect(screen.getByText('solto')).toBeTruthy();
    expect(screen.getByTestId('folga-de-toque', ESCONDIDO)).toBeTruthy();
  });
});

describe('Toque: o anel de foco é só do teclado', () => {
  const alvo = (visivel: boolean) => ({ matches: (seletor: string) => seletor === ':focus-visible' && visivel });
  const focar = (destino: unknown) => fireEvent(screen.getByRole('button'), 'focus', { nativeEvent: { target: destino } });
  const desfocar = () => fireEvent(screen.getByRole('button'), 'blur', { nativeEvent: { target: {} } });
  const abrir = (props: Partial<React.ComponentProps<typeof Toque>> = {}) =>
    render(
      <Toque accessibilityRole="button" accessibilityLabel="Ir" onPress={jest.fn()} {...props}>
        {(estado) => <Text>{(estado as { focused?: boolean }).focused ? 'com anel' : 'sem anel'}</Text>}
      </Toque>,
    );

  describe('no navegador', () => {
    beforeEach(() => { jest.replaceProperty(Platform, 'OS', 'web'); });

    it('clique ou toque dá foco ao botão, mas o navegador diz que não é de teclado: sem anel (era o contorno verde que ficava grudado na aba)', async () => {
      await abrir();
      await focar(alvo(false));
      expect(screen.getByText('sem anel')).toBeTruthy();
    });

    it('foco de teclado desenha o anel e sair do botão o apaga', async () => {
      await abrir();
      await focar(alvo(true));
      expect(screen.getByText('com anel')).toBeTruthy();
      await desfocar();
      expect(screen.getByText('sem anel')).toBeTruthy();
    });

    it('depois de um clique, o Tab que chega de novo ao botão volta a desenhar o anel', async () => {
      await abrir();
      await focar(alvo(false));
      await desfocar();
      await focar(alvo(true));
      expect(screen.getByText('com anel')).toBeTruthy();
    });

    it('o estilo em função recebe o mesmo estado: o anel da barra de abas segue a regra', async () => {
      const visto: (boolean | undefined)[] = [];
      await abrir({ style: (estado) => { visto.push((estado as { focused?: boolean }).focused); return null; } });
      await focar(alvo(false));
      expect(visto.at(-1)).toBe(false);
      await desfocar();
      await focar(alvo(true));
      expect(visto.at(-1)).toBe(true);
    });

    it('sem `matches` no alvo vale como teclado, e o onFocus e o onBlur de quem usa continuam chamados', async () => {
      const onFocus = jest.fn();
      const onBlur = jest.fn();
      await abrir({ onFocus, onBlur });
      await focar({});
      expect(screen.getByText('com anel')).toBeTruthy();
      expect(onFocus).toHaveBeenCalledTimes(1);
      await desfocar();
      expect(onBlur).toHaveBeenCalledTimes(1);
    });
  });

  it('no celular (iOS e Android) o estado do foco não é mexido: o anel é coisa da web', async () => {
    await abrir();
    await focar({});
    expect(screen.getByText('sem anel')).toBeTruthy();
  });
});
