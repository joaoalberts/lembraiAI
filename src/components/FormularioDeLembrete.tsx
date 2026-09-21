import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { REPEAT_OPTIONS, repeatLabel, type Reminder } from '../data/reminders';
import { fundoEmDegrade } from '../design/efeitos';
import { anelDeFoco, type EstadoDeToque } from '../design/foco';
import { colors, fontFamily, gradients, iconStroke, layout, motion, opacity, radius, shadow, size, space, textStyles } from '../design/tokens';
import { formatDate } from '../lib/format';
import { RAIO, TITULO_MAXIMO, estadoInicial, rascunhoDe, validar, type EstadoDoFormulario, type Modo } from '../lib/formulario';
import { nomeDoPonto, type Lugar } from '../lib/geocodificar';
import { useAlturaDoTeclado } from '../lib/teclado';
import { useGeo } from '../state/geo';
import { useReminders } from '../state/reminders';
import { Banner } from './Banner';
import { CabecalhoClaro } from './CabecalhoClaro';
import { CalendarSheet } from './CalendarSheet';
import { ContaSheet } from './ContaSheet';
import { CtaButton } from './CtaButton';
import { FormCard } from './FormCard';
import { FormInput } from './FormInput';
import { PinSolid } from './Glifos';
import { Icon } from './Icon';
import { MapaDeEscolha } from './MapaDeEscolha';
import { OptionCard } from './OptionCard';
import { PlaceSearch } from './PlaceSearch';
import { RepeatSheet } from './RepeatSheet';
import { SelectField } from './SelectField';
import { Slider } from './Slider';
import { TimeSheet } from './TimeSheet';
import { Toggle } from './Toggle';

import { Toque } from './Toque';
/** Espera depois de tocar ou arrastar o pino antes de perguntar ao serviço o nome do lugar. */
const ESPERA_DO_NOME = 700;
const AVISO_DO_RAIO = 'Você será avisado ao entrar no raio selecionado.';
const SEM_LOCALIZACAO = 'Não consegui ler sua localização. Verifique a permissão nos ajustes do aparelho.';

interface FormularioProps {
  /** Com um lembrete o formulário edita esse lembrete; sem, cria um novo. */
  lembrete?: Reminder;
}

/** Voltar: para a tela anterior, ou para a lista se a pessoa entrou direto aqui (link, recarregar a página). */
function voltar() {
  if (router.canGoBack()) router.back();
  else router.navigate('/');
}

/**
 * Formulário de novo lembrete e de edição (imagens `04`, `06` e `15`; padrão: docs/DESIGN_SYSTEM.md, seção 11.11): cabeçalho
 * claro com voltar e conta, a descrição, o modo (por data e horário ou por local), data, horário e repetição, e o local com
 * busca de endereço, mapa e raio. O botão de salvar fica fixo embaixo. Criar leva à tela de sucesso; editar volta de onde veio.
 */
