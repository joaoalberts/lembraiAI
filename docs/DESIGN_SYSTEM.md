# LembreiAi: Design System do app Expo

> **Versão 1.0 · 21/09/2026** · Vale para `Aplicativos/lembreiai-expo` (iOS, Android e web).
>
> **Fonte única dos valores:** `src/design/tokens.ts`. Este documento diz *como usar* e *por quê*. As tabelas de valores são **geradas** dos tokens (`npm run design:docs`) e `npm test` falha se o documento e o código divergirem. Não edite as tabelas à mão: mude o token, descreva-o em `src/design/doc.ts` e gere de novo.

## 1. Como usar este documento

- **Nunca escreva o valor à mão.** Cor, tamanho, espaço, raio, fonte e sombra vêm de `src/design/tokens.ts`. O teste `src/design/__tests__/valores-soltos.test.ts` barra `#hex`, `rgba()`, `fontSize: 16`, `padding: 12`, `fontWeight` e `fontFamily: 'Inter'` fora dele.
- **Componente antes de estilo novo.** Antes de escrever um estilo, veja se `Button`, `TextField`, `Toggle`, `Chip`, `SegmentedControl`, `Banner`, `ReminderCard` ou `AuthLayout` (em `src/components`) já resolve.
- **Mudou uma decisão visual?** (1) altere o token; (2) descreva-o em `src/design/doc.ts`; (3) rode `npm run design:docs`; (4) registre a decisão na seção 18; (5) rode `npm test`.
- **Ver o resultado sem conta e sem servidor real:** `node scripts/preview-backend-falso.mjs` e um `.env.development.local` apontando para ele (as instruções estão no topo do script). O app abre com lembretes de exemplo; troque o estado da lista com `/__mode/empty`, `/__mode/error` e `/__mode/slow`.
- **Ponto de recuperação antes deste sistema:** a tag `ponto-de-recuperacao/01-antes-do-design-system` (`git switch -c volta-01 ponto-de-recuperacao/01-antes-do-design-system`).

> As seções 9 a 11 descrevem o **padrão a seguir**. O quanto cada item já está aplicado no app está na seção 17.

## 2. Fontes de verdade e princípios

### 2.1 De onde vêm os valores

| Fonte | O que dá |
|---|---|
| `../lembreiAI/ref/1.png … 5.png` e `../lembreiAI/DESIGN_SYSTEM.md` | Referências aprovadas e a medição por pixel: paleta, tipografia, raios, sombras e estados. A lista de referência é a **versão B** (`5.png`). |
| `../lembreiAI/src/styles/tokens.css` | Os valores que o app web de fato usa (nomes de cor iguais: `forest`, `mint`, `orange`, `cream`, `ink`). |
| O app Expo antes deste sistema (tag de recuperação) | O que já existia e foi preservado: rotas, textos, regras e funções. Nada disso mudou. |
| Este documento | As decisões novas: acessibilidade, adaptação ao React Native e o que as referências não mostram. |

### 2.2 Princípios

1. **Calmo e legível.** Fundo creme, bastante espaço, sombras quase imperceptíveis. Nada se mexe sem motivo.
2. **Verde é a marca; laranja é a ação.** Verde-floresta para identidade, seleção e foco. O laranja aparece só no botão primário (e no marcador da categoria laranja).
3. **Só claro.** As referências não têm modo escuro (`userInterfaceStyle: light`). Modo escuro pede tokens novos e novo aceite.
4. **Acessível antes de fiel.** Quando uma referência falha no contraste, o app corrige e o registro de decisões (seção 18) explica. Exceção só por escrito.
5. **Uma decisão, um lugar.** Componente compartilhado antes de estilo novo; token antes de valor solto.

## 3. Paleta de cores

### 3.1 Primitivas

Use `palette.*` só para definir papéis em `colors`. As telas usam os papéis (3.2).

<!-- tokens:cores-primitivas:inicio -->
| Token | Valor | Uso |
|---|---|---|
| `palette.forest900` | `#12432F` | Chip de filtro selecionado |
| `palette.forest800` | `#254233` | Botão escuro (secundário) |
| `palette.forestHover` | `#1F382B` | Botão escuro com o ponteiro em cima (web) |
| `palette.forestPressed` | `#1B3025` | Botão escuro pressionado |
| `palette.forest700` | `#185C4B` | Foco, spinner e faixa dos avisos informativos |
| `palette.forest600` | `#216955` | Interruptor ligado |
| `palette.mint50` | `#E7F4EB` | Fundo do aviso de sucesso |
| `palette.mint100` | `#DBF1E5` | Círculo atrás do ícone do estado vazio |
| `palette.mintTint` | `#DDE8DD` | Fundo do aviso informativo |
| `palette.mintBrand` | `#84FADA` | Fundo do ícone do app, da tela de abertura e do favicon |
| `palette.mintBrandEnd` | `#78E4C4` | Fim do degradê do ícone do app |
| `palette.brandInk` | `#043525` | Símbolo do ícone do app |
| `palette.orange500` | `#FE532A` | Cor de ação (botão primário). Nunca como cor de texto sobre fundo claro |
| `palette.orangeHover` | `#EF4E28` | Botão primário com o ponteiro em cima (web) |
| `palette.orangePressed` | `#DF4925` | Botão primário pressionado |
| `palette.orangeAA` | `#D53B14` | Alternativa ao laranja que cumpre 4,5:1 com texto branco |
| `palette.white` | `#FFFFFF` | Campos, painéis, folhas e texto sobre fundo escuro |
| `palette.cream100` | `#FAF9F6` | Superfície de cartões e da barra de abas |
| `palette.cream200` | `#F5F2ED` | Fundo de página |
| `palette.sand` | `#E8E4DC` | Palco atrás da coluna do app (web) e trilho do controle segmentado |
| `palette.chipOff` | `#F3F4EF` | Chip de filtro não selecionado |
| `palette.chipRing` | `#DFE1DB` | Contorno do chip não selecionado |
| `palette.borderSubtle` | `#E7E8EA` | Borda de campos de formulário |
| `palette.borderStrong` | `#B9B8BB` | Contorno do botão sem fundo |
| `palette.divider` | `#E8E7E6` | Divisórias |
| `palette.trackOff` | `#D6D5D5` | Trilho do interruptor desligado |
| `palette.ink900` | `#0A0A0A` | Texto principal |
| `palette.inkBrand` | `#0A3924` | Rótulo da aba ativa |
| `palette.ink700` | `#5B5D64` | Texto secundário |
| `palette.ink650` | `#6B6E76` | Texto de exemplo (placeholder) |
| `palette.ink600` | `#767880` | Só ícones e elementos sem texto: não serve como cor de texto |
| `palette.textAccent` | `#086952` | Valor em destaque dentro do texto |
| `palette.red700` | `#C62828` | Texto e borda de erro |
| `palette.red200` | `#F3B8B8` | Borda da zona de perigo |
| `palette.red100` | `#FFE6E6` | Fundo do aviso de erro |
| `palette.red50` | `#FFF5F5` | Fundo da zona de perigo |
| `palette.green700` | `#0B7A3B` | Texto de sucesso |
| `palette.mapBlue` | `#2F80ED` | Posição atual da pessoa no mapa |
| `palette.mapGray` | `#828890` | Marcador de lembrete pausado no mapa |
<!-- tokens:cores-primitivas:fim -->

### 3.2 Papéis

