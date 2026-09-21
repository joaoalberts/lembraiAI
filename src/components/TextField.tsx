import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';
import { semAnelDoNavegador, type EstadoDeToque } from '../design/foco';
import { colors, fontFamily, iconStroke, radius, shadow, size, textStyles } from '../design/tokens';
import { Icon } from './Icon';

import { Toque } from './Toque';
interface TextFieldProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  /** Campo de senha: começa escondido e ganha o botão do olho para mostrar e esconder. */
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
  style?: StyleProp<ViewStyle>;
}

/**
 * Campo de texto das telas de conta e da folha "Minha conta": rótulo em negrito, caixa branca com o anel cinza por dentro
 * (verde em foco, vermelho com erro) e, na senha, o olho que mostra e esconde. A mensagem de erro leva um ícone de alerta e é
 * anunciada; a dica some quando há erro. Padrão: docs/DESIGN_SYSTEM.md, seção 10.
 */
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
  const [emFoco, setEmFoco] = useState(false);
  const [mostrar, setMostrar] = useState(false);
  const semCapitalizar = secureTextEntry || keyboardType !== 'default';
  const comErro = !!error;
  const sombra = comErro ? (emFoco ? shadow.campoErroFoco : shadow.campoErro) : emFoco ? shadow.fieldFocus : shadow.field;

  return (
    <View style={[styles.campo, style]}>
      {label ? <Text style={styles.rotulo}>{label}</Text> : null}
      <View testID="campo-caixa" style={[styles.caixa, { boxShadow: sombra }, !editable ? styles.desabilitada : null]}>
        <TextInput
          style={[styles.entrada, !editable ? styles.entradaDesabilitada : null]}
          placeholder={placeholder}
          placeholderTextColor={colors.text.placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !mostrar}
          keyboardType={keyboardType}
          editable={editable}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize ?? (semCapitalizar ? 'none' : 'sentences')}
          autoCorrect={!semCapitalizar}
          autoComplete={autoComplete}
          accessibilityLabel={label || placeholder}
          onFocus={() => setEmFoco(true)}
          onBlur={() => setEmFoco(false)}
        />
        {secureTextEntry ? (
          <Toque
            onPress={() => setMostrar((v) => !v)}
            focusable={false}
            tabIndex={-1} // o react-native-web só lê o tabIndex: sem ele o olho vira uma parada do Tab
            accessibilityRole="button"
            accessibilityLabel={mostrar ? 'Ocultar senha' : 'Mostrar senha'}
            style={styles.olho}
          >
            {(estado: EstadoDeToque) => <Icon name={mostrar ? 'eye-off' : 'eye'} size={size.campo.eyeIcon} color={estado.hovered ? colors.icon.default : colors.icon.muted} stroke={iconStroke.base} />}
          </Toque>
        ) : null}
      </View>
      {comErro ? (
        <View style={styles.mensagem}>
          <Icon name="triangle-alert" size={size.campo.mensagemIcon} color={colors.text.danger} stroke={iconStroke.ui} />
          <Text accessibilityRole="alert" style={[styles.textoDaMensagem, { color: colors.text.danger }]}>{error}</Text>
        </View>
      ) : hint ? (
        <Text style={[styles.textoDaMensagem, { color: colors.text.secondary }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  campo: { marginTop: size.campo.top, gap: size.campo.gap },
  rotulo: { ...textStyles.micro, fontFamily: fontFamily.bold, color: colors.text.primary },
  caixa: { height: size.campo.height, flexDirection: 'row', alignItems: 'center', borderRadius: radius.campo, backgroundColor: colors.bg.field },
  desabilitada: { backgroundColor: colors.bg.disabled },
  entrada: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    paddingHorizontal: size.campo.padding,
    ...textStyles.caption,
    color: colors.text.primary,
    ...semAnelDoNavegador, // o foco é o anel da caixa; sem isto o navegador soma o anel âmbar dele
  },
  entradaDesabilitada: { color: colors.text.secondary },
  olho: { width: size.campo.eye, height: '100%', alignItems: 'center', justifyContent: 'center' },
  mensagem: { flexDirection: 'row', alignItems: 'flex-start', gap: size.campo.mensagemGap },
  textoDaMensagem: { ...textStyles.micro, flexShrink: 1 },
});
