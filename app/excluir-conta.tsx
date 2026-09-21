import { ScrollView, StyleSheet, Text, View } from 'react-native';

/**
 * Página pública de exclusão de conta. O Google Play exige uma URL na ficha do app (além da exclusão dentro do app);
 * esta rota vira /excluir-conta no build web. Precisa continuar batendo com o que o app faz em Configurações.
 */
export default function ExcluirContaScreen() {
  const contato = process.env.EXPO_PUBLIC_CONTACT_EMAIL; // lido ao renderizar; o Expo o embute no build
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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
  container: { flex: 1, backgroundColor: '#F5F2ED' },
  content: { padding: 24, alignItems: 'center' },
  column: { width: '100%', maxWidth: 720 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0A0A0A', marginBottom: 4 },
  updated: { fontSize: 13, color: '#767880', marginBottom: 24 },
  heading: { fontSize: 18, fontWeight: '700', color: '#0A0A0A', marginTop: 8, marginBottom: 8 },
  paragraph: { fontSize: 15, lineHeight: 22, color: '#2B2D31', marginBottom: 8 },
});
