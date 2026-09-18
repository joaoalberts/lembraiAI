import { LocateFixed } from 'lucide-react';
import { cx } from '../lib/du';
import { Icon } from './Icon';
import s from './AppBrand.module.css';

/** Tile do app + "Lembrete Geo" + tagline. `onboarding` usa sans bold; `list` usa serif (ref/5.png). */
export function AppBrand({ variant, className }: { variant: 'onboarding' | 'list'; className?: string }) {
  return (
    <div className={cx(s.brand, s[variant], className)}>
      <span className={s.tile}><Icon icon={LocateFixed} size={variant === 'list' ? 44 : 42} stroke={2.2} color="#043525" /></span>
      <span className={s.text}>
        <span className={s.name}>Lembrete Geo</span>
        <span className={s.tag}>Sua rotina, mais leve.</span>
      </span>
    </div>
  );
}
