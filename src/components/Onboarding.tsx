import type { ReactNode } from 'react';
import { Image } from 'expo-image';
import { StyleSheet, Text, View, useWindowDimensions, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fundoEmDegrade } from '../design/efeitos';
import { borderWidth, colors, fontFamily, fontSize, gradients, iconStroke, layout, radius, size, space, textStyles } from '../design/tokens';
import { AppBrand } from './AppBrand';
import { Button } from './Button';
import { BellSolid, LockIcon, PinSolid } from './Glifos';
import { GlassPill } from './GlassButton';
import { Icon, type IconeNome } from './Icon';

const FUNDO = require('../../assets/art/bg-onboarding.jpg');
const PINO_3D = require('../../assets/art/hero-pino.png');
const LETREIRO = require('../../assets/art/hero-script.png');

/** A arte de referência tem 851 de largura; as folgas entre os blocos nascem proporcionais a ela (como no app web). */
const LARGURA_DA_ARTE = 851;
/** Cada folga elástica começa com 35% do seu peso em unidades da arte e depois divide a sobra da tela pelo peso. */
const BASE_DA_FOLGA = 0.35;
/** A cena (pino e balões) nunca passa de um terço da altura da tela. */
const FRACAO_MAXIMA_DA_CENA = 0.32;
const PESOS = { topo: 113, cena: 107, titulo: 32, subtitulo: 47, beneficios: 43, botao: 56, paginas: 96, privacidade: 156 } as const;

/** Onde cada peça fica dentro da cena, como fração da largura e da altura dela (medido na captura 01). */
const CENA = {
  pino: { esquerda: 0.1175, largura: 0.69 },
  letreiro: { esquerda: 0.718, topo: 0.067, largura: 0.194 },
  balaoEsquerdo: { centroX: 0.222, centroY: 0.236, giro: '-14deg' },
  balaoDireito: { centroX: 0.795, centroY: 0.496, giro: '14deg' },
} as const;

const BENEFICIOS: { icone: IconeNome; titulo: string; texto: string }[] = [
  { icone: 'clock', titulo: 'Por horário', texto: 'Nunca mais\nesqueça' },
  { icone: 'map-pin', titulo: 'Por localização', texto: 'Lembre ao chegar\nno local' },
  { icone: 'zap', titulo: 'O que acontecer\nprimeiro', texto: 'Mais praticidade\nno seu dia' },
];

interface OnboardingProps {
  onSkip: () => void;
  onStart: () => void;
  /** Sem barra de abas embaixo (visitante): a base respeita a área segura do sistema. */
  standalone?: boolean;
}

interface BalaoProps {
  esquerdo: number;
  topo: number;
  medidas: { width: number; height: number };
  giro: string;
  titulo: string;
  texto: string;
  glifo: ReactNode;
  testID: string;
}

/** Balão de vidro inclinado, como na captura. */
function Balao({ esquerdo, topo, medidas, giro, titulo, texto, glifo, testID }: BalaoProps) {
  return (
    <View testID={testID} style={[styles.balao, { left: esquerdo, top: topo, width: medidas.width, height: medidas.height, transform: [{ rotate: giro }] }]}>
      {glifo}
      <View style={styles.balaoTextos}>
        <Text style={styles.balaoTitulo}>{titulo}</Text>
        <Text style={styles.balaoTexto}>{texto}</Text>
      </View>
    </View>
  );
}

/**
 * Tela de abertura (padrão: docs/DESIGN_SYSTEM.md, seção 11.10): foto de fundo, marca e "Pular", o pino 3D com dois balões
 * de vidro, o título, três benefícios, o botão grande e o pager. Um único fluxo vertical com folgas elásticas: em tela
 * alta os blocos se afastam, em tela baixa a cena encolhe. Serve de aba "Início" (com a barra de abas) e de primeira
 * tela do visitante (`standalone`).
 */
