import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CATEGORY_COLORS, type Reminder } from '../data/reminders';
import { anelDeFoco, type EstadoDeToque } from '../design/foco';
import { GIRO_NA_LISTA, ICON_NAME, UI_ICON } from '../design/icons';
import { borderWidth, colors, fontFamily, iconStroke, opacity, radius, shadow, size, space, textStyles } from '../design/tokens';
import { formatDate } from '../lib/format';
import { Icon } from './Icon';
import { RadiusIcon } from './RadiusIcon';
import { Tag } from './Tag';
import { Toggle } from './Toggle';

const MINIATURA_DO_MAPA = require('../../assets/art/thumb-sucesso.jpg');

interface ReminderCardProps {
  reminder: Reminder;
  /** A pessoa está dentro do raio deste lembrete agora. */
  nearby?: boolean;
  onToggle: () => void;
  /** Abre o menu do lembrete (Editar e Excluir). */
  onMenu: () => void;
}

/** Halo atrás das reticências: só aparece com o ponteiro em cima, pressionado ou com foco de teclado. */
function estiloDoHalo(estado: EstadoDeToque) {
  return [styles.halo, estado.pressed ? { backgroundColor: colors.control.haloPressed } : estado.hovered || estado.focused ? { backgroundColor: colors.control.haloHover } : null];
}

/**
 * Cartão de lembrete da lista (padrão: docs/DESIGN_SYSTEM.md, seção 11.1): faixa da categoria, círculo com o glifo,
 * título, data (ou lugar e raio), etiqueta, hora, interruptor e as reticências do menu. O cartão em si não é tocável.
 */
export function ReminderCard({ reminder: r, nearby = false, onToggle, onMenu }: ReminderCardProps) {
  const cor = CATEGORY_COLORS[r.category];
  const porLocal = r.kind === 'local';

  return (
    <View testID="reminder-card" style={[styles.cartao, nearby && styles.nearby, !r.active && styles.inactive]}>
      <View testID="reminder-bar" style={[styles.faixa, { backgroundColor: cor.bar }]} />
      {/* o ícone é decorativo: o título já diz tudo ao leitor de tela */}
      <View testID="reminder-icon" style={[styles.circulo, { backgroundColor: cor.bg }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Icon name={ICON_NAME[r.icon]} size={size.card.glyph} color={cor.ink} stroke={iconStroke.glyph} giro={GIRO_NA_LISTA[r.icon]} />
      </View>

      <View style={styles.texto}>
        <Text numberOfLines={1} style={styles.titulo}>{r.title}</Text>
        {porLocal ? (
          <>
            <View style={styles.linha}>
              <Icon name="map-pin" size={size.card.metaIcon} color={colors.icon.default} stroke={iconStroke.ui} />
              <Text numberOfLines={1} style={[styles.meta, styles.lugar]}>{r.place || 'Local escolhido'}</Text>
            </View>
            <View style={styles.linha}>
              <RadiusIcon />
              <Text numberOfLines={1} style={styles.meta}>Raio de {r.radius} metros</Text>
            </View>
          </>
        ) : (
          <View style={styles.linha}>
            <Icon name="calendar-days" size={size.card.metaIcon} color={colors.icon.default} stroke={iconStroke.ui} />
            <Text numberOfLines={1} style={styles.meta}>{formatDate(r.dateISO)}</Text>
          </View>
        )}
        <Tag kind={r.kind} category={r.category} />
        {nearby && (
          <View style={styles.linha}>
            <Icon name={UI_ICON.aqui} size={size.icon.sm} color={colors.text.accent} />
            <Text style={styles.aqui}>Você está aqui</Text>
          </View>
        )}
      </View>

      {porLocal && <Image testID="reminder-thumb" source={MINIATURA_DO_MAPA} contentFit="cover" accessible={false} style={styles.miniatura} />}

      <View style={[styles.direita, porLocal ? styles.direitaLocal : null]}>
        <Text style={styles.hora}>{r.time}</Text>
        <Toggle value={r.active} onValueChange={onToggle} accessibilityLabel={`Ativar lembrete: ${r.title}`} />
      </View>

      <Pressable
        onPress={onMenu}
        hitSlop={(size.touch - size.card.dotsHeight) / 2}
        accessibilityRole="button"
        accessibilityLabel={`Mais opções: ${r.title}`}
        style={styles.reticencias}
      >
        {(estado: EstadoDeToque) => (
          <View style={estiloDoHalo(estado)}>
            <Icon name="ellipsis" size={size.icon.md} color={colors.icon.dots} stroke={iconStroke.dots} />
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    minHeight: size.card.minHeight,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.bg.card,
    boxShadow: shadow.card,
  },
  nearby: { outlineWidth: borderWidth.focus, outlineColor: colors.border.focus, outlineStyle: 'solid' },
  inactive: { opacity: opacity.inactive },
  faixa: { position: 'absolute', top: 0, bottom: 0, left: 0, width: borderWidth.bar },
  circulo: {
    width: size.card.circle,
    height: size.card.circle,
    marginLeft: size.card.circleLeft,
    marginTop: size.card.circleTop,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texto: { flex: 1, minWidth: 0, gap: space.xs, paddingLeft: size.card.textGap, paddingVertical: size.card.circleTop },
  titulo: { ...textStyles.body, fontFamily: fontFamily.serif, color: colors.text.primary },
  linha: { flexDirection: 'row', alignItems: 'center', gap: size.card.metaGap },
  meta: { ...textStyles.micro, color: colors.text.secondary, flexShrink: 1 },
  lugar: { fontFamily: fontFamily.medium, color: colors.text.primary },
  aqui: { ...textStyles.micro, fontFamily: fontFamily.semibold, color: colors.text.accent },
  miniatura: { width: size.card.thumbWidth, height: size.card.thumbHeight, marginTop: size.card.circleTop, marginLeft: space.sm, borderRadius: radius.md },
  direita: { width: size.card.rightColumn, alignItems: 'center', gap: space.xs, marginRight: size.card.rightInset, paddingTop: size.card.rightTop },
  direitaLocal: { paddingTop: size.card.rightTop + size.card.localShift },
  hora: { ...textStyles.micro, fontFamily: fontFamily.medium, color: colors.text.primary },
  reticencias: { position: 'absolute', top: 0, right: size.card.dotsCenter - size.card.dotsWidth / 2, width: size.card.dotsWidth, height: size.card.dotsHeight, alignItems: 'center', justifyContent: 'center' },
  halo: { width: size.icon.lg, height: size.icon.lg, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});
