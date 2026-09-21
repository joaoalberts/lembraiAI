import { TextInput, View, Text, StyleSheet, ViewStyle, type TextInputProps } from 'react-native';
import { useState } from 'react';
import { borderWidth, colors, fontSize, radius, shadow, space, textStyles } from '../design/tokens';

interface TextFieldProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  editable?: boolean;
  error?: string;
  /** Orientação discreta abaixo do campo; some quando há erro. */
  hint?: string;
  maxLength?: number;
  /** Padrão: `none` em e-mail, senha e números (o teclado não pode capitalizar a 1ª letra do e-mail). */
  autoCapitalize?: TextInputProps['autoCapitalize'];
  /** Ajuda o gerenciador de senhas e o preenchimento automático (`email`, `current-password`, `new-password`, `one-time-code`). */
  autoComplete?: TextInputProps['autoComplete'];
  style?: ViewStyle;
}

/** Padrão: docs/DESIGN_SYSTEM.md, seção 10. */
export function TextField({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  editable = true,
  error,
  hint,
  maxLength,
  autoCapitalize,
  autoComplete,
  style,
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const semCapitalizar = secureTextEntry || keyboardType !== 'default';

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          focused && !error && styles.inputFocused,
          error && styles.inputError,
          !editable && styles.inputDisabled,
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.text.placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        editable={editable}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize ?? (semCapitalizar ? 'none' : 'sentences')}
        autoCorrect={!semCapitalizar}
        autoComplete={autoComplete}
        accessibilityLabel={label ?? placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {!!error && <Text style={styles.errorText} accessibilityRole="alert">{error}</Text>}
      {!error && !!hint && <Text style={styles.hintText}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: space.lg,
  },
  label: {
    ...textStyles.label,
    color: colors.text.primary,
    marginBottom: space.sm,
  },
  input: {
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderWidth: borderWidth.hairline,
    borderColor: colors.border.field,
    borderRadius: radius.md,
    fontSize: fontSize.bodyLg,
    color: colors.text.primary,
    backgroundColor: colors.bg.field,
    outlineWidth: 0, // o foco é a borda verde + o halo; sem isto o navegador soma o anel âmbar dele
  },
  inputFocused: {
    borderColor: colors.border.focus,
    boxShadow: shadow.focus,
  },
  inputError: {
    borderColor: colors.border.danger,
  },
  inputDisabled: {
    backgroundColor: colors.bg.disabled,
    color: colors.text.secondary,
  },
  errorText: {
    ...textStyles.caption,
    color: colors.text.danger,
    marginTop: space.xs,
  },
  hintText: {
    ...textStyles.caption,
    color: colors.text.secondary,
    marginTop: space.xs,
  },
});
