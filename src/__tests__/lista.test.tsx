import '@testing-library/react-native/matchers';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import LembretesScreen from '../../app/(app)/index';
import type { Reminder } from '../data/reminders';
import { comAreaSegura } from '../test-utils/area-segura';
import { useGeofences } from '../state/geofences';
import { useReminders } from '../state/reminders';

jest.mock('expo-router', () => ({ router: { navigate: jest.fn() } }));
jest.mock('../state/reminders', () => ({ useReminders: jest.fn() }));
jest.mock('../state/geofences', () => ({ useGeofences: jest.fn() }));

// Segunda-feira, 21/09/2026
const HOJE = new Date(2026, 8, 21, 10, 0, 0);
const base: Omit<Reminder, 'id' | 'title' | 'dateISO'> = { category: 'green', icon: 'cart', kind: 'time', time: '09:00', repeat: 'never', active: true };
const r = (id: string, title: string, dateISO: string, extra: Partial<Reminder> = {}): Reminder => ({ ...base, id, title, dateISO, ...extra });

const agua = r('1', 'Comprar água no mercado', '2026-09-19');
const hoje = r('3', 'Reunião com o time', '2026-09-21', { category: 'purple', icon: 'users' });
const amanha = r('4', 'Tomar vitamina', '2026-09-22', { time: '08:00', category: 'blue', icon: 'pill' });
const academia = r('5', 'Academia', '2026-09-25', { kind: 'local', place: 'Smart Fit – Iguatemi', radius: 100, lat: 1, lng: 2, active: false, category: 'orange', icon: 'dumbbell' });
const todos = [agua, hoje, amanha, academia];

interface Estado { reminders: Reminder[]; carregando: boolean; erro: string | null; insideIds: string[] }
const acoes = { recarregar: jest.fn(), toggle: jest.fn(), remove: jest.fn() };

function abrir(estado: Partial<Estado> = {}) {
  const { reminders = todos, carregando = false, erro = null, insideIds = [] } = estado;
  jest.mocked(useReminders).mockReturnValue({ reminders, carregando, erro, ...acoes } as unknown as ReturnType<typeof useReminders>);
  jest.mocked(useGeofences).mockReturnValue({ insideIds } as unknown as ReturnType<typeof useGeofences>);
  return render(comAreaSegura(<LembretesScreen />));
}

beforeEach(() => {
  jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });
  jest.setSystemTime(HOJE);
  jest.clearAllMocks();
});
afterEach(() => jest.useRealTimers());

const digitarNaBusca = async (texto: string) => {
  await fireEvent.press(screen.getByRole('button', { name: 'Buscar' }));
  await fireEvent.changeText(screen.getByLabelText('Buscar lembretes'), texto);
};

describe('Lista: cabeçalho', () => {
  it('mostra o título, quantos lembretes estão ativos (a academia está pausada) e a marca', async () => {
    await abrir();
    expect(screen.getByRole('header', { name: 'Meus lembretes' })).toBeTruthy();
    expect(screen.getByText('3 lembretes ativos')).toBeTruthy();
    expect(screen.getByText('LembreiAi')).toBeTruthy();
  });

  it('"Novo lembrete" abre o formulário e a conta leva às configurações', async () => {
    await abrir();
    await fireEvent.press(screen.getByRole('button', { name: 'Novo lembrete' }));
    expect(router.navigate).toHaveBeenCalledWith('/novo');
    await fireEvent.press(screen.getByRole('button', { name: 'Minha conta' }));
    expect(router.navigate).toHaveBeenCalledWith('/config');
  });
});

