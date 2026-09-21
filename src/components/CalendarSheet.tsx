import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { anelDeFoco, type EstadoDeToque } from '../design/foco';
import { borderWidth, colors, fontFamily, iconStroke, radius, size, space, textStyles } from '../design/tokens';
import { INICIAIS_DA_SEMANA, deslocarMes, gradeDoMes, mesDaData, tituloDoMes } from '../lib/calendario';
import { formatDate, todayISO } from '../lib/format';
import { Icon } from './Icon';
import { Sheet } from './Sheet';

import { Toque } from './Toque';
interface CalendarSheetProps {
  visible: boolean;
  /** "AAAA-MM-DD" */
  value: string;
  /** Escolher um dia aplica e a folha fecha na hora. */
  onSelect: (iso: string) => void;
  onClose: () => void;
}

/** Estilo de cada dia por estado. Função pura e exportada (o ponteiro em cima e o foco só existem na web). */
export function estiloDoDia(estado: EstadoDeToque, escolhido: boolean, hoje: boolean) {
  return [
    styles.dia,
    escolhido ? styles.diaEscolhido : hoje ? styles.diaDeHoje : estado.hovered ? { backgroundColor: colors.control.rowHover } : null,
    estado.pressed && !escolhido ? { backgroundColor: colors.control.rowPressed } : null,
    estado.focused ? anelDeFoco : null,
  ];
}

const maiuscula = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

function Corpo({ value, onSelect, onClose }: Omit<CalendarSheetProps, 'visible'>) {
  const [visto, setVisto] = useState(() => mesDaData(value));
  const grade = useMemo(() => gradeDoMes(visto.ano, visto.mes), [visto]);
  const hoje = todayISO();
  const trocar = (delta: number) => setVisto((v) => deslocarMes(v.ano, v.mes, delta));
  const escolher = (iso: string) => { onSelect(iso); onClose(); };

  return (
    <View style={styles.calendario}>
      <View style={styles.cabecalho}>
        <Toque onPress={() => trocar(-1)} accessibilityRole="button" accessibilityLabel="Mês anterior" style={(e: EstadoDeToque) => [styles.seta, e.focused ? anelDeFoco : null]}>
          <Icon name="chevron-left" size={size.icon.md} color={colors.icon.default} stroke={iconStroke.action} />
        </Toque>
        <Text accessibilityRole="header" style={styles.mes}>{maiuscula(tituloDoMes(visto.ano, visto.mes))}</Text>
        <Toque onPress={() => trocar(1)} accessibilityRole="button" accessibilityLabel="Próximo mês" style={(e: EstadoDeToque) => [styles.seta, e.focused ? anelDeFoco : null]}>
          <Icon name="chevron-right" size={size.icon.md} color={colors.icon.default} stroke={iconStroke.action} />
        </Toque>
      </View>

      <View style={styles.semana} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {INICIAIS_DA_SEMANA.map((inicial, i) => <Text key={i} style={styles.inicial}>{inicial}</Text>)}
      </View>

      {grade.map((semana, s) => (
        <View key={s} style={styles.semana}>
          {semana.map((d) => {
            const escolhido = d.iso === value;
            const eHoje = d.iso === hoje;
            return (
              <View key={d.iso} style={styles.celula}>
                <Toque
                  onPress={() => escolher(d.iso)}
                  accessibilityRole="button"
                  accessibilityLabel={formatDate(d.iso)}
                  aria-selected={escolhido}
                  style={(estado: EstadoDeToque) => estiloDoDia(estado, escolhido, eHoje)}
                >
                  <Text style={[styles.numero, !d.doMes ? styles.foraDoMes : null, escolhido ? styles.numeroEscolhido : null]}>{d.dia}</Text>
                </Toque>
              </View>
            );
          })}
        </View>
      ))}

      <Toque onPress={() => escolher(hoje)} accessibilityRole="button" accessibilityLabel="Ir para hoje" style={(e: EstadoDeToque) => [styles.hoje, e.focused ? anelDeFoco : null]}>
        <Text style={styles.hojeTexto}>Hoje</Text>
      </Toque>
    </View>
  );
}

/**
 * Folha "Data": calendário próprio (o app web usa o popup do navegador, que não existe no celular). Seis semanas de domingo
 * a sábado, com as setas para trocar de mês, o dia escolhido em verde, o de hoje com contorno e o atalho "Hoje".
 */
export function CalendarSheet({ visible, value, onSelect, onClose }: CalendarSheetProps) {
  return (
    <Sheet visible={visible} onClose={onClose} title="Data" subtitle="Escolha o dia do lembrete.">
      <Corpo value={value} onSelect={onSelect} onClose={onClose} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  calendario: { marginTop: size.menu.listTop, gap: space.xs },
  cabecalho: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.xs },
  seta: { width: size.calendar.arrow, height: size.calendar.arrow, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg.field },
  mes: { ...textStyles.heading, fontFamily: fontFamily.serif, color: colors.text.primary },
  semana: { flexDirection: 'row' },
  inicial: { ...textStyles.micro, fontFamily: fontFamily.bold, flex: 1, textAlign: 'center', color: colors.text.secondary },
  celula: { flex: 1, alignItems: 'center' },
  dia: { width: size.calendar.day, height: size.calendar.day, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  diaEscolhido: { width: size.calendar.selected, height: size.calendar.selected, backgroundColor: colors.control.chipOn },
  diaDeHoje: { borderWidth: borderWidth.hairline, borderColor: colors.control.chipOn },
  numero: { ...textStyles.body, color: colors.text.primary },
  foraDoMes: { color: colors.text.placeholder },
  numeroEscolhido: { fontFamily: fontFamily.bold, color: colors.text.onDark },
  hoje: { alignSelf: 'center', paddingHorizontal: space.lg, paddingVertical: space.sm, borderRadius: radius.md, marginTop: space.xs },
  hojeTexto: { ...textStyles.body, fontFamily: fontFamily.bold, color: colors.text.accent },
});
