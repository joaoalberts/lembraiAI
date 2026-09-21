import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '../design/tokens';

/**
 * Glifos desenhados à mão, iguais aos do app web, para o que o Lucide não tem: sino cheio, pino cheio e cadeado.
 * Decorativos (escondidos do leitor de tela); a acessibilidade vai num View porque o Svg da web repassaria as props
 * de acessibilidade do React Native para o elemento do navegador.
 */
function Decorativo({ children }: { children: ReactNode }) {
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" aria-hidden>
      {children}
    </View>
  );
}

/** Sino cheio. O desenho de 27 por 33 é esticado para a caixa pedida (como no original, que o estica sem manter a proporção). */
export function BellSolid({ width, height, color }: { width: number; height: number; color: string }) {
  return (
    <Decorativo>
      <Svg width={width} height={height} viewBox="0 0 27 33" preserveAspectRatio="none" fill={color}>
        <Circle cx={13.5} cy={2.3} r={2.1} />
        <Path d="M13.5 4.2C8.7 4.2 6.3 7.7 6.3 12.3v5.2c0 2.5-1.2 4.5-3.6 6.4-.8.6-.4 2.1.8 2.1h20c1.2 0 1.6-1.5.8-2.1-2.4-1.9-3.6-3.9-3.6-6.4v-5.2c0-4.6-2.4-8.1-7.2-8.1Z" />
        <Path d="M9.9 28.4h7.2a3.6 3.6 0 0 1-7.2 0Z" />
      </Svg>
    </Decorativo>
  );
}

/** Pino cheio com o ponto no meio (a ponta fica embaixo). */
export function PinSolid({ width, height, fill, dot = colors.map.ring }: { width: number; height: number; fill: string; dot?: string }) {
  return (
    <Decorativo>
      <Svg width={width} height={height} viewBox="0 0 58 73">
        <Path d="M29 0C13 0 0 12.6 0 28.4 0 49.6 29 73 29 73s29-23.4 29-44.6C58 12.6 45 0 29 0Z" fill={fill} />
        <Circle cx={29} cy={28} r={10} fill={dot} />
      </Svg>
    </Decorativo>
  );
}

/** Cadeado: argola em traço, corpo cheio e o furo da fechadura na cor do fundo (`hole`). */
export function LockIcon({ lado, color, hole }: { lado: number; color: string; hole: string }) {
  return (
    <Decorativo>
      <Svg width={lado} height={lado} viewBox="0 0 24 24">
        <Path d="M7.6 10.6V7.6a4.4 4.4 0 0 1 8.8 0v3" fill="none" stroke={color} strokeWidth={2.3} strokeLinecap="round" />
        <Rect x={4.2} y={10.4} width={15.6} height={11.6} rx={2.6} fill={color} />
        <Circle cx={12} cy={15.2} r={1.5} fill={hole} />
        <Rect x={11.3} y={15.6} width={1.4} height={3.2} rx={0.6} fill={hole} />
      </Svg>
    </Decorativo>
  );
}
