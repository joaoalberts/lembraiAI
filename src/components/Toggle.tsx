import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet } from 'react-native';
import { anelDeFoco, type EstadoDeToque } from '../design/foco';
import { colors, motion, opacity, radius, shadow, size } from '../design/tokens';
import { useMovimentoReduzido } from '../lib/movimento';

import { Toque } from './Toque';
/** `card` = interruptor pequeno do cartão de lembrete; `form` = o maior, dos formulários e das configurações. */
export type ToggleVariant = 'card' | 'form';

interface ToggleProps {
  value: boolean;
  onValueChange: (valor: boolean) => void;
  disabled?: boolean;
  accessibilityLabel: string;
  variant?: ToggleVariant;
}

const LIGADO: Record<ToggleVariant, string> = { card: colors.control.onCard, form: colors.control.onForm };
const CURVA = Easing.bezier(motion.ease.x1, motion.ease.y1, motion.ease.x2, motion.ease.y2);

/** Medidas do interruptor: trilho, bolinha, folga e o quanto a bolinha anda. */
export function medidasDoToggle(variant: ToggleVariant) {
  const m = size.toggle[variant];
  return { ...m, viagem: m.width - m.thumb - 2 * m.inset };
}

/**
 * Interruptor no padrão do app original (docs/DESIGN_SYSTEM.md, seção 10): trilho em pílula e bolinha que corre em
 * `motion.duration.toggle`. Menor que 44, então o `Toque` completa o alvo até lá. Sempre com rótulo para o leitor de tela.
 */
export function Toggle({ value, onValueChange, disabled = false, accessibilityLabel, variant = 'card' }: ToggleProps) {
  const m = medidasDoToggle(variant);
  const reduzir = useMovimentoReduzido();
  const progresso = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    if (reduzir === undefined) return;
    if (reduzir) {
      progresso.setValue(value ? 1 : 0);
      return;
    }
    const animacao = Animated.timing(progresso, { toValue: value ? 1 : 0, duration: motion.duration.toggle, easing: CURVA, useNativeDriver: Platform.OS !== 'web' });
    animacao.start();
    return () => animacao.stop();
  }, [value, reduzir, progresso]);

  return (
    <Toque
      onPress={() => onValueChange(!value)}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      aria-checked={value}
      style={(estado: EstadoDeToque) => [styles.trilho, { width: m.width, height: m.height }, estado.focused ? anelDeFoco : null, disabled ? styles.desabilitado : null]}
    >
      {/* o trilho ligado entra por cima do desligado, com a opacidade animada (a cor não anima no driver nativo) */}
      <Animated.View testID="toggle-ligado" style={[StyleSheet.absoluteFill, styles.pilula, { backgroundColor: LIGADO[variant], opacity: progresso }]} />
      <Animated.View
        testID="toggle-bolinha"
        style={[
          styles.bolinha,
          { top: m.inset, left: m.inset, width: m.thumb, height: m.thumb, transform: [{ translateX: progresso.interpolate({ inputRange: [0, 1], outputRange: [0, m.viagem] }) }] },
        ]}
      />
    </Toque>
  );
}

const styles = StyleSheet.create({
  trilho: { borderRadius: radius.pill, backgroundColor: colors.control.off },
  pilula: { borderRadius: radius.pill },
  bolinha: { position: 'absolute', borderRadius: radius.pill, backgroundColor: colors.control.thumb, boxShadow: shadow.float },
  desabilitado: { opacity: opacity.disabled },
});
