import { BottomSheet } from './BottomSheet';
import s from './ConfirmSheet.module.css';

interface Props { title: string; message: string; confirmLabel: string; onConfirm: () => void; onClose: () => void }

/** Confirmação de ação destrutiva em folha inferior: a ação vem primeiro, "Cancelar" logo abaixo. */
export function ConfirmSheet({ title, message, confirmLabel, onConfirm, onClose }: Props) {
  return (
    <BottomSheet title={title} subtitle={message} onClose={onClose}>
      <div className={s.actions}>
        <button type="button" className={s.danger} onClick={onConfirm}>{confirmLabel}</button>
        <button type="button" className={s.cancel} onClick={onClose}>Cancelar</button>
      </div>
    </BottomSheet>
  );
}
