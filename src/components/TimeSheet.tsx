import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { fundoEmDegrade } from '../design/efeitos';
import { anelDeFoco, type EstadoDeToque } from '../design/foco';
import { borderWidth, colors, fontFamily, fontSize, gradients, layout, radius, size, space, textStyles } from '../design/tokens';
import { HORAS, MINUTOS, dividirHorario, doisDigitos, indiceDaRolagem, juntarHorario } from '../lib/horario';
import { Sheet } from './Sheet';

/** Espera depois do último movimento da roda para dar o número por escolhido (como no app web). */
const ESPERA_DO_REPOUSO = 120;
/** Depois de escolher os minutos a folha se fecha sozinha, a menos que a pessoa mexa em algo. */
const FECHA_SOZINHA_EM = 800;
const ALTURA_DA_RODA = size.wheel.item * layout.wheelRows;

interface TimeSheetProps {
  visible: boolean;
  /** "HH:MM" */
  value: string;
  /** A cada número escolhido (hora ou minuto) o campo atrás da folha já mostra o novo horário. */
  onChange: (horario: string) => void;
  onClose: () => void;
}

interface RodaProps {
  numeros: number[];
  inicial: number;
  nome: string;
  unidade: string;
  onEscolher: (indice: number) => void;
  onMexer: () => void;
}

/** Uma coluna que rola de número em número: o do meio é o escolhido, os outros esmaecem para o fundo. */
function Roda({ numeros, inicial, nome, unidade, onEscolher, onMexer }: RodaProps) {
  const rolagem = useRef<ScrollView>(null);
  const espera = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const ultimo = useRef(inicial);
  const [ativo, setAtivo] = useState(inicial);

  // começa parada no número de hoje; os temporizadores pendentes morrem junto com a folha
  useEffect(() => {
    const cedo = setTimeout(() => rolagem.current?.scrollTo({ y: inicial * size.wheel.item, animated: false }), 0);
    return () => { clearTimeout(cedo); clearTimeout(espera.current); };
  }, [inicial]);

  const aoRolar = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    onMexer();
    const i = indiceDaRolagem(e.nativeEvent.contentOffset.y, size.wheel.item, numeros.length);
    setAtivo(i);
    clearTimeout(espera.current);
    espera.current = setTimeout(() => {
      if (i !== ultimo.current) { ultimo.current = i; onEscolher(i); }
    }, ESPERA_DO_REPOUSO);
  };

  const ir = (i: number, animado = true) => rolagem.current?.scrollTo({ y: Math.min(numeros.length - 1, Math.max(0, i)) * size.wheel.item, animated: animado });

  return (
    <View
      style={styles.roda}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={nome}
      accessibilityValue={{ min: 0, max: numeros.length - 1, now: ativo, text: `${doisDigitos(numeros[ativo])} ${unidade}` }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => ir(ativo + (e.nativeEvent.actionName === 'increment' ? 1 : -1))}
    >
      <ScrollView
        ref={rolagem}
        testID={`roda-${nome}`}
        onScroll={aoRolar}
        scrollEventThrottle={16}
        snapToInterval={size.wheel.item}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onTouchStart={onMexer}
        contentContainerStyle={styles.numeros}
      >
        {numeros.map((n, i) => (
          <Pressable key={n} onPress={() => ir(i)} accessible={false} style={(estado: EstadoDeToque) => [styles.item, estado.focused ? anelDeFoco : null]}>
            <Text style={i === ativo ? styles.ativo : styles.numero}>{doisDigitos(n)}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <View testID={`roda-${nome}-esmaecer`} style={[StyleSheet.absoluteFill, styles.passivo, fundoEmDegrade(gradients.rodaDeHorario)]} />
    </View>
  );
}

/**
 * Folha "Horário" (imagem 13): duas rodas, horas e minutos. Cada número escolhido já vai para o campo. Escolher os minutos
 * fecha a folha sozinha depois de um instante, a menos que a pessoa continue mexendo; "Pronto" e o véu fecham a qualquer momento.
 */
export function TimeSheet({ visible, value, onChange, onClose }: TimeSheetProps) {
  const inicial = dividirHorario(value);
  const hora = useRef(inicial.hora);
  const minuto = useRef(inicial.minuto);
  const fecha = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(fecha.current), []);

  const parar = () => clearTimeout(fecha.current);
  const escolherHora = (i: number) => { hora.current = HORAS[i]; onChange(juntarHorario(hora.current, minuto.current)); };
  const escolherMinuto = (i: number) => {
    minuto.current = MINUTOS[i];
    onChange(juntarHorario(hora.current, minuto.current));
    parar();
    fecha.current = setTimeout(onClose, FECHA_SOZINHA_EM);
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Horário"
      subtitle="Role a hora e os minutos. O horário é salvo ao escolher."
      action={
        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Pronto" style={(estado: EstadoDeToque) => [styles.pronto, estado.focused ? anelDeFoco : null]}>
          <Text style={styles.prontoTexto}>Pronto</Text>
        </Pressable>
      }
    >
      <View style={styles.rodas}>
        <View testID="horario-faixa" style={styles.faixa} />
        <Roda numeros={HORAS} inicial={inicial.hora} nome="Hora" unidade="horas" onEscolher={escolherHora} onMexer={parar} />
        <Text style={styles.doisPontos}>:</Text>
        <Roda numeros={MINUTOS} inicial={inicial.minuto} nome="Minutos" unidade="minutos" onEscolher={escolherMinuto} onMexer={parar} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  rodas: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: size.wheel.gap, marginTop: size.wheel.top },
  faixa: {
    position: 'absolute',
    alignSelf: 'center',
    width: size.wheel.band.width,
    maxWidth: '100%',
    height: size.wheel.item,
    borderRadius: size.wheel.band.radius,
    backgroundColor: colors.feedback.successBg,
    borderWidth: borderWidth.hairline,
    borderColor: colors.border.selectedBand,
  },
  roda: { width: size.wheel.width, height: ALTURA_DA_RODA },
  numeros: { paddingVertical: size.wheel.item * Math.floor(layout.wheelRows / 2) },
  item: { height: size.wheel.item, alignItems: 'center', justifyContent: 'center' },
  numero: { fontFamily: fontFamily.semibold, fontSize: fontSize.wheel, color: colors.text.secondary, fontVariant: ['tabular-nums'] },
  ativo: { fontFamily: fontFamily.bold, fontSize: fontSize.wheelOn, color: colors.text.primary, fontVariant: ['tabular-nums'] },
  passivo: { pointerEvents: 'none' },
  doisPontos: { fontFamily: fontFamily.bold, fontSize: fontSize.colon, lineHeight: fontSize.colon, paddingBottom: space.xs, color: colors.text.primary },
  pronto: { paddingHorizontal: space.sm, paddingVertical: space.sm, borderRadius: radius.md },
  prontoTexto: { ...textStyles.body, fontFamily: fontFamily.bold, color: colors.text.accent },
});
