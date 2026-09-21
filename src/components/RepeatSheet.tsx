import { Pressable, StyleSheet, Text, View } from 'react-native';
import { REPEAT_OPTIONS, type RepeatKey } from '../data/reminders';
import { anelDeFoco, type EstadoDeToque } from '../design/foco';
import { borderWidth, colors, fontFamily, iconStroke, radius, size, space, textStyles } from '../design/tokens';
import { Icon } from './Icon';
import { Sheet } from './Sheet';

interface RepeatSheetProps {
  visible: boolean;
  value: RepeatKey;
  /** Escolher uma linha aplica e a folha fecha na hora. */
  onSelect: (chave: RepeatKey) => void;
  onClose: () => void;
}

/** Estilo da linha por estado. Função pura e exportada (o ponteiro em cima e o foco só existem na web). */
export function estiloDaLinhaDeEscolha(estado: EstadoDeToque, escolhida: boolean, primeira: boolean) {
  return [
    styles.linha,
    primeira ? null : styles.divisoria,
    escolhida ? { backgroundColor: colors.feedback.successBg } : estado.pressed ? { backgroundColor: colors.control.rowPressed } : estado.hovered ? { backgroundColor: colors.control.rowHover } : null,
    estado.focused ? anelDeFoco : null,
  ];
}

/** Folha "Repetir" (imagem 14): as seis frequências, cada uma com a sua explicação; a escolhida leva o selo de visto. */
export function RepeatSheet({ visible, value, onSelect, onClose }: RepeatSheetProps) {
  return (
    <Sheet visible={visible} onClose={onClose} title="Repetir" subtitle="Escolha com que frequência o lembrete deve se repetir.">
      <View accessibilityRole="radiogroup" accessibilityLabel="Repetir" style={styles.lista}>
        {REPEAT_OPTIONS.map((o, i) => {
          const escolhida = o.key === value;
          return (
            <Pressable
              key={o.key}
              onPress={() => { onSelect(o.key); onClose(); }}
              accessibilityRole="radio"
              accessibilityLabel={o.label}
              aria-checked={escolhida}
              style={(estado: EstadoDeToque) => estiloDaLinhaDeEscolha(estado, escolhida, i === 0)}
            >
              <View style={styles.textos}>
                <Text style={styles.titulo}>{o.label}</Text>
                <Text style={styles.descricao}>{o.desc}</Text>
              </View>
              {escolhida ? (
                <View testID="repetir-selo" style={[styles.marca, styles.selo]}>
                  <Icon name="check" size={size.form.rowCheck} color={colors.text.onDark} stroke={iconStroke.check} />
                </View>
              ) : (
                <View testID="repetir-anel" style={[styles.marca, styles.anel]} />
              )}
            </Pressable>
          );
        })}
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  lista: { marginTop: size.menu.listTop, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.bg.field, borderWidth: borderWidth.hairline, borderColor: colors.border.field },
  linha: { minHeight: size.form.row, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: size.form.rowGap, paddingLeft: size.form.rowLeft, paddingRight: size.form.rowRight, paddingVertical: space.sm },
  divisoria: { borderTopWidth: borderWidth.hairline, borderTopColor: colors.border.divider },
  textos: { flexShrink: 1, gap: space.hair },
  titulo: { ...textStyles.body, fontFamily: fontFamily.bold, color: colors.text.primary },
  descricao: { ...textStyles.micro, color: colors.text.secondary },
  marca: { borderRadius: radius.pill },
  selo: { width: size.form.rowBadge, height: size.form.rowBadge, backgroundColor: colors.control.badge, alignItems: 'center', justifyContent: 'center' },
  anel: { width: size.form.rowRadio, height: size.form.rowRadio, borderWidth: borderWidth.hairline, borderColor: colors.border.strong },
});
