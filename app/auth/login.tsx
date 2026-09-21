import { View, Text, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { AuthLayout } from '../../src/components/AuthLayout';
import { Banner } from '../../src/components/Banner';
import { Button } from '../../src/components/Button';
import { CaixaDeMarcar } from '../../src/components/CaixaDeMarcar';
import { TextField } from '../../src/components/TextField';
import { Toque } from '../../src/components/Toque';
import { colors, fontFamily, size, textStyles } from '../../src/design/tokens';
import { validarEmail } from '../../src/lib/validacao';
import { useAuth } from '../../src/state/auth';

/** Entrar (imagem 02; padrão: docs/DESIGN_SYSTEM.md, seção 11.15). Sucesso: o `Stack.Protected` do layout raiz leva ao app. */
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
      if (erro) setError(erro);
    } catch (err) {
      setError('Erro ao entrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Entrar"
      subtitle="Acesse seus lembretes por hora e por lugar."
      voltar={() => router.navigate('/auth/bem-vindo')}
      rodape={{ pergunta: 'Ainda não tem conta?', acao: 'Criar conta', onPress: () => router.navigate('/auth/signup') }}
    >
      {redefinida === '1' && error === '' && <Banner variant="success" icon="circle-check" style={styles.aviso}>Senha redefinida. Entre com a nova senha.</Banner>}
      {error !== '' && <Banner variant="error" icon="triangle-alert" style={styles.aviso}>{error}</Banner>}

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
        placeholder="Sua senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        autoComplete="current-password"
        editable={!loading}
      />

      <View style={styles.linha}>
        <CaixaDeMarcar label="Lembrar-me" value={lembrar} onValueChange={setLembrar} disabled={loading} />
        <Toque
          onPress={() => router.navigate('/auth/forgot-password')}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Esqueci minha senha"
        >
          <Text style={styles.esqueci}>Esqueci minha senha</Text>
        </Toque>
      </View>

      <Button label={loading ? 'Entrando…' : 'Entrar'} onPress={() => void handleLogin()} disabled={loading} style={styles.botao} />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  aviso: { marginTop: size.campo.top },
  linha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: size.auth.linhaGap, marginTop: size.auth.linhaTop },
  esqueci: { ...textStyles.mini, fontFamily: fontFamily.bold, color: colors.text.accent }, // 22 du (11 dp)
  botao: { marginTop: size.auth.linhaTop },
});
