import { readFileSync } from 'fs';
import { join } from 'path';
import {
  INTERVALO_DO_NOMINATIM, LIMITE_DE_RESULTADOS, MINIMO_DE_LETRAS, buscarLugares, criarFila, limparCacheDeBusca, nomeDoPonto,
  type Fila, type Opcoes, type Relogio,
} from '../geocodificar';

/** Respostas gravadas dos serviços de verdade (Fortaleza, 21/09/2026): o que o código lê é o que eles mandam, não o que imaginamos. */
const real = (nome: string) => JSON.parse(readFileSync(join(__dirname, 'respostas-reais', `${nome}.json`), 'utf8')) as unknown;

class Falha { constructor(readonly status: number) {} }
interface Rotas {
  nominatim?: (url: URL) => unknown;
  photon?: (url: URL) => unknown;
  viacep?: (cep: string) => unknown;
  brasilapi?: (cep: string) => unknown;
  awesome?: (cep: string) => unknown;
}
const SEM_FEICOES = { type: 'FeatureCollection', features: [] };
const HOST_NOMINATIM = 'nominatim.openstreetmap.org';
const HOST_PHOTON = 'photon.komoot.io';

/** Um `fetch` de mentira que responde por serviço; o que ninguém configurou responde "nada encontrado". */
function servidor(rotas: Rotas = {}) {
  const urls: URL[] = [];
  const fetchFalso = jest.fn(async (entrada: unknown) => {
    const url = new URL(String(entrada));
    urls.push(url);
    const ultimo = url.pathname.split('/').filter(Boolean).pop() ?? '';
    let dados: unknown;
    if (url.host === HOST_NOMINATIM) dados = rotas.nominatim?.(url) ?? [];
    else if (url.host === HOST_PHOTON) dados = rotas.photon?.(url) ?? SEM_FEICOES;
    else if (url.host === 'viacep.com.br') dados = rotas.viacep?.(url.pathname.split('/')[2]) ?? { erro: 'true' };
    else if (url.host === 'brasilapi.com.br') dados = rotas.brasilapi?.(ultimo) ?? new Falha(404);
    else if (url.host === 'cep.awesomeapi.com.br') dados = rotas.awesome?.(ultimo) ?? new Falha(404);
    else throw new Error(`pedido inesperado: ${url.href}`);
    if (dados instanceof Falha) return { ok: false, status: dados.status, json: async () => ({}) } as Response;
    return { ok: true, status: 200, json: async () => dados } as Response;
  });
  const dos = (host: string) => urls.filter((u) => u.host === host);
  return { buscar: fetchFalso as unknown as typeof fetch, fetchFalso, urls, nominatim: () => dos(HOST_NOMINATIM), photon: () => dos(HOST_PHOTON), dos };
}

const semEspera: Fila = { vez: async () => undefined };
const buscar = (texto: string, s: ReturnType<typeof servidor>, extra: Partial<Opcoes> = {}) => buscarLugares(texto, { buscar: s.buscar, fila: semEspera, ...extra });

beforeEach(() => { limparCacheDeBusca(); });
afterEach(() => { jest.restoreAllMocks(); });

const FORTALEZA = { lat: -3.73, lng: -38.52 };

describe('buscarLugares: o que entra', () => {
  it('não gasta pedido com menos de três letras, nem com números soltos que não são CEP', async () => {
    const s = servidor();
    expect(MINIMO_DE_LETRAS).toBe(3);
    for (const texto of ['  ab ', '', '1980', '12345', '  12  ']) await expect(buscar(texto, s)).resolves.toEqual([]);
    expect(s.fetchFalso).not.toHaveBeenCalled();
  });

  it('um CEP inteiro é endereço (com ou sem hífen, com ou sem a palavra CEP)', async () => {
    for (const texto of ['60811905', '60811-905', 'CEP 60811-905']) {
      const s = servidor();
      await buscar(texto, s);
      expect(s.dos('viacep.com.br').map((u) => u.pathname)).toEqual(['/ws/60811905/json/']);
    }
  });
});

