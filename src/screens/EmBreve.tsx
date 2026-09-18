import { MapPin, Settings, type LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppBrand } from '../components/AppBrand';
import { CtaButton } from '../components/Button';
import { Screen } from '../components/Frame';
import { HomeIndicator } from '../components/HomeIndicator';
import { Icon } from '../components/Icon';
import { IconCircle } from '../components/IconCircle';
import { ListHeaderBg } from '../components/ListHeaderBg';
import { TabBar, type TabKey } from '../components/TabBar';
import { at, cx } from '../lib/du';
import l from './Lembretes.module.css';   // cabeçalho verde e "folha" da lista (mesmo padrão visual)
import s from './EmBreve.module.css';

interface Props { tab: TabKey; icon: LucideIcon; title: string; subtitle: string; text: string }

/** Tela provisória das abas que ainda não têm referência: cabeçalho da lista + aviso "Em breve" + barra de menu. */
function EmBreve({ tab, icon, title, subtitle, text }: Props) {
  const nav = useNavigate();
  return (
    <Screen>
      <ListHeaderBg />
      <AppBrand variant="list" className={l.brand} />
      <h1 className={cx('at', l.title)} style={at(40, 212)}>{title}</h1>
      <p className={cx('at', l.subtitle)} style={at(40, 262)}>{subtitle}</p>
      <div className={l.sheet} />

      <section className={s.notice}>
        <IconCircle size={150} bg="var(--mint-100)"><Icon icon={icon} size={64} stroke={1.9} /></IconCircle>
        <h2>Em breve</h2>
        <p>{text}</p>
        <CtaButton variant="dark" size="compact" onClick={() => nav('/lembretes')}>Ver meus lembretes</CtaButton>
      </section>

      <TabBar active={tab} />
      <HomeIndicator />
    </Screen>
  );
}

export const Mapa = () => (
  <EmBreve tab="mapa" icon={MapPin} title="Mapa" subtitle="Seus lembretes por local, num só lugar."
           text="Estamos preparando o mapa com todos os lugares dos seus lembretes." />
);

export const Configuracoes = () => (
  <EmBreve tab="config" icon={Settings} title="Configurações" subtitle="Ajustes do aplicativo."
           text="As configurações do aplicativo chegam em uma próxima versão." />
);
