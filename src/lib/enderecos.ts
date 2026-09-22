/**
 * Leitura de endereço brasileiro digitado à mão: rua, número, bairro, cidade, estado e CEP, com as abreviações de sempre
 * ("Av.", "R.", "nº", "s/n"). Não fala com serviço nenhum: só separa as partes, para a busca poder tentar do mais preciso
 * (endereço completo) ao mais solto (só a rua) e para o resultado poder ser conferido contra o que a pessoa escreveu.
 */

/** Unidades da federação: sigla e nome. */
export const UFS: Record<string, string> = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia', CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo',
  GO: 'Goiás', MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul', MG: 'Minas Gerais', PA: 'Pará', PB: 'Paraíba',
  PR: 'Paraná', PE: 'Pernambuco', PI: 'Piauí', RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul',
  RO: 'Rondônia', RR: 'Roraima', SC: 'Santa Catarina', SP: 'São Paulo', SE: 'Sergipe', TO: 'Tocantins',
};

/** Texto sem acento, em minúsculas e só com letras e números separados por um espaço: para comparar o que a pessoa escreveu com o que o serviço devolveu. */
export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

/** Só o CEP, com ou sem hífen. */
export const ehCep = (texto: string): boolean => /^\d{5}-?\d{3}$/.test(texto.trim());

export interface EnderecoLido {
  original: string;
  /** Rua com o tipo por extenso ("Avenida Washington Soares"), sem o número. */
  logradouro?: string;
  numero?: string;
  /** A pessoa escreveu "s/n": o endereço não tem número, então não adianta procurar um. */
  semNumero?: boolean;
  /** Nome de lugar ("Shopping Iguatemi Fortaleza"): o primeiro trecho não começa com tipo de logradouro. */
  lugar?: string;
  /** O que sobrou depois da rua e do número, na ordem escrita (bairro, cidade...). Sem estado, sem CEP e sem complemento. */
  resto: string[];
  /** Sigla do estado ("CE"). */
  uf?: string;
  /** Só os 8 dígitos. */
  cep?: string;
  /** O que foi entendido, já com o tipo por extenso, para busca de texto livre. */
  livre: string;
}

const TIPOS: [RegExp, string][] = [
  [/^(?:r|rua)\.?$/i, 'Rua'],
  [/^(?:av|avda|avenida)\.?$/i, 'Avenida'],
  [/^(?:tv|trav|travessa)\.?$/i, 'Travessa'],
  [/^(?:pç|pça|pc|pca|praça|praca)\.?$/i, 'Praça'],
  [/^(?:al|alam|alameda)\.?$/i, 'Alameda'],
  [/^(?:rod|rodovia)\.?$/i, 'Rodovia'],
  [/^(?:est|estr|estrada)\.?$/i, 'Estrada'],
  [/^(?:lg|largo)\.?$/i, 'Largo'],
  [/^(?:vl|viela)\.?$/i, 'Viela'],
  [/^(?:bc|beco)\.?$/i, 'Beco'],
  [/^(?:pq|parque)\.?$/i, 'Parque'],
  [/^(?:jd|jardim)\.?$/i, 'Jardim'],
  [/^(?:cj|conj|conjunto)\.?$/i, 'Conjunto'],
];

const NOMES_DE_ESTADO: Map<string, string> = new Map(Object.entries(UFS).map(([sigla, nome]) => [normalizar(nome), sigla]));
/** Estados que também são nome de cidade: "Rua A, 10, São Paulo" é a cidade, não só o estado. */
const ESTADO_QUE_E_CIDADE = new Set(['SP', 'RJ']);
const PREPOSICOES = new Set(['de', 'do', 'da', 'dos', 'das', 'e', 'a', 'o', 'em', 'no', 'na']);
const COMPLEMENTO = /^(?:apto?\.?|apartamento|sala|sl|bloco|bl|loja|andar|casa)\s+\S+/i;
const MARCA_SEM_NUMERO = 'SN';

const ehNumeroDePorta = (t: string) => /^\d{1,6}[A-Za-z]?$/.test(t);
const ehCodigoDeRodovia = (t: string | undefined) => t !== undefined && /^[A-Z]{2}$/.test(t);

function tipoDoLogradouro(primeiroToken: string): string | undefined {
  return TIPOS.find(([regra]) => regra.test(primeiroToken))?.[1];
}

/** Tira o estado do fim da última parte (sigla ou nome por extenso). */
function tirarEstado(partes: string[]): { partes: string[]; uf?: string } {
  const ultima = partes[partes.length - 1];
  if (ultima === undefined) return { partes };
  const resto = partes.slice(0, -1);
  const tokens = ultima.split(' ');

  const inteiro = normalizar(ultima);
  if (partes.length >= 2) {
    const porNome = NOMES_DE_ESTADO.get(inteiro);
    if (porNome) return { partes: ESTADO_QUE_E_CIDADE.has(porNome) ? partes : resto, uf: porNome };
    if (/^[A-Za-z]{2}$/.test(ultima) && UFS[ultima.toUpperCase()]) return { partes: resto, uf: ultima.toUpperCase() };
  }

  // estado colado ao fim da última parte ("Fortaleza CE", "fortaleza ce", "Fortaleza Ceará")
  const temNumero = partes.some((p) => p.split(' ').some(ehNumeroDePorta));
  if (tokens.length >= 2 && (partes.length >= 2 || temNumero)) {
    const sigla = tokens[tokens.length - 1];
    const antes = normalizar(tokens[tokens.length - 2]);
    if (/^[A-Za-z]{2}$/.test(sigla) && UFS[sigla.toUpperCase()] && !PREPOSICOES.has(antes) && (partes.length >= 2 || tokens.length >= 3)) {
      return { partes: [...resto, tokens.slice(0, -1).join(' ')], uf: sigla.toUpperCase() };
    }
    for (let n = Math.min(4, tokens.length - 1); n >= 1; n--) {
      const cauda = normalizar(tokens.slice(-n).join(' '));
      const porNome = NOMES_DE_ESTADO.get(cauda);
      if (porNome && (partes.length >= 2 || temNumero)) return { partes: [...resto, tokens.slice(0, -n).join(' ')], uf: porNome };
    }
  }
  return { partes };
}

