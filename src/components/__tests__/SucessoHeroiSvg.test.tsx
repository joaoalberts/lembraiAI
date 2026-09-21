import { render } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import { SucessoHeroi } from '../SucessoHeroi';

// Registra as props que o visto (um `Path` animado) recebe. O `Animated` acrescenta `collapsable={false}` a todo componente
// animado; na web o `<path>` repassa a prop ao DOM e o React avisa no console ("non-boolean attribute `collapsable`").
const mockRecebidas: Record<string, unknown>[] = [];
jest.mock('react-native-svg', () => {
  const React = jest.requireActual('react');
  const real = jest.requireActual('react-native-svg');
  const Path = React.forwardRef((props: Record<string, unknown>, ref: unknown) => {
    mockRecebidas.push(props);
    return React.createElement(real.Path, { ...props, ref });
  });
  return { __esModule: true, ...real, default: real.default, Path };
});

describe('SucessoHeroi: o visto não passa `collapsable` ao SVG', () => {
  beforeEach(() => {
    mockRecebidas.length = 0;
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
  });

  it('o traço do visto e a sombra dele chegam ao `Path` sem a prop `collapsable`', async () => {
    await render(<SucessoHeroi />);
    expect(mockRecebidas.length).toBeGreaterThanOrEqual(2);
    for (const props of mockRecebidas) expect(props).not.toHaveProperty('collapsable');
  });
});
