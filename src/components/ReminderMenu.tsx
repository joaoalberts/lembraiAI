import { StyleSheet, View } from 'react-native';
import type { Reminder } from '../data/reminders';
import { UI_ICON } from '../design/icons';
import { legendaDoLembrete } from '../lib/lista';
import { LinhaDeMenu, estiloDaListaDeLinhas } from './LinhaDeMenu';
import { Sheet } from './Sheet';

export { estiloDaLinha } from './LinhaDeMenu';

interface ReminderMenuProps {
  /** O lembrete do menu aberto; `null` = fechado. */
  reminder: Reminder | null;
  onClose: () => void;
  /** Sem esta ação a linha Editar não aparece. */
  onEdit?: () => void;
  onDelete: () => void;
}

/**
 * Menu do lembrete (as reticências do cartão): uma folha com o título e a data e hora do lembrete, e as linhas Editar e
 * Excluir. Padrão: docs/DESIGN_SYSTEM.md, seção 11.5.
 */
export function ReminderMenu({ reminder, onClose, onEdit, onDelete }: ReminderMenuProps) {
  return (
    <Sheet visible={reminder !== null} onClose={onClose} title={reminder?.title ?? ''} subtitle={reminder ? legendaDoLembrete(reminder) : undefined}>
      <View style={styles.lista}>
        {onEdit ? <LinhaDeMenu icon="pencil" label="Editar" primeira onPress={onEdit} /> : null}
        <LinhaDeMenu icon={UI_ICON.excluir} label="Excluir" perigo primeira={!onEdit} onPress={onDelete} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  lista: estiloDaListaDeLinhas,
});
