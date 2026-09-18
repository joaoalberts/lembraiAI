import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Unidade proporcional `du` ("design unit") = 1 px da imagem de referência (frame de 851 px).
 * Em CSS escreve-se `24du`; aqui vira `calc(24 * var(--u))`, e `--u` (tokens.css) escala com a
 * largura do frame. Assim as medidas extraídas de ./ref/ são usadas 1:1, em qualquer tela.
 */
function duUnit(): Plugin {
  return {
    name: 'du-unit',
    enforce: 'pre',
    transform(code, id) {
      if (!/\.css($|\?)/.test(id)) return null;
      // font-size em du também fixa o eixo de tamanho óptico (opsz = tamanho de design / 2), para que a
      // largura dos textos não mude com a escala do frame (o auto do navegador usaria o tamanho em px).
      const withOpsz = code.replace(/font-size:\s*(\d*\.?\d+)du(\s*[;}])/g,
        (_m, n: string, end: string) => `font-size: ${n}du; font-variation-settings: 'opsz' ${(+n / 2).toFixed(2)}${end}`);
      return { code: withOpsz.replace(/(-?\d*\.?\d+)du\b/g, (_m, n: string) => `calc(${n} * var(--u))`), map: null };
    },
  };
}

export default defineConfig({
  plugins: [duUnit(), react()],
  server: { port: 5173, host: true },
});
