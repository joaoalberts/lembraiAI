import { Bell, Clock, MapPin, Zap, type LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppBrand } from '../components/AppBrand';
import { CtaButton, GlassButton, SkipLabel } from '../components/Button';
import { Screen } from '../components/Frame';
import { Icon, LockIcon } from '../components/Icon';
import { at, box, cx } from '../lib/du';
import s from './Onboarding.module.css';

const FEATURES: { x: number; icon: LucideIcon; title: string; desc: string }[] = [
  { x: 152, icon: Clock, title: 'Por horário', desc: 'Nunca mais\nesqueça' },
  { x: 426, icon: MapPin, title: 'Por localização', desc: 'Lembre ao chegar\nno local' },
  { x: 702, icon: Zap, title: 'O que acontecer\nprimeiro', desc: 'Mais praticidade\nno seu dia' },
];

/** Tela 1 — Onboarding (ref/1.png). Fundo = arte fotográfica (bg-onboarding.jpg); todo o resto é código. */
export function Onboarding() {
  const nav = useNavigate();
  return (
    <Screen>
      <img className={s.bg} src="/assets/bg-onboarding.jpg" alt="" />

      <AppBrand variant="onboarding" className={s.brand} />
      <GlassButton shape="pill" label="Pular" style={box(651, 103, 153, 75)} onClick={() => nav('/lembretes')}>
        <SkipLabel>Pular</SkipLabel>
      </GlassButton>

      <div className={cx(s.float, s.left)}><Icon icon={Bell} size={36} stroke={2} fill="#fff" /><span>Na hora certa</span></div>
      <div className={cx(s.float, s.right)}><Icon icon={MapPin} size={36} stroke={2.2} /><span>No lugar certo</span></div>

      <h1 className={s.headline}><span>Lembre</span><span className={s.accent}>de viver.</span></h1>
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
