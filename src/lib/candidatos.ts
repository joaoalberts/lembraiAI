import { distance, type LatLng } from './geo';
import { normalizar, type EnderecoLido } from './enderecos';

/**
 * O que cada serviço de busca devolve, na mesma forma, e como escolher entre eles: cada resultado ganha uma nota pelo quanto
 * bate com o que a pessoa digitou (rua, número, bairro, cidade, estado, CEP, nome de lugar, distância). Nenhum serviço acerta
 * tudo: o OpenStreetMap tem pouco número de porta no Brasil, um CEP não é um ponto, e a mesma rua existe em várias cidades.
 */
export type Fonte = 'photon' | 'nominatim' | 'cep';

export interface Candidato {
  fonte: Fonte;
  lat: number;
  lng: number;
  /** Nome do lugar ("Universidade de Fortaleza"), quando é um lugar e não só um endereço. */
  nome?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  /** Sigla do estado. */
  uf?: string;
  cep?: string;
  tipo: 'casa' | 'rua' | 'lugar' | 'area';
  /** O ponto é o da rua, do trecho ou do CEP, não o da porta: quem escolhe deve conferir o pino no mapa. */
  aproximado?: boolean;
}

/** O que a caixa de busca mostra e o formulário guarda. */
export interface Lugar {
  /** Primeira linha: "Avenida Washington Soares, 1321" ou o nome do lugar. */
  nome: string;
  /** Segunda linha: bairro, cidade e estado. */
  detalhe: string;
  /** O endereço numa linha só, o que o lembrete guarda: "[lugar,] rua, número, bairro, cidade - UF, CEP". */
  completo: string;
  lat: number;
  lng: number;
  /** A pessoa digitou um número que o mapa não tem (ou tem outro), ou o ponto veio de um CEP: o pino cai na rua, e ela confere no mapa. */
  aproximado?: boolean;
  fonte?: Fonte;
}

const TIPOS_DE_LOGRADOURO = new Set(['rua', 'avenida', 'av', 'travessa', 'praca', 'alameda', 'rodovia', 'estrada', 'largo', 'viela', 'beco', 'parque', 'jardim', 'conjunto']);
const LIGACOES = new Set(['de', 'do', 'da', 'dos', 'das', 'e']);

/** As palavras que identificam a rua: sem o tipo ("Avenida", "Rua") e sem "de", "do"... */
function nucleoDaRua(rua: string): string[] {
  const palavras = normalizar(rua).split(' ').filter(Boolean);
  if (palavras.length > 1 && TIPOS_DE_LOGRADOURO.has(palavras[0])) palavras.shift();
  return palavras.filter((p) => !LIGACOES.has(p));
}

