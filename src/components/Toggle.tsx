import { Switch } from 'react-native';
import { colors } from '../design/tokens';

interface ToggleProps {
  value: boolean;
  onValueChange: (valor: boolean) => void;
  disabled?: boolean;
  accessibilityLabel: string;
}

/** Interruptor com as cores da marca (docs/DESIGN_SYSTEM.md, seção 10). Sempre com rótulo para o leitor de tela. */
export function Toggle({ value, onValueChange, disabled = false, accessibilityLabel }: ToggleProps) {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      trackColor={{ false: colors.control.off, true: colors.control.on }}
      thumbColor={colors.control.thumb}
      ios_backgroundColor={colors.control.off}
    />
  );
}
