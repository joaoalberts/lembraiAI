import type { Candidato } from './candidatos';
import { UFS, normalizar } from './enderecos';

/**
 * Tradução da resposta de cada serviço de busca (todos gratuitos e sem chave) para o `Candidato` comum. Só mapeia campos: quem
 * pede, espera e escolhe é `geocodificar.ts`.
 */

const SIGLA_PELO_NOME = new Map(Object.entries(UFS).map(([sigla, nome]) => [normalizar(nome), sigla]));
const siglaDoEstado = (nome?: string): string | undefined => (nome ? SIGLA_PELO_NOME.get(normalizar(nome)) : undefined);

// ---------------------------------------------------------------- Nominatim (OpenStreetMap)

export interface RespostaDoNominatim {
  lat: string;
  lon: string;
  category?: string;
  type?: string;
  addresstype?: string;
  name?: string;
  display_name?: string;
  address?: Record<string, string | undefined>;
}

const CATEGORIAS_DE_LUGAR = new Set(['amenity', 'shop', 'tourism', 'leisure', 'office', 'building', 'historic', 'craft', 'healthcare', 'man_made']);
const TIPOS_DE_AREA = new Set(['suburb', 'neighbourhood', 'quarter', 'city_district', 'city', 'town', 'village', 'municipality', 'county', 'state', 'administrative', 'borough', 'district', 'region']);

export function deNominatim(r: RespostaDoNominatim): Candidato | null {
  const lat = Number(r.lat);
  const lng = Number(r.lon);
  const a = r.address ?? {};
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (a.country_code && a.country_code.toLowerCase() !== 'br') return null;

  const rua = a.road ?? a.pedestrian ?? a.footway ?? a.path ?? a.residential ?? a.street;
  const numero = a.house_number;
  const bairro = a.suburb ?? a.neighbourhood ?? a.quarter ?? a.city_district ?? a.borough;
  const cidade = a.city ?? a.town ?? a.village ?? a.municipality ?? a.county;
  const sigla = a['ISO3166-2-lvl4']?.startsWith('BR-') ? a['ISO3166-2-lvl4'].slice(3) : siglaDoEstado(a.state);
  const ehArea = TIPOS_DE_AREA.has(r.addresstype ?? '') || (r.category === 'boundary' && !rua);
  const nomeDeLugar = r.name && r.name !== rua && CATEGORIAS_DE_LUGAR.has(r.category ?? '') ? r.name : undefined;

  const tipo: Candidato['tipo'] = ehArea ? 'area' : numero ? 'casa' : rua && !nomeDeLugar ? 'rua' : nomeDeLugar ? 'lugar' : 'rua';
  return {
    fonte: 'nominatim', lat, lng,
    ...(nomeDeLugar ? { nome: nomeDeLugar } : {}),
    ...(rua ? { rua } : {}),
    ...(numero ? { numero } : {}),
    ...(bairro ? { bairro } : {}),
    ...(cidade ? { cidade } : {}),
    ...(sigla ? { uf: sigla } : {}),
    ...(a.postcode ? { cep: a.postcode } : {}),
    tipo,
  };
}

// ---------------------------------------------------------------- Photon (komoot, também OpenStreetMap)

export interface FeicaoDaPhoton {
  type?: string;
  geometry: { type?: string; coordinates: number[] };
  properties: {
    name?: string; street?: string; housenumber?: string; district?: string; locality?: string; city?: string; county?: string;
    state?: string; postcode?: string; countrycode?: string; osm_key?: string; osm_value?: string; type?: string;
  };
}

export function dePhoton(f: FeicaoDaPhoton): Candidato | null {
  const p = f.properties;
  const [lng = Number.NaN, lat = Number.NaN] = f.geometry.coordinates;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (p.countrycode && p.countrycode.toUpperCase() !== 'BR') return null;

  const ehRua = p.type === 'street';
  const ehArea = ['district', 'locality', 'city', 'county', 'state'].includes(p.type ?? '');
  const rua = p.street ?? (ehRua ? p.name : undefined);
  const nome = !ehRua && !ehArea && p.name && p.name !== rua ? p.name : undefined;
  const tipo: Candidato['tipo'] = ehArea ? 'area' : p.housenumber ? 'casa' : ehRua ? 'rua' : nome ? 'lugar' : 'rua';
  const cidade = p.city ?? p.county;
  const sigla = siglaDoEstado(p.state);
  const bairro = p.district ?? (ehArea ? undefined : p.locality);
  return {
    fonte: 'photon', lat, lng,
    ...(nome ? { nome } : {}),
    ...(rua ? { rua } : {}),
    ...(p.housenumber ? { numero: p.housenumber } : {}),
    ...(bairro ? { bairro } : {}),
    ...(cidade ? { cidade } : {}),
    ...(sigla ? { uf: sigla } : {}),
    ...(p.postcode ? { cep: p.postcode } : {}),
    tipo,
  };
}

