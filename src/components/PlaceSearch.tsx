import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { anelDeFoco, semAnelDoNavegador, type EstadoDeToque } from '../design/foco';
import { colors, fontFamily, iconStroke, radius, shadow, size, space, textStyles } from '../design/tokens';
import type { LatLng } from '../lib/geo';
import { MINIMO_DE_LETRAS, buscarLugares, type Lugar } from '../lib/geocodificar';
import { Icon } from './Icon';

import { Toque } from './Toque';
/** Espera depois da última letra antes de perguntar ao serviço (a política do Nominatim pede uso leve). */
export const ESPERA_DA_BUSCA = 650;
/** Fechar a lista ao sair do campo demora um instante, para o toque numa sugestão chegar antes. */
const ESPERA_PARA_FECHAR = 200;

interface PlaceSearchProps {
  value: string;
  /** Cada letra digitada. Só a digitação da pessoa dispara a busca: preencher o campo por fora (o mapa) não. */
  onChangeText: (texto: string) => void;
  onPick: (lugar: Lugar) => void;
  /** Onde a pessoa está ou olha no mapa: quando o texto não diz a cidade, a busca dá preferência ao que está perto. */
  perto?: LatLng | null;
  /** A pessoa entrou no campo e saiu dele (o formulário rola até aqui com o teclado aberto). */
  aoFocar?: () => void;
  aoSair?: () => void;
  /** A lista de sugestões (ou a mensagem de falha) abriu ou fechou. Ela cobre o mapa que vem logo abaixo: quem usa desliga o toque do mapa enquanto ela está aberta. */
  aoMudarSugestoes?: (abertas: boolean) => void;
  /** Só para os testes. */
  buscar?: typeof buscarLugares;
}

/**
 * Busca de endereço do formulário: campo com lupa e uma lista de até cinco sugestões (rua, número, bairro, cidade, estado, CEP ou
 * nome de lugar, em todo o Brasil; serviços gratuitos e sem chave, ver `lib/geocodificar.ts`). Só busca com 3 letras ou mais, 650 ms
 * depois da última, e cancela o pedido anterior. Sem resultado diz "Nenhum endereço encontrado."; com falha, "Não foi possível
 * buscar agora."; o resultado que não é o ponto exato da porta avisa "Posição aproximada". Padrão: docs/DESIGN_SYSTEM.md, seção 11.11.
 */
