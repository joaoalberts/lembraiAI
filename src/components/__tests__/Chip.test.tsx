import '@testing-library/react-native/matchers';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { anelDeFoco } from '../../design/foco';
import { colors, fontFamily, opacity, radius, size } from '../../design/tokens';
import { Chip, estiloDoChip } from '../Chip';

const chip = () => screen.getByRole('button');

describe('Chip', () => {
  it('selecionado: fundo escuro, rótulo branco em semibold e estado selecionado para o leitor de tela', async () => {
    await render(<Chip label="Toda semana" selected onPress={jest.fn()} />);
    expect(chip()).toHaveStyle({ backgroundColor: colors.control.chipOn, borderRadius: radius.pill, minHeight: size.chip });
    expect(screen.getByText('Toda semana')).toHaveStyle({ color: colors.text.onDark, fontFamily: fontFamily.semibold });
    expect(chip()).toBeSelected();
  });

  it('não selecionado: fundo claro com contorno e rótulo em tinta principal', async () => {
    await render(<Chip label="Nunca" selected={false} onPress={jest.fn()} />);
    expect(chip()).toHaveStyle({ backgroundColor: colors.control.chipOff, borderColor: colors.border.chip });
    expect(screen.getByText('Nunca')).toHaveStyle({ color: colors.text.primary });
    expect(chip()).not.toBeSelected();
  });

  it('chama onPress e, desabilitado, não chama', async () => {
    const onPress = jest.fn();
    const { rerender } = await render(<Chip label="150 m" selected={false} onPress={onPress} />);
    await fireEvent.press(chip());
    expect(onPress).toHaveBeenCalledTimes(1);
    await rerender(<Chip label="150 m" selected={false} onPress={onPress} disabled />);
    await fireEvent.press(chip());
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('a área de toque chega a 44 (o chip visível tem 36 e a folga completa o resto)', async () => {
    await render(<Chip label="Nunca" selected={false} onPress={jest.fn()} />);
    expect(chip()).toHaveProp('hitSlop', size.hitSlop);
    expect(size.chip + 2 * size.hitSlop).toBeGreaterThanOrEqual(size.touch);
  });
});

describe('estiloDoChip (estados)', () => {
  const plano = (selecionado: boolean, estado: Parameters<typeof estiloDoChip>[1], desabilitado = false) => StyleSheet.flatten(estiloDoChip(selecionado, estado, desabilitado));

  it('pressionado e desabilitado usam as opacidades do Design System', () => {
    expect(plano(false, { pressed: true })).toMatchObject({ opacity: opacity.pressed });
    expect(plano(false, { pressed: false }, true)).toMatchObject({ opacity: opacity.disabled });
  });

  it('foco de teclado (web): o anel de foco de todos os controles, em selecionado ou não', () => {
    expect(plano(false, { pressed: false, focused: true })).toMatchObject(anelDeFoco);
    expect(plano(true, { pressed: false, focused: true })).toMatchObject(anelDeFoco);
    expect(plano(false, { pressed: false })).not.toHaveProperty('outlineWidth');
  });
});
