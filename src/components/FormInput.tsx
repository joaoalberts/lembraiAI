import { useState } from 'react';
import { StyleSheet, TextInput, type TextInputProps } from 'react-native';
import { semAnelDoNavegador } from '../design/foco';
import { colors, fontFamily, radius, shadow, size, space, textStyles } from '../design/tokens';

/**
 * Campo de texto branco do formulário (a descrição do lembrete): anel cinza por dentro que vira verde com halo em foco.
 * O rótulo fica fora, no cartão. Padrão: docs/DESIGN_SYSTEM.md, seção 11.11.
 */
export function FormInput({ onFocus, onBlur, style, ...resto }: TextInputProps) {
  const [focado, setFocado] = useState(false);
  return (
    <TextInput
      {...resto}
      placeholderTextColor={colors.text.placeholder}
      onFocus={(e) => { setFocado(true); onFocus?.(e); }}
      onBlur={(e) => { setFocado(false); onBlur?.(e); }}
      style={[styles.campo, focado ? styles.emFoco : null, style]}
    />
  );
}

const styles = StyleSheet.create({
  campo: {
    ...textStyles.body,
    height: size.form.field,
    paddingHorizontal: space.md,
    borderRadius: radius.field,
    backgroundColor: colors.bg.field,
    boxShadow: shadow.field,
    color: colors.text.primary,
    fontFamily: fontFamily.regular,
    ...semAnelDoNavegador,
    // web: iOS Safari auto-zoom com fontSize < 16px; usar 16px desabilita o zoom
    fontSize: 16,
  },
  emFoco: { boxShadow: shadow.fieldFocus },
});