<!-- tokens:cores-semanticas:inicio -->
| Token | Valor | Vem da paleta | Uso |
|---|---|---|---|
| `colors.bg.page` | `#F5F2ED` | `palette.cream200` | Fundo de todas as telas |
| `colors.bg.stage` | `#E8E4DC` | `palette.sand` | Palco atrás da coluna do app na web (tablet e computador) |
| `colors.bg.card` | `#FAF9F6` | `palette.cream100` | Superfície de cartões e da barra de abas |
| `colors.bg.field` | `#FFFFFF` | `palette.white` | Campos de formulário, painéis e folhas |
| `colors.bg.disabled` | `#F5F2ED` | `palette.cream200` | Campo desabilitado |
| `colors.text.primary` | `#0A0A0A` | `palette.ink900` | Texto principal e títulos |
| `colors.text.secondary` | `#5B5D64` | `palette.ink700` | Subtítulos, dicas e metadados |
| `colors.text.placeholder` | `#6B6E76` | `palette.ink650` | Texto de exemplo dentro de campos vazios |
| `colors.text.accent` | `#086952` | `palette.textAccent` | Valor em destaque dentro do texto (raio, contagens, e-mail da conta) |
| `colors.text.brand` | `#0A3924` | `palette.inkBrand` | Rótulo da aba ativa |
| `colors.text.onAction` | `#FFFFFF` | `palette.white` | Rótulo sobre o botão primário |
| `colors.text.onDark` | `#FFFFFF` | `palette.white` | Rótulo sobre fundo escuro (botão escuro, chip selecionado) |
| `colors.text.danger` | `#C62828` | `palette.red700` | Mensagens e rótulos de erro |
| `colors.text.success` | `#0B7A3B` | `palette.green700` | Mensagens e rótulos de sucesso |
| `colors.icon.default` | `#0A0A0A` | `palette.ink900` | Ícones sobre fundo claro |
| `colors.icon.muted` | `#767880` | `palette.ink600` | Ícones secundários e da aba inativa (nunca para texto) |
| `colors.action.primary` | `#FE532A` | `palette.orange500` | Fundo do botão primário |
| `colors.action.primaryHover` | `#EF4E28` | `palette.orangeHover` | Botão primário com o ponteiro em cima (web) |
| `colors.action.primaryPressed` | `#DF4925` | `palette.orangePressed` | Botão primário pressionado |
| `colors.action.primaryAA` | `#D53B14` | `palette.orangeAA` | Alternativa do botão primário que cumpre 4,5:1 com texto branco |
| `colors.action.secondary` | `#254233` | `palette.forest800` | Fundo do botão escuro (secundário) |
| `colors.action.secondaryHover` | `#1F382B` | `palette.forestHover` | Botão escuro com o ponteiro em cima (web) |
| `colors.action.secondaryPressed` | `#1B3025` | `palette.forestPressed` | Botão escuro pressionado |
| `colors.border.field` | `#E7E8EA` | `palette.borderSubtle` | Borda de campos de formulário |
| `colors.border.strong` | `#B9B8BB` | `palette.borderStrong` | Contorno do botão sem fundo (ghost) |
| `colors.border.divider` | `#E8E7E6` | `palette.divider` | Divisórias |
| `colors.border.chip` | `#DFE1DB` | `palette.chipRing` | Contorno do chip não selecionado |
| `colors.border.focus` | `#185C4B` | `palette.forest700` | Borda do campo em foco e anel de foco |
| `colors.border.danger` | `#C62828` | `palette.red700` | Borda do campo com erro e do botão de exclusão |
| `colors.border.dangerSoft` | `#F3B8B8` | `palette.red200` | Borda da zona de perigo |
| `colors.control.on` | `#216955` | `palette.forest600` | Interruptor ligado |
| `colors.control.off` | `#D6D5D5` | `palette.trackOff` | Interruptor desligado |
| `colors.control.thumb` | `#FFFFFF` | `palette.white` | Bolinha do interruptor |
| `colors.control.chipOn` | `#12432F` | `palette.forest900` | Chip de filtro selecionado |
| `colors.control.chipOff` | `#F3F4EF` | `palette.chipOff` | Chip de filtro não selecionado |
| `colors.control.segmentTrack` | `#E8E4DC` | `palette.sand` | Trilho do controle segmentado |
| `colors.control.segmentThumb` | `#FFFFFF` | `palette.white` | Opção selecionada do controle segmentado |
| `colors.feedback.dangerBg` | `#FFE6E6` | `palette.red100` | Fundo do aviso de erro |
| `colors.feedback.dangerWash` | `#FFF5F5` | `palette.red50` | Fundo da zona de perigo |
| `colors.feedback.successBg` | `#E7F4EB` | `palette.mint50` | Fundo do aviso de sucesso |
| `colors.feedback.infoBg` | `#DDE8DD` | `palette.mintTint` | Fundo do aviso informativo (ex.: "você está dentro do raio") |
| `colors.feedback.infoBar` | `#185C4B` | `palette.forest700` | Faixa lateral do aviso informativo |
| `colors.feedback.emptyCircle` | `#DBF1E5` | `palette.mint100` | Círculo atrás do ícone do estado vazio |
| `colors.brand.tile` | `#84FADA` | `palette.mintBrand` | Fundo do ícone do app, da tela de abertura e do favicon |
| `colors.brand.tileEnd` | `#78E4C4` | `palette.mintBrandEnd` | Fim do degradê do ícone do app |
| `colors.brand.glyph` | `#043525` | `palette.brandInk` | Símbolo do ícone do app |
| `colors.spinner` | `#185C4B` | `palette.forest700` | Indicador de carregamento sobre fundo claro |
| `colors.overlay` | `rgba(0, 0, 0, 0.4)` | — | Véu atrás de modais e folhas |
| `colors.map.me` | `#2F80ED` | `palette.mapBlue` | Posição atual da pessoa no mapa |
| `colors.map.ring` | `#FFFFFF` | `palette.white` | Aro branco em volta dos marcadores do mapa |
| `colors.map.paused` | `#828890` | `palette.mapGray` | Marcador de lembrete pausado no mapa |
| `colors.map.background` | `#E8E4DC` | `palette.sand` | Fundo do mapa enquanto os mapas carregam |
<!-- tokens:cores-semanticas:fim -->

### 3.3 Categorias de lembrete

Cinco categorias, as mesmas do banco (`green`, `orange`, `blue`, `purple`, `pink`). A cor sozinha nunca informa: o ícone e o título dizem o resto.

<!-- tokens:cores-categorias:inicio -->
| Categoria | Fundo do ícone (`bg`) | Faixa (`bar`) | Glifo (`ink`) | Marcador no mapa (`pin`) |
|---|---|---|---|---|
| `colors.category.green` | `#DBF1E4` | `#39C391` | `#011F1A` | `#2F9E5B` |
| `colors.category.orange` | `#FDE6D6` | `#FD6C34` | `#0A0A0A` | `#FE532A` |
| `colors.category.blue` | `#D5E8F9` | `#51A6F6` | `#024381` | `#2F80ED` |
| `colors.category.purple` | `#EADFFB` | `#B287E8` | `#0A0A14` | `#7C3AED` |
| `colors.category.pink` | `#FCE3E9` | `#F980B3` | `#0A0A14` | `#E0457B` |
<!-- tokens:cores-categorias:fim -->

### 3.4 Regras de uso

