import { StyleSheet, View } from 'react-native';
import { space } from '../design/tokens';
import { Button } from './Button';
import { Sheet } from './Sheet';

interface ConfirmSheetProps {
  visible: boolean;
  title: string;
  message: string;
  /** Rótulo do botão que confirma (vermelho). */
  confirmLabel: string;
  onConfirm: () => void;
  /** "Cancelar", toque no véu e Esc só fecham. */
  onCancel: () => void;
}

/**
 * Confirmação de uma ação sem volta (excluir lembrete), em folha: título, mensagem, o botão vermelho e "Cancelar" logo
 * abaixo. Substitui o `Alert` do sistema, que muda de cara em cada plataforma. Padrão: docs/DESIGN_SYSTEM.md, seção 11.5.
 */
export function ConfirmSheet({ visible, title, message, confirmLabel, onConfirm, onCancel }: ConfirmSheetProps) {
  return (
    <Sheet visible={visible} onClose={onCancel} title={title} subtitle={message}>
      <View style={styles.acoes}>
        <Button variant="destructive" label={confirmLabel} onPress={onConfirm} />
        <Button variant="frost" label="Cancelar" onPress={onCancel} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  acoes: { gap: space.sm, marginTop: space.lg },
});
