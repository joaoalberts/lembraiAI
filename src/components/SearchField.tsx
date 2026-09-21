import { useState } from 'react';
import { StyleSheet, TextInput, View, type NativeSyntheticEvent, type TextInputKeyPressEventData } from 'react-native';
import { semAnelDoNavegador } from '../design/foco';
import { borderWidth, colors, fontFamily, iconStroke, radius, size, space, textStyles } from '../design/tokens';
import { Icon } from './Icon';

interface SearchFieldProps {
  value: string;
  onChangeText: (texto: string) => void;
  /** Tecla Esc (web): fecha a busca. */
  onClose: () => void;
}

/**
 * Campo de busca sobre o cabeçalho verde (padrão: docs/DESIGN_SYSTEM.md, seção 11.6). Abre já com o teclado, mostra a
 * tecla "buscar" e o Enter só recolhe o teclado: a lista filtra enquanto se digita.
 */
export function SearchField({ value, onChangeText, onClose }: SearchFieldProps) {
  const [focado, setFocado] = useState(false);
  const aoTeclar = (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (e.nativeEvent.key === 'Escape') onClose();
  };
  return (
    <View testID="campo-de-busca" style={[styles.campo, focado ? styles.campoEmFoco : null]}>
      <Icon name="search" size={size.icon.sm} color={colors.text.onDark} stroke={iconStroke.ui} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocado(true)}
        onBlur={() => setFocado(false)}
        onKeyPress={aoTeclar}
        placeholder="Buscar lembretes"
        placeholderTextColor={colors.text.onDarkMuted}
        accessibilityLabel="Buscar lembretes"
        autoFocus
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        selectionColor={colors.text.onDark}
        style={styles.entrada}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  campo: {
    height: size.header.searchHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: borderWidth.hairline,
    borderColor: colors.glass.border,
    backgroundColor: colors.glass.field,
  },
  campoEmFoco: { borderColor: colors.border.focusOnDark, backgroundColor: colors.glass.fieldFocus },
  // sem contorno do navegador: o próprio campo já muda de borda e de fundo em foco
  entrada: { ...textStyles.body, flex: 1, minWidth: 0, height: '100%', padding: 0, color: colors.text.onDark, fontFamily: fontFamily.regular, ...semAnelDoNavegador },
});
