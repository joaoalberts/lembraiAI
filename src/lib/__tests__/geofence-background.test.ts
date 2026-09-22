import type { Armazenamento } from '../chegadas';
import { lembrarCercas, registrarEntrada } from '../chegadas';
import type { Fence } from '../geofence';
import { ENTROU, LIMITE_DE_REGIOES, RAIO_MINIMO_NO_SISTEMA, SAIU, TAREFA_DE_GEOFENCE, regioesParaOSistema, tratarEventoDeGeofence } from '../geofence-background';

const memoria = (): Armazenamento => {
  const dados = new Map<string, string>();
  return { getItem: async (k) => dados.get(k) ?? null, setItem: async (k, v) => { dados.set(k, v); } };
};
const cerca = (id: string, lat = -3.73, lng = -38.52, radius = 150): Fence => ({ id, title: `Lugar ${id}`, place: `Rua ${id}`, lat, lng, radius });
const T0 = new Date(2026, 8, 21, 10, 0, 0).getTime();

describe('regioesParaOSistema: o que o sistema vai vigiar com o app fechado', () => {
  it('cada lugar vira uma região com o id do lembrete, avisando ao entrar e ao sair', () => {
    expect(regioesParaOSistema([cerca('a', -3.7, -38.5, 200)], 'android')).toEqual([
      { identifier: 'a', latitude: -3.7, longitude: -38.5, radius: 200, notifyOnEnter: true, notifyOnExit: true },
    ]);
  });

  it('raio menor que o mínimo que o sistema acompanha com confiança sobe para o mínimo', () => {
    const [r] = regioesParaOSistema([cerca('a', -3.7, -38.5, 50)], 'ios');
    expect(r.radius).toBe(RAIO_MINIMO_NO_SISTEMA);
    expect(RAIO_MINIMO_NO_SISTEMA).toBe(100);
    expect(regioesParaOSistema([cerca('b', -3.7, -38.5, 300)], 'ios')[0]?.radius).toBe(300);
  });

  it('o iOS vigia no máximo 20 regiões e o Android 100: ficam as mais próximas da pessoa', () => {
    expect(LIMITE_DE_REGIOES).toEqual({ ios: 20, android: 100 });
    const todas = Array.from({ length: 30 }, (_, i) => cerca(`c${i}`, -3.70 - i * 0.01, -38.5)); // cada uma um pouco mais ao sul
    const perto = regioesParaOSistema(todas, 'ios', { lat: -3.70, lng: -38.5 });
    expect(perto).toHaveLength(20);
    expect(perto.map((r) => r.identifier)).toEqual(Array.from({ length: 20 }, (_, i) => `c${i}`));
    const longe = regioesParaOSistema(todas, 'ios', { lat: -4.0, lng: -38.5 }); // a pessoa está lá no sul
    expect(longe.map((r) => r.identifier)).toContain('c29');
    expect(longe.map((r) => r.identifier)).not.toContain('c0');
  });

  it('sem saber onde a pessoa está, mantém a ordem da lista', () => {
    const todas = Array.from({ length: 25 }, (_, i) => cerca(`c${i}`));
    expect(regioesParaOSistema(todas, 'ios').map((r) => r.identifier)).toEqual(Array.from({ length: 20 }, (_, i) => `c${i}`));
    expect(regioesParaOSistema(todas, 'android')).toHaveLength(25);
  });

  it('lista vazia, região nenhuma (o sistema recusa começar sem região)', () => {
    expect(regioesParaOSistema([], 'android')).toEqual([]);
  });

  it('o nome da tarefa é fixo (o mesmo no registro e na definição)', () => {
    expect(TAREFA_DE_GEOFENCE).toBe('lembreiai-geofence');
  });
});

describe('tratarEventoDeGeofence: o evento que acorda o app fechado', () => {
  const montar = async (cercas: Fence[] = [cerca('m1')]) => {
    const armazenamento = memoria();
    await lembrarCercas(cercas, armazenamento);
    const avisar = jest.fn(async () => undefined);
    const tratar = (eventType: number, id: string | undefined, agora = T0) =>
      tratarEventoDeGeofence({ eventType, region: { identifier: id } }, { armazenamento, avisar, agora: () => agora });
    return { armazenamento, avisar, tratar };
  };

  it('entrou: avisa com o título e o endereço guardados, o id do lembrete e o identificador da chegada', async () => {
    const { avisar, tratar } = await montar();
    expect(await tratar(ENTROU, 'm1')).toBe('avisou');
    expect(avisar).toHaveBeenCalledWith({ title: 'Você chegou: Lugar m1', body: 'Rua m1', data: { reminderId: 'm1' }, identifier: 'chegada-m1' });
  });

  it('o sistema reenvia "entrou" ao registrar as regiões com a pessoa já dentro: só avisa uma vez', async () => {
    const { avisar, tratar } = await montar();
    await tratar(ENTROU, 'm1');
    expect(await tratar(ENTROU, 'm1', T0 + 60_000)).toBe('repetida');
    expect(avisar).toHaveBeenCalledTimes(1);
  });

  it('saiu e entrou de novo: avisa outra vez', async () => {
    const { avisar, tratar } = await montar();
    await tratar(ENTROU, 'm1');
    expect(await tratar(SAIU, 'm1')).toBe('saiu');
    expect(await tratar(ENTROU, 'm1', T0 + 3_600_000)).toBe('avisou');
    expect(avisar).toHaveBeenCalledTimes(2);
  });

  it('um "saiu" que o app aberto já tinha registrado (ou de quem nunca entrou) não faz nada de errado', async () => {
    const { avisar, tratar } = await montar();
    expect(await tratar(SAIU, 'm1')).toBe('saiu');
    expect(avisar).not.toHaveBeenCalled();
  });

  it('lembrete que não existe mais (apagado ou pausado) não avisa', async () => {
    const { avisar, tratar } = await montar([cerca('m1')]);
    expect(await tratar(ENTROU, 'apagado')).toBe('sem-lembrete');
    expect(avisar).not.toHaveBeenCalled();
  });

  it('evento sem identificador ou de tipo desconhecido é ignorado', async () => {
    const { avisar, tratar } = await montar();
    expect(await tratar(ENTROU, undefined)).toBe('ignorado');
    expect(await tratar(99, 'm1')).toBe('ignorado');
    expect(avisar).not.toHaveBeenCalled();
  });

  it('avisar uma entrada que o app aberto já avisou (marca no aparelho) não duplica', async () => {
    const { armazenamento, avisar, tratar } = await montar();
    await registrarEntrada('m1', T0 - 10_000, armazenamento); // o app aberto avisou há 10 s
    expect(await tratar(ENTROU, 'm1')).toBe('repetida');
    expect(avisar).not.toHaveBeenCalled();
  });

  it('falha ao mostrar o aviso não some com a chegada: a marca só vale se o aviso saiu', async () => {
    const { armazenamento, avisar, tratar } = await montar();
    avisar.mockRejectedValueOnce(new Error('sem permissão de notificação'));
    await expect(tratar(ENTROU, 'm1')).rejects.toThrow('sem permissão');
    // a marca foi desfeita: a próxima entrada tenta avisar de novo
    expect(await tratar(ENTROU, 'm1', T0 + 1_000)).toBe('avisou');
    expect(avisar).toHaveBeenCalledTimes(2);
    expect(armazenamento).toBeTruthy();
  });
});
