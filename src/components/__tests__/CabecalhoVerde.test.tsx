import '@testing-library/react-native/matchers';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import { colors, gradients, iconStroke, radius, size, space } from '../../design/tokens';
import { comAreaSegura } from '../../test-utils/area-segura';
import { AppBrand } from '../AppBrand';
import { GlassButton, estiloDoVidro } from '../GlassButton';
import { GreenHeader, topoDoConteudo } from '../GreenHeader';
import { SearchField } from '../SearchField';

describe('topoDoConteudo', () => {
  it('sem barra de status (web, computador) vale o topo do desenho', () => {
    expect(topoDoConteudo(0)).toBe(size.header.contentTop);
  });

  it('com barra de status baixa (Android comum) ainda vale o topo do desenho', () => {
    expect(topoDoConteudo(24)).toBe(size.header.contentTop);
  });

  it('com entalhe ou ilha dinâmica a marca desce para ficar abaixo da barra, com uma folga', () => {
    expect(topoDoConteudo(59)).toBe(59 + space.sm);
    expect(topoDoConteudo(47)).toBe(47 + space.sm);
  });
});

describe('GreenHeader', () => {
  it('desenha o degradê do cabeçalho e as curvas de nível, e mostra o conteúdo', async () => {
    await render(comAreaSegura(<GreenHeader><Text>conteúdo</Text></GreenHeader>));
    expect(screen.getByText('conteúdo')).toBeTruthy();
    const degrade = StyleSheet.flatten(screen.getByTestId('cabecalho-degrade').props.style) as Record<string, unknown>;
    expect(JSON.stringify(degrade)).toContain('168deg');
    expect(gradients.cabecalhoVerde).toContain('168deg');
  });

  it('tem a altura da arte e o conteúdo começa no topo do desenho', async () => {
    await render(comAreaSegura(<GreenHeader><Text>x</Text></GreenHeader>));
    expect(screen.getByTestId('cabecalho-verde')).toHaveStyle({ minHeight: size.header.height, paddingTop: size.header.contentTop, paddingHorizontal: size.header.side });
  });

  it('num aparelho com ilha dinâmica cresce o quanto o conteúdo desceu', async () => {
    await render(comAreaSegura(<GreenHeader><Text>x</Text></GreenHeader>, { top: 59 }));
    const desceu = 59 + space.sm - size.header.contentTop;
    expect(screen.getByTestId('cabecalho-verde')).toHaveStyle({ minHeight: size.header.height + desceu, paddingTop: 59 + space.sm });
  });
});

describe('AppBrand', () => {
  it('mostra o nome e a frase da marca, e o leitor de tela lê os dois juntos', async () => {
    await render(<AppBrand />);
    expect(screen.getByText('LembreiAi')).toBeTruthy();
    expect(screen.getByText('Sua rotina, mais leve.')).toBeTruthy();
    expect(screen.getByLabelText('LembreiAi. Sua rotina, mais leve.')).toBeTruthy();
  });

  it('o nome vai em cor clara sobre o verde e a frase em cor mais suave', async () => {
    await render(<AppBrand />);
    expect(screen.getByText('LembreiAi')).toHaveStyle({ color: colors.text.onDarkWarm });
    expect(screen.getByText('Sua rotina, mais leve.')).toHaveStyle({ color: colors.text.onDarkFaint });
  });
});