describe('Lista: chips e seções', () => {
  it('os chips mostram a contagem de cada filtro, com Todos selecionado', async () => {
    await abrir();
    expect(screen.getByRole('button', { name: 'Todos: 4' })).toBeSelected();
    expect(screen.getByRole('button', { name: 'Hoje: 1' })).not.toBeSelected();
    expect(screen.getByRole('button', { name: 'Esta semana: 3' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Locais: 1' })).toBeTruthy();
  });

  it('agrupa em Hoje, Amanhã e Esta semana; só Hoje e Amanhã mostram a data', async () => {
    await abrir();
    const secao = (nome: string) => screen.getByRole('header', { name: nome });
    const itensDoCabecalho = (nome: string) => secao(nome).parent?.children.length;
    expect([secao('Hoje'), secao('Amanhã'), secao('Esta semana')]).toHaveLength(3);
    // título + data à direita em Hoje e Amanhã; só o título em Esta semana
    expect([itensDoCabecalho('Hoje'), itensDoCabecalho('Amanhã'), itensDoCabecalho('Esta semana')]).toEqual([2, 2, 1]);
    expect(screen.getAllByText('Seg, 21 de set de 2026')).toHaveLength(2); // a data da seção e a do cartão de hoje
    expect(screen.getAllByText('Ter, 22 de set de 2026')).toHaveLength(2);
    expect(screen.getAllByTestId('reminder-card')).toHaveLength(4);
  });

  it('o filtro Hoje mostra só o de hoje, marca o chip e não mexe nas contagens', async () => {
    await abrir();
    await fireEvent.press(screen.getByRole('button', { name: 'Hoje: 1' }));
    expect(screen.getAllByTestId('reminder-card')).toHaveLength(1);
    expect(screen.getByText('Reunião com o time')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Hoje: 1' })).toBeSelected();
    expect(screen.getByRole('button', { name: 'Todos: 4' })).not.toBeSelected();
    expect(screen.queryByText('Amanhã')).toBeNull();
    expect(screen.getByText('3 lembretes ativos')).toBeTruthy(); // o subtítulo conta a lista inteira, não o filtro
  });

  it('o filtro Locais mostra só os lembretes por local', async () => {
    await abrir();
    await fireEvent.press(screen.getByRole('button', { name: 'Locais: 1' }));
    expect(screen.getAllByTestId('reminder-card')).toHaveLength(1);
    expect(screen.getByText('Academia')).toBeTruthy();
  });

  it('o interruptor e o menu de cada cartão respondem', async () => {
    await abrir();
    await fireEvent.press(screen.getByLabelText('Ativar lembrete: Tomar vitamina'));
    expect(acoes.toggle).toHaveBeenCalledWith('4');
  });

  it('mostra o aviso de que está dentro do raio, no singular e no plural', async () => {
    const { unmount } = await abrir({ insideIds: ['5'] });
    expect(screen.getByText('Você está dentro do raio de 1 lembrete')).toBeTruthy();
    await unmount();
    await abrir({ insideIds: ['5', '1'] });
    expect(screen.getByText('Você está dentro do raio de 2 lembretes')).toBeTruthy();
  });
});

describe('Lista: busca', () => {
  it('o botão abre o campo no lugar da marca e vira "Fechar busca"; digitar filtra e recalcula os chips', async () => {
    await abrir();
    await fireEvent.press(screen.getByRole('button', { name: 'Buscar' }));
    expect(screen.getByLabelText('Buscar lembretes')).toBeTruthy();
    expect(screen.queryByText('Sua rotina, mais leve.')).toBeNull();
    expect(screen.getByRole('button', { name: 'Fechar busca' })).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText('Buscar lembretes'), 'vitamina');
    expect(screen.getAllByTestId('reminder-card')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Todos: 1' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Hoje: 0' })).toBeTruthy();
    expect(screen.getByText('3 lembretes ativos')).toBeTruthy(); // nem a busca mexe no subtítulo
  });

  it('a dica some enquanto se busca e volta quando a busca fecha', async () => {
    await abrir();
    expect(screen.getByText('Dica para você')).toBeTruthy();
    await digitarNaBusca('vitamina');
    expect(screen.queryByText('Dica para você')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Fechar busca' }));
    expect(screen.getByText('Dica para você')).toBeTruthy();
  });

  it('fechar a busca zera o texto e mantém o filtro escolhido', async () => {
    await abrir();
    await fireEvent.press(screen.getByRole('button', { name: 'Esta semana: 3' }));
    await digitarNaBusca('vitamina');
    await fireEvent.press(screen.getByRole('button', { name: 'Fechar busca' }));
    expect(screen.queryByLabelText('Buscar lembretes')).toBeNull();
    expect(screen.getByText('Sua rotina, mais leve.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Esta semana: 3' })).toBeSelected();
    expect(screen.getAllByTestId('reminder-card')).toHaveLength(3);
  });

  it('a tecla Esc do campo também fecha a busca', async () => {
    await abrir();
    await digitarNaBusca('vitamina');
    await fireEvent(screen.getByLabelText('Buscar lembretes'), 'keyPress', { nativeEvent: { key: 'Escape' } });
    expect(screen.queryByLabelText('Buscar lembretes')).toBeNull();
  });

  it('sem resultado diz o que foi buscado e sugere conferir a grafia', async () => {
    await abrir();
    await digitarNaBusca('  zzz  ');
    expect(screen.getByText('Nenhum resultado para “zzz”')).toBeTruthy();
    expect(screen.getByText('Confira a grafia ou busque por outro nome ou local.')).toBeTruthy();
    expect(screen.queryAllByTestId('reminder-card')).toHaveLength(0);
  });
});

describe('Lista: vazio, carregando e erro', () => {
  it('sem lembretes convida a criar o primeiro, sem dica, e o botão abre o formulário', async () => {
    await abrir({ reminders: [] });
    expect(screen.getByText('Nenhum lembrete ainda')).toBeTruthy();
    expect(screen.getByText('0 lembretes ativos')).toBeTruthy();
    expect(screen.queryByText('Dica para você')).toBeNull();
    const botoes = screen.getAllByRole('button', { name: 'Novo lembrete' });
    await fireEvent.press(botoes[botoes.length - 1]);
    expect(router.navigate).toHaveBeenCalledWith('/novo');
  });

  it('carregando mostra o texto de espera e não a mensagem de vazio', async () => {
    await abrir({ reminders: [], carregando: true });
    expect(screen.getByText('Carregando seus lembretes…')).toBeTruthy();
    expect(screen.queryByText('Nenhum lembrete ainda')).toBeNull();
  });

  it('com erro mostra o aviso e "Tentar novamente", que recarrega', async () => {
    await abrir({ reminders: [], erro: 'Não foi possível carregar seus lembretes.' });
    expect(screen.getByText('Não foi possível carregar seus lembretes.')).toBeTruthy();
    expect(screen.queryByText('Nenhum lembrete ainda')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(acoes.recarregar).toHaveBeenCalledTimes(1);
  });
});

describe('Lista: menu e exclusão', () => {
  const abrirMenuDe = async (titulo: string) => {
    await abrir();
    await fireEvent.press(screen.getByLabelText(`Mais opções: ${titulo}`));
  };

  it('as reticências abrem o menu do lembrete com a data e a hora', async () => {
    await abrirMenuDe('Comprar água no mercado');
    expect(screen.getAllByText('Comprar água no mercado').length).toBeGreaterThan(1); // cartão e folha
    expect(screen.getByText('Sáb, 19 de set de 2026 · 09:00')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Excluir' })).toBeTruthy();
  });

  it('Editar abre o formulário de edição daquele lembrete e fecha o menu', async () => {
    await abrirMenuDe('Tomar vitamina');
    await fireEvent.press(screen.getByRole('button', { name: 'Editar' }));
    expect(router.navigate).toHaveBeenCalledWith({ pathname: '/editar', params: { id: '4' } });
    expect(screen.queryByRole('button', { name: 'Editar' })).toBeNull();
    expect(acoes.remove).not.toHaveBeenCalled();
  });

  it('Excluir fecha o menu e abre a confirmação com o nome do lembrete', async () => {
    await abrirMenuDe('Comprar água no mercado');
    await fireEvent.press(screen.getByRole('button', { name: 'Excluir' }));
    expect(screen.getByText('Excluir lembrete?')).toBeTruthy();
    expect(screen.getByText('“Comprar água no mercado” será removido e você não receberá mais esse aviso.')).toBeTruthy();
    expect(screen.queryByText('Sáb, 19 de set de 2026 · 09:00')).toBeNull();
    expect(acoes.remove).not.toHaveBeenCalled();
  });

  it('confirmar exclui aquele lembrete e fecha a folha', async () => {
    await abrirMenuDe('Tomar vitamina');
    await fireEvent.press(screen.getByRole('button', { name: 'Excluir' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Excluir lembrete' }));
    expect(acoes.remove).toHaveBeenCalledTimes(1);
    expect(acoes.remove).toHaveBeenCalledWith('4');
    expect(screen.queryByText('Excluir lembrete?')).toBeNull();
  });

  it('cancelar não exclui nada e fecha a folha', async () => {
    await abrirMenuDe('Tomar vitamina');
    await fireEvent.press(screen.getByRole('button', { name: 'Excluir' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
    expect(acoes.remove).not.toHaveBeenCalled();
    expect(screen.queryByText('Excluir lembrete?')).toBeNull();
  });

  it('o toque no véu do menu fecha sem abrir a confirmação', async () => {
    await abrirMenuDe('Tomar vitamina');
    await fireEvent.press(screen.getByLabelText('Fechar', { includeHiddenElements: true }));
    expect(screen.queryByRole('button', { name: 'Excluir' })).toBeNull();
    expect(screen.queryByText('Excluir lembrete?')).toBeNull();
  });
});

// o teste de fumaça de que o `act` do relógio falso não deixa nada pendente
it('não deixa timers pendentes depois de abrir a lista', async () => {
  await abrir();
  await act(async () => {});
});
