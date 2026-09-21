import { TextInput, View, Text, StyleSheet, ViewStyle, type TextInputProps } from 'react-native';
import { useState } from 'react';

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
          focused && styles.inputFocused,
          error && styles.inputError,
          !editable && styles.inputDisabled,
        ]}
        placeholder={placeholder}
        placeholderTextColor="#85858F"
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
      {!!error && <Text style={styles.errorText}>{error}</Text>}
      {!error && !!hint && <Text style={styles.hintText}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A0A0A',
    marginBottom: 8,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E7E8EA',
    borderRadius: 8,
    fontSize: 16,
    color: '#0A0A0A',
    backgroundColor: '#FFFFFF',
  },
  inputFocused: {
    borderColor: '#FE532A', // orange-500
  },
  inputError: {
    borderColor: '#FF4444',
    backgroundColor: '#FFE6E6',
  },
  inputDisabled: {
    backgroundColor: '#F5F2ED',
    color: '#767880',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 12,
    marginTop: 4,
  },
  hintText: {
    color: '#767880',
    fontSize: 12,
    marginTop: 4,
  },
});
