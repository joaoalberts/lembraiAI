import { Platform } from 'react-native';
import { combinar, descrever, paraLugar, parecidoDeRuas, type Candidato, type Lugar } from './candidatos';
import { UFS, ehCep, lerEndereco, normalizar, type EnderecoLido } from './enderecos';
import type { LatLng } from './geo';
import {
  deAwesomeApi, deBrasilApi, deNominatim, dePhoton, deViaCep,
  type EnderecoDoCep, type FeicaoDaPhoton, type RespostaDaAwesomeApi, type RespostaDaBrasilApi, type RespostaDoNominatim, type RespostaDoViaCep,
} from './geocodificadores';

export type { Lugar } from './candidatos';

/**
 * Busca de endereços e lugares em todo o Brasil, só com serviços gratuitos e sem chave (como o mapa, o Leaflet). Nenhum deles acerta
 * tudo sozinho (medido em Fortaleza, 21/09/2026): o Nominatim devolve lista vazia com um erro de digitação e põe uma rua igual de
 * outra cidade em primeiro; a Photon tolera o erro de digitação e é 3 vezes mais rápida, mas devolve uma avenida em pedaços; o
 * número de porta só existe no OpenStreetMap em cerca de 1 endereço de cada 4, e um CEP não é um ponto (a coordenada da BrasilAPI
 * cai no centro da cidade). Por isso:
 *
 *  1. `lerEndereco` separa rua, número, bairro, cidade, estado e CEP do que foi digitado ("Av.", "nº", "s/n"...);
 *  2. Photon e Nominatim respondem juntos; cada resultado ganha uma nota pelo quanto combina com o texto (`candidatos.ts`);
 *  3. se nenhum tem a rua, tenta de novo sem o bairro (que costuma ser o que o mapa não reconhece);
 *  4. só o CEP: o ViaCEP diz a rua, e o Nominatim acha o ponto dela; a AwesomeAPI (coordenada do CEP) é o último recurso;
 *  5. o que o mapa não tem (o número da porta) volta como a rua, marcado "aproximado", para a pessoa conferir o pino.
 *
 * Política do Nominatim público: no máximo 1 pedido por segundo (uma fila espaça os pedidos), identificação do app (User-Agent no
 * celular; o navegador já manda o Referer) e cache (`cache` abaixo). Quem chama espera a pessoa parar de digitar.
 */
export const MINIMO_DE_LETRAS = 3;
export const LIMITE_DE_RESULTADOS = 5;

const NOMINATIM = 'https://nominatim.openstreetmap.org';
const PHOTON = 'https://photon.komoot.io/api/';
const VIACEP = 'https://viacep.com.br/ws';
const BRASILAPI = 'https://brasilapi.com.br/api/cep/v2';
const AWESOMEAPI = 'https://cep.awesomeapi.com.br/json';

/** A política pede no máximo 1 pedido por segundo; a folga cobre o relógio do aparelho e a rede. */
export const INTERVALO_DO_NOMINATIM = 1100;
const TEMPO_LIMITE = 8000;
const VALIDADE_DO_CACHE = 10 * 60_000;
const TAMANHO_DO_CACHE = 50;
/** Metade do lado (em graus, ~28 km) da caixa em volta da pessoa que o Nominatim usa como preferência. */
const METADE_DA_CAIXA = 0.25;

// ---------------------------------------------------------------- fila de 1 pedido por segundo

export interface Relogio {
  agora: () => number;
  esperar: (ms: number, sinal?: AbortSignal) => Promise<void>;
}
export interface Fila { vez: (sinal?: AbortSignal) => Promise<void> }

const cancelado = () => Object.assign(new Error('Busca cancelada'), { name: 'AbortError' });

const RELOGIO: Relogio = {
  agora: () => Date.now(),
  esperar: (ms, sinal) => new Promise<void>((pronto, falhou) => {
    const espera = setTimeout(pronto, ms);
    sinal?.addEventListener('abort', () => { clearTimeout(espera); falhou(cancelado()); }, { once: true });
  }),
};

