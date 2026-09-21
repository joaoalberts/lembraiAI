import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View, type ScrollViewProps } from 'react-native';
import { colors, space, textStyles } from '../design/tokens';

interface AuthLayoutProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  keyboardShouldPersistTaps?: ScrollViewProps['keyboardShouldPersistTaps'];
}

/** Base das telas de conta (entrar, criar conta, esqueci e redefinir a senha): fundo, respiro, título e subtítulo iguais. */
export function AuthLayout({ title, subtitle, children, keyboardShouldPersistTaps }: AuthLayoutProps) {
  return (
    <ScrollView
      testID="auth-layout"
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
    >
      {title ? (
        <View style={styles.header}>
          <Text style={styles.title} accessibilityRole="header">{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      ) : null}
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.page },
  content: { padding: space.xl, justifyContent: 'center', minHeight: '100%' },
  header: { marginBottom: space.xxl, alignItems: 'center' },
  title: { ...textStyles.display, color: colors.text.primary, marginBottom: space.sm, textAlign: 'center' },
  subtitle: { ...textStyles.bodyLg, color: colors.text.secondary, textAlign: 'center' },
});
