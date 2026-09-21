import '@testing-library/react-native/matchers';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import type { Reminder } from '../../data/reminders';
import { anelDeFoco } from '../../design/foco';
import { colors, fontFamily, motion, opacity, radius, shadow, size } from '../../design/tokens';
import { BotaoDeAcao, estiloDaAcao } from '../BotaoDeAcao';
import { CartaoDeResumo } from '../CartaoDeResumo';
import { DicaInteligente, estiloDaDica } from '../DicaInteligente';
import { LinkButton, corDoLink, estiloDoLink } from '../LinkButton';

const ESCONDIDO = { includeHiddenElements: true } as const;
const plano = (estilo: unknown) => StyleSheet.flatten(estilo as never) as Record<string, unknown>;

describe('BotaoDeAcao', () => {
  it('mostra o ícone e o rótulo, é um botão com o nome do rótulo e chama onPress', async () => {
    const onPress = jest.fn();
    await render(<BotaoDeAcao icon="pencil" label="Editar" onPress={onPress} />);
    expect(screen.getByTestId('icone-pencil', ESCONDIDO)).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Editar' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('é um quadrado translúcido que divide a fileira com os outros, com o rótulo em verde escuro sobre ele', async () => {
    await render(<BotaoDeAcao icon="share" label="Compartilhar" onPress={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Compartilhar' })).toHaveStyle({
      flex: 1,
      minHeight: size.sucesso.acao.height,
      borderRadius: size.sucesso.acao.radius,
      backgroundColor: colors.action.frost,
      paddingTop: size.sucesso.acao.top,
      gap: size.sucesso.acao.iconGap,
    });
    expect(screen.getByText('Compartilhar')).toHaveStyle({ color: colors.text.onFrost, fontFamily: fontFamily.medium });
  });

  it('o rótulo é uma região viva: quando a ação troca o texto ("Copiado") o leitor de tela lê', async () => {
    await render(<BotaoDeAcao icon="share" label="Copiado" onPress={jest.fn()} />);
    expect(screen.getByText('Copiado')).toHaveProp('accessibilityLiveRegion', 'polite');
  });

  it('estados: ponteiro em cima e pressionado escurecem o fundo; pressionado encolhe; foco de teclado põe o anel', () => {
    expect(plano(estiloDaAcao({ pressed: false }))).toMatchObject({ backgroundColor: colors.action.frost });
    expect(plano(estiloDaAcao({ pressed: false, hovered: true }))).toMatchObject({ backgroundColor: colors.action.frostHover });
    expect(plano(estiloDaAcao({ pressed: true, hovered: true }))).toMatchObject({ backgroundColor: colors.action.frostPressed, transform: [{ scale: motion.pressedScale }] });
    expect(plano(estiloDaAcao({ pressed: false, focused: true }))).toMatchObject(anelDeFoco);
    expect(plano(estiloDaAcao({ pressed: false }))).not.toHaveProperty('outlineColor');
  });
});

