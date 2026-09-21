import { useIsFocused } from 'expo-router';
import { FormularioDeLembrete } from '../../src/components/FormularioDeLembrete';

/**
 * Novo lembrete. As telas das abas continuam montadas depois que a pessoa sai delas (na web ficam por baixo, com o campo
 * ainda no ar); o formulário só existe enquanto a tela está em foco, então cada visita começa em branco e nunca há dois
 * campos "Descrição" na página.
 */
export default function NovoLembreteScreen() {
  return useIsFocused() ? <FormularioDeLembrete /> : null;
}
