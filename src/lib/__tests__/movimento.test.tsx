import { renderHook, waitFor, act } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import { useMovimentoReduzido } from '../movimento';

afterEach(() => jest.restoreAllMocks());

describe('useMovimentoReduzido', () => {
  it('fica indefinido até o sistema responder e depois entrega a resposta', async () => {
    let responder!: (v: boolean) => void;
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockReturnValue(new Promise((resolve) => { responder = resolve; }));
    const { result } = await renderHook(() => useMovimentoReduzido());
    expect(result.current).toBeUndefined();
    await act(async () => { responder(true); });
    await waitFor(() => expect(result.current).toBe(true));
  });

  it('acompanha a mudança feita nos ajustes com o app aberto', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    let aviso: ((v: boolean) => void) | undefined;
    jest.spyOn(AccessibilityInfo, 'addEventListener').mockImplementation(((evento: string, f: (v: boolean) => void) => {
      if (evento === 'reduceMotionChanged') aviso = f;
      return { remove: jest.fn() };
    }) as unknown as typeof AccessibilityInfo.addEventListener);
    const { result } = await renderHook(() => useMovimentoReduzido());
    await waitFor(() => expect(result.current).toBe(false));
    await act(async () => { aviso?.(true); });
    expect(result.current).toBe(true);
  });

  it('se o sistema não conseguir responder, anima (false) em vez de ficar esperando para sempre', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockRejectedValue(new Error('indisponível'));
    const { result } = await renderHook(() => useMovimentoReduzido());
    await waitFor(() => expect(result.current).toBe(false));
  });

  it('para de ouvir quando a tela sai', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    const remove = jest.fn();
    jest.spyOn(AccessibilityInfo, 'addEventListener').mockReturnValue({ remove } as unknown as ReturnType<typeof AccessibilityInfo.addEventListener>);
    const { unmount } = await renderHook(() => useMovimentoReduzido());
    await unmount();
    expect(remove).toHaveBeenCalledTimes(1);
  });
});