describe('GlassButton', () => {
  it('é um botão com nome e chama onPress', async () => {
    const onPress = jest.fn();
    await render(<GlassButton icon="search" label="Buscar" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Buscar' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('círculo de vidro com contorno claro e área de toque de 44', async () => {
    await render(<GlassButton icon="user-round" label="Minha conta" onPress={jest.fn()} />);
    const botao = screen.getByRole('button', { name: 'Minha conta' });
    expect(botao).toHaveStyle({ width: size.glassButton, height: size.glassButton, borderRadius: radius.pill, borderColor: colors.glass.border, backgroundColor: colors.glass.fill });
    expect(size.glassButton + 2 * (botao.props.hitSlop as number)).toBeGreaterThanOrEqual(size.touch);
  });

  it('a versão "fechar" da tela de sucesso é menor e desenha o X com traço mais grosso, com a área de toque completada a 44', async () => {
    await render(<GlassButton icon="x" label="Fechar" tamanho="fechar" onPress={jest.fn()} />);
    const botao = screen.getByRole('button', { name: 'Fechar' });
    expect(botao).toHaveStyle({ width: size.sucesso.fechar, height: size.sucesso.fechar, borderRadius: radius.pill, borderColor: colors.glass.border });
    expect(size.sucesso.fechar + 2 * (botao.props.hitSlop as number)).toBeGreaterThanOrEqual(size.touch);
    const desenho = JSON.stringify(screen.getByTestId('icone-x', { includeHiddenElements: true }).children);
    expect(desenho).toContain(`"width":${size.sucesso.fecharIcon}`);
    expect(desenho).toContain(`"strokeWidth":${iconStroke.action}`);
  });

  it('estados: ponteiro em cima e pressionado clareiam o véu; foco de teclado põe o anel menta', () => {
    const plano = (e: Parameters<typeof estiloDoVidro>[0]) => StyleSheet.flatten(estiloDoVidro(e)) as Record<string, unknown>;
    expect(plano({ pressed: false })).toMatchObject({ backgroundColor: colors.glass.fill });
    expect(plano({ pressed: false, hovered: true })).toMatchObject({ backgroundColor: colors.glass.fillHover });
    expect(plano({ pressed: true, hovered: true })).toMatchObject({ backgroundColor: colors.glass.fillPressed });
    expect(plano({ pressed: false, focused: true })).toMatchObject({ outlineColor: colors.border.focusOnDark });
    expect(plano({ pressed: false })).not.toHaveProperty('outlineColor');
  });
});

describe('SearchField', () => {
  it('mostra o texto e avisa cada letra digitada', async () => {
    const onChangeText = jest.fn();
    await render(<SearchField value="merc" onChangeText={onChangeText} onClose={jest.fn()} />);
    const campo = screen.getByLabelText('Buscar lembretes');
    expect(campo).toHaveProp('value', 'merc');
    await fireEvent.changeText(campo, 'mercado');
    expect(onChangeText).toHaveBeenCalledWith('mercado');
  });

  it('abre já com o teclado, com a tecla "buscar" e o exemplo de texto', async () => {
    await render(<SearchField value="" onChangeText={jest.fn()} onClose={jest.fn()} />);
    const campo = screen.getByLabelText('Buscar lembretes');
    expect(campo).toHaveProp('autoFocus', true);
    expect(campo).toHaveProp('returnKeyType', 'search');
    expect(campo).toHaveProp('placeholder', 'Buscar lembretes');
  });

  it('a tecla Esc (web) fecha a busca e as outras teclas não', async () => {
    const onClose = jest.fn();
    await render(<SearchField value="" onChangeText={jest.fn()} onClose={onClose} />);
    const campo = screen.getByLabelText('Buscar lembretes');
    await fireEvent(campo, 'keyPress', { nativeEvent: { key: 'a' } });
    expect(onClose).not.toHaveBeenCalled();
    await fireEvent(campo, 'keyPress', { nativeEvent: { key: 'Escape' } });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('em foco a borda e o fundo mudam (menta e mais claro)', async () => {
    await render(<SearchField value="" onChangeText={jest.fn()} onClose={jest.fn()} />);
    expect(screen.getByTestId('campo-de-busca')).toHaveStyle({ borderColor: colors.glass.border, backgroundColor: colors.glass.field });
    await fireEvent(screen.getByLabelText('Buscar lembretes'), 'focus');
    expect(screen.getByTestId('campo-de-busca')).toHaveStyle({ borderColor: colors.border.focusOnDark, backgroundColor: colors.glass.fieldFocus });
    await fireEvent(screen.getByLabelText('Buscar lembretes'), 'blur');
    expect(screen.getByTestId('campo-de-busca')).toHaveStyle({ borderColor: colors.glass.border });
  });
});
