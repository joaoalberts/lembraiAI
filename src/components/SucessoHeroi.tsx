import { forwardRef, useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Polygon, RadialGradient, Rect, Stop, type PathProps } from 'react-native-svg';
import { fundoEmDegrade } from '../design/efeitos';
import { CURVAS, ESTRELA, FAISCAS, HEROI, separarCor, type Curva, type Janela } from '../design/heroi';
import { radius } from '../design/tokens';
import { useMovimentoReduzido } from '../lib/movimento';

/**
 * O `Animated` acrescenta `collapsable={false}` a todo componente animado. A `View` da web sabe ignorá-la, mas o `Path` do SVG
 * a repassa ao `<path>` do DOM e o React reclama no console ("non-boolean attribute `collapsable`"): aqui ela é descartada.
 */
const CaminhoSemColapso = forwardRef<Path, PathProps & { collapsable?: boolean }>(function CaminhoSemColapso({ collapsable: _ignorada, ...props }, ref) {
  return <Path ref={ref} {...props} />;
});
const CaminhoAnimado = Animated.createAnimatedComponent(CaminhoSemColapso);

/** A web não tem o driver nativo do `Animated`. Lido a cada uso (e não uma vez ao carregar) para o teste poder trocar. */
const comDriverNativo = () => Platform.OS !== 'web';
const bezier = ([x1, y1, x2, y2]: Curva) => Easing.bezier(x1, y1, x2, y2);

/** Camada circular presa ao centro do herói: `left: 0; top: 0` e margens negativas, como no original. */
const centrada = (lado: number): ViewStyle => ({ position: 'absolute', left: 0, top: 0, width: lado, height: lado, marginLeft: -lado / 2, marginTop: -lado / 2 });

interface Parada {
  posicao: number;
  cor: string;
}

