import '@testing-library/react-native/matchers';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import ConfigScreen from '../../app/(app)/config';
import { motion } from '../design/tokens';
import { confirmar } from '../lib/confirm';
import { useAuth } from '../state/auth';
import { useGeo } from '../state/geo';
import { useGeofences } from '../state/geofences';
import { useNotifications } from '../state/notifications';
import { comAreaSegura } from '../test-utils/area-segura';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), navigate: jest.fn() } }));
jest.mock('../state/auth', () => ({ useAuth: jest.fn() }));
jest.mock('../state/geo', () => ({ useGeo: jest.fn() }));
jest.mock('../state/geofences', () => ({ useGeofences: jest.fn() }));
jest.mock('../state/notifications', () => ({ useNotifications: jest.fn() }));
jest.mock('../lib/confirm', () => ({ confirmar: jest.fn() }));

const AGORA = new Date(2026, 8, 21, 10, 0, 0).getTime();
const sair = jest.fn();
const excluirConta = jest.fn();
const setMonitoring = jest.fn();
const requestPermission = jest.fn();
const pedirPermissaoDeSegundoPlano = jest.fn();

interface Cenario {
  nome?: string;
  email?: string;
  monitoring?: boolean;
  geoOk?: boolean;
  position?: { lat: number; lng: number; accuracy: number | null; at: number } | null;
  geoError?: string | null;
  fences?: { id: string; title: string }[];
  insideIds?: string[];
  nearest?: { fence: { title: string }; meters: number } | null;
  arrivals?: { id: string; title: string; at: number; place?: string }[];
  notifSupported?: boolean;
  notifModo?: 'sistema' | 'so-com-o-app-aberto';
  segundoPlano?: { estado: string; permissao?: string };
  permissaoDoNavegador?: 'concedida' | 'negada' | 'pendente' | 'indisponivel';
  notifOk?: boolean;
  scheduledCount?: number;
}

const abrir = (c: Cenario = {}) => {
  const { nome = '', email = 'joao.teste@exemplo.com', monitoring = false, geoOk = true, position = null, geoError = null, fences = [], insideIds = [], nearest = null, arrivals = [], notifSupported = true, segundoPlano = { estado: 'indisponivel' } as NonNullable<Cenario['segundoPlano']>, notifModo = 'sistema' as const, permissaoDoNavegador = undefined as Cenario['permissaoDoNavegador'], notifOk = true, scheduledCount = 0 } = c;
  jest.mocked(useAuth).mockReturnValue({ user: { email }, nome, sair, excluirConta } as unknown as ReturnType<typeof useAuth>);
  jest.mocked(useGeo).mockReturnValue({ monitoring, setMonitoring, permissionGranted: geoOk, position, error: geoError } as unknown as ReturnType<typeof useGeo>);
  jest.mocked(useGeofences).mockReturnValue({ fences, insideIds, nearest, arrivals, segundoPlano: { estado: segundoPlano.estado, permissao: segundoPlano.permissao ?? 'desconhecida', pedirPermissao: pedirPermissaoDeSegundoPlano } } as unknown as ReturnType<typeof useGeofences>);
  jest.mocked(useNotifications).mockReturnValue({ supported: notifSupported, modo: notifModo, permissionGranted: notifOk, scheduledCount, permissaoDoNavegador, requestPermission } as unknown as ReturnType<typeof useNotifications>);
  return render(comAreaSegura(<ConfigScreen />));
};

