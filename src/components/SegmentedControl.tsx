import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { anelDeFoco, type EstadoDeToque } from '../design/foco';
import { colors, fontFamily, opacity, radius, size, space, textStyles } from '../design/tokens';

interface Opcao<T extends string> {
  key: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: readonly Opcao<T>[];
  value: T;
  onChange: (valor: T) => void;
  disabled?: boolean;
}

/** Estilo de uma opção por estado. Função pura e exportada: o foco de teclado só existe na web e os testes o chamam direto. */
export function estiloDoSegmento(selecionado: boolean, estado: EstadoDeToque): StyleProp<ViewStyle> {
  return [styles.opcao, selecionado ? styles.selecionada : null, estado.pressed ? styles.pressionada : null, estado.focused ? anelDeFoco : null];
}

/** Duas ou três opções lado a lado, uma selecionada (ex.: "Por horário" e "Por local"). Padrão: docs/DESIGN_SYSTEM.md, seção 10. */
export function SegmentedControl<T extends string>({ options, value, onChange, disabled = false }: SegmentedControlProps<T>) {
  return (
    <View testID="segmented" style={styles.trilho}>
      {options.map((o) => {
        const selecionado = value === o.key;
        return (
          <Pressable
            key={o.key}
            onPress={() => onChange(o.key)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityState={{ selected: selecionado, disabled }}
            style={(estado: EstadoDeToque) => estiloDoSegmento(selecionado, estado)}
          >
            <Text style={[styles.rotulo, selecionado ? styles.rotuloSelecionado : null]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  trilho: { flexDirection: 'row', backgroundColor: colors.control.segmentTrack, borderRadius: radius.md, padding: space.xs, marginBottom: space.lg },
  opcao: { flex: 1, minHeight: size.touch - 2 * space.xs, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm },
  selecionada: { backgroundColor: colors.control.segmentThumb },
  pressionada: { opacity: opacity.pressed },
  rotulo: { ...textStyles.body, fontFamily: fontFamily.medium, color: colors.text.secondary },
  rotuloSelecionado: { color: colors.text.primary, fontFamily: fontFamily.bold },
});
