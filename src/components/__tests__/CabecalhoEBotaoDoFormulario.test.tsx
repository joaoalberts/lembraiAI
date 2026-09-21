import '@testing-library/react-native/matchers';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { colors, fontFamily, gradients, opacity, radius, size } from '../../design/tokens';
import { CabecalhoClaro } from '../CabecalhoClaro';
import { CtaButton } from '../CtaButton';

const estilo = (el: { props: { style?: unknown } }) => StyleSheet.flatten(el.props.style as never) as Record<string, unknown>;

describe('CabecalhoClaro', () => {
  it('é a névoa menta em degradê, do tamanho da arte, presa ao topo e sem receber toque', async () => {
    await render(<CabecalhoClaro />);
    const cab = screen.getByTestId('cabecalho-claro');
    expect(estilo(cab)).toMatchObject({ position: 'absolute', top: 0, height: size.form.header, overflow: 'hidden', pointerEvents: 'none' });
    expect(JSON.stringify(cab.props.style)).toContain('180deg');
    expect(gradients.cabecalhoClaro).toContain('180deg');
  });

  it('cresce o quanto o conteúdo desceu por causa da barra de status', async () => {
    await render(<CabecalhoClaro extra={24} />);
    expect(estilo(screen.getByTestId('cabecalho-claro')).height).toBe(size.form.header + 24);
  });

  it('desenha cinco anéis brancos concêntricos, cada um mais fraco que o anterior', async () => {
    await render(<CabecalhoClaro />);
    const json = JSON.stringify(screen.toJSON());
    expect(json.match(/RNSVGCircle/g)).toHaveLength(5);
    const forcas = [...json.matchAll(/"strokeOpacity":([\d.]+)/g)].map((m) => Number(m[1]));
    expect(forcas).toEqual([0.28, 0.22, 0.16, 0.09, 0.03]);
    expect(json.match(/"stroke":\{"type":0,"payload":4294967295\}/g)).toHaveLength(5); // branco opaco; a força vem do strokeOpacity
  });
});

describe('CtaButton', () => {
  it('mostra o rótulo em serifa, a seta num círculo claro e chama onPress', async () => {
    const onPress = jest.fn();
    await render(<CtaButton label="Criar lembrete" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Criar lembrete' }));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(estilo(screen.getByText('Criar lembrete'))).toMatchObject({ fontFamily: fontFamily.serif, color: colors.text.onAction, textAlign: 'center' });
    expect(screen.getByTestId('cta-seta')).toHaveStyle({ width: size.form.ctaCircle, height: size.form.ctaCircle, borderRadius: radius.pill, backgroundColor: colors.glass.ctaCircle });
    expect(screen.getByTestId('icone-arrow-right', { includeHiddenElements: true })).toBeTruthy();
  });

  it('é o botão primário laranja, mais alto, com o brilho', async () => {
    await render(<CtaButton label="Criar lembrete" onPress={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Criar lembrete' })).toHaveStyle({ backgroundColor: colors.action.primary, minHeight: size.form.cta, borderRadius: radius.pill });
  });

  it('desabilitado esmaece, avisa o leitor de tela e não responde', async () => {
    const onPress = jest.fn();
    await render(<CtaButton label="Salvando…" onPress={onPress} disabled />);
    const botao = screen.getByRole('button', { name: 'Salvando…' });
    await fireEvent.press(botao);
    expect(onPress).not.toHaveBeenCalled();
    expect(botao).toBeDisabled();
    expect(botao).toHaveStyle({ opacity: opacity.disabled });
  });
});
