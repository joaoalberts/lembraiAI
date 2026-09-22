import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { lembrarCercas } from '../lib/chegadas';
import type { LatLng } from '../lib/geo';
import type { Fence } from '../lib/geofence';
import { regioesParaOSistema, TAREFA_DE_GEOFENCE } from '../lib/geofence-background';

/**
 * Geofence do sistema: avisa a chegada a um lugar COM O APP FECHADO. Só existe no iOS e no Android com build próprio: o Expo Go não
 * roda tarefa em segundo plano, e a web não tem geofence. Este gancho entrega as regiões ao sistema (`startGeofencingAsync`) e as
 * retira quando não valem mais; quem avisa é a tarefa definida em `src/tarefas.ts`.
 */
export type EstadoDoSegundoPlano =
  | 'indisponivel'   // web ou Expo Go
  | 'desligado'      // monitoramento desligado, sem login ou sem a permissão de localização
  | 'sem-lugares'    // nenhum lembrete por local
  | 'sem-permissao'  // falta a permissão de localização "o tempo todo"
  | 'ativo'
  | 'erro';
export type PermissaoDeSegundoPlano = 'concedida' | 'pendente' | 'negada' | 'desconhecida';

interface Entrada {
  /** O app acompanha a posição (monitoramento ligado, com lembrete por local, logado e com a permissão de localização). */
  ativo: boolean;
  cercas: Fence[];
  /** Onde a pessoa está, só para escolher as regiões mais próximas quando são mais que o sistema aceita. */
  perto: LatLng | null;
}

const existe = () => Platform.OS !== 'web' && Constants.executionEnvironment !== 'storeClient';
const traduzir = (p: Location.PermissionResponse): PermissaoDeSegundoPlano => (p.granted ? 'concedida' : p.canAskAgain ? 'pendente' : 'negada');

export function useSegundoPlano({ ativo, cercas, perto }: Entrada) {
  const possivel = existe();
  const [estado, setEstado] = useState<EstadoDoSegundoPlano>(possivel ? 'desligado' : 'indisponivel');
  const [permissao, setPermissao] = useState<PermissaoDeSegundoPlano>('desconhecida');
  const registrado = useRef<string | null>(null);
  const posicao = useRef(perto);
  posicao.current = perto;

  useEffect(() => {
    if (!possivel || !ativo) return;
    let vivo = true;
    Location.getBackgroundPermissionsAsync().then((p) => { if (vivo) setPermissao(traduzir(p)); }).catch(() => {});
    return () => { vivo = false; };
  }, [possivel, ativo]);

  // O pedido precisa de um toque da pessoa e de uma explicação antes (no Android 11 ou mais novo o sistema abre as Configurações).
  const pedirPermissao = useCallback(async () => {
    if (!existe()) return false;
    try {
      const resposta = await Location.requestBackgroundPermissionsAsync();
      setPermissao(traduzir(resposta));
      return resposta.granted;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (!possivel) return;
    let vivo = true;
    const os = Platform.OS === 'ios' ? 'ios' : 'android';
    // pode haver um geofence de outra sessão do app: se ele não deve mais existir, para
    const parar = async () => {
      if (registrado.current !== null || (await Location.hasStartedGeofencingAsync(TAREFA_DE_GEOFENCE))) await Location.stopGeofencingAsync(TAREFA_DE_GEOFENCE);
      registrado.current = null;
    };

    (async () => {
      if (!ativo) { await parar(); if (vivo) setEstado('desligado'); return; }
      const regioes = regioesParaOSistema(cercas, os, posicao.current);
      if (regioes.length === 0) { await parar(); if (vivo) setEstado('sem-lugares'); return; }
      if (permissao === 'desconhecida') return; // ainda lendo a permissão: não mexe no que já está registrado
      if (permissao !== 'concedida') { await parar(); if (vivo) setEstado('sem-permissao'); return; }

      const assinatura = JSON.stringify(regioes);
      if (registrado.current !== assinatura) {
        await lembrarCercas(cercas, AsyncStorage); // antes de registrar: com o app fechado o evento só traz o id do lembrete
        await Location.startGeofencingAsync(TAREFA_DE_GEOFENCE, regioes);
        registrado.current = assinatura;
      }
      if (vivo) setEstado('ativo');
    })().catch(() => { if (vivo) setEstado('erro'); });

    return () => { vivo = false; };
  }, [possivel, ativo, cercas, permissao]);

  return { estado, permissao, pedirPermissao };
}