describe('buscarLugares: endereço completo em texto', () => {
  const doMapa = () => servidor({ nominatim: () => real('nominatim-livre-numero-exato'), photon: () => real('photon-numero-exato') });
  const DIGITADO = 'Av. da Universidade, nº 2853, Benfica, Fortaleza - CE';

  it('Photon e Nominatim respondem juntos, com o endereço entendido: tipo por extenso, sem "nº", estado por extenso e só no Brasil', async () => {
    const s = doMapa();
    await buscar(DIGITADO, s);
    const [n] = s.nominatim();
    const [p] = s.photon();
    expect(s.urls).toHaveLength(2);
    expect(n.searchParams.get('q')).toBe('Avenida da Universidade, 2853, Benfica, Fortaleza, Ceará');
    expect(n.searchParams.get('countrycodes')).toBe('br');
    expect(n.searchParams.get('addressdetails')).toBe('1');
    expect(n.searchParams.get('accept-language')).toBe('pt-BR');
    expect(n.searchParams.get('limit')).toBe(String(LIMITE_DE_RESULTADOS));
    expect(p.searchParams.get('q')).toBe('Avenida da Universidade, 2853, Benfica, Fortaleza, Ceará');
    expect(p.searchParams.has('lang')).toBe(false); // a Photon responde 400 a lang=pt
    for (const u of s.urls) expect(decodeURIComponent(u.search)).not.toMatch(/Av\.|nº/);
  });

  it('devolve rua, número, bairro, cidade, estado e CEP, e junta os vários lugares do mesmo endereço numa linha só', async () => {
    const lugares = await buscar(DIGITADO, doMapa());
    expect(lugares).toHaveLength(1); // Reitoria, Concha Acústica e Banco do Brasil ficam todos em "2853, Avenida da Universidade"
    expect(lugares[0]).toMatchObject({
      nome: 'Avenida da Universidade, 2853',
      detalhe: 'Benfica, Fortaleza - CE, 60020-181',
      completo: 'Avenida da Universidade, 2853, Benfica, Fortaleza - CE, 60020-181',
    });
    expect(lugares[0].aproximado).toBeUndefined(); // o número é o que a pessoa digitou
    expect(lugares[0].lat).toBeCloseTo(-3.742, 2);
  });

  it('nome de lugar: o nome vem na primeira linha e o endereço na segunda', async () => {
    const lugares = await buscar('Reitoria da UFC', doMapa());
    expect(lugares[0]).toMatchObject({ nome: 'Reitoria da UFC', detalhe: 'Avenida da Universidade, 2853 · Benfica, Fortaleza - CE' });
    expect(lugares[0].completo).toBe('Reitoria da UFC, Avenida da Universidade, 2853, Benfica, Fortaleza - CE, 60020-181');
  });

  it('erro de digitação: o Nominatim devolve lista vazia e a Photon acha a rua mesmo assim', async () => {
    const s = servidor({ nominatim: () => real('nominatim-vazio'), photon: () => real('photon-erro-de-digitacao') });
    const lugares = await buscar('Rua Ana Bilahr, 1000, Meireles, Fortaleza - CE', s);
    expect(lugares[0]).toMatchObject({ nome: 'Rua Ana Bilhar', detalhe: 'Meireles, Fortaleza - CE, 60160-110' });
    expect(s.urls).toHaveLength(2); // achou a rua na primeira rodada: não repete a busca
  });

  it('o número que o mapa não tem: volta a rua, marcada como aproximada, e o número de outra rua (Canuto de Aguiar 1000) não vence', async () => {
    const s = servidor({ photon: () => real('photon-erro-de-digitacao') });
    const lugares = await buscar('Rua Ana Bilhar, 1000, Meireles, Fortaleza - CE', s);
    expect(lugares[0]).toMatchObject({ nome: 'Rua Ana Bilhar', aproximado: true });
    expect(lugares.map((l) => l.nome)).not.toContain('Rua Canuto de Aguiar, 1000');
  });

  it('a mesma avenida devolvida em pedaços vira uma linha só, não cinco iguais', async () => {
    const s = servidor({ photon: () => real('photon-avenida-em-pedacos') });
    const lugares = await buscar('Avenida Santos Dumont, Aldeota, Fortaleza', s);
    expect(lugares).toHaveLength(1);
    expect(lugares[0]).toMatchObject({ nome: 'Avenida Santos Dumont', detalhe: 'Aldeota, Fortaleza - CE, 60150-140' });
  });

  it('descarta o que está fora do Brasil', async () => {
    const s = servidor({
      nominatim: () => [{ lat: '48.85', lon: '2.35', category: 'highway', type: 'residential', address: { road: 'Rue A', city: 'Paris', country_code: 'fr' } }],
      photon: () => ({ features: [{ geometry: { coordinates: [2.35, 48.85] }, properties: { name: 'Rue A', type: 'street', city: 'Paris', countrycode: 'FR' } }] }),
    });
    await expect(buscar('Rue A Paris', s)).resolves.toEqual([]);
  });
});

