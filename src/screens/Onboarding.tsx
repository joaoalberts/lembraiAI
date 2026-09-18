import { Fragment, type CSSProperties, type ReactNode } from 'react';
import { Clock, MapPin, Zap, type LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppBrand } from '../components/AppBrand';
import { CtaButton, GlassButton, SkipLabel } from '../components/Button';
import { Screen } from '../components/Frame';
import { BellSolid, Icon, LockIcon, MapPin as PinSolid } from '../components/Icon';
import { at, box, cx, du } from '../lib/du';
import s from './Onboarding.module.css';

const FEATURES: { x: number; icon: LucideIcon; title: string; desc: string }[] = [
  { x: 152, icon: Clock, title: 'Por horário', desc: 'Nunca mais\nesqueça' },
  { x: 426, icon: MapPin, title: 'Por localização', desc: 'Lembre ao chegar\nno local' },
  { x: 702, icon: Zap, title: 'O que acontecer\nprimeiro', desc: 'Mais praticidade\nno seu dia' },
];

/** Ícone e texto de cada chip flutuante: centros (du) e inclinação medidos em ref/1.png. */
const CHIPS: { label: string; rot: number; icon: [number, number]; text: [number, number]; glyph: ReactNode }[] = [
  { label: 'Na hora certa', rot: -9, icon: [134.5, 333], text: [226.5, 318.5],
    glyph: <BellSolid style={{ width: du(31), height: du(33) }} /> },
  { label: 'No lugar certo', rot: 10, icon: [602.5, 464.5], text: [695.5, 480.5],
    glyph: <PinSolid style={{ width: du(24), height: du(30.2), ['--pin-fill' as string]: '#F8F8F8', ['--pin-dot' as string]: '#133225' }} /> },
];

/** Ancora pelo centro e inclina junto com o balão. */
const tilt = ([x, y]: [number, number], deg: number): CSSProperties => at(x, y, { transform: `translate(-50%, -50%) rotate(${deg}deg)` });

/** Tela 1 — Onboarding (ref/1.png). Fundo = arte fotográfica (bg-onboarding.jpg); todo o resto é código. */
export function Onboarding() {
  const nav = useNavigate();
  return (
    <Screen>
      <img className={s.bg} src="/assets/bg-onboarding.jpg" alt="" />

      <AppBrand variant="onboarding" className={s.brand} />
      <GlassButton shape="pill" label="Pular" style={box(651, 103, 153, 75)} onClick={() => nav('/novo')}>
        <SkipLabel>Pular</SkipLabel>
      </GlassButton>

      {/* Chips flutuantes: o balão de vidro é parte da arte de fundo (passa por trás do pino 3D); ícone e texto são código */}
      {CHIPS.map((c) => (
        <Fragment key={c.label}>
          <span className={s.chip} style={tilt(c.icon, c.rot)}>{c.glyph}</span>
          <span className={cx(s.chip, s.chipText)} style={tilt(c.text, c.rot)}>{c.label}</span>
        </Fragment>
      ))}

      <h1 className={s.headline}><span>Lembre</span><span className={s.accent}>de tudo!</span></h1>
      <p className={s.sub}>{'Alertas inteligentes que chegam na hora certa\nou quando você estiver no lugar certo.'}</p>

      {FEATURES.map((f) => (
        <div key={f.title} className={s.feature} style={{ left: `calc(${f.x} * var(--u))` }}>
          <span className={s.box}><Icon icon={f.icon} size={46} stroke={2} /></span>
          <strong className={s.fTitle}>{f.title}</strong>
          <span className={s.fDesc}>{f.desc}</span>
        </div>
      ))}

      <CtaButton variant="orange" size="hero" arrow="inline" style={box(49, 1430)} onClick={() => nav('/novo')}>
        Criar meu primeiro lembrete
      </CtaButton>

      <div className={s.dots} aria-hidden><i className={s.on} /><i /><i /></div>
      <p className={cx('atc', s.privacy)} style={at(436, 1751)}><LockIcon size={30} /><span>Seus lembretes, sua privacidade.</span></p>
    </Screen>
  );
}
