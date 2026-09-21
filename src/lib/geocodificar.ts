import { Platform } from 'react-native';

/**
 * Busca de endereços e lugares pelo Nominatim (OpenStreetMap): gratuito e sem chave nem conta, como o mapa (Leaflet).
 * A política do serviço pede uso leve (no máximo 1 pedido por segundo: quem chama deve esperar o usuário parar de
 * digitar) e a identificação do app. Na web o navegador já se identifica; no celular vai um User-Agent próprio.
 */
const BASE = 'https://nominatim.openstreetmap.org';

/** Abaixo disso a busca devolve lixo e gasta a cota. */
export const MINIMO_DE_LETRAS = 3;
export const LIMITE_DE_RESULTADOS = 5;

export interface Lugar {
  /** Primeira parte do nome ("Supermercado Frangolândia"). */
  nome: string;
  /** O resto do endereço, para a segunda linha da lista. */
  detalhe: string;
  lat: number;
  lng: number;
}

interface RespostaDaBusca { lat: string; lon: string; display_name: string; name?: string }

interface Opcoes {
  sinal?: AbortSignal;
  /** Só para os testes. */
  buscar?: typeof fetch;
}

const cabecalhos = (): Record<string, string> =>
  Platform.OS === 'web' ? {} : { 'User-Agent': 'LembreiAi/1.0 (lembretes por hora e lugar)' };

function paraLugar(r: RespostaDaBusca): Lugar {
  const partes = r.display_name.split(', ');
  const nome = r.name || partes[0];
  // o endereço completo costuma começar pelo próprio nome: não repetir na segunda linha
  const detalhe = (partes[0] === nome ? partes.slice(1) : partes).join(', ');
  return { nome, detalhe, lat: Number(r.lat), lng: Number(r.lon) };
}

export async function buscarLugares(consulta: string, { sinal, buscar = fetch }: Opcoes = {}): Promise<Lugar[]> {
  const q = consulta.trim();
  if (q.length < MINIMO_DE_LETRAS) return [];
  const url = `${BASE}/search?format=jsonv2&limit=${LIMITE_DE_RESULTADOS}&accept-language=pt-BR&q=${encodeURIComponent(q)}`;
  const resposta = await buscar(url, { signal: sinal, headers: cabecalhos() });
  if (!resposta.ok) throw new Error(`busca de endereço indisponível (${resposta.status})`);
  const dados = (await resposta.json()) as RespostaDaBusca[];
  return dados.map(paraLugar).filter((l) => Number.isFinite(l.lat) && Number.isFinite(l.lng));
}

/** Nome legível de um ponto tocado no mapa, ou `null` se o serviço não souber (o lembrete guarda o que for devolvido). */
export async function nomeDoPonto(lat: number, lng: number, { sinal, buscar = fetch }: Opcoes = {}): Promise<string | null> {
  const url = `${BASE}/reverse?format=jsonv2&zoom=18&accept-language=pt-BR&lat=${lat}&lon=${lng}`;
  const resposta = await buscar(url, { signal: sinal, headers: cabecalhos() });
  if (!resposta.ok) return null;
  const dado = (await resposta.json()) as { name?: string; display_name?: string; error?: string };
  if (dado.error) return null;
  return dado.name || dado.display_name?.split(', ').slice(0, 2).join(', ') || null;
}
