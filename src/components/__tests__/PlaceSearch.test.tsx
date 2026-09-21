import '@testing-library/react-native/matchers';
import { act, fireEvent, render, screen, within } from '@testing-library/react-native';
import { colors, shadow, size } from '../../design/tokens';
import type { Lugar } from '../../lib/geocodificar';
import { ESPERA_DA_BUSCA, PlaceSearch } from '../PlaceSearch';

const mercado: Lugar = { nome: 'Supermercado Frangolândia', detalhe: 'Avenida Washington Soares, Fortaleza', lat: -3.7566, lng: -38.4891 };
const outro: Lugar = { nome: 'Praça Central', detalhe: '', lat: -3.7, lng: -38.5 };

beforeEach(() => { jest.useFakeTimers(); });
afterEach(() => { jest.useRealTimers(); });

const esperar = async (ms: number) => { await act(async () => { jest.advanceTimersByTime(ms); }); };

async function abrir(resposta: Lugar[] | Error = [mercado, outro]) {
  const buscar = jest.fn(async (_c: string, opcoes?: { sinal?: AbortSignal }) => {
    void opcoes;
    if (resposta instanceof Error) throw resposta;
    return resposta;
  });
  const acoes = { onChangeText: jest.fn(), onPick: jest.fn() };
  await render(<PlaceSearch value="" buscar={buscar as never} {...acoes} />);
  return { buscar, ...acoes };
}

const digitar = async (texto: string) => { await fireEvent.changeText(screen.getByLabelText('Endereço do lembrete'), texto); };

describe('PlaceSearch', () => {
  it('campo branco com lupa e o texto de exemplo', async () => {
    await abrir();
    const campo = screen.getByLabelText('Endereço do lembrete');
    expect(campo).toHaveProp('placeholder', 'Buscar endereço, lugar ou toque no mapa');
    expect(campo).toHaveProp('placeholderTextColor', colors.text.placeholder);
    expect(screen.getByTestId('icone-search', { includeHiddenElements: true })).toBeTruthy();
  });

  it('cada letra digitada é avisada, mas a busca só sai 650 ms depois da última', async () => {
    const { buscar, onChangeText } = await abrir();
    await digitar('merc');
    expect(onChangeText).toHaveBeenCalledWith('merc');
    await esperar(ESPERA_DA_BUSCA - 50);
    expect(buscar).not.toHaveBeenCalled();
    await digitar('mercado');
    await esperar(ESPERA_DA_BUSCA - 50); // a espera recomeçou
    expect(buscar).not.toHaveBeenCalled();
    await esperar(60);
    expect(buscar).toHaveBeenCalledTimes(1);
    expect(buscar.mock.calls[0][0]).toBe('mercado');
  });

  it('com menos de 3 letras não busca e fecha a lista', async () => {
    const { buscar } = await abrir();
    await digitar('me');
    await esperar(2000);
    expect(buscar).not.toHaveBeenCalled();
    expect(screen.queryByTestId('sugestoes')).toBeNull();
  });

  it('mostra as sugestões com o nome em negrito e o resto do endereço embaixo', async () => {
    await abrir();
    await digitar('mercado');
    await esperar(ESPERA_DA_BUSCA + 10);
    expect(screen.getByText('Supermercado Frangolândia')).toBeTruthy();
    expect(screen.getByText('Avenida Washington Soares, Fortaleza')).toBeTruthy();
    expect(screen.getByText('Praça Central')).toBeTruthy();
    expect(screen.getByTestId('sugestoes')).toHaveStyle({ boxShadow: shadow.suggestions, maxHeight: size.suggestions.maxHeight, backgroundColor: colors.bg.field });
  });

  it('escolher uma sugestão avisa o lugar e fecha a lista', async () => {
    const { onPick } = await abrir();
    await digitar('mercado');
    await esperar(ESPERA_DA_BUSCA + 10);
    await fireEvent.press(screen.getByRole('button', { name: 'Supermercado Frangolândia, Avenida Washington Soares, Fortaleza' }));
    expect(onPick).toHaveBeenCalledWith(mercado);
    expect(screen.queryByTestId('sugestoes')).toBeNull();
  });

  it('a sugestão sem detalhe mostra só o nome', async () => {
    await abrir([outro]);
    await digitar('praca');
    await esperar(ESPERA_DA_BUSCA + 10);
    const item = screen.getByRole('button', { name: 'Praça Central' });
    expect(within(item).getByText('Praça Central')).toBeTruthy();
    expect(within(item).queryAllByText('')).toHaveLength(0); // sem linha vazia embaixo
  });

  it('sem resultado não mostra nada (nem a mensagem de erro)', async () => {
    await abrir([]);
    await digitar('xyzxyz');
    await esperar(ESPERA_DA_BUSCA + 10);
    expect(screen.queryByTestId('sugestoes')).toBeNull();
    expect(screen.queryByText('Não foi possível buscar agora.')).toBeNull();
  });

  it('se o serviço falhar, diz "Não foi possível buscar agora." na própria lista', async () => {
    await abrir(new Error('fora do ar'));
    await digitar('mercado');
    await esperar(ESPERA_DA_BUSCA + 10);
    expect(screen.getByText('Não foi possível buscar agora.')).toBeTruthy();
    expect(screen.getByRole('alert')).toBeTruthy();
  });

  it('digitar de novo cancela o pedido que estava em andamento e descarta a resposta velha', async () => {
    const sinais: AbortSignal[] = [];
    let terminarPrimeiro: (l: Lugar[]) => void = () => {};
    const buscar = jest.fn((consulta: string, opcoes?: { sinal?: AbortSignal }) => {
      if (opcoes?.sinal) sinais.push(opcoes.sinal);
      if (consulta === 'merc1') return new Promise<Lugar[]>((resolve) => { terminarPrimeiro = resolve; });
      return Promise.resolve([outro]);
    });
    await render(<PlaceSearch value="" buscar={buscar as never} onChangeText={jest.fn()} onPick={jest.fn()} />);
    await digitar('merc1');
    await esperar(ESPERA_DA_BUSCA + 10);
    await digitar('praca');
    expect(sinais[0].aborted).toBe(true);
    await act(async () => { terminarPrimeiro([mercado]); });
    expect(screen.queryByText('Supermercado Frangolândia')).toBeNull(); // a resposta velha chegou fora de hora e foi descartada
    await esperar(ESPERA_DA_BUSCA + 10);
    expect(screen.queryByText('Supermercado Frangolândia')).toBeNull();
    expect(screen.getByText('Praça Central')).toBeTruthy();
  });

  it('sair do campo fecha a lista depois de um instante e voltar reabre as mesmas sugestões', async () => {
    await abrir();
    await digitar('mercado');
    await esperar(ESPERA_DA_BUSCA + 10);
    const campo = screen.getByLabelText('Endereço do lembrete');
    await fireEvent(campo, 'blur');
    expect(screen.queryByTestId('sugestoes')).not.toBeNull(); // ainda dá tempo de tocar numa sugestão
    await esperar(150);
    expect(screen.queryByTestId('sugestoes')).not.toBeNull();
    await esperar(100);
    expect(screen.queryByTestId('sugestoes')).toBeNull();
    await fireEvent(campo, 'focus');
    expect(screen.getByTestId('sugestoes')).toBeTruthy();
  });

  it('apagar até menos de 3 letras esconde as sugestões', async () => {
    await abrir();
    await digitar('mercado');
    await esperar(ESPERA_DA_BUSCA + 10);
    await digitar('me');
    expect(screen.queryByTestId('sugestoes')).toBeNull();
  });
});

