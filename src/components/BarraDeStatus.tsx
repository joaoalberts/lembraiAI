import { useIsFocused } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

/** Só a tela em foco declara. Fora de um navegador (uma peça solta em teste) não há foco a perguntar: vale como em foco. */
function useEmFoco(): boolean {
  try {
    return useIsFocused();
  } catch {
    return true;
  }
}

/**
 * Cor do texto da barra de status (relógio, bateria e sinal) enquanto a tela está em foco: `escuro` diz que o **fundo** sob a
 * barra é escuro, então o texto é claro. As abas ficam montadas e as declarações de várias `StatusBar` se mesclam pela ordem
 * em que montaram (a última vence), então só a tela em foco declara; ao sair do foco a barra volta ao padrão de baixo
 * (`BarraDeStatusPadrao`, na raiz). Só as telas de fundo escuro declaram (cabeçalho verde, contas, onboarding).
 * Padrão: docs/DESIGN_SYSTEM.md, seção 9.
 */
export function BarraDeStatus({ sobre }: { sobre: 'escuro' | 'claro' }) {
  const emFoco = useEmFoco();
  return emFoco ? <StatusBar style={sobre === 'escuro' ? 'light' : 'dark'} /> : null;
}

/** O padrão do app (fundo claro: texto escuro), declarado uma vez na raiz. */
export function BarraDeStatusPadrao() {
  return <StatusBar style="dark" />;
}