/** Separa a rua do número dentro do primeiro trecho. */
function lerRua(trecho: string): { logradouro?: string; numero?: string; sobra?: string; lugar?: string } {
  const tokens = trecho.split(' ').filter(Boolean);
  const tipo = tipoDoLogradouro(tokens[0] ?? '');
  if (!tipo || tokens.length < 2) return { lugar: trecho };

  // candidatos a número de porta: numéricos, com ao menos uma palavra entre o tipo e eles, que não abrem "25 de Março" nem seguem o código da rodovia
  let indice = -1;
  for (let i = 2; i < tokens.length; i++) {
    if (!ehNumeroDePorta(tokens[i])) continue;
    if (PREPOSICOES.has(normalizar(tokens[i + 1] ?? '')) && tokens[i + 1] && /^d[eoa]s?$/i.test(tokens[i + 1])) continue;
    if (ehCodigoDeRodovia(tokens[i - 1])) continue;
    indice = i;
  }
  const nome = [tipo, ...(indice === -1 ? tokens.slice(1) : tokens.slice(1, indice))].join(' ');
  if (indice === -1) return { logradouro: nome };
  const sobra = tokens.slice(indice + 1).join(' ');
  return { logradouro: nome, numero: tokens[indice], sobra: sobra || undefined };
}

export function lerEndereco(texto: string): EnderecoLido {
  const original = texto;
  let t = texto.replace(/\s+/g, ' ').trim();
  const vazio: EnderecoLido = { original, resto: [], livre: '' };
  if (!t) return vazio;

  let cep: string | undefined;
  const acheiCep = t.match(/(^|[^\d])(\d{5})-?(\d{3})(?!\d)/);
  if (acheiCep) {
    cep = `${acheiCep[2]}${acheiCep[3]}`;
    t = t.replace(acheiCep[0], `${acheiCep[1]} `).replace(/\s+/g, ' ').trim();
    // o rótulo que veio junto ("CEP 60811-905", "C.E.P.: ...") sai com o número: sobraria como se fosse o nome de um lugar
    t = t.replace(/(^|[\s,;(-])c\.?e\.?p\.?\s*:?\s*(?=$|[\s,;)-])/gi, '$1').replace(/\s+/g, ' ').replace(/[\s,;-]+$/, '').trim();
  }

  t = t
    .replace(/\bs\s*\/\s*n[ºo°]?(?![a-z])|\bsem\s+n[uú]mero\b|\bs\.n\.?(?=\s|,|$)/gi, ` ${MARCA_SEM_NUMERO} `)
    .replace(/\b(?:n[ºo°]\.?|n\.|num\.?|n[uú]mero)\s*(?=\d)/gi, '')
    .replace(/\s+[-–—]\s+/g, ', ')
    .replace(/\s*\/\s*/g, ', ');

  let partes = t.split(',').map((p) => p.replace(/\s+/g, ' ').trim()).filter(Boolean);
  if (partes.length === 0) return { ...vazio, cep, livre: cep ?? '' };

  const semEstado = tirarEstado(partes);
  partes = semEstado.partes;
  const uf = semEstado.uf;

  let semNumero = false;
  const limpar = (p: string) => (p.includes(MARCA_SEM_NUMERO) ? (semNumero = true, p.replace(MARCA_SEM_NUMERO, '').trim()) : p);
  partes = partes.map(limpar).filter(Boolean);
  if (partes.length === 0) return { ...vazio, cep, uf, livre: [uf, cep].filter(Boolean).join(', ') };

  const [primeiro, ...outros] = partes;
  const rua = lerRua(primeiro);
  let numero = rua.numero;
  let sobras = outros;
  if (rua.logradouro && numero === undefined && sobras[0] !== undefined && /^\d{1,6}[A-Za-z]?$/.test(sobras[0])) {
    numero = sobras[0];
    sobras = sobras.slice(1);
  }
  const resto = [...(rua.sobra ? [rua.sobra] : []), ...sobras]
    .filter((p) => !COMPLEMENTO.test(p))
    .filter((p, i, todos) => i === 0 || normalizar(p) !== normalizar(todos[i - 1]));

  const nucleo = rua.logradouro ?? rua.lugar;
  const livre = [nucleo, numero, ...resto, uf].filter(Boolean).join(', ');
  return {
    original,
    logradouro: rua.logradouro,
    numero,
    semNumero: semNumero || undefined,
    lugar: rua.lugar,
    resto,
    uf,
    cep,
    livre,
  };
}