describe('DicaInteligente', () => {
  it('diz a dica e é um botão que chama onPress', async () => {
    const onPress = jest.fn();
    await render(<DicaInteligente onPress={onPress} />);
    expect(screen.getByText('Dica inteligente')).toBeTruthy();
    expect(screen.getByText('Crie lembretes recorrentes para não esquecer das suas tarefas importantes.')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: /Dica inteligente/ }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('não força quebra de linha: em tela estreita o texto quebra sozinho (sem "esquecer" sozinho numa linha) e a largura máxima o fecha onde a imagem mostra', async () => {
    await render(<DicaInteligente onPress={jest.fn()} />);
    const corpo = screen.getByText(/^Crie lembretes recorrentes/);
    expect(String(corpo.props.children)).not.toContain('\n');
    expect(corpo).toHaveStyle({ maxWidth: size.sucesso.dica.textMax });
  });

  it('o leitor de tela lê o título e o texto numa frase só, sem a quebra de linha', async () => {
    await render(<DicaInteligente onPress={jest.fn()} />);
    expect(screen.getByLabelText('Dica inteligente. Crie lembretes recorrentes para não esquecer das suas tarefas importantes.')).toBeTruthy();
  });

  it('é um cartão claro com o anel branco por dentro, a lâmpada num círculo e a seta à direita', async () => {
    await render(<DicaInteligente onPress={jest.fn()} />);
    expect(screen.getByTestId('dica-inteligente')).toHaveStyle({
      minHeight: size.sucesso.dica.height,
      borderRadius: radius.sheet,
      backgroundColor: colors.bg.card,
      boxShadow: shadow.cartaoDoSucesso,
    });
    expect(screen.getByTestId('icone-lightbulb', ESCONDIDO).parent).toHaveStyle({ width: size.sucesso.dica.circle, backgroundColor: colors.sucesso.dica });
    expect(screen.getByTestId('icone-chevron-right', ESCONDIDO)).toBeTruthy();
  });

  it('estados: ponteiro em cima clareia para branco, pressionado encolhe, foco de teclado põe o anel', () => {
    expect(plano(estiloDaDica({ pressed: false }))).toMatchObject({ backgroundColor: colors.bg.card });
    expect(plano(estiloDaDica({ pressed: false, hovered: true }))).toMatchObject({ backgroundColor: colors.bg.field });
    expect(plano(estiloDaDica({ pressed: true }))).toMatchObject({ transform: [{ scale: motion.pressedScale }] });
    expect(plano(estiloDaDica({ pressed: false, focused: true }))).toMatchObject(anelDeFoco);
  });
});

const porHorario: Reminder = { id: 'a', title: 'Comprar água no mercado', category: 'green', icon: 'cart', kind: 'time', dateISO: '2026-09-21', time: '09:00', repeat: 'never', active: true };
const porLocal: Reminder = { ...porHorario, id: 'b', title: 'Academia', icon: 'dumbbell', kind: 'local', place: 'Smart Fit – Iguatemi', lat: -3.77, lng: -38.48, radius: 150, time: '18:30', repeat: 'weekly' };

describe('CartaoDeResumo', () => {
  it('por horário: título, selo Ativo, data escrita, horário e repetição, sem a linha do local', async () => {
    await render(<CartaoDeResumo lembrete={porHorario} />);
    expect(screen.getByText('Comprar água no mercado')).toBeTruthy();
    expect(screen.getByText('Ativo')).toBeTruthy();
    expect(screen.getByText('Data')).toBeTruthy();
    expect(screen.getByText('Seg, 21 de set de 2026')).toBeTruthy();
    expect(screen.getByText('Horário')).toBeTruthy();
    expect(screen.getByText('09:00')).toBeTruthy();
    expect(screen.getByText('Repetir')).toBeTruthy();
    expect(screen.getByText('Nunca')).toBeTruthy();
    expect(screen.queryByText('Local')).toBeNull();
    expect(screen.queryByTestId('resumo-local')).toBeNull();
    expect(screen.queryByTestId('resumo-miniatura')).toBeNull();
  });

  it('por local: acrescenta o endereço, o raio e a miniatura; o horário gravado continua aparecendo', async () => {
    await render(<CartaoDeResumo lembrete={porLocal} />);
    expect(screen.getByText('Local')).toBeTruthy();
    expect(screen.getByText('Smart Fit – Iguatemi')).toBeTruthy();
    expect(screen.getByText('Raio de 150 metros')).toBeTruthy();
    expect(screen.getByTestId('resumo-miniatura')).toBeTruthy();
    expect(screen.getByText('18:30')).toBeTruthy();
    expect(screen.getByText('Toda semana')).toBeTruthy();
  });

  it('o endereço cabe numa linha (com reticências) e o título nunca é cortado', async () => {
    const longo = { ...porLocal, title: 'Levar o carro para revisar e aproveitar para trocar o óleo, os filtros e o pneu de trás' };
    await render(<CartaoDeResumo lembrete={longo} />);
    expect(screen.getByText('Smart Fit – Iguatemi')).toHaveProp('numberOfLines', 1);
    expect(screen.getByText(longo.title).props.numberOfLines).toBeUndefined();
  });

  it('o título quebra antes do selo (largura máxima do original) e é o cabeçalho da seção para o leitor de tela', async () => {
    await render(<CartaoDeResumo lembrete={porHorario} />);
    const titulo = screen.getByText('Comprar água no mercado');
    expect(titulo).toHaveStyle({ maxWidth: size.sucesso.resumo.tituloMax, color: colors.text.primary });
    expect(titulo).toHaveProp('accessibilityRole', 'header');
  });

  it('o selo é verde-claro com o ponto verde, e só aparece com o lembrete ativo (pausado não diz "Ativo")', async () => {
    const { rerender } = await render(<CartaoDeResumo lembrete={porHorario} />);
    expect(screen.getByTestId('resumo-selo')).toHaveStyle({ backgroundColor: colors.feedback.successBg, borderColor: colors.sucesso.seloAnel, borderRadius: radius.pill, height: size.sucesso.resumo.seloHeight });
    await rerender(<CartaoDeResumo lembrete={{ ...porHorario, active: false }} />);
    expect(screen.queryByTestId('resumo-selo')).toBeNull();
    expect(screen.queryByText('Ativo')).toBeNull();
  });

  it('o ícone da categoria fica em pé (o haltere não gira como na lista) e cada dado tem o seu círculo', async () => {
    await render(<CartaoDeResumo lembrete={porLocal} />);
    expect(screen.getByTestId('icone-dumbbell', ESCONDIDO).props.style).toBeUndefined();
    expect(screen.getByTestId('icone-dumbbell', ESCONDIDO).parent).toHaveStyle({ width: size.sucesso.resumo.circle, backgroundColor: colors.sucesso.categoria });
    for (const nome of ['calendar-days', 'clock', 'map-pin', 'refresh-cw']) {
      expect(screen.getByTestId(`icone-${nome}`, ESCONDIDO).parent).toHaveStyle({ width: size.sucesso.resumo.dado, backgroundColor: colors.sucesso.dado, borderColor: colors.sucesso.dadoAnel });
    }
  });

  it('é um cartão claro com o anel branco por dentro e sem sombra por fora', async () => {
    await render(<CartaoDeResumo lembrete={porHorario} />);
    expect(screen.getByTestId('resumo')).toHaveStyle({ backgroundColor: colors.bg.card, borderRadius: radius.sheet, boxShadow: shadow.cartaoDoSucesso });
  });

  it('os nomes dos dados vão em cinza de texto e os valores em preto; o raio, em cinza secundário', async () => {
    await render(<CartaoDeResumo lembrete={porLocal} />);
    expect(screen.getByText('Data')).toHaveStyle({ color: colors.text.placeholder });
    expect(screen.getByText('Seg, 21 de set de 2026')).toHaveStyle({ color: colors.text.primary, fontFamily: fontFamily.medium });
    expect(screen.getByText('Raio de 150 metros')).toHaveStyle({ color: colors.text.secondary });
  });
});

describe('LinkButton', () => {
  it('é um botão sem fundo, com o texto em cinza de apoio e centrado, e chama onPress', async () => {
    const onPress = jest.fn();
    await render(<LinkButton label="Criar outro lembrete" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Criar outro lembrete' }));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Criar outro lembrete')).toHaveStyle({ color: colors.text.secondary, fontFamily: fontFamily.medium, textAlign: 'center' });
    expect(screen.getByRole('button', { name: 'Criar outro lembrete' })).toHaveStyle({ minHeight: size.sucesso.link, alignItems: 'center' });
  });

  it('a faixa é baixa, então a área de toque é completada até 44 em cima e embaixo', async () => {
    await render(<LinkButton label="Criar outro lembrete" onPress={jest.fn()} />);
    const { top, bottom } = screen.getByRole('button', { name: 'Criar outro lembrete' }).props.hitSlop as { top: number; bottom: number };
    expect(size.sucesso.link + top + bottom).toBeGreaterThanOrEqual(size.touch);
  });

  it('estados: ponteiro em cima escurece o texto, pressionado esmaece o link todo, foco de teclado põe o anel', () => {
    expect(corDoLink({ pressed: false })).toBe(colors.text.secondary);
    expect(corDoLink({ pressed: false, hovered: true })).toBe(colors.text.primary);
    expect(plano(estiloDoLink({ pressed: true }))).toMatchObject({ opacity: opacity.link });
    expect(plano(estiloDoLink({ pressed: false }))).not.toHaveProperty('opacity');
    expect(plano(estiloDoLink({ pressed: false, focused: true }))).toMatchObject(anelDeFoco);
  });
});
