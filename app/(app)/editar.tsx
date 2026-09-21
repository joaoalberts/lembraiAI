import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useIsFocused, useLocalSearchParams } from 'expo-router';
import { FormularioDeLembrete } from '../../src/components/FormularioDeLembrete';
import { colors, space, textStyles } from '../../src/design/tokens';
import { useReminders } from '../../src/state/reminders';

/**

 * Edição de um lembrete (`/editar?id=…`): o mesmo formulário, já preenchido. Se a lista ainda está chegando (recarregou a
 * página) espera; se o lembrete não existe mais (foi excluído), avisa em vez de abrir um formulário em branco. Como em
 * `novo`, só existe enquanto a tela está em foco.
 */
export default function EditarLembreteScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { reminders, carregando } = useReminders();
  const focada = useIsFocused();
  const lembrete = reminders.find((r) => r.id === id);

  if (!focada) return null;
  if (!lembrete) {
    return (
      <View style={styles.aviso}>
        {carregando ? <ActivityIndicator size="large" color={colors.spinner} /> : <Text style={styles.texto}>Esse lembrete não existe mais.</Text>}
      </View>
    );
  }
  return <FormularioDeLembrete key={lembrete.id} lembrete={lembrete} />;
}

const styles = StyleSheet.create({
  aviso: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, backgroundColor: colors.bg.page },
  texto: { ...textStyles.bodyLg, color: colors.text.secondary, textAlign: 'center' },
});
