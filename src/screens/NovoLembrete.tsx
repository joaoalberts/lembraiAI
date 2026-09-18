import { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, FileText, MapPin as MapPinIcon, RefreshCw, Search } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CtaButton } from '../components/Button';
import { Screen } from '../components/Frame';
import { HomeIndicator } from '../components/HomeIndicator';
import { Icon, MapPin } from '../components/Icon';
import { IconCircle } from '../components/IconCircle';
import { MapPanel } from '../components/MapPanel';
import { OptionCard } from '../components/OptionCard';
import { RepeatSheet } from '../components/RepeatSheet';
import { SelectField } from '../components/SelectField';
import { Slider } from '../components/Slider';
import { TabBar } from '../components/TabBar';
import { TimeSheet } from '../components/TimeSheet';
import { Toggle } from '../components/Toggle';
import { at, box, cx, du } from '../lib/du';
import { formatDate, todayISO } from '../lib/format';
import { useStore, type Draft } from '../state/store';
import s from './NovoLembrete.module.css';

/** Tela 2 — Novo lembrete (ref/2.png), com a barra de menu (ref/5.png). */
export function NovoLembrete() {
  const nav = useNavigate();
  const { create, update } = useStore();
  // "Editar" (tela de sucesso ou "⋯" da lista) abre o formulário já preenchido; `from` = para onde voltar ao salvar
  const init = (useLocation().state as { draft?: Draft; editId?: string; from?: string } | null) ?? {};
  const editing = Boolean(init.editId);
  const d0 = init.draft;
  const [title, setTitle] = useState(d0?.title ?? '');
  const [mode, setMode] = useState<'time' | 'place'>(d0?.kind === 'local' && !d0.hasPlace ? 'place' : 'time');
  const [dateISO, setDateISO] = useState(d0?.dateISO ?? todayISO());   // novo lembrete: sempre abre em hoje
  const [dateLabel, setDateLabel] = useState(d0?.dateLabel ?? formatDate(dateISO));
  const [time, setTime] = useState(d0?.time ?? '09:00');
  const [hasPlace, setHasPlace] = useState(d0?.hasPlace ?? true);
  const [place, setPlace] = useState(d0?.place ?? '');
  const [radius, setRadius] = useState(d0?.radius ?? 150);
  const [repeat, setRepeat] = useState(d0?.repeat ?? 'Nunca');
  const [repeatOpen, setRepeatOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);

  const submit = () => {
    const draft: Draft = { title, kind: mode === 'place' ? 'local' : 'time', dateISO, dateLabel, time, repeat, place, radius, hasPlace };
    if (init.editId) update(init.editId, draft); else create(draft);
    nav(editing && init.from ? init.from : '/sucesso');   // editar pela lista volta para a lista (a tela de sucesso diz "criado")
  };

  return (
    <Screen>
      {/* Cabeçalho e cartões rolam juntos, nas mesmas coordenadas da ref/2.png; o botão e a barra de menu ficam fixos embaixo.
          A altura da área = fim do último cartão (1568 com local, 1040 sem) + o degradê do botão (170) + folga (16). */}
      <div className={s.scroll}>
        <div className={s.canvas} style={{ height: du((hasPlace ? 1568 : 1040) + 186) }}>
          <div className={s.topBg} aria-hidden />

          <button type="button" aria-label="Voltar" className={s.back} onClick={() => nav('/')}>
            <Icon icon={ChevronLeft} size={36} stroke={2.4} />
          </button>
          <h1 className={cx('atc', s.title)} style={at(426, 138)}>{editing ? 'Editar lembrete' : 'Novo lembrete'}</h1>
          <p className={cx('atc', s.subtitle)} style={at(426, 184)}>Na hora certa. No lugar certo.</p>

          {/* Descrição */}
          <section className={s.card} style={box(29, 226, 791, 221)}>
            <IconCircle size={86} bg="var(--mint-100)" style={box(33, 34)}><Icon icon={FileText} size={40} stroke={2} /></IconCircle>
            <label htmlFor="desc" className={cx('at', s.label)} style={at(151, 44)}>Descrição</label>
            <input id="desc" className={s.input} style={box(151, 71, 611, 79)} placeholder="Ex.: Comprar água no mercado"
                   value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} />
            <p className={cx('at', s.helper)} style={at(151, 172)}>Escreva de forma curta e direta.</p>
          </section>

          {/* Modo */}
          <div role="radiogroup" aria-label="Tipo de lembrete">
            <OptionCard style={box(31, 468, 418, 120)} icon={CalendarDays} title="Por data e horário" desc="Lembre em um dia e hora."
                        selected={mode === 'time'} onSelect={() => setMode('time')} />
            <OptionCard style={box(467, 468, 353, 120)} icon={MapPinIcon} title="Por local" desc="Lembre ao chegar."
                        selected={mode === 'place'} onSelect={() => setMode('place')} />
          </div>

          {/* Data / Horário / Repetir */}
          <section className={s.card} style={box(29, 608, 791, 289)}>
            <span className="atc" style={at(53, 45)}><Icon icon={CalendarDays} size={32} stroke={2} /></span>
            <span className={cx('at', s.fieldLabel)} style={at(89, 45)}>Data</span>
            <span className="atc" style={at(502, 45)}><Icon icon={Clock} size={32} stroke={2} /></span>
            <span className={cx('at', s.fieldLabel)} style={at(537, 45)}>Horário</span>

            <SelectField style={box(32, 72, 428, 79)} icon={CalendarDays} value={dateLabel} label="Data do lembrete"
                         inputType="date" inputValue={dateISO} iconX={46} textX={87} chevronX={390}
                         onChange={(v) => { setDateISO(v); setDateLabel(formatDate(v)); }} />
            <SelectField style={box(484, 72, 277, 79)} icon={Clock} value={time} label="Horário do lembrete"
                         iconX={41} textX={82} chevronX={238} onOpen={() => setTimeOpen(true)} />

            <button type="button" className={s.repeat} style={box(30, 171, 730, 95)} aria-haspopup="dialog" onClick={() => setRepeatOpen(true)}>
              <span className="atc" style={at(43, 47.5)}><Icon icon={RefreshCw} size={42} stroke={2} /></span>
              <span className={cx('at', s.repeatTitle)} style={at(88, 32)}>Repetir</span>
              <span className={cx('at', s.repeatValue, repeat !== 'Nunca' && s.repeatOn)} style={at(88, 66)}>{repeat}</span>
              <span className="atc" style={at(700, 48)}><Icon icon={ChevronRight} size={30} stroke={2.4} /></span>
            </button>
          </section>

          {/* Local */}
          <section className={s.card} style={box(29, 916, 791, hasPlace ? 652 : 124)}>
            <IconCircle size={72} bg="var(--mint-100)" style={box(36, 18)}>
              <MapPin style={{ width: du(28), height: du(35), ['--pin-fill' as string]: '#0A0A0A' }} />
            </IconCircle>
            <p className={cx('at', s.labelSm)} style={at(129, 54)}>Local <span className={s.optional}>(opcional)</span></p>
            <div style={box(675, 27)}><Toggle size="lg" checked={hasPlace} onChange={setHasPlace} label="Definir um local (opcional)" /></div>

            {hasPlace && (
              <>
                <label className={s.search} style={box(32, 104, 727, 74)}>
                  <Icon icon={Search} size={32} stroke={2.2} />
                  <input placeholder="Buscar endereço, lugar ou toque no mapa" value={place} onChange={(e) => setPlace(e.target.value)} />
                </label>
                <div style={box(36, 192)}><MapPanel radius={radius} /></div>

                <p className={cx('at', s.labelSm)} style={at(35, 514)}>Raio de notificação</p>
                <p className={cx('atr', s.radius)} style={at(759, 514)}>{radius} m</p>
                <Slider style={box(35, 532)} value={radius} onChange={setRadius} label="Raio de notificação em metros" />
                <p className={cx('at', s.helper, s.helperSm)} style={at(35, 611)}>Você será avisado ao entrar no raio selecionado.</p>
              </>
            )}
          </section>
        </div>
      </div>

      <div className={s.dock}>
        <CtaButton variant="orange" size="form" serif arrow="circle" style={{ position: 'absolute', left: du(29), bottom: du(16) }} onClick={submit}>
          {editing ? 'Salvar alterações' : 'Criar lembrete'}
        </CtaButton>
      </div>

      <TabBar active="lembretes" />
      <HomeIndicator />

      {repeatOpen && <RepeatSheet value={repeat} onSelect={(v) => { setRepeat(v); setRepeatOpen(false); }} onClose={() => setRepeatOpen(false)} />}
      {timeOpen && <TimeSheet value={time} onChange={setTime} onClose={() => setTimeOpen(false)} />}
    </Screen>
  );
}