describe('buscarLugares: perto da pessoa', () => {
  const doMapa = () => servidor({ nominatim: () => real('nominatim-livre-sem-cidade-outra-cidade') });

  it('o texto não diz a cidade: a Photon recebe o ponto e o Nominatim a caixa em volta dele (só como preferência, não como filtro)', async () => {
    const s = doMapa();
    await buscar('Rua Doutor João Morais, 327', s, { perto: FORTALEZA });
    const [p] = s.photon();
    const [n] = s.nominatim();
    expect(p.searchParams.get('lat')).toBe('-3.75');
    expect(p.searchParams.get('lon')).toBe('-38.5');
    expect(n.searchParams.get('viewbox')).toBe('-38.7500,-3.5000,-38.2500,-4.0000');
    expect(n.searchParams.get('bounded')).toBe('0');
  });

  it('a posição da pessoa só vai para os serviços de terceiros arredondada (~5 km): serve para desempatar cidades, e o endereço exato dela não sai do aparelho', async () => {
    const s = doMapa();
    await buscar('Rua Doutor João Morais, 327', s, { perto: { lat: -3.732698123, lng: -38.492301987 } });
    const [p] = s.photon();
    const [n] = s.nominatim();
    const casas = (v: string | null) => (v?.split('.')[1] ?? '').length;
    expect(casas(p.searchParams.get('lat'))).toBeLessThanOrEqual(2);
    expect(casas(p.searchParams.get('lon'))).toBeLessThanOrEqual(2);
    expect(p.searchParams.get('lat')).toBe('-3.75'); // -3.7327 arredondado ao múltiplo de 0,05 mais próximo
    expect(p.searchParams.get('lon')).toBe('-38.5');
    for (const v of n.searchParams.get('viewbox')?.split(',') ?? []) expect(Math.abs(Number(v) * 20 - Math.round(Number(v) * 20))).toBeLessThan(1e-6); // borda em múltiplos de 0,05
    for (const u of s.urls) expect(u.href).not.toMatch(/3\.7326|38\.4923/);
  });

  it('o texto já diz a cidade (ou o estado): a busca vai onde a pessoa escreveu, mesmo com a posição conhecida', async () => {
    for (const texto of ['Rua Doutor João Morais, 327, Recife', 'Rua Doutor João Morais, 327, PE']) {
      const s = doMapa();
      await buscar(texto, s, { perto: FORTALEZA });
      for (const u of s.urls) {
        expect(u.searchParams.has('lat')).toBe(false);
        expect(u.searchParams.has('viewbox')).toBe(false);
      }
    }
  });

  it('a mesma rua em duas cidades: perto de Fortaleza, a de Fortaleza vem primeiro; sem saber onde a pessoa está, fica a ordem do serviço', async () => {
    const perto = await buscar('Rua Doutor João Morais, 327', doMapa(), { perto: FORTALEZA });
    expect(perto[0].detalhe).toContain('Fortaleza');
    expect(perto[1].detalhe).toContain('São Paulo');
    limparCacheDeBusca();
    const semSaber = await buscar('Rua Doutor João Morais, 327', doMapa());
    expect(semSaber[0].detalhe).toContain('São Paulo');
  });
});