/** Espaça as vezes: quem chega antes do intervalo espera. Uma busca cancelada na espera não gasta a vez. */
export function criarFila(intervalo: number, relogio: Relogio = RELOGIO): Fila {
  let fim: Promise<unknown> = Promise.resolve();
  let ultimo = Number.NEGATIVE_INFINITY;
  return {
    vez(sinal) {
      const minha = fim.then(async () => {
        if (sinal?.aborted) throw cancelado();
        const falta = ultimo + intervalo - relogio.agora();
        if (falta > 0) await relogio.esperar(falta, sinal);
        ultimo = relogio.agora();
      });
      fim = minha.catch(() => undefined);
      return minha;
    },
  };
}

const FILA_DO_NOMINATIM = criarFila(INTERVALO_DO_NOMINATIM);

// ---------------------------------------------------------------- pedidos

export interface Opcoes {
  sinal?: AbortSignal;
  /** Onde a pessoa está ou olha no mapa: desempata cidades com a mesma rua quando o texto não diz a cidade. */
  perto?: LatLng | null;
  /** Só para os testes. */
  buscar?: typeof fetch;
  fila?: Fila;
}

interface Contexto { sinal: AbortSignal | undefined; perto: LatLng | null; buscar: typeof fetch; fila: Fila }

class ErroDeServico extends Error {
  constructor(readonly status: number) { super(`busca de endereço indisponível (${status})`); }
}

const cabecalhos = (): Record<string, string> =>
  Platform.OS === 'web' ? {} : { 'User-Agent': 'LembreiAi/1.0 (lembretes por hora e lugar)' };

const codificar = encodeURIComponent;
const consulta = (parametros: Record<string, string | undefined>) =>
  Object.entries(parametros).filter((par): par is [string, string] => par[1] !== undefined && par[1] !== '').map(([k, v]) => `${k}=${codificar(v)}`).join('&');

async function pedir<T>(url: string, c: Contexto, noNominatim = false): Promise<T> {
  if (noNominatim) await c.fila.vez(c.sinal);
  if (c.sinal?.aborted) throw cancelado();
  const controle = new AbortController();
  const cancelar = () => controle.abort();
  c.sinal?.addEventListener('abort', cancelar, { once: true });
  const limite = setTimeout(cancelar, TEMPO_LIMITE);
  // chamada solta: como método do contexto o objeto viraria o `this`, e o `fetch` do navegador recusa ("Illegal invocation")
  const buscar = c.buscar;
  try {
    const resposta = await buscar(url, { signal: controle.signal, headers: cabecalhos() });
    if (!resposta.ok) throw new ErroDeServico(resposta.status);
    return (await resposta.json()) as T;
  } finally {
    clearTimeout(limite);
    c.sinal?.removeEventListener('abort', cancelar);
  }
}

const sobra = <T>(lista: (T | null)[]): T[] => lista.filter((item): item is T => item !== null);

/** Para desempatar cidades basta saber a região: a posição vai aos serviços de terceiros arredondada em 0,05° (~5 km), nunca exata. */
const aproximar = (n: number) => Math.round(n * 20) / 20;
const regiaoDe = ({ lat, lng }: LatLng): LatLng => ({ lat: aproximar(lat), lng: aproximar(lng) });

const caixaEm = ({ lat, lng }: LatLng) =>
  [lng - METADE_DA_CAIXA, lat + METADE_DA_CAIXA, lng + METADE_DA_CAIXA, lat - METADE_DA_CAIXA].map((v) => v.toFixed(4)).join(',');

/** O texto não diz a cidade (nem o estado): aí vale procurar perto da pessoa. Se disser, a busca já sabe onde procurar. */
const usaPerto = (lido: EnderecoLido, c: Contexto): LatLng | null => (c.perto && !lido.uf && lido.resto.length === 0 ? regiaoDe(c.perto) : null);

async function daPhoton(texto: string, lido: EnderecoLido, c: Contexto): Promise<Candidato[]> {
  const perto = usaPerto(lido, c);
  const url = `${PHOTON}?${consulta({ q: texto, limit: '10', lat: perto ? String(perto.lat) : undefined, lon: perto ? String(perto.lng) : undefined })}`;
  const dados = await pedir<{ features?: FeicaoDaPhoton[] }>(url, c);
  return sobra((dados.features ?? []).map(dePhoton));
}

