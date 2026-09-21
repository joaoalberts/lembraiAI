import { act, renderHook } from '@testing-library/react-native';
import { Keyboard, Platform } from 'react-native';
import { comAreaSegura } from '../../test-utils/area-segura';
import { useAlturaDoTeclado } from '../teclado';

afterEach(() => jest.restoreAllMocks());

/** Troca o `Keyboard.addListener` por um que guarda os ouvintes, para o teste "digitar" os eventos do sistema. */
function simularTeclado() {
  const ouvintes = new Map<string, (e: unknown) => void>();
  const remover = jest.fn();
  jest.spyOn(Keyboard, 'addListener').mockImplementation(((evento: string, ouvinte: (e: unknown) => void) => {
    ouvintes.set(evento, ouvinte);
    return { remove: remover };
  }) as never);
  const disparar = (evento: string, altura: number) =>
    act(async () => { ouvintes.get(evento)?.({ endCoordinates: { screenX: 0, screenY: 0, width: 390, height: altura } }); });
  return { ouvintes, remover, disparar };
}

const abrir = (insets?: { bottom?: number }) => renderHook(() => useAlturaDoTeclado(), { wrapper: ({ children }) => comAreaSegura(<>{children}</>, insets) });

describe('useAlturaDoTeclado no iOS', () => {
  it('é 0 com o teclado fechado, e acompanha a altura que o sistema informa ao abrir e ao fechar', async () => {
    const { disparar } = simularTeclado();
    const { result } = await abrir({ bottom: 34 });
    expect(result.current).toBe(0);
    await disparar('keyboardWillShow', 336);
    expect(result.current).toBe(336);
    await disparar('keyboardWillHide', 0);
    expect(result.current).toBe(0);
  });

  it('não soma a área segura: a altura do teclado do iOS já cobre o indicador de início', async () => {
    const { disparar } = simularTeclado();
    const { result } = await abrir({ bottom: 34 });
    await disparar('keyboardWillShow', 300);
    expect(result.current).toBe(300);
  });

  it('acompanha o teclado que muda de altura sem fechar (trocar de teclado)', async () => {
    const { disparar } = simularTeclado();
    const { result } = await abrir();
    await disparar('keyboardWillShow', 291);
    await disparar('keyboardWillShow', 336);
    expect(result.current).toBe(336);
  });

  it('para de ouvir os dois eventos quando quem usa sai da tela', async () => {
    const { remover } = simularTeclado();
    const { unmount } = await abrir();
    await unmount();
    expect(remover).toHaveBeenCalledTimes(2);
  });
});

describe('useAlturaDoTeclado no Android', () => {
  beforeEach(() => { jest.replaceProperty(Platform, 'OS', 'android'); });

  it('ouve os eventos "Did" (o Android não tem os "Will")', async () => {
    const { ouvintes } = simularTeclado();
    await abrir();
    expect([...ouvintes.keys()].sort()).toEqual(['keyboardDidHide', 'keyboardDidShow']);
  });

  it('soma a barra de navegação à altura informada: o evento a desconta, mas o app desenha por baixo dela', async () => {
    const { disparar } = simularTeclado();
    const { result } = await abrir({ bottom: 24 });
    await disparar('keyboardDidShow', 312);
    expect(result.current).toBe(336);
    await disparar('keyboardDidHide', 0);
    expect(result.current).toBe(0);
  });

  it('sem barra de navegação (0) a altura é a que o sistema informa', async () => {
    const { disparar } = simularTeclado();
    const { result } = await abrir({ bottom: 0 });
    await disparar('keyboardDidShow', 312);
    expect(result.current).toBe(312);
  });

  it('com o teclado fechado não sobra a barra de navegação: continua 0', async () => {
    simularTeclado();
    const { result } = await abrir({ bottom: 24 });
    expect(result.current).toBe(0);
  });
});
