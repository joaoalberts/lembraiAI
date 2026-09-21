import '@testing-library/react-native/matchers';
import { act, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo, Platform, StyleSheet, Text } from 'react-native';
import { FAISCAS, HEROI } from '../../design/heroi';
import { SucessoHeroi } from '../SucessoHeroi';
import { Subida } from '../Subida';

const ESCONDIDO = { includeHiddenElements: true } as const;
const el = (id: string) => screen.getByTestId(id, ESCONDIDO);
const estilo = (id: string) => StyleSheet.flatten(el(id).props.style) as { opacity: number; transform: Record<string, unknown>[] };
const transformacao = (id: string, chave: string) => estilo(id).transform.find((t) => chave in t)?.[chave];
/** O traço do visto: quanto falta desenhar. Depois de pronto o valor é 0 e o SVG o entrega como `null`. */
const faltaDoVisto = () => Number(el('heroi-visto').props.strokeDashoffset ?? 0);
const avancar = async (ms: number) => { await act(async () => { jest.advanceTimersByTime(ms); }); };

const responderReduzir = (reduzir: boolean) => jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(reduzir);

describe('SucessoHeroi: quadro final (reduzir movimento)', () => {
  beforeEach(() => responderReduzir(true));

  it('não tem ondas, faíscas nem o brilho que passa sobre o selo', async () => {
    await render(<SucessoHeroi />);
    expect(screen.queryByTestId('heroi-onda-1', ESCONDIDO)).toBeNull();
    expect(screen.queryByTestId('heroi-onda-2', ESCONDIDO)).toBeNull();
    expect(screen.queryByTestId('heroi-faisca-1', ESCONDIDO)).toBeNull();
    expect(screen.queryByTestId('heroi-brilho-do-selo', ESCONDIDO)).toBeNull();
  });

  it('o selo, o brilho, o anel e o disco já estão inteiros e no lugar', async () => {
    await render(<SucessoHeroi />);
    expect(estilo('heroi-selo')).toMatchObject({ opacity: 1, transform: [{ scale: 1 }, { rotate: '0deg' }] });
    expect(estilo('heroi-brilho')).toMatchObject({ opacity: 1, transform: [{ scale: 1 }] });
    expect(estilo('heroi-anel')).toMatchObject({ opacity: 1, transform: [{ scale: 1 }] });
    expect(estilo('heroi-disco')).toMatchObject({ opacity: 1, transform: [{ scale: 1 }] });
  });

  it('o visto aparece inteiro e os dois pontos ficam parados e visíveis', async () => {
    await render(<SucessoHeroi />);
    expect(faltaDoVisto()).toBe(0);
    for (const id of ['heroi-cintilacao-1', 'heroi-cintilacao-2']) expect(estilo(id)).toMatchObject({ opacity: 1, transform: expect.arrayContaining([{ scale: 1 }]) });
  });
});

