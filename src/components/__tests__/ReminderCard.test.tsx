import '@testing-library/react-native/matchers';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import type { Reminder } from '../../data/reminders';
import { GIRO_NA_LISTA, ICON_NAME, UI_ICON } from '../../design/icons';
import { borderWidth, colors, fontFamily, fontSize, iconStroke, opacity, radius, shadow, size } from '../../design/tokens';
import { ReminderCard } from '../ReminderCard';

import { alvoDeToque } from '../../test-utils/toque';
const porHorario: Reminder = {
  id: '1', title: 'Tomar remédio', category: 'blue', icon: 'pill', kind: 'time',
  dateISO: '2026-09-20', time: '09:00', repeat: 'daily', active: true,
};
const porLocal: Reminder = {
  id: '2', title: 'Comprar leite', category: 'green', icon: 'cart', kind: 'local',
  place: 'Mercado da esquina', lat: -3.75, lng: -38.48, radius: 300, dateISO: '2026-09-20', time: '09:00', repeat: 'never', active: true,
};

const cartao = (r: Reminder, extra: Partial<React.ComponentProps<typeof ReminderCard>> = {}) => (
  <ReminderCard reminder={r} onToggle={jest.fn()} onMenu={jest.fn()} {...extra} />
);

/** O `Icon` marca o próprio desenho com `icone-<nome>` (o círculo do ícone fica escondido do leitor de tela de propósito). */
const icone = (nome: string) => screen.queryByTestId(`icone-${nome}`, { includeHiddenElements: true });

interface No { props?: Record<string, unknown>; children?: unknown }
/** O desenho (SVG) do ícone como texto, para conferir tamanho, cor e traço sem depender de como o pacote monta os elementos. */
function desenhoDoIcone(nome: string): string {
  const achar = (no: unknown): No | undefined => {
    if (!no || typeof no !== 'object') return undefined;
    const n = no as No;
    if (n.props?.testID === `icone-${nome}`) return n;
    for (const filho of ([] as unknown[]).concat(n.children ?? [])) { const achado = achar(filho); if (achado) return achado; }
    return undefined;
  };
  return JSON.stringify(achar(screen.toJSON()) ?? null);
}

describe('ReminderCard: tamanhos do texto (o original, em du: `.title` 23,3, `.place` 18, `.meta` 18,6, `.hour` 22,5)', () => {
  it('título de 12 (23,3 du), data e lugar de 9 (18 a 18,6 du) e a hora de 11 (22,5 du)', async () => {
    await render(cartao(porHorario));
    expect(screen.getByText('Tomar remédio')).toHaveStyle({ fontFamily: fontFamily.serif, fontSize: fontSize.micro });
    expect(screen.getByText('Dom, 20 de set de 2026')).toHaveStyle({ fontSize: fontSize.pico });
    expect(screen.getByText('09:00')).toHaveStyle({ fontSize: fontSize.mini });
  });

  it('por local: o endereço e o raio também de 9', async () => {
    await render(cartao(porLocal));
    expect(screen.getByText('Mercado da esquina')).toHaveStyle({ fontSize: fontSize.pico });
    expect(screen.getByText('Raio de 300 metros')).toHaveStyle({ fontSize: fontSize.pico });
  });

  it('"Você está aqui" (só do app, sem par no original) acompanha as linhas de 9 em volta', async () => {
    await render(cartao(porLocal, { nearby: true }));
    expect(screen.getByText('Você está aqui')).toHaveStyle({ fontSize: fontSize.pico });
  });
});

describe('ReminderCard: conteúdo', () => {
  it('por horário: título, data com o calendário, etiqueta "Por horário" e a hora', async () => {
    await render(cartao(porHorario));
    expect(screen.getByText('Tomar remédio')).toBeTruthy();
    expect(screen.getByText('Dom, 20 de set de 2026')).toBeTruthy();
    expect(icone('calendar-days')).toBeTruthy();
    expect(screen.getByText('Por horário')).toBeTruthy();
    expect(screen.getByText('09:00')).toBeTruthy();
    expect(screen.queryByTestId('reminder-thumb')).toBeNull();
  });

  it('por local: o lugar, o raio por extenso, a etiqueta "Por local" e a miniatura do mapa', async () => {
    await render(cartao(porLocal));
    expect(screen.getByText('Mercado da esquina')).toBeTruthy();
    expect(screen.getByText('Raio de 300 metros')).toBeTruthy();
    expect(screen.getByText('Por local')).toBeTruthy();
    expect(screen.getByTestId('reminder-thumb')).toBeTruthy();
    expect(screen.queryByText('Dom, 20 de set de 2026')).toBeNull();
  });

  it('por local sem endereço gravado ainda diz onde: "Local escolhido"', async () => {
    await render(cartao({ ...porLocal, place: undefined }));
    expect(screen.getByText('Local escolhido')).toBeTruthy();
  });

  it('o título fica numa linha só (título comprido termina em reticências em vez de crescer o cartão)', async () => {
    await render(cartao(porHorario));
    expect(screen.getByText('Tomar remédio')).toHaveProp('numberOfLines', 1);
  });

  it('só mostra "Você está aqui" quando está dentro do raio, com o anel de foco e o ícone de local', async () => {
    const pinos = () => screen.queryAllByTestId(`icone-${UI_ICON.aqui}`, { includeHiddenElements: true }).length;
    const { rerender } = await render(cartao(porLocal));
    const antes = pinos(); // o lugar e a etiqueta já têm pino
    expect(screen.queryByText('Você está aqui')).toBeNull();
    expect(screen.getByTestId('reminder-card')).not.toHaveStyle({ outlineWidth: borderWidth.focus });

    await rerender(cartao(porLocal, { nearby: true }));
    expect(screen.getByText('Você está aqui')).toHaveStyle({ color: colors.text.accent });
    expect(screen.getByTestId('reminder-card')).toHaveStyle({ outlineWidth: borderWidth.focus, outlineColor: colors.border.focus });
    expect(pinos()).toBe(antes + 1);
  });
});

