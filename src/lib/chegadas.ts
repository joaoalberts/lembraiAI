import type { Fence } from './geofence';

/**
 * Memória das chegadas a um lugar, guardada no aparelho para servir a dois avisadores que não se falam: o app aberto (avalia a
 * posição em JavaScript) e o geofence do sistema (acorda o app fechado). Sem ela um mesmo "cheguei" avisaria duas vezes, e o
 * sistema avisaria de novo sempre que as regiões fossem registradas com a pessoa já dentro (ele reenvia "entrou").
 */
export interface Armazenamento {
  getItem: (chave: string) => Promise<string | null>;
  setItem: (chave: string, valor: string) => Promise<void>;
}

const DENTRO = 'lembreiai:dentro:v1';
export const CERCAS_GUARDADAS = 'lembreiai:cercas:v1';

/**
 * Quanto tempo uma entrada sem saída ainda vale. A saída pode nunca chegar (o sistema não avisou, o app estava fechado sem
 * geofence); passado o prazo a próxima entrada volta a avisar, em vez de o lembrete ficar calado para sempre.
 */
export const TEMPO_DE_VALIDADE = 3 * 60 * 60 * 1000;

async function ler<T>(chave: string, armazenamento: Armazenamento, padrao: T): Promise<T> {
  try {
    const texto = await armazenamento.getItem(chave);
    return texto ? (JSON.parse(texto) as T) : padrao;
  } catch {
    return padrao;
  }
}
async function gravar(chave: string, valor: unknown, armazenamento: Armazenamento) {
  try { await armazenamento.setItem(chave, JSON.stringify(valor)); } catch { /* sem disco: pode avisar a mais, nunca a menos */ }
}

/** Marca a entrada e diz se DEVE avisar: falso quando a pessoa já estava dentro (dentro do prazo). */
export async function registrarEntrada(id: string, agora: number, armazenamento: Armazenamento): Promise<boolean> {
  const dentro = await ler<Record<string, number>>(DENTRO, armazenamento, {});
  const desde = dentro[id];
  if (typeof desde === 'number' && agora - desde < TEMPO_DE_VALIDADE) return false;
  await gravar(DENTRO, { ...dentro, [id]: agora }, armazenamento);
  return true;
}

export async function registrarSaida(id: string, armazenamento: Armazenamento): Promise<void> {
  const dentro = await ler<Record<string, number>>(DENTRO, armazenamento, {});
  if (!(id in dentro)) return;
  const { [id]: _saiu, ...resto } = dentro;
  await gravar(DENTRO, resto, armazenamento);
}

export interface CercaGuardada { title: string; place: string }

/**
 * O app aberto guarda o que a tarefa em segundo plano vai precisar (título e endereço de cada lembrete por local: o evento do
 * sistema só traz o id) e esquece o que saiu da lista, inclusive a marca de "dentro" dele.
 */
export async function lembrarCercas(cercas: Fence[], armazenamento: Armazenamento): Promise<void> {
  const guardadas: Record<string, CercaGuardada> = {};
  for (const c of cercas) guardadas[c.id] = { title: c.title, place: c.place };
  await gravar(CERCAS_GUARDADAS, guardadas, armazenamento);
  const dentro = await ler<Record<string, number>>(DENTRO, armazenamento, {});
  const vivos = Object.fromEntries(Object.entries(dentro).filter(([id]) => id in guardadas));
  if (Object.keys(vivos).length !== Object.keys(dentro).length) await gravar(DENTRO, vivos, armazenamento);
}

export async function lerCerca(id: string, armazenamento: Armazenamento): Promise<CercaGuardada | null> {
  const guardadas = await ler<Record<string, CercaGuardada>>(CERCAS_GUARDADAS, armazenamento, {});
  return guardadas[id] ?? null;
}
