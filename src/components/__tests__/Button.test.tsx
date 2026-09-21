import '@testing-library/react-native/matchers';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { borderWidth, colors, fontFamily, fontSize, motion, opacity, radius, shadow, size, space } from '../../design/tokens';
import { Button, estiloDoBotao } from '../Button';

const botao = () => screen.getByRole('button');

describe('Button', () => {
  it('mostra o rótulo e chama onPress ao tocar', async () => {
    const onPress = jest.fn();
    await render(<Button label="Entrar" onPress={onPress} />);
    await fireEvent.press(botao());
    expect(screen.getByText('Entrar')).toBeTruthy();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('primário: fundo de ação, pílula, altura mínima do botão, brilho e rótulo branco', async () => {
    await render(<Button label="Entrar" onPress={jest.fn()} />);
    expect(botao()).toHaveStyle({ backgroundColor: colors.action.primary, borderRadius: radius.pill, minHeight: size.button, boxShadow: shadow.cta });
    expect(screen.getByText('Entrar')).toHaveStyle({ color: colors.text.onAction });
  });

  it('secundário: fundo escuro, sem brilho', async () => {
    await render(<Button label="Sair" onPress={jest.fn()} variant="secondary" />);
    expect(botao()).toHaveStyle({ backgroundColor: colors.action.secondary });
    expect(botao()).not.toHaveStyle({ boxShadow: shadow.cta });
    expect(screen.getByText('Sair')).toHaveStyle({ color: colors.text.onDark });
  });

  it('ghost: transparente, contorno forte e rótulo em tinta principal', async () => {
    await render(<Button label="Cancelar" onPress={jest.fn()} variant="ghost" />);
    expect(botao()).toHaveStyle({ backgroundColor: 'transparent', borderColor: colors.border.strong });
    expect(screen.getByText('Cancelar')).toHaveStyle({ color: colors.text.primary });
  });

  it('danger: contorno e rótulo de erro', async () => {
    await render(<Button label="Excluir minha conta" onPress={jest.fn()} variant="danger" />);
    expect(botao()).toHaveStyle({ backgroundColor: 'transparent', borderColor: colors.border.danger });
    expect(screen.getByText('Excluir minha conta')).toHaveStyle({ color: colors.text.danger });
  });

  it('desabilitado: opacidade própria, sem brilho, não chama onPress e avisa o leitor de tela', async () => {
    const onPress = jest.fn();
    await render(<Button label="Entrando…" onPress={onPress} disabled />);
    await fireEvent.press(botao());
    expect(onPress).not.toHaveBeenCalled();
    expect(botao()).toHaveStyle({ opacity: opacity.disabled });
    expect(botao()).not.toHaveStyle({ boxShadow: shadow.cta });
    expect(botao()).toBeDisabled();
  });

  it('compacto: mais baixo, sem brilho e com o rótulo pequeno em negrito', async () => {
    await render(<Button label="Novo lembrete" onPress={jest.fn()} compact />);
    expect(botao()).toHaveStyle({ minHeight: size.buttonCompact, backgroundColor: colors.action.primary });
    expect(botao()).not.toHaveStyle({ boxShadow: shadow.cta });
    expect(screen.getByText('Novo lembrete')).toHaveStyle({ fontFamily: fontFamily.bold, fontSize: fontSize.micro });
  });

  it('com ícone: desenha o ícone à esquerda do rótulo, na mesma cor dele', async () => {
    await render(<Button label="Novo lembrete" onPress={jest.fn()} compact icon="plus" />);
    const desenho = JSON.stringify(screen.getByTestId('icone-plus', { includeHiddenElements: true }).children);
    expect(desenho).toContain(colors.text.onAction);
    expect(desenho).toContain(`"width":${size.icon.xs}`);
  });

  it('sem ícone não sobra espaço nem elemento a mais', async () => {
    await render(<Button label="Entrar" onPress={jest.fn()} />);
    expect(screen.queryByTestId(/^icone-/, { includeHiddenElements: true })).toBeNull();
  });

  it('o estilo de quem usa vem por último (ex.: largura fixa)', async () => {
    await render(<Button label="Criar lembrete" onPress={jest.fn()} style={{ width: 200 }} />);
    expect(botao()).toHaveStyle({ width: 200 });
  });
});

/** Ponteiro em cima e foco só existem na web: o estilo por estado é testado direto, sem simular toque. */
describe('estiloDoBotao (estados)', () => {
  const plano = (v: Parameters<typeof estiloDoBotao>[0], estado: Parameters<typeof estiloDoBotao>[1], desabilitado = false) =>
    StyleSheet.flatten(estiloDoBotao(v, estado, desabilitado));

  it('repouso: cor da variante', () => {
    expect(plano('primary', { pressed: false })).toMatchObject({ backgroundColor: colors.action.primary });
    expect(plano('secondary', { pressed: false })).toMatchObject({ backgroundColor: colors.action.secondary });
  });

  it('ponteiro em cima (web): cor de hover de cada variante', () => {
    expect(plano('primary', { pressed: false, hovered: true })).toMatchObject({ backgroundColor: colors.action.primaryHover });
    expect(plano('secondary', { pressed: false, hovered: true })).toMatchObject({ backgroundColor: colors.action.secondaryHover });
    expect(plano('ghost', { pressed: false, hovered: true })).toMatchObject({ backgroundColor: colors.bg.field });
    expect(plano('danger', { pressed: false, hovered: true })).toMatchObject({ backgroundColor: colors.bg.field });
  });

  it('pressionado: cor de pressionado e escala, e a pressão vence o ponteiro em cima', () => {
    expect(plano('primary', { pressed: true, hovered: true })).toMatchObject({ backgroundColor: colors.action.primaryPressed, transform: [{ scale: motion.pressedScale }] });
    expect(plano('secondary', { pressed: true })).toMatchObject({ backgroundColor: colors.action.secondaryPressed });
    expect(plano('ghost', { pressed: true })).toMatchObject({ backgroundColor: colors.control.chipOff });
  });

  it('foco de teclado (web): anel de foco afastado da borda', () => {
    expect(plano('primary', { pressed: false, focused: true })).toMatchObject({
      outlineWidth: borderWidth.focus, outlineColor: colors.border.focus, outlineStyle: 'solid', outlineOffset: space.hair,
    });
    expect(plano('primary', { pressed: false })).not.toHaveProperty('outlineWidth');
  });

  it('desabilitado: opacidade própria e sem brilho, mesmo no primário', () => {
    const estilo = plano('primary', { pressed: false }, true);
    expect(estilo).toMatchObject({ opacity: opacity.disabled });
    expect(estilo).not.toHaveProperty('boxShadow');
  });
});
