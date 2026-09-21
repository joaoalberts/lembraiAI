import '@testing-library/react-native/matchers';
import { render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import type { Category } from '../../data/reminders';
import { colors, fontFamily, fontSize, radius, size } from '../../design/tokens';
import { RadiusIcon } from '../RadiusIcon';
import { Tag } from '../Tag';
import { TipCard } from '../TipCard';

describe('Tag', () => {
  it('o texto da etiqueta tem o tamanho do original (`.tag`, 16,8 du = 8,5 dp, no piso de 9)', async () => {
    await render(<Tag kind="time" category="green" />);
    expect(screen.getByText('Por horário')).toHaveStyle({ fontSize: fontSize.pico });
  });

  it('"Por horário" e "Por local", cada um com o texto certo', async () => {
    const { rerender } = await render(<Tag kind="time" category="green" />);
    expect(screen.getByText('Por horário')).toBeTruthy();
    await rerender(<Tag kind="local" category="green" />);
    expect(screen.getByText('Por local')).toBeTruthy();
    expect(screen.queryByText('Por horário')).toBeNull();
  });

  it.each(['green', 'orange', 'blue', 'purple', 'pink'] as Category[])('categoria %s: fundo da etiqueta, texto escurecido e ícone na cor da categoria', async (categoria) => {
    await render(<Tag kind="time" category={categoria} />);
    const cor = colors.category[categoria];
    expect(screen.getByTestId('tag')).toHaveStyle({ backgroundColor: cor.tag });
    expect(screen.getByText('Por horário')).toHaveStyle({ color: cor.tagInk });
    expect(JSON.stringify(screen.getByTestId('icone-map-pin', { includeHiddenElements: true }).children)).toContain(cor.fg);
  });

  it('pílula baixa, do tamanho do conteúdo, com texto em negrito', async () => {
    await render(<Tag kind="time" category="green" />);
    expect(screen.getByTestId('tag')).toHaveStyle({ borderRadius: radius.pill, minHeight: size.tag.height, alignSelf: 'flex-start' });
    expect(StyleSheet.flatten(screen.getByText('Por horário').props.style)).toMatchObject({ fontFamily: fontFamily.bold, fontSize: fontSize.pico });
  });
});

describe('TipCard', () => {
  it('mostra o título e o texto', async () => {
    await render(<TipCard title="Dica para você" text="Ative lembretes por local para nunca mais esquecer." />);
    expect(screen.getByText('Dica para você')).toHaveStyle({ fontFamily: fontFamily.bold, color: colors.text.primary });
    expect(screen.getByText('Ative lembretes por local para nunca mais esquecer.')).toHaveStyle({ color: colors.text.tip });
  });

  it('cartão verde-menta de cantos redondos com a lâmpada num círculo e a seta à direita', async () => {
    await render(<TipCard title="t" text="x" />);
    expect(screen.getByTestId('dica')).toHaveStyle({ backgroundColor: colors.feedback.infoBg, borderRadius: size.tip.radius });
    expect(screen.getByTestId('icone-lightbulb', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByTestId('icone-chevron-right', { includeHiddenElements: true })).toBeTruthy();
  });

  it('na lista é só informação: não é um botão', async () => {
    await render(<TipCard title="t" text="x" />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('RadiusIcon', () => {
  it('desenha o pino e os dois anéis pontilhados na cor do raio, no tamanho do ícone do cartão', async () => {
    await render(<RadiusIcon />);
    const desenho = JSON.stringify(screen.toJSON());
    expect(desenho).toContain(colors.icon.radius);
    expect(desenho).toContain(`"width":${size.card.metaIcon}`);
    // o pino do centro e os dois anéis (raios 6 e 10)
    expect(desenho.match(/RNSVGCircle/g)).toHaveLength(3);
    expect(desenho).toMatch(/"r":2\.2[,}]/);
    expect(desenho).toMatch(/"r":6[,}]/);
    expect(desenho).toMatch(/"r":10[,}]/);
  });

  it('é decorativo (escondido do leitor de tela)', async () => {
    await render(<RadiusIcon />);
    expect(JSON.stringify(screen.toJSON())).toContain('"accessibilityElementsHidden":true');
  });
});
