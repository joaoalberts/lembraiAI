import type { ComponentProps } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { AuthLayout } from '../../src/components/AuthLayout';
import { Banner } from '../../src/components/Banner';
import { Button } from '../../src/components/Button';
import { TextField } from '../../src/components/TextField';
import { UI_ICON } from '../../src/design/icons';
import { colors, fontFamily, radius, size, space, textStyles } from '../../src/design/tokens';
import { CODIGO_TAMANHO, validarEmail } from '../../src/lib/validacao';
import { useAuth } from '../../src/state/auth';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

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
      <AuthLayout>
        <View style={styles.successBox}>
          {/* decorativo: o título logo abaixo já diz o que aconteceu */}
          <View style={styles.successIcon} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <Ionicons name={UI_ICON.email as IoniconName} size={size.icon.xl} color={colors.icon.default} />
          </View>
          <Text style={styles.successTitle}>Confira seu e-mail</Text>
          <Text style={styles.successText}>
            Se <Text style={styles.bold}>{email.trim()}</Text> tiver conta, enviamos um código de {CODIGO_TAMANHO} números.
          </Text>
          <Text style={styles.successSubtext}>O código vale por 1 hora e só pode ser usado uma vez.</Text>
          <Text style={styles.successSubtext}>
            Não chegou em alguns minutos? Veja a caixa de spam. Se continuar sem chegar, peça ao administrador do app para redefinir sua senha.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            label="Digitar o código"
            onPress={() => router.push({ pathname: '/auth/reset-password', params: { email: email.trim() } })}
          />
          <Button label="Voltar para o login" onPress={() => router.navigate('/auth/login')} variant="ghost" />
        </View>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Recuperar Senha" subtitle="Digite seu e-mail para receber um código">
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

      <View style={styles.actions}>
        <Button
          label={loading ? 'Enviando...' : 'Enviar código'}
          onPress={handleRequest}
          disabled={loading}
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
  successBox: {
    backgroundColor: colors.feedback.successBg,
    borderRadius: radius.md,
    padding: space.xl,
    alignItems: 'center',
    marginBottom: space.xxl,
  },
  successIcon: {
    marginBottom: space.lg,
  },
  successTitle: {
    ...textStyles.title,
    color: colors.text.primary,
    marginBottom: space.md,
  },
  successText: {
    ...textStyles.bodyLg,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: space.md,
  },
  bold: {
    fontFamily: fontFamily.semibold,
    color: colors.text.primary,
  },
  successSubtext: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: space.sm,
  },
});
