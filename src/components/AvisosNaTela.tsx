import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderWidth, colors, iconStroke, radius, shadow, size, space, textStyles } from '../design/tokens';
import { useNotifications } from '../state/notifications';
import { Icon } from './Icon';
import { Toque } from './Toque';

/**
 * Avisos na tela do app (só na web, onde o navegador não agenda avisos: ver `state/notifications.web.tsx`). Aparecem no alto,
 * por cima de tudo, por alguns segundos; tocar abre a lista, o X só dispensa. No celular o sistema é quem avisa e isto não desenha nada.
 */
export function AvisosNaTela() {
  const { avisosNaTela, dispensarAviso } = useNotifications();
  const { top } = useSafeAreaInsets();
  if (!avisosNaTela?.length) return null;

  return (
    <View testID="avisos-na-tela" pointerEvents="box-none" style={[styles.pilha, { top: top + space.sm }]}>
      {avisosNaTela.map((a) => (
        <View key={a.id} testID="aviso-na-tela" accessibilityRole="alert" style={styles.cartao}>
          <Toque
            accessibilityRole="button"
            accessibilityLabel={a.body ? `${a.title}. ${a.body}` : a.title}
            onPress={() => { dispensarAviso?.(a.id); router.navigate('/'); }}
            style={styles.conteudo}
          >
            <Icon name="bell" size={size.icon.sm} color={colors.icon.default} stroke={iconStroke.ui} />
            <View style={styles.textos}>
              <Text style={styles.titulo}>{a.title}</Text>
              {a.body ? <Text style={styles.corpo}>{a.body}</Text> : null}
            </View>
          </Toque>
          <Toque accessibilityRole="button" accessibilityLabel="Dispensar aviso" onPress={() => dispensarAviso?.(a.id)} style={styles.fechar}>
            <Icon name="x" size={size.icon.xs} color={colors.icon.muted} stroke={iconStroke.ui} />
          </Toque>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  pilha: { position: 'absolute', left: space.lg, right: space.lg, gap: space.sm, zIndex: 3000 },
  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    borderLeftWidth: borderWidth.bar,
    borderLeftColor: colors.feedback.infoBar,
    boxShadow: shadow.suggestions,
  },
  conteudo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md },
  textos: { flex: 1, gap: space.hair },
  titulo: { ...textStyles.label, color: colors.text.primary },
  corpo: { ...textStyles.caption, color: colors.text.secondary },
  fechar: { padding: space.md },
});
