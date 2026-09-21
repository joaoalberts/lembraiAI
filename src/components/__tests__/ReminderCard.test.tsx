import '@testing-library/react-native/matchers';
import { fireEvent, render, screen } from '@testing-library/react-native';
import type { Reminder } from '../../data/reminders';
import { ICON_NAME, UI_ICON } from '../../design/icons';
import { borderWidth, colors, iconStroke, opacity, radius, shadow, size } from '../../design/tokens';
import { ReminderCard } from '../ReminderCard';

const porHorario: Reminder = {
  id: '1', title: 'Tomar remédio', category: 'blue', icon: 'pill', kind: 'time',
  dateISO: '2026-09-20', time: '09:00', repeat: 'daily', active: true,
};
const porLocal: Reminder = {
  id: '2', title: 'Comprar leite', category: 'green', icon: 'cart', kind: 'local',
  place: 'Mercado da esquina', lat: -3.75, lng: -38.48, radius: 300, dateISO: '2026-09-20', time: '09:00', repeat: 'never', active: true,
};

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

describe('ReminderCard', () => {
  it('por horário: mostra título, data, hora e repetição', async () => {
    await render(<ReminderCard reminder={porHorario} onToggle={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText('Tomar remédio')).toBeTruthy();
    expect(screen.getByText('Dom, 20 de set de 2026 · 09:00 · Todos os dias')).toBeTruthy();
  });

  it('por local: mostra o lugar e o raio', async () => {
    await render(<ReminderCard reminder={porLocal} onToggle={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText('Mercado da esquina · raio de 300 m')).toBeTruthy();
  });

  it('só mostra "Você está aqui" quando está dentro do raio, com o anel de foco e o ícone de local', async () => {
    const { rerender } = await render(<ReminderCard reminder={porLocal} onToggle={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.queryByText('Você está aqui')).toBeNull();
    expect(screen.getByTestId('reminder-card')).not.toHaveStyle({ outlineWidth: borderWidth.focus });

    await rerender(<ReminderCard reminder={porLocal} nearby onToggle={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText('Você está aqui')).toHaveStyle({ color: colors.text.accent });
    expect(screen.getByTestId('reminder-card')).toHaveStyle({ outlineWidth: borderWidth.focus, outlineColor: colors.border.focus });
    expect(icone(UI_ICON.aqui)).toBeTruthy();
  });

  it('o interruptor e o botão de excluir chamam os callbacks', async () => {
    const onToggle = jest.fn();
    const onDelete = jest.fn();
    await render(<ReminderCard reminder={porHorario} onToggle={onToggle} onDelete={onDelete} />);

    await fireEvent.press(screen.getByLabelText('Ativar lembrete Tomar remédio'));
    expect(onToggle).toHaveBeenCalledTimes(1);

    await fireEvent.press(screen.getByLabelText('Excluir lembrete Tomar remédio'));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('superfície de cartão com sombra e faixa lateral na cor da categoria', async () => {
    await render(<ReminderCard reminder={porLocal} onToggle={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByTestId('reminder-card')).toHaveStyle({
      backgroundColor: colors.bg.card, borderRadius: radius.md, boxShadow: shadow.card,
      borderLeftWidth: borderWidth.bar, borderLeftColor: colors.category.green.bar,
    });
  });

  it('círculo do ícone na cor da categoria, com o ícone de contorno dela e o glifo escuro (nunca emoji)', async () => {
    await render(<ReminderCard reminder={porLocal} onToggle={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByTestId('reminder-icon', { includeHiddenElements: true })).toHaveStyle({ backgroundColor: colors.category.green.bg, width: size.iconCircle, height: size.iconCircle });
    const desenho = desenhoDoIcone(ICON_NAME.cart);
    expect(desenho).toContain(colors.category.green.ink);
    expect(desenho).toContain(`"width":${size.icon.md}`);
    expect(desenho).toContain(`"strokeWidth":${iconStroke.glyph}`);
    expect(screen.queryByText('🛒')).toBeNull();
  });

  it('cada categoria usa as próprias cores', async () => {
    await render(<ReminderCard reminder={porHorario} onToggle={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByTestId('reminder-card')).toHaveStyle({ borderLeftColor: colors.category.blue.bar });
    expect(screen.getByTestId('reminder-icon', { includeHiddenElements: true })).toHaveStyle({ backgroundColor: colors.category.blue.bg });
  });

  it('pausado fica com a opacidade de inativo', async () => {
    await render(<ReminderCard reminder={{ ...porHorario, active: false }} onToggle={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByTestId('reminder-card')).toHaveStyle({ opacity: opacity.inactive });
  });

  it('o botão de excluir é um ícone de lixeira com área de toque de 44', async () => {
    await render(<ReminderCard reminder={porHorario} onToggle={jest.fn()} onDelete={jest.fn()} />);
    expect(icone(UI_ICON.excluir)).toBeTruthy();
    const botao = screen.getByLabelText('Excluir lembrete Tomar remédio');
    expect(botao).toHaveProp('hitSlop', size.hitSlop);
    expect(screen.queryByText('✕')).toBeNull();
  });
});
