import '@testing-library/react-native/matchers';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { anelDeFoco } from '../../design/foco';
import { colors, fontWeight, opacity, radius, size } from '../../design/tokens';
import { SegmentedControl, estiloDoSegmento } from '../SegmentedControl';

const opcoes = [{ key: 'time', label: 'Por horário' }, { key: 'local', label: 'Por local' }] as const;

describe('SegmentedControl', () => {
  it('mostra as opções e marca só a selecionada para o leitor de tela', async () => {
    await render(<SegmentedControl options={opcoes} value="time" onChange={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Por horário' })).toBeSelected();
    expect(screen.getByRole('button', { name: 'Por local' })).not.toBeSelected();
  });

  it('chama onChange com a chave da opção tocada', async () => {
    const onChange = jest.fn();
    await render(<SegmentedControl options={opcoes} value="time" onChange={onChange} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Por local' }));
    expect(onChange).toHaveBeenCalledWith('local');
  });

  it('desabilitado, não chama onChange e avisa o estado', async () => {
    const onChange = jest.fn();
    await render(<SegmentedControl options={opcoes} value="time" onChange={onChange} disabled />);
    await fireEvent.press(screen.getByRole('button', { name: 'Por local' }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Por local' })).toBeDisabled();
  });

  it('trilho na cor do controle e opção selecionada em branco, com rótulo em negrito', async () => {
    await render(<SegmentedControl options={opcoes} value="time" onChange={jest.fn()} />);
    expect(screen.getByTestId('segmented')).toHaveStyle({ backgroundColor: colors.control.segmentTrack, borderRadius: radius.md });
    expect(screen.getByRole('button', { name: 'Por horário' })).toHaveStyle({ backgroundColor: colors.control.segmentThumb });
    expect(screen.getByText('Por horário')).toHaveStyle({ color: colors.text.primary, fontWeight: fontWeight.bold });
    expect(screen.getByText('Por local')).toHaveStyle({ color: colors.text.secondary, fontWeight: fontWeight.medium });
  });

  it('cada opção tem pelo menos 44 de altura, com o padding do trilho', async () => {
    await render(<SegmentedControl options={opcoes} value="time" onChange={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Por horário' })).toHaveStyle({ minHeight: size.touch - 2 * 4 });
  });
});

describe('estiloDoSegmento (estados)', () => {
  const plano = (selecionado: boolean, estado: Parameters<typeof estiloDoSegmento>[1]) => StyleSheet.flatten(estiloDoSegmento(selecionado, estado));

  it('pressionado: opacidade de toque', () => {
    expect(plano(false, { pressed: true })).toMatchObject({ opacity: opacity.pressed });
  });

  it('foco de teclado (web): o mesmo anel de foco de todos os controles', () => {
    expect(plano(false, { pressed: false, focused: true })).toMatchObject(anelDeFoco);
    expect(plano(false, { pressed: false })).not.toHaveProperty('outlineWidth');
  });
});
