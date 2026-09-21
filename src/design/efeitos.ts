/**
 * Efeitos visuais que não são um valor de estilo comum. Hoje: o fundo em degradê e a tela de janela inteira (web).
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

/**
 * Web: a tela ocupa ao menos a janela inteira; o `flex: 1` sozinho deixa faixas claras em cima e embaixo (visto no Safari do iPhone).
 * O react-native-web repassa a unidade CSS, mas os tipos do React Native não a conhecem e no iOS e no Android ela é inválida.
 */
export function telaDeJanelaInteira(web: boolean = process.env.EXPO_OS === 'web'): ViewStyle {
  return (web ? { height: '100%', minHeight: '100vh' } : {}) as unknown as ViewStyle;
}
