import { useMemo } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '../../src/components/Button';
import { ReminderCard } from '../../src/components/ReminderCard';
import { SECTIONS } from '../../src/data/reminders';
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
        <ActivityIndicator size="large" color="#FE532A" />
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
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{erro}</Text>
          <Button label="Tentar novamente" onPress={recarregar} variant="ghost" />
        </View>
      )}

      {insideIds.length > 0 && (
        <View style={styles.nearbyBanner}>
          <Text style={styles.nearbyText}>
            📍 Você está dentro do raio de {insideIds.length} lembrete{insideIds.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {reminders.length === 0 && !erro ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📋</Text>
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
                onDelete={() => void excluir(r.id, r.title)}
              />
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F2ED' },
  content: { padding: 16, paddingBottom: 48 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F2ED' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#767880' },
  errorBanner: { backgroundColor: '#FFE6E6', padding: 16, borderRadius: 8, marginBottom: 16 },
  errorText: { color: '#FF4444', marginBottom: 8 },
  nearbyBanner: {
    backgroundColor: '#E6F3FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0066CC',
  },
  nearbyText: { fontSize: 14, fontWeight: '500', color: '#0A0A0A' },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#0A0A0A', marginBottom: 8 },
  emptySubtitle: { fontSize: 16, color: '#767880', textAlign: 'center', marginBottom: 24 },
  createBtn: { width: 200 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#0A0A0A', marginBottom: 12, marginTop: 4 },
});
