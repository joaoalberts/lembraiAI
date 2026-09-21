import type { Reminder } from '../../data/reminders';
import { HORARIO_PADRAO, RAIO, estadoInicial, rascunhoDe, validar, type EstadoDoFormulario } from '../formulario';

beforeEach(() => { jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] }); jest.setSystemTime(new Date(2026, 8, 21, 10)); });
afterEach(() => { jest.useRealTimers(); });

const porLocal: Reminder = {
  id: '1', title: 'Comprar leite', category: 'green', icon: 'cart', kind: 'local', place: 'Mercado da esquina',
  lat: -3.75, lng: -38.48, radius: 300, dateISO: '2026-09-25', time: '18:30', repeat: 'weekly', active: true,
};
const porHorario: Reminder = { ...porLocal, id: '2', kind: 'time', place: undefined, lat: undefined, lng: undefined, radius: undefined, title: 'Tomar remédio' };

describe('estadoInicial', () => {
  it('novo lembrete: hoje, 09:00, por horário, sem repetir, raio padrão e nenhum ponto escolhido', () => {
    expect(estadoInicial()).toEqual({ title: '', modo: 'time', dateISO: '2026-09-21', time: HORARIO_PADRAO, repeat: 'never', place: '', coord: null, radius: RAIO.padrao });
  });

  it('editando um lembrete por local: abre preenchido com o ponto, o lugar e o raio dele', () => {
    expect(estadoInicial(porLocal)).toEqual({
      title: 'Comprar leite', modo: 'local', dateISO: '2026-09-25', time: '18:30', repeat: 'weekly', place: 'Mercado da esquina', coord: { lat: -3.75, lng: -38.48 }, radius: 300,
    });
  });

  it('editando um lembrete por horário: sem ponto e com o raio padrão', () => {
    expect(estadoInicial(porHorario)).toMatchObject({ modo: 'time', place: '', coord: null, radius: RAIO.padrao, time: '18:30' });
  });

  it('o raio do controle vai de 50 a 550 de 10 em 10 e o padrão cabe nele', () => {
    expect([RAIO.min, RAIO.max, RAIO.passo]).toEqual([50, 550, 10]);
    expect(RAIO.padrao).toBeGreaterThanOrEqual(RAIO.min);
    expect(RAIO.padrao).toBeLessThanOrEqual(RAIO.max);
    expect((RAIO.padrao - RAIO.min) % RAIO.passo).toBe(0);
  });
});

describe('validar', () => {
  const base = (extra: Partial<EstadoDoFormulario> = {}): EstadoDoFormulario => ({ ...estadoInicial(), title: 'Comprar pão', ...extra });

  it('sem descrição (ou só espaços) não salva', () => {
    expect(validar(base({ title: '' }))).toEqual({ campo: 'title', mensagem: 'Dê uma descrição ao lembrete.' });
    expect(validar(base({ title: '   ' }))).toEqual({ campo: 'title', mensagem: 'Dê uma descrição ao lembrete.' });
  });

  it('por horário basta a descrição', () => {
    expect(validar(base())).toBeNull();
  });

  it('por local sem ponto escolhido não salva e diz o que fazer', () => {
    expect(validar(base({ modo: 'local' }))).toEqual({ campo: 'local', mensagem: 'Escolha o local no mapa ou busque um endereço.' });
  });

  it('por local com o ponto escolhido salva, mesmo sem nome do lugar', () => {
    expect(validar(base({ modo: 'local', coord: { lat: 1, lng: 2 }, place: '' }))).toBeNull();
  });

  it('a descrição vem antes do local na ordem dos avisos', () => {
    expect(validar(base({ title: '', modo: 'local' }))?.campo).toBe('title');
  });
});

describe('rascunhoDe', () => {
  const estado = (extra: Partial<EstadoDoFormulario> = {}): EstadoDoFormulario => ({ ...estadoInicial(), title: '  Comprar leite  ', repeat: 'daily', ...extra });

  it('por horário: sem lugar, sem ponto, e a repetição e a hora vão junto', () => {
    expect(rascunhoDe(estado({ place: 'sobrou de antes', coord: { lat: 1, lng: 2 } }))).toEqual({
      title: 'Comprar leite', kind: 'time', dateISO: '2026-09-21', time: '09:00', repeat: 'daily', place: '', lat: undefined, lng: undefined, radius: RAIO.padrao,
    });
  });

  it('por local: leva o lugar aparado, o ponto e o raio; a repetição e a hora também', () => {
    expect(rascunhoDe(estado({ modo: 'local', place: '  Mercado  ', coord: { lat: -3.7, lng: -38.5 }, radius: 200, time: '18:00' }))).toEqual({
      title: 'Comprar leite', kind: 'local', dateISO: '2026-09-21', time: '18:00', repeat: 'daily', place: 'Mercado', lat: -3.7, lng: -38.5, radius: 200,
    });
  });
});