const NOMINATIM_BASE = { format: 'jsonv2', addressdetails: '1', limit: '5', 'accept-language': 'pt-BR', countrycodes: 'br' };

async function doNominatim(texto: string, lido: EnderecoLido, c: Contexto): Promise<Candidato[]> {
  const perto = usaPerto(lido, c);
  const url = `${NOMINATIM}/search?${consulta({ ...NOMINATIM_BASE, q: texto, ...(perto ? { viewbox: caixaEm(perto), bounded: '0' } : {}) })}`;
  return sobra((await pedir<RespostaDoNominatim[]>(url, c, true)).map(deNominatim));
}

/** Busca por campos: acha o número exato quando o mapa o tem, e não depende de o texto ter a ordem certa. */
async function doNominatimEstruturado(campos: { rua: string; numero?: string; cidade?: string; uf?: string }, c: Contexto): Promise<Candidato[]> {
  const rua = [campos.numero, campos.rua].filter(Boolean).join(' ');
  const url = `${NOMINATIM}/search?${consulta({ ...NOMINATIM_BASE, street: rua, city: campos.cidade, state: campos.uf ? UFS[campos.uf] : undefined, country: 'Brasil' })}`;
  return sobra((await pedir<RespostaDoNominatim[]>(url, c, true)).map(deNominatim));
}

/** Espera todos; só falha se TODOS falharam (um serviço fora do ar não derruba a busca). */
async function emParalelo(pedidos: Promise<Candidato[]>[], c: Contexto): Promise<Candidato[]> {
  const respostas = await Promise.allSettled(pedidos);
  if (c.sinal?.aborted) throw cancelado();
  const boas = respostas.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []));
  if (boas.length === 0) {
    const falha = respostas.find((r): r is PromiseRejectedResult => r.status === 'rejected');
    if (falha) throw falha.reason;
  }
  return boas.flat();
}

// ---------------------------------------------------------------- texto

const nucleoDaBusca = (lido: EnderecoLido) => lido.logradouro ?? lido.lugar ?? '';
const nomeDoEstado = (lido: EnderecoLido) => (lido.uf ? UFS[lido.uf] : undefined);
const juntar = (partes: (string | undefined)[]) => partes.filter((p) => p !== undefined && p !== '').join(', ');

/** O que foi entendido, na ordem de um endereço, com o estado por extenso (o "CE" sozinho o serviço não entende). O CEP fica de fora: o do mapa costuma ser outro do mesmo trecho. */
const textoCompleto = (lido: EnderecoLido) => juntar([nucleoDaBusca(lido), lido.numero, ...lido.resto, nomeDoEstado(lido)]);
/** Sem o bairro (o que o mapa mais estranha), ficando com o último trecho, que costuma ser a cidade. */
const textoSemBairro = (lido: EnderecoLido) => juntar([nucleoDaBusca(lido), lido.numero, lido.resto[lido.resto.length - 1], nomeDoEstado(lido)]);

/** Algum resultado é a rua (ou o lugar) que a pessoa escreveu, no estado que ela escreveu. */
function encontrouARua(lido: EnderecoLido, candidatos: Candidato[]): boolean {
  const doEstado = candidatos.filter((c) => lido.uf === undefined || c.uf === undefined || c.uf === lido.uf);
  if (lido.logradouro === undefined) return doEstado.length > 0;
  const buscada = lido.logradouro;
  return doEstado.some((c) => c.rua !== undefined && parecidoDeRuas(buscada, c.rua) >= 0.6);
}

interface Achados { candidatos: Candidato[]; lido: EnderecoLido }

