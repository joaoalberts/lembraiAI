import '@testing-library/react-native/matchers';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo, Dimensions, Platform, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors, layout, radius, size } from '../../design/tokens';
import { Sheet } from '../Sheet';

/** Com a folha modal, o resto (o véu) sai da árvore de acessibilidade de propósito: os testes o alcançam mesmo assim. */
const ESCONDIDO = { includeHiddenElements: true };
const TELA = { width: 390, height: 844 };
const comInsets = (bottom: number) => ({ frame: { x: 0, y: 0, ...TELA }, insets: { top: 47, left: 0, right: 0, bottom } });

interface No { type?: string; props: Record<string, unknown>; children?: unknown }
/** Acha o primeiro elemento de um tipo (o Modal não tem testID nem papel para consultar). */
function noDoTipo(no: unknown, tipo: string): No | undefined {
  if (!no || typeof no !== 'object') return undefined;
  const n = no as No;
  if (n.type === tipo) return n;
  for (const filho of ([] as unknown[]).concat(n.children ?? [])) { const achado = noDoTipo(filho, tipo); if (achado) return achado; }
  return undefined;
}

async function abrir(props: Partial<React.ComponentProps<typeof Sheet>> = {}, bottom = 0) {
  const onClose = jest.fn();
  const resultado = await render(
    <SafeAreaProvider initialMetrics={comInsets(bottom)}>
      <Sheet visible onClose={onClose} title="Excluir lembrete?" {...props}>
        <Text>conteúdo da folha</Text>
      </Sheet>
    </SafeAreaProvider>,
  );
  return { onClose, ...resultado };
}

afterEach(() => jest.restoreAllMocks());

describe('Sheet', () => {
  it('mostra título, subtítulo e o que vem dentro', async () => {
    await abrir({ subtitle: '“Comprar água” será removido.' });
    expect(screen.getByText('Excluir lembrete?')).toBeTruthy();
    expect(screen.getByText('“Comprar água” será removido.')).toBeTruthy();
    expect(screen.getByText('conteúdo da folha')).toBeTruthy();
  });

  it('sem subtítulo não desenha linha vazia', async () => {
    await abrir();
    expect(screen.getAllByText(/./)).toHaveLength(2); // título e conteúdo
  });

  it('fechada não desenha nada', async () => {
    await render(
      <SafeAreaProvider initialMetrics={comInsets(0)}>
        <Sheet visible={false} onClose={jest.fn()} title="Horário" />
      </SafeAreaProvider>,
    );
    expect(screen.queryByText('Horário')).toBeNull();
  });

  it('o toque no véu fecha', async () => {
    const { onClose } = await abrir();
    await fireEvent.press(screen.getByLabelText('Fechar', ESCONDIDO));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('o botão voltar do Android e a tecla Esc da web chegam ao Modal como onRequestClose e fecham', async () => {
    const { onClose } = await abrir();
    const modal = noDoTipo(screen.toJSON(), 'Modal');
    await act(async () => { (modal?.props.onRequestClose as () => void)(); });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('o gesto de escape do leitor de tela (iOS) fecha', async () => {
    const { onClose } = await abrir();
    await act(async () => { (screen.getByTestId('sheet-folha').props.onAccessibilityEscape as () => void)(); });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('é um diálogo modal com o título como nome, e o título é um cabeçalho', async () => {
    await abrir();
    const folha = screen.getByTestId('sheet-folha');
    expect(folha).toHaveProp('role', 'dialog');
    expect(folha).toHaveProp('aria-modal', true);
    expect(folha).toHaveProp('aria-label', 'Excluir lembrete?');
    expect(screen.getByRole('header', { name: 'Excluir lembrete?' })).toBeTruthy();
  });

  it('cantos altos, fundo de cartão e largura de uma coluna de celular (o Modal da web sai da coluna do app)', async () => {
    await abrir();
    expect(screen.getByTestId('sheet-folha')).toHaveStyle({
      backgroundColor: colors.bg.card, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, maxWidth: layout.columnMax,
    });
  });

  it('não passa de 82% da altura da tela (o resto rola)', async () => {
    await abrir();
    expect(screen.getByTestId('sheet-folha')).toHaveStyle({ maxHeight: Dimensions.get('window').height * layout.sheetMaxHeight });
  });

  it('o véu é o verde-escuro translúcido do padrão', async () => {
    await abrir();
    expect(screen.getByTestId('sheet-veu', ESCONDIDO)).toHaveStyle({ backgroundColor: colors.overlay });
  });

  it('a base respeita a área segura do sistema, e nunca fica menor que o espaço do padrão', async () => {
    const semBarra = await abrir({}, 0);
    expect(JSON.stringify(semBarra.toJSON())).toContain(`"paddingBottom":${size.sheet.paddingBottom}`);
    await semBarra.unmount();
    await abrir({}, 60);
    expect(JSON.stringify(screen.toJSON())).toContain('"paddingBottom":60');
  });

  it('mostra a ação do canto (o "Pronto" do horário)', async () => {
    await abrir({ action: <Text>Pronto</Text> });
    expect(screen.getByText('Pronto')).toBeTruthy();
  });
});

describe('Sheet: movimento', () => {
  const medir = async () => {
    await act(async () => { fireEvent(screen.getByTestId('sheet-folha'), 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: TELA.width, height: 300 } } }); });
  };

  it('com "reduzir movimento" já aparece pronta: véu inteiro e folha no lugar', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    await abrir();
    await medir();
    expect(screen.getByTestId('sheet-folha')).toHaveStyle({ opacity: 1, transform: [{ translateY: 0 }] });
    expect(screen.getByTestId('sheet-veu', ESCONDIDO)).toHaveStyle({ opacity: 1 });
  });

  it('antes de medir a folha fica invisível, para não piscar no lugar final antes de subir', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    await abrir();
    expect(screen.getByTestId('sheet-folha')).toHaveStyle({ opacity: 0 });
  });

  it('sem "reduzir movimento" o véu começa transparente e a folha começa fora da tela, embaixo', async () => {
    jest.useFakeTimers();
    // o driver nativo do Animated não roda no Jest: na web (JS puro) o relógio falso acompanha a animação
    jest.replaceProperty(Platform, 'OS', 'web');
    try {
      jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
      await abrir();
      await medir();
      expect(screen.getByTestId('sheet-folha')).toHaveStyle({ opacity: 1, transform: [{ translateY: 300 }] });
      expect(screen.getByTestId('sheet-veu', ESCONDIDO)).toHaveStyle({ opacity: 0 });
      // aos 200 ms o véu (180 ms) já chegou, mas a folha (260 ms) ainda está subindo
      await act(async () => { jest.advanceTimersByTime(200); });
      expect(screen.getByTestId('sheet-veu', ESCONDIDO)).toHaveStyle({ opacity: 1 });
      const meio = JSON.stringify(screen.getByTestId('sheet-folha').props.style);
      expect(meio).not.toContain('"translateY":0');
      await act(async () => { jest.advanceTimersByTime(200); });
      expect(screen.getByTestId('sheet-folha')).toHaveStyle({ transform: [{ translateY: 0 }] });
      expect(screen.getByTestId('sheet-veu', ESCONDIDO)).toHaveStyle({ opacity: 1 });
    } finally {
      jest.useRealTimers();
    }
  });
});
