import Svg, { Circle } from 'react-native-svg';
import { colors, size } from '../design/tokens';

/** Ícone do raio (o pino no centro e dois anéis pontilhados), desenhado à mão como no app web: o Lucide não tem um igual. */
export function RadiusIcon({ lado = size.card.metaIcon, color = colors.icon.radius }: { lado?: number; color?: string }) {
  return (
    <Svg width={lado} height={lado} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Circle cx={12} cy={12} r={2.2} fill={color} stroke="none" />
      <Circle cx={12} cy={12} r={6} strokeDasharray="1.2 2.6" />
      <Circle cx={12} cy={12} r={10} strokeDasharray="1.2 3.4" />
    </Svg>
  );
}