- **Papel, não primitiva.** Se falta um papel, crie-o em `colors`; não use `palette.*` direto na tela.
- **Laranja não é cor de texto.** `colors.action.primary` sobre o fundo claro dá menos de 3:1. Destaque dentro de texto usa `colors.text.accent`.
- **Cinza de texto** é só `colors.text.secondary` ou `colors.text.placeholder`. `palette.ink600` (o cinza médio das referências) não atinge 4,5:1: serve para ícone, nunca para texto.
- **Erro** é vermelho (`colors.text.danger`) **mais** texto. Não pinte o fundo do campo.
- **Aviso informativo** usa verde-menta (`colors.feedback.infoBg`), não azul: azul não pertence à paleta.
- **No mapa**, o marcador usa `category.*.pin` (forte); o cartão usa `bg` e `bar` (suaves). Lembrete pausado usa `colors.map.paused`.

## 4. Tipografia

### 4.1 Famílias

A identidade das referências, e do app web `lembreiAI`, usa **Nunito Sans** na interface e **Source Serif 4** em negrito nos títulos. `src/design/fonts.ts` registra cinco arquivos (Nunito Sans 400, 500, 600 e 700; Source Serif 4 700), vindos de `@expo-google-fonts/nunito-sans` e `@expo-google-fonts/source-serif-4` e importados por peso, para o bundle levar só o que se usa.

- **Uma família por peso.** Fonte própria ignora `fontWeight` no iOS e no Android, e escrevê-lo soma negrito falso. Por isso não há token de peso: escolha `fontFamily.regular`, `medium`, `semibold`, `bold` ou `serif`. O detector de valores soltos barra `fontWeight` e `fontFamily` escritos à mão.
- **Serifa nos títulos:** `display`, `title` e `heading`, mais o título do cartão de lembrete. O resto é sans.
- **iOS e Android** seguram a abertura (splash) até as fontes chegarem (`app/_layout.tsx`). Se falharem, o app segue na fonte do sistema.
- **Web:** nunca bloqueia. Na renderização estática o Expo Router extrai as fontes carregadas com `expo-font` e as embute no HTML, então as páginas públicas saem com texto pronto (conferido na exportação: `/privacidade` e `/excluir-conta` trazem o texto, um `<link rel="preload">` por fonte e o `<style id="expo-generated-fonts">` com `font-display: swap`). `display: swap` mostra o texto na pilha de reserva do sistema (`pilhaDeReserva`, em `tokens.ts`) até a fonte chegar.
- **Campo de texto não herda a fonte:** o `TextInput` não herda a família do `Text`, e sem ela cai na fonte do sistema. O `TextField` define `fontFamily.regular` e um teste garante.
- **Mapa:** o Leaflet traz fonte própria (Helvetica no mapa, monoespaçada nos botões de zoom). `LeafletMapDom.tsx` a troca pela da marca; na WebView do app, onde as fontes da marca não existem, cai na reserva do sistema.
- **Corte óptico:** o Source Serif 4 tem eixo de tamanho óptico, que o React Native não expõe (a doc do Expo recomenda fontes estáticas). Os pacotes trazem um corte por peso; se ele destoar das referências nos títulos grandes, veja a seção 19.

### 4.2 Estilos

Use `...textStyles.estilo` e só troque cor (`colors.text.*`) ou família (`fontFamily.*`) com tokens.

<!-- tokens:tipografia-estilos:inicio -->
| Estilo | Tamanho | Altura de linha | Família | Uso |
|---|---|---|---|---|
| `textStyles.display` | 28 | 34 | `SourceSerif4_700Bold` | Título grande: nome do app nas telas de conta e títulos das páginas públicas |
| `textStyles.title` | 20 | 26 | `SourceSerif4_700Bold` | Título de tela, de estado vazio e de folha |
| `textStyles.heading` | 18 | 24 | `SourceSerif4_700Bold` | Título de seção ("Hoje", "Amanhã") e de cabeçalho |
| `textStyles.bodyLg` | 16 | 24 | `NunitoSans_400Regular` | Texto de leitura (política de privacidade) e de campos |
| `textStyles.body` | 14 | 20 | `NunitoSans_400Regular` | Texto corrente |
| `textStyles.label` | 14 | 20 | `NunitoSans_600SemiBold` | Rótulo de campo e de linha |
| `textStyles.button` | 16 | 20 | `NunitoSans_700Bold` | Rótulo de botão |
| `textStyles.caption` | 13 | 18 | `NunitoSans_400Regular` | Dica, metadado e mensagem de campo |
| `textStyles.micro` | 12 | 16 | `NunitoSans_400Regular` | Legenda mínima |
<!-- tokens:tipografia-estilos:fim -->

### 4.3 Escala

<!-- tokens:tipografia-escala:inicio -->
| Token | Valor | Uso |
|---|---|---|
| `fontSize.micro` | `12` | Tags e legendas: o piso de legibilidade do app |
| `fontSize.caption` | `13` | Dicas, metadados e mensagens de campo |
| `fontSize.body` | `14` | Texto corrente e rótulos |
| `fontSize.bodyLg` | `16` | Texto de leitura, campos e botões |
| `fontSize.heading` | `18` | Títulos de seção |
| `fontSize.title` | `20` | Títulos de tela e de estados |
| `fontSize.display` | `28` | Nome do app nas telas de conta |
| `lineHeight.micro` | `16` | Altura de linha do tamanho de mesmo nome |
| `lineHeight.caption` | `18` | Altura de linha do tamanho de mesmo nome |
| `lineHeight.body` | `20` | Altura de linha do tamanho de mesmo nome |
| `lineHeight.bodyLg` | `24` | Altura de linha do tamanho de mesmo nome |
| `lineHeight.heading` | `24` | Altura de linha do tamanho de mesmo nome |
| `lineHeight.title` | `26` | Altura de linha do tamanho de mesmo nome |
| `lineHeight.display` | `34` | Altura de linha do tamanho de mesmo nome |
| `fontFamily.regular` | `NunitoSans_400Regular` | Nunito Sans 400: texto corrente |
| `fontFamily.medium` | `NunitoSans_500Medium` | Nunito Sans 500: ênfase leve |
| `fontFamily.semibold` | `NunitoSans_600SemiBold` | Nunito Sans 600: rótulos e valores |
| `fontFamily.bold` | `NunitoSans_700Bold` | Nunito Sans 700: botões e destaques |
| `fontFamily.serif` | `SourceSerif4_700Bold` | Source Serif 4 700: títulos de tela, de seção e de cartão |
<!-- tokens:tipografia-escala:fim -->

### 4.4 Regras

- **Piso de 12.** O app web escalava tudo pela largura da tela e chegou a 6 px, ilegível. Aqui o tamanho é fixo e respeita o tamanho de fonte do sistema (não desligue `allowFontScaling`).
- **Altura de linha de pelo menos 1,2 vez o tamanho**, para não cortar acentos.
- **Quatro pesos de sans (400, 500, 600 e 700) e um de serifa (700).** Título de tela em serifa; botão em sans 700; corpo em 400. Peso novo é arquivo novo em `src/design/fonts.ts`, token novo e teste.
- **Sem caixa alta contínua** e sem sublinhado, salvo em link.
- **Nunca** `{texto && <Text/>}` com texto possivelmente vazio (derruba o app no iOS e no Android): use `texto !== ''` ou `!!texto`.

## 5. Espaçamento

Grade de 4 (o meio-passo de 2 só para ajuste fino).

