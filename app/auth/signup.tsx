import { StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { AuthLayout } from '../../src/components/AuthLayout';
import { Banner } from '../../src/components/Banner';
import { Button } from '../../src/components/Button';
import { MedidorDeSenha } from '../../src/components/MedidorDeSenha';
import { TextField } from '../../src/components/TextField';
import { size } from '../../src/design/tokens';
import { validarConfirmacao, validarEmail, validarNome, validarSenha } from '../../src/lib/validacao';
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
    <AuthLayout
      title="Criar conta"
      subtitle="Leva menos de um minuto."
      voltar={() => router.navigate('/auth/bem-vindo')}
      rodape={{ pergunta: 'Já tem conta?', acao: 'Entrar', onPress: () => router.navigate('/auth/login') }}
    >
      {aviso !== '' && <Banner variant="info" icon="mail-check" style={styles.aviso}>{aviso}</Banner>}
      {error !== '' && <Banner variant="error" icon="triangle-alert" style={styles.aviso}>{error}</Banner>}

      <TextField
        label="Nome"
        placeholder="Como podemos te chamar?"
        value={nome}
        onChangeText={setNome}
        autoComplete="name"
        autoCapitalize="words"
        editable={!loading}
      />

      <TextField
        label="E-mail"
        placeholder="nome@dominio.com"
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
        hint="Pelo menos 8 caracteres, com letras e números."
        editable={!loading}
      />
      <MedidorDeSenha senha={senha} />

      <TextField
        label="Confirmar senha"
        placeholder="Repita a senha"
        value={confirmaSenha}
        onChangeText={setConfirmaSenha}
        secureTextEntry
        autoComplete="new-password"
        editable={!loading}
      />

      <Button label={loading ? 'Criando conta…' : 'Criar conta'} onPress={() => void handleSignup()} disabled={loading} style={styles.botao} />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  aviso: { marginTop: size.campo.top },
  botao: { marginTop: size.auth.linhaTop },
});
