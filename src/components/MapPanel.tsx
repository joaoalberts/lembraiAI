import { useState } from 'react';
import { LocateFixed, Minus, Navigation, Plus } from 'lucide-react';
import { du } from '../lib/du';
import { Icon, MapPin } from './Icon';
import s from './MapPanel.module.css';

/** Mapa do formulário (727×274 du). Imagem recortada de ref/2.png; halo, pino e controles são código. */
export function MapPanel({ radius }: { radius: number }) {
  const [zoom, setZoom] = useState(1);
  const r = (122 * radius) / 150; // halo: raio de 122 du a 150 m (medido em ref/2.png)
  return (
    <div className={s.map}>
      <div className={s.img} style={{ transform: `scale(${zoom})` }} />
      <span className={s.halo} style={{ width: du(r * 2), height: du(r * 2), left: du(365 - r), top: du(138 - r) }} />
      <MapPin className={s.pin} />
      <button type="button" aria-label="Centralizar no mapa" className={s.nav} onClick={() => setZoom(1)}>
        <Icon icon={Navigation} size={30} stroke={2.2} />
      </button>
      <div className={s.zoom}>
        <button type="button" aria-label="Aproximar" onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.25).toFixed(2)))}>
          <Icon icon={Plus} size={32} stroke={2.6} />
        </button>
        <button type="button" aria-label="Afastar" onClick={() => setZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)))}>
          <Icon icon={Minus} size={32} stroke={2.6} />
        </button>
      </div>
      <button type="button" className={s.locate} onClick={() => setZoom(1)}>
        <Icon icon={LocateFixed} size={30} stroke={2.2} /><span>Usar minha localização</span>
      </button>
    </div>
  );
}