<!-- tokens:espacamento:inicio -->
| Token | Valor | Uso |
|---|---|---|
| `space.hair` | `2` | Ajuste fino, como título e metadado do cartão |
| `space.xs` | `4` | Espaço mínimo entre textos |
| `space.sm` | `8` | Entre itens próximos: chips, ícone e texto |
| `space.md` | `12` | Padding de cartões e campos; entre cartões |
| `space.lg` | `16` | Margem lateral das telas e padding de painéis |
| `space.xl` | `24` | Entre grupos de conteúdo; padding das telas de conta |
| `space.xxl` | `32` | Entre seções |
| `space.huge` | `48` | Respiro no fim de listas rolantes |
| `space.giant` | `64` | Respiro do estado vazio |
<!-- tokens:espacamento:fim -->

- Margem lateral das telas e padding de painéis: `space.lg`. Padding de cartão e de campo: `space.md`.
- Entre cartões: `space.md`. Entre grupos de conteúdo: `space.xl`. Entre seções: `space.xxl`.
- Fim de lista rolante: `space.huge`, para o último item não colar nas abas.
- Entre irmãos, use `gap`; reserve `margin` para separar blocos.

## 6. Bordas e arredondamentos

### 6.1 Raios

<!-- tokens:raios:inicio -->
| Token | Valor | Uso |
|---|---|---|
| `radius.xs` | `4` | Selos pequenos |
| `radius.sm` | `8` | Avisos e miniaturas |
| `radius.md` | `12` | Campos, cartões e controles retangulares |
| `radius.lg` | `16` | Painéis grandes |
| `radius.sheet` | `20` | Topo de folhas e modais |
| `radius.pill` | `999` | Botões, chips e círculos |
<!-- tokens:raios:fim -->

### 6.2 Espessuras

<!-- tokens:bordas:inicio -->
| Token | Valor | Uso |
|---|---|---|
| `borderWidth.hairline` | `1` | Borda de campo, de botão sem fundo e de chip |
| `borderWidth.focus` | `2` | Anel de foco e cartão em destaque |
| `borderWidth.bar` | `4` | Faixa lateral de avisos e de cartões |
<!-- tokens:bordas:fim -->

- Botões e chips são pílula (`radius.pill`). Campos, cartões, painéis pequenos e o controle segmentado usam `radius.md`. Painéis grandes, `radius.lg`. O topo de folhas, `radius.sheet`.
- Cartão não tem borda: quem o separa do fundo é a sombra `shadow.card`. Campo tem `borderWidth.hairline` em `colors.border.field`.
- Faixa lateral de aviso e de categoria: `borderWidth.bar`.

## 7. Sombras

O desenho é quase plano. Toda sombra é o `boxShadow` em texto (aceito pela New Architecture do React Native no SDK 57 e pela web); nunca `shadow*` nem `elevation` soltos.

<!-- tokens:sombras:inicio -->
| Token | Valor (`boxShadow`) | Uso |
|---|---|---|
| `shadow.card` | `0px 1px 3px rgba(20, 40, 30, 0.05), 0px 4px 12px rgba(20, 40, 30, 0.04)` | Cartões e painéis (quase plano) |
| `shadow.float` | `0px 1px 4px rgba(0, 0, 0, 0.16)` | Controles flutuantes e folhas |
| `shadow.cta` | `0px 8px 24px rgba(254, 83, 42, 0.3)` | Brilho laranja do botão primário |
| `shadow.focus` | `0px 0px 0px 3px rgba(24, 92, 75, 0.15)` | Halo de 3 em volta do campo em foco, sobre a borda `colors.border.focus` |
<!-- tokens:sombras:fim -->

- `shadow.card` nos cartões e painéis; `shadow.float` nos controles flutuantes e na coluna da web; `shadow.cta` só no botão primário habilitado; `shadow.focus` como halo do campo em foco.
- Sombra dá profundidade, nunca informação: nada pode depender dela para ser entendido.

## 8. Ícones

- **Família:** Ionicons em contorno (`@expo/vector-icons`), a mesma das abas. O app web usa Lucide; o Ionicons é a opção gratuita e multiplataforma do Expo com o mesmo traço. Preenchido só para o item ativo da aba.
- **Tamanhos:** `size.icon.sm` (ao lado de texto pequeno), `size.icon.md` (ações), `size.icon.lg` (abas). Cor: `colors.icon.default`, ou o glifo da categoria (`colors.category.*.ink`).
- **Emoji não é ícone**: muda de aparência em cada sistema e não aceita cor.
- Ícone que é botão leva `accessibilityLabel`; ícone decorativo fica escondido do leitor de tela.
- Os nomes são conferidos contra a fonte por `src/design/__tests__/icones.test.ts`.

<!-- tokens:icones-categorias:inicio -->
| Ícone do lembrete | Ionicons |
|---|---|
| `cart` | `cart-outline` |
| `dumbbell` | `barbell-outline` |
| `pill` | `medical-outline` |
| `users` | `people-outline` |
| `plane` | `airplane-outline` |
| `pin` | `location-outline` |
| `bell` | `notifications-outline` |
| `briefcase` | `briefcase-outline` |
| `house` | `home-outline` |
| `card` | `card-outline` |
<!-- tokens:icones-categorias:fim -->

<!-- tokens:icones-interface:inicio -->
| Uso | Ionicons |
|---|---|
| Aba lembretes (ativa · inativa) | `list` · `list-outline` |
| Aba novo (ativa · inativa) | `add-circle` · `add-circle-outline` |
| Aba mapa (ativa · inativa) | `map` · `map-outline` |
| Aba config (ativa · inativa) | `settings` · `settings-outline` |
| fechar | `close` |
| excluir | `trash-outline` |
| aqui | `location` |
| definido | `checkmark-circle` |
| vazio | `notifications-outline` |
| email | `mail-outline` |
<!-- tokens:icones-interface:fim -->

## 9. Botões e seus estados

Componente: `src/components/Button.tsx`.

| Variante | Fundo | Rótulo | Contorno | Uso |
|---|---|---|---|---|
| `primary` | `colors.action.primary` | `colors.text.onAction` | nenhum | A ação principal da tela (uma por tela), com o brilho `shadow.cta` |
| `secondary` | `colors.action.secondary` | `colors.text.onDark` | nenhum | Ação de apoio (ex.: "Sair da conta") |
| `ghost` | transparente | `colors.text.primary` | `colors.border.strong` | Alternativas ("Cancelar", "Criar conta") |
| `danger` | transparente | `colors.text.danger` | `colors.border.danger` | Ação destrutiva ("Excluir minha conta") |

**Geometria:** altura mínima `size.button`, raio `radius.pill`, padding horizontal `space.xl`, rótulo `textStyles.button` centralizado. Ocupa a largura do contêiner; botões empilhados têm `space.md` entre si.

| Estado | `primary` | `secondary` | `ghost` e `danger` |
|---|---|---|---|
| Repouso | como na tabela acima | como na tabela acima | como na tabela acima |
| Ponteiro em cima (web) | `colors.action.primaryHover` | `colors.action.secondaryHover` | fundo `colors.bg.field` |
| Pressionado | `colors.action.primaryPressed` e escala `motion.pressedScale` | `colors.action.secondaryPressed` e escala | fundo `colors.control.chipOff` e escala |
| Foco de teclado (web) | anel de `borderWidth.focus` em `colors.border.focus`, afastado `space.hair` | igual | igual |
| Desabilitado | `opacity.disabled`, sem brilho, sem resposta ao toque | igual | igual |
| Em andamento | rótulo no gerúndio ("Entrando…") e desabilitado; sem spinner dentro do botão | igual | igual |