export function PlaceSearch({ value, onChangeText, onPick, perto, aoFocar, aoSair, aoMudarSugestoes, buscar = buscarLugares }: PlaceSearchProps) {
  const [itens, setItens] = useState<Lugar[]>([]);
  const [semResultado, setSemResultado] = useState(false);
  const [falhou, setFalhou] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [aberta, setAberta] = useState(false);
  const espera = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const fecha = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pedido = useRef<AbortController | undefined>(undefined);

  useEffect(() => () => { clearTimeout(espera.current); clearTimeout(fecha.current); pedido.current?.abort(); }, []);
  useEffect(() => { aoMudarSugestoes?.(aberta); }, [aberta]); // eslint-disable-line react-hooks/exhaustive-deps

  const zerar = () => { setItens([]); setFalhou(false); setSemResultado(false); setAberta(false); setOcupado(false); };

  const aoDigitar = (texto: string) => {
    onChangeText(texto);
    clearTimeout(espera.current);
    pedido.current?.abort();
    if (texto.trim().length < MINIMO_DE_LETRAS) { zerar(); return; }
    espera.current = setTimeout(async () => {
      const controle = new AbortController();
      pedido.current = controle;
      setOcupado(true);
      try {
        const lugares = await buscar(texto, { sinal: controle.signal, perto: perto ?? null });
        if (controle.signal.aborted) return;
        setItens(lugares);
        setFalhou(false);
        setSemResultado(lugares.length === 0);
        setAberta(true);
      } catch {
        if (controle.signal.aborted) return;
        setItens([]);
        setSemResultado(false);
        setFalhou(true);
        setAberta(true);
      } finally {
        if (!controle.signal.aborted) setOcupado(false);
      }
    }, ESPERA_DA_BUSCA);
  };

  const escolher = (lugar: Lugar) => {
    clearTimeout(fecha.current);
    onPick(lugar);
    zerar();
  };

  return (
    <View style={styles.raiz}>
      <View style={styles.campo}>
        {ocupado ? <ActivityIndicator size="small" color={colors.spinner} /> : <Icon name="search" size={size.icon.sm} color={colors.icon.default} stroke={iconStroke.ui} />}
        <TextInput
          value={value}
          onChangeText={aoDigitar}
          onFocus={() => { clearTimeout(fecha.current); if (itens.length > 0 || falhou || semResultado) setAberta(true); aoFocar?.(); }}
          onBlur={() => { fecha.current = setTimeout(() => setAberta(false), ESPERA_PARA_FECHAR); aoSair?.(); }}
          placeholder="Buscar endereço, lugar ou toque no mapa"
          placeholderTextColor={colors.text.placeholder}
          accessibilityLabel="Endereço do lembrete"
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          style={styles.entrada}
        />
      </View>

      {aberta && (
        <View testID="sugestoes" style={styles.lista}>
          <ScrollView keyboardShouldPersistTaps="handled" style={styles.rolagem}>
            {falhou ? (
              <Text accessibilityRole="alert" style={styles.erro}>Não foi possível buscar agora.</Text>
            ) : semResultado ? (
              <Text accessibilityLiveRegion="polite" style={styles.erro}>Nenhum endereço encontrado. Confira o nome da rua ou toque no mapa.</Text>
            ) : (
              itens.map((lugar) => (
                <Toque
                  key={`${lugar.lat},${lugar.lng}`}
                  onPress={() => escolher(lugar)}
                  accessibilityRole="button"
                  accessibilityLabel={`${lugar.detalhe ? `${lugar.nome}, ${lugar.detalhe}` : lugar.nome}${lugar.aproximado ? ', posição aproximada' : ''}`}
                  style={(estado: EstadoDeToque) => [styles.item, estado.hovered || estado.pressed ? { backgroundColor: colors.control.suggestionHover } : null, estado.focused ? anelDeFoco : null]}
                >
                  <Icon name="map-pin" size={size.icon.sm} color={colors.icon.default} stroke={iconStroke.ui} />
                  <View style={styles.textos}>
                    <Text style={styles.nome}>{lugar.nome}</Text>
                    {lugar.detalhe ? <Text style={styles.detalhe}>{lugar.detalhe}</Text> : null}
                    {lugar.aproximado ? <Text style={styles.aproximado}>Posição aproximada: confira o pino no mapa</Text> : null}
                  </View>
                </Toque>
              ))
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // acima do mapa que vem logo abaixo (o Leaflet empilha as camadas em 400 a 1000)
  raiz: { zIndex: 1100 },
  campo: { height: size.form.field - space.xs, flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingLeft: space.md, borderRadius: radius.field, backgroundColor: colors.bg.field, boxShadow: shadow.field },
  entrada: { ...textStyles.body, flex: 1, minWidth: 0, height: '100%', paddingRight: space.md, color: colors.text.primary, fontFamily: fontFamily.regular, ...semAnelDoNavegador, fontSize: 16 }, // web: iOS Safari auto-zoom com fontSize < 16px
  lista: { position: 'absolute', left: 0, right: 0, top: '100%', marginTop: size.suggestions.gap, padding: size.suggestions.padding, borderRadius: radius.md, backgroundColor: colors.bg.field, boxShadow: shadow.suggestions, maxHeight: size.suggestions.maxHeight },
  rolagem: { maxHeight: size.suggestions.maxHeight },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm, padding: space.sm, borderRadius: radius.sm },
  textos: { flex: 1, gap: space.hair },
  nome: { ...textStyles.micro, fontFamily: fontFamily.bold, color: colors.text.primary },
  detalhe: { ...textStyles.micro, color: colors.text.secondary },
  aproximado: { ...textStyles.micro, fontFamily: fontFamily.bold, color: colors.text.secondary },
  erro: { ...textStyles.micro, padding: space.md, color: colors.text.secondary },
});
