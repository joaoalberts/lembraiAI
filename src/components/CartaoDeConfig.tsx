import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borderWidth, colors, fontFamily, iconStroke, radius, shadow, size, textStyles } from '../design/tokens';
import { Icon, type IconeNome } from './Icon';

interface CartaoDeConfigProps {
  /** Sem ícone o cabeçalho é só o título (o cartão de texto "Até onde vai o monitoramento"). */
  icon?: IconeNome;
  titulo: string;
  subtitulo?: string;
  /** Botão ou interruptor à direita do cabeçalho. */
  acao?: ReactNode;
  /** Ação sem volta (excluir conta): fundo e contorno avermelhados e título em vermelho. */
  perigo?: boolean;
  /** Avisos e linhas de dados, abaixo do cabeçalho. */
  children?: ReactNode;
}

/**
 * Cartão da tela de Configurações (imagem 08): cabeçalho com o círculo do ícone (em cinza, como na captura), o título em
 * negrito, o subtítulo e, à direita, a ação; embaixo o que o cartão contém. Padrão: docs/DESIGN_SYSTEM.md, seção 11.14.
 */
export function CartaoDeConfig({ icon, titulo, subtitulo, acao, perigo = false, children }: CartaoDeConfigProps) {
  return (
    <View testID="cartao-de-config" style={[styles.cartao, perigo ? styles.perigo : null]}>
      <View style={styles.cabecalho}>
        {icon ? (
          <View style={styles.circulo} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <Icon name={icon} size={size.config.icon} color={colors.icon.muted} stroke={iconStroke.base} />
          </View>
        ) : null}
        <View style={styles.textos}>
          <Text accessibilityRole="header" style={[styles.titulo, perigo ? { color: colors.text.danger } : null]}>{titulo}</Text>
          {subtitulo ? <Text style={styles.subtitulo}>{subtitulo}</Text> : null}
        </View>
        {acao}
      </View>
      {children}
    </View>
  );
}

/** Uma linha de dados do cartão: o nome em cinza à esquerda e o valor em negrito à direita. */
export function DadoDoCartao({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <View style={styles.dado}>
      <Text style={styles.rotuloDoDado}>{rotulo}</Text>
      <Text style={styles.valorDoDado}>{valor}</Text>
    </View>
  );
}

/** Um item da lista de limites: marcador, o começo em negrito e o resto em cinza. */
export function ItemDeLimite({ destaque, children }: { destaque: string; children: string }) {
  return (
    <View style={styles.item}>
      <Text style={styles.marcador}>•</Text>
      <Text style={styles.textoDoItem}>
        <Text style={styles.destaque}>{destaque}</Text> {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: { gap: size.config.cardGap, paddingVertical: size.config.cardV, paddingHorizontal: size.config.cardH, borderRadius: radius.form, backgroundColor: colors.bg.card, boxShadow: shadow.formCard },
  perigo: { backgroundColor: colors.feedback.dangerWash, borderWidth: borderWidth.hairline, borderColor: colors.border.dangerSoft },
  cabecalho: { flexDirection: 'row', alignItems: 'center', gap: size.config.headGap },
  circulo: { width: size.config.circle, height: size.config.circle, borderRadius: radius.pill, backgroundColor: colors.bg.iconCircle, alignItems: 'center', justifyContent: 'center' },
  textos: { flex: 1, gap: size.config.textGap },
  titulo: { ...textStyles.body, fontFamily: fontFamily.bold, color: colors.text.primary },
  subtitulo: { ...textStyles.micro, color: colors.text.secondary },
  dado: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: size.config.rowGap },
  rotuloDoDado: { ...textStyles.micro, color: colors.text.secondary },
  valorDoDado: { ...textStyles.micro, fontFamily: fontFamily.bold, color: colors.text.primary, textAlign: 'right', flexShrink: 1 },
  item: { flexDirection: 'row', gap: size.config.listGap, paddingLeft: size.config.listIndent - size.config.listGap },
  marcador: { ...textStyles.micro, color: colors.text.secondary },
  textoDoItem: { ...textStyles.micro, color: colors.text.secondary, flex: 1 },
  destaque: { fontFamily: fontFamily.bold, color: colors.text.primary },
});