beforeEach(() => {
  jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
  jest.setSystemTime(AGORA);
  jest.clearAllMocks();
  excluirConta.mockResolvedValue(null);
  if (!window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(() => ({
        matches: false,
        media: '',
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  }
});
afterEach(() => jest.useRealTimers());

describe('Configurações: cabeçalho e conta', () => {
  it('cabeçalho verde com a marca, o título e o subtítulo', async () => {
    await abrir();
    expect(screen.getByRole('header', { name: 'Configurações' })).toBeTruthy();
    expect(screen.getByText('Permissões e monitoramento.')).toBeTruthy();
    expect(screen.getByText('LembreiAi')).toBeTruthy();
    expect(screen.getByTestId('cabecalho-verde')).toBeTruthy();
  });

  it('cartão da conta: "Minha conta" (ou o nome), o e-mail e o botão Sair', async () => {
    await abrir();
    expect(screen.getByRole('header', { name: 'Minha conta' })).toBeTruthy();
    expect(screen.getByText('joao.teste@exemplo.com')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Sair' }));
    expect(sair).toHaveBeenCalledTimes(1);
  });

  it('com nome cadastrado o título do cartão é o nome', async () => {
    await abrir({ nome: 'Ana Exemplo' });
    expect(screen.getByRole('header', { name: 'Ana Exemplo' })).toBeTruthy();
    expect(screen.queryByRole('header', { name: 'Minha conta' })).toBeNull();
  });
});

describe('Configurações: lembretes por local', () => {
  it('o interruptor reflete o monitoramento e liga e desliga pelo toque', async () => {
    const { rerender } = await abrir();
    const chave = () => screen.getByRole('switch', { name: 'Monitorar lembretes por local' });
    expect(chave()).not.toBeChecked();
    await fireEvent.press(chave());
    expect(setMonitoring).toHaveBeenLastCalledWith(true);
    jest.mocked(useGeo).mockReturnValue({ monitoring: true, setMonitoring, permissionGranted: true, position: null, error: null } as unknown as ReturnType<typeof useGeo>);
    await rerender(comAreaSegura(<ConfigScreen />));
    expect(chave()).toBeChecked();
    await fireEvent.press(chave());
    expect(setMonitoring).toHaveBeenLastCalledWith(false);
  });

  it('as linhas de dados: permissão, quantos lembretes são monitorados e, desligado, "—" na posição e na precisão', async () => {
    await abrir({ geoOk: true, fences: [{ id: 'a', title: 'Mercado' }, { id: 'b', title: 'Academia' }] });
    expect(screen.getByText('Permissão de localização')).toBeTruthy();
    expect(screen.getByText('permitida')).toBeTruthy();
    expect(screen.getByText('Lembretes monitorados')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('Última posição')).toBeTruthy();
    expect(screen.getByText('Precisão do sinal')).toBeTruthy();
    expect(screen.getAllByText('—')).toHaveLength(2);
    expect(screen.queryByText('Mais próximo')).toBeNull();
  });

  it('sem permissão diz "não permitida"', async () => {
    await abrir({ geoOk: false });
    expect(screen.getByText('não permitida')).toBeTruthy();
  });

  it('monitorando: a última posição é "há N s" (e vira minutos), a precisão é "± N m" e aparece o mais próximo', async () => {
    await abrir({
      monitoring: true,
      position: { lat: 1, lng: 2, accuracy: 12.4, at: AGORA - 30_000 },
      fences: [{ id: 'a', title: 'Mercado' }],
      insideIds: ['a'],
      nearest: { fence: { title: 'Mercado' }, meters: 120 },
    });
    expect(screen.getByText('há 30s')).toBeTruthy();
    expect(screen.getByText('± 12 m')).toBeTruthy();
    expect(screen.getByText('Mais próximo')).toBeTruthy();
    expect(screen.getByText('Mercado · 120 m')).toBeTruthy();
    expect(screen.getByText('Dentro do raio agora')).toBeTruthy();
    // a tela se atualiza sozinha
    await act(async () => { jest.advanceTimersByTime(motion.duration.relogio * 4); });
    expect(screen.getByText('há 2 min')).toBeTruthy(); // 30 s + 60 s = 90 s, que arredonda para 2 min
  });

  it('desligado não mostra "Dentro do raio agora" nem "Mais próximo", mesmo que a vigia tenha deixado lembretes dentro do raio', async () => {
    await abrir({ monitoring: false, insideIds: ['a'], fences: [{ id: 'a', title: 'Mercado' }], nearest: { fence: { title: 'Mercado' }, meters: 120 } });
    expect(screen.queryByText('Dentro do raio agora')).toBeNull();
    expect(screen.queryByText('Mais próximo')).toBeNull();
    expect(screen.getByText('Lembretes monitorados')).toBeTruthy();
  });

  it('ao sair da tela o relógio da "última posição" para: sem isso ele seguiria atualizando uma tela que não existe', async () => {
    const criar = jest.spyOn(global, 'setInterval');
    const limpar = jest.spyOn(global, 'clearInterval');
    const { unmount } = await abrir({ monitoring: true, position: { lat: 1, lng: 2, accuracy: 10, at: AGORA - 30_000 } });
    const indice = criar.mock.calls.findIndex(([, espera]) => espera === motion.duration.relogio);
    expect(indice).toBeGreaterThanOrEqual(0);
    const relogio = criar.mock.results[indice].value;
    expect(limpar).not.toHaveBeenCalledWith(relogio);
    await unmount();
    expect(limpar).toHaveBeenCalledWith(relogio);
  });

  it('monitorando e sem posição ainda: a última posição é "nunca"', async () => {
    await abrir({ monitoring: true });
    expect(screen.getByText('nunca')).toBeTruthy();
  });

  it('o erro de localização aparece num aviso vermelho com o texto do erro', async () => {
    await abrir({ geoError: 'Permissão de localização negada. Libere nos ajustes do aparelho.' });
    expect(screen.getByText('Permissão de localização negada. Libere nos ajustes do aparelho.')).toBeTruthy();
    expect(screen.getByTestId('icone-triangle-alert', { includeHiddenElements: true })).toBeTruthy();
  });

  it('a última chegada vira um aviso informativo com o quanto faz', async () => {
    await abrir({ arrivals: [{ id: 'a', title: 'Mercado', at: AGORA - 5 * 60_000 }, { id: 'b', title: 'Academia', at: AGORA - 60 * 60_000 }] });
    expect(screen.getByText('Último aviso: Mercado (há 5 min).')).toBeTruthy();
  });
});

describe('Configurações: o aviso de chegada com o app fechado (geofence do sistema)', () => {
  it('ativo: diz que o sistema avisa mesmo com o app fechado, com o alcance real (minutos e raio mínimo)', async () => {
    await abrir({ notifModo: 'sistema', segundoPlano: { estado: 'ativo', permissao: 'concedida' }, fences: [{ id: '1', title: 'Padaria' }] });
    expect(screen.getByText('Com o app fechado: ativo. O sistema do aparelho avisa quando você chega.')).toBeTruthy();
    expect(screen.getByText(/costuma levar alguns minutos/)).toBeTruthy();
    expect(screen.getByText(/raio mínimo é de 100 m/)).toBeTruthy();
    expect(screen.queryByText('App fechado:')).toBeNull(); // a linha antiga ("o monitoramento para") deixou de ser verdade
  });

  it('falta a permissão "o tempo todo": explica e oferece o botão que a pede', async () => {
    await abrir({ notifModo: 'sistema', segundoPlano: { estado: 'sem-permissao', permissao: 'pendente' }, fences: [{ id: '1', title: 'Padaria' }] });
    expect(screen.getByText('Para avisar com o app fechado, permita a localização "o tempo todo" (no iPhone, "Sempre").')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Permitir localização o tempo todo' }));
    expect(pedirPermissaoDeSegundoPlano).toHaveBeenCalledTimes(1);
  });

  it('permissão negada de vez: só os ajustes do aparelho resolvem, sem botão', async () => {
    await abrir({ notifModo: 'sistema', segundoPlano: { estado: 'sem-permissao', permissao: 'negada' }, fences: [{ id: '1', title: 'Padaria' }] });
    expect(screen.getByText('A localização "o tempo todo" está bloqueada: libere nos ajustes do aparelho para o aviso funcionar com o app fechado.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Permitir localização o tempo todo' })).toBeNull();
  });

  it('no Expo Go (sem tarefa em segundo plano) diz que precisa do app instalado', async () => {
    await abrir({ notifModo: 'sistema', segundoPlano: { estado: 'indisponivel' } });
    expect(screen.getByText('No Expo Go o aviso com o app fechado não funciona: precisa do app instalado (build próprio).')).toBeTruthy();
  });

  it('na web o navegador não acompanha localização com a aba fechada, e diz', async () => {
    await abrir({ notifModo: 'so-com-o-app-aberto', segundoPlano: { estado: 'indisponivel' } });
    expect(screen.getByText('Na web o aviso de chegada só funciona com o app aberto: o navegador não acompanha a localização com a aba fechada.')).toBeTruthy();
  });

  it('erro ao ativar: diz que não conseguiu', async () => {
    await abrir({ notifModo: 'sistema', segundoPlano: { estado: 'erro', permissao: 'concedida' }, fences: [{ id: '1', title: 'Padaria' }] });
    expect(screen.getByText('Não foi possível ativar o aviso com o app fechado. Tente reabrir o app.')).toBeTruthy();
  });

  it('sem lembrete por local não há o que dizer sobre o app fechado', async () => {
    await abrir({ notifModo: 'sistema', segundoPlano: { estado: 'sem-lugares', permissao: 'concedida' }, fences: [] });
    expect(screen.queryByText(/Com o app fechado/)).toBeNull();
  });
});

describe('Configurações: notificações na web (só com o app aberto)', () => {
  const web = { notifSupported: true, notifModo: 'so-com-o-app-aberto' as const };

  it('diz com franqueza que os avisos só chegam com o app aberto, em vez de "não disponível"', async () => {
    await abrir({ ...web, notifOk: false, permissaoDoNavegador: 'pendente', scheduledCount: 2 });
    expect(screen.getByText('Avisos na tela enquanto o app está aberto.')).toBeTruthy();
    expect(screen.getByText('No navegador os avisos só chegam com o app aberto: com a aba fechada nada é entregue.')).toBeTruthy();
    expect(screen.queryByText('Não estão disponíveis na versão web.')).toBeNull();
    expect(screen.getByText('Avisos por horário nas próximas 24 h')).toBeTruthy();
    expect(screen.queryByText(/libere-as nos ajustes do aparelho/)).toBeNull();
  });

  it('permissão pendente: oferece o botão que pede a permissão do navegador (ele exige um toque)', async () => {
    await abrir({ ...web, notifOk: false, permissaoDoNavegador: 'pendente' });
    await fireEvent.press(screen.getByRole('button', { name: 'Permitir avisos do navegador' }));
    expect(requestPermission).toHaveBeenCalledTimes(1);
  });

  it('permitida: só confirma, sem botão', async () => {
    await abrir({ ...web, notifOk: true, permissaoDoNavegador: 'concedida' });
    expect(screen.getByText('Avisos do navegador permitidos.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Permitir avisos do navegador' })).toBeNull();
  });

  it('bloqueada: diz onde liberar', async () => {
    await abrir({ ...web, notifOk: false, permissaoDoNavegador: 'negada' });
    expect(screen.getByText('Os avisos do navegador estão bloqueados para este site: libere nas configurações do site.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Permitir avisos do navegador' })).toBeNull();
  });

  it('navegador sem a API (Safari do iPhone fora do app instalado): explica e diz que os avisos seguem na tela do app', async () => {
    await abrir({ ...web, notifOk: false, permissaoDoNavegador: 'indisponivel' });
    expect(screen.getByText('Este navegador não mostra avisos do sistema (no iPhone só com o app instalado na tela de início). Os avisos aparecem na tela do app.')).toBeTruthy();
  });
});

describe('Configurações: notificações e limites', () => {
  it('permitida: diz o estado e mostra quantos avisos por horário estão agendados', async () => {
    await abrir({ notifOk: true, scheduledCount: 3 });
    expect(screen.getByRole('header', { name: 'Notificações' })).toBeTruthy();
    expect(screen.getByText('Estado: permitida.')).toBeTruthy();
    expect(screen.getByText('Avisos por horário agendados')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('não permitida: diz o estado e avisa em vermelho como liberar', async () => {
    await abrir({ notifOk: false });
    expect(screen.getByText('Estado: não permitida.')).toBeTruthy();
    expect(screen.getByText('As notificações não estão permitidas. Para receber avisos, libere-as nos ajustes do aparelho.')).toBeTruthy();
  });

  it('na web (sem notificações locais, e por isso sem permissão) diz que não está disponível, sem aviso vermelho e sem falar em agendados', async () => {
    await abrir({ notifSupported: false, notifOk: false });
    expect(screen.getByText('Não estão disponíveis na versão web.')).toBeTruthy();
    expect(screen.queryByText(/não estão permitidas/)).toBeNull();
    expect(screen.queryByText('Avisos por horário agendados')).toBeNull();
  });

  it('o cartão "Até onde vai o monitoramento" tem os três cenários', async () => {
    await abrir();
    expect(screen.getByRole('header', { name: 'Até onde vai o monitoramento' })).toBeTruthy();
    expect(screen.getByText('App aberto:', { exact: false })).toBeTruthy();
    expect(screen.getByText('App aberto e minimizado:', { exact: false })).toBeTruthy();
    expect(screen.getByText('App fechado:', { exact: false })).toBeTruthy();
  });
});

describe('Configurações: privacidade, chegadas e excluir conta', () => {
  it('a política de privacidade abre a página', async () => {
    await abrir();
    await fireEvent.press(screen.getByRole('button', { name: 'Abrir' }));
    expect(router.push).toHaveBeenCalledWith('/privacidade');
  });

  it('as últimas chegadas mostram até cinco, com a hora e o lugar', async () => {
    const chegadas = Array.from({ length: 7 }, (_, i) => ({ id: `${i}`, title: `Lugar ${i}`, at: AGORA - i * 60_000, place: i === 0 ? 'Rua A' : undefined }));
    await abrir({ arrivals: chegadas });
    expect(screen.getByRole('header', { name: 'Últimas chegadas' })).toBeTruthy();
    expect(screen.getByText('Lugar 4')).toBeTruthy();
    expect(screen.queryByText('Lugar 5')).toBeNull();
    expect(screen.getByText(/Rua A/)).toBeTruthy();
  });

  it('sem chegadas o cartão não aparece', async () => {
    await abrir();
    expect(screen.queryByRole('header', { name: 'Últimas chegadas' })).toBeNull();
  });

  it('excluir conta pede confirmação; se a pessoa desistir nada acontece', async () => {
    jest.mocked(confirmar).mockResolvedValue(false);
    await abrir();
    await fireEvent.press(screen.getByRole('button', { name: 'Excluir minha conta' }));
    expect(confirmar).toHaveBeenCalledWith('Excluir sua conta?', expect.stringContaining('apagados para sempre'), 'Excluir conta');
    expect(excluirConta).not.toHaveBeenCalled();
  });

  it('confirmando, exclui; se o servidor recusar, mostra o erro e libera o botão', async () => {
    jest.mocked(confirmar).mockResolvedValue(true);
    excluirConta.mockResolvedValue('Não foi possível excluir a conta.');
    await abrir();
    await fireEvent.press(screen.getByRole('button', { name: 'Excluir minha conta' }));
    expect(excluirConta).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Não foi possível excluir a conta.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Excluir minha conta' })).toBeEnabled();
  });

  it('enquanto exclui o botão diz "Excluindo..." e o Sair fica travado', async () => {
    jest.mocked(confirmar).mockResolvedValue(true);
    let terminar: (erro: string | null) => void = () => {};
    excluirConta.mockReturnValue(new Promise((ok) => { terminar = ok; }));
    await abrir();
    await fireEvent.press(screen.getByRole('button', { name: 'Excluir minha conta' }));
    expect(screen.getByRole('button', { name: 'Excluindo...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Sair' })).toBeDisabled();
    await act(async () => { terminar(null); });
  });
});