describe('ReminderCard: ações', () => {
  it('o interruptor e as reticências chamam os callbacks, cada um com o nome do lembrete', async () => {
    const onToggle = jest.fn();
    const onMenu = jest.fn();
    await render(cartao(porHorario, { onToggle, onMenu }));

    await fireEvent.press(screen.getByLabelText('Ativar lembrete: Tomar remédio'));
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onMenu).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByLabelText('Mais opções: Tomar remédio'));
    expect(onMenu).toHaveBeenCalledTimes(1);
  });

  it('as reticências são um botão de 44 de toque, e o cartão em si não é tocável', async () => {
    await render(cartao(porHorario));
    const botao = screen.getByRole('button', { name: 'Mais opções: Tomar remédio' });
    const alvo = await alvoDeToque(botao, size.card.dotsWidth, size.card.dotsHeight);
    expect(alvo.altura).toBeGreaterThanOrEqual(size.touch);
    expect(alvo.largura).toBeGreaterThanOrEqual(size.touch);
    expect(screen.getByTestId('reminder-card')).not.toHaveProp('onPress');
    expect(screen.queryByLabelText('Excluir lembrete: Tomar remédio')).toBeNull();
  });

  it('o interruptor reflete se o lembrete está ativo', async () => {
    await render(cartao({ ...porHorario, active: false }));
    expect(screen.getByRole('switch', { name: 'Ativar lembrete: Tomar remédio' })).not.toBeChecked();
  });
});

describe('ReminderCard: aparência', () => {
  it('superfície de cartão com sombra, cantos e a faixa da categoria à esquerda', async () => {
    await render(cartao(porLocal));
    expect(screen.getByTestId('reminder-card')).toHaveStyle({ backgroundColor: colors.bg.card, borderRadius: radius.md, boxShadow: shadow.card, overflow: 'hidden' });
    expect(screen.getByTestId('reminder-bar')).toHaveStyle({ backgroundColor: colors.category.green.bar, width: borderWidth.bar, left: 0 });
  });

  it('círculo do ícone alinhado ao topo, na cor da categoria, com o glifo escuro de contorno (nunca emoji)', async () => {
    await render(cartao(porLocal));
    expect(screen.getByTestId('reminder-icon', { includeHiddenElements: true })).toHaveStyle({ backgroundColor: colors.category.green.bg, width: size.card.circle, height: size.card.circle, marginTop: size.card.circleTop });
    const desenho = desenhoDoIcone(ICON_NAME.cart);
    expect(desenho).toContain(colors.category.green.ink);
    expect(desenho).toContain(`"width":${size.card.glyph}`);
    expect(desenho).toContain(`"strokeWidth":${iconStroke.glyph}`);
    expect(screen.queryByText('🛒')).toBeNull();
  });

  it('o halter e o avião giram para ficar em pé; os outros glifos não', async () => {
    await render(cartao({ ...porHorario, icon: 'dumbbell' }));
    const giro = (screen.getByTestId(`icone-${ICON_NAME.dumbbell}`, { includeHiddenElements: true }).props.style as { transform: { rotate: string }[] });
    expect(giro.transform[0].rotate).toBe(`${GIRO_NA_LISTA.dumbbell}deg`);
    await screen.unmount();
    await render(cartao(porHorario));
    expect(screen.getByTestId(`icone-${ICON_NAME.pill}`, { includeHiddenElements: true }).props.style).toBeUndefined();
  });

  it('cada categoria usa as próprias cores na faixa e no círculo', async () => {
    await render(cartao(porHorario));
    expect(screen.getByTestId('reminder-bar')).toHaveStyle({ backgroundColor: colors.category.blue.bar });
    expect(screen.getByTestId('reminder-icon', { includeHiddenElements: true })).toHaveStyle({ backgroundColor: colors.category.blue.bg });
  });

  it('pausado fica com a opacidade de inativo', async () => {
    await render(cartao({ ...porHorario, active: false }));
    expect(screen.getByTestId('reminder-card')).toHaveStyle({ opacity: opacity.inactive });
  });

  it('as reticências têm o cinza e o traço próprios; a hora é em tinta principal e média', async () => {
    await render(cartao(porHorario));
    const desenho = desenhoDoIcone('ellipsis');
    expect(desenho).toContain(colors.icon.dots);
    expect(desenho).toContain(`"strokeWidth":${iconStroke.dots}`);
    expect(StyleSheet.flatten(screen.getByText('09:00').props.style)).toMatchObject({ color: colors.text.primary, fontFamily: fontFamily.medium });
  });

  it('nos lembretes por local a coluna da hora desce (o cartão é mais alto)', async () => {
    await render(cartao(porLocal));
    const coluna = screen.getByText("09:00").parent as unknown as { props: { style: unknown } };
    expect(JSON.stringify(StyleSheet.flatten(coluna.props.style as never))).toContain(`"paddingTop":${size.card.rightTop + size.card.localShift}`);
  });
});