Regras: uma ação primária por tela. Ação destrutiva sempre pede confirmação (`confirmar`, em `src/lib/confirm.ts`). O botão tem `accessibilityRole="button"` e `accessibilityState={{ disabled }}`.

## 10. Campos e formulários

Componente: `src/components/TextField.tsx`.

- **Anatomia:** rótulo acima (`textStyles.label`, `colors.text.primary`), campo branco (`colors.bg.field`), borda `borderWidth.hairline` em `colors.border.field`, raio `radius.md`, padding `space.lg` por `space.md`, texto `textStyles.bodyLg`, placeholder `colors.text.placeholder`.

| Estado | Como fica |
|---|---|
| Repouso | como na anatomia |
| Foco | borda `colors.border.focus` e halo `shadow.focus` |
| Erro | borda `colors.border.danger`; mensagem abaixo em `textStyles.caption` e `colors.text.danger`; o fundo continua branco |
| Desabilitado | fundo `colors.bg.disabled`, texto `colors.text.secondary` |
| Dica | `textStyles.caption` em `colors.text.secondary`; some quando há erro |

- **Rótulo sempre visível.** Placeholder é exemplo ("seu@email.com"), não rótulo.
- **Teclado certo:** o `TextField` já escolhe `keyboardType`, `autoCapitalize` e `autoComplete` para e-mail, senha e números.
- **Erro em português, dizendo o que fazer.** Mensagem curta, sem código técnico.
- **Borda suave é identidade** (1,2:1 sobre o fundo, como nas referências). O foco é o reforço: exceção registrada na seção 16.
- **Interruptor** (`Toggle`): ligado `colors.control.on`, desligado `colors.control.off`, bolinha `colors.control.thumb`. Sempre com o rótulo ao lado e `accessibilityLabel`.
- **Controle segmentado** (`SegmentedControl`; duas opções, ex.: "Por horário" e "Por local"): trilho `colors.control.segmentTrack`, raio `radius.md`; a opção selecionada fica em `colors.control.segmentThumb` com `fontWeight.bold`.

## 11. Cards, modais, menus e navegação

### 11.1 Cartão de lembrete (`ReminderCard`)

Superfície `colors.bg.card`, raio `radius.md`, sombra `shadow.card`, faixa lateral de `borderWidth.bar` em `colors.category.*.bar`. À esquerda, círculo de `size.iconCircle` com `colors.category.*.bg` e o ícone da categoria (`colors.category.*.ink`, `size.icon.md`). No centro, título (`textStyles.bodyLg` em `fontWeight.semibold`, até 2 linhas) e metadado (`textStyles.caption`, `colors.text.secondary`). À direita, o `Toggle` e o botão de excluir (ícone `excluir`, `colors.icon.muted`, área de toque de 44 com `size.hitSlop`).

- **Dentro do raio:** anel `borderWidth.focus` em `colors.border.focus` e a linha "Você está aqui" em `colors.text.accent` com o ícone `aqui`.
- **Pausado:** `opacity.inactive` no cartão inteiro.

### 11.2 Painel

Agrupa configurações: `colors.bg.card`, `radius.md`, `shadow.card`, padding `space.lg`, título `textStyles.heading`. A **zona de perigo** usa `colors.feedback.dangerWash`, borda `colors.border.dangerSoft` e título em `colors.text.danger`.

### 11.3 Aviso (`Banner`)

Três variantes, sempre com texto (a cor não é o único sinal):

| Variante | Fundo | Texto | Uso |
|---|---|---|---|
| `error` | `colors.feedback.dangerBg` | `colors.text.danger` | Falha ao entrar, salvar, carregar |
| `success` | `colors.feedback.successBg` | `colors.text.success` | "Senha redefinida. Entre com a nova senha." |
| `info` | `colors.feedback.infoBg` e faixa `colors.feedback.infoBar` | `colors.text.primary` | "Você está dentro do raio de 1 lembrete", local definido |

Raio `radius.sm`, padding `space.md`, texto `textStyles.body`. O de erro tem `accessibilityRole="alert"`, para o leitor de tela anunciá-lo.

### 11.4 Chip

Opção de escolha rápida (repetição, raio). Altura `size.chip` e área de toque de 44 (`size.hitSlop`), raio `radius.pill`. Selecionado: `colors.control.chipOn` com `colors.text.onDark` e `fontWeight.semibold`. Não selecionado: `colors.control.chipOff`, contorno `colors.border.chip`, `colors.text.primary`.

### 11.5 Folha (modal inferior)

Véu `colors.overlay`; folha `colors.bg.field` com `radius.sheet` no topo, padding `space.xl` e `space.xxl` embaixo. Título `textStyles.title`. Botão de fechar de `size.closeButton` (área de toque de 44) em `colors.bg.page`. Na web a folha tem `layout.columnMax` de largura máxima, senão viraria uma faixa da largura da janela.

### 11.6 Abas e cabeçalho

- **Barra de abas:** fundo `colors.bg.card`, filete superior `colors.border.divider`, altura `size.tabBar` mais a área segura do sistema. Ativa: `colors.text.brand` com o ícone preenchido; inativa: `colors.icon.muted` com o ícone em contorno. Rótulo em `fontSize.micro` e `fontWeight.medium`, sem altura de linha própria (com ela o React Navigation cortava o pé do texto na web).
- **Cabeçalho:** fundo `colors.bg.page`, sem sombra, título `textStyles.heading` em `colors.text.primary`.

### 11.7 Coluna da web

No navegador o app vive numa coluna de celular centralizada (como o frame do app web): `layout.columnMax` de largura máxima, fundo `colors.bg.page`, sombra `shadow.float`, sobre o palco `colors.bg.stage`. No iOS e no Android ocupa a tela toda.

## 12. Imagens e ilustrações

- **A interface é código, nunca imagem de tela.** Texto, botões e cartões nunca viram PNG.
- **Ícone do app:** tile menta em degradê (`colors.brand.tile` para `colors.brand.tileEnd`) com o símbolo em `colors.brand.glyph`, 1024 por 1024 (`assets/images/icon.png`). Android adaptativo: `android-icon-foreground/background/monochrome.png`, 1024 por 1024; o símbolo deve ficar dentro dos 66% centrais (regra do Android para o recorte do launcher).
- **Abertura (splash):** `splash-icon.png` (`imageWidth: 160`) sobre `colors.brand.tile`. **Notificação do Android:** `notification-icon.png` (96 por 96) tingido com `colors.action.primary`. **Web:** `public/favicon.svg`, `public/icons/*` (PWA 192, 512 e maskable) e o manifesto com o fundo `colors.bg.page`.
- As cores de marca que vivem em JSON e SVG (que não importam tokens) são conferidas por `src/design/__tests__/marca.test.ts`.
- **Fotos e ilustrações novas:** nunca esticar (`contentFit="cover"` ou `"contain"`); `accessibilityLabel` quando informam, escondidas do leitor de tela quando decorativas; alvo de menos de 200 KB, em WebP ou PNG. O pino 3D e o fundo de folhagem do onboarding (`../lembreiAI/ref/1.png`, recortes de `tools/build-assets.py`) ainda não foram portados (seção 19).
- **Mapa:** tiles do OpenStreetMap com a atribuição sempre visível (é obrigatória). O halo do raio usa a cor da categoria com transparência.

## 13. Animações e transições

Filosofia: o mínimo. O feedback de toque é instantâneo (troca de cor e escala `motion.pressedScale`, sem animar); a navegação usa o padrão de cada plataforma; a folha do mapa entra em `slide`.

