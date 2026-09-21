import { DEFAULT_RADIUS, type Reminder, type RepeatKey } from '../data/reminders';
import { todayISO } from './format';
import type { Draft } from './reminder-rows';

export type Modo = 'time' | 'local';
export interface Ponto { lat: number; lng: number }

/** O que o formulário de novo lembrete guarda enquanto a pessoa preenche. */
export interface EstadoDoFormulario {
  title: string;
  modo: Modo;
  dateISO: string;
  /** "HH:MM" */
  time: string;
  repeat: RepeatKey;
  place: string;
  /** `null` até a pessoa escolher o ponto (tocando no mapa, buscando um endereço ou usando a localização). */
  coord: Ponto | null;
  radius: number;
}

/** Raio de aviso: o controle vai de 50 a 550 m de 10 em 10 (a tabela aceita de 10 a 5000). */
export const RAIO = { min: 50, max: 550, passo: 10, padrao: DEFAULT_RADIUS } as const;
export const TITULO_MAXIMO = 80;
export const HORARIO_PADRAO = '09:00';

/** Novo lembrete: hoje, 09:00, por horário, sem repetir. Com um lembrete, o formulário abre já preenchido para editar. */
export function estadoInicial(lembrete?: Reminder): EstadoDoFormulario {
  if (!lembrete) {
    return { title: '', modo: 'time', dateISO: todayISO(), time: HORARIO_PADRAO, repeat: 'never', place: '', coord: null, radius: RAIO.padrao };
  }
  const local = lembrete.kind === 'local';
  return {
    title: lembrete.title,
    modo: lembrete.kind,
    dateISO: lembrete.dateISO,
    time: lembrete.time,
    repeat: lembrete.repeat,
    place: lembrete.place ?? '',
    coord: local && lembrete.lat !== undefined && lembrete.lng !== undefined ? { lat: lembrete.lat, lng: lembrete.lng } : null,
    radius: lembrete.radius ?? RAIO.padrao,
  };
}

export type Problema = { campo: 'title' | 'local'; mensagem: string };

/** O que impede de salvar, ou `null`. A descrição é obrigatória; "por local" precisa de um ponto escolhido. */
export function validar(e: EstadoDoFormulario): Problema | null {
  if (e.title.trim() === '') return { campo: 'title', mensagem: 'Dê uma descrição ao lembrete.' };
  if (e.modo === 'local' && e.coord === null) return { campo: 'local', mensagem: 'Escolha o local no mapa ou busque um endereço.' };
  return null;
}

/** O rascunho que vai para o banco. O lugar, o ponto e o raio só valem "por local". */
export function rascunhoDe(e: EstadoDoFormulario): Draft {
  const local = e.modo === 'local';
  return {
    title: e.title.trim(),
    kind: e.modo,
    dateISO: e.dateISO,
    time: e.time,
    repeat: e.repeat,
    place: local ? e.place.trim() : '',
    lat: local ? e.coord?.lat : undefined,
    lng: local ? e.coord?.lng : undefined,
    radius: e.radius,
  };
}
