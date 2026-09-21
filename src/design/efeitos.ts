/**
 * Efeitos visuais que não são um valor de estilo comum. Hoje: o fundo em degradê.
 *
 * O React Native 0.86 aceita a receita CSS em `experimental_backgroundImage` (iOS e Android; a doc do Expo SDK 57 a
 * indica como alternativa ao `expo-linear-gradient`) e o react-native-web não a repassa: na web a mesma receita vai em
 * `backgroundImage`. As receitas ficam em `gradients` (tokens.ts); nas telas use só esta função.
 */
import type { ViewStyle } from 'react-native';

/** `web` só existe para o teste cobrir os dois caminhos: no app vale o que a compilação decidiu (`process.env.EXPO_OS`). */
export function fundoEmDegrade(receita: string, web: boolean = process.env.EXPO_OS === 'web'): ViewStyle {
  const estilo = web ? { backgroundImage: receita } : { experimental_backgroundImage: receita };
  return estilo as unknown as ViewStyle;
}
