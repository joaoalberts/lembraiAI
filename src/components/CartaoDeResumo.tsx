import { Image } from 'expo-image';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { repeatLabel, type Reminder } from '../data/reminders';
import { ICON_NAME } from '../design/icons';
import { borderWidth, colors, fontFamily, iconStroke, radius, shadow, size, textStyles } from '../design/tokens';
import { formatDate } from '../lib/format';
import { Icon, type IconeNome } from './Icon';

// Mapa de mentira, o mesmo para qualquer lugar: é o que o app web mostra (não há mapa de verdade no cartão)
const MINIATURA = require('../../assets/art/thumb-sucesso.jpg');

interface DadoProps {
  icon: IconeNome;
  rotulo: string;
  valor: string;
  style?: StyleProp<ViewStyle>;
}

/** Círculo com o ícone, o nome do dado em cinza e o valor embaixo. */
function Dado({ icon, rotulo, valor, style }: DadoProps) {
  return (
    <View style={[styles.dado, style]}>
      <CirculoDoDado icon={icon} />
      <View>
        <Text style={styles.rotulo}>{rotulo}</Text>
        <Text style={styles.valor}>{valor}</Text>
      </View>
    </View>
  );
}

function CirculoDoDado({ icon }: { icon: IconeNome }) {
  return (
    <View style={styles.circuloDoDado} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Icon name={icon} size={size.sucesso.resumo.dadoIcon} color={colors.icon.default} stroke={iconStroke.base} />
    </View>
  );
}

const Divisor = () => <View style={styles.divisor} />;

/**
 * Resumo do lembrete na tela de sucesso (imagem 09): a categoria, o título e o selo "Ativo", depois Data e Horário, o Local
 * (com raio e miniatura, só nos lembretes por local; sem nome de lugar diz "Local escolhido", como a lista) e a repetição. O horário aparece também no lembrete por local: mostra o
 * que está gravado. O selo só aparece com o lembrete ativo (o original o mostrava sempre, mesmo pausado).
 * Padrão: docs/DESIGN_SYSTEM.md, seção 11.12.
 */
export function CartaoDeResumo({ lembrete }: { lembrete: Reminder }) {
  // O tipo decide, não o nome: o serviço de endereços pode não devolver um nome e o lembrete por local continua tendo ponto e raio (a lista faz igual)
  const comLocal = lembrete.kind === 'local';
  return (
    <View testID="resumo" style={styles.cartao}>
      <View style={styles.cabecalho}>
        <View style={styles.circuloDaCategoria} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Icon name={ICON_NAME[lembrete.icon]} size={size.sucesso.resumo.circleIcon} color={colors.icon.default} stroke={iconStroke.glyph} />
        </View>
        <View style={styles.blocoDoTitulo}>
          <Text accessibilityRole="header" style={styles.titulo}>{lembrete.title}</Text>
        </View>
        {lembrete.active ? (
          <View testID="resumo-selo" style={styles.selo}>
            <View style={styles.ponto} />
            <Text style={styles.textoDoSelo}>Ativo</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.linhaDeDados}>
        <Dado icon="calendar-days" rotulo="Data" valor={formatDate(lembrete.dateISO)} style={styles.colunaDaData} />
        <Dado icon="clock" rotulo="Horário" valor={lembrete.time} style={styles.colunaDoHorario} />
      </View>
      <Divisor />

      {comLocal ? (
        <>
          <View testID="resumo-local" style={styles.linhaDoLocal}>
            <CirculoDoDado icon="map-pin" />
            <View style={styles.textoDoLocal}>
              <Text style={styles.rotulo}>Local</Text>
              <Text numberOfLines={1} style={styles.endereco}>{lembrete.place || 'Local escolhido'}</Text>
              {lembrete.radius ? <Text style={styles.raio}>Raio de {lembrete.radius} metros</Text> : null}
            </View>
            <Image testID="resumo-miniatura" source={MINIATURA} contentFit="cover" accessible={false} style={styles.miniatura} />
          </View>
          <Divisor />
        </>
      ) : null}

      <Dado icon="refresh-cw" rotulo="Repetir" valor={repeatLabel(lembrete.repeat)} />
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    borderRadius: radius.sheet,
    backgroundColor: colors.bg.card,
    boxShadow: shadow.cartaoDoSucesso,
    paddingTop: size.sucesso.resumo.padTop,
    paddingBottom: size.sucesso.resumo.padBottom,
    paddingLeft: size.sucesso.resumo.padLeft,
    paddingRight: size.sucesso.resumo.padRight,
  },
  cabecalho: { flexDirection: 'row', alignItems: 'center' },
  circuloDaCategoria: { width: size.sucesso.resumo.circle, height: size.sucesso.resumo.circle, borderRadius: radius.pill, backgroundColor: colors.sucesso.categoria, alignItems: 'center', justifyContent: 'center' },
  blocoDoTitulo: { flex: 1, marginLeft: size.sucesso.resumo.circleGap },
  titulo: { ...textStyles.heading, color: colors.text.primary, maxWidth: size.sucesso.resumo.tituloMax },
  selo: {
    height: size.sucesso.resumo.seloHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: size.sucesso.resumo.seloGap,
    paddingLeft: size.sucesso.resumo.seloLeft,
    paddingRight: size.sucesso.resumo.seloRight,
    borderRadius: radius.pill,
    borderWidth: borderWidth.hairline,
    borderColor: colors.sucesso.seloAnel,
    backgroundColor: colors.feedback.successBg,
  },
  ponto: { width: size.sucesso.resumo.seloDot, height: size.sucesso.resumo.seloDot, borderRadius: radius.pill, backgroundColor: colors.status.active },
  textoDoSelo: { ...textStyles.micro, fontFamily: fontFamily.semibold, color: colors.text.primary },
  linhaDeDados: { flexDirection: 'row', marginTop: size.sucesso.resumo.linhaGap },
  colunaDaData: { width: size.sucesso.resumo.dadoColuna },
  colunaDoHorario: { flex: 1 },
  dado: { flexDirection: 'row', alignItems: 'center', gap: size.sucesso.resumo.dadoGap },
  circuloDoDado: {
    width: size.sucesso.resumo.dado,
    height: size.sucesso.resumo.dado,
    borderRadius: radius.pill,
    borderWidth: borderWidth.hairline,
    borderColor: colors.sucesso.dadoAnel,
    backgroundColor: colors.sucesso.dado,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rotulo: { ...textStyles.micro, color: colors.text.placeholder },
  valor: { ...textStyles.caption, fontFamily: fontFamily.medium, color: colors.text.primary },
  divisor: { height: size.sucesso.resumo.divisor, marginTop: size.sucesso.resumo.divisorAntes, marginBottom: size.sucesso.resumo.divisorDepois, backgroundColor: colors.border.divider },
  linhaDoLocal: { flexDirection: 'row', alignItems: 'center', gap: size.sucesso.resumo.dadoGap },
  textoDoLocal: { flex: 1 },
  endereco: { ...textStyles.micro, fontFamily: fontFamily.medium, color: colors.text.primary },
  raio: { ...textStyles.micro, color: colors.text.secondary },
  miniatura: { width: size.sucesso.resumo.thumbWidth, height: size.sucesso.resumo.thumbHeight, borderRadius: size.sucesso.resumo.thumbRadius },
});