// ---------------------------------------------------------------- CEP (BrasilAPI e ViaCEP)

/**
 * O que um CEP diz: o endereço em texto. A `pista` (coordenada do serviço) só guia: a da BrasilAPI ficou no centro da cidade (a
 * ~10 km, em 29 de 30 CEPs) e a da AwesomeAPI, a do CEP, ficou entre 20 m e 2 km do ponto.
 */
export interface EnderecoDoCep {
  cep: string;
  rua?: string;
  /** Só quando o CEP é de um prédio só (o ViaCEP guarda o número no "complemento"). */
  numero?: string;
  /** Nome do lugar dono do CEP ("... UNIFOR"), quando ele tem um. */
  nome?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  pista?: { lat: number; lng: number };
}

const ehNumeroDePorta = (t: string | undefined): t is string => t !== undefined && /^\d{1,6}[A-Za-z]?$/.test(t.trim());

export interface RespostaDaBrasilApi {
  cep?: string; state?: string; city?: string; neighborhood?: string; street?: string;
  location?: { type?: string; coordinates?: { longitude?: string | number; latitude?: string | number } };
}

export function deBrasilApi(r: RespostaDaBrasilApi | null): EnderecoDoCep | null {
  if (!r || !r.cep) return null;
  const lat = Number(r.location?.coordinates?.latitude);
  const lng = Number(r.location?.coordinates?.longitude);
  return {
    cep: r.cep.replace(/\D/g, ''),
    ...(r.street ? { rua: r.street } : {}),
    ...(r.neighborhood ? { bairro: r.neighborhood } : {}),
    ...(r.city ? { cidade: r.city } : {}),
    ...(r.state ? { uf: r.state } : {}),
    ...(Number.isFinite(lat) && Number.isFinite(lng) && r.location?.coordinates?.latitude !== undefined ? { pista: { lat, lng } } : {}),
  };
}

export interface RespostaDoViaCep {
  cep?: string; logradouro?: string; complemento?: string; unidade?: string; bairro?: string; localidade?: string; uf?: string; erro?: boolean | string;
}

export function deViaCep(r: RespostaDoViaCep | null): EnderecoDoCep | null {
  if (!r || r.erro || !r.cep) return null;
  return {
    cep: r.cep.replace(/\D/g, ''),
    ...(r.logradouro ? { rua: r.logradouro } : {}),
    ...(ehNumeroDePorta(r.complemento) ? { numero: r.complemento.trim() } : {}),
    ...(r.unidade ? { nome: r.unidade } : {}),
    ...(r.bairro ? { bairro: r.bairro } : {}),
    ...(r.localidade ? { cidade: r.localidade } : {}),
    ...(r.uf ? { uf: r.uf } : {}),
  };
}

export interface RespostaDaAwesomeApi {
  cep?: string; address_type?: string; address_name?: string; address?: string; state?: string; district?: string; city?: string;
  lat?: string | number; lng?: string | number; code?: string;
}

export function deAwesomeApi(r: RespostaDaAwesomeApi | null): EnderecoDoCep | null {
  if (!r || r.code || !r.cep) return null;
  const naPorta = r.address?.match(/^(.*?),\s*(\d{1,6}[A-Za-z]?)$/);
  const rua = naPorta ? naPorta[1] : r.address;
  const lat = r.lat === undefined || r.lat === '' ? Number.NaN : Number(r.lat);
  const lng = r.lng === undefined || r.lng === '' ? Number.NaN : Number(r.lng);
  return {
    cep: r.cep.replace(/\D/g, ''),
    ...(rua ? { rua } : {}),
    ...(naPorta ? { numero: naPorta[2] } : {}),
    ...(r.district ? { bairro: r.district } : {}),
    ...(r.city ? { cidade: r.city } : {}),
    ...(r.state ? { uf: r.state } : {}),
    ...(Number.isFinite(lat) && Number.isFinite(lng) ? { pista: { lat, lng } } : {}),
  };
}
