import '@testing-library/react-native/matchers';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo, Platform } from 'react-native';
import { colors, motion, opacity, radius, shadow, size } from '../../design/tokens';
import { Toggle, medidasDoToggle } from '../Toggle';

import { alvoDeToque } from '../../test-utils/toque';
afterEach(() => jest.restoreAllMocks());

const trilhoLigado = () => screen.getByTestId('toggle-ligado');
const bolinha = () => screen.getByTestId('toggle-bolinha');

describe('Toggle: geometria', () => {
  it('no cartão: trilho de 35 por 21, bolinha de 18 com folga de 1,5, que anda 14', () => {
    expect(medidasDoToggle('card')).toEqual({ width: size.toggle.card.width, height: size.toggle.card.height, thumb: size.toggle.card.thumb, inset: 1.5, viagem: 14 });
    expect(size.toggle.card.width).toBe(35);
    expect(size.toggle.card.height).toBe(21);
  });

  it('nos formulários: trilho de 43 por 26, bolinha de 22 com folga de 2, que anda 17', () => {
    expect(medidasDoToggle('form')).toMatchObject({ width: 43, height: 26, thumb: 22, inset: 2, viagem: 17 });
  });

  it('a bolinha sempre cabe no trilho com a mesma folga dos dois lados', () => {
    for (const v of ['card', 'form'] as const) {
      const m = medidasDoToggle(v);
      expect(m.inset + m.thumb + m.inset).toBe(m.height);
      expect(m.inset + m.viagem + m.thumb + m.inset).toBe(m.width);
    }
  });
});

describe('Toggle', () => {
  it('desligado: trilho cinza e bolinha à esquerda; ligado: trilho verde do cartão e bolinha à direita', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    const { rerender } = await render(<Toggle value={false} onValueChange={jest.fn()} accessibilityLabel="Ativar" />);
    expect(screen.getByLabelText('Ativar')).toHaveStyle({ backgroundColor: colors.control.off, borderRadius: radius.pill, width: size.toggle.card.width, height: size.toggle.card.height });
    expect(trilhoLigado()).toHaveStyle({ opacity: 0, backgroundColor: colors.control.onCard });
    expect(bolinha()).toHaveStyle({ backgroundColor: colors.control.thumb, boxShadow: shadow.float, left: 1.5, transform: [{ translateX: 0 }] });

    await rerender(<Toggle value onValueChange={jest.fn()} accessibilityLabel="Ativar" />);
    expect(trilhoLigado()).toHaveStyle({ opacity: 1 });
    expect(bolinha()).toHaveStyle({ transform: [{ translateX: 14 }] });
  });

  it('a variante do formulário liga em verde-floresta e é maior', async () => {
    await render(<Toggle value variant="form" onValueChange={jest.fn()} accessibilityLabel="Monitorar" />);
    expect(trilhoLigado()).toHaveStyle({ backgroundColor: colors.control.onForm });
    expect(screen.getByLabelText('Monitorar')).toHaveStyle({ width: size.toggle.form.width, height: size.toggle.form.height });
  });

  it('o toque pede o valor contrário (desligado vira ligado e ligado vira desligado)', async () => {
    const onValueChange = jest.fn();
    const { rerender } = await render(<Toggle value={false} onValueChange={onValueChange} accessibilityLabel="Manter conectado" />);
    await fireEvent.press(screen.getByLabelText('Manter conectado'));
    expect(onValueChange).toHaveBeenLastCalledWith(true);
    await rerender(<Toggle value onValueChange={onValueChange} accessibilityLabel="Manter conectado" />);
    await fireEvent.press(screen.getByLabelText('Manter conectado'));
    expect(onValueChange).toHaveBeenLastCalledWith(false);
  });

  it('desabilitado, não reage ao toque, informa o estado e fica esmaecido', async () => {
    const onValueChange = jest.fn();
    await render(<Toggle value onValueChange={onValueChange} disabled accessibilityLabel="Manter conectado" />);
    const chave = screen.getByLabelText('Manter conectado');
    await fireEvent.press(chave);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(chave).toHaveProp('accessibilityState', { checked: true, disabled: true });
    expect(chave).toHaveStyle({ opacity: opacity.disabled });
  });

  it('é um interruptor para o leitor de tela, com o estado ligado ou desligado', async () => {
    await render(<Toggle value onValueChange={jest.fn()} accessibilityLabel="Monitorar lugares" />);
    expect(screen.getByRole('switch', { name: 'Monitorar lugares' })).toBeChecked();
  });

  it('o toque chega a 44 por 44 com a folga (o trilho tem só 21 de altura)', async () => {
    await render(<Toggle value onValueChange={jest.fn()} accessibilityLabel="Ativar" />);
    const alvo = await alvoDeToque(screen.getByLabelText('Ativar'), size.toggle.card.width, size.toggle.card.height);
    expect(alvo.altura).toBeGreaterThanOrEqual(size.touch);
    expect(alvo.largura).toBeGreaterThanOrEqual(size.touch);
  });
});

describe('Toggle: movimento', () => {
  it('a bolinha corre em 180 ms (o relógio falso mostra o meio e o fim)', async () => {
    jest.useFakeTimers();
    jest.replaceProperty(Platform, 'OS', 'web'); // o driver nativo do Animated não roda no Jest
    try {
      jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
      const { rerender } = await render(<Toggle value={false} onValueChange={jest.fn()} accessibilityLabel="Ativar" />);
      await act(async () => { jest.advanceTimersByTime(10); });
      await rerender(<Toggle value onValueChange={jest.fn()} accessibilityLabel="Ativar" />);
      await act(async () => { jest.advanceTimersByTime(motion.duration.toggle / 2); });
      const meio = JSON.stringify(bolinha().props.style);
      expect(meio).not.toContain('"translateX":0');
      expect(meio).not.toContain('"translateX":14');
      await act(async () => { jest.advanceTimersByTime(motion.duration.toggle); });
      expect(bolinha()).toHaveStyle({ transform: [{ translateX: 14 }] });
      expect(trilhoLigado()).toHaveStyle({ opacity: 1 });
    } finally {
      jest.useRealTimers();
    }
  });

  it('com "reduzir movimento" a troca é imediata', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    const { rerender } = await render(<Toggle value={false} onValueChange={jest.fn()} accessibilityLabel="Ativar" />);
    await rerender(<Toggle value onValueChange={jest.fn()} accessibilityLabel="Ativar" />);
    expect(bolinha()).toHaveStyle({ transform: [{ translateX: 14 }] });
  });
});
