import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View, type ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fundoEmDegrade } from '../design/efeitos';
import { anelDeFocoNoEscuro, type EstadoDeToque } from '../design/foco';
import { borderWidth, colors, fontFamily, fontSize, gradients, iconStroke, lineHeight, motion, radius, shadow, size, textStyles } from '../design/tokens';
import { BarraDeStatus } from './BarraDeStatus';
import { GlassButton } from './GlassButton';
import { Icon } from './Icon';
import { Toque, respiroDoToque } from './Toque';

const CURVAS_DE_NIVEL = require('../../assets/art/topo-contas.webp');
const HORIZONTE = require('../../assets/art/horizonte-contas.webp');

interface RodapeProps {
  /** Com pergunta o rodapé é a barra de vidro com a pastilha de ação; sem ela, só o link. */
  pergunta?: string;
  acao: string;
  onPress: () => void;
}

interface AuthLayoutProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  keyboardShouldPersistTaps?: ScrollViewProps['keyboardShouldPersistTaps'];
  /** Botão redondo de voltar no alto. Sem ele não há botão. */
  voltar?: () => void;
  rodape?: RodapeProps;
}

/**
 * Base das telas de conta (entrar, criar conta, esqueci e redefinir a senha; imagem 02): fundo verde em degradê com as curvas
 * de nível no alto, o botão de voltar, a marca, o cartão creme com o título e o subtítulo, e embaixo a barra de vidro (ou o
 * link de voltar) e a nota do cadeado. Atrás da barra e da nota, o "horizonte": as mesmas curvas de nível viradas e esticadas
 * (`assets/art/horizonte-contas.webp`, gerado por `scripts/arte/gerar-topo.sh`). Padrão: docs/DESIGN_SYSTEM.md, seção 11.15.
 */
