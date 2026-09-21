import type { ReactNode } from 'react';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fundoEmDegrade } from '../design/efeitos';
import { colors, gradients, radius, size, space } from '../design/tokens';
import { BarraDeStatus } from './BarraDeStatus';

const CURVAS_DE_NIVEL = require('../../assets/art/topo-lista.webp');

/** Onde a marca e o título começam: o do desenho, ou abaixo da barra de status do aparelho (entalhe, ilha) quando ela é maior. */
function topoDoConteudo(insetSuperior: number): number {
  return Math.max(size.header.contentTop, insetSuperior + space.sm);
}

interface MapHeaderProps {
  children: ReactNode;
}

/**
 * Cabeçalho claro do mapa (aba Mapa): degradê creme com as curvas de nível por cima, similar ao GreenHeader mas com cores claras.
 * Padrão: docs/DESIGN_SYSTEM.md, seção 11.13.
 */
export function MapHeader({ children }: MapHeaderProps) {
  const { top } = useSafeAreaInsets();
  const topo = topoDoConteudo(top);
  return (
    <View testID="cabecalho-mapa" style={[styles.cabecalho, { minHeight: size.header.height + (topo - size.header.contentTop), paddingTop: topo }]}>
      {/* o creme-claro passa por baixo da barra de status: relógio e bateria em escuro (padrão) */}
      <BarraDeStatus sobre="claro" />
      <View testID="cabecalho-degrade-mapa" style={[StyleSheet.absoluteFill, styles.decoracao, fundoEmDegrade(gradients.cabecalhoClaro)]} />
      {/* decorativa: escondida do leitor de tela */}
      <View style={[styles.curvas, styles.decoracao]}>
        <Image source={CURVAS_DE_NIVEL} contentFit="fill" accessible={false} style={StyleSheet.absoluteFill} />
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  cabecalho: { overflow: 'hidden', paddingHorizontal: size.header.side },
  // só enfeite: o toque passa direto para o que está por cima
  decoracao: { pointerEvents: 'none' },
  curvas: { position: 'absolute', top: 0, left: 0, right: 0, height: size.header.height },
});
