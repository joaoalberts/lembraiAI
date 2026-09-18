import { Bell, Dumbbell, MapPin, Pill, Plane, ShoppingCart, Users, type LucideIcon } from 'lucide-react';
import type { IconKey } from '../data/reminders';

/** Rotação (graus) para o glifo ficar como na referência. */
export const REMINDER_ICON_ROTATION: Partial<Record<IconKey, number>> = { dumbbell: 45, plane: -45 };

export const REMINDER_ICONS: Record<IconKey, LucideIcon> = {
  cart: ShoppingCart, dumbbell: Dumbbell, pill: Pill, users: Users, plane: Plane, pin: MapPin, bell: Bell,
};
