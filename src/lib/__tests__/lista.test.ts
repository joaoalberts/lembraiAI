import type { Reminder } from '../../data/reminders';
import {
  FILTROS, agruparPorSecao, buscar, casaComBusca, contagensDosFiltros, dataDaSecao, legendaDoLembrete, lembretesVisiveis, passaNoFiltro, textoDeAtivos,
} from '../lista';

// Segunda-feira, 21/09/2026
const HOJE = new Date(2026, 8, 21, 10, 0, 0);

const base: Omit<Reminder, 'id' | 'title' | 'dateISO'> = { category: 'green', icon: 'cart', kind: 'time', time: '09:00', repeat: 'never', active: true };
const r = (id: string, title: string, dateISO: string, extra: Partial<Reminder> = {}): Reminder => ({ ...base, id, title, dateISO, ...extra });

const agua = r('1', 'Comprar água no mercado', '2026-09-19'); // sábado passado
const salada = r('2', 'comprar salada', '2026-09-19', { time: '10:00' });
const hoje = r('3', 'Reunião com o time', '2026-09-21', { category: 'purple', icon: 'users' });
const amanha = r('4', 'Tomar vitamina', '2026-09-22', { time: '08:00' });
const academia = r('5', 'Academia', '2026-09-25', { kind: 'local', place: 'Smart Fit – Iguatemi', radius: 100, lat: 1, lng: 2, active: false });
const todos = [agua, salada, hoje, amanha, academia];

beforeEach(() => { jest.useFakeTimers(); jest.setSystemTime(HOJE); });
afterEach(() => jest.useRealTimers());

describe('casaComBusca', () => {
  it('sem texto ou só com espaços mostra tudo', () => {
    expect(casaComBusca(agua, '')).toBe(true);
    expect(casaComBusca(agua, '   ')).toBe(true);
  });

  it('acha por pedaço do título, sem acento e sem diferença de maiúscula', () => {
    expect(casaComBusca(agua, 'AGUA')).toBe(true);
    expect(casaComBusca(agua, 'merc')).toBe(true);
    expect(casaComBusca(agua, 'salada')).toBe(false);
  });

  it('acha pelo lugar, pela data escrita e pela hora', () => {
    expect(casaComBusca(academia, 'iguatemi')).toBe(true);
    expect(casaComBusca(agua, 'set de 2026')).toBe(true);
    expect(casaComBusca(salada, '10:00')).toBe(true);
  });

  it('casa entre campos: "mercado sab" acha a compra de sábado', () => {
    expect(casaComBusca(agua, 'mercado sab')).toBe(true);
    expect(casaComBusca(agua, 'mercado dom')).toBe(false);
  });

  it('não busca categoria nem raio', () => {
    expect(casaComBusca(academia, 'purple')).toBe(false);
    expect(casaComBusca(academia, '100')).toBe(false);
  });
});

describe('passaNoFiltro', () => {
  it('Todos passa tudo', () => {
    expect(todos.every((x) => passaNoFiltro(x, 'todos'))).toBe(true);
  });

  it('Hoje é só a data de hoje', () => {
    expect(todos.filter((x) => passaNoFiltro(x, 'hoje')).map((x) => x.id)).toEqual(['3']);
  });

  it('Esta semana é tudo que não é hoje: amanhã, datas futuras e também as passadas (como no original)', () => {
    expect(todos.filter((x) => passaNoFiltro(x, 'semana')).map((x) => x.id)).toEqual(['1', '2', '4', '5']);
  });

  it('Locais é só o que é por local, ativo ou pausado', () => {
    expect(todos.filter((x) => passaNoFiltro(x, 'locais')).map((x) => x.id)).toEqual(['5']);
  });
});

describe('contagens e lista visível', () => {
  it('a contagem de cada chip acompanha a busca (não a lista inteira)', () => {
    expect(contagensDosFiltros(todos, '')).toEqual({ todos: 5, hoje: 1, semana: 4, locais: 1 });
    expect(contagensDosFiltros(todos, 'comprar')).toEqual({ todos: 2, hoje: 0, semana: 2, locais: 0 });
  });

  it('a lista mostra a busca E o filtro', () => {
    expect(lembretesVisiveis(todos, 'comprar', 'todos').map((x) => x.id)).toEqual(['1', '2']);
    expect(lembretesVisiveis(todos, 'comprar', 'hoje')).toEqual([]);
    expect(lembretesVisiveis(todos, '', 'locais').map((x) => x.id)).toEqual(['5']);
  });

  it('buscar não mexe na ordem', () => {
    expect(buscar(todos, '').map((x) => x.id)).toEqual(['1', '2', '3', '4', '5']);
  });

  it('os filtros aparecem na ordem Todos, Hoje, Esta semana, Locais', () => {
    expect(FILTROS.map((f) => f.rotulo)).toEqual(['Todos', 'Hoje', 'Esta semana', 'Locais']);
  });
});

describe('agruparPorSecao', () => {
  it('ordem fixa Hoje, Amanhã, Esta semana, e o grupo vazio não aparece', () => {
    const grupos = agruparPorSecao([amanha, agua, hoje, academia]);
    expect(grupos.map((g) => g.secao)).toEqual(['Hoje', 'Amanhã', 'Esta semana']);
    expect(agruparPorSecao([agua, academia]).map((g) => g.secao)).toEqual(['Esta semana']);
    expect(agruparPorSecao([])).toEqual([]);
  });

  it('dentro do grupo mantém a ordem recebida', () => {
    const [semana] = agruparPorSecao([academia, agua, salada]);
    expect(semana.itens.map((x) => x.id)).toEqual(['5', '1', '2']);
  });
});

describe('textos', () => {
  it('a data ao lado do grupo só existe em Hoje e Amanhã', () => {
    expect(dataDaSecao('Hoje')).toBe('Seg, 21 de set de 2026');
    expect(dataDaSecao('Amanhã')).toBe('Ter, 22 de set de 2026');
    expect(dataDaSecao('Esta semana')).toBeNull();
  });

  it('conta os ativos no singular e no plural, com zero também no plural', () => {
    expect(textoDeAtivos([])).toBe('0 lembretes ativos');
    expect(textoDeAtivos([agua])).toBe('1 lembrete ativo');
    expect(textoDeAtivos(todos)).toBe('4 lembretes ativos'); // a academia está pausada
  });

  it('a legenda do menu é data · hora', () => {
    expect(legendaDoLembrete(agua)).toBe('Sáb, 19 de set de 2026 · 09:00');
  });
});
