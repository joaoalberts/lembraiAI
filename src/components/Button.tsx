import type { CSSProperties, ReactNode } from 'react';
import { ArrowRight, ChevronRight, type LucideIcon } from 'lucide-react';
import { cx } from '../lib/du';
import { Icon } from './Icon';
import s from './Button.module.css';

type Cta = { variant: 'orange' | 'dark'; size: 'hero' | 'form' | 'compact' | 'success' };

interface CtaProps extends Cta {
  children: ReactNode;
  /** 'inline' = seta logo após o texto · 'circle' = círculo translúcido à direita */
  arrow?: 'inline' | 'circle';
  leading?: LucideIcon;
  serif?: boolean;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
}

/** CTA em pílula (laranja | escuro) com os 4 tamanhos medidos nas referências. */
export function CtaButton({ variant, size, children, arrow, leading, serif, onClick, className, style, disabled }: CtaProps) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} style={style}
            className={cx(s.btn, s[variant], s[size], serif && s.serif, className)}>
      {leading && <Icon icon={leading} size={size === 'compact' ? 27 : 34} stroke={2.4} />}
      <span>{children}</span>
      {arrow === 'inline' && <Icon icon={ArrowRight} size={size === 'hero' ? 34 : 32} stroke={2.2} />}
      {arrow === 'circle' && <span className={s.circle}><Icon icon={ArrowRight} size={36} stroke={2.2} /></span>}
    </button>
  );
}

interface GlassProps {
  children: ReactNode;
  label: string;
  shape?: 'pill' | 'circle';
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
}

/** Botão de vidro sobre fundo escuro (Pular, busca, mais, fechar). */
export function GlassButton({ children, label, shape = 'circle', onClick, className, style }: GlassProps) {
  return (
    <button type="button" aria-label={label} onClick={onClick} style={style}
            className={cx(s.glass, shape === 'pill' ? s.glassPill : s.glassCircle, className)}>
      {children}
    </button>
  );
}

export function SkipLabel({ children }: { children: ReactNode }) {
  return <><span>{children}</span><Icon icon={ChevronRight} size={30} stroke={2.4} /></>;
}

interface ActionProps { icon: LucideIcon; label: string; onClick?: () => void; className?: string; style?: CSSProperties }

/** Botão de ação translúcido do sucesso (Editar, Duplicar, Excluir, Compartilhar). */
export function ActionButton({ icon, label, onClick, className, style }: ActionProps) {
  return (
    <button type="button" onClick={onClick} style={style} className={cx(s.action, className)}>
      <Icon icon={icon} size={40} stroke={2} color="#0E402D" />
      <span>{label}</span>
    </button>
  );
}

/** Botão só-texto ("Criar outro lembrete"). */
export function LinkButton({ children, onClick, className, style }: { children: ReactNode; onClick?: () => void; className?: string; style?: CSSProperties }) {
  return <button type="button" onClick={onClick} style={style} className={cx(s.link, className)}>{children}</button>;
}