/** Quadrado com degradê radial (objectBoundingBox: `cx`, `cy` e `r` são frações do lado). */
function DegradeRadial({ id, lado, cx, cy, r, paradas }: { id: string; lado: number; cx: number; cy: number; r: number; paradas: readonly Parada[] }) {
  return (
    <Svg width={lado} height={lado}>
      <Defs>
        <RadialGradient id={id} cx={cx} cy={cy} r={r} fx={cx} fy={cy}>
          {paradas.map((p) => {
            const { cor, alfa } = separarCor(p.cor);
            return <Stop key={p.posicao} offset={p.posicao} stopColor={cor} stopOpacity={alfa} />;
          })}
        </RadialGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}

/**
 * O selo verde com o visto e todo o brilho em volta, animado uma vez na chegada (imagem 09; padrão: docs/DESIGN_SYSTEM.md,
 * seção 11.12). Tudo deriva de uma linha do tempo só, `t`, em segundos: cada camada olha a sua janela (`design/heroi.ts`).
 * É decorativo (o título logo abaixo diz a mesma coisa) e não recebe toque. Com "reduzir movimento" fica o quadro final:
 * sem ondas, faíscas nem brilho que passa, com o visto inteiro e os dois pontos parados. Enquanto o sistema não responde
 * se a pessoa pediu isso, não desenha nada, para não começar uma animação que ela pediu para não ver.
 */
/** Quanto o brilho passa do selo em cima e embaixo, em %: a faixa tem `altura` vezes a altura do selo, centralizada nele. */
export const folgaDoBrilho = (altura: number): `${number}%` => `${Math.round(-((altura - 1) / 2) * 1000) / 10}%`;

export function SucessoHeroi() {
  const reduzir = useMovimentoReduzido();
  if (reduzir === undefined) return null;
  // trocar a preferência com a tela aberta remonta: recomeça animado, ou vai direto ao quadro final
  return <Heroi key={reduzir ? 'quieto' : 'animado'} animar={!reduzir} />;
}

function Heroi({ animar }: { animar: boolean }) {
  const t = useRef(new Animated.Value(animar ? 0 : HEROI.duracao)).current;
  const visto = useRef(new Animated.Value(animar ? 0 : 1)).current;
  const pulsos = useRef(HEROI.cintilacao.pontos.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    if (!animar) return undefined;
    const nativo = comDriverNativo();
    const c = HEROI.cintilacao;
    const [inicioDoVisto, fimDoVisto] = HEROI.selo.visto.janela;
    const animacoes = [
      Animated.timing(t, { toValue: HEROI.duracao, duration: HEROI.duracao * 1000, easing: Easing.linear, useNativeDriver: nativo }),
      // o traço do visto (`strokeDashoffset`) não roda no driver nativo
      Animated.timing(visto, { toValue: 1, delay: inicioDoVisto * 1000, duration: (fimDoVisto - inicioDoVisto) * 1000, easing: bezier(HEROI.selo.visto.curva), useNativeDriver: false }),
      ...pulsos.map((pulso, i) =>
        Animated.sequence([
          Animated.delay(c.pontos[i].comecaEm * 1000),
          Animated.loop(
            Animated.sequence([
              Animated.timing(pulso, { toValue: 0, duration: (c.ciclo / 2) * 1000, easing: bezier(CURVAS.easeInOut), useNativeDriver: nativo }),
              Animated.timing(pulso, { toValue: 1, duration: (c.ciclo / 2) * 1000, easing: bezier(CURVAS.easeInOut), useNativeDriver: nativo }),
            ]),
          ),
        ]),
      ),
    ];
    animacoes.forEach((a) => a.start());
    return () => animacoes.forEach((a) => a.stop());
  }, [animar, t, visto, pulsos]);

  /** Valor de uma propriedade numa janela da linha do tempo: antes dela fica em `de`, depois em `ate` (o `both` do CSS). */
  const faixa = (janela: Janela, de: number, ate: number, curva: Curva) =>
    t.interpolate({ inputRange: [janela[0], janela[1]], outputRange: [de, ate], easing: bezier(curva), extrapolate: 'clamp' });

  const { brilho, anel, disco, onda, selo, faisca, cintilacao } = HEROI;
  const entrada = selo.entrada;
  const larguraDoBrilho = selo.tamanho * selo.brilho.largura;
  const desenhoDoVisto = visto.interpolate({ inputRange: [0, 1], outputRange: [selo.visto.comprimento, 0] });
  const sombraDoVisto = separarCor(selo.visto.sombra.cor);
  const seloFundo = selo.degradeDeFundo;
  const seloSombra = selo.degradeDeSombra;
  const seloLuz = selo.degradeDeLuz;

  return (
    <View testID="heroi" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" aria-hidden style={styles.raiz}>
      <Animated.View testID="heroi-brilho" style={[centrada(brilho.tamanho), { opacity: faixa(brilho.janela, 0, 1, brilho.curva), transform: [{ scale: faixa(brilho.janela, brilho.escalaInicial, 1, brilho.curva) }] }]}>
        <DegradeRadial id="heroi-brilho-degrade" lado={brilho.tamanho} cx={0.5} cy={0.5} r={brilho.raio} paradas={brilho.paradas} />
      </Animated.View>

      <Animated.View
        testID="heroi-anel"
        style={[centrada(anel.tamanho), styles.redonda, { borderWidth: anel.espessura, borderColor: anel.cor, opacity: faixa(anel.janela, 0, 1, anel.curva), transform: [{ scale: faixa(anel.janela, anel.escalaInicial, 1, anel.curva) }] }]}
      />

      <Animated.View testID="heroi-disco" style={[centrada(disco.tamanho), styles.redonda, { boxShadow: disco.sombra, opacity: faixa(disco.janela, 0, 1, disco.curva), transform: [{ scale: faixa(disco.janela, disco.escalaInicial, 1, disco.curva) }] }]}>
        {/* o recorte fica numa camada de dentro: `overflow: hidden` na de fora cortaria o halo (a sombra) */}
        <View testID="heroi-disco-recorte" style={[StyleSheet.absoluteFill, styles.redonda, styles.recorte]}>
          <DegradeRadial id="heroi-disco-degrade" lado={disco.tamanho} cx={0.5} cy={disco.centroY} r={disco.raio} paradas={disco.paradas} />
        </View>
      </Animated.View>

      {animar
        ? onda.janelas.map((janela, i) => (
            <Animated.View
              key={i}
              testID={`heroi-onda-${i + 1}`}
              style={[centrada(onda.tamanho), styles.redonda, { borderWidth: onda.espessura, borderColor: onda.cor, opacity: faixa(janela, onda.opacidadeInicial, 0, onda.curva), transform: [{ scale: faixa(janela, onda.escalaInicial, onda.escalaFinal, onda.curva) }] }]}
            />
          ))
        : null}

      {animar
        ? FAISCAS.map((f, i) => {
            const janela: Janela = [f.atraso, f.atraso + faisca.duracao];
            const curva = bezier(faisca.curva);
            const trecho = (de: number, ate: number) => t.interpolate({ inputRange: [janela[0], janela[1]], outputRange: [de, ate], easing: curva, extrapolate: 'clamp' });
            const opacidade = t.interpolate({
              inputRange: [janela[0], janela[0] + faisca.duracao * faisca.apareceAte, janela[0] + faisca.duracao * faisca.somePor, janela[1]],
              outputRange: [0, 1, 1, 0],
              easing: curva,
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={i}
                testID={`heroi-faisca-${i + 1}`}
                style={[
                  centrada(f.tamanho),
                  f.forma === 'circulo' ? { borderRadius: radius.pill, backgroundColor: f.cor, boxShadow: `0px 0px ${faisca.brilho}px ${f.cor}` } : null,
                  { opacity: opacidade, transform: [{ translateX: trecho(0, f.dx) }, { translateY: trecho(0, f.dy) }, { scale: trecho(faisca.escalaInicial, faisca.escalaFinal) }] },
                ]}
              >
                {f.forma === 'estrela' ? (
                  <Svg width={f.tamanho} height={f.tamanho} viewBox="0 0 100 100">
                    <Polygon points={ESTRELA} fill={f.cor} />
                  </Svg>
                ) : null}
              </Animated.View>
            );
          })
        : null}

      {cintilacao.pontos.map((p, i) => {
        const aparece = faixa(p.aparece, 0, 1, CURVAS.easeOut);
        const opacidade = Animated.multiply(aparece, pulsos[i].interpolate({ inputRange: [0, 1], outputRange: [cintilacao.opacidadeMinima, 1] }));
        const escala = pulsos[i].interpolate({ inputRange: [0, 1], outputRange: [cintilacao.escalaMinima, 1] });
        return (
          <Animated.View
            key={i}
            testID={`heroi-cintilacao-${i + 1}`}
            style={[centrada(cintilacao.tamanho), styles.ponto, { boxShadow: cintilacao.brilho, opacity: opacidade, transform: [{ translateX: p.x }, { translateY: p.y }, { scale: escala }] }]}
          />
        );
      })}

      <Animated.View
        testID="heroi-selo"
        style={[
          centrada(selo.tamanho),
          {
            borderRadius: selo.raio,
            boxShadow: selo.sombra,
            opacity: t.interpolate({ inputRange: [entrada.janela[0], entrada.meio], outputRange: [0, 1], easing: bezier(entrada.curva), extrapolate: 'clamp' }),
            transform: [
              {
                scale: t.interpolate({ inputRange: [entrada.janela[0], entrada.meio, entrada.janela[1]], outputRange: [entrada.escalaInicial, entrada.escalaMeio, 1], easing: bezier(entrada.curva), extrapolate: 'clamp' }),
              },
              {
                rotate: t.interpolate({ inputRange: [entrada.janela[0], entrada.meio, entrada.janela[1]], outputRange: [`${entrada.giroInicial}deg`, `${entrada.giroMeio}deg`, '0deg'], easing: bezier(entrada.curva), extrapolate: 'clamp' }),
              },
            ],
          },
        ]}
      >
        <View style={[StyleSheet.absoluteFill, styles.recorte, { borderRadius: selo.raio }]}>
          <Svg width={selo.tamanho} height={selo.tamanho} viewBox={`0 0 ${selo.desenho} ${selo.desenho}`}>
            <Defs>
              <LinearGradient id="heroi-selo-fundo" x1={seloFundo.x1} y1={seloFundo.y1} x2={seloFundo.x2} y2={seloFundo.y2}>
                {seloFundo.paradas.map((p) => <Stop key={p.posicao} offset={p.posicao} stopColor={p.cor} />)}
              </LinearGradient>
              <LinearGradient id="heroi-selo-sombra" x1={seloSombra.x1} y1={seloSombra.y1} x2={seloSombra.x2} y2={seloSombra.y2}>
                <Stop offset={0} stopColor={separarCor(seloSombra.corDe).cor} stopOpacity={separarCor(seloSombra.corDe).alfa} />
                <Stop offset={1} stopColor={separarCor(seloSombra.corAte).cor} stopOpacity={separarCor(seloSombra.corAte).alfa} />
              </LinearGradient>
              <RadialGradient id="heroi-selo-luz" cx={seloLuz.cx} cy={seloLuz.cy} r={seloLuz.r} fx={seloLuz.cx} fy={seloLuz.cy}>
                <Stop offset={0} stopColor={separarCor(seloLuz.corDe).cor} stopOpacity={separarCor(seloLuz.corDe).alfa} />
                <Stop offset={1} stopColor={separarCor(seloLuz.corAte).cor} stopOpacity={separarCor(seloLuz.corAte).alfa} />
              </RadialGradient>
            </Defs>
            <Rect width={selo.desenho} height={selo.desenho} fill="url(#heroi-selo-fundo)" />
            <Rect width={selo.desenho} height={selo.desenho} fill="url(#heroi-selo-sombra)" />
            <Rect width={selo.desenho} height={selo.desenho} fill="url(#heroi-selo-luz)" />
            {/* sombra do visto: o mesmo traço, deslocado, mais grosso e translúcido (o SVG nativo não tem `feDropShadow`) */}
            <CaminhoAnimado
              d={selo.visto.caminho}
              transform={`translate(0 ${selo.visto.sombra.deslocamento})`}
              fill="none"
              stroke={sombraDoVisto.cor}
              strokeOpacity={sombraDoVisto.alfa}
              strokeWidth={selo.visto.sombra.espessura}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={[selo.visto.comprimento, selo.visto.comprimento]}
              strokeDashoffset={desenhoDoVisto}
            />
            <CaminhoAnimado
              testID="heroi-visto"
              d={selo.visto.caminho}
              fill="none"
              stroke={selo.visto.cor}
              strokeWidth={selo.visto.espessura}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={[selo.visto.comprimento, selo.visto.comprimento]}
              strokeDashoffset={desenhoDoVisto}
            />
          </Svg>
          {animar ? (
            <Animated.View
              testID="heroi-brilho-do-selo"
              style={[
                styles.brilhoDoSelo,
                fundoEmDegrade(selo.brilho.degrade),
                {
                  top: folgaDoBrilho(selo.brilho.altura),
                  bottom: folgaDoBrilho(selo.brilho.altura),
                  width: larguraDoBrilho,
                  transform: [{ translateX: faixa(selo.brilho.janela, selo.brilho.de * larguraDoBrilho, selo.brilho.ate * larguraDoBrilho, selo.brilho.curva) }, { skewX: `${selo.brilho.inclinacao}deg` }],
                },
              ]}
            />
          ) : null}
          <View style={[StyleSheet.absoluteFill, styles.semToque, { borderRadius: selo.raio, boxShadow: selo.filete }]} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  raiz: { position: 'absolute', left: '50%', top: HEROI.centroY, width: 0, height: 0, pointerEvents: 'none' },
  redonda: { borderRadius: radius.pill },
  ponto: { borderRadius: radius.pill, backgroundColor: HEROI.cintilacao.cor },
  recorte: { overflow: 'hidden' },
  semToque: { pointerEvents: 'none' },
  brilhoDoSelo: { position: 'absolute', left: 0, pointerEvents: 'none' },
});
