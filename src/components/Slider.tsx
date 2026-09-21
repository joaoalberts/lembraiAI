import { useRef, useState } from 'react';
import { PanResponder, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { colors, radius, shadow, size } from '../design/tokens';

interface SliderProps {
  value: number;
  onChange: (valor: number) => void;
  min: number;
  max: number;
  step: number;
  /** Nome para o leitor de tela ("Raio de notificação em metros"). */
  label: string;
  /** Texto do valor para o leitor de tela ("150 metros"). */
  valueText: string;
}

/** O valor mais próximo da posição `x` (em pixels) numa trilha de `largura`, no passo pedido e dentro dos limites. */
export function valorNaPosicao(x: number, largura: number, min: number, max: number, step: number): number {
  if (largura <= 0) return min;
  const fracao = Math.min(1, Math.max(0, x / largura));
  const passos = Math.round((fracao * (max - min)) / step);
  return Math.min(max, Math.max(min, min + passos * step));
}

/**
 * Controle deslizante do raio de aviso: trilho cinza, preenchimento verde e uma bolinha que segue o dedo, de passo em
 * passo. Aceita toque, arrasto e, para o leitor de tela, os gestos de aumentar e diminuir. Padrão: DESIGN_SYSTEM.md, seção 11.11.
 */
export function Slider({ value, onChange, min, max, step, label, valueText }: SliderProps) {
  const [largura, setLargura] = useState(0);
  const inicio = useRef(0);
  // o responder é criado uma vez; o estado que ele lê vem por ref
  const estado = useRef({ largura, min, max, step, onChange });
  estado.current = { largura, min, max, step, onChange };

  const aplicar = (x: number) => {
    const e = estado.current;
    e.onChange(valorNaPosicao(x, e.largura, e.min, e.max, e.step));
  };

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => { inicio.current = e.nativeEvent.locationX; aplicar(inicio.current); },
      onPanResponderMove: (_e, g) => aplicar(inicio.current + g.dx),
    }),
  ).current;

  const fracao = max === min ? 0 : (value - min) / (max - min);
  const aoMedir = (e: LayoutChangeEvent) => setLargura(e.nativeEvent.layout.width);
  const mudar = (delta: number) => onChange(Math.min(max, Math.max(min, value + delta)));

  return (
    <View
      testID="slider"
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ min, max, now: value, text: valueText }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => mudar(e.nativeEvent.actionName === 'increment' ? step : -step)}
      onLayout={aoMedir}
      style={styles.area}
      {...responder.panHandlers}
    >
      {/* os filhos não tocam: o toque sempre chega na área inteira e a posição vem certa */}
      <View style={[styles.trilho, styles.passivo]} />
      <View testID="slider-preenchimento" style={[styles.trilho, styles.preenchimento, styles.passivo, { width: `${fracao * 100}%` }]} />
      <View testID="slider-bolinha" style={[styles.bolinha, styles.passivo, { left: fracao * largura - size.form.sliderThumb / 2 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  passivo: { pointerEvents: 'none' },
  area: { height: size.form.sliderHeight, justifyContent: 'center' },
  trilho: { position: 'absolute', left: 0, right: 0, height: size.form.sliderTrack, borderRadius: radius.pill, backgroundColor: colors.control.off },
  preenchimento: { right: undefined, backgroundColor: colors.control.on },
  bolinha: { position: 'absolute', width: size.form.sliderThumb, height: size.form.sliderThumb, borderRadius: radius.pill, backgroundColor: colors.control.sliderThumb, boxShadow: shadow.slider },
});
