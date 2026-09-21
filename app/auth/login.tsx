import { View, Text, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { AuthLayout } from '../../src/components/AuthLayout';
import { Banner } from '../../src/components/Banner';
import { Button } from '../../src/components/Button';
import { TextField } from '../../src/components/TextField';
import { Toggle } from '../../src/components/Toggle';
import { colors, fontFamily, space, textStyles } from '../../src/design/tokens';
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
    <AuthLayout title="LembreiAi" subtitle="Entre na sua conta">
      {redefinida === '1' && error === '' && (
        <Banner variant="success" style={styles.aviso}>Senha redefinida. Entre com a nova senha.</Banner>
      )}
      {error !== '' && <Banner variant="error" style={styles.aviso}>{error}</Banner>}

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
        <Toggle variant="form" value={lembrar} onValueChange={setLembrar} disabled={loading} accessibilityLabel="Manter conectado" />
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
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  aviso: {
    marginBottom: space.xl,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.sm,
  },
  rememberLabel: {
    ...textStyles.body,
    fontFamily: fontFamily.medium,
    color: colors.text.primary,
  },
  button: {
    marginTop: space.xl,
  },
  links: {
    marginTop: space.lg,
    gap: space.md,
  },
});
