import { CERCAS_GUARDADAS, TEMPO_DE_VALIDADE, lembrarCercas, lerCerca, registrarEntrada, registrarSaida, type Armazenamento } from '../chegadas';

const memoria = (): Armazenamento & { dados: Map<string, string> } => {
  const dados = new Map<string, string>();
  return {
    dados,
    getItem: async (k) => dados.get(k) ?? null,
    setItem: async (k, v) => { dados.set(k, v); },
  };
};
const T0 = new Date(2026, 8, 21, 10, 0, 0).getTime();
const minutos = (n: number) => n * 60_000;

describe('registrarEntrada: só avisa uma vez por chegada', () => {
  it('a primeira entrada avisa', async () => {
    const a = memoria();
    expect(await registrarEntrada('m1', T0, a)).toBe(true);
  });

  it('entrar de novo sem ter saído não avisa (o sistema reenvia "entrou" quando as regiões são registradas com a pessoa já dentro, e o app aberto vê a mesma entrada)', async () => {
    const a = memoria();
    await registrarEntrada('m1', T0, a);
    expect(await registrarEntrada('m1', T0 + minutos(1), a)).toBe(false);
    expect(await registrarEntrada('m1', T0 + minutos(90), a)).toBe(false);
  });

  it('sair e entrar de novo avisa de novo', async () => {
    const a = memoria();
    await registrarEntrada('m1', T0, a);
    await registrarSaida('m1', a);
    expect(await registrarEntrada('m1', T0 + minutos(10), a)).toBe(true);
  });

  it('se a saída nunca chegou, depois do prazo a entrada volta a valer (não fica calado para sempre)', async () => {
    const a = memoria();
    await registrarEntrada('m1', T0, a);
    expect(await registrarEntrada('m1', T0 + TEMPO_DE_VALIDADE - 1, a)).toBe(false);
    expect(await registrarEntrada('m1', T0 + TEMPO_DE_VALIDADE + 1, a)).toBe(true);
  });

  it('cada lembrete tem a sua chegada', async () => {
    const a = memoria();
    await registrarEntrada('m1', T0, a);
    expect(await registrarEntrada('f1', T0, a)).toBe(true);
    await registrarSaida('m1', a);
    expect(await registrarEntrada('f1', T0 + 1, a)).toBe(false);
  });

  it('sair de quem nunca entrou não faz mal', async () => {
    const a = memoria();
    await registrarSaida('nunca', a);
    expect(await registrarEntrada('nunca', T0, a)).toBe(true);
  });

  it('armazenamento com defeito não impede o aviso (melhor avisar a mais do que calar)', async () => {
    const quebrado: Armazenamento = { getItem: async () => { throw new Error('disco'); }, setItem: async () => { throw new Error('disco'); } };
    expect(await registrarEntrada('m1', T0, quebrado)).toBe(true);
    await expect(registrarSaida('m1', quebrado)).resolves.toBeUndefined();
  });

  it('conteúdo guardado ilegível é tratado como vazio', async () => {
    const a = memoria();
    a.dados.set('lembreiai:dentro:v1', '{lixo');
    expect(await registrarEntrada('m1', T0, a)).toBe(true);
  });
});

describe('cercas guardadas: o que o sistema precisa saber com o app fechado', () => {
  it('lembra título e endereço de cada lembrete por local, para o aviso da chegada', async () => {
    const a = memoria();
    await lembrarCercas([{ id: 'm1', title: 'Comprar pão', place: 'Padaria', lat: 1, lng: 2, radius: 100 }], a);
    expect(await lerCerca('m1', a)).toEqual({ title: 'Comprar pão', place: 'Padaria' });
    expect(await lerCerca('outro', a)).toBeNull();
  });

  it('guardar de novo troca tudo (lembrete apagado some)', async () => {
    const a = memoria();
    await lembrarCercas([{ id: 'm1', title: 'A', place: '', lat: 1, lng: 2, radius: 100 }, { id: 'f1', title: 'B', place: '', lat: 1, lng: 2, radius: 100 }], a);
    await lembrarCercas([{ id: 'f1', title: 'B', place: '', lat: 1, lng: 2, radius: 100 }], a);
    expect(await lerCerca('m1', a)).toBeNull();
    expect(await lerCerca('f1', a)).toEqual({ title: 'B', place: '' });
  });

  it('e apagar um lembrete limpa também a marca de "dentro" dele', async () => {
    const a = memoria();
    await lembrarCercas([{ id: 'm1', title: 'A', place: '', lat: 1, lng: 2, radius: 100 }], a);
    await registrarEntrada('m1', T0, a);
    await lembrarCercas([], a);
    expect(await registrarEntrada('m1', T0 + 1, a)).toBe(true);
  });

  it('a chave é fixa (a tarefa em segundo plano lê a mesma)', () => {
    expect(CERCAS_GUARDADAS).toBe('lembreiai:cercas:v1');
  });
});
