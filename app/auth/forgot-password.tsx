import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Button } from '../../src/components/Button';
import { TextField } from '../../src/components/TextField';
import { CODIGO_TAMANHO, validarEmail } from '../../src/lib/validacao';
import { useAuth } from '../../src/state/auth';

export default function ForgotPasswordScreen() {
  const { pedirRedefinicao } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleRequest = async () => {
    const problema = validarEmail(email);
    if (problema) {
      setError(problema);
      return;
    }

    setLoading(true);
    setError('');
    const erro = await pedirRedefinicao(email);
    setLoading(false);
    if (erro) setError(erro);
    else setEnviado(true);
  };

  if (enviado) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.successBox}>
          <Text style={styles.successIcon}>✉️</Text>
          <Text style={styles.successTitle}>Confira seu e-mail</Text>
          <Text style={styles.successText}>
            Se <Text style={styles.bold}>{email.trim()}</Text> tiver conta, enviamos um código de {CODIGO_TAMANHO} números.
          </Text>
          <Text style={styles.successSubtext}>O código vale por 1 hora e só pode ser usado uma vez.</Text>
          <Text style={styles.successSubtext}>
            Não chegou em alguns minutos? Veja a caixa de spam. Se continuar sem chegar, peça ao administrador do app para redefinir sua senha.
          </Text>
        </View>

        <Button
          label="Digitar o código"
          onPress={() => router.push({ pathname: '/auth/reset-password', params: { email: email.trim() } })}
          style={styles.button}
        />
        <Button label="Voltar para o login" onPress={() => router.navigate('/auth/login')} variant="ghost" />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Recuperar Senha</Text>
        <Text style={styles.subtitle}>Digite seu e-mail para receber um código</Text>
      </View>

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

      <Button
        label={loading ? 'Enviando...' : 'Enviar código'}
        onPress={handleRequest}
        disabled={loading}
        style={styles.button}
      />
      <Button
        label="Já tenho um código"
        onPress={() => router.push({ pathname: '/auth/reset-password', params: email.trim() ? { email: email.trim() } : {} })}
        variant="ghost"
        disabled={loading}
      />

      <Button
        label="Voltar para Login"
        onPress={() => router.navigate('/auth/login')}
        variant="ghost"
        disabled={loading}
      />
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
  button: {
    marginTop: 24,
  },
  successBox: {
    backgroundColor: '#E7F4EB',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
  },
  successIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0A0A0A',
    marginBottom: 12,
  },
  successText: {
    fontSize: 16,
    color: '#767880',
    textAlign: 'center',
    marginBottom: 12,
  },
  bold: {
    fontWeight: '600',
    color: '#0A0A0A',
  },
  successSubtext: {
    fontSize: 14,
    color: '#767880',
    textAlign: 'center',
  },
});
