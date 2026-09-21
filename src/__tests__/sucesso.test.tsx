import '@testing-library/react-native/matchers';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { router, useIsFocused, useLocalSearchParams } from 'expo-router';
import { AccessibilityInfo } from 'react-native';
import SucessoScreen from '../../app/(app)/sucesso';
import type { Reminder } from '../data/reminders';
import { motion, size } from '../design/tokens';
import { compartilhar } from '../lib/compartilhar';
import { useReminders } from '../state/reminders';
import { comAreaSegura } from '../test-utils/area-segura';

jest.mock('expo-router', () => ({ router: { navigate: jest.fn() }, useLocalSearchParams: jest.fn(), useIsFocused: jest.fn() }));
jest.mock('../state/reminders', () => ({ useReminders: jest.fn() }));
jest.mock('../lib/compartilhar', () => ({ compartilhar: jest.fn() }));

const lembrete: Reminder = { id: 'a1', title: 'Comprar água no mercado', category: 'green', icon: 'cart', kind: 'time', dateISO: '2026-09-21', time: '09:00', repeat: 'never', active: true };
const remove = jest.fn();

interface Estado { reminders: Reminder[]; carregando: boolean }
/** `id = null` é "sem id no endereço" (`undefined` ativaria o valor padrão). */
const montar = (estado: Estado, id: string | null = 'a1', emFoco = true, insets?: { top?: number; bottom?: number }) => {
  jest.mocked(useIsFocused).mockReturnValue(emFoco);
  jest.mocked(useLocalSearchParams).mockReturnValue({ id: id ?? undefined } as never);
  jest.mocked(useReminders).mockReturnValue({ ...estado, remove } as unknown as ReturnType<typeof useReminders>);
  return comAreaSegura(<SucessoScreen />, insets);
};
const abrir = (estado: Estado = { reminders: [lembrete], carregando: false }, id: string | null = 'a1', emFoco = true, insets?: { top?: number; bottom?: number }) =>
  render(montar(estado, id, emFoco, insets));
/** O provedor da área segura envolve tudo, então "a tela não mostra nada" é ele sem filhos. */
const semNada = () => expect((screen.toJSON() as { children?: unknown[] | null } | null)?.children ?? []).toHaveLength(0);

beforeEach(() => {
  jest.clearAllMocks();
  // sem animação: o quadro final do herói já chega pronto
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
});

describe('tela de sucesso', () => {
  it('mostra o título, o subtítulo, o resumo, as três ações, a dica, o botão escuro e o link', async () => {
    await abrir();
    expect(screen.getByRole('header', { name: 'Lembrete criado\ncom sucesso!' })).toBeTruthy();
    expect(screen.getByText('Você será avisado na hora certa.\nPode ficar tranquilo.')).toBeTruthy();
    expect(screen.getByTestId('resumo')).toBeTruthy();
    expect(screen.getByText('Comprar água no mercado')).toBeTruthy();
    for (const nome of ['Editar', 'Excluir', 'Compartilhar', 'Ver todos os lembretes', 'Criar outro lembrete', 'Fechar']) expect(screen.getByRole('button', { name: nome })).toBeTruthy();
    expect(screen.getByTestId('dica-inteligente')).toBeTruthy();
    expect(screen.getByTestId('heroi', { includeHiddenElements: true })).toBeTruthy();
  });

  it('o lembrete vem da lista pelo id do endereço', async () => {
    const outro: Reminder = { ...lembrete, id: 'b2', title: 'Tomar vitamina', time: '08:00' };
    await abrir({ reminders: [lembrete, outro], carregando: false }, 'b2');
    expect(screen.getByText('Tomar vitamina')).toBeTruthy();
    expect(screen.queryByText('Comprar água no mercado')).toBeNull();
  });

  it('Fechar e "Ver todos os lembretes" levam à lista', async () => {
    await abrir();
    await fireEvent.press(screen.getByRole('button', { name: 'Fechar' }));
    expect(router.navigate).toHaveBeenLastCalledWith('/');
    await fireEvent.press(screen.getByRole('button', { name: 'Ver todos os lembretes' }));
    expect(router.navigate).toHaveBeenCalledTimes(2);
    expect(router.navigate).toHaveBeenLastCalledWith('/');
  });

  it('Editar abre o formulário de edição deste lembrete', async () => {
    await abrir();
    await fireEvent.press(screen.getByRole('button', { name: 'Editar' }));
    expect(router.navigate).toHaveBeenCalledWith({ pathname: '/editar', params: { id: 'a1' } });
  });

  it('a dica e o link "Criar outro lembrete" levam ao formulário novo', async () => {
    await abrir();
    await fireEvent.press(screen.getByTestId('dica-inteligente'));
    expect(router.navigate).toHaveBeenLastCalledWith('/novo');
    await fireEvent.press(screen.getByRole('button', { name: 'Criar outro lembrete' }));
    expect(router.navigate).toHaveBeenCalledTimes(2);
    expect(router.navigate).toHaveBeenLastCalledWith('/novo');
  });
});

