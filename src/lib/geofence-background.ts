import { lerCerca, registrarEntrada, registrarSaida, type Armazenamento } from './chegadas';
import type { Fence } from './geofence';
import { distance, type LatLng } from './geo';

/**
 * Avisos de chegada com o app FECHADO, pelo geofence do sistema (Android: Google Play Services; iOS: monitoramento de região).
 * Este arquivo é só a parte que não depende de nenhum módulo nativo: quais regiões entregar ao sistema e o que fazer com o evento.
 * O registro fica em `state/geofencing-nativo.ts` e a tarefa que o sistema acorda em `tarefas.ts`.
 */
export const TAREFA_DE_GEOFENCE = 'lembreiai-geofence';

/** Iguais a `GeofencingEventType.Enter` e `.Exit` do expo-location (um teste confere; aqui não se importa módulo nativo). */
export const ENTROU = 1;
export const SAIU = 2;

/**
 * O sistema não acompanha raio pequeno com confiança: o Google recomenda 100 a 150 m e a Apple só avisa depois que a pessoa passa
 * da borda. Um lembrete com raio menor que isto avisa, com o app fechado, a partir de 100 m (com o app aberto vale o raio escolhido).
 */
export const RAIO_MINIMO_NO_SISTEMA = 100;

/** Regiões que o sistema aceita vigiar ao mesmo tempo, por app. */
export const LIMITE_DE_REGIOES = { ios: 20, android: 100 } as const;

export interface RegiaoDoSistema {
  identifier: string;
  latitude: number;
  longitude: number;
  radius: number;
  notifyOnEnter: true;
  notifyOnExit: true;
}

/**
 * As regiões que vão para o sistema. Passando do limite da plataforma ficam as mais próximas da pessoa (sem saber onde ela está,
 * a ordem da lista). O id do lembrete é o identificador da região: é o que o evento traz de volta.
 */
export function regioesParaOSistema(cercas: Fence[], os: keyof typeof LIMITE_DE_REGIOES, perto?: LatLng | null): RegiaoDoSistema[] {
  const ordenadas = perto ? [...cercas].sort((a, b) => distance(perto, a) - distance(perto, b)) : cercas;
  return ordenadas.slice(0, LIMITE_DE_REGIOES[os]).map((c) => ({
    identifier: c.id,
    latitude: c.lat,
    longitude: c.lng,
    radius: Math.max(c.radius, RAIO_MINIMO_NO_SISTEMA),
    notifyOnEnter: true,
    notifyOnExit: true,
  }));
}

export interface EventoDeGeofence { eventType: number; region: { identifier?: string } }
export interface AvisoDeChegada { title: string; body?: string; data: { reminderId: string }; identifier: string }
export interface DependenciasDoEvento {
  armazenamento: Armazenamento;
  avisar: (aviso: AvisoDeChegada) => Promise<void>;
  agora: () => number;
}
export type Resultado = 'avisou' | 'repetida' | 'saiu' | 'sem-lembrete' | 'ignorado';

/**
 * O que fazer quando o sistema acorda o app por um evento de região. Entrou: avisa, uma vez por chegada (o sistema reenvia
 * "entrou" ao registrar as regiões com a pessoa já dentro, e o app aberto pode ter avisado a mesma entrada). Saiu: limpa a marca.
 * Aqui quem decide "estar dentro" é o sistema, com o filtro dele; o piso de precisão de 200 m e a histerese são do app aberto.
 */
export async function tratarEventoDeGeofence(evento: EventoDeGeofence, deps: DependenciasDoEvento): Promise<Resultado> {
  const id = evento.region.identifier;
  if (!id) return 'ignorado';
  if (evento.eventType === SAIU) {
    await registrarSaida(id, deps.armazenamento);
    return 'saiu';
  }
  if (evento.eventType !== ENTROU) return 'ignorado';

  const cerca = await lerCerca(id, deps.armazenamento);
  if (!cerca) return 'sem-lembrete';
  if (!(await registrarEntrada(id, deps.agora(), deps.armazenamento))) return 'repetida';
  try {
    await deps.avisar({ title: `Você chegou: ${cerca.title}`, body: cerca.place || undefined, data: { reminderId: id }, identifier: `chegada-${id}` });
  } catch (erro) {
    await registrarSaida(id, deps.armazenamento); // o aviso não saiu: a marca não vale, a próxima entrada tenta de novo
    throw erro;
  }
  return 'avisou';
}
