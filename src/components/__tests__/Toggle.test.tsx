import '@testing-library/react-native/matchers';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { colors } from '../../design/tokens';
import { Toggle } from '../Toggle';

describe('Toggle', () => {
  it('usa as cores do Design System: trilho ligado verde, desligado cinza e bolinha branca', async () => {
    await render(<Toggle value onValueChange={jest.fn()} accessibilityLabel="Monitorar lugares" />);
    // no iOS o React Native traduz trackColor.true, thumbColor e trackColor.false para estas três props do componente nativo
    expect(screen.getByLabelText('Monitorar lugares')).toHaveProp('onTintColor', colors.control.on);
    expect(screen.getByLabelText('Monitorar lugares')).toHaveProp('thumbTintColor', colors.control.thumb);
    expect(screen.getByLabelText('Monitorar lugares')).toHaveProp('tintColor', colors.control.off);
  });

  it('repassa a troca de valor', async () => {
    const onValueChange = jest.fn();
    await render(<Toggle value={false} onValueChange={onValueChange} accessibilityLabel="Manter conectado" />);
    await fireEvent(screen.getByLabelText('Manter conectado'), 'valueChange', true);
    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  it('desabilitado, informa o estado', async () => {
    await render(<Toggle value onValueChange={jest.fn()} disabled accessibilityLabel="Manter conectado" />);
    expect(screen.getByLabelText('Manter conectado')).toHaveProp('disabled', true);
  });
});