async function porTexto(lido: EnderecoLido, c: Contexto): Promise<Achados> {
  const texto = textoCompleto(lido);
  let candidatos = await emParalelo([daPhoton(texto, lido, c), doNominatim(texto, lido, c)], c);

  if (!encontrouARua(lido, candidatos) && lido.logradouro !== undefined && lido.resto.length > 0) {
    try {
      const semBairro = textoSemBairro(lido);
      const cidade = lido.resto[lido.resto.length - 1];
      candidatos = [...candidatos, ...(await emParalelo([daPhoton(semBairro, lido, c), doNominatimEstruturado({ rua: lido.logradouro, numero: lido.numero, cidade, uf: lido.uf }, c)], c))];
    } catch (erro) {
      if (c.sinal?.aborted) throw erro; // falha só nesta segunda tentativa: fica com o que já veio
    }
  }

  if (!encontrouARua(lido, candidatos) && lido.cep !== undefined) {
    try {
      candidatos = [...candidatos, ...(await porCep(lido, c)).candidatos];
    } catch (erro) {
      if (c.sinal?.aborted) throw erro;
    }
  }
  return { candidatos, lido };
}

// ---------------------------------------------------------------- CEP

const formatarCep = (cep: string) => `${cep.slice(0, 5)}-${cep.slice(5)}`;

/** O texto do CEP: ViaCEP; se ele estiver fora do ar, a BrasilAPI (só o texto dela: a coordenada cai no centro da cidade). `null` = o CEP não existe. */
async function enderecoDoCep(cep: string, c: Contexto): Promise<EnderecoDoCep | null> {
  try {
    return deViaCep(await pedir<RespostaDoViaCep>(`${VIACEP}/${cep}/json/`, c));
  } catch (erro) {
    if (c.sinal?.aborted) throw erro;
    if (erro instanceof ErroDeServico && erro.status === 400) return null; // CEP mal formado
  }
  const daBrasilApi = deBrasilApi(await pedir<RespostaDaBrasilApi>(`${BRASILAPI}/${cep}`, c).catch((erro: unknown) => {
    if (erro instanceof ErroDeServico && erro.status === 404) return null;
    throw erro;
  }));
  if (!daBrasilApi) return null;
  delete daBrasilApi.pista;
  return daBrasilApi;
}

/** Último recurso: o ponto do CEP (entre 20 m e 2 km do endereço). Falha aqui vira "sem ponto", não erro. */
async function pontoDoCep(cep: string, c: Contexto): Promise<Candidato | null> {
  try {
    const r = deAwesomeApi(await pedir<RespostaDaAwesomeApi>(`${AWESOMEAPI}/${cep}`, c));
    if (!r?.pista) return null;
    return {
      fonte: 'cep', lat: r.pista.lat, lng: r.pista.lng, tipo: r.numero ? 'casa' : 'rua', aproximado: true, cep: formatarCep(cep),
      ...(r.rua ? { rua: r.rua } : {}), ...(r.numero ? { numero: r.numero } : {}), ...(r.bairro ? { bairro: r.bairro } : {}),
      ...(r.cidade ? { cidade: r.cidade } : {}), ...(r.uf ? { uf: r.uf } : {}),
    };
  } catch (erro) {
    if (c.sinal?.aborted) throw erro;
    return null;
  }
}

async function porCep(lido: EnderecoLido, c: Contexto): Promise<Achados> {
  const cep = lido.cep as string;
  const doCep = await enderecoDoCep(cep, c);
  if (!doCep) return { candidatos: [], lido };

  const texto = juntar([doCep.rua, doCep.numero, doCep.bairro, doCep.cidade, doCep.uf ? UFS[doCep.uf] : undefined]);
  const lidoDoCep = lerEndereco(texto);
  const nucleo = lidoDoCep.logradouro;
  const pedidos = nucleo
    ? [doNominatimEstruturado({ rua: nucleo, numero: lidoDoCep.numero, cidade: doCep.cidade, uf: doCep.uf }, c), daPhoton(texto, lidoDoCep, c)]
    : [doNominatim(texto, lidoDoCep, c), daPhoton(texto, lidoDoCep, c)];

  let candidatos: Candidato[] = [];
  try {
    candidatos = await emParalelo(pedidos, c);
  } catch (erro) {
    if (c.sinal?.aborted) throw erro;
    // os dois serviços de mapa falharam: ainda dá para tentar o ponto do CEP
  }
  if (candidatos.length === 0) {
    const ponto = await pontoDoCep(cep, c);
    if (ponto) candidatos = [ponto];
  }
  // o ponto de um CEP é o da rua, não o da porta, a não ser que o CEP seja de um prédio só e o mapa tenha aquele número
  const aoCep = candidatos.map((cand): Candidato => ({ ...cand, cep: formatarCep(cep), ...(cand.numero === undefined ? { aproximado: true } : {}) }));
  return { candidatos: aoCep, lido: lidoDoCep.logradouro || lidoDoCep.lugar ? { ...lidoDoCep, cep } : lido };
}

