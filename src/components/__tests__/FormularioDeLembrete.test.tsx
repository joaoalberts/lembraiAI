import '@testing-library/react-native/matchers';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { StyleSheet } from 'react-native';
import { colors, fontFamily } from '../../design/tokens';
import type { Reminder } from '../../data/reminders';
import { nomeDoPonto } from '../../lib/geocodificar';
import { comAreaSegura } from '../../test-utils/area-segura';
import { useGeo } from '../../state/geo';
import { useReminders } from '../../state/reminders';
import { FormularioDeLembrete } from '../FormularioDeLembrete';

jest.mock('expo-router', () => ({ router: { back: jest.fn(), navigate: jest.fn(), replace: jest.fn(), canGoBack: jest.fn() } }));
jest.mock('../../state/reminders', () => ({ useReminders: jest.fn() }));
jest.mock('../../state/geo', () => ({ useGeo: jest.fn() }));
jest.mock('../../lib/geocodificar', () => ({
  MINIMO_DE_LETRAS: 3,
  buscarLugares: jest.fn(async () => [{ nome: 'Supermercado Frangolândia', detalhe: 'Fortaleza', lat: -3.7566, lng: -38.4891 }]),
  nomeDoPonto: jest.fn(async () => 'Avenida Washington Soares'),
}));
// o mapa é um componente DOM (Leaflet): nos testes vira botões que fazem o que a pessoa faria nele
jest.mock('../MapaDeEscolha', () => {
  const { Pressable, Text } = jest.requireActual('react-native');
  return {
    MapaDeEscolha: (p: { escolha: { lat: number; lng: number; raio: number } | null; aoEscolher: (a: number, b: number) => void; aoUsarLocalizacao: () => void; localizando: boolean; enquadrar?: number }) => (
      <>
        <Pressable accessibilityLabel="mapa: tocar em -3,7 e -38,5" onPress={() => p.aoEscolher(-3.7, -38.5)}><Text>mapa</Text></Pressable>
        <Pressable accessibilityLabel="mapa: usar minha localização" onPress={p.aoUsarLocalizacao}><Text>{p.localizando ? 'Localizando…' : 'Usar minha localização'}</Text></Pressable>
        <Text testID="mapa-estado">{JSON.stringify({ escolha: p.escolha, enquadrar: p.enquadrar ?? 0 })}</Text>
      </>
    ),
  };
});

const criado: Reminder = { id: 'novo-1', title: 'Reunião', category: 'purple', icon: 'users', kind: 'time', dateISO: '2026-09-21', time: '09:00', repeat: 'never', active: true };
const acoes = { create: jest.fn(), update: jest.fn() };
const geo = { position: null, getCurrentPosition: jest.fn() };

beforeEach(() => {
  jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
  jest.setSystemTime(new Date(2026, 8, 21, 10));
  jest.clearAllMocks();
  acoes.create.mockResolvedValue(criado);
  acoes.update.mockResolvedValue(criado);
  jest.mocked(useReminders).mockReturnValue(acoes as unknown as ReturnType<typeof useReminders>);
  jest.mocked(useGeo).mockReturnValue(geo as unknown as ReturnType<typeof useGeo>);
  jest.mocked(router.canGoBack).mockReturnValue(true);
});
afterEach(() => { jest.useRealTimers(); });

const abrir = (lembrete?: Reminder) => render(comAreaSegura(<FormularioDeLembrete lembrete={lembrete} />, { top: 0 }));
const esperar = async (ms: number) => { await act(async () => { jest.advanceTimersByTime(ms); }); };
const escrever = async (texto: string) => { await fireEvent.changeText(screen.getByLabelText('Descrição'), texto); };
const salvar = async (nome = 'Criar lembrete') => { await fireEvent.press(screen.getByRole('button', { name: nome })); };

const porLocal: Reminder = { id: 'l1', title: 'Comprar leite', category: 'green', icon: 'cart', kind: 'local', place: 'Mercado da esquina', lat: -3.75, lng: -38.48, radius: 300, dateISO: '2026-09-25', time: '18:30', repeat: 'weekly', active: true };

