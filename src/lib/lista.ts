import { SECTIONS, type Reminder, type Section } from '../data/reminders';
import { fold, formatDate, sectionOf, todayISO } from './format';

/** Filtros da lista "Meus lembretes", na ordem em que aparecem. */
export type FiltroDaLista = 'todos' | 'hoje' | 'semana' | 'locais';

export const FILTROS: { chave: FiltroDaLista; rotulo: string }[] = [
  { chave: 'todos', rotulo: 'Todos' },
  { chave: 'hoje', rotulo: 'Hoje' },
  { chave: 'semana', rotulo: 'Esta semana' },
  { chave: 'locais', rotulo: 'Locais' },
];

/**
 * A busca casa em título, lugar, data e hora, tudo junto: "mercado sab" acha "Comprar água no mercado" de "Sáb, 19 de set".
 * Sem acento e sem diferença de maiúscula, por pedaço de texto em qualquer posição; só espaços é o mesmo que não buscar.
 */
export function casaComBusca(r: Reminder, texto: string): boolean {
  const q = fold(texto.trim());
  if (q === '') return true;
  const alvo = fold([r.title, r.place, formatDate(r.dateISO), r.time].filter(Boolean).join(' '));
  return alvo.includes(q);
}

/**
 * Cada filtro é uma pergunta sobre o lembrete. "Esta semana" soma Amanhã e a seção "Esta semana" (que, no original, junta
 * qualquer data que não seja hoje nem amanhã: passadas também). Lembrete pausado também conta: o filtro não olha `active`.
 */
export function passaNoFiltro(r: Reminder, filtro: FiltroDaLista): boolean {
  switch (filtro) {
    case 'todos': return true;
    case 'hoje': return sectionOf(r.dateISO) === 'Hoje';
    case 'semana': return sectionOf(r.dateISO) !== 'Hoje';
    case 'locais': return r.kind === 'local';
  }
}

/** Lista já reduzida pela busca (é a base das contagens: os números dos chips acompanham a busca). */
export const buscar = (lista: Reminder[], texto: string): Reminder[] => lista.filter((r) => casaComBusca(r, texto));

/** Quantos lembretes da lista buscada cada filtro mostraria. */
export function contagensDosFiltros(lista: Reminder[], texto: string): Record<FiltroDaLista, number> {
  const buscados = buscar(lista, texto);
  return Object.fromEntries(FILTROS.map(({ chave }) => [chave, buscados.filter((r) => passaNoFiltro(r, chave)).length])) as Record<FiltroDaLista, number>;
}

/** O que a lista mostra: a busca E o filtro escolhido. */
export const lembretesVisiveis = (lista: Reminder[], texto: string, filtro: FiltroDaLista): Reminder[] =>
  buscar(lista, texto).filter((r) => passaNoFiltro(r, filtro));

/** Grupos na ordem fixa Hoje, Amanhã, Esta semana; grupo sem itens não aparece. Dentro do grupo vale a ordem da lista recebida. */
export function agruparPorSecao(lista: Reminder[]): { secao: Section; itens: Reminder[] }[] {
  return SECTIONS
    .map((secao) => ({ secao, itens: lista.filter((r) => sectionOf(r.dateISO) === secao) }))
    .filter((g) => g.itens.length > 0);
}

/** A data que aparece ao lado do título do grupo: só Hoje e Amanhã têm ("Seg, 21 de set de 2026"). */
export function dataDaSecao(secao: Section): string | null {
  if (secao === 'Hoje') return formatDate(todayISO());
  if (secao === 'Amanhã') return formatDate(todayISO(1));
  return null;
}

/** "1 lembrete ativo" ou "N lembretes ativos" (com zero também): conta os ativos da lista inteira, sem busca nem filtro. */
export function textoDeAtivos(lista: Reminder[]): string {
  const n = lista.filter((r) => r.active).length;
  return n === 1 ? '1 lembrete ativo' : `${n} lembretes ativos`;
}

/** Linha de apoio do menu do lembrete: "Sáb, 19 de set de 2026 · 09:00" (ponto médio com espaços). */
export const legendaDoLembrete = (r: Reminder): string => `${formatDate(r.dateISO)} · ${r.time}`;