export function Onboarding({ onSkip, onStart, standalone = false }: OnboardingProps) {
  const { width, height } = useWindowDimensions();
  const { top, bottom } = useSafeAreaInsets();
  const coluna = Math.min(width, layout.columnMax);
  const unidade = coluna / LARGURA_DA_ARTE;
  const folga = (peso: number): ViewStyle => ({ flexGrow: peso, flexShrink: 1, flexBasis: peso * BASE_DA_FOLGA * unidade, minHeight: 0 });

  const alturaDaCena = Math.min(coluna * layout.onboardingSceneRatio, height * FRACAO_MAXIMA_DA_CENA);
  const larguraDaCena = alturaDaCena / layout.onboardingSceneRatio;
  const posicao = (centroX: number, centroY: number, medidas: { width: number; height: number }) => ({
    esquerdo: centroX * larguraDaCena - medidas.width / 2,
    topo: centroY * alturaDaCena - medidas.height / 2,
  });

  return (
    <View testID="onboarding" style={styles.tela}>
      <Image source={FUNDO} contentFit="cover" accessible={false} style={StyleSheet.absoluteFill} />
      <View style={[styles.fluxo, { paddingTop: top, paddingBottom: standalone ? bottom : 0 }]}>
        <View style={folga(PESOS.topo)} />
        <View style={styles.topo}>
          <AppBrand variant="onboarding" />
          <GlassPill label="Pular" icon="chevron-right" onPress={onSkip} />
        </View>

        <View style={folga(PESOS.cena)} />
        <View testID="onboarding-cena" style={[styles.cena, { width: larguraDaCena, height: alturaDaCena }]}>
          <Balao
            {...posicao(CENA.balaoEsquerdo.centroX, CENA.balaoEsquerdo.centroY, size.onboarding.balloonLeft)}
            medidas={size.onboarding.balloonLeft}
            giro={CENA.balaoEsquerdo.giro}
            testID="onboarding-balao-esquerdo"
            titulo="Na hora certa"
            texto="Lembra por você"
            glifo={<BellSolid width={size.icon.md} height={size.icon.lg} color={colors.icon.onDarkMint} />}
          />
          <Image
            testID="onboarding-pino"
            source={PINO_3D}
            contentFit="contain"
            contentPosition={{ top: 0, left: 0 }}
            accessible={false}
            style={{ position: 'absolute', top: 0, left: CENA.pino.esquerda * larguraDaCena, width: CENA.pino.largura * larguraDaCena, height: alturaDaCena }}
          />
          <Balao
            {...posicao(CENA.balaoDireito.centroX, CENA.balaoDireito.centroY, size.onboarding.balloonRight)}
            medidas={size.onboarding.balloonRight}
            giro={CENA.balaoDireito.giro}
            testID="onboarding-balao-direito"
            titulo="No lugar certo"
            texto={'Avise quando\nchegar'}
            glifo={<PinSolid width={size.icon.md} height={size.icon.lg} fill={colors.icon.onDarkMint} dot={colors.onboarding.bg} />}
          />
          <Image
            source={LETREIRO}
            contentFit="contain"
            accessible
            accessibilityLabel="Mais liberdade para o seu dia"
            style={{ position: 'absolute', left: CENA.letreiro.esquerda * larguraDaCena, top: CENA.letreiro.topo * alturaDaCena, width: CENA.letreiro.largura * larguraDaCena, aspectRatio: 165 / 118 }}
          />
        </View>

        <View accessible accessibilityRole="header" accessibilityLabel="Lembre de tudo!" style={styles.titulo}>
          <Text style={styles.heroBranco}>Lembre</Text>
          <Text style={[styles.heroBranco, styles.heroAcento]}>de tudo!</Text>
        </View>

        <View style={folga(PESOS.titulo)} />
        <Text style={styles.subtitulo}>{'Alertas inteligentes que chegam na hora certa\nou quando você estiver no lugar certo.'}</Text>

        <View style={folga(PESOS.subtitulo)} />
        <View style={styles.beneficios}>
          {BENEFICIOS.map((b, i) => (
            <View key={b.titulo} style={styles.beneficio}>
              {i > 0 && <View testID="onboarding-divisoria" style={[styles.divisoria, fundoEmDegrade(gradients.divisorVertical)]} />}
              <View style={styles.circulo}>
                <Icon name={b.icone} size={size.onboarding.featureIcon} color={colors.text.onDark} stroke={iconStroke.base} />
              </View>
              <Text style={styles.beneficioTitulo}>{b.titulo}</Text>
              <Text style={styles.beneficioTexto}>{b.texto}</Text>
            </View>
          ))}
        </View>

        <View style={folga(PESOS.beneficios)} />
        <View style={styles.rodape}>
          <Button hero label="Criar meu primeiro lembrete" iconEnd="arrow-right" onPress={onStart} />
        </View>

        <View style={folga(PESOS.botao)} />
        <View style={styles.paginas} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {[colors.onboarding.pagerOn, colors.onboarding.pagerOff, colors.onboarding.pagerOff].map((cor, i) => (
            <View key={i} testID="onboarding-pagina" style={[styles.pagina, { backgroundColor: cor }]} />
          ))}
        </View>

        <View style={folga(PESOS.paginas)} />
        <View style={styles.privacidade}>
          <LockIcon lado={size.icon.sm} color={colors.text.onDarkFaint} hole={colors.onboarding.bg} />
          <Text style={styles.privacidadeTexto}>Seus lembretes, sua privacidade.</Text>
        </View>
        <View style={folga(PESOS.privacidade)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.onboarding.bg },
  fluxo: { flex: 1, alignItems: 'stretch' },
  topo: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: size.onboarding.side },
  cena: { alignSelf: 'center' },
  balao: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radius.lg,
    borderWidth: borderWidth.hairline,
    borderColor: colors.glass.balloonRing,
    backgroundColor: colors.glass.balloon,
  },
  balaoTextos: { flexShrink: 1, flexGrow: 1 },
  balaoTitulo: { ...textStyles.caption, fontFamily: fontFamily.bold, color: colors.text.onDarkWarm },
  balaoTexto: { ...textStyles.micro, color: colors.text.onHeader },
  titulo: { alignItems: 'center' },
  heroBranco: { fontFamily: fontFamily.serif, fontSize: fontSize.hero, lineHeight: fontSize.hero, textAlign: 'center', color: colors.text.onDark },
  heroAcento: { color: colors.text.onDarkAccent },
  subtitulo: { ...textStyles.body, textAlign: 'center', color: colors.text.onHeader, paddingHorizontal: size.onboarding.side },
  beneficios: { flexDirection: 'row', paddingHorizontal: space.md },
  beneficio: { flex: 1, alignItems: 'center', paddingHorizontal: space.xs, gap: space.xs },
  divisoria: { position: 'absolute', left: 0, top: space.lg, bottom: -space.sm, width: borderWidth.hairline },
  circulo: {
    width: size.onboarding.feature,
    height: size.onboarding.feature,
    borderRadius: radius.pill,
    borderWidth: borderWidth.hairline,
    borderColor: colors.glass.featureRing,
    backgroundColor: colors.glass.featureFill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.xs,
  },
  beneficioTitulo: { ...textStyles.micro, fontFamily: fontFamily.bold, textAlign: 'center', color: colors.text.onDark },
  beneficioTexto: { ...textStyles.micro, textAlign: 'center', color: colors.text.onHeader },
  rodape: { paddingHorizontal: size.onboarding.side },
  paginas: { flexDirection: 'row', justifyContent: 'center', gap: size.onboarding.pagerGap },
  pagina: { width: size.onboarding.pagerWidth, height: size.onboarding.pagerHeight, borderRadius: radius.pill },
  privacidade: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm },
  privacidadeTexto: { ...textStyles.micro, color: colors.text.onDarkFaint },
});
