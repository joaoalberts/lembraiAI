import { useEffect, useState } from 'react';
import { Keyboard, Platform, type KeyboardEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Quanto do pé da tela o teclado cobre, em dp (0 com ele fechado). Serve a quem desenha por cima de tudo, como a folha
 * inferior (`Sheet`): com as barras do sistema translúcidas o Android não redimensiona a janela para o teclado, então quem
 * fica embaixo precisa subir sozinho. Na web não há evento (o navegador ajusta a janela) e o valor fica em 0.
 *
 * O iOS avisa antes de o teclado se mexer ("Will") e o Android depois ("Did"); a altura do iOS já cobre a área do indicador
 * de início. No Android o evento a desconta da barra de navegação, que o app desenha por baixo (`navigationBarTranslucent`),
 * e por isso ela é somada de volta.
 */
export function useAlturaDoTeclado(): number {
  const { bottom } = useSafeAreaInsets();
  const [altura, setAltura] = useState(0);

  useEffect(() => {
    const ios = Platform.OS === 'ios';
    const aparece = Keyboard.addListener(ios ? 'keyboardWillShow' : 'keyboardDidShow', (e: KeyboardEvent) => setAltura(e.endCoordinates.height));
    const some = Keyboard.addListener(ios ? 'keyboardWillHide' : 'keyboardDidHide', () => setAltura(0));
    return () => {
      aparece.remove();
      some.remove();
    };
  }, []);

  return altura > 0 && Platform.OS === 'android' ? altura + bottom : altura;
}
