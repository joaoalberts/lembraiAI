# Arte do app (`assets/art`)

Imagens que as telas usam. Vieram do app web original (`Aplicativos/lembreiAI/public/assets`) e foram copiadas **idênticas** (SHA-256 conferido), exceto as duas camadas de curvas de nível, que `scripts/arte/gerar-topo.sh` gera com o Chrome a partir do SVG, com o mesmo recorte e a mesma máscara do CSS do app web.

| Arquivo | Bytes | Onde entra | Origem |
|---|---|---|---|
| `bg-onboarding.jpg` | 105.574 | Fundo do Onboarding (`docs/referencias/01`) | app web |
| `hero-pino.png` | 445.564 | Pino 3D com relógio sobre o mapa, no Onboarding | app web |
| `hero-script.png` | 21.855 | "Mais liberdade para o seu dia", manuscrito, no Onboarding | app web |
| `bg-success.jpg` | 69.994 | Fundo de folhagem da tela de sucesso (`09`) | app web |
| `thumb-sucesso.jpg` | 6.061 | Miniatura de mapa nos lembretes por local | app web |
| `topo-header.svg` | 44.627 | Curvas de nível: entrada do gerador | app web |
| `topo-lista.webp` | 56.290 | Curvas sobre o cabeçalho verde da lista e das configurações (`07`, `08`) | gerado |
| `topo-contas.webp` | 48.868 | Curvas sobre o fundo das telas de conta (`02`) | gerado |
| `map-form.jpg`, `thumb-academia.jpg`, `thumb-mercado.jpg` | 42.221, 4.269 e 4.499 | Sem uso hoje no app web nem no Expo; guardados por integridade | app web |

## Regras

- **Arte decorativa não é lida pelo leitor de tela:** `accessible={false}` e sem `alt` (o texto que a acompanha diz tudo).
- **Não recomprimir os originais.** Se um deles ficar pesado no bundle, gere uma cópia otimizada com outro nome e use essa.
- **As camadas geradas têm 2 px por `du`** (1702 px de largura para a coluna de 851 du), o bastante para 3× em 430 dp. Rode `scripts/arte/gerar-topo.sh` de novo se o SVG ou os modelos em `scripts/arte/*.html` mudarem.
- O degradê e a luz do cabeçalho não estão nas imagens: vêm de `gradients` (`src/design/tokens.ts`), para as cores continuarem sendo tokens.
