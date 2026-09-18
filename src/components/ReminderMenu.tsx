import { Pencil, Trash2 } from 'lucide-react';
import type { Reminder } from '../data/reminders';
import { cx } from '../lib/du';
import { BottomSheet } from './BottomSheet';
import { Icon } from './Icon';
import { IconCircle } from './IconCircle';
import s from './ReminderMenu.module.css';

interface Props { r: Reminder; onEdit: () => void; onDelete: () => void; onClose: () => void }

/** Menu do "⋯" de um lembrete da lista (folha inferior): Editar ou Excluir. */
export function ReminderMenu({ r, onEdit, onDelete, onClose }: Props) {
  return (
    <BottomSheet title={r.title} subtitle={`${r.dateLabel} · ${r.time}`} onClose={onClose}>
      <div className={s.list}>
        <button type="button" className={s.row} onClick={onEdit}>
          <IconCircle size={68} bg="var(--mint-100)"><Icon icon={Pencil} size={32} stroke={2} /></IconCircle>
          Editar
        </button>
        <button type="button" className={cx(s.row, s.danger)} onClick={onDelete}>
          {/* vermelho de erro: [PROPOSTO] no DS §8 (o mesmo do "Excluir lembrete" da tela de sucesso) */}
          <IconCircle size={68} bg="#FBE7E4"><Icon icon={Trash2} size={32} stroke={2} color="#D43A2A" /></IconCircle>
          Excluir
        </button>
      </div>
    </BottomSheet>
  );
}
