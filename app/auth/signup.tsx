import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { AuthLayout } from '../../src/components/AuthLayout';
import { Banner } from '../../src/components/Banner';
import { Button } from '../../src/components/Button';
import { TextField } from '../../src/components/TextField';
import { space } from '../../src/design/tokens';
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
    <AuthLayout title="Criar Conta" subtitle="Bem-vindo ao LembreiAi">
      {aviso !== '' && <Banner variant="info" style={styles.aviso}>{aviso}</Banner>}
      {error !== '' && <Banner variant="error" style={styles.aviso}>{error}</Banner>}

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

      <View style={styles.actions}>
        <Button
          label={loading ? 'Criando conta...' : 'Criar Conta'}
          onPress={handleSignup}
          disabled={loading}
        />
        <Button
          label="Já tenho conta — Entrar"
          onPress={() => router.navigate('/auth/login')}
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
  actions: {
    marginTop: space.xl,
    gap: space.md,
  },
});
