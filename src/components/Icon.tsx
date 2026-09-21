import type { ComponentType } from 'react';
import { View } from 'react-native';
import type { LucideProps } from 'lucide-react-native';
import ArrowRight from 'lucide-react-native/icons/arrow-right';
import Bell from 'lucide-react-native/icons/bell';
import Briefcase from 'lucide-react-native/icons/briefcase';
import CalendarDays from 'lucide-react-native/icons/calendar-days';
import Check from 'lucide-react-native/icons/check';
import ChevronDown from 'lucide-react-native/icons/chevron-down';
import ChevronLeft from 'lucide-react-native/icons/chevron-left';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import CircleCheck from 'lucide-react-native/icons/circle-check';
import Clock from 'lucide-react-native/icons/clock';
import CreditCard from 'lucide-react-native/icons/credit-card';
import Download from 'lucide-react-native/icons/download';
import Dumbbell from 'lucide-react-native/icons/dumbbell';
import Ellipsis from 'lucide-react-native/icons/ellipsis';
import Eye from 'lucide-react-native/icons/eye';
import EyeOff from 'lucide-react-native/icons/eye-off';
import FileText from 'lucide-react-native/icons/file-text';
import House from 'lucide-react-native/icons/house';
import Info from 'lucide-react-native/icons/info';
import KeyRound from 'lucide-react-native/icons/key-round';
import Lightbulb from 'lucide-react-native/icons/lightbulb';
import List from 'lucide-react-native/icons/list';
import LoaderCircle from 'lucide-react-native/icons/loader-circle';
import LocateFixed from 'lucide-react-native/icons/locate-fixed';
import Lock from 'lucide-react-native/icons/lock';
import LogOut from 'lucide-react-native/icons/log-out';
import Mail from 'lucide-react-native/icons/mail';
import MailCheck from 'lucide-react-native/icons/mail-check';
import MapPin from 'lucide-react-native/icons/map-pin';
import Minus from 'lucide-react-native/icons/minus';
import Navigation from 'lucide-react-native/icons/navigation';
import Pencil from 'lucide-react-native/icons/pencil';
import Pill from 'lucide-react-native/icons/pill';
import Plane from 'lucide-react-native/icons/plane';
import Plus from 'lucide-react-native/icons/plus';
import RefreshCw from 'lucide-react-native/icons/refresh-cw';
import Search from 'lucide-react-native/icons/search';
import Settings from 'lucide-react-native/icons/settings';
import Share from 'lucide-react-native/icons/share';
import ShoppingCart from 'lucide-react-native/icons/shopping-cart';
import Trash from 'lucide-react-native/icons/trash';
import TriangleAlert from 'lucide-react-native/icons/triangle-alert';
import UserRound from 'lucide-react-native/icons/user-round';
import Users from 'lucide-react-native/icons/users';
import X from 'lucide-react-native/icons/x';
import Zap from 'lucide-react-native/icons/zap';
import { colors, iconStroke, size } from '../design/tokens';

/**
 * Registro dos ícones em uso (cada um por caminho próprio, para o pacote inteiro, com quase 4 mil ícones, não entrar no
 * app). Ícone novo: importe aqui e cite o nome onde usar. O teste `icones.test.ts` confere o registro contra o pacote.
 */
export const ICONES = {
  'arrow-right': ArrowRight,
  bell: Bell,
  briefcase: Briefcase,
  'calendar-days': CalendarDays,
  check: Check,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'circle-check': CircleCheck,
  clock: Clock,
  'credit-card': CreditCard,
  download: Download,
  dumbbell: Dumbbell,
  ellipsis: Ellipsis,
  eye: Eye,
  'eye-off': EyeOff,
  'file-text': FileText,
  house: House,
  info: Info,
  'key-round': KeyRound,
  lightbulb: Lightbulb,
  list: List,
  'loader-circle': LoaderCircle,
  'locate-fixed': LocateFixed,
  lock: Lock,
  'log-out': LogOut,
  mail: Mail,
  'mail-check': MailCheck,
  'map-pin': MapPin,
  minus: Minus,
  navigation: Navigation,
  pencil: Pencil,
  pill: Pill,
  plane: Plane,
  plus: Plus,
  'refresh-cw': RefreshCw,
  search: Search,
  settings: Settings,
  share: Share,
  'shopping-cart': ShoppingCart,
  trash: Trash,
  'triangle-alert': TriangleAlert,
  'user-round': UserRound,
  users: Users,
  x: X,
  zap: Zap,
} as const satisfies Record<string, ComponentType<LucideProps>>;

export type IconeNome = keyof typeof ICONES;

interface IconProps {
  name: IconeNome;
  /** Lado do ícone. Padrão: `size.icon.md`. */
  size?: number;
  color?: string;
  /** Espessura do traço no desenho de 24 (`iconStroke.*`). */
  stroke?: number;
  /** Giro em graus (glifos diagonais do Lucide na lista de lembretes). */
  giro?: number;
}

/**
 * Ícone Lucide. Decorativo: fica escondido do leitor de tela (o botão ou o texto ao lado é quem tem o nome).
 * Padrão: docs/DESIGN_SYSTEM.md, seção 8.
 */
export function Icon({ name, size: lado = size.icon.md, color = colors.icon.default, stroke = iconStroke.base, giro }: IconProps) {
  const Glifo = ICONES[name];
  return (
    <View
      testID={`icone-${name}`}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      aria-hidden
      style={giro ? { transform: [{ rotate: `${giro}deg` }] } : undefined}
    >
      <Glifo size={lado} color={color} strokeWidth={stroke} />
    </View>
  );
}
