import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { anelDeFoco, type EstadoDeToque } from '../design/foco';
import { borderWidth, colors, iconStroke, size, textStyles } from '../design/tokens';
import { Icon } from './Icon';

import { Toque } from './Toque';
interface CaixaDeMarcarProps {
  label: string;
  value: boolean;
  onValueChange: (valor: boolean) => void;
  disabled?: boolean;
}

/** Estilo da linha por estado. Função pura e exportada: o foco de teclado só existe na web. */
export function estiloDaCaixa(estado: EstadoDeToque): StyleProp<ViewStyle> {
  return [styles.linha, estado.focused ? anelDeFoco : null];
}

/**
 * Caixinha de marcar do "Lembrar-me" (imagem 02): quadrado de cantos redondos, branco com o anel cinza quando desmarcado e
 * verde-floresta com o visto branco quando marcado; o texto fica ao lado e faz parte da área de toque. Padrão:
 * docs/DESIGN_SYSTEM.md, seção 11.15.
 */
export function CaixaDeMarcar({ label, value, onValueChange, disabled = false }: CaixaDeMarcarProps) {
  return (
    <Toque
      onPress={() => onValueChange(!value)}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      aria-checked={value}
      style={(estado: EstadoDeToque) => estiloDaCaixa(estado)}
    >
      <View testID="caixa" style={[styles.caixa, value ? styles.marcada : styles.desmarcada]}>
        {value ? <Icon name="check" size={size.auth.checkIcon} color={colors.text.onDark} stroke={iconStroke.check} /> : null}
      </View>
      <Text style={styles.texto}>{label}</Text>
    </Toque>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', gap: size.auth.checkGap },
  caixa: { width: size.auth.check, height: size.auth.check, borderRadius: size.auth.checkRadius, alignItems: 'center', justifyContent: 'center', borderWidth: borderWidth.hairline },
  desmarcada: { backgroundColor: colors.bg.field, borderColor: colors.border.strong },
  marcada: { backgroundColor: colors.border.focus, borderColor: colors.border.focus },
  texto: { ...textStyles.mini, color: colors.text.primary }, // 22 du (11 dp)
});