describe('PlaceSearch: aviso de lista aberta', () => {
  async function abrirComAviso(resposta: Lugar[] | Error = [mercado, outro]) {
    const aoMudarSugestoes = jest.fn();
    const buscar = jest.fn(async () => { if (resposta instanceof Error) throw resposta; return resposta; });
    await render(<PlaceSearch value="" buscar={buscar as never} onChangeText={jest.fn()} onPick={jest.fn()} aoMudarSugestoes={aoMudarSugestoes} />);
    return aoMudarSugestoes;
  }

  it('avisa que a lista está fechada ao começar, aberta quando as sugestões chegam e fechada de novo ao escolher uma', async () => {
    const aviso = await abrirComAviso();
    expect(aviso).toHaveBeenLastCalledWith(false);
    await digitar('mercado');
    await esperar(ESPERA_DA_BUSCA + 10);
    expect(aviso).toHaveBeenLastCalledWith(true);
    await fireEvent.press(screen.getByRole('button', { name: 'Supermercado Frangolândia, Avenida Washington Soares, Fortaleza' }));
    expect(aviso).toHaveBeenLastCalledWith(false);
  });

  it('a mensagem de falha também é uma lista aberta (cobre o mapa do mesmo jeito)', async () => {
    const aviso = await abrirComAviso(new Error('sem rede'));
    await digitar('mercado');
    await esperar(ESPERA_DA_BUSCA + 10);
    expect(screen.getByText('Não foi possível buscar agora.')).toBeTruthy();
    expect(aviso).toHaveBeenLastCalledWith(true);
  });

  it('avisa que fechou quando a pessoa sai do campo (depois da espera para o toque numa sugestão chegar) e quando apaga o texto', async () => {
    const aviso = await abrirComAviso();
    await digitar('mercado');
    await esperar(ESPERA_DA_BUSCA + 10);
    await fireEvent(screen.getByLabelText('Endereço do lembrete'), 'blur');
    expect(aviso).toHaveBeenLastCalledWith(true); // ainda não: o toque na sugestão pode estar chegando
    await esperar(250);
    expect(aviso).toHaveBeenLastCalledWith(false);
    await fireEvent(screen.getByLabelText('Endereço do lembrete'), 'focus');
    expect(aviso).toHaveBeenLastCalledWith(true);
    await digitar('me');
    expect(aviso).toHaveBeenLastCalledWith(false);
  });
});

