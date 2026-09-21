import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Button } from '../../src/components/Button';
import { TextField } from '../../src/components/TextField';
import { MIN_SENHA, forcaDaSenha, validarConfirmacao, validarEmail, validarNome, validarSenha } from '../../src/lib/validacao';
import { AVISO_CONFIRMAR_EMAIL, useAuth } from '../../src/state/auth';

export default function SignupScreen() {
  const { cadastrar } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');

  const handleSignup = async () => {
    const problema =
      validarNome(nome) ?? validarEmail(email) ?? validarSenha(senha) ?? validarConfirmacao(senha, confirmaSenha);
    if (problema) {
      setError(problema);
      return;
    }

    setLoading(true);
    setError('');
    setAviso('');

    try {
      const erro = await cadastrar(nome, email, senha);
      // Sucesso com sessão: o Stack.Protected do layout raiz leva ao app. Sem sessão, falta confirmar o e-mail.
      if (erro === AVISO_CONFIRMAR_EMAIL) setAviso(erro);
      else if (erro) setError(erro);
    } catch (err) {
      setError('Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Criar Conta</Text>
        <Text style={styles.subtitle}>Bem-vindo ao lembreiAI</Text>
      </View>

      {aviso !== '' && <Text style={styles.infoBanner}>{aviso}</Text>}
      {error !== '' && <Text style={styles.errorBanner}>{error}</Text>}

      <TextField
        label="Nome"
        placeholder="Seu nome"
        value={nome}
        onChangeText={setNome}
        autoComplete="name"
        autoCapitalize="words"
        editable={!loading}
      />

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
        placeholder="Crie uma senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        autoComplete="new-password"
        hint={senha ? forcaDaSenha(senha).rotulo : `Mínimo de ${MIN_SENHA} caracteres, com letras e números.`}
        editable={!loading}
      />

      <TextField
        label="Confirmar senha"
        placeholder="Repita a senha"
        value={confirmaSenha}
        onChangeText={setConfirmaSenha}
        secureTextEntry
        autoComplete="new-password"
        editable={!loading}
      />

      <Button
        label={loading ? 'Criando conta...' : 'Criar Conta'}
        onPress={handleSignup}
        disabled={loading}
        style={styles.button}
      />

      <Button
        label="Já tenho conta — Entrar"
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
  infoBanner: {
    backgroundColor: '#E6F3FF',
    color: '#0A0A0A',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    textAlign: 'center',
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
});
