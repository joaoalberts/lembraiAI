import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, View, type Insets, type LayoutChangeEvent, type PressableProps, type PressableStateCallbackType } from 'react-native';
import { focoDeTeclado } from '../design/foco';
import { size } from '../design/tokens';

interface Medida {
  largura: number;
  altura: number;
}
type Folga = Required<Insets>;

const lado = (pedida: PressableProps['hitSlop'], chave: keyof Insets): number => (typeof pedida === 'number' ? pedida : (pedida?.[chave] ?? 0));

/**
 * Quanto cada lado precisa crescer para o controle chegar ao alvo: o que falta em cada eixo, dividido pelos dois lados, ou
 * a folga que quem usa pediu, o que for maior. `undefined` quando nada falta. É a conta do "alvo de toque de 44".
 */
export function folgaAteOAlvo(medida: Medida | null, alvo: number, pedida?: PressableProps['hitSlop']): Folga | undefined {
  const dx = medida && alvo > 0 ? Math.max(0, (alvo - medida.largura) / 2) : 0;
  const dy = medida && alvo > 0 ? Math.max(0, (alvo - medida.altura) / 2) : 0;
  const folga: Folga = {
    top: Math.max(dy, lado(pedida, 'top')),
    bottom: Math.max(dy, lado(pedida, 'bottom')),
    left: Math.max(dx, lado(pedida, 'left')),
    right: Math.max(dx, lado(pedida, 'right')),
  };
  return folga.top + folga.bottom + folga.left + folga.right > 0 ? folga : undefined;
}

const paraFora = (n: number): number => (n === 0 ? 0 : -n);

/**
 * Quanto o toque passa do desenho em cada borda de um controle de `lado`: metade do que falta para o alvo (`size.touch`). Quem
 * ancora um botão logo abaixo da barra de status do sistema soma isto à área segura: nenhum toque atravessa a barra, então um
 * botão encostado nela perde a folga de cima e o alvo fica curto (medido no Android: o "Voltar" das contas ficava com 44 × 40).
 */
export function respiroDoToque(lado: number, alvo: number = size.touch): number {
  return Math.max(0, (alvo - lado) / 2);
}
const SEM_BORDA: Folga = { top: 0, bottom: 0, left: 0, right: 0 };

/** Largura da borda de cada lado do botão na web (0 sem estilo calculado, como na renderização do servidor e no Jest). */
function bordasDe(no: unknown): Folga {
  if (!no || typeof getComputedStyle !== 'function') return SEM_BORDA;
  const estilo = getComputedStyle(no as Element);
  const px = (valor: string) => Number.parseFloat(valor) || 0;
  return { top: px(estilo.borderTopWidth), bottom: px(estilo.borderBottomWidth), left: px(estilo.borderLeftWidth), right: px(estilo.borderRightWidth) };
}

/**
 * Camada transparente que estende o alvo por dentro do botão (só na web): o clique nela sobe até o botão. Um filho absoluto
 * se mede pela borda de dentro do pai, então a largura da borda entra na conta (sem ela o alvo ficava 2 px curto).
 */
function CamadaDeToque({ folga, borda }: { folga: Folga; borda: Folga }) {
  return (
    <View
      testID="folga-de-toque"
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        position: 'absolute',
        top: paraFora(folga.top + borda.top),
        bottom: paraFora(folga.bottom + borda.bottom),
        left: paraFora(folga.left + borda.left),
        right: paraFora(folga.right + borda.right),
      }}
    />
  );
}

interface ToqueProps extends PressableProps {
  /** Menor lado do alvo de toque. Padrão: `size.touch` (44). 0 desliga a folga automática. */
  alvoMinimo?: number;
}

/**
 * O `Pressable` do app. Mede o próprio tamanho e completa o alvo de toque até 44 (`size.touch`) sem mexer no visual: no
 * iOS e no Android com o `hitSlop` do sistema; na web, onde o react-native-web 0.21 não implementa `hitSlop`, com uma camada
 * transparente por dentro do botão. Todo controle do app passa por aqui (um teste barra o `Pressable` cru).
 * Padrão: docs/DESIGN_SYSTEM.md, seção 16.2.
 */
export function Toque({ alvoMinimo = size.touch, hitSlop, onLayout, onFocus, onBlur, style, children, ...resto }: ToqueProps) {
  const [medida, setMedida] = useState<Medida | null>(null);
  const [teclado, setTeclado] = useState(false);
  const [borda, setBorda] = useState<Folga>(SEM_BORDA);
  const raiz = useRef<View>(null);
  const folga = folgaAteOAlvo(medida, alvoMinimo, hitSlop);
  const web = Platform.OS === 'web';
  const comCamada = web && folga !== undefined;

  useEffect(() => {
    if (!comCamada) return;
    const nova = bordasDe(raiz.current);
    setBorda((atual) => (atual.top === nova.top && atual.bottom === nova.bottom && atual.left === nova.left && atual.right === nova.right ? atual : nova));
  }, [comCamada, medida]);

  const aoMedir = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setMedida((atual) => (atual && atual.largura === width && atual.altura === height ? atual : { largura: width, altura: height }));
    onLayout?.(e);
  };

  // o `focused` do react-native-web vale para qualquer foco, clique e toque também; o anel é só do teclado (`focoDeTeclado`)
  const comFoco = (estado: PressableStateCallbackType): PressableStateCallbackType & { focused?: boolean } => (web ? { ...estado, focused: teclado } : estado);
  const aoFocar: PressableProps['onFocus'] = (e) => {
    if (web) setTeclado(focoDeTeclado(e.nativeEvent?.target));
    onFocus?.(e);
  };
  const aoDesfocar: PressableProps['onBlur'] = (e) => {
    if (web) setTeclado(false);
    onBlur?.(e);
  };

  return (
    <Pressable
      {...resto}
      ref={raiz}
      hitSlop={web ? undefined : folga}
      onLayout={aoMedir}
      onFocus={aoFocar}
      onBlur={aoDesfocar}
      style={typeof style === 'function' ? (estado) => style(comFoco(estado)) : style}
    >
      {(estado) => (
        <>
          {web && folga ? <CamadaDeToque folga={folga} borda={borda} /> : null}
          {typeof children === 'function' ? children(comFoco(estado)) : children}
        </>
      )}
    </Pressable>
  );
}
