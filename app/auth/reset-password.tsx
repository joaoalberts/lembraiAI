import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { AuthLayout } from '../../src/components/AuthLayout';
import { Banner } from '../../src/components/Banner';
import { Button } from '../../src/components/Button';
import { TextField } from '../../src/components/TextField';
import { space } from '../../src/design/tokens';
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
      <AuthLayout title="Nova senha" subtitle="Escolha a senha que vai usar para entrar" keyboardShouldPersistTaps="handled">
        {error !== '' && <Banner variant="error" style={styles.aviso}>{error}</Banner>}

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

        <View style={styles.actions}>
          <Button label={loading ? 'Salvando...' : 'Salvar nova senha'} onPress={salvarSenha} disabled={loading} />
          <Button label="Cancelar" onPress={voltar} variant="ghost" disabled={loading} />
        </View>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Redefinir senha"
      subtitle={token_hash ? 'Validando o link do e-mail...' : `Digite o código de ${CODIGO_TAMANHO} números que enviamos por e-mail`}
      keyboardShouldPersistTaps="handled"
    >
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
        label="Código"
        placeholder="000000"
        value={codigo}
        onChangeText={(t) => setCodigo(t.replace(/\D/g, ''))}
        keyboardType="numeric"
        maxLength={CODIGO_TAMANHO}
        autoComplete="one-time-code"
        editable={!loading}
      />

      <View style={styles.actions}>
        <Button label={loading ? 'Verificando...' : 'Verificar código'} onPress={verificarCodigo} disabled={loading} />
        <Button label="Pedir um novo código" onPress={() => router.replace('/auth/forgot-password')} variant="ghost" disabled={loading} />
        <Button label="Voltar para o login" onPress={voltar} variant="ghost" disabled={loading} />
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  aviso: { marginBottom: space.xl },
  actions: { marginTop: space.sm, gap: space.md },
});