export function FormularioDeLembrete({ lembrete }: FormularioProps) {
  const editando = lembrete !== undefined;
  const { create, update } = useReminders();
  const { position, getCurrentPosition } = useGeo();
  const { top } = useSafeAreaInsets();
  const teclado = useAlturaDoTeclado();
  const rolagem = useRef<ScrollView>(null);
  const yDoLocal = useRef(0);
  const [buscando, setBuscando] = useState(false);
  const [sugestoesAbertas, setSugestoesAbertas] = useState(false);
  const [estado, setEstado] = useState<EstadoDoFormulario>(() => estadoInicial(lembrete));
  const [folha, setFolha] = useState<'data' | 'horario' | 'repetir' | 'conta' | null>(null);
  const [erroDaDescricao, setErroDaDescricao] = useState<string | null>(null);
  const [avisoDoLocal, setAvisoDoLocal] = useState<string | null>(null);
  const [erroAoSalvar, setErroAoSalvar] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [localizando, setLocalizando] = useState(false);
  const [enquadrar, setEnquadrar] = useState(0);
  const nome = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pedidoDoNome = useRef<AbortController | undefined>(undefined);
  useEffect(() => () => { clearTimeout(nome.current); pedidoDoNome.current?.abort(); }, []);

  const mudar = (parte: Partial<EstadoDoFormulario>) => setEstado((e) => ({ ...e, ...parte }));
  const local = estado.modo === 'local';
  const descido = Math.max(size.form.navTop, top + space.sm) - size.form.navTop;

  const escolherModo = (modo: Modo) => { mudar({ modo }); setAvisoDoLocal(null); };

  /** Toque ou arrasto no mapa e "Usar minha localização": o pino vai para o ponto e o nome do lugar vem do serviço, se ele souber. */
  const escolherPonto = (lat: number, lng: number) => {
    mudar({ coord: { lat, lng } });
    setAvisoDoLocal(null);
    clearTimeout(nome.current);
    pedidoDoNome.current?.abort();
    nome.current = setTimeout(async () => {
      const controle = new AbortController();
      pedidoDoNome.current = controle;
      try {
        const achado = await nomeDoPonto(lat, lng, { sinal: controle.signal });
        if (achado && !controle.signal.aborted) mudar({ place: achado });
      } catch {
        // sem nome do serviço, fica o texto que já estava
      }
    }, ESPERA_DO_NOME);
  };

  const escolherLugar = (lugar: Lugar) => {
    clearTimeout(nome.current);
    pedidoDoNome.current?.abort();
    mudar({ place: lugar.nome, coord: { lat: lugar.lat, lng: lugar.lng } });
    setAvisoDoLocal(null);
    setEnquadrar((n) => n + 1);
  };

  const usarMinhaLocalizacao = async () => {
    setLocalizando(true);
    setAvisoDoLocal(null);
    const p = await getCurrentPosition();
    setLocalizando(false);
    if (!p) { setAvisoDoLocal(SEM_LOCALIZACAO); return; }
    escolherPonto(p.lat, p.lng);
    setEnquadrar((n) => n + 1);
  };

  // A lista de sugestões nasce debaixo do campo de busca, justamente onde o teclado fica: com a busca em foco e o teclado aberto
  // o formulário rola até o cartão do Local ficar no alto da área visível (abaixo da barra de status)
  useEffect(() => {
    if (!buscando || teclado === 0) return;
    rolagem.current?.scrollTo({ y: Math.max(0, yDoLocal.current - top - space.md), animated: true });
  }, [buscando, teclado, top]);

  const salvar = async () => {
    const problema = validar(estado);
    setErroDaDescricao(problema?.campo === 'title' ? problema.mensagem : null);
    setAvisoDoLocal(problema?.campo === 'local' ? problema.mensagem : null);
    setErroAoSalvar(null);
    if (problema) return;
    setSalvando(true);
    const rascunho = rascunhoDe(estado);
    const salvo = editando ? await update(lembrete.id, rascunho) : await create(rascunho);
    setSalvando(false);
    if (!salvo) { setErroAoSalvar('Não foi possível salvar o lembrete. Tente de novo.'); return; }
    if (editando) voltar();
    else router.replace({ pathname: '/sucesso', params: { id: salvo.id } });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.tela}>
      <ScrollView ref={rolagem} style={styles.rolagem} contentContainerStyle={[styles.conteudo, { paddingTop: size.form.navTop + descido }]} keyboardShouldPersistTaps="handled">
        <CabecalhoClaro extra={descido} />

        <View style={styles.navegacao}>
          <BotaoRedondo icon="chevron-left" label="Voltar" onPress={voltar} />
          <View style={styles.titulos}>
            <Text accessibilityRole="header" style={styles.titulo}>{editando ? 'Editar lembrete' : 'Novo lembrete'}</Text>
            <Text style={styles.subtitulo}>Na hora certa. No lugar certo.</Text>
          </View>
          <BotaoRedondo icon="user-round" label="Minha conta" onPress={() => setFolha('conta')} />
        </View>

        {erroAoSalvar !== null && <Banner variant="error">{erroAoSalvar}</Banner>}

        <FormCard style={styles.cartaoDaDescricao}>
          <View style={styles.circulo} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <Icon name="file-text" size={size.icon.md} color={colors.icon.default} stroke={iconStroke.base} />
          </View>
          <View style={styles.campoDaDescricao}>
            <Text style={styles.rotulo}>Descrição</Text>
            <FormInput
              value={estado.title}
              onChangeText={(title) => { mudar({ title }); if (erroDaDescricao) setErroDaDescricao(null); }}
              placeholder="Ex.: Comprar água no mercado"
              maxLength={TITULO_MAXIMO}
              accessibilityLabel="Descrição"
            />
            {erroDaDescricao !== null ? (
              <Text accessibilityRole="alert" style={[styles.dica, styles.erro]}>{erroDaDescricao}</Text>
            ) : (
              <Text style={styles.dica}>Escreva de forma curta e direta.</Text>
            )}
          </View>
        </FormCard>

        <View accessibilityRole="radiogroup" accessibilityLabel="Tipo de lembrete" style={styles.modos}>
          <OptionCard icon="calendar-days" title="Por data e horário" description="Lembre em um dia e hora." selected={!local} onPress={() => escolherModo('time')} style={styles.modoDeHora} />
          <OptionCard icon="map-pin" title="Por local" description="Lembre ao chegar." selected={local} onPress={() => escolherModo('local')} style={styles.modoDeLocal} />
        </View>

        <FormCard style={styles.cartaoDeQuando}>
          <View style={styles.linha}>
            <View style={styles.coluna}>
              <View style={styles.legenda}>
                <Icon name="calendar-days" size={size.icon.sm} color={colors.icon.default} stroke={iconStroke.base} />
                <Text style={styles.rotulo}>Data</Text>
              </View>
              <SelectField icon="calendar-days" value={formatDate(estado.dateISO)} accessibilityLabel="Data do lembrete" onPress={() => setFolha('data')} />
            </View>
            <View style={[styles.colunaCurta, local ? styles.esmaecido : null]}>
              <View style={styles.legenda}>
                <Icon name="clock" size={size.icon.sm} color={colors.icon.default} stroke={iconStroke.base} />
                <Text style={styles.rotulo}>Horário</Text>
              </View>
              <SelectField icon="clock" value={estado.time} disabled={local} accessibilityLabel={`Horário do lembrete: ${estado.time}`} onPress={() => setFolha('horario')} />
            </View>
          </View>
          <SelectField
            leading="refresh-cw"
            label="Repetir"
            value={repeatLabel(estado.repeat)}
            highlight={estado.repeat !== 'never'}
            chevron="right"
            accessibilityLabel={`Repetir: ${repeatLabel(estado.repeat)}`}
            onPress={() => setFolha('repetir')}
          />
        </FormCard>

        <FormCard style={styles.cartaoDoLocal} testID="cartao-do-local" onLayout={(e) => { yDoLocal.current = e.nativeEvent.layout.y; }}>
          <View style={styles.cabecalhoDoLocal}>
            <View style={styles.circuloDoLocal} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <PinSolid width={size.icon.sm - space.xs} height={size.icon.md - space.hair} fill={colors.icon.default} />
            </View>
            <Text style={styles.rotuloDoLocal}>
              Local <Text style={styles.opcional}>(opcional)</Text>
            </Text>
            <Toggle variant="form" value={local} onValueChange={(ligado) => escolherModo(ligado ? 'local' : 'time')} accessibilityLabel="Definir um local" />
          </View>

          {local && (
            <View style={styles.local}>
              <PlaceSearch value={estado.place} onChangeText={(place) => mudar({ place })} onPick={escolherLugar} aoFocar={() => setBuscando(true)} aoSair={() => setBuscando(false)} aoMudarSugestoes={setSugestoesAbertas} />
              {/* a lista de sugestões passa por cima do mapa; no Android o toque nela chegava também à WebView e trocava o ponto */}
              <View testID="mapa-do-formulario" style={[styles.mapa, sugestoesAbertas ? styles.semToque : null]}>
                <MapaDeEscolha
                  escolha={estado.coord ? { ...estado.coord, raio: estado.radius } : null}
                  aoEscolher={escolherPonto}
                  enquadrar={enquadrar}
                  aoUsarLocalizacao={() => { void usarMinhaLocalizacao(); }}
                  localizando={localizando}
                />
              </View>
              <View style={styles.raio}>
                <Text style={styles.rotuloDoRaio}>Raio de notificação</Text>
                <Text style={styles.valorDoRaio}>{estado.radius} m</Text>
              </View>
              <Slider value={Math.min(estado.radius, RAIO.max)} onChange={(radius) => mudar({ radius })} min={RAIO.min} max={RAIO.max} step={RAIO.passo} label="Raio de notificação em metros" valueText={`${estado.radius} metros`} />
              {avisoDoLocal !== null ? (
                <Text accessibilityRole="alert" style={[styles.dica, styles.erro]}>{avisoDoLocal}</Text>
              ) : (
                <Text style={styles.dica}>{AVISO_DO_RAIO}</Text>
              )}
            </View>
          )}
        </FormCard>
      </ScrollView>

      {/* base fixa: o conteúdo esmaece por trás do botão, e o toque atravessa a parte vazia */}
      <View style={[styles.base, fundoEmDegrade(gradients.esmaecerParaPagina)]}>
        <CtaButton label={salvando ? 'Salvando…' : editando ? 'Salvar alterações' : 'Criar lembrete'} onPress={() => { void salvar(); }} disabled={salvando} />
      </View>

      <RepeatSheet visible={folha === 'repetir'} value={estado.repeat} onSelect={(repeat) => mudar({ repeat })} onClose={() => setFolha(null)} />
      <TimeSheet visible={folha === 'horario'} value={estado.time} onChange={(time) => mudar({ time })} onClose={() => setFolha(null)} />
      <ContaSheet visible={folha === 'conta'} onClose={() => setFolha(null)} />
      <CalendarSheet visible={folha === 'data'} value={estado.dateISO} onSelect={(dateISO) => mudar({ dateISO })} onClose={() => setFolha(null)} />
    </KeyboardAvoidingView>
  );
}