<!-- tokens:movimento:inicio -->
| Token | Valor | Uso |
|---|---|---|
| `motion.duration.fast` | `120` | Feedback de toque (ms) |
| `motion.duration.base` | `200` | Troca de estado (ms) |
| `motion.duration.slow` | `300` | Entrada de folhas e modais (ms) |
| `motion.pressedScale` | `0.98` | Escala do botão pressionado |
<!-- tokens:movimento:fim -->

<!-- tokens:opacidade:inicio -->
| Token | Valor | Uso |
|---|---|---|
| `opacity.disabled` | `0.45` | Controle desabilitado |
| `opacity.inactive` | `0.55` | Cartão de lembrete pausado |
| `opacity.pressed` | `0.85` | Toque em elementos que não trocam de cor |
<!-- tokens:opacidade:fim -->

- Toda animação nova respeita "reduzir movimento" (`AccessibilityInfo.isReduceMotionEnabled()`). Hoje só existem as do sistema.
- Nada que pisque ou se repita sem fim (o spinner de carregamento é a exceção); `motion.duration.*` são os tempos de referência para o que vier.

## 14. Responsividade

| Largura da janela | Comportamento |
|---|---|
| Celular (menos de `layout.columnMax`) | Tela toda; margem lateral `space.lg`; abas embaixo |
| Tablet e computador (a partir de `layout.columnMax`, na web) | Coluna de `layout.columnMax` centralizada sobre o palco `colors.bg.stage`, com sombra; abas e cabeçalho ficam dentro da coluna |

<!-- tokens:tamanhos:inicio -->
| Token | Valor | Uso |
|---|---|---|
| `size.touch` | `44` | Área mínima de toque (44, o padrão do iOS) |
| `size.button` | `52` | Altura dos botões |
| `size.tabBar` | `56` | Altura útil da barra de abas (a área segura do sistema é somada por cima) |
| `size.iconCircle` | `44` | Círculo do ícone de categoria |
| `size.emptyCircle` | `88` | Círculo do ícone do estado vazio |
| `size.chip` | `36` | Altura visível do chip (a área de toque chega a 44 com `size.hitSlop`) |
| `size.closeButton` | `32` | Botão de fechar visível (a área de toque chega a 44 com `size.hitSlop`) |
| `size.hitSlop` | `6` | Folga de toque ao redor de controles menores que 44 |
| `size.icon.sm` | `16` | Ícones ao lado de texto pequeno |
| `size.icon.md` | `20` | Ícones de ação |
| `size.icon.lg` | `24` | Ícones de aba |
| `size.icon.xl` | `40` | Ícone do estado vazio |
| `layout.columnMax` | `560` | Largura máxima da coluna do app na web; no celular a coluna é a tela toda |
| `layout.readingMax` | `720` | Largura máxima de texto corrido (política de privacidade) |
<!-- tokens:tamanhos:fim -->

- Texto corrido (política de privacidade) tem no máximo `layout.readingMax` de largura.
- **Não há layout de duas colunas:** as referências só têm celular, o iPad não é alvo (`supportsTablet: false`) e tablets Android usam a mesma coluna cheia.
- Conferido em 375 por 812 (celular), 768 por 1024 (tablet) e 1280 por 800 (computador).
- Áreas seguras (entalhe, barra de gestos): quem cuida é o `react-native-safe-area-context` via `Tabs` e `Stack`; a folha do mapa tem `space.xxl` embaixo.
- Com fonte grande no sistema, o texto quebra de linha; `numberOfLines` só onde as reticências são aceitáveis (título do cartão).

## 15. Estados de carregamento, vazio, sucesso e erro

| Estado | Como aparece |
|---|---|
| Carregando a tela | `ActivityIndicator` grande em `colors.spinner`, centralizado, com "Carregando…" em `textStyles.bodyLg` e `colors.text.secondary`. Só quando não há dado antigo para mostrar; havendo, use puxar para atualizar |
| Carregando uma ação | Botão desabilitado com o rótulo no gerúndio ("Criando…"); o formulário fica bloqueado |
| Vazio | Círculo `colors.feedback.emptyCircle` com o ícone `vazio`, título `textStyles.title`, uma frase de orientação e o botão primário ("Criar lembrete") |
| Sucesso | `Banner` `success` no topo do formulário seguinte, ou a mudança visível na lista. Sem modal de "deu certo" |
| Erro da tela | `Banner` `error` com o botão "Tentar novamente" (`ghost`) |
| Erro de campo | Borda e mensagem do campo (seção 10) |
| Informativo | `Banner` `info` ("Você está dentro do raio de 1 lembrete") |

- Toda mensagem de erro diz **o que houve e o que fazer**; nunca só "Erro".
- Cartão pausado e campo desabilitado usam opacidade e cor de texto secundária, não somem.

## 16. Acessibilidade e contraste

### 16.1 Contraste medido (WCAG 2.x)

Cada par é testado em `src/design/__tests__/acessibilidade.test.ts`. Par novo entra em `src/design/a11y.ts`; sem isso a tabela não o cobre.

