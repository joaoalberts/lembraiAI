import '@testing-library/react-native/matchers';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import { anelDeFoco } from '../../design/foco';
import { borderWidth, colors, fontFamily, opacity, radius, shadow, size } from '../../design/tokens';
import { FormCard } from '../FormCard';
import { FormInput } from '../FormInput';
import { OptionCard, estiloDoCartaoDeModo } from '../OptionCard';
import { SelectField, estiloDoSeletor } from '../SelectField';
import { Slider, valorNaPosicao } from '../Slider';

const estilo = (el: { props: { style?: unknown } }) => StyleSheet.flatten(el.props.style as never) as Record<string, unknown>;

describe('FormCard', () => {
  it('cartão de cantos arredondados com o anel branco por dentro e o recuo do padrão', async () => {
    await render(<FormCard><Text>x</Text></FormCard>);
    expect(screen.getByText('x').parent).toHaveStyle({ backgroundColor: colors.bg.card, borderRadius: radius.form, boxShadow: shadow.formCard, padding: size.form.cardPadding });
  });
});

describe('FormInput', () => {
  it('campo branco de altura do padrão, com o texto de exemplo na cor de placeholder', async () => {
    await render(<FormInput value="" onChangeText={jest.fn()} placeholder="Ex.: Comprar água" accessibilityLabel="Descrição" />);
    const campo = screen.getByLabelText('Descrição');
    expect(campo).toHaveStyle({ height: size.form.field, borderRadius: radius.field, backgroundColor: colors.bg.field, boxShadow: shadow.field });
    expect(campo).toHaveProp('placeholderTextColor', colors.text.placeholder);
    expect(campo).toHaveProp('placeholder', 'Ex.: Comprar água');
  });

  it('em foco o anel vira verde com halo, e ao sair volta; os eventos de quem usa também chegam', async () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    await render(<FormInput value="" onChangeText={jest.fn()} accessibilityLabel="Descrição" onFocus={onFocus} onBlur={onBlur} />);
    await fireEvent(screen.getByLabelText('Descrição'), 'focus');
    expect(screen.getByLabelText('Descrição')).toHaveStyle({ boxShadow: shadow.fieldFocus });
    expect(onFocus).toHaveBeenCalledTimes(1);
    await fireEvent(screen.getByLabelText('Descrição'), 'blur');
    expect(screen.getByLabelText('Descrição')).toHaveStyle({ boxShadow: shadow.field });
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('avisa cada letra digitada e respeita o limite de caracteres', async () => {
    const onChangeText = jest.fn();
    await render(<FormInput value="" onChangeText={onChangeText} maxLength={80} accessibilityLabel="Descrição" />);
    await fireEvent.changeText(screen.getByLabelText('Descrição'), 'Comprar pão');
    expect(onChangeText).toHaveBeenCalledWith('Comprar pão');
    expect(screen.getByLabelText('Descrição')).toHaveProp('maxLength', 80);
  });
});

describe('OptionCard', () => {
  const cartao = (selecionado: boolean, onPress = jest.fn()) => (
    <OptionCard icon="calendar-days" title="Por data e horário" description="Lembre em um dia e hora." selected={selecionado} onPress={onPress} />
  );

  it('mostra o título e a descrição, e é uma opção para o leitor de tela', async () => {
    await render(cartao(true));
    expect(screen.getByText('Por data e horário')).toBeTruthy();
    expect(screen.getByText('Lembre em um dia e hora.')).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'Por data e horário' })).toBeChecked();
  });

  it('escolhido: fundo branco, anel verde por dentro e o selo de visto; o anel vazio some', async () => {
    await render(cartao(true));
    expect(screen.getByRole('radio', { name: 'Por data e horário' })).toHaveStyle({ backgroundColor: colors.bg.field, boxShadow: shadow.optionOn });
    expect(screen.getByTestId('opcao-selo')).toHaveStyle({ backgroundColor: colors.control.badge, width: size.form.optionBadge });
    expect(screen.getByTestId('icone-check', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.queryByTestId('opcao-anel')).toBeNull();
  });

  it('não escolhido: fundo de cartão e um anel vazio de opção; sem selo', async () => {
    await render(cartao(false));
    expect(screen.getByRole('radio', { name: 'Por data e horário' })).toHaveStyle({ backgroundColor: colors.bg.card, boxShadow: shadow.formCard });
    expect(screen.getByRole('radio', { name: 'Por data e horário' })).not.toBeChecked();
    expect(screen.getByTestId('opcao-anel')).toHaveStyle({ borderColor: colors.border.strong, borderWidth: borderWidth.hairline, width: size.form.optionRadio });
    expect(screen.queryByTestId('opcao-selo')).toBeNull();
  });

  it('o toque chama onPress; o ícone fica num círculo menta escondido do leitor de tela', async () => {
    const onPress = jest.fn();
    await render(cartao(false, onPress));
    await fireEvent.press(screen.getByRole('radio', { name: 'Por data e horário' }));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('icone-calendar-days', { includeHiddenElements: true }).parent).toHaveStyle({ backgroundColor: colors.bg.iconCircle, width: size.form.optionCircle });
  });

  it('estados: ponteiro em cima clareia o não escolhido; pressionado encolhe; foco põe o anel', () => {
    const plano = (sel: boolean, e: Parameters<typeof estiloDoCartaoDeModo>[1]) => StyleSheet.flatten(estiloDoCartaoDeModo(sel, e)) as Record<string, unknown>;
    expect(plano(false, { pressed: false, hovered: true })).toMatchObject({ backgroundColor: colors.bg.field });
    expect(plano(false, { pressed: false })).toMatchObject({ backgroundColor: colors.bg.card });
    expect(plano(true, { pressed: true })).toMatchObject({ transform: [{ scale: 0.98 }] });
    expect(plano(false, { pressed: false, focused: true })).toMatchObject(anelDeFoco);
  });
});

