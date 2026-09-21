import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Easing, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, layout, motion, radius, shadow, size, space, textStyles } from '../design/tokens';
import { useMovimentoReduzido } from '../lib/movimento';
import { useAlturaDoTeclado } from '../lib/teclado';

interface SheetProps {
  visible: boolean;
  /** Toque no véu, tecla Esc (web) e botão voltar do Android. */
  onClose: () => void;
  title: string;
  subtitle?: string;
  /** Ação no canto de cima da folha (o "Pronto" do horário). */
  action?: ReactNode;
  children?: ReactNode;
}

/** A web não tem o driver nativo do `Animated`. Lido a cada uso (e não uma vez ao carregar) para o teste poder trocar. */
const comDriverNativo = () => Platform.OS !== 'web';
const CURVA_DA_FOLHA = Easing.bezier(motion.curve.x1, motion.curve.y1, motion.curve.x2, motion.curve.y2);
/** ease-out do CSS: cubic-bezier(0, 0, .58, 1), o inverso do `ease` do React Native. */
const CURVA_DO_VEU = Easing.out(Easing.ease);

/**
 * Folha inferior (padrão: docs/DESIGN_SYSTEM.md, seção 11.5): véu, folha de cantos altos colada embaixo com alça, título e
 * subtítulo. O véu aparece em 180 ms e a folha sobe em 260 ms; com "reduzir movimento" entram prontos. Não há animação
 * de saída (a folha some na hora, como no app web) nem gesto de arrastar. Só existe enquanto `visible`. Com o teclado
 * aberto ela sobe para ficar acima dele e encolhe para caber no espaço que sobra (o resto rola).
 */
export function Sheet({ visible, onClose, title, subtitle, action, children }: SheetProps) {
  return (
    // As barras do sistema: sem `*Translucent` o Android reservaria o espaço delas e a folha não encostaria no fim da tela.
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      <Conteudo onClose={onClose} title={title} subtitle={subtitle} action={action}>{children}</Conteudo>
    </Modal>
  );
}

/** Montado só com a folha aberta: cada abertura começa a animação do zero. */
function Conteudo({ onClose, title, subtitle, action, children }: Omit<SheetProps, 'visible'>) {
  const reduzir = useMovimentoReduzido();
  const { height: alturaDaTela } = useWindowDimensions();
  const { top, bottom } = useSafeAreaInsets();
  const teclado = useAlturaDoTeclado();
  const [alturaDaFolha, setAlturaDaFolha] = useState(0);
  const veu = useRef(new Animated.Value(0)).current;
  const subida = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (reduzir === undefined || alturaDaFolha === 0) return;
    if (reduzir) {
      veu.setValue(1);
      subida.setValue(0);
      return;
    }
    const animacao = Animated.parallel([
      Animated.timing(veu, { toValue: 1, duration: motion.duration.scrim, easing: CURVA_DO_VEU, useNativeDriver: comDriverNativo() }),
      Animated.timing(subida, { toValue: 0, duration: motion.duration.sheet, easing: CURVA_DA_FOLHA, useNativeDriver: comDriverNativo() }),
    ]);
    animacao.start();
    return () => animacao.stop();
  }, [reduzir, alturaDaFolha, veu, subida]);

  // A folha só aparece depois de medida (senão piscaria no lugar final antes de subir)
  const medida = alturaDaFolha > 0 && reduzir !== undefined;
  // Com o teclado aberto o espaço é o que sobra acima dele, abaixo da barra de status (com um respiro)
  const limiteDaTela = alturaDaTela * layout.sheetMaxHeight;
  const alturaMaxima = teclado > 0 ? Math.max(0, Math.min(limiteDaTela, alturaDaTela - teclado - top - space.md)) : limiteDaTela;

  return (
    <View testID="sheet-raiz" style={[styles.raiz, { paddingBottom: teclado }]}>
      <Animated.View testID="sheet-veu" style={[StyleSheet.absoluteFill, styles.veu, { opacity: veu }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel="Fechar" />
      </Animated.View>
      <Animated.View
        testID="sheet-folha"
        role="dialog"
        aria-modal
        aria-label={title}
        accessibilityViewIsModal
        onAccessibilityEscape={onClose}
        onLayout={(e) => setAlturaDaFolha(e.nativeEvent.layout.height)}
        style={[
          styles.folha,
          { maxHeight: alturaMaxima, opacity: medida ? 1 : 0, transform: [{ translateY: subida.interpolate({ inputRange: [0, 1], outputRange: [0, alturaDaFolha || alturaDaTela] }) }] },
        ]}
      >
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          // com o teclado aberto ele cobre a barra do sistema: só o espaço do padrão
          contentContainerStyle={[styles.conteudo, { paddingBottom: teclado > 0 ? size.sheet.paddingBottom : Math.max(size.sheet.paddingBottom, bottom) }]}
        >
          <View style={styles.alca} />
          <Text accessibilityRole="header" style={styles.titulo}>{title}</Text>
          {subtitle ? <Text style={styles.subtitulo}>{subtitle}</Text> : null}
          {children}
        </ScrollView>
        {action ? <View style={styles.acao}>{action}</View> : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  // o Modal da web sai da coluna do app: a folha ganha a largura da coluna, centralizada
  raiz: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  veu: { backgroundColor: colors.overlay },
  folha: {
    width: '100%',
    maxWidth: layout.columnMax,
    backgroundColor: colors.bg.card,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    boxShadow: shadow.sheet,
    overflow: 'hidden',
  },
  conteudo: { paddingTop: size.sheet.paddingTop, paddingHorizontal: size.sheet.paddingHorizontal },
  alca: { alignSelf: 'center', width: size.sheet.handleWidth, height: size.sheet.handleHeight, marginBottom: size.sheet.handleGap, borderRadius: radius.pill, backgroundColor: colors.tab.indicator },
  titulo: { ...textStyles.sheetTitle, color: colors.text.primary },
  subtitulo: { ...textStyles.micro, color: colors.text.secondary, marginTop: space.xs },
  acao: { position: 'absolute', top: size.sheet.actionTop, right: size.sheet.actionRight },
});
