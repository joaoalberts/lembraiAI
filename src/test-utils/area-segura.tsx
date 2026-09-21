import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

/** Envolve o que se testa com a área segura de um aparelho (só existe em testes). Padrão: iPhone com entalhe. */
export function comAreaSegura(elemento: ReactElement, insets: { top?: number; bottom?: number } = {}): ReactElement {
  const { top = 0, bottom = 0 } = insets;
  return (
    <SafeAreaProvider initialMetrics={{ frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top, left: 0, right: 0, bottom } }}>
      {elemento}
    </SafeAreaProvider>
  );
}
