import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '../../src/components/Button';
import { colors, space, textStyles } from '../../src/design/tokens';
import { formatDate } from '../../src/lib/format';
import { useReminders } from '../../src/state/reminders';

/** Versão provisória: o desenho da tela de sucesso (imagem 09) entra no próximo commit. */
export default function SucessoScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { reminders } = useReminders();
  const lembrete = reminders.find((r) => r.id === id);
  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo}>
      <Text style={styles.titulo}>Lembrete criado com sucesso!</Text>
      {lembrete && <Text style={styles.texto}>{lembrete.title} · {formatDate(lembrete.dateISO)} · {lembrete.time}</Text>}
      <View style={styles.acoes}>
        <Button label="Ver todos os lembretes" onPress={() => router.navigate('/')} />
        <Button label="Criar outro lembrete" variant="ghost" onPress={() => router.navigate('/novo')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.bg.page },
  conteudo: { padding: space.xl, gap: space.md },
  titulo: { ...textStyles.title, color: colors.text.primary },
  texto: { ...textStyles.body, color: colors.text.secondary },
  acoes: { gap: space.md, marginTop: space.xl },
});
