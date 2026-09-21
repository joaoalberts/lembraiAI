import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Easing, Platform, type StyleProp, type ViewStyle } from 'react-native';
import { HEROI, type Janela } from '../design/heroi';
import { useMovimentoReduzido } from '../lib/movimento';

interface SubidaProps {
  /** Em que segundos da chegada da tela o texto entra (o título e o subtítulo do sucesso têm janelas diferentes). */
  janela: Janela;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

/**
 * Faz o texto aparecer subindo um pouco (`rise` do original: 22 du, com a curva das folhas). Com "reduzir movimento" o texto
 * já chega inteiro no lugar. Padrão: docs/DESIGN_SYSTEM.md, seção 11.12.
 */
export function Subida({ janela, style, children }: SubidaProps) {
  const reduzir = useMovimentoReduzido();
  const progresso = useRef(new Animated.Value(0)).current;
  const [inicio, fim] = janela;

  useEffect(() => {
    if (reduzir === undefined) return undefined;
    if (reduzir) {
      progresso.setValue(1);
      return undefined;
    }
    const [x1, y1, x2, y2] = HEROI.subida.curva;
    const animacao = Animated.timing(progresso, { toValue: 1, delay: inicio * 1000, duration: (fim - inicio) * 1000, easing: Easing.bezier(x1, y1, x2, y2), useNativeDriver: Platform.OS !== 'web' });
    animacao.start();
    return () => animacao.stop();
  }, [reduzir, progresso, inicio, fim]);

  return (
    <Animated.View style={[style, { opacity: progresso, transform: [{ translateY: progresso.interpolate({ inputRange: [0, 1], outputRange: [HEROI.subida.distancia, 0] }) }] }]}>
      {children}
    </Animated.View>
  );
}