function BotaoRedondo({ icon, label, onPress }: { icon: 'chevron-left' | 'user-round'; label: string; onPress: () => void }) {
  return (
    <Toque
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={(estado: EstadoDeToque) => [styles.redondo, estado.pressed ? styles.pressionado : null, estado.focused ? anelDeFoco : null]}
    >
      <Icon name={icon} size={size.icon.lg - space.xs} color={colors.icon.default} stroke={iconStroke.action} />
    </Toque>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.bg.page },
  rolagem: { flex: 1 },
  conteudo: { paddingHorizontal: size.form.navSide, paddingBottom: size.form.dock + space.sm, gap: space.md },
  navegacao: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  titulos: { flex: 1, alignItems: 'center', pointerEvents: 'none' },
  titulo: { ...textStyles.heading, fontFamily: fontFamily.serif, color: colors.text.primary },
  subtitulo: { ...textStyles.micro, color: colors.text.secondary },
  redondo: { width: size.form.nav, height: size.form.nav, borderRadius: radius.pill, backgroundColor: colors.bg.field, boxShadow: shadow.float, alignItems: 'center', justifyContent: 'center' },
  pressionado: { transform: [{ scale: motion.pressedScale }] },
  cartaoDaDescricao: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  circulo: { width: size.form.circle, height: size.form.circle, borderRadius: radius.pill, backgroundColor: colors.bg.iconCircle, alignItems: 'center', justifyContent: 'center' },
  campoDaDescricao: { flex: 1, gap: space.xs },
  rotulo: { ...textStyles.mini, fontFamily: fontFamily.bold, color: colors.text.primary }, // 22-23 du (11 dp)
  dica: { ...textStyles.pico, color: colors.text.secondary }, // 18-20 du (9-10 dp)
  erro: { fontFamily: fontFamily.medium, color: colors.text.danger },
  modos: { flexDirection: 'row', gap: space.sm },
  // larguras do original: o cartão da data e horário é mais largo que o do local
  modoDeHora: { flex: layout.modeCardWeight.time },
  modoDeLocal: { flex: layout.modeCardWeight.place },
  cartaoDeQuando: { gap: space.md },
  linha: { flexDirection: 'row', gap: space.sm },
  coluna: { flex: 3, gap: space.sm },
  colunaCurta: { flex: 2, gap: space.sm },
  legenda: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  esmaecido: { opacity: opacity.disabled },
  cartaoDoLocal: { gap: space.md },
  cabecalhoDoLocal: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  circuloDoLocal: { width: size.form.optionCircle - space.xs, height: size.form.optionCircle - space.xs, borderRadius: radius.pill, backgroundColor: colors.bg.iconCircle, alignItems: 'center', justifyContent: 'center' },
  rotuloDoLocal: { ...textStyles.body, fontFamily: fontFamily.bold, color: colors.text.primary, flex: 1 },
  opcional: { fontFamily: fontFamily.regular, color: colors.text.secondary },
  local: { gap: space.md },
  mapa: { height: size.form.map, borderRadius: size.form.mapRadius, overflow: 'hidden', backgroundColor: colors.map.background },
  semToque: { pointerEvents: 'none' },
  raio: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rotuloDoRaio: { ...textStyles.body, fontFamily: fontFamily.bold, color: colors.text.primary },
  valorDoRaio: { ...textStyles.body, fontFamily: fontFamily.bold, color: colors.text.accent },
  base: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: size.form.navSide, paddingTop: space.xl + space.sm, paddingBottom: space.sm, pointerEvents: 'box-none' },
});