describe('buscarLugares: quando a primeira rodada não acha a rua', () => {
  const DIGITADO = 'Avenida Dom Luís, 1200, Aldeota, Fortaleza';
  const doMapa = () => servidor({ nominatim: (u) => (u.searchParams.has('street') ? real('nominatim-estruturado-numero-exato') : []) });

  it('tenta de novo sem o bairro (que o mapa costuma chamar de outro jeito), agora também por campos, e acha o número exato', async () => {
    const s = doMapa();
    const lugares = await buscar(DIGITADO, s);
    expect(s.urls).toHaveLength(4); // Photon + Nominatim; depois Photon sem bairro + Nominatim por campos
    const [, segundoDaPhoton] = s.photon();
    expect(segundoDaPhoton.searchParams.get('q')).toBe('Avenida Dom Luís, 1200, Fortaleza');
    const porCampos = s.nominatim().find((u) => u.searchParams.has('street'));
    expect(porCampos?.searchParams.get('street')).toBe('1200 Avenida Dom Luís');
    expect(porCampos?.searchParams.get('city')).toBe('Fortaleza');
    expect(porCampos?.searchParams.get('country')).toBe('Brasil');
    expect(porCampos?.searchParams.has('q')).toBe(false);
    expect(lugares[0]).toMatchObject({ nome: 'Avenida Dom Luís, 1200' });
    expect(lugares[0].aproximado).toBeUndefined();
    expect(lugares[0].completo).toContain('Aldeota'); // o bairro que a pessoa digitou vence entre os dois que o mapa tem
  });

  it('sem nada além da rua para tirar, não repete a busca', async () => {
    const s = servidor();
    await expect(buscar('Rua Que Não Existe, 10', s)).resolves.toEqual([]);
    expect(s.urls).toHaveLength(2);
  });

  it('a segunda rodada falhar não perde o que a primeira achou', async () => {
    let chamadas = 0;
    const s = servidor({
      photon: () => (++chamadas > 1 ? new Falha(503) : SEM_FEICOES),
      nominatim: (u) => (u.searchParams.has('street') ? new Falha(503) : []),
    });
    await expect(buscar(DIGITADO, s)).resolves.toEqual([]);
  });
});

describe('buscarLugares: falhas, cancelamento e cache', () => {
  it('um serviço fora do ar não derruba a busca', async () => {
    const s = servidor({ photon: () => new Falha(503), nominatim: () => real('nominatim-livre-numero-exato') });
    const lugares = await buscar('Av. da Universidade, 2853, Benfica, Fortaleza', s);
    expect(lugares[0].nome).toBe('Avenida da Universidade, 2853');
  });

  it('todos fora do ar vira erro (a tela mostra "Não foi possível buscar agora.")', async () => {
    const s = servidor({ photon: () => new Falha(503), nominatim: () => new Falha(429) });
    await expect(buscar('Rua A, 10, Fortaleza', s)).rejects.toThrow(/indisponível/);
  });

  it('resposta que falhou não fica no cache: a próxima tentativa pergunta de novo', async () => {
    const ruim = servidor({ photon: () => new Falha(503), nominatim: () => new Falha(503) });
    await expect(buscar('Rua A, 10, Fortaleza', ruim)).rejects.toThrow();
    const boa = servidor({ nominatim: () => real('nominatim-livre-numero-exato') });
    await expect(buscar('Rua A, 10, Fortaleza', boa)).resolves.toBeDefined();
    expect(boa.fetchFalso).toHaveBeenCalled();
  });

  it('digitar de novo cancela o pedido anterior: sinal já cancelado não chama serviço nenhum', async () => {
    const s = servidor();
    const controle = new AbortController();
    controle.abort();
    await expect(buscar('Rua A, 10, Fortaleza', s, { sinal: controle.signal })).rejects.toThrow(/cancelada/);
    expect(s.fetchFalso).not.toHaveBeenCalled();
  });

  it('digitar de novo interrompe o pedido que está no ar (o sinal chega ao fetch) e a busca termina como cancelada', async () => {
    const noAr = jest.fn((_url: unknown, opcoes?: RequestInit) => new Promise<Response>((_ok, falhou) => {
      opcoes?.signal?.addEventListener('abort', () => falhou(Object.assign(new Error('aborted'), { name: 'AbortError' })));
    }));
    const controle = new AbortController();
    const andamento = buscarLugares('Rua A, 10, Fortaleza', { buscar: noAr as unknown as typeof fetch, fila: semEspera, sinal: controle.signal });
    await Promise.resolve();
    await Promise.resolve();
    expect(noAr).toHaveBeenCalled();
    controle.abort();
    await expect(andamento).rejects.toThrow();
  });

  it('serviço que não responde não prende a busca para sempre (desiste em 8 s)', async () => {
    jest.useFakeTimers();
    try {
      const mudo = jest.fn((_url: unknown, opcoes?: RequestInit) => new Promise<Response>((_ok, falhou) => {
        opcoes?.signal?.addEventListener('abort', () => falhou(Object.assign(new Error('aborted'), { name: 'AbortError' })));
      }));
      const andamento = buscarLugares('Rua A, 10, Fortaleza', { buscar: mudo as unknown as typeof fetch, fila: semEspera });
      const resultado = expect(andamento).rejects.toThrow();
      await jest.advanceTimersByTimeAsync(8000);
      await resultado;
    } finally {
      jest.useRealTimers();
    }
  });

  it('a mesma busca de novo sai do cache (a política do Nominatim pede cache), sem caixa alta nem acento fazer diferença', async () => {
    const s = servidor({ nominatim: () => real('nominatim-livre-numero-exato') });
    const primeira = await buscar('Av. da Universidade, 2853, Benfica, Fortaleza', s);
    const pedidos = s.fetchFalso.mock.calls.length;
    const segunda = await buscar('AV. DA UNIVERSIDADE, 2853, BENFICA, FORTALEZA', s);
    expect(s.fetchFalso.mock.calls.length).toBe(pedidos);
    expect(segunda).toEqual(primeira);
  });

  it('o cache vale pouco tempo e considera onde a pessoa está', async () => {
    const s = servidor({ nominatim: () => real('nominatim-livre-numero-exato') });
    await buscar('Rua A, 10', s, { perto: FORTALEZA });
    const depoisDoPrimeiro = s.fetchFalso.mock.calls.length;
    await buscar('Rua A, 10', s, { perto: { lat: -23.55, lng: -46.63 } }); // outra cidade: outra busca
    expect(s.fetchFalso.mock.calls.length).toBeGreaterThan(depoisDoPrimeiro);
    const depoisDoSegundo = s.fetchFalso.mock.calls.length;
    const agora = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(agora + 11 * 60_000);
    await buscar('Rua A, 10', s, { perto: FORTALEZA }); // passou de 10 minutos: pergunta de novo
    expect(s.fetchFalso.mock.calls.length).toBeGreaterThan(depoisDoSegundo);
  });
});