describe('SelectField', () => {
  it('uma linha: ícone, valor e seta para baixo; o toque chama onPress', async () => {
    const onPress = jest.fn();
    await render(<SelectField icon="calendar-days" value="Seg, 21 de set de 2026" accessibilityLabel="Data do lembrete" onPress={onPress} />);
    expect(screen.getByText('Seg, 21 de set de 2026')).toBeTruthy();
    expect(screen.getByTestId('icone-calendar-days', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByTestId('icone-chevron-down', { includeHiddenElements: true })).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Data do lembrete' }));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Data do lembrete' })).toHaveStyle({ height: size.form.field, borderRadius: radius.field, boxShadow: shadow.field });
  });

  it('duas linhas: rótulo e valor, seta para o lado, e o valor em destaque quando pedido', async () => {
    const { rerender } = await render(<SelectField leading="refresh-cw" label="Repetir" value="Nunca" chevron="right" accessibilityLabel="Repetir" onPress={jest.fn()} />);
    expect(screen.getByText('Repetir')).toBeTruthy();
    expect(estilo(screen.getByText('Nunca'))).toMatchObject({ color: colors.text.secondary });
    expect(screen.getByTestId('icone-chevron-right', { includeHiddenElements: true })).toBeTruthy();
    await rerender(<SelectField leading="refresh-cw" label="Repetir" value="Todos os dias" highlight chevron="right" accessibilityLabel="Repetir" onPress={jest.fn()} />);
    expect(estilo(screen.getByText('Todos os dias'))).toMatchObject({ color: colors.text.accent, fontFamily: fontFamily.bold });
  });

  it('desabilitado: esmaecido, não responde e avisa o leitor de tela', async () => {
    const onPress = jest.fn();
    await render(<SelectField icon="clock" value="09:00" disabled accessibilityLabel="Horário do lembrete: 09:00" onPress={onPress} />);
    const campo = screen.getByRole('button', { name: 'Horário do lembrete: 09:00' });
    await fireEvent.press(campo);
    expect(onPress).not.toHaveBeenCalled();
    expect(campo).toHaveStyle({ opacity: opacity.disabled });
    expect(campo).toBeDisabled();
  });

  it('estados: ponteiro em cima escurece o anel (menos desabilitado); foco põe o anel', () => {
    const plano = (e: Parameters<typeof estiloDoSeletor>[0], desab = false) => StyleSheet.flatten(estiloDoSeletor(e, desab, false)) as Record<string, unknown>;
    expect(plano({ pressed: false, hovered: true })).toMatchObject({ boxShadow: shadow.fieldHover });
    expect(plano({ pressed: false, hovered: true }, true)).toMatchObject({ boxShadow: shadow.field });
    expect(plano({ pressed: false, focused: true })).toMatchObject(anelDeFoco);
  });
});