export function AuthLayout({ title, subtitle, children, keyboardShouldPersistTaps, voltar, rodape }: AuthLayoutProps) {
  const { top } = useSafeAreaInsets();
  // com barra de status, entalhe ou ilha dinâmica tudo desce o que a barra mais o respiro do alvo de toque passar da distância do botão de voltar
  // (o sistema fica com o toque dentro da barra: sem o respiro a folga de cima do botão se perde e o alvo fica com 44 × 40)
  const descido = Math.max(0, top + respiroDoToque(size.auth.voltar) - size.auth.voltarTop);

  return (
    <View style={styles.tela}>
      {/* fundo verde-escuro sob a barra de status: relógio e bateria em claro */}
      <BarraDeStatus sobre="escuro" />
      <View testID="auth-fundo" style={[StyleSheet.absoluteFill, styles.decoracao, fundoEmDegrade(gradients.contas)]} />
      <View testID="auth-curvas" style={[styles.curvas, styles.decoracao]}>
        <Image source={CURVAS_DE_NIVEL} contentFit="fill" accessible={false} style={StyleSheet.absoluteFill} />
      </View>

      {/* Antes da rolagem na árvore: a ordem do Tab na web segue a da tela (o voltar é o primeiro); o zIndex o mantém por cima dela */}
      {voltar ? (
        <View testID="auth-voltar" style={[styles.voltar, { top: size.auth.voltarTop + descido }]}>
          <GlassButton icon="chevron-left" label="Voltar" tamanho="voltar" onPress={voltar} />
        </View>
      ) : null}

      <ScrollView testID="auth-rolagem" keyboardShouldPersistTaps={keyboardShouldPersistTaps} contentContainerStyle={[styles.conteudo, { paddingTop: size.auth.top + descido }]}>
        {/* as mesmas curvas de nível, viradas e esticadas: o chão que recua até o horizonte. Atrás de tudo (primeiro filho): o cartão, a barra e a nota desenham por cima */}
        <View testID="auth-horizonte" style={[styles.horizonte, styles.decoracao]}>
          <Image source={HORIZONTE} contentFit="fill" accessible={false} style={StyleSheet.absoluteFill} />
        </View>
        <View style={styles.marca} accessible accessibilityLabel="LembreiAi">
          <View testID="auth-marca-tile" style={[styles.tile, fundoEmDegrade(gradients.marcaTile)]}>
            <Icon name="locate-fixed" size={size.auth.marcaIcon} color={colors.brand.glyph} stroke={iconStroke.ui} />
          </View>
          <Text style={styles.nome}>LembreiAi</Text>
        </View>

        <View testID="auth-cartao" style={styles.cartao}>
          {title ? (
            <View>
              <Text accessibilityRole="header" style={styles.titulo}>{title}</Text>
              {subtitle ? <Text style={styles.subtitulo}>{subtitle}</Text> : null}
            </View>
          ) : null}
          <View style={title ? styles.formulario : null}>{children}</View>
        </View>

        <View style={styles.rodape}>
          {rodape?.pergunta ? (
            <View testID="auth-barra" style={styles.barra}>
              <Text style={styles.pergunta}>{rodape.pergunta}</Text>
              <Toque onPress={rodape.onPress} accessibilityRole="button" accessibilityLabel={rodape.acao} style={(estado: EstadoDeToque) => [styles.pilula, estado.pressed ? styles.pressionada : null, estado.focused ? anelDeFocoNoEscuro : null]}>
                <Text style={styles.textoDaPilula}>{rodape.acao}</Text>
              </Toque>
            </View>
          ) : rodape ? (
            <Toque onPress={rodape.onPress} accessibilityRole="button" accessibilityLabel={rodape.acao} style={(estado: EstadoDeToque) => [styles.linkDeVolta, estado.pressed ? styles.pressionada : null, estado.focused ? anelDeFocoNoEscuro : null]}>
              <Text style={styles.textoDoLink}>{rodape.acao}</Text>
            </Toque>
          ) : null}
          <View style={styles.nota}>
            <Icon name="lock" size={size.auth.notaIcon} color={colors.conta.nota} stroke={iconStroke.ui} />
            <Text style={styles.textoDaNota}>Por onde você passa fica no seu aparelho.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.bg.stage },
  // só enfeite: o toque passa direto para o que está por cima
  decoracao: { pointerEvents: 'none' },
  curvas: { position: 'absolute', top: 0, left: 0, right: 0, height: size.auth.curvasAltura },
  conteudo: { flexGrow: 1, paddingHorizontal: size.auth.side, paddingBottom: size.auth.bottom },
  voltar: { position: 'absolute', left: size.auth.side, zIndex: 1 },
  marca: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: size.auth.marcaGap, marginBottom: size.auth.marcaBottom },
  tile: { width: size.auth.marcaTile, height: size.auth.marcaTile, borderRadius: size.auth.marcaRadius, alignItems: 'center', justifyContent: 'center' },
  nome: { fontFamily: fontFamily.serif, fontSize: fontSize.contaMarca, color: colors.text.onDarkWarm },
  cartao: { paddingTop: size.auth.cardTop, paddingHorizontal: size.auth.cardSide, paddingBottom: size.auth.cardBottom, borderRadius: size.auth.cardRadius, backgroundColor: colors.bg.card, boxShadow: shadow.cartaoDeConta },
  titulo: { fontFamily: fontFamily.serif, fontSize: fontSize.contaTitulo, lineHeight: lineHeight.contaTitulo, color: colors.text.primary },
  subtitulo: { ...textStyles.micro, color: colors.text.secondary, marginTop: size.auth.subtituloTop },
  formulario: { marginTop: size.auth.formTop },
  rodape: { flexGrow: 1, justifyContent: 'flex-end', paddingTop: size.auth.rodapeTop },
  // de ponta a ponta (o absoluto ignora o recuo dos lados) e subindo do fim do conteúdo: a faixa só ocupa o meio da altura de 1000 du do original
  horizonte: { position: 'absolute', left: 0, right: 0, bottom: size.auth.horizonteBase, height: size.auth.horizonteAltura },
  barra: {
    minHeight: size.auth.barra,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: size.auth.barraGap,
    paddingLeft: size.auth.barraLeft,
    paddingRight: size.auth.barraRight,
    borderRadius: size.auth.barraRadius,
    borderWidth: borderWidth.hairline,
    borderColor: colors.conta.barraAnel,
    backgroundColor: colors.conta.barra,
  },
  // `flex: 1` e não só `flexShrink`: com a caixa do tamanho justo do texto o Android quebrava a última palavra ("Já tem conta?" saía "Já tem"); o texto fica à esquerda como antes
  pergunta: { ...textStyles.micro, color: colors.conta.pergunta, flex: 1 },
  pilula: { height: size.auth.pilula, justifyContent: 'center', paddingHorizontal: size.auth.pilulaSide, borderRadius: size.auth.pilulaRadius, borderWidth: borderWidth.hairline, borderColor: colors.conta.pilulaAnel, backgroundColor: colors.conta.pilula },
  textoDaPilula: { ...textStyles.micro, fontFamily: fontFamily.bold, color: colors.conta.pilulaTexto },
  linkDeVolta: { alignSelf: 'center', paddingHorizontal: size.auth.linkVolta, paddingVertical: size.auth.linkVolta, borderRadius: radius.md },
  textoDoLink: { ...textStyles.micro, fontFamily: fontFamily.bold, color: colors.conta.link, textAlign: 'center' },
  pressionada: { transform: [{ scale: motion.pressedScale }] },
  nota: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: size.auth.notaGap, marginTop: size.auth.notaTop },
  textoDaNota: { ...textStyles.micro, color: colors.conta.nota },
});
