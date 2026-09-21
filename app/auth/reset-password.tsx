import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '../../src/components/Button';
import { TextField } from '../../src/components/TextField';
import {
  CODIGO_TAMANHO, MIN_SENHA, forcaDaSenha, validarCodigo, validarConfirmacao, validarEmail, validarSenha,
} from '../../src/lib/validacao';
import { useAuth } from '../../src/state/auth';

/**
 * Duas etapas, guiadas pelo estado `recuperando` do AuthProvider:
 *  1) código de 6 números do e-mail (ou o link do e-mail, na web, que chega com `token_hash` e valida sozinho);
 *  2) nova senha. Entre as duas já há sessão, mas o roteamento a trata como "ainda não entrou".
 */
export default function ResetPasswordScreen() {
  const { token_hash, email: emailParam } = useLocalSearchParams<{ token_hash?: string; email?: string }>();
  const { recuperando, validarTokenRecuperacao, validarCodigoRecuperacao, definirNovaSenha, cancelarRecuperacao } = useAuth();
  const [email, setEmail] = useState(emailParam ?? '');
  const [codigo, setCodigo] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const linkTentado = useRef<string | null>(null);

  // Link do e-mail (web): valida sozinho, uma vez por token (o token vale uma única vez)
  useEffect(() => {
    if (!token_hash || recuperando || linkTentado.current === token_hash) return;
    linkTentado.current = token_hash;
    setLoading(true);
    void validarTokenRecuperacao(token_hash).then((erro) => {
      if (erro) setError(erro);
      setLoading(false);
    });
  }, [token_hash, recuperando, validarTokenRecuperacao]);

  const verificarCodigo = async () => {
    const problema = validarEmail(email) ?? validarCodigo(codigo);
    if (problema) { setError(problema); return; }
    setLoading(true);
    setError('');
    const erro = await validarCodigoRecuperacao(email, codigo);
    setLoading(false);
    if (erro) setError(erro);
  };

  const salvarSenha = async () => {
    const problema = validarSenha(senha) ?? validarConfirmacao(senha, confirmacao);
    if (problema) { setError(problema); return; }
    setLoading(true);
    setError('');
    const erro = await definirNovaSenha(senha);
    setLoading(false);
    if (erro) { setError(erro); return; }
    router.replace({ pathname: '/auth/login', params: { redefinida: '1' } });
  };

  const voltar = async () => {
    await cancelarRecuperacao();
    router.replace('/auth/login');
  };

  if (recuperando) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Nova senha</Text>
          <Text style={styles.subtitle}>Escolha a senha que vai usar para entrar</Text>
        </View>

        {error !== '' && <Text style={styles.errorBanner}>{error}</Text>}

        <TextField
          label="Nova senha"
          placeholder="Sua nova senha"
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
          value={confirmacao}
          onChangeText={setConfirmacao}
          secureTextEntry
          autoComplete="new-password"
          editable={!loading}
        />

        <Button label={loading ? 'Salvando...' : 'Salvar nova senha'} onPress={salvarSenha} disabled={loading} style={styles.button} />
        <Button label="Cancelar" onPress={voltar} variant="ghost" disabled={loading} />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.title}>Redefinir senha</Text>
        <Text style={styles.subtitle}>
          {token_hash ? 'Validando o link do e-mail...' : `Digite o código de ${CODIGO_TAMANHO} números que enviamos por e-mail`}
        </Text>
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
      <TextField
        label="Código"
        placeholder="000000"
        value={codigo}
        onChangeText={(t) => setCodigo(t.replace(/\D/g, ''))}
        keyboardType="numeric"
        maxLength={CODIGO_TAMANHO}
        autoComplete="one-time-code"
        editable={!loading}
      />

      <Button label={loading ? 'Verificando...' : 'Verificar código'} onPress={verificarCodigo} disabled={loading} style={styles.button} />
      <Button label="Pedir um novo código" onPress={() => router.replace('/auth/forgot-password')} variant="ghost" disabled={loading} />
      <Button label="Voltar para o login" onPress={voltar} variant="ghost" disabled={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F2ED' },
  content: { padding: 24, justifyContent: 'center', minHeight: '100%' },
  header: { marginBottom: 32, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0A0A0A', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#767880', textAlign: 'center' },
  errorBanner: { backgroundColor: '#FFE6E6', color: '#FF4444', padding: 12, borderRadius: 8, marginBottom: 24, textAlign: 'center' },
  button: { marginTop: 8 },
});
