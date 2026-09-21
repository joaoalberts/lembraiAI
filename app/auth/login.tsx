import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Button } from '../../src/components/Button';
import { TextField } from '../../src/components/TextField';
import { validarEmail } from '../../src/lib/validacao';
import { useAuth } from '../../src/state/auth';

export default function LoginScreen() {
  const { entrar } = useAuth();
  const { redefinida } = useLocalSearchParams<{ redefinida?: string }>();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [lembrar, setLembrar] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    const problema = validarEmail(email) ?? (senha ? null : 'Informe sua senha.');
    if (problema) {
      setError(problema);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const erro = await entrar(email, senha, lembrar);
      // Sucesso: o Stack.Protected do layout raiz leva ao app assim que a sessão chega
      if (erro) setError(erro);
    } catch (err) {
      setError('Erro ao entrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>lembreiAI</Text>
        <Text style={styles.subtitle}>Entre na sua conta</Text>
      </View>

      {redefinida === '1' && error === '' && (
        <Text style={styles.successBanner}>Senha redefinida. Entre com a nova senha.</Text>
      )}
      {error !== '' && <Text style={styles.errorBanner}>{error}</Text>}

      <TextField
        label="E-mail"
        placeholder="seu@email.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoComplete="email"
        editable={!loading}
      />

      <TextField
        label="Senha"
        placeholder="Sua senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        autoComplete="current-password"
        editable={!loading}
      />

      <View style={styles.rememberRow}>
        <Text style={styles.rememberLabel}>Manter conectado</Text>
        <Switch value={lembrar} onValueChange={setLembrar} disabled={loading} accessibilityLabel="Manter conectado" />
      </View>

      <Button
        label={loading ? 'Entrando...' : 'Entrar'}
        onPress={handleLogin}
        disabled={loading}
        style={styles.button}
      />

      <View style={styles.links}>
        <Button
          label="Criar conta"
          onPress={() => router.navigate('/auth/signup')}
          variant="ghost"
          disabled={loading}
        />
        <Button
          label="Esqueci minha senha"
          onPress={() => router.navigate('/auth/forgot-password')}
          variant="ghost"
          disabled={loading}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F2ED',
  },
  content: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0A0A0A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#767880',
  },
  errorBanner: {
    backgroundColor: '#FFE6E6',
    color: '#FF4444',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    textAlign: 'center',
  },
  successBanner: {
    backgroundColor: '#E7F4EB',
    color: '#0B7A3B',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    textAlign: 'center',
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rememberLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0A0A0A',
  },
  button: {
    marginTop: 24,
  },
  links: {
    marginTop: 16,
    gap: 12,
  },
});