/** Distância de edição com a troca de duas letras vizinhas valendo 1 ("Bilahr" e "Bilhar" estão a 1). */
function distanciaDeDigitacao(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...new Array<number>(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const custo = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + custo);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

/** Iguais, ou parecidas por um erro só de digitação numa palavra comprida (nas curtas, "Vilar" e "Vilas" são ruas diferentes). */
const mesmaPalavra = (a: string, b: string): boolean => a === b || (Math.min(a.length, b.length) >= 6 && distanciaDeDigitacao(a, b) <= 1);

const sobreposicao = (a: string[], b: string[]): number => {
  if (a.length === 0 || b.length === 0) return 0;
  return a.filter((p) => b.some((q) => mesmaPalavra(p, q))).length / Math.max(a.length, b.length);
};

/** De 0 a 1: o quanto duas ruas têm as mesmas palavras (sem o tipo, "Rua" ou "Avenida", e sem "de", "do"...). */
export const parecidoDeRuas = (a: string, b: string): number => sobreposicao(nucleoDaRua(a), nucleoDaRua(b));

const soDigitos = (t: string | undefined) => (t ?? '').replace(/\D/g, '');

const dentroDoBrasil = (c: Candidato) => Number.isFinite(c.lat) && Number.isFinite(c.lng) && c.lat >= -34 && c.lat <= 6 && c.lng >= -74 && c.lng <= -28;

/** Quanto o resultado é o que a pessoa escreveu (maior é melhor). */
export function pontuar(c: Candidato, lido: EnderecoLido, perto?: LatLng | null): number {
  let nota = 0;

  // o número só diz alguma coisa na rua que a pessoa escreveu: "1000" em outra rua não é o endereço, e a rua toda diferente é resultado errado
  let naRuaCerta = true;
  if (lido.logradouro && c.rua) {
    const s = parecidoDeRuas(lido.logradouro, c.rua);
    nota += Math.round(40 * s * s);
    naRuaCerta = s >= 0.5;
    if (s < 0.3) nota -= 25;
  }
  if (lido.numero && naRuaCerta) {
    if (c.numero && normalizar(c.numero) === normalizar(lido.numero)) nota += 40;
    else if (c.numero) nota -= 10;
  }
  const partes = lido.resto.map(normalizar);
  const contem = (parte: string, alvo: string | undefined) => {
    const a = normalizar(alvo ?? '');
    return a.length >= 3 && (parte === a || parte.includes(a) || (parte.length >= 3 && a.includes(parte)));
  };
  if (partes.some((p) => contem(p, c.bairro))) nota += 10;
  if (partes.some((p) => contem(p, c.cidade))) nota += 15;
  if (lido.uf && c.uf) nota += c.uf === lido.uf ? 10 : -40;

  if (lido.cep && c.cep) {
    const dela = soDigitos(c.cep);
    if (dela === lido.cep) nota += 30;
    else if (dela.slice(0, 5) === lido.cep.slice(0, 5)) nota += 10;
  }

  if (lido.lugar && c.nome) {
    const buscado = normalizar(lido.lugar).split(' ').filter((p) => !LIGACOES.has(p));
    const doResultado = new Set(normalizar(c.nome).split(' '));
    if (buscado.length > 0) nota += Math.round((50 * buscado.filter((p) => doResultado.has(p)).length) / buscado.length);
    if (normalizar(c.nome) === normalizar(lido.lugar)) nota += 10; // desempata "Reitoria da UFC" de "Reitoria UFC": as palavras que contam são as mesmas
  }

  // sem cidade na busca, o que está perto da pessoa (ou do centro do mapa) é o mais provável
  if (perto && !lido.uf && lido.resto.length === 0) {
    const km = distance(perto, c) / 1000;
    if (km < 15) nota += 20;
    else if (km < 60) nota += 10;
  }

  nota += c.tipo === 'casa' ? 5 : c.tipo === 'rua' ? 3 : c.tipo === 'lugar' ? 2 : 0;
  return nota;
}

const nucleo = (c: Candidato) => nucleoDaRua(c.rua ?? '').join(' ');
const chaveDoEndereco = (c: Candidato) => `${nucleo(c)}|${normalizar(c.numero ?? '')}|${normalizar(c.rua ? '' : c.nome ?? '')}`;
const regiaoDe = (c: Candidato) => (c.bairro && c.cidade ? `${normalizar(c.bairro)}|${normalizar(c.cidade)}` : '');

/**
 * É o mesmo endereço? Sim quando a rua e o número batem e os pontos estão colados (dois serviços que leem o mesmo objeto do mapa)
 * ou quando os dois dizem o mesmo bairro e cidade (a Photon devolve uma avenida em pedaços, um por trecho: viraria uma lista de
 * linhas idênticas). "Rua" e "Avenida" do mesmo nome são ruas diferentes.
 */
function mesmoEndereco(a: Candidato, b: Candidato): boolean {
  if (chaveDoEndereco(a) !== chaveDoEndereco(b)) return false;
  if (distance(a, b) < 80) return true;
  const mesmaRegiao = regiaoDe(a) !== '' && regiaoDe(a) === regiaoDe(b);
  return mesmaRegiao && normalizar(a.rua ?? '') === normalizar(b.rua ?? '');
}

const definidos = (c: Candidato): Partial<Candidato> => Object.fromEntries(Object.entries(c).filter(([, valor]) => valor !== undefined));

/** O que só o outro sabia (CEP, bairro, nome do lugar...) entra no que ficou; as coordenadas e o "aproximado" continuam os do que ficou. */
function completar(fica: Candidato, outro: Candidato): Candidato {
  const dele = definidos(outro);
  delete dele.aproximado;
  return { ...dele, ...definidos(fica) } as Candidato;
}

/** Junta o que vários serviços devolveram: tira o que está fora do Brasil, ordena pelo quanto combina com a busca e junta o repetido. */
export function combinar(candidatos: Candidato[], lido: EnderecoLido, perto: LatLng | null | undefined, maximo: number): Candidato[] {
  const noBrasil = candidatos.filter(dentroDoBrasil);
  // havendo a rua que a pessoa escreveu entre os resultados, os de rua toda diferente (o mesmo número em outra rua) são só ruído
  const semelhanca = (c: Candidato) => (lido.logradouro !== undefined && c.rua !== undefined ? parecidoDeRuas(lido.logradouro, c.rua) : undefined);
  const temARua = noBrasil.some((c) => (semelhanca(c) ?? 0) >= 0.5);
  const uteis = temARua ? noBrasil.filter((c) => (semelhanca(c) ?? 1) >= 0.3) : noBrasil;
  const ordenados = uteis
    .map((c, indice) => ({ c, indice, nota: pontuar(c, lido, perto) }))
    .sort((a, b) => b.nota - a.nota || a.indice - b.indice)
    .map(({ c }) => c);
  const unicos: Candidato[] = [];
  for (const c of ordenados) {
    const repetido = unicos.findIndex((u) => mesmoEndereco(u, c));
    if (repetido === -1) unicos.push(c);
    else unicos[repetido] = completar(unicos[repetido], c);
  }
  return unicos.slice(0, maximo);
}

const cidadeEUf = (c: Candidato) => (c.cidade ? `${c.cidade}${c.uf ? ` - ${c.uf}` : ''}` : c.uf);

/** O endereço numa linha só: "[lugar,] rua, número, bairro, cidade - UF, CEP". É o que o lembrete guarda. */
export function descrever(c: Candidato, comNome: boolean): string {
  const enderecoCurto = c.rua ? `${c.rua}${c.numero ? `, ${c.numero}` : ''}` : undefined;
  return [comNome ? c.nome : undefined, enderecoCurto, c.bairro, cidadeEUf(c), c.cep].filter(Boolean).join(', ');
}

export function paraLugar(c: Candidato, lido: EnderecoLido): Lugar {
  const enderecoCurto = c.rua ? `${c.rua}${c.numero ? `, ${c.numero}` : ''}` : undefined;
  const cidadeUf = cidadeEUf(c);
  const regiao = [c.bairro, cidadeUf].filter(Boolean).join(', ');
  const porLugar = lido.lugar !== undefined && c.nome !== undefined;

  let nome: string;
  let detalhe: string;
  if (porLugar) {
    nome = c.nome as string;
    detalhe = [enderecoCurto, regiao].filter(Boolean).join(' · ');
  } else {
    nome = enderecoCurto ?? c.nome ?? c.bairro ?? c.cidade ?? 'Local';
    detalhe = [c.bairro, cidadeUf, c.cep].filter(Boolean).join(', ');
    if (!enderecoCurto) detalhe = [cidadeUf, c.cep].filter(Boolean).join(', ');
  }
  const numeroDiferente = lido.numero !== undefined && normalizar(c.numero ?? '') !== normalizar(lido.numero);
  const aproximado = c.fonte === 'cep' || c.aproximado === true || numeroDiferente ? true : undefined;
  return { nome, detalhe, completo: descrever(c, porLugar), lat: c.lat, lng: c.lng, ...(aproximado ? { aproximado } : {}), fonte: c.fonte };
}