// ---------------------------------------------------------------- busca

const cache = new Map<string, { quando: number; lugares: Lugar[] }>();
export const limparCacheDeBusca = () => cache.clear();

const arredondar = (n: number) => n.toFixed(1);
const chaveDoCache = (texto: string, perto: LatLng | null) => `${normalizar(texto)}|${perto ? `${arredondar(perto.lat)},${arredondar(perto.lng)}` : ''}`;

function lerDoCache(chave: string): Lugar[] | undefined {
  const guardado = cache.get(chave);
  if (!guardado) return undefined;
  cache.delete(chave);
  if (Date.now() - guardado.quando >= VALIDADE_DO_CACHE) return undefined;
  cache.set(chave, guardado); // mais recente por último: sai primeiro o que não é usado há mais tempo
  return guardado.lugares;
}

function guardarNoCache(chave: string, lugares: Lugar[]) {
  cache.set(chave, { quando: Date.now(), lugares });
  if (cache.size > TAMANHO_DO_CACHE) cache.delete(cache.keys().next().value as string);
}

/** Só números soltos ("12", "1980") não são endereço; um CEP inteiro é. */
const ehEndereco = (texto: string) => /[a-z]/.test(normalizar(texto)) || ehCep(texto);

/**
 * Até cinco endereços ou lugares do Brasil para o que a pessoa digitou (rua, número, bairro, cidade, estado, CEP, ou o nome do
 * lugar), do que mais combina para o que menos. Lança erro só se nenhum serviço respondeu.
 */
export async function buscarLugares(texto: string, { sinal, perto = null, buscar = fetch, fila = FILA_DO_NOMINATIM }: Opcoes = {}): Promise<Lugar[]> {
  const q = texto.trim();
  if (q.length < MINIMO_DE_LETRAS || !ehEndereco(q)) return [];
  const chave = chaveDoCache(q, perto);
  const guardado = lerDoCache(chave);
  if (guardado) return guardado;

  const c: Contexto = { sinal, perto, buscar, fila };
  const lido = lerEndereco(q);
  const soCep = lido.cep !== undefined && lido.logradouro === undefined && lido.lugar === undefined && lido.resto.length === 0 && lido.uf === undefined;
  const achados = soCep ? await porCep(lido, c) : await porTexto(lido, c);
  const lugares = combinar(achados.candidatos, achados.lido, perto, LIMITE_DE_RESULTADOS).map((cand) => paraLugar(cand, achados.lido));
  guardarNoCache(chave, lugares);
  return lugares;
}

/** O endereço de um ponto tocado no mapa ("[lugar,] rua, número, bairro, cidade - UF, CEP"), ou `null` se o serviço não souber. */
export async function nomeDoPonto(lat: number, lng: number, { sinal, buscar = fetch, fila = FILA_DO_NOMINATIM }: Opcoes = {}): Promise<string | null> {
  const c: Contexto = { sinal, perto: null, buscar, fila };
  const url = `${NOMINATIM}/reverse?${consulta({ format: 'jsonv2', zoom: '18', addressdetails: '1', 'accept-language': 'pt-BR', lat: String(lat), lon: String(lng) })}`;
  let dado: (RespostaDoNominatim & { error?: string }) | null;
  try {
    dado = await pedir<RespostaDoNominatim & { error?: string }>(url, c, true);
  } catch (erro) {
    if (sinal?.aborted) throw erro;
    return null;
  }
  if (dado.error) return null;
  const candidato = deNominatim(dado);
  if (!candidato) return null;
  return descrever(candidato, true) || null;
}