describe('SucessoHeroi: animado', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // o driver nativo do Animated não roda no Jest: na web (JS puro) o relógio falso acompanha a animação
    jest.replaceProperty(Platform, 'OS', 'web');
    responderReduzir(false);
  });
  afterEach(() => jest.useRealTimers());

  it('enquanto o sistema não diz se a pessoa pediu para reduzir movimento, não desenha nada', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockReturnValue(new Promise(() => {}));
    await render(<SucessoHeroi />);
    expect(screen.queryByTestId('heroi', ESCONDIDO)).toBeNull();
  });

  it('começa apagado: selo pequeno e girado, visto escondido, brilho transparente; e já tem 14 faíscas, 2 ondas e o brilho que passa', async () => {
    await render(<SucessoHeroi />);
    expect(estilo('heroi-selo')).toMatchObject({ opacity: 0, transform: [{ scale: HEROI.selo.entrada.escalaInicial }, { rotate: `${HEROI.selo.entrada.giroInicial}deg` }] });
    expect(estilo('heroi-brilho').opacity).toBe(0);
    expect(faltaDoVisto()).toBeCloseTo(HEROI.selo.visto.comprimento, 1);
    expect(screen.getAllByTestId(/^heroi-faisca-/, ESCONDIDO)).toHaveLength(14);
    expect(screen.getAllByTestId(/^heroi-onda-/, ESCONDIDO)).toHaveLength(2);
    expect(el('heroi-brilho-do-selo')).toBeTruthy();
  });

  it('o selo "estoura": passa do tamanho final aos 0,55 s e assenta em 1 aos 0,85 s, já sem giro', async () => {
    await render(<SucessoHeroi />);
    await avancar(550);
    const escala = transformacao('heroi-selo', 'scale') as number;
    expect(escala).toBeGreaterThan(1.03);
    expect(escala).toBeLessThan(1.15);
    await avancar(400);
    expect(estilo('heroi-selo')).toMatchObject({ opacity: 1, transform: [{ scale: 1 }, { rotate: '0deg' }] });
  });

  it('o visto se desenha entre 0,55 s e 1,1 s: nada antes, pela metade no meio, inteiro depois', async () => {
    await render(<SucessoHeroi />);
    await avancar(500);
    expect(faltaDoVisto()).toBeCloseTo(HEROI.selo.visto.comprimento, 1);
    await avancar(330);
    expect(faltaDoVisto()).toBeGreaterThan(0);
    expect(faltaDoVisto()).toBeLessThan(HEROI.selo.visto.comprimento);
    await avancar(400);
    expect(faltaDoVisto()).toBe(0);
  });

  it('cada faísca sai do centro para o seu destino e some; as ondas crescem e somem; o selo fica', async () => {
    await render(<SucessoHeroi />);
    const primeira = FAISCAS[0];
    // 0,3 s depois de a primeira faísca partir: já no meio do caminho, visível
    await avancar((primeira.atraso + 0.3) * 1000);
    const meio = transformacao('heroi-faisca-1', 'translateX') as number;
    expect(meio).toBeLessThan(0);
    expect(meio).toBeGreaterThan(primeira.dx);
    expect(estilo('heroi-faisca-1').opacity).toBe(1);
    await avancar(3000);
    expect(estilo('heroi-faisca-1').opacity).toBe(0);
    expect(transformacao('heroi-faisca-1', 'translateX')).toBeCloseTo(primeira.dx, 3);
    expect(estilo('heroi-onda-1').opacity).toBe(0);
    expect(transformacao('heroi-onda-1', 'scale')).toBeCloseTo(HEROI.onda.escalaFinal, 3);
    expect(estilo('heroi-selo').opacity).toBe(1);
  });

  it('as ondas esperam a sua vez em repouso (o `both` do CSS): antes de começar ficam no tamanho e na opacidade iniciais', async () => {
    await render(<SucessoHeroi />);
    expect(estilo('heroi-onda-2')).toMatchObject({ opacity: HEROI.onda.opacidadeInicial, transform: [{ scale: HEROI.onda.escalaInicial }] });
  });

  it('os dois pontos aparecem aos poucos e depois cintilam para sempre (opacidade de 1 a 0,35 e de volta, ciclo de 2,8 s)', async () => {
    await render(<SucessoHeroi />);
    const ponto = HEROI.cintilacao.pontos[0];
    expect(estilo('heroi-cintilacao-1').opacity).toBe(0);
    await avancar((ponto.comecaEm + 0.05) * 1000);
    expect(estilo('heroi-cintilacao-1').opacity).toBeCloseTo(1, 1);
    await avancar((HEROI.cintilacao.ciclo / 2) * 1000 - 50);
    expect(estilo('heroi-cintilacao-1').opacity).toBeCloseTo(HEROI.cintilacao.opacidadeMinima, 1);
    await avancar((HEROI.cintilacao.ciclo / 2) * 1000);
    expect(estilo('heroi-cintilacao-1').opacity).toBeCloseTo(1, 1);
    await avancar(HEROI.cintilacao.ciclo * 1000);
    expect(estilo('heroi-cintilacao-1').opacity).toBeCloseTo(1, 1);
  });

  it('ao sair da tela as animações param: depois disso ninguém pede mais quadros (o pulso dos pontos é infinito)', async () => {
    const quadros = jest.spyOn(globalThis, 'requestAnimationFrame');
    const { unmount } = await render(<SucessoHeroi />);
    await avancar(2000);
    expect(quadros).toHaveBeenCalled();
    await unmount();
    quadros.mockClear();
    await avancar(6000);
    expect(quadros).not.toHaveBeenCalled();
  });

  it('se a pessoa liga "reduzir movimento" com a tela aberta, vai para o quadro final na hora', async () => {
    let avisar: (valor: boolean) => void = () => {};
    jest.spyOn(AccessibilityInfo, 'addEventListener').mockImplementation(((_: string, ouvinte: (valor: boolean) => void) => {
      avisar = ouvinte;
      return { remove: jest.fn() };
    }) as never);
    await render(<SucessoHeroi />);
    expect(screen.getAllByTestId(/^heroi-faisca-/, ESCONDIDO)).toHaveLength(14);
    await act(async () => { avisar(true); });
    expect(screen.queryByTestId('heroi-faisca-1', ESCONDIDO)).toBeNull();
    expect(estilo('heroi-selo')).toMatchObject({ opacity: 1, transform: [{ scale: 1 }, { rotate: '0deg' }] });
    expect(faltaDoVisto()).toBe(0);
  });
});