describe('Formulário: criar por data e horário', () => {
  it('abre com hoje, 09:00 e sem repetir, no modo por data e horário, com o botão "Criar lembrete"', async () => {
    await abrir();
    expect(screen.getByRole('header', { name: 'Novo lembrete' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Data do lembrete' })).toBeTruthy();
    expect(screen.getByText('Seg, 21 de set de 2026')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Horário do lembrete: 09:00' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Repetir: Nunca' })).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'Por data e horário' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Por local' })).not.toBeChecked();
    expect(screen.getByRole('button', { name: 'Criar lembrete' })).toBeTruthy();
    expect(screen.queryByLabelText('Endereço do lembrete')).toBeNull(); // o mapa só aparece com o local ligado
  });

  it('cria com a descrição aparada e leva à tela de sucesso com o id do novo lembrete', async () => {
    await abrir();
    await escrever('  Reunião  ');
    await salvar();
    expect(acoes.create).toHaveBeenCalledTimes(1);
    expect(acoes.create).toHaveBeenCalledWith({ title: 'Reunião', kind: 'time', dateISO: '2026-09-21', time: '09:00', repeat: 'never', place: '', lat: undefined, lng: undefined, radius: 150 });
    expect(router.replace).toHaveBeenCalledWith({ pathname: '/sucesso', params: { id: 'novo-1' } });
    expect(acoes.update).not.toHaveBeenCalled();
  });

  it('sem descrição não salva e diz o que falta, embaixo do campo; digitar apaga o aviso', async () => {
    await abrir();
    await salvar();
    expect(screen.getByText('Dê uma descrição ao lembrete.')).toBeTruthy();
    expect(acoes.create).not.toHaveBeenCalled();
    expect(screen.queryByText('Escreva de forma curta e direta.')).toBeNull();
    await escrever('a');
    expect(screen.queryByText('Dê uma descrição ao lembrete.')).toBeNull();
    expect(screen.getByText('Escreva de forma curta e direta.')).toBeTruthy();
  });

  it('a descrição aceita no máximo 80 caracteres', async () => {
    await abrir();
    expect(screen.getByLabelText('Descrição')).toHaveProp('maxLength', 80);
  });

  it('a repetição escolhida na folha entra no lembrete e aparece no campo em destaque', async () => {
    await abrir();
    await fireEvent.press(screen.getByRole('button', { name: 'Repetir: Nunca' }));
    await fireEvent.press(screen.getByRole('radio', { name: 'Toda semana' }));
    expect(screen.getByRole('button', { name: 'Repetir: Toda semana' })).toBeTruthy();
    expect(StyleSheet.flatten(screen.getByText('Toda semana').props.style)).toMatchObject({ color: colors.text.accent, fontFamily: fontFamily.bold });
    await escrever('Reunião');
    await salvar();
    expect(acoes.create).toHaveBeenCalledWith(expect.objectContaining({ repeat: 'weekly' }));
  });

  it('a data escolhida no calendário entra no lembrete e aparece no campo', async () => {
    await abrir();
    await fireEvent.press(screen.getByRole('button', { name: 'Data do lembrete' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Sex, 25 de set de 2026' }));
    expect(screen.getByText('Sex, 25 de set de 2026')).toBeTruthy();
    await escrever('Reunião');
    await salvar();
    expect(acoes.create).toHaveBeenCalledWith(expect.objectContaining({ dateISO: '2026-09-25' }));
  });

  it('a folha de horário abre pelo campo Horário', async () => {
    await abrir();
    await fireEvent.press(screen.getByRole('button', { name: 'Horário do lembrete: 09:00' }));
    expect(screen.getByText('Role a hora e os minutos. O horário é salvo ao escolher.')).toBeTruthy();
  });

  it('enquanto salva o botão diz "Salvando…" e não aceita outro toque', async () => {
    let terminar: (r: Reminder) => void = () => {};
    acoes.create.mockReturnValue(new Promise<Reminder>((resolve) => { terminar = resolve; }));
    await abrir();
    await escrever('Reunião');
    await salvar();
    const botao = screen.getByRole('button', { name: 'Salvando…' });
    expect(botao).toBeDisabled();
    await fireEvent.press(botao);
    expect(acoes.create).toHaveBeenCalledTimes(1);
    await act(async () => { terminar(criado); });
  });

  it('se o banco recusar, mostra o aviso no topo, não sai da tela e libera o botão', async () => {
    acoes.create.mockResolvedValue(null);
    await abrir();
    await escrever('Reunião');
    await salvar();
    expect(screen.getByText('Não foi possível salvar o lembrete. Tente de novo.')).toBeTruthy();
    expect(router.replace).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Criar lembrete' })).toBeEnabled();
  });

  it('"Voltar" volta para a tela anterior, ou para a lista se não há anterior; a conta leva às configurações', async () => {
    await abrir();
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(router.back).toHaveBeenCalledTimes(1);
    jest.mocked(router.canGoBack).mockReturnValue(false);
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(router.navigate).toHaveBeenCalledWith('/');
    await fireEvent.press(screen.getByRole('button', { name: 'Minha conta' }));
    expect(router.navigate).toHaveBeenCalledWith('/config');
  });

  it('o bloco de títulos não intercepta toque, e isso vai no estilo: a prop `pointerEvents` é obsoleta na web e avisa no console', async () => {
    await abrir();
    const titulos = screen.getByText('Novo lembrete').parent!;
    expect(StyleSheet.flatten(titulos.props.style)).toMatchObject({ pointerEvents: 'none' });
    expect(titulos.props).not.toHaveProperty('pointerEvents');
  });
});

describe('Formulário: por local', () => {
  const ligarOLocal = async () => { await fireEvent.press(screen.getByRole('radio', { name: 'Por local' })); };
  const tocarNoMapa = async () => { await fireEvent.press(screen.getByLabelText('mapa: tocar em -3,7 e -38,5')); };

  it('ligar o local mostra a busca, o mapa e o raio, e esmaece o horário, que deixa de responder', async () => {
    await abrir();
    await ligarOLocal();
    expect(screen.getByLabelText('Endereço do lembrete')).toBeTruthy();
    expect(screen.getByLabelText('mapa: usar minha localização')).toBeTruthy();
    expect(screen.getByText('Raio de notificação')).toBeTruthy();
    expect(screen.getByText('150 m')).toBeTruthy();
    expect(screen.getByText('Você será avisado ao entrar no raio selecionado.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Horário do lembrete: 09:00' })).toBeDisabled();
    expect(screen.getByRole('switch', { name: 'Definir um local' })).toBeChecked();
  });

  it('o interruptor do local e o cartão "Por local" andam juntos', async () => {
    await abrir();
    await fireEvent.press(screen.getByRole('switch', { name: 'Definir um local' }));
    expect(screen.getByRole('radio', { name: 'Por local' })).toBeChecked();
    await fireEvent.press(screen.getByRole('switch', { name: 'Definir um local' }));
    expect(screen.getByRole('radio', { name: 'Por data e horário' })).toBeChecked();
    expect(screen.queryByLabelText('Endereço do lembrete')).toBeNull();
  });

  it('por local sem ponto escolhido não salva e diz o que fazer', async () => {
    await abrir();
    await escrever('Comprar leite');
    await ligarOLocal();
    await salvar();
    expect(screen.getByText('Escolha o local no mapa ou busque um endereço.')).toBeTruthy();
    expect(acoes.create).not.toHaveBeenCalled();
  });

  it('o aviso "escolha o local" some ao trocar de modo (não reaparece quando a pessoa volta ao local)', async () => {
    await abrir();
    await escrever('Comprar leite');
    await ligarOLocal();
    await salvar();
    expect(screen.getByText('Escolha o local no mapa ou busque um endereço.')).toBeTruthy();
    await fireEvent.press(screen.getByRole('radio', { name: 'Por data e horário' }));
    await ligarOLocal();
    expect(screen.queryByText('Escolha o local no mapa ou busque um endereço.')).toBeNull();
    expect(screen.getByText('Você será avisado ao entrar no raio selecionado.')).toBeTruthy();
  });

  it('tocar no mapa escolhe o ponto, e o nome do lugar vem do serviço 700 ms depois', async () => {
    await abrir();
    await escrever('Comprar leite');
    await ligarOLocal();
    await tocarNoMapa();
    expect(JSON.parse(screen.getByTestId('mapa-estado').props.children).escolha).toEqual({ lat: -3.7, lng: -38.5, raio: 150 });
    expect(nomeDoPonto).not.toHaveBeenCalled();
    await esperar(600);
    expect(nomeDoPonto).not.toHaveBeenCalled(); // ainda dentro dos 700 ms
    await esperar(150);
    expect(nomeDoPonto).toHaveBeenCalledWith(-3.7, -38.5, expect.anything());
    expect(screen.getByLabelText('Endereço do lembrete')).toHaveProp('value', 'Avenida Washington Soares');
    await salvar();
    expect(acoes.create).toHaveBeenCalledWith(expect.objectContaining({ kind: 'local', lat: -3.7, lng: -38.5, radius: 150, place: 'Avenida Washington Soares' }));
  });

  it('se o serviço não souber o nome, o texto que estava no campo fica', async () => {
    jest.mocked(nomeDoPonto).mockResolvedValueOnce(null);
    await abrir();
    await ligarOLocal();
    await fireEvent.changeText(screen.getByLabelText('Endereço do lembrete'), 'meu lugar');
    await tocarNoMapa();
    await esperar(750);
    expect(screen.getByLabelText('Endereço do lembrete')).toHaveProp('value', 'meu lugar');
  });

  it('escolher uma sugestão da busca põe o pino no lugar, preenche o nome e pede para o mapa enquadrar', async () => {
    await abrir();
    await ligarOLocal();
    await fireEvent.changeText(screen.getByLabelText('Endereço do lembrete'), 'mercado');
    await esperar(700);
    await fireEvent.press(screen.getByRole('button', { name: 'Supermercado Frangolândia, Fortaleza' }));
    expect(screen.getByLabelText('Endereço do lembrete')).toHaveProp('value', 'Supermercado Frangolândia');
    expect(JSON.parse(screen.getByTestId('mapa-estado').props.children)).toEqual({ escolha: { lat: -3.7566, lng: -38.4891, raio: 150 }, enquadrar: 1 });
    expect(nomeDoPonto).not.toHaveBeenCalled(); // o nome já veio da busca
  });

  it('"Usar minha localização" põe o pino onde a pessoa está e enquadra o mapa', async () => {
    geo.getCurrentPosition.mockResolvedValue({ lat: -3.71, lng: -38.51, accuracy: 20, at: 1 });
    await abrir();
    await ligarOLocal();
    await fireEvent.press(screen.getByLabelText('mapa: usar minha localização'));
    expect(JSON.parse(screen.getByTestId('mapa-estado').props.children)).toEqual({ escolha: { lat: -3.71, lng: -38.51, raio: 150 }, enquadrar: 1 });
  });

  it('enquanto lê a posição a pílula diz "Localizando…"', async () => {
    let responder: (p: null) => void = () => {};
    geo.getCurrentPosition.mockReturnValue(new Promise((resolve) => { responder = resolve; }));
    await abrir();
    await ligarOLocal();
    await fireEvent.press(screen.getByLabelText('mapa: usar minha localização'));
    expect(screen.getByText('Localizando…')).toBeTruthy();
    await act(async () => { responder(null); });
    expect(screen.getByText('Usar minha localização')).toBeTruthy();
  });

  it('sem permissão de localização avisa no lugar da dica, em vermelho', async () => {
    geo.getCurrentPosition.mockResolvedValue(null);
    await abrir();
    await ligarOLocal();
    await fireEvent.press(screen.getByLabelText('mapa: usar minha localização'));
    expect(screen.getByText('Não consegui ler sua localização. Verifique a permissão nos ajustes do aparelho.')).toBeTruthy();
    expect(screen.queryByText('Você será avisado ao entrar no raio selecionado.')).toBeNull();
  });

  it('o raio do controle deslizante vai para o lembrete', async () => {
    await abrir();
    await escrever('Comprar leite');
    await ligarOLocal();
    await tocarNoMapa();
    await fireEvent(screen.getByTestId('slider'), 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });
    expect(screen.getByText('160 m')).toBeTruthy();
    await salvar();
    expect(acoes.create).toHaveBeenCalledWith(expect.objectContaining({ radius: 160 }));
  });
});

describe('Formulário: editar', () => {
  it('abre preenchido, com o título "Editar lembrete" e o botão "Salvar alterações"', async () => {
    await abrir(porLocal);
    expect(screen.getByRole('header', { name: 'Editar lembrete' })).toBeTruthy();
    expect(screen.getByLabelText('Descrição')).toHaveProp('value', 'Comprar leite');
    expect(screen.getByRole('radio', { name: 'Por local' })).toBeChecked();
    expect(screen.getByLabelText('Endereço do lembrete')).toHaveProp('value', 'Mercado da esquina');
    expect(screen.getByText('300 m')).toBeTruthy();
    expect(screen.getByTestId('slider')).toHaveProp('accessibilityValue', expect.objectContaining({ now: 300 }));
    expect(screen.getByText('Sex, 25 de set de 2026')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Repetir: Toda semana' })).toBeTruthy();
    expect(JSON.parse(screen.getByTestId('mapa-estado').props.children).escolha).toEqual({ lat: -3.75, lng: -38.48, raio: 300 });
    expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeTruthy();
  });

  it('salvar chama update com o id, não create, e volta para de onde veio', async () => {
    await abrir(porLocal);
    await escrever('Comprar leite integral');
    await salvar('Salvar alterações');
    expect(acoes.update).toHaveBeenCalledWith('l1', expect.objectContaining({ title: 'Comprar leite integral', kind: 'local', lat: -3.75, lng: -38.48, radius: 300, place: 'Mercado da esquina', repeat: 'weekly', time: '18:30', dateISO: '2026-09-25' }));
    expect(acoes.create).not.toHaveBeenCalled();
    expect(router.back).toHaveBeenCalledTimes(1);
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('um raio maior que o do controle (criado em outro lugar) continua valendo: o texto mostra o de verdade e o controle para na ponta', async () => {
    await abrir({ ...porLocal, radius: 1000 });
    expect(screen.getByText('1000 m')).toBeTruthy();
    expect(screen.getByTestId('slider')).toHaveProp('accessibilityValue', expect.objectContaining({ now: 550, max: 550 }));
    await salvar('Salvar alterações');
    expect(acoes.update).toHaveBeenCalledWith('l1', expect.objectContaining({ radius: 1000 })); // salvar não encolhe o raio sozinho
  });

  it('editar um lembrete por horário abre no modo por data e horário, sem o mapa', async () => {
    await abrir({ ...porLocal, kind: 'time', place: undefined, lat: undefined, lng: undefined, radius: undefined });
    expect(screen.getByRole('radio', { name: 'Por data e horário' })).toBeChecked();
    expect(screen.queryByLabelText('Endereço do lembrete')).toBeNull();
  });

  it('se o banco recusar a edição, mostra o aviso e continua na tela', async () => {
    acoes.update.mockResolvedValue(null);
    await abrir(porLocal);
    await salvar('Salvar alterações');
    expect(screen.getByText('Não foi possível salvar o lembrete. Tente de novo.')).toBeTruthy();
    expect(router.back).not.toHaveBeenCalled();
  });
});