describe('buscarLugares: só o CEP', () => {
  const UNIFOR = {
    lat: '-3.7687254', lon: '-38.4776938', category: 'amenity', type: 'university', addresstype: 'amenity', name: 'Universidade de Fortaleza',
    address: { amenity: 'Universidade de Fortaleza', house_number: '1321', road: 'Avenida Washington Soares', suburb: 'Edson Queiroz', city: 'Fortaleza', state: 'Ceará', 'ISO3166-2-lvl4': 'BR-CE', postcode: '60811-905', country_code: 'br' },
  };
  const comViaCep = (extra: Rotas = {}) => servidor({ viacep: () => real('viacep-cep-de-um-predio'), nominatim: (u) => (u.searchParams.has('street') ? [UNIFOR] : []), ...extra });

  it('o ViaCEP diz a rua e o número; o Nominatim acha o ponto por campos. O CEP cru nunca vai para a busca de texto', async () => {
    const s = comViaCep();
    const lugares = await buscar('60811-905', s);
    const porCampos = s.nominatim()[0];
    expect(porCampos.searchParams.get('street')).toBe('1321 Avenida Washington Soares');
    expect(porCampos.searchParams.get('city')).toBe('Fortaleza');
    expect(porCampos.searchParams.get('state')).toBe('Ceará');
    for (const u of s.urls) expect(u.searchParams.get('q') ?? '').not.toMatch(/60811/);
    expect(lugares[0]).toMatchObject({ nome: 'Avenida Washington Soares, 1321', detalhe: 'Edson Queiroz, Fortaleza - CE, 60811-905' });
    expect(lugares[0].aproximado).toBeUndefined(); // CEP de um prédio só, e o mapa tem aquele número
    expect(lugares[0].lat).toBeCloseTo(-3.7687, 3);
  });

  it('CEP de um trecho de rua (sem número): o ponto é o da rua e vem marcado como aproximado', async () => {
    const s = comViaCep({
      viacep: () => ({ cep: '60125-025', logradouro: 'Rua José Vilar', complemento: 'de 691/692 a 2049/2050', bairro: 'Aldeota', localidade: 'Fortaleza', uf: 'CE' }),
      nominatim: () => [{ lat: '-3.74', lon: '-38.5', category: 'highway', type: 'residential', addresstype: 'road', name: 'Rua José Vilar', address: { road: 'Rua José Vilar', suburb: 'Aldeota', city: 'Fortaleza', state: 'Ceará', country_code: 'br' } }],
    });
    const lugares = await buscar('60125025', s);
    expect(lugares[0]).toMatchObject({ nome: 'Rua José Vilar', detalhe: 'Aldeota, Fortaleza - CE, 60125-025', aproximado: true });
  });

  it('CEP que não existe: nenhum resultado, sem inventar um (a BrasilAPI devolveria uma cidade qualquer)', async () => {
    const s = servidor({ viacep: () => real('viacep-cep-inexistente'), brasilapi: () => real('brasilapi-cep') });
    await expect(buscar('99999999', s)).resolves.toEqual([]);
    expect(s.dos('brasilapi.com.br')).toHaveLength(0);
    expect(s.nominatim()).toHaveLength(0);
  });

  it('ViaCEP fora do ar: o texto do CEP vem da BrasilAPI, e a coordenada dela (o centro da cidade, a 10 km) nunca vira o ponto', async () => {
    const s = servidor({ viacep: () => new Falha(503), brasilapi: () => real('brasilapi-cep'), nominatim: (u) => (u.searchParams.has('street') ? [UNIFOR] : []) });
    const lugares = await buscar('60811905', s);
    expect(s.nominatim()[0].searchParams.get('street')).toBe('1321 Avenida Washington Soares'); // "Avenida Washington Soares 1321" da BrasilAPI, separado
    expect(lugares[0].lat).toBeCloseTo(-3.7687, 3);
    for (const l of lugares) expect(l.lat).not.toBeCloseTo(-3.71722, 2);
  });

  it('nenhum mapa acha a rua: o último recurso é o ponto do CEP (AwesomeAPI), marcado como aproximado', async () => {
    const s = servidor({ viacep: () => real('viacep-cep-de-um-predio'), awesome: () => real('awesomeapi-cep') });
    const lugares = await buscar('60811905', s);
    expect(lugares).toHaveLength(1);
    expect(lugares[0]).toMatchObject({ fonte: 'cep', aproximado: true, nome: 'Avenida Washington Soares, 1321', lat: -3.7690025, lng: -38.4816434 });
  });

  it('não pergunta à AwesomeAPI quando o mapa achou', async () => {
    const s = comViaCep();
    await buscar('60811905', s);
    expect(s.dos('cep.awesomeapi.com.br')).toHaveLength(0);
  });

  it('a rua digitada não existe no mapa, mas o CEP que veio junto existe: cai no CEP', async () => {
    const s = comViaCep();
    const lugares = await buscar('Rua Inventada, 10, 60811-905', s);
    expect(lugares[0]).toMatchObject({ nome: 'Avenida Washington Soares, 1321' });
  });
});

