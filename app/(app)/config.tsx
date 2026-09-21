import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '../../src/components/Button';
import { confirmar } from '../../src/lib/confirm';
import { formatDistance } from '../../src/lib/geo';
import { useAuth } from '../../src/state/auth';
import { useGeo } from '../../src/state/geo';
import { useGeofences } from '../../src/state/geofences';
import { useNotifications } from '../../src/state/notifications';

export default function ConfigScreen() {
  const { user, sair, excluirConta } = useAuth();
  const { monitoring, setMonitoring, permissionGranted: geoOk, position, error: geoError } = useGeo();
  const { supported, permissionGranted: notifOk, scheduledCount } = useNotifications();
  const { fences, insideIds, nearest, arrivals } = useGeofences();
  const [excluindo, setExcluindo] = useState(false);
  const [erroExcluir, setErroExcluir] = useState('');

  const excluir = async () => {
    const certeza = await confirmar(
      'Excluir sua conta?',
      'Sua conta e todos os seus lembretes serão apagados para sempre. Isso não pode ser desfeito.',
      'Excluir conta',
    );
    if (!certeza) return;
    setExcluindo(true);
    setErroExcluir('');
    const erro = await excluirConta();
    setExcluindo(false);
    // sucesso: a sessão some e o layout raiz leva à tela de entrar
    if (erro) setErroExcluir(erro);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conta</Text>
        {user?.email && <Text style={styles.value}>{user.email}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lembretes por local</Text>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.label}>Monitorar lugares</Text>
            <Text style={styles.hint}>Avisa quando você chega ao raio de um lembrete. Funciona com o app aberto.</Text>
          </View>
          <Switch value={monitoring} onValueChange={(on) => void setMonitoring(on)} accessibilityLabel="Monitorar lugares" />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Permissão de localização</Text>
          <Text style={[styles.badge, geoOk ? styles.badgeOk : styles.badgeOff]}>{geoOk ? 'Liberada' : 'Não liberada'}</Text>
        </View>
        {geoError && <Text style={styles.error}>{geoError}</Text>}
        {monitoring && (
          <>
            <View style={styles.row}>
              <Text style={styles.label}>Lugares monitorados</Text>
              <Text style={styles.value}>{fences.length}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Dentro do raio agora</Text>
              <Text style={styles.value}>{insideIds.length}</Text>
            </View>
            {position?.accuracy != null && (
              <View style={styles.row}>
                <Text style={styles.label}>Precisão da posição</Text>
                <Text style={styles.value}>{formatDistance(position.accuracy)}</Text>
              </View>
            )}
            {nearest && (
              <Text style={styles.hint}>Mais próximo: {nearest.fence.title} — a {formatDistance(nearest.meters)}</Text>
            )}
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notificações</Text>
        {supported ? (
          <>
            <View style={styles.row}>
              <Text style={styles.label}>Permissão</Text>
              <Text style={[styles.badge, notifOk ? styles.badgeOk : styles.badgeOff]}>{notifOk ? 'Liberada' : 'Não liberada'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Avisos por horário agendados</Text>
              <Text style={styles.value}>{scheduledCount}</Text>
            </View>
          </>
        ) : (
          <Text style={styles.hint}>Notificações não estão disponíveis na versão web.</Text>
        )}
      </View>

      {arrivals.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Últimas chegadas</Text>
          {arrivals.slice(0, 5).map((a, i) => (
            <View key={`${a.id}-${a.at}-${i}`} style={styles.arrival}>
              <Text style={styles.label}>{a.title}</Text>
              <Text style={styles.hint}>{new Date(a.at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}{a.place ? ` · ${a.place}` : ''}</Text>
            </View>
          ))}
        </View>
      )}

      <Button label="Sair da conta" onPress={() => void sair()} variant="secondary" style={styles.logout} disabled={excluindo} />

      <Button label="Política de privacidade" onPress={() => router.push('/privacidade')} variant="ghost" style={styles.logout} />

      <View style={styles.danger}>
        <Text style={styles.dangerTitle}>Excluir conta</Text>
        <Text style={styles.hint}>Apaga sua conta e todos os seus lembretes de forma definitiva.</Text>
        {erroExcluir !== '' && <Text style={styles.error}>{erroExcluir}</Text>}
        <Button
          label={excluindo ? 'Excluindo...' : 'Excluir minha conta'}
          onPress={() => void excluir()}
          variant="ghost"
          disabled={excluindo}
          style={styles.deleteButton}
          labelStyle={styles.deleteLabel}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F2ED' },
  content: { padding: 16, paddingBottom: 48 },
  section: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0A0A0A', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  rowText: { flex: 1, marginRight: 12 },
  label: { fontSize: 14, fontWeight: '500', color: '#0A0A0A' },
  hint: { fontSize: 12, color: '#767880', marginTop: 2 },
  value: { fontSize: 14, fontWeight: '600', color: '#FE532A' },
  badge: { fontSize: 12, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, overflow: 'hidden' },
  badgeOk: { color: '#0B7A3B', backgroundColor: '#E6F5E6' },
  badgeOff: { color: '#C62828', backgroundColor: '#FFE6E6' },
  error: { fontSize: 12, color: '#C62828', marginBottom: 12 },
  arrival: { backgroundColor: '#F5F2ED', borderRadius: 8, padding: 10, marginBottom: 8 },
  logout: { alignSelf: 'stretch', marginTop: 8 },
  danger: { marginTop: 32, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#F3B8B8', backgroundColor: '#FFF5F5' },
  dangerTitle: { fontSize: 16, fontWeight: '700', color: '#C62828', marginBottom: 4 },
  deleteButton: { alignSelf: 'stretch', marginTop: 12, borderColor: '#C62828' },
  deleteLabel: { color: '#C62828' },
});
