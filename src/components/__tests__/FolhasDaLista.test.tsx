import '@testing-library/react-native/matchers';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import type { Reminder } from '../../data/reminders';
import { borderWidth, colors, radius, size } from '../../design/tokens';
import { comAreaSegura } from '../../test-utils/area-segura';
import { ConfirmSheet } from '../ConfirmSheet';
import { ReminderMenu, estiloDaLinha } from '../ReminderMenu';

const ESCONDIDO = { includeHiddenElements: true };
const lembrete: Reminder = {
  id: '1', title: 'Comprar água no mercado', category: 'green', icon: 'cart', kind: 'time',
  dateISO: '2026-09-19', time: '09:00', repeat: 'never', active: true,
};

describe('ReminderMenu', () => {
  const abrir = async (r: Reminder | null = lembrete) => {
    const acoes = { onClose: jest.fn(), onEdit: jest.fn(), onDelete: jest.fn() };
    await render(comAreaSegura(<ReminderMenu reminder={r} {...acoes} />));
    return acoes;
  };

  it('mostra o título do lembrete, a data e a hora, e as linhas Editar e Excluir', async () => {
    await abrir();
    expect(screen.getByText('Comprar água no mercado')).toBeTruthy();
    expect(screen.getByText('Sáb, 19 de set de 2026 · 09:00')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Editar' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Excluir' })).toBeTruthy();
  });

  it('sem lembrete o menu está fechado', async () => {
    await abrir(null);
    expect(screen.queryByText('Editar')).toBeNull();
    expect(screen.queryByText('Excluir')).toBeNull();
  });

  it('cada linha chama a sua ação, e o toque no véu fecha', async () => {
    const { onClose, onEdit, onDelete } = await abrir();
    await fireEvent.press(screen.getByRole('button', { name: 'Editar' }));
    expect([onEdit.mock.calls.length, onDelete.mock.calls.length]).toEqual([1, 0]);
    await fireEvent.press(screen.getByRole('button', { name: 'Excluir' }));
    expect([onEdit.mock.calls.length, onDelete.mock.calls.length]).toEqual([1, 1]);
    await fireEvent.press(screen.getByLabelText('Fechar', ESCONDIDO));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Excluir é vermelho e Editar em tinta principal; os ícones são o lápis e a lixeira', async () => {
    await abrir();
    expect(StyleSheet.flatten(screen.getByText('Excluir').props.style)).toMatchObject({ color: colors.text.danger });
    expect(StyleSheet.flatten(screen.getByText('Editar').props.style)).toMatchObject({ color: colors.text.primary });
    expect(screen.getByTestId('icone-pencil', ESCONDIDO)).toBeTruthy();
    expect(screen.getByTestId('icone-trash', ESCONDIDO)).toBeTruthy();
  });

  it('linhas do tamanho do padrão, a lista com cantos e contorno, e o divisor só entre as duas', async () => {
    await abrir();
    expect(screen.getByRole('button', { name: 'Editar' })).toHaveStyle({ minHeight: size.menu.row });
    expect(screen.getByRole('button', { name: 'Editar' })).not.toHaveStyle({ borderTopWidth: borderWidth.hairline });
    expect(screen.getByRole('button', { name: 'Excluir' })).toHaveStyle({ borderTopWidth: borderWidth.hairline, borderTopColor: colors.border.divider });
    expect(screen.getByRole('button', { name: 'Editar' }).parent).toHaveStyle({ borderRadius: radius.lg, marginTop: size.menu.listTop });
  });

  it('estados da linha: ponteiro em cima e pressionado mudam a cor (rosado no Excluir); foco põe o anel', () => {
    const plano = (estado: Parameters<typeof estiloDaLinha>[0], perigo = false) => StyleSheet.flatten(estiloDaLinha(estado, perigo, true)) as Record<string, unknown>;
    expect(plano({ pressed: false })).not.toHaveProperty('backgroundColor');
    expect(plano({ pressed: false, hovered: true })).toMatchObject({ backgroundColor: colors.control.rowHover });
    expect(plano({ pressed: true, hovered: true })).toMatchObject({ backgroundColor: colors.control.rowPressed });
    expect(plano({ pressed: false, hovered: true }, true)).toMatchObject({ backgroundColor: colors.control.dangerRowHover });
    expect(plano({ pressed: true }, true)).toMatchObject({ backgroundColor: colors.control.dangerRowPressed });
    expect(plano({ pressed: false, focused: true })).toMatchObject({ outlineColor: colors.border.focus });
  });

  it('a lixeira fica num círculo rosado e o lápis num círculo menta', async () => {
    await abrir();
    const circulo = (nome: string) => screen.getByTestId(`icone-${nome}`, ESCONDIDO).parent;
    expect(circulo('trash')).toHaveStyle({ backgroundColor: colors.feedback.dangerCircle, width: size.menu.circle });
    expect(circulo('pencil')).toHaveStyle({ backgroundColor: colors.bg.iconCircle });
  });
});

describe('ConfirmSheet', () => {
  const abrir = async (visible = true) => {
    const acoes = { onConfirm: jest.fn(), onCancel: jest.fn() };
    await render(comAreaSegura(
      <ConfirmSheet visible={visible} title="Excluir lembrete?" message="“Comprar água” será removido e você não receberá mais esse aviso." confirmLabel="Excluir lembrete" {...acoes} />,
    ));
    return acoes;
  };

  it('mostra a pergunta, a mensagem e os dois botões', async () => {
    await abrir();
    expect(screen.getByText('Excluir lembrete?')).toBeTruthy();
    expect(screen.getByText('“Comprar água” será removido e você não receberá mais esse aviso.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Excluir lembrete' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeTruthy();
  });

  it('fechada não mostra nada', async () => {
    await abrir(false);
    expect(screen.queryByText('Excluir lembrete?')).toBeNull();
  });

  it('confirmar só confirma; cancelar e o véu só cancelam', async () => {
    const { onConfirm, onCancel } = await abrir();
    await fireEvent.press(screen.getByRole('button', { name: 'Excluir lembrete' }));
    expect([onConfirm.mock.calls.length, onCancel.mock.calls.length]).toEqual([1, 0]);
    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
    expect([onConfirm.mock.calls.length, onCancel.mock.calls.length]).toEqual([1, 1]);
    await fireEvent.press(screen.getByLabelText('Fechar', ESCONDIDO));
    expect([onConfirm.mock.calls.length, onCancel.mock.calls.length]).toEqual([1, 2]);
  });

  it('o botão de excluir é vermelho sólido com texto branco e o de cancelar é o "frost" com texto escuro', async () => {
    await abrir();
    expect(screen.getByRole('button', { name: 'Excluir lembrete' })).toHaveStyle({ backgroundColor: colors.action.danger });
    expect(StyleSheet.flatten(screen.getByText('Excluir lembrete').props.style)).toMatchObject({ color: colors.text.onAction });
    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveStyle({ backgroundColor: colors.action.frost });
    expect(StyleSheet.flatten(screen.getByText('Cancelar').props.style)).toMatchObject({ color: colors.text.primary });
  });

  it('o toque não confirma sozinho: nada é chamado até a pessoa tocar', async () => {
    const { onConfirm, onCancel } = await abrir();
    await act(async () => {});
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });
});