describe('nomeDoPonto: o endereço de um ponto tocado no mapa', () => {
  const reverso = (dado: unknown) => servidor({ nominatim: () => dado });

  it('pede com o detalhe do endereço e devolve "rua, número, bairro, cidade - UF, CEP"', async () => {
    const s = reverso({ lat: '-3.7', lon: '-38.5', category: 'place', type: 'house', addresstype: 'building', address: { house_number: '100', road: 'Rua Silva Jatahy', suburb: 'Meireles', city: 'Fortaleza', state: 'Ceará', 'ISO3166-2-lvl4': 'BR-CE', postcode: '60165-070', country_code: 'br' } });
    await expect(nomeDoPonto(-3.73, -38.49, { buscar: s.buscar, fila: semEspera })).resolves.toBe('Rua Silva Jatahy, 100, Meireles, Fortaleza - CE, 60165-070');
    const [u] = s.nominatim();
    expect(u.pathname).toBe('/reverse');
    expect(u.searchParams.get('addressdetails')).toBe('1');
    expect(u.searchParams.get('zoom')).toBe('18');
    expect(u.searchParams.get('lat')).toBe('-3.73');
    expect(u.searchParams.get('lon')).toBe('-38.49');
  });

  it('um lugar com nome traz o nome na frente', async () => {
    const s = reverso({ lat: '-3.77', lon: '-38.47', category: 'leisure', type: 'park', addresstype: 'leisure', name: 'Parque do Cocó', address: { leisure: 'Parque do Cocó', road: 'Avenida Sebastião de Abreu', suburb: 'Cocó', city: 'Fortaleza', state: 'Ceará', 'ISO3166-2-lvl4': 'BR-CE', country_code: 'br' } });
    await expect(nomeDoPonto(-3.77, -38.47, { buscar: s.buscar, fila: semEspera })).resolves.toBe('Parque do Cocó, Avenida Sebastião de Abreu, Cocó, Fortaleza - CE');
  });

  it('devolve null quando o serviço não sabe, falha ou o ponto é fora do Brasil', async () => {
    for (const dado of [{ error: 'Unable to geocode' }, new Falha(500), { lat: '48.8', lon: '2.3', category: 'highway', type: 'x', address: { road: 'Rue A', country_code: 'fr' } }]) {
      await expect(nomeDoPonto(0, 0, { buscar: reverso(dado).buscar, fila: semEspera })).resolves.toBeNull();
    }
  });

  it('entra na fila de 1 pedido por segundo do Nominatim', async () => {
    const vez = jest.fn(async () => undefined);
    await nomeDoPonto(0, 0, { buscar: reverso({ error: 'x' }).buscar, fila: { vez } });
    expect(vez).toHaveBeenCalledTimes(1);
  });
});

