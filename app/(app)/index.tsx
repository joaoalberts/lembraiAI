import { useMemo } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Banner } from '../../src/components/Banner';
import { Button } from '../../src/components/Button';
import { Icon } from '../../src/components/Icon';
import { ReminderCard } from '../../src/components/ReminderCard';
import { SECTIONS } from '../../src/data/reminders';
import { UI_ICON } from '../../src/design/icons';
import { colors, radius, size, space, textStyles } from '../../src/design/tokens';
import { confirmar } from '../../src/lib/confirm';
import { sectionOf } from '../../src/lib/format';
import { useGeofences } from '../../src/state/geofences';
import { useReminders } from '../../src/state/reminders';


export default function LembretesScreen() {
  const { reminders, carregando, erro, recarregar, toggle, remove } = useReminders();
  const { insideIds } = useGeofences();

  const secoes = useMemo(
    () => SECTIONS
      .map((secao) => ({ secao, itens: reminders.filter((r) => sectionOf(r.dateISO) === secao) }))
      .filter((s) => s.itens.length > 0),
    [reminders],
  );

  const excluir = async (id: string, titulo: string) => {
    if (await confirmar('Excluir lembrete', `"${titulo}" será removido.`)) await remove(id);
  };

  if (carregando && reminders.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.spinner} />
        <Text style={styles.loadingText}>Carregando lembretes...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={carregando} onRefresh={recarregar} />}
    >
      {erro && (
        <View style={styles.errorBlock}>
          <Banner variant="error">{erro}</Banner>
          <Button label="Tentar novamente" onPress={recarregar} variant="ghost" />
        </View>
      )}

      {insideIds.length > 0 && (
        <Banner variant="info" style={styles.aviso}>
          Você está dentro do raio de {insideIds.length} lembrete{insideIds.length !== 1 ? 's' : ''}
        </Banner>
      )}

      {reminders.length === 0 && !erro ? (
        <View style={styles.empty}>
          {/* o ícone é decorativo: o título já diz o que fazer */}
          <View style={styles.emptyCircle} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <Icon name={UI_ICON.vazio} size={size.icon.xl} color={colors.icon.default} />
          </View>
          <Text style={styles.emptyTitle}>Nenhum lembrete</Text>
          <Text style={styles.emptySubtitle}>Crie seu primeiro lembrete para começar</Text>
          <Button label="Criar lembrete" onPress={() => router.navigate('/novo')} style={styles.createBtn} />
        </View>
      ) : (
        secoes.map(({ secao, itens }) => (
          <View key={secao}>
            <Text style={styles.sectionTitle}>{secao}</Text>
            {itens.map((r) => (
              <ReminderCard
                key={r.id}
                reminder={r}
                nearby={insideIds.includes(r.id)}
                onToggle={() => void toggle(r.id)}
                onMenu={() => void excluir(r.id, r.title)}
              />
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.page },
  content: { padding: space.lg, paddingBottom: space.huge },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg.page },
  loadingText: { ...textStyles.bodyLg, marginTop: space.md, color: colors.text.secondary },
  errorBlock: { gap: space.sm, marginBottom: space.lg },
  aviso: { marginBottom: space.lg },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: space.giant },
  emptyCircle: {
    width: size.emptyCircle,
    height: size.emptyCircle,
    borderRadius: radius.pill,
    backgroundColor: colors.feedback.emptyCircle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.lg,
  },
  emptyTitle: { ...textStyles.title, color: colors.text.primary, marginBottom: space.sm },
  emptySubtitle: { ...textStyles.bodyLg, color: colors.text.secondary, textAlign: 'center', marginBottom: space.xl },
  createBtn: { paddingHorizontal: space.huge },
  sectionTitle: { ...textStyles.heading, color: colors.text.primary, marginBottom: space.md, marginTop: space.xs },
});
