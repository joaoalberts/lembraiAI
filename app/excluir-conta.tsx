import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, layout, space, textStyles } from '../src/design/tokens';

/**
 * Página pública de exclusão de conta. O Google Play exige uma URL na ficha do app (além da exclusão dentro do app);
 * esta rota vira /excluir-conta no build web. Precisa continuar batendo com o que o app faz em Configurações.
 */
export default function ExcluirContaScreen() {
  const contato = process.env.EXPO_PUBLIC_CONTACT_EMAIL; // lido ao renderizar; o Expo o embute no build
  // no celular o app desenha por baixo das barras do sistema: o texto começa abaixo da de status e termina acima da de navegação
  const { top, bottom } = useSafeAreaInsets();
  return (
    <ScrollView testID="pagina-publica" style={styles.container} contentContainerStyle={[styles.content, { paddingTop: space.xl + top, paddingBottom: space.xl + bottom }]}>
      <View style={styles.column}>
        <Text style={styles.title} accessibilityRole="header">Excluir conta e dados</Text>
        <Text style={styles.updated}>LembreiAi</Text>

        <Text style={styles.heading} accessibilityRole="header">Pelo aplicativo ou por este site</Text>
        <Text style={styles.paragraph}>1. Abra o LembreiAi (o aplicativo ou este site) e entre na sua conta.</Text>
        <Text style={styles.paragraph}>2. Vá em Configurações e toque em "Excluir minha conta".</Text>
        <Text style={styles.paragraph}>3. Confirme. A exclusão é imediata e definitiva.</Text>

        <Text style={styles.heading} accessibilityRole="header">Esqueceu a senha?</Text>
        <Text style={styles.paragraph}>
          Na tela de entrada, toque em "Esqueci minha senha" e siga os passos para voltar à conta; depois é só excluir como acima.
        </Text>

        {!!contato && (
          <>
            <Text style={styles.heading} accessibilityRole="header">Sem conseguir entrar</Text>
            <Text style={styles.paragraph}>
              Escreva para {contato}, a partir do e-mail cadastrado na conta, pedindo a exclusão.
            </Text>
          </>
        )}

        <Text style={styles.heading} accessibilityRole="header">O que é apagado</Text>
        <Text style={styles.paragraph}>
          Sua conta (nome e e-mail) e todos os seus lembretes, inclusive nomes de lugares, coordenadas e raios. Cópias de segurança automáticas do
          servidor podem conter esses dados por até 14 dias; passado esse prazo, também são apagadas.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.page },
  content: { padding: space.xl, alignItems: 'center' },
  column: { width: '100%', maxWidth: layout.readingMax },
  title: { ...textStyles.display, color: colors.text.primary, marginBottom: space.xs },
  updated: { ...textStyles.caption, color: colors.text.secondary, marginBottom: space.xl },
  heading: { ...textStyles.heading, color: colors.text.primary, marginTop: space.sm, marginBottom: space.sm },
  paragraph: { ...textStyles.bodyLg, color: colors.text.primary, marginBottom: space.sm },
});