describe('valorNaPosicao', () => {
  it('cai no passo mais próximo e respeita os limites', () => {
    expect(valorNaPosicao(0, 300, 50, 550, 10)).toBe(50);
    expect(valorNaPosicao(300, 300, 50, 550, 10)).toBe(550);
    expect(valorNaPosicao(150, 300, 50, 550, 10)).toBe(300);
    expect(valorNaPosicao(-40, 300, 50, 550, 10)).toBe(50);
    expect(valorNaPosicao(900, 300, 50, 550, 10)).toBe(550);
    expect(valorNaPosicao(61, 300, 50, 550, 10)).toBe(150); // 61/300 x 500 = 101,7 = 10,17 passos de 10: arredonda para 10 (50 + 100)
    expect(valorNaPosicao(160, 300, 50, 550, 10)).toBe(320); // 26,67 passos: arredonda para cima (27), não para baixo
  });

  it('sem largura medida devolve o mínimo (nada de divisão por zero)', () => {
    expect(valorNaPosicao(10, 0, 50, 550, 10)).toBe(50);
  });
});

describe('Slider', () => {
  const abrir = async (value: number, onChange = jest.fn()) => {
    await render(<Slider value={value} onChange={onChange} min={50} max={550} step={10} label="Raio de notificação em metros" valueText={`${value} metros`} />);
    await fireEvent(screen.getByTestId('slider'), 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: 300, height: size.form.sliderHeight } } });
    return onChange;
  };

  it('preenchimento e bolinha acompanham o valor (150 de 50 a 550 = 20%)', async () => {
    await abrir(150);
    expect(estilo(screen.getByTestId('slider-preenchimento'))).toMatchObject({ width: '20%', backgroundColor: colors.control.on });
    expect(estilo(screen.getByTestId('slider-bolinha'))).toMatchObject({ left: 300 * 0.2 - size.form.sliderThumb / 2, width: size.form.sliderThumb, backgroundColor: colors.control.sliderThumb, boxShadow: shadow.slider });
  });

  it('nas pontas a bolinha sai meio raio para fora, como no original', async () => {
    await abrir(50);
    expect(estilo(screen.getByTestId('slider-bolinha')).left).toBe(-size.form.sliderThumb / 2);
  });

  it('é um controle ajustável para o leitor de tela, com o valor, os limites e o texto', async () => {
    await abrir(150);
    const s = screen.getByTestId('slider');
    expect(s).toHaveProp('accessibilityRole', 'adjustable');
    expect(s).toHaveProp('accessibilityLabel', 'Raio de notificação em metros');
    expect(s).toHaveProp('accessibilityValue', { min: 50, max: 550, now: 150, text: '150 metros' });
  });

  it('os gestos de aumentar e diminuir do leitor de tela mexem um passo e param nos limites', async () => {
    const onChange = await abrir(150);
    await fireEvent(screen.getByTestId('slider'), 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });
    expect(onChange).toHaveBeenLastCalledWith(160);
    await fireEvent(screen.getByTestId('slider'), 'accessibilityAction', { nativeEvent: { actionName: 'decrement' } });
    expect(onChange).toHaveBeenLastCalledWith(140);
  });

  /** Evento de toque no formato do sistema de gestos do React Native (o PanResponder lê o histórico de toques). */
  const toque = (locationX: number, pageX: number, momento: number, anteriorX = pageX) => ({
    nativeEvent: { locationX, pageX },
    touchHistory: {
      numberActiveTouches: 1,
      indexOfSingleActiveTouch: 0,
      mostRecentTimeStamp: momento,
      touchBank: [{ touchActive: true, startPageX: 0, startPageY: 0, startTimeStamp: 1, currentPageX: pageX, currentPageY: 0, currentTimeStamp: momento, previousPageX: anteriorX, previousPageY: 0, previousTimeStamp: momento - 1 }],
    },
  });

  it('tocar na trilha leva o valor até ali (150 da largura de 300 = 300 m) e arrastar continua de onde parou', async () => {
    const onChange = await abrir(150);
    const s = screen.getByTestId('slider');
    await fireEvent(s, 'responderGrant', toque(150, 150, 1));
    expect(onChange).toHaveBeenLastCalledWith(300);
    await fireEvent(s, 'responderMove', toque(150, 210, 2, 150)); // arrastou 60 para a direita: 150 + 60 = 210
    expect(onChange).toHaveBeenLastCalledWith(valorNaPosicao(210, 300, 50, 550, 10));
    await fireEvent(s, 'responderMove', toque(150, 0, 3, 210)); // e voltou além da ponta esquerda
    expect(onChange).toHaveBeenLastCalledWith(50);
  });

  it('no limite o gesto não passa do máximo nem do mínimo', async () => {
    const noMaximo = await abrir(550);
    await fireEvent(screen.getByTestId('slider'), 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });
    expect(noMaximo).toHaveBeenLastCalledWith(550);
  });
});