<!-- tokens:contraste:inicio -->
| Frente | Fundo | Razão | Mínimo | Situação | Onde |
|---|---|---|---|---|---|
| `colors.text.primary` | `colors.bg.page` | 17,73:1 | 7:1 | ✓ | Texto principal nas telas |
| `colors.text.primary` | `colors.bg.card` | 18,80:1 | 7:1 | ✓ | Texto principal nos cartões |
| `colors.text.primary` | `colors.bg.field` | 19,80:1 | 7:1 | ✓ | Texto digitado nos campos |
| `colors.text.primary` | `colors.feedback.infoBg` | 15,71:1 | 4,5:1 | ✓ | Texto em avisos informativos |
| `colors.text.primary` | `colors.feedback.successBg` | 17,48:1 | 4,5:1 | ✓ | Texto em avisos de sucesso |
| `colors.icon.default` | `colors.bg.page` | 17,73:1 | 4,5:1 | ✓ | Ícones em tinta principal |
| `colors.text.secondary` | `colors.bg.page` | 5,89:1 | 4,5:1 | ✓ | Subtítulos, dicas e metadados nas telas |
| `colors.text.secondary` | `colors.bg.card` | 6,24:1 | 4,5:1 | ✓ | Metadados nos cartões |
| `colors.text.secondary` | `colors.bg.field` | 6,57:1 | 4,5:1 | ✓ | Dicas dentro de painéis brancos |
| `colors.text.secondary` | `colors.feedback.infoBg` | 5,22:1 | 4,5:1 | ✓ | Texto de apoio em avisos informativos |
| `colors.text.secondary` | `colors.feedback.successBg` | 5,80:1 | 4,5:1 | ✓ | Texto de apoio da tela "Confira seu e-mail" |
| `colors.text.placeholder` | `colors.bg.field` | 5,10:1 | 4,5:1 | ✓ | Placeholder dos campos |
| `colors.text.accent` | `colors.bg.page` | 5,96:1 | 4,5:1 | ✓ | Valores em destaque nas telas |
| `colors.text.accent` | `colors.bg.card` | 6,33:1 | 4,5:1 | ✓ | Valores em destaque nos cartões |
| `colors.text.accent` | `colors.bg.field` | 6,66:1 | 4,5:1 | ✓ | Valores em destaque em painéis brancos |
| `colors.text.accent` | `colors.feedback.infoBg` | 5,28:1 | 4,5:1 | ✓ | Destaque em avisos informativos |
| `colors.text.brand` | `colors.bg.card` | 12,28:1 | 4,5:1 | ✓ | Rótulo da aba ativa |
| `colors.text.onAction` | `colors.action.primary` | 3,24:1 | 3:1 | ✓ exceção | Rótulo do botão primário |
| `colors.text.onAction` | `colors.action.primaryHover` | 3,63:1 | 3:1 | ✓ exceção | Botão primário com o ponteiro em cima (web) |
| `colors.text.onAction` | `colors.action.primaryPressed` | 4,10:1 | 3:1 | ✓ exceção | Botão primário pressionado |
| `colors.text.onAction` | `colors.action.primaryAA` | 4,70:1 | 4,5:1 | ✓ | Alternativa AA do botão primário |
| `colors.text.onDark` | `colors.action.secondary` | 11,02:1 | 4,5:1 | ✓ | Rótulo do botão escuro |
| `colors.text.onDark` | `colors.action.secondaryHover` | 12,66:1 | 4,5:1 | ✓ | Botão escuro com o ponteiro em cima (web) |
| `colors.text.onDark` | `colors.action.secondaryPressed` | 14,04:1 | 4,5:1 | ✓ | Botão escuro pressionado |
| `colors.text.onDark` | `colors.control.chipOn` | 11,23:1 | 4,5:1 | ✓ | Chip de filtro ativo |
| `colors.text.danger` | `colors.bg.page` | 5,03:1 | 4,5:1 | ✓ | Erro solto na tela |
| `colors.text.danger` | `colors.bg.card` | 5,34:1 | 4,5:1 | ✓ | Erro em cartão |
| `colors.text.danger` | `colors.bg.field` | 5,62:1 | 4,5:1 | ✓ | Erro em painel branco e mensagem de campo |
| `colors.text.danger` | `colors.feedback.dangerBg` | 4,74:1 | 4,5:1 | ✓ | Aviso de erro |
| `colors.text.danger` | `colors.feedback.dangerWash` | 5,26:1 | 4,5:1 | ✓ | Zona de perigo |
| `colors.text.success` | `colors.feedback.successBg` | 4,80:1 | 4,5:1 | ✓ | Aviso de sucesso e selo "Liberada" |
| `colors.text.success` | `colors.bg.field` | 5,44:1 | 4,5:1 | ✓ | Sucesso em painel branco |
| `colors.text.success` | `colors.bg.page` | 4,87:1 | 4,5:1 | ✓ | Sucesso solto na tela |
| `colors.icon.muted` | `colors.bg.card` | 4,18:1 | 3:1 | ✓ exceção | Ícone da aba inativa |
| `colors.icon.muted` | `colors.bg.page` | 3,94:1 | 3:1 | ✓ exceção | Ícones secundários nas telas |
| `colors.border.focus` | `colors.bg.field` | 7,86:1 | 3:1 | ✓ exceção | Borda de foco do campo |
| `colors.border.focus` | `colors.bg.page` | 7,04:1 | 3:1 | ✓ exceção | Anel de foco sobre a página |
| `colors.control.on` | `colors.bg.card` | 6,20:1 | 3:1 | ✓ exceção | Interruptor ligado |
| `colors.control.thumb` | `colors.control.on` | 6,53:1 | 3:1 | ✓ exceção | Bolinha do interruptor sobre o trilho ligado |
| `colors.feedback.infoBar` | `colors.feedback.infoBg` | 6,24:1 | 3:1 | ✓ exceção | Faixa lateral do aviso informativo |
| `colors.category.green.ink` | `colors.category.green.bg` | 14,61:1 | 3:1 | ✓ exceção | Glifo do ícone da categoria green |
| `colors.category.orange.ink` | `colors.category.orange.bg` | 16,47:1 | 3:1 | ✓ exceção | Glifo do ícone da categoria orange |
| `colors.category.blue.ink` | `colors.category.blue.bg` | 7,89:1 | 3:1 | ✓ exceção | Glifo do ícone da categoria blue |
| `colors.category.purple.ink` | `colors.category.purple.bg` | 15,42:1 | 3:1 | ✓ exceção | Glifo do ícone da categoria purple |
| `colors.category.pink.ink` | `colors.category.pink.bg` | 16,23:1 | 3:1 | ✓ exceção | Glifo do ícone da categoria pink |
| `colors.category.green.pin` | `colors.bg.field` | 3,41:1 | 3:1 | ✓ exceção | Marcador da categoria green sobre o mapa claro |
| `colors.category.orange.pin` | `colors.bg.field` | 3,24:1 | 3:1 | ✓ exceção | Marcador da categoria orange sobre o mapa claro |
| `colors.category.blue.pin` | `colors.bg.field` | 3,87:1 | 3:1 | ✓ exceção | Marcador da categoria blue sobre o mapa claro |
| `colors.category.purple.pin` | `colors.bg.field` | 5,70:1 | 3:1 | ✓ exceção | Marcador da categoria purple sobre o mapa claro |
| `colors.category.pink.pin` | `colors.bg.field` | 3,96:1 | 3:1 | ✓ exceção | Marcador da categoria pink sobre o mapa claro |
| `colors.map.me` | `colors.bg.field` | 3,87:1 | 3:1 | ✓ exceção | Posição da pessoa sobre o mapa claro |
| `colors.map.paused` | `colors.bg.field` | 3,58:1 | 3:1 | ✓ exceção | Marcador de lembrete pausado sobre o mapa claro |

- **Exceção:** Exceção conhecida: o laranja da marca (aprovado nas referências) dá menos de 4,5:1 com texto branco. Só passa como texto grande ou componente. Mitigação: rótulo 16/700 em botão de 52 de altura; alternativa AA pronta em `colors.action.primaryAA`.
- **Exceção:** Componente de interface ou ícone sem texto: o mínimo do WCAG 1.4.11 é 3:1.
<!-- tokens:contraste:fim -->

### 16.2 Regras

- **Texto normal, no mínimo 4,5:1; texto grande** (24 px, ou 18,7 px em negrito) **e componentes de interface, no mínimo 3:1.**
- **Exceção conhecida: o laranja da marca.** Branco sobre `colors.action.primary` dá 3,24:1: só passa como texto grande ou componente. O laranja foi aprovado nas referências, então fica; mitiga-se com rótulo 16/700 em botão de 52 de altura. Se a marca precisar cumprir AA, troque `colors.action.primary` por `colors.action.primaryAA` (4,7:1).
- **Exceção conhecida: borda de campo suave** (1,2:1) das referências. O foco (7:1) e o rótulo sempre visível compensam.
- **Alvos de toque de no mínimo 44** (`size.touch`). Controle visualmente menor usa `hitSlop` de `size.hitSlop`.
- **Todo controle tem papel e nome:** `accessibilityRole`, `accessibilityLabel` e `accessibilityState` (`selected`, `disabled`).
- **Foco visível** no teclado (web) em todo controle: o mesmo anel sólido de `borderWidth.focus` em `colors.border.focus`, afastado `space.hair` (`src/design/foco.ts`), em botão, chip, opção do segmentado, lixeira do cartão e fechar da folha. O campo de texto desenha o foco só pela borda e pelo halo `shadow.focus`, sem o contorno do navegador.
- **Não depender só da cor:** erro tem texto, categoria tem ícone, interruptor tem posição.
- **Texto redimensionável:** não travar `allowFontScaling`; layouts quebram linha em vez de cortar.
- **Idioma** `pt-BR` (`<html lang>` em `app/+html.tsx`).
- **Não verificado nesta rodada:** leitura com VoiceOver e TalkBack em aparelho real e navegação completa por teclado na web.

