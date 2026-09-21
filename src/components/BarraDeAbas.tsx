import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAB_ICON } from '../design/icons';
import { anelDeFoco, type EstadoDeToque } from '../design/foco';
import { colors, fontFamily, iconStroke, opacity, radius, shadow, size, textStyles } from '../design/tokens';
import { Icon, type IconeNome } from './Icon';

import { Toque } from './Toque';
/** As quatro abas, na ordem da barra. `rota` é o nome do arquivo em `app/(app)`. */
export const ABAS: { rota: string; rotulo: string; icone: IconeNome }[] = [
  { rota: 'inicio', rotulo: 'Início', icone: TAB_ICON.inicio },
  { rota: 'index', rotulo: 'Lembretes', icone: TAB_ICON.lembretes },
  { rota: 'mapa', rotulo: 'Mapa', icone: TAB_ICON.mapa },
  { rota: 'config', rotulo: 'Configurações', icone: TAB_ICON.config },
];

/** Telas que não são aba mas pertencem a uma: o formulário de novo lembrete e o de edição ficam sob "Lembretes", como no app web. */
const ABA_DA_TELA: Record<string, string> = { novo: 'index', editar: 'index' };

/** Qual aba fica acesa para a tela em foco; `null` quando a tela não pertence a nenhuma. */
export function abaAtiva(nomeDaRota: string): string | null {
  const aba = ABA_DA_TELA[nomeDaRota] ?? nomeDaRota;
  return ABAS.some((a) => a.rota === aba) ? aba : null;
}

/** Estilo de cada aba por estado. Função pura e exportada: o foco de teclado só existe na web. */
export function estiloDaAba(estado: EstadoDeToque) {
  return [styles.aba, estado.pressed ? { opacity: opacity.tab } : null, estado.focused ? anelDeFoco : null];
}

/**
 * Barra de abas do app (padrão: docs/DESIGN_SYSTEM.md, seção 11.6): fundo claro com sombra para cima, quatro abas iguais
 * com ícone e rótulo. A aba ativa engrossa o traço, escurece o ícone e põe o rótulo em negrito. Toque na aba em que já se
 * está não faz nada. Telas com `tabBarStyle: { display: 'none' }` (a de sucesso) escondem a barra.
 */
export function BarraDeAbas({ state, descriptors, navigation }: BottomTabBarProps) {
  const { bottom } = useSafeAreaInsets();
  const emFoco = state.routes[state.index];
  const estiloDaTela = StyleSheet.flatten(descriptors[emFoco.key]?.options.tabBarStyle) as { display?: string } | undefined;
  if (estiloDaTela?.display === 'none') return null;

  const ativa = abaAtiva(emFoco.name);
  const tocar = (rota: string) => {
    const destino = state.routes.find((r) => r.name === rota);
    if (!destino) return;
    const evento = navigation.emit({ type: 'tabPress', target: destino.key, canPreventDefault: true });
    if (rota !== ativa && !evento.defaultPrevented) navigation.navigate(rota);
  };

  return (
    <View testID="barra-de-abas" accessibilityRole="tablist" style={[styles.barra, { paddingBottom: Math.max(bottom, size.tabBar.bottom) }]}>
      {ABAS.map((aba) => {
        const acesa = aba.rota === ativa;
        return (
          <Toque
            key={aba.rota}
            onPress={() => tocar(aba.rota)}
            accessibilityRole="tab"
            accessibilityLabel={aba.rotulo}
            aria-selected={acesa}
            aria-current={acesa ? 'page' : undefined}
            style={(estado: EstadoDeToque) => estiloDaAba(estado)}
          >
            <Icon name={aba.icone} size={size.tabBar.icon} color={acesa ? colors.tab.activeIcon : colors.tab.inactive} stroke={acesa ? iconStroke.base : iconStroke.tab} />
            <Text style={[styles.rotulo, acesa ? styles.rotuloAtivo : null]}>{aba.rotulo}</Text>
          </Toque>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  barra: { flexDirection: 'row', paddingTop: size.tabBar.top, backgroundColor: colors.tab.background, boxShadow: shadow.tabBar },
  aba: { flex: 1, minHeight: size.tabBar.item, alignItems: 'center', gap: size.tabBar.gap, borderRadius: radius.md },
  rotulo: { ...textStyles.pico, color: colors.tab.inactive },
  rotuloAtivo: { fontFamily: fontFamily.bold, color: colors.text.brand },
});
