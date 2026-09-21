import type { ReactNode } from 'react';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fundoEmDegrade } from '../design/efeitos';
import { colors, gradients, radius, size, space } from '../design/tokens';

const CURVAS_DE_NIVEL = require('../../assets/art/topo-lista.webp');

/** Onde a marca e os botões começam: o do desenho, ou abaixo da barra de status do aparelho (entalhe, ilha) quando ela é maior. */
export function topoDoConteudo(insetSuperior: number): number {
  return Math.max(size.header.contentTop, insetSuperior + space.sm);
}

/** A folha clara de cantos altos que sobe sobre a parte de baixo do cabeçalho verde (lista e configurações). */
export const folhaSobreOCabecalho = {
  flex: 1,
  marginTop: -(size.header.height - size.header.sheetTop),
  borderTopLeftRadius: radius.sheet,
  borderTopRightRadius: radius.sheet,
  overflow: 'hidden',
  backgroundColor: colors.bg.sheet,
} as const;

interface GreenHeaderProps {
  children: ReactNode;
}

/**
 * Cabeçalho verde da lista e das configurações: degradê (base a 168°, luz menta, sombra de pinheiro) com as curvas de
 * nível por cima. As curvas são uma imagem pré-renderizada (`assets/art/LEIA-ME.md`); o grão de 9% do original não é
 * reproduzido (não se vê). O conteúdo vem em `children`. Padrão: docs/DESIGN_SYSTEM.md, seção 11.6.
 */
export function GreenHeader({ children }: GreenHeaderProps) {
  const { top } = useSafeAreaInsets();
  const topo = topoDoConteudo(top);
  return (
    <View testID="cabecalho-verde" style={[styles.cabecalho, { minHeight: size.header.height + (topo - size.header.contentTop), paddingTop: topo }]}>
      <View testID="cabecalho-degrade" style={[StyleSheet.absoluteFill, styles.decoracao, fundoEmDegrade(gradients.cabecalhoVerde)]} />
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
