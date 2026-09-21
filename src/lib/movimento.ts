import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * A pessoa pediu "reduzir movimento" no sistema? `undefined` enquanto o sistema não respondeu: quem anima espera a resposta
 * para não começar uma animação que a pessoa pediu para não ver. Toda animação nova do app passa por aqui
 * (docs/DESIGN_SYSTEM.md, seção 13).
 */
export function useMovimentoReduzido(): boolean | undefined {
  const [reduzir, setReduzir] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    let vivo = true;
    AccessibilityInfo.isReduceMotionEnabled().then(
      (valor) => { if (vivo) setReduzir(valor); },
      // sem resposta do sistema, anima (o padrão de quem nunca mexeu nessa configuração)
      () => { if (vivo) setReduzir(false); },
    );
    const assinatura = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduzir);
    return () => { vivo = false; assinatura.remove(); };
  }, []);

  return reduzir;
}