describe('tela de sucesso: excluir', () => {
  it('Excluir abre a confirmação com o título do lembrete e ainda não exclui nada', async () => {
    await abrir();
    await fireEvent.press(screen.getByRole('button', { name: 'Excluir' }));
    expect(screen.getByText('Excluir lembrete?')).toBeTruthy();
    expect(screen.getByText('“Comprar água no mercado” será removido e você não receberá mais esse aviso.')).toBeTruthy();
    expect(remove).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('Cancelar fecha a confirmação e o lembrete continua', async () => {
    await abrir();
    await fireEvent.press(screen.getByRole('button', { name: 'Excluir' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByText('Excluir lembrete?')).toBeNull();
    expect(remove).not.toHaveBeenCalled();
    expect(screen.getByTestId('resumo')).toBeTruthy();
  });

  it('confirmar exclui o lembrete e vai para a lista', async () => {
    await abrir();
    await fireEvent.press(screen.getByRole('button', { name: 'Excluir' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Excluir lembrete' }));
    expect(remove).toHaveBeenCalledWith('a1');
    expect(router.navigate).toHaveBeenCalledWith('/');
  });

  it('depois de excluir a tela some sem piscar "não existe mais" (a lista já perdeu o lembrete)', async () => {
    const { rerender } = await abrir();
    await fireEvent.press(screen.getByRole('button', { name: 'Excluir' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Excluir lembrete' }));
    expect(screen.queryByTestId('resumo')).toBeNull();
    await rerender(montar({ reminders: [], carregando: false }));
    expect(screen.queryByText('Esse lembrete não existe mais.')).toBeNull();
    semNada();
  });
});

describe('tela de sucesso: compartilhar', () => {
  beforeEach(() => jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] }));
  afterEach(() => jest.useRealTimers());
  const tocar = async () => { await fireEvent.press(screen.getByRole('button', { name: /^Compartilhar|Copiado|Indisponível$/ })); };

  it('chama o compartilhar com o lembrete; se compartilhou ou a pessoa fechou a folha, o rótulo não muda', async () => {
    await abrir();
    jest.mocked(compartilhar).mockResolvedValueOnce('compartilhado').mockResolvedValueOnce('cancelado');
    await tocar();
    expect(compartilhar).toHaveBeenCalledWith(lembrete);
    expect(screen.getByText('Compartilhar')).toBeTruthy();
    await tocar();
    expect(screen.getByText('Compartilhar')).toBeTruthy();
  });

  it('quando só deu para copiar o texto, o rótulo vira "Copiado" por um instante e volta', async () => {
    await abrir();
    jest.mocked(compartilhar).mockResolvedValue('copiado');
    await tocar();
    expect(screen.getByText('Copiado')).toBeTruthy();
    expect(screen.queryByText('Compartilhar')).toBeNull();
    await act(async () => { jest.advanceTimersByTime(motion.duration.aviso - 100); });
    expect(screen.getByText('Copiado')).toBeTruthy();
    await act(async () => { jest.advanceTimersByTime(200); });
    expect(screen.getByText('Compartilhar')).toBeTruthy();
  });

  it('sem como compartilhar nem copiar (ou se o compartilhamento falha) o rótulo diz "Indisponível"', async () => {
    await abrir();
    jest.mocked(compartilhar).mockResolvedValueOnce('indisponivel').mockRejectedValueOnce(new Error('sem folha'));
    await tocar();
    expect(screen.getByText('Indisponível')).toBeTruthy();
    await act(async () => { jest.advanceTimersByTime(motion.duration.aviso + 100); });
    await tocar();
    expect(screen.getByText('Indisponível')).toBeTruthy();
  });
});

describe('tela de sucesso: sem lembrete, fora de foco e área segura', () => {
  it('enquanto a lista chega (página recarregada) espera', async () => {
    await abrir({ reminders: [], carregando: true });
    expect(screen.queryByTestId('resumo')).toBeNull();
    expect(screen.queryByText('Esse lembrete não existe mais.')).toBeNull();
    expect(JSON.stringify(screen.toJSON())).toContain('ActivityIndicator');
  });

  it('se o lembrete não existe mais avisa e oferece a saída (a barra de abas fica escondida aqui)', async () => {
    await abrir({ reminders: [lembrete], carregando: false }, 'sumiu');
    expect(screen.getByText('Esse lembrete não existe mais.')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Ver todos os lembretes' }));
    expect(router.navigate).toHaveBeenCalledWith('/');
    expect(screen.queryByTestId('resumo')).toBeNull();
  });

  it('sem id no endereço também avisa', async () => {
    await abrir({ reminders: [lembrete], carregando: false }, null);
    expect(screen.getByText('Esse lembrete não existe mais.')).toBeTruthy();
  });

  it('fora de foco não monta nada (o pulso do herói não roda escondido) e ao voltar começa de novo', async () => {
    const { rerender } = await abrir({ reminders: [lembrete], carregando: false }, 'a1', false);
    semNada();
    await rerender(montar({ reminders: [lembrete], carregando: false }, 'a1', true));
    expect(screen.getByTestId('resumo')).toBeTruthy();
  });

  it('num aparelho com entalhe o herói e o botão de fechar descem o que a barra de status passa da distância do botão', async () => {
    await abrir(undefined, 'a1', true, { top: 59 });
    const descido = 59 - size.sucesso.fecharTop;
    expect(screen.getByTestId('sucesso-topo')).toHaveStyle({ top: descido });
  });

  it('sem entalhe nada se mexe (a barra de status baixa cabe acima do botão)', async () => {
    await abrir(undefined, 'a1', true, { top: 24 });
    expect(screen.getByTestId('sucesso-topo')).toHaveStyle({ top: 0 });
  });
});