describe('criarFila: no máximo um pedido por segundo ao Nominatim (a política do serviço)', () => {
  function relogioFalso() {
    let agora = 0;
    const esperas: number[] = [];
    const relogio: Relogio = { agora: () => agora, esperar: async (ms) => { esperas.push(ms); agora += ms; } };
    return { relogio, esperas, passar: (ms: number) => { agora += ms; } };
  }

  it('o primeiro pedido sai na hora; o seguinte espera o resto do intervalo', async () => {
    const { relogio, esperas, passar } = relogioFalso();
    const fila = criarFila(1000, relogio);
    await fila.vez();
    expect(esperas).toEqual([]);
    await fila.vez();
    expect(esperas).toEqual([1000]);
    passar(400);
    await fila.vez();
    expect(esperas).toEqual([1000, 600]);
    passar(5000);
    await fila.vez();
    expect(esperas).toEqual([1000, 600]); // já passou tempo de sobra
  });

  it('vários ao mesmo tempo saem um de cada vez, na ordem, cada um um intervalo depois do outro', async () => {
    const { relogio, esperas } = relogioFalso();
    const fila = criarFila(1000, relogio);
    const ordem: number[] = [];
    await Promise.all([1, 2, 3].map((n) => fila.vez().then(() => ordem.push(n))));
    expect(ordem).toEqual([1, 2, 3]);
    expect(esperas).toEqual([1000, 1000]);
  });

  it('quem desiste na espera (digitou de novo) não gasta a vez dos outros', async () => {
    const { relogio, esperas } = relogioFalso();
    const fila = criarFila(1000, relogio);
    await fila.vez();
    const controle = new AbortController();
    controle.abort();
    await expect(fila.vez(controle.signal)).rejects.toThrow(/cancelada/);
    await fila.vez();
    expect(esperas).toEqual([1000]); // só o pedido que de fato saiu esperou
  });

  it('o intervalo do Nominatim tem folga sobre o 1 s da política', () => {
    expect(INTERVALO_DO_NOMINATIM).toBeGreaterThanOrEqual(1000);
  });
});

describe('contrato do código', () => {
  const codigo = readFileSync(join(__dirname, '..', 'geocodificar.ts'), 'utf8');

  it('o fetch é chamado solto: como método de um objeto o navegador recusa ("Illegal invocation")', () => {
    expect(codigo).not.toMatch(/\bc\.buscar\(/);
    expect(codigo).toMatch(/const buscar = c\.buscar;/);
  });

  it('só fala com serviços gratuitos e sem chave (nenhuma chave nem token no código)', () => {
    const hosts = [...codigo.matchAll(/'https:\/\/([a-z.]+)/g)].map((m) => m[1]).sort();
    expect(hosts).toEqual(['brasilapi.com.br', 'cep.awesomeapi.com.br', 'nominatim.openstreetmap.org', 'photon.komoot.io', 'viacep.com.br']);
    expect(codigo).not.toMatch(/api[_-]?key|token|secret/i);
  });
});