## 17. Conformidade do app com este padrão

| Elemento | Padrão | Situação |
|---|---|---|
| Tokens e testes (`src/design`) | seções 3 a 7 | aplicado |
| Botão, campo, chip, segmentado, interruptor e aviso (componentes) | seções 9 a 11 | aplicado nos componentes; as telas ainda usam estilo próprio em parte (ver `PENDENTES`) |
| Cartão de lembrete e ícones | seções 8 e 11.1 | aplicado |
| Lista de lembretes e novo lembrete (telas) | seções 9 a 11, 15 | aplicado |
| Abas, cabeçalho e coluna da web | seções 11.6 e 11.7 | aplicado |
| Mapa (com a folha do marcador) e configurações (telas) | todas | aplicado |
| Telas de conta (entrar, criar conta, esqueci e redefinir senha) e páginas públicas | todas | aplicado |
| Famílias tipográficas da marca | seção 4.1 | pendente (seção 19) |

O teste `valores-soltos.test.ts` mantém uma lista de arquivos com valores visuais soltos (`PENDENTES`); ela só encolhe e chega a zero quando o app inteiro usa tokens.

## 18. Registro de decisões

| Data | Decisão | Motivo |
|---|---|---|
| 20/09/2026 | Ponto de recuperação 01 (tag `ponto-de-recuperacao/01-antes-do-design-system`), depois de 5 commits do app inteiro | O app real nunca tinha sido commitado (só o template do Expo estava no Git) |
| 21/09/2026 | Tokens em `src/design/tokens.ts`; tabelas deste documento geradas deles | Documento e código não divergirem; valor solto vira erro de teste |
| 21/09/2026 | Paleta igual à do app web (medida nas referências, variante B) | Uma identidade só nos dois apps |
| 21/09/2026 | Texto secundário de `#767880` para `#5B5D64` (`colors.text.secondary`) | O cinza das referências dá 4,4:1 no branco e 3,9:1 no fundo da página, abaixo dos 4,5:1 do WCAG |
| 21/09/2026 | Placeholder de `#85858F` para `#6B6E76` | 3,6:1 no branco não atinge 4,5:1 |
| 21/09/2026 | Laranja nunca é cor de texto; destaque em texto usa `#086952` | Laranja sobre creme dá 2,9:1 |
| 21/09/2026 | Foco do campo passa de laranja para verde-floresta (`colors.border.focus`) | Segue o estado de foco definido no app web; 7:1 |
| 21/09/2026 | Erro de `#FF4444` para `#C62828`; o campo com erro não pinta o fundo | `#FF4444` dá 3,4:1 no branco e 2,9:1 no rosa do aviso |
| 21/09/2026 | Aviso informativo azul (`#E6F3FF` e `#0066CC`) passa para verde-menta | Azul estava fora da paleta da marca |
| 21/09/2026 | Laranja da marca mantido no botão primário (3,24:1), com `primaryAA` como alternativa pronta | Aprovado nas referências; trocar a marca é decisão do produto |
| 21/09/2026 | Borda de campo suave mantida (1,2:1) | É a identidade das referências; o foco reforça |
| 21/09/2026 | Piso de 12 para texto, tamanhos fixos em vez de proporcionais à largura | O app web chegou a 6 px por escalar tudo pela largura |
| 21/09/2026 | Ícones: Ionicons em contorno no lugar de emoji | Emoji muda por sistema e não aceita cor; o Ionicons já era usado nas abas |
| 21/09/2026 | Botões em pílula de 52 de altura, rótulo 16/700, brilho no primário e estados (ponteiro, pressionado, foco, desabilitado) | Iguais às referências (`2.png`, `4.png`) e aos estados definidos no app web; alvo de toque de pelo menos 44 |
| 21/09/2026 | Cartão de lembrete: superfície creme com faixa da categoria, círculo com ícone de contorno e sombra suave; chip selecionado em verde-floresta (antes laranja) | Igual à lista de referência (`5.png`); o laranja fica só para a ação |
| 21/09/2026 | Emoji removido dos textos da interface ("📍 Você está dentro…", "📍 Usar minha localização", "✓ Local definido", "✕"): ícone Ionicons onde faz falta | Emoji muda por sistema e não aceita cor; o texto continua dizendo tudo |
| 21/09/2026 | Barra de abas com altura própria (`size.tabBar` mais a área segura) | Na web o rótulo de 12 era cortado pela caixa de 10 px do React Navigation; a medida no navegador mostrou o corte e a correção |
| 21/09/2026 | Nome da marca na interface: "LembreiAi" (as telas de entrada e de cadastro escreviam "lembreiAI") | O app web fixou o nome em "LembreiAi" em todo lugar |
| 21/09/2026 | Telas de conta ganham uma base compartilhada (`AuthLayout`) e os botões empilhados ficam a `space.md` uns dos outros | Quatro telas repetiam o mesmo cabeçalho e o botão principal ficava colado no secundário |
| 21/09/2026 | Texto das páginas públicas de 15 para 16 e em tinta principal (era o cinza `#2B2D31`) | Leitura confortável e um cinza a menos fora dos tokens |
| 21/09/2026 | Foco de teclado com um anel só (verde-floresta, 2, afastado 2) e controle segmentado virou componente | A conferência no navegador mostrou o anel âmbar do navegador em chip e segmentado e um contorno duplicado no campo |
| 21/09/2026 | Sombras por `boxShadow` em texto | Único caminho igual em iOS, Android e web na New Architecture |
| 21/09/2026 | Fontes da marca não carregadas nesta versão (**revogada na linha seguinte**) | Exigia mexer na abertura do app e na renderização estática da web; a doc do Expo depois esclareceu a renderização estática |
| 21/09/2026 | **Fontes da marca carregadas:** Nunito Sans (400, 500, 600 e 700) e Source Serif 4 (700) em todo o texto; títulos, seções e título do cartão em serifa; o token `fontWeight` deixou de existir | O João apontou a fonte como parte do que veio errado, e o app web usa as duas famílias. Fonte própria ignora `fontWeight` no iOS e no Android, então cada peso é uma família. Doc do Expo: "Expo Font has automatic static optimization" na renderização estática; `useFonts` no servidor devolve `true` |
| 21/09/2026 | Na web a fonte nunca bloqueia a renderização e leva uma pilha de reserva do sistema; iOS e Android seguram a abertura até as fontes chegarem | O HTML estático das páginas públicas precisa sair com texto; sem a reserva o navegador cairia em Times até a fonte chegar |

## 19. Pendências

- **Corte óptico do Source Serif 4:** os pacotes trazem um corte por peso. Comparar os títulos grandes com as referências (o app web fixa `opsz` por estilo); se destoarem, gerar instâncias estáticas com o corte de título.
- **Peso das fontes na web:** cada arquivo `.ttf` tem 110 KB (Nunito Sans) e 322 KB (Source Serif 4). Um subconjunto latino em `woff2` reduziria, se o carregamento incomodar.
- **Telas das referências ainda não portadas:** onboarding (`ref/1.png`), sucesso do lembrete (`ref/4.png`), cabeçalho verde da lista com filtros e "Dica para você" (`ref/5.png`), seletores de data e hora (`ref/2.png`; hoje são campos de texto).
- **Leitura com VoiceOver e TalkBack** e **navegação por teclado** na web: verificar em aparelho real.
- **Modo escuro:** fora de escopo até haver referência.
- **Layout de tablet nativo:** não desenhado (só existe referência de celular).
