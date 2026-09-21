import '@testing-library/react-native/matchers';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { colors, fontWeight, radius, size } from '../../design/tokens';
import { Chip } from '../Chip';

const chip = () => screen.getByRole('button');

describe('Chip', () => {
  it('selecionado: fundo escuro, rótulo branco em semibold e estado selecionado para o leitor de tela', async () => {
    await render(<Chip label="Toda semana" selected onPress={jest.fn()} />);
    expect(chip()).toHaveStyle({ backgroundColor: colors.control.chipOn, borderRadius: radius.pill, minHeight: size.chip });
    expect(screen.getByText('Toda semana')).toHaveStyle({ color: colors.text.onDark, fontWeight: fontWeight.semibold });
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