describe('SucessoHeroi: posição e leitor de tela', () => {
  beforeEach(() => responderReduzir(true));

  it('é ancorado no meio da largura, à altura do original, sem ocupar espaço nem receber toque', async () => {
    await render(<SucessoHeroi />);
    expect(estilo('heroi')).toMatchObject({ position: 'absolute', left: '50%', top: HEROI.centroY, width: 0, height: 0, pointerEvents: 'none' });
  });

  it('é decorativo: o leitor de tela pula tudo (o título logo abaixo diz o mesmo)', async () => {
    await render(<SucessoHeroi />);
    expect(el('heroi').props.accessibilityElementsHidden).toBe(true);
    expect(el('heroi').props.importantForAccessibility).toBe('no-hide-descendants');
  });

  it('cada camada é centrada no eixo pela margem negativa de metade do lado', async () => {
    await render(<SucessoHeroi />);
    expect(estilo('heroi-selo')).toMatchObject({ width: HEROI.selo.tamanho, height: HEROI.selo.tamanho, marginLeft: -HEROI.selo.tamanho / 2, marginTop: -HEROI.selo.tamanho / 2, borderRadius: HEROI.selo.raio });
    expect(estilo('heroi-disco')).toMatchObject({ width: HEROI.disco.tamanho, marginLeft: -HEROI.disco.tamanho / 2 });
    expect(estilo('heroi-brilho')).toMatchObject({ width: HEROI.brilho.tamanho, marginLeft: -HEROI.brilho.tamanho / 2 });
  });

  it('o selo leva a sombra funda e o disco o halo menta, como no original', async () => {
    await render(<SucessoHeroi />);
    expect(estilo('heroi-selo')).toMatchObject({ boxShadow: HEROI.selo.sombra });
    expect(estilo('heroi-disco')).toMatchObject({ boxShadow: HEROI.disco.sombra });
  });
});

describe('Subida', () => {
  const abrir = () => render(<Subida janela={HEROI.subida.titulo}><Text>Lembrete criado</Text></Subida>);
  const dono = () => StyleSheet.flatten(screen.getByText('Lembrete criado').parent!.props.style) as { opacity: number; transform: { translateY: number }[] };

  it('com "reduzir movimento" o texto já chega inteiro e no lugar', async () => {
    responderReduzir(true);
    await abrir();
    expect(dono()).toMatchObject({ opacity: 1, transform: [{ translateY: 0 }] });
  });

  describe('com movimento', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.replaceProperty(Platform, 'OS', 'web');
      responderReduzir(false);
    });
    afterEach(() => jest.useRealTimers());

    it('começa invisível e 22 du abaixo, espera até 0,6 s, sobe até 1,4 s e fica', async () => {
      await abrir();
      expect(dono()).toMatchObject({ opacity: 0, transform: [{ translateY: HEROI.subida.distancia }] });
      await avancar(500);
      expect(dono().opacity).toBe(0);
      await avancar(400);
      expect(dono().opacity).toBeGreaterThan(0);
      expect(dono().transform[0].translateY).toBeLessThan(HEROI.subida.distancia);
      await avancar(1000);
      expect(dono()).toMatchObject({ opacity: 1, transform: [{ translateY: 0 }] });
    });
  });
});
