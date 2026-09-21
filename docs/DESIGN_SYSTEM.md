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
| [`referencias/`](referencias/INDICE.md): 15 imagens, e [`referencias/MEDICOES.md`](referencias/MEDICOES.md) | **Fonte de verdade visual:** as páginas do app web em capturas de 430 px (retina), copiadas por inteiro da pasta do João, e a medição de cor contra os tokens. Onde este documento divergir delas, **valem as imagens**. |
| `../lembreiAI/DESIGN_SYSTEM.md` e `../lembreiAI/ref/` | A medição por pixel do app web e as referências antigas (`2.png`, `4.png` e `5.png`), superadas pelas capturas. |
| `../lembreiAI/src/styles/tokens.css` | Os valores que o app web de fato usa (nomes de cor iguais: `forest`, `mint`, `orange`, `cream`, `ink`). |
| O app Expo antes deste sistema (tag de recuperação) | O que já existia e foi preservado: rotas, textos, regras e funções. Nada disso mudou. |
| Este documento | As decisões novas: acessibilidade, adaptação ao React Native e o que as referências não mostram. |

### 2.2 Princípios

1. **Calmo e legível.** Fundo creme, bastante espaço, sombras quase imperceptíveis. Nada se mexe sem motivo.
2. **Verde é a marca; laranja é a ação.** Verde-floresta para identidade, seleção e foco. O laranja aparece só no botão primário (e no marcador da categoria laranja).
3. **Só claro.** As referências não têm modo escuro (`userInterfaceStyle: light`). Modo escuro pede tokens novos e novo aceite.
4. **Acessível antes de fiel.** Quando uma referência falha no contraste, o app corrige e o registro de decisões (seção 18) explica. Exceção só por escrito.
5. **Uma decisão, um lugar.** Componente compartilhado antes de estilo novo; token antes de valor solto.

### 2.3 As telas de referência

Cada tela e cada folha do app tem uma imagem em `referencias/`. O estado do Expo é o de 21/09/2026, conferido por captura de tela e leitura do código. A barra de abas das imagens é **Início, Lembretes, Mapa e Configurações** (o Início abre o onboarding, a rota `/` do app web); "Novo lembrete" abre pelo botão laranja da lista. O Expo hoje tem Início, Lembretes, Novo, Mapa e Config (a barra de abas ainda não foi refeita).

| Imagem | Tela | Estado no Expo |
|---|---|---|
| [`01`](referencias/01-onboarding.png) | Onboarding | Feito (`Onboarding`, aba Início e primeira tela do visitante); ver 11.10 |
| [`02`](referencias/02-entrar.png) | Entrar | Existe; falta o fundo de curvas de nível, o cartão creme flutuante, o painel de vidro "Criar conta" e o olho da senha |
| [`03`](referencias/03-recorte-degrade-do-formulario.png) | Recorte do degradê do formulário | Amostra de cor (usada nas medições) |
| [`04`](referencias/04-novo-lembrete-por-data-e-horario.png) | Novo lembrete, por data e horário | Existe como formulário simples de campos de texto; faltam cabeçalho em degradê, voltar e conta, cartões de modo, seletores de data e horário e a folha Repetir |
| [`05`](referencias/05-folha-minha-conta.png) | Folha "Minha conta" | Não existe (Sair fica em Configurações) |
| [`06`](referencias/06-novo-lembrete-por-local.png) | Novo lembrete, por local | Sem busca nem mapa no formulário (o mapa é uma aba à parte) |
| [`07`](referencias/07-lista-meus-lembretes.png) | Meus lembretes | Feito (11.9); o menu "⋯" só tem Excluir até o formulário saber editar |
| [`08`](referencias/08-configuracoes.png) | Configurações | Existe com estrutura mais simples; faltam cabeçalho verde, cartões com ícone e "Até onde vai o monitoramento" |
| [`09`](referencias/09-sucesso-lembrete-criado.png) | Lembrete criado | Não existe |
| [`10`](referencias/10-confirmar-exclusao.png) | Confirmar exclusão | Feito na lista (`ConfirmSheet`); volta na tela de sucesso |
| [`11`](referencias/11-folha-menu-do-lembrete.png) | Menu do lembrete | Feito (`ReminderMenu`); a linha Editar entra com o formulário |
| [`12`](referencias/12-seletor-de-data.png) | Seletor de data | É o popup do navegador, não um desenho: o Expo precisa de um calendário próprio (decisão pendente) |
| [`13`](referencias/13-folha-horario.png) | Folha Horário | Não existe (campo de texto HH:MM) |
| [`14`](referencias/14-folha-repetir.png) | Folha Repetir | Não existe (chips de repetição) |
| [`15`](referencias/15-novo-lembrete-por-local-repetindo.png) | Novo lembrete, por local, repetindo | Igual à `06`, com Repetir em destaque verde |

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
| `palette.forest600` | `#216955` | Preenchimento do controle deslizante do raio |
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
| `palette.forest950` | `#0D2A1B` | Palco escuro atrás da coluna do app na web, como no app original |
| `palette.forestPin` | `#054C39` | Pino do mapa no formulário de novo lembrete |
| `palette.headerTop` | `#2A5B47` | Degradê verde dos cabeçalhos e das telas de conta: topo |
| `palette.headerMid` | `#184434` | Degradê verde dos cabeçalhos e das telas de conta: meio |
| `palette.headerBottom` | `#0E301F` | Degradê verde dos cabeçalhos e das telas de conta: base |
| `palette.mist300` | `#CBE4D6` | Degradê claro do cabeçalho do formulário: topo |
| `palette.mist100` | `#E3EEE5` | Degradê claro do cabeçalho do formulário: meio |
| `palette.mint200` | `#C6E4D5` | Contorno da faixa de seleção do horário |
| `palette.mint400` | `#7FEAC6` | Anel de foco sobre fundo escuro |
| `palette.toggleCardOn` | `#2EA275` | Interruptor ligado no cartão de lembrete (o verde da imagem, #30AB7B, escurecido 5% para 3:1 com o cartão) |
| `palette.toggleThumb` | `#FBFBFA` | Bolinha do interruptor |
| `palette.toggleFormOn` | `#256855` | Interruptor ligado nos formulários e nas configurações |
| `palette.frost` | `#E3E7DC` | Botão translúcido (ações do sucesso e Cancelar) |
| `palette.frostHover` | `#D9DECF` | Botão translúcido com o ponteiro em cima (web) |
| `palette.frostPressed` | `#CFD5C4` | Botão translúcido pressionado |
| `palette.frostInk` | `#1A2C23` | Texto dos botões translúcidos |
| `palette.danger` | `#D43A2A` | Botão de perigo (Excluir lembrete) |
| `palette.dangerHover` | `#C63424` | Botão de perigo com o ponteiro em cima (web) |
| `palette.dangerPressed` | `#B92F20` | Botão de perigo pressionado |
| `palette.sheet` | `#EFF0EA` | Folha de cantos altos da lista e das configurações |
| `palette.alertErrorBg` | `#FDF0EE` | Fundo do aviso de erro nas configurações |
| `palette.alertErrorInk` | `#8E2418` | Texto do aviso de erro nas configurações |
| `palette.alertInfoInk` | `#1B4436` | Texto do aviso informativo |
| `palette.statusGreen` | `#029554` | Ponto do selo "Ativo" |
| `palette.onDark100` | `#FDFAF6` | Texto sobre verde escuro: título |
| `palette.onDark200` | `#CCD8D0` | Texto sobre verde escuro: subtítulo |
| `palette.onDark300` | `#B1C3B8` | Texto sobre verde escuro: apoio |
| `palette.onDark400` | `#A7B9B0` | Texto sobre verde escuro: o mais suave |
| `palette.headerSubtitle` | `#E6EDE5` | Subtítulo dos cabeçalhos verdes ("5 lembretes ativos") |
| `palette.chipCount` | `#395D56` | Contagem dentro do chip de filtro não selecionado |
| `palette.tipCircle` | `#C3DFCE` | Círculo atrás da lâmpada do cartão de dica |
| `palette.tipInk` | `#013220` | Lâmpada do cartão de dica |
| `palette.tipText` | `#375C50` | Texto do cartão de dica |
| `palette.iconDots` | `#717B88` | Reticências "mais opções" do cartão de lembrete |
| `palette.iconRadius` | `#8B93A0` | Ícone do raio no cartão de lembrete por local |
| `palette.mint300` | `#94F9CD` | Destaque do título do Onboarding ("de tudo!") |
| `palette.mintIcon` | `#6FF0C4` | Ícones dos balões do Onboarding |
| `palette.onboardingBg` | `#12301F` | Fundo do Onboarding enquanto a foto carrega |
| `palette.pagerOn` | `#F8F9F9` | Ponto da página ativa do Onboarding |
| `palette.rowHover` | `#F7F8F4` | Linha de menu com o ponteiro em cima (web) |
| `palette.rowPressed` | `#EEF1EA` | Linha de menu pressionada |
| `palette.dangerTint` | `#FBE7E4` | Círculo do ícone de excluir e linha de excluir pressionada |
| `palette.dangerRowHover` | `#FDF3F1` | Linha de excluir com o ponteiro em cima (web) |
| `palette.tabInactive` | `#777C8A` | Rótulo e ícone da aba inativa (medido nas capturas) |
| `palette.homeIndicator` | `#B7B3AE` | Traço "home" do iOS sob a barra de abas |
| `palette.tabBarBg` | `#F8F8F4` | Fundo da barra de abas |
<!-- tokens:cores-primitivas:fim -->

### 3.2 Papéis

<!-- tokens:cores-semanticas:inicio -->
| Token | Valor | Vem da paleta | Uso |
|---|---|---|---|
| `colors.bg.page` | `#F5F2ED` | `palette.cream200` | Fundo de todas as telas |
| `colors.bg.stage` | `#0D2A1B` | `palette.forest950` | Palco atrás da coluna do app na web (tablet e computador) |
| `colors.bg.card` | `#FAF9F6` | `palette.cream100` | Superfície de cartões e da barra de abas |
| `colors.bg.field` | `#FFFFFF` | `palette.white` | Campos de formulário, painéis e folhas |
| `colors.bg.disabled` | `#F5F2ED` | `palette.cream200` | Campo desabilitado |
| `colors.bg.sheet` | `#EFF0EA` | `palette.sheet` | Folha de cantos altos da lista e das configurações |
| `colors.bg.iconCircle` | `#DBF1E5` | `palette.mint100` | Círculo atrás do ícone das linhas de menu (Editar, Alterar senha) |
| `colors.text.primary` | `#0A0A0A` | `palette.ink900` | Texto principal e títulos |
| `colors.text.secondary` | `#5B5D64` | `palette.ink700` | Subtítulos, dicas e metadados |
| `colors.text.placeholder` | `#6B6E76` | `palette.ink650` | Texto de exemplo dentro de campos vazios |
| `colors.text.accent` | `#086952` | `palette.textAccent` | Valor em destaque dentro do texto (raio, contagens, e-mail da conta) |
| `colors.text.brand` | `#0A3924` | `palette.inkBrand` | Rótulo da aba ativa |
| `colors.text.onAction` | `#FFFFFF` | `palette.white` | Rótulo sobre o botão primário |
| `colors.text.onDark` | `#FFFFFF` | `palette.white` | Rótulo sobre fundo escuro (botão escuro, chip selecionado) |
| `colors.text.onDarkWarm` | `#FDFAF6` | `palette.onDark100` | Título sobre verde escuro |
| `colors.text.onDarkSoft` | `#CCD8D0` | `palette.onDark200` | Subtítulo sobre verde escuro |
| `colors.text.onDarkMuted` | `#B1C3B8` | `palette.onDark300` | Texto de apoio sobre verde escuro |
| `colors.text.onDarkFaint` | `#A7B9B0` | `palette.onDark400` | Texto mais suave sobre verde escuro |
| `colors.text.onFrost` | `#1A2C23` | `palette.frostInk` | Rótulo dos botões translúcidos |
| `colors.text.onHeader` | `#E6EDE5` | `palette.headerSubtitle` | Subtítulo sobre o cabeçalho verde |
| `colors.text.chip` | `#12432F` | `palette.forest900` | Rótulo do chip de filtro não selecionado |
| `colors.text.onDarkAccent` | `#94F9CD` | `palette.mint300` | Destaque do título do Onboarding ("de tudo!") |
| `colors.text.brandAccent` | `#7FEAC6` | `palette.mint400` | Letras "Ai" do nome da marca no Onboarding |
| `colors.text.chipCount` | `#395D56` | `palette.chipCount` | Contagem dentro do chip de filtro não selecionado |
| `colors.text.tip` | `#375C50` | `palette.tipText` | Texto do cartão de dica |
| `colors.text.danger` | `#C62828` | `palette.red700` | Mensagens e rótulos de erro |
| `colors.text.success` | `#0B7A3B` | `palette.green700` | Mensagens e rótulos de sucesso |
| `colors.icon.default` | `#0A0A0A` | `palette.ink900` | Ícones sobre fundo claro |
| `colors.icon.muted` | `#767880` | `palette.ink600` | Ícones secundários e da aba inativa (nunca para texto) |
| `colors.icon.dots` | `#717B88` | `palette.iconDots` | Reticências "mais opções" do cartão de lembrete |
| `colors.icon.onDarkMint` | `#6FF0C4` | `palette.mintIcon` | Ícones dos balões do Onboarding |
| `colors.icon.radius` | `#8B93A0` | `palette.iconRadius` | Ícone do raio no cartão de lembrete por local |
| `colors.icon.tip` | `#013220` | `palette.tipInk` | Lâmpada do cartão de dica |
| `colors.action.primary` | `#FE532A` | `palette.orange500` | Fundo do botão primário |
| `colors.action.primaryHover` | `#EF4E28` | `palette.orangeHover` | Botão primário com o ponteiro em cima (web) |
| `colors.action.primaryPressed` | `#DF4925` | `palette.orangePressed` | Botão primário pressionado |
| `colors.action.primaryAA` | `#D53B14` | `palette.orangeAA` | Alternativa do botão primário que cumpre 4,5:1 com texto branco |
| `colors.action.secondary` | `#254233` | `palette.forest800` | Fundo do botão escuro (secundário) |
| `colors.action.secondaryHover` | `#1F382B` | `palette.forestHover` | Botão escuro com o ponteiro em cima (web) |
| `colors.action.secondaryPressed` | `#1B3025` | `palette.forestPressed` | Botão escuro pressionado |
| `colors.action.danger` | `#D43A2A` | `palette.danger` | Fundo do botão de perigo |
| `colors.action.dangerHover` | `#C63424` | `palette.dangerHover` | Botão de perigo com o ponteiro em cima (web) |
| `colors.action.dangerPressed` | `#B92F20` | `palette.dangerPressed` | Botão de perigo pressionado |
| `colors.action.frost` | `#E3E7DC` | `palette.frost` | Fundo dos botões translúcidos |
| `colors.action.frostHover` | `#D9DECF` | `palette.frostHover` | Botão translúcido com o ponteiro em cima (web) |
| `colors.action.frostPressed` | `#CFD5C4` | `palette.frostPressed` | Botão translúcido pressionado |
| `colors.border.field` | `#E7E8EA` | `palette.borderSubtle` | Borda de campos de formulário |
| `colors.border.strong` | `#B9B8BB` | `palette.borderStrong` | Contorno do botão sem fundo (ghost) |
| `colors.border.divider` | `#E8E7E6` | `palette.divider` | Divisórias |
| `colors.border.chip` | `#DFE1DB` | `palette.chipRing` | Contorno do chip não selecionado |
| `colors.border.focus` | `#185C4B` | `palette.forest700` | Borda do campo em foco e anel de foco |
| `colors.border.focusOnDark` | `#7FEAC6` | `palette.mint400` | Anel de foco e borda do campo em foco sobre o verde escuro |
| `colors.border.danger` | `#C62828` | `palette.red700` | Borda do campo com erro e do botão de exclusão |
| `colors.border.dangerSoft` | `#F3B8B8` | `palette.red200` | Borda da zona de perigo |
| `colors.control.on` | `#216955` | `palette.forest600` | Preenchimento do controle deslizante do raio |
| `colors.control.onCard` | `#2EA275` | `palette.toggleCardOn` | Interruptor ligado no cartão de lembrete |
| `colors.control.onForm` | `#256855` | `palette.toggleFormOn` | Interruptor ligado nos formulários e nas configurações |
| `colors.control.off` | `#D6D5D5` | `palette.trackOff` | Interruptor desligado |
| `colors.control.thumb` | `#FBFBFA` | `palette.toggleThumb` | Bolinha do interruptor |
| `colors.control.chipOn` | `#12432F` | `palette.forest900` | Chip de filtro selecionado |
| `colors.control.chipOff` | `#F3F4EF` | `palette.chipOff` | Chip de filtro não selecionado |
| `colors.control.segmentTrack` | `#E8E4DC` | `palette.sand` | Trilho do controle segmentado |
| `colors.control.segmentThumb` | `#FFFFFF` | `palette.white` | Opção selecionada do controle segmentado |
| `colors.control.rowHover` | `#F7F8F4` | `palette.rowHover` | Linha de menu com o ponteiro em cima (web) |
| `colors.control.rowPressed` | `#EEF1EA` | `palette.rowPressed` | Linha de menu pressionada |
| `colors.control.dangerRowHover` | `#FDF3F1` | `palette.dangerRowHover` | Linha de excluir com o ponteiro em cima (web) |
| `colors.control.dangerRowPressed` | `#FBE7E4` | `palette.dangerTint` | Linha de excluir pressionada |
| `colors.control.haloHover` | `rgba(20, 40, 30, 0.07)` | — | Halo atrás das reticências do cartão com o ponteiro em cima (web) |
| `colors.control.haloPressed` | `rgba(20, 40, 30, 0.13)` | — | Halo atrás das reticências do cartão pressionado |
| `colors.feedback.dangerBg` | `#FFE6E6` | `palette.red100` | Fundo do aviso de erro |
| `colors.feedback.dangerWash` | `#FFF5F5` | `palette.red50` | Fundo da zona de perigo |
| `colors.feedback.successBg` | `#E7F4EB` | `palette.mint50` | Fundo do aviso de sucesso |
| `colors.feedback.infoBg` | `#DDE8DD` | `palette.mintTint` | Fundo do aviso informativo (ex.: "você está dentro do raio") |
| `colors.feedback.infoBar` | `#185C4B` | `palette.forest700` | Faixa lateral do aviso informativo |
| `colors.feedback.emptyCircle` | `#DBF1E5` | `palette.mint100` | Círculo atrás do ícone do estado vazio |
| `colors.feedback.errorBg` | `#FDF0EE` | `palette.alertErrorBg` | Fundo do aviso de erro nas configurações |
| `colors.feedback.errorInk` | `#8E2418` | `palette.alertErrorInk` | Texto do aviso de erro nas configurações |
| `colors.feedback.infoInk` | `#1B4436` | `palette.alertInfoInk` | Texto do aviso informativo |
| `colors.feedback.tipCircle` | `#C3DFCE` | `palette.tipCircle` | Círculo atrás da lâmpada do cartão de dica |
| `colors.feedback.dangerCircle` | `#FBE7E4` | `palette.dangerTint` | Círculo atrás do ícone de excluir e de sair |
| `colors.onboarding.bg` | `#12301F` | `palette.onboardingBg` | Fundo do Onboarding enquanto a foto carrega |
| `colors.onboarding.pagerOn` | `#F8F9F9` | `palette.pagerOn` | Ponto da página ativa do Onboarding |
| `colors.onboarding.pagerOff` | `rgba(255, 255, 255, 0.26)` | — | Pontos das outras páginas do Onboarding |
| `colors.status.active` | `#029554` | `palette.statusGreen` | Ponto do selo "Ativo" |
| `colors.tab.background` | `#F8F8F4` | `palette.tabBarBg` | Fundo da barra de abas |
| `colors.tab.inactive` | `#777C8A` | `palette.tabInactive` | Rótulo e ícone da aba inativa |
| `colors.tab.indicator` | `#B7B3AE` | `palette.homeIndicator` | Traço "home" do iOS sob a barra de abas |
| `colors.glass.fill` | `rgba(255, 255, 255, 0.05)` | — | Véu do botão de vidro sobre o verde escuro |
| `colors.glass.fillHover` | `rgba(255, 255, 255, 0.1)` | — | Botão de vidro com o ponteiro em cima (web) |
| `colors.glass.fillPressed` | `rgba(255, 255, 255, 0.16)` | — | Botão de vidro pressionado |
| `colors.glass.border` | `rgba(255, 255, 255, 0.2)` | — | Borda do botão de vidro |
| `colors.glass.field` | `rgba(255, 255, 255, 0.1)` | — | Campo de busca sobre o cabeçalho verde |
| `colors.glass.fieldFocus` | `rgba(255, 255, 255, 0.14)` | — | Campo de busca em foco |
| `colors.glass.balloon` | `rgba(10, 36, 26, 0.4)` | — | Balão de vidro do Onboarding ("Na hora certa", "No lugar certo") |
| `colors.glass.balloonRing` | `rgba(203, 245, 224, 0.34)` | — | Contorno do balão de vidro do Onboarding |
| `colors.glass.featureFill` | `rgba(255, 255, 255, 0.04)` | — | Fundo do círculo dos benefícios do Onboarding |
| `colors.glass.featureRing` | `rgba(150, 220, 180, 0.4)` | — | Contorno do círculo dos benefícios do Onboarding |
| `colors.glass.divider` | `rgba(233, 255, 243, 0.22)` | — | Divisória vertical entre os benefícios do Onboarding |
| `colors.brand.tile` | `#84FADA` | `palette.mintBrand` | Fundo do ícone do app, da tela de abertura e do favicon |
| `colors.brand.tileEnd` | `#78E4C4` | `palette.mintBrandEnd` | Fim do degradê do ícone do app |
| `colors.brand.glyph` | `#043525` | `palette.brandInk` | Símbolo do ícone do app |
| `colors.spinner` | `#185C4B` | `palette.forest700` | Indicador de carregamento sobre fundo claro |
| `colors.overlay` | `rgba(13, 42, 27, 0.46)` | — | Véu atrás de modais e folhas |
| `colors.map.me` | `#2F80ED` | `palette.mapBlue` | Posição atual da pessoa no mapa |
| `colors.map.ring` | `#FFFFFF` | `palette.white` | Aro branco em volta dos marcadores do mapa |
| `colors.map.paused` | `#828890` | `palette.mapGray` | Marcador de lembrete pausado no mapa |
| `colors.map.background` | `#E8E4DC` | `palette.sand` | Fundo do mapa enquanto os mapas carregam |
| `colors.map.pin` | `#054C39` | `palette.forestPin` | Pino do mapa no formulário de novo lembrete |
| `colors.map.haloFill` | `rgba(45, 170, 120, 0.21)` | — | Preenchimento do círculo do raio de aviso |
| `colors.map.haloLine` | `rgba(45, 170, 120, 0.32)` | — | Contorno do círculo do raio de aviso |
| `colors.map.pinShadow` | `rgba(0, 0, 0, 0.18)` | — | Sombra do pino do mapa no formulário |
<!-- tokens:cores-semanticas:fim -->

### 3.3 Categorias de lembrete

Cinco categorias, as mesmas do banco (`green`, `orange`, `blue`, `purple`, `pink`). A cor sozinha nunca informa: o ícone e o título dizem o resto.

<!-- tokens:cores-categorias:inicio -->
| Categoria | Fundo do ícone (`bg`) | Faixa (`bar`) | Glifo (`ink`) | Marcador no mapa (`pin`) | Etiqueta (`tag`) | Ícone da etiqueta (`fg`) | Texto da etiqueta (`tagInk`) |
|---|---|---|---|---|---|---|---|
| `colors.category.green` | `#DBF1E4` | `#39C391` | `#011F1A` | `#2F9E5B` | `#DAF4E6` | `#18714E` | `#18714E` |
| `colors.category.orange` | `#FDE6D6` | `#FD6C34` | `#0A0A0A` | `#FE532A` | `#FDE5D7` | `#F86327` | `#183029` |
| `colors.category.blue` | `#D5E8F9` | `#51A6F6` | `#024381` | `#2F80ED` | `#D6E9F9` | `#2C91EA` | `#1F66A4` |
| `colors.category.purple` | `#EADFFB` | `#B287E8` | `#0A0A14` | `#7C3AED` | `#ECE4FB` | `#9265D8` | `#7551AD` |
| `colors.category.pink` | `#FCE3E9` | `#F980B3` | `#0A0A14` | `#E0457B` | `#FCE6EC` | `#ED6E9E` | `#9A486B` |
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
| `textStyles.title` | 20 | 26 | `SourceSerif4_700Bold` | Título de tela e de estado vazio |
| `textStyles.heading` | 18 | 24 | `SourceSerif4_700Bold` | Título de seção ("Hoje", "Amanhã") e de cabeçalho |
| `textStyles.sheetTitle` | 20 | 24 | `SourceSerif4_700Bold` | Título de folha inferior (Excluir lembrete?, Horário, Repetir): o tamanho de título com altura de linha 1,2 |
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
| `fontSize.hero` | `56` | Título grande do Onboarding (fora de `textStyles`: as duas linhas curtas pedem altura de linha 1) |
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
| `radius.sheet` | `19` | Topo de folhas e modais |
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
| `shadow.float` | `0px 1px 4px rgba(0, 0, 0, 0.16)` | Controles flutuantes |
| `shadow.cta` | `0px 8px 24px rgba(254, 83, 42, 0.3)` | Brilho laranja do botão primário |
| `shadow.focus` | `0px 0px 0px 3px rgba(24, 92, 75, 0.15)` | Halo de 3 em volta do campo em foco, sobre a borda `colors.border.focus` |
| `shadow.sheet` | `0px -5px 20px rgba(13, 42, 27, 0.18)` | Folha inferior (sombra para cima) |
| `shadow.tabBar` | `0px -1px 0px rgba(20, 40, 30, 0.05), 0px -3px 9px rgba(20, 40, 30, 0.03)` | Barra de abas: filete e sombra para cima |
| `shadow.column` | `0px 24px 70px rgba(0, 0, 0, 0.5)` | Coluna do app sobre o palco escuro, na web (tablet e computador) |
<!-- tokens:sombras:fim -->

- `shadow.card` nos cartões e painéis; `shadow.float` nos controles flutuantes; `shadow.sheet` nas folhas inferiores; `shadow.tabBar` na barra de abas; `shadow.column` na coluna da web; `shadow.cta` só no botão primário habilitado; `shadow.focus` como halo do campo em foco.
- Sombra dá profundidade, nunca informação: nada pode depender dela para ser entendido.

### 7.1 Degradês

Os fundos em degradê do original (cabeçalho verde, telas de conta e cabeçalho claro do formulário) são texto CSS em `gradients`, com as medidas do CSS do app web já convertidas de `du` para dp. O React Native 0.86 os aceita em `experimental_backgroundImage` (o Expo SDK 57 o indica como alternativa ao `expo-linear-gradient`) e o react-native-web só entende `backgroundImage`: por isso as telas usam `fundoEmDegrade(gradients.x)` (`src/design/efeitos.ts`) e nunca escrevem a propriedade. `src/design/__tests__/efeitos.test.ts` passa cada receita pelo parser do próprio React Native, para uma receita que o celular ignoraria reprovar antes de chegar ao aparelho.

<!-- tokens:degrades:inicio -->
| Token | Receita (camadas de cima para baixo) | Uso |
|---|---|---|
| `gradients.cabecalhoVerde` | `radial-gradient(283px 167px at 90% 6%, rgba(127, 234, 198, 0.28), rgba(127, 234, 198, 0) 70%)`<br>`radial-gradient(263px 152px at 4% 92%, rgba(33, 105, 85, 0.6), rgba(33, 105, 85, 0) 72%)`<br>`linear-gradient(168deg, #2A5B47 0%, #184434 50%, #0E301F 100%)` | Cabeçalho verde da lista e das configurações (345 du de altura) |
| `gradients.contas` | `radial-gradient(283px 202px at 88% 4%, rgba(127, 234, 198, 0.26), rgba(127, 234, 198, 0) 70%)`<br>`radial-gradient(374px 232px at 50% 100%, rgba(132, 250, 218, 0.15), rgba(132, 250, 218, 0) 70%)`<br>`radial-gradient(263px 192px at 6% 96%, rgba(33, 105, 85, 0.55), rgba(33, 105, 85, 0) 72%)`<br>`linear-gradient(168deg, #2A5B47 0%, #184434 52%, #0E301F 100%)` | Fundo das telas de conta |
| `gradients.cabecalhoClaro` | `radial-gradient(283px 172px at 100% 0%, rgba(33, 105, 85, 0.58), rgba(33, 105, 85, 0) 72%)`<br>`radial-gradient(243px 152px at 0% 0%, rgba(148, 249, 205, 0.36), rgba(148, 249, 205, 0) 72%)`<br>`radial-gradient(263px 86px at 46% 26%, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0) 100%)`<br>`linear-gradient(180deg, #CBE4D6 0%, #E3EEE5 44%, #F5F2ED 100%)` | Cabeçalho claro do formulário de novo lembrete |
| `gradients.marcaTile` | `linear-gradient(160deg, #84FADA, #78E4C4)` | Tile da marca no cabeçalho: o menta do ícone do app, a 160° |
| `gradients.divisorVertical` | `linear-gradient(to bottom, rgba(233, 255, 243, 0), rgba(233, 255, 243, 0.22) 22%, rgba(233, 255, 243, 0.22) 78%, rgba(233, 255, 243, 0))` | Divisória vertical entre os benefícios do Onboarding |
| `gradients.esmaecerParaPagina` | `linear-gradient(to top, #F5F2ED 62%, rgba(245, 242, 237, 0) 100%)` | Esmaecimento atrás do botão fixo do formulário |
<!-- tokens:degrades:fim -->

## 8. Ícones

- **Família:** Lucide (`lucide-react-native`, licença ISC, gratuita), a mesma do app web e das capturas de referência, desenhada em SVG (`react-native-svg`, a versão fixada pelo SDK 57). Componente `src/components/Icon.tsx`; cada ícone entra por caminho próprio (`lucide-react-native/icons/<nome>`) para o pacote inteiro, com quase 4 mil ícones, não ir para o app.
- **Traço:** `iconStroke.*` (1,8 a 3,4, no desenho de 24 por 24; o traço visível é o valor vezes o tamanho dividido por 24). Contorno sempre; a aba ativa só engrossa o traço e muda a cor.
- **Tamanhos:** `size.icon.sm` (ao lado de texto pequeno), `size.icon.md` (ações), `size.icon.lg` (abas). Cor: `colors.icon.default`, ou o glifo da categoria (`colors.category.*.ink`).
- **Emoji não é ícone**: muda de aparência em cada sistema e não aceita cor.
- Ícone que é botão leva `accessibilityLabel` no botão; o `Icon` já sai escondido do leitor de tela.
- Os nomes são conferidos contra o pacote e contra o registro por `src/design/__tests__/icones.test.tsx`. Halter e avião giram (45° e −45°) só no cartão da lista, porque o Lucide os desenha na diagonal.

<!-- tokens:icones-categorias:inicio -->
| Ícone do lembrete | Lucide | Giro na lista |
|---|---|---|
| `cart` | `shopping-cart` | — |
| `dumbbell` | `dumbbell` | 45° |
| `pill` | `pill` | — |
| `users` | `users` | — |
| `plane` | `plane` | -45° |
| `pin` | `map-pin` | — |
| `bell` | `bell` | — |
| `briefcase` | `briefcase` | — |
| `house` | `house` | — |
| `card` | `credit-card` | — |
<!-- tokens:icones-categorias:fim -->

<!-- tokens:icones-interface:inicio -->
| Uso | Lucide |
|---|---|
| Aba inicio | `house` |
| Aba lembretes | `list` |
| Aba mapa | `map-pin` |
| Aba config | `settings` |
| fechar | `x` |
| excluir | `trash` |
| aqui | `map-pin` |
| definido | `circle-check` |
| vazio | `bell` |
| email | `mail` |
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

- **Excluir sólido e cancelar** (`variant="destructive"` e `"frost"`): só dentro da confirmação de uma ação sem volta. `destructive` usa `colors.action.danger` (ponteiro `dangerHover`, pressionado `dangerPressed`) com texto `colors.text.onAction`; `frost` usa `colors.action.frost` (`frostHover`, `frostPressed`) com texto `colors.text.primary`.
- **Compacto** (`compact`, com `icon` opcional): altura `size.buttonCompact`, padding `space.lg`, rótulo `fontSize.micro` em negrito e sem o brilho `shadow.cta`; o ícone (`size.icon.xs`, traço `iconStroke.action`) vai à esquerda, na cor do rótulo, a `space.sm`. É o "Novo lembrete" do cabeçalho verde.
- **Vidro** (`src/components/GlassButton.tsx`): botão redondo de `size.glassButton` sobre o verde escuro, para busca e conta. Fundo `colors.glass.fill` (ponteiro `fillHover`, pressionado `fillPressed` e escala `motion.pressedScale`), contorno `borderWidth.hairline` em `colors.glass.border`, ícone branco de `size.icon.md`. Sempre com `accessibilityLabel` (o ícone sozinho não diz nada) e toque de 44. O desfoque de fundo do original não é reproduzido: sobre um verde quase liso não se vê. Foco de teclado em menta (`colors.border.focusOnDark`), porque o verde-floresta some no fundo escuro.

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
- **Interruptor** (`Toggle`): trilho em pílula, desligado `colors.control.off`; ligado `colors.control.onCard` (variante `card`, 35 por 21, no cartão de lembrete) ou `colors.control.onForm` (variante `form`, 43 por 26, nos formulários e nas configurações). Bolinha `colors.control.thumb` com `shadow.float`, que corre em `motion.duration.toggle` (imediata com "reduzir movimento"). Medidas em `size.toggle.*`; o toque ganha folga até 44 por 44. Papel `switch` com o estado ligado, e sempre com o rótulo ao lado e `accessibilityLabel`. O verde do cartão é o da imagem (`#30AB7B`) escurecido 5% para chegar a 3:1 com o cartão (a imagem dá 2,76:1).
- **Controle segmentado** (`SegmentedControl`; duas opções, ex.: "Por horário" e "Por local"): trilho `colors.control.segmentTrack`, raio `radius.md`; a opção selecionada fica em `colors.control.segmentThumb` com `fontWeight.bold`.

## 11. Cards, modais, menus e navegação

### 11.1 Cartão de lembrete (`ReminderCard`)

Superfície `colors.bg.card`, raio `radius.md`, sombra `shadow.card`, faixa lateral de `borderWidth.bar` em `colors.category.*.bar` (recortada pelos cantos do cartão). À esquerda, o círculo de `size.card.circle` alinhado ao **topo**, com `colors.category.*.bg` e o glifo da categoria (`colors.category.*.ink`, `size.card.glyph`, traço `iconStroke.glyph`; halter e avião giram 45° e −45°). No centro: o título em serifa (`fontSize.body`, uma linha, com reticências se passar), a data com o ícone de calendário (por horário) ou o lugar e o raio (por local; o raio tem ícone próprio, `RadiusIcon`) e a etiqueta (`Tag`). À direita: a hora (`fontFamily.medium`), o `Toggle` (variante `card`) e, no canto, as reticências (`ellipsis`, `colors.icon.dots`, halo `colors.control.haloHover` e `haloPressed`) que abrem o menu do lembrete. Nos lembretes por local há a miniatura do mapa (`thumb-sucesso.jpg`, sempre a mesma) e a coluna da hora desce `size.card.localShift`. O cartão em si não é tocável: só o interruptor e as reticências respondem.

- **Etiqueta** (`src/components/Tag.tsx`): pílula na cor da categoria (`colors.category.*.tag`), ícone de pino em `.fg` e o texto "Por horário" ou "Por local" em `.tagInk` (o `fg` escurecido até 4,5:1; o azul e o rosa da imagem dão 2,7:1 e 2,4:1).
- **Dentro do raio:** anel `borderWidth.focus` em `colors.border.focus` e a linha "Você está aqui" (`colors.text.accent`, ícone de pino). É um recurso do app: o original não tem.
- **Pausado:** `opacity.inactive` no cartão inteiro. O original não escurece o cartão pausado (só o interruptor muda); o app mantém o esmaecido para se ver de relance o que está desligado.
- **Texto no piso de 12:** o original usa 9 a 11 dp na data, no lugar e na etiqueta. Aqui o título é 14 e o resto 12, e o cartão fica um pouco mais alto que na imagem (`size.card.minHeight` é só o mínimo: ele cresce com o texto e com a fonte grande do sistema).

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

Opção de escolha rápida e filtro (`src/components/Chip.tsx`). Altura `size.chip` e área de toque de 44 (`size.hitSlop`), raio `radius.pill`, rótulo em `fontSize.micro` e negrito. Com `count`, o número vem depois do rótulo (`fontFamily.semibold`, `colors.text.chipCount`), a `space.lg`; zero também aparece. Selecionado: `colors.control.chipOn` e texto branco (rótulo e contagem). Não selecionado: `colors.control.chipOff`, contorno `colors.border.chip` e rótulo `colors.text.chip`. Para o leitor de tela lê "Hoje: 3" e informa se está selecionado. Na lista os quatro chips dividem a largura (`flexGrow`).

### 11.5 Folha (modal inferior)

Componente `src/components/Sheet.tsx`. Véu `colors.overlay` (verde-escuro a 46%); folha `colors.bg.card` colada no fim da tela, cantos de cima `radius.sheet`, sombra `shadow.sheet`, no máximo `layout.sheetMaxHeight` da altura da tela (o resto rola). Espaços em `size.sheet.*`: a base nunca é menor que a área segura do sistema. Alça decorativa de `size.sheet.handleWidth` por `size.sheet.handleHeight` em `colors.tab.indicator` (não arrasta nem fecha). Título `textStyles.sheetTitle`; subtítulo `textStyles.micro` em `colors.text.secondary`, a `space.xs` do título. A ação do canto (o "Pronto" do horário) fica a `size.sheet.actionTop` do topo e `size.sheet.actionRight` da direita. Na web a folha tem `layout.columnMax` de largura máxima e fica centralizada, senão viraria uma faixa da largura da janela (o `Modal` sai da coluna do app).

- **Entrada:** o véu aparece em `motion.duration.scrim` (ease-out) e a folha sobe de baixo em `motion.duration.sheet`, com a curva `motion.curve`. Com "reduzir movimento" (`src/lib/movimento.ts`) ela já entra pronta. Não há animação de saída (some na hora) nem arrastar para fechar, como no app web.
- **Fechar:** toque no véu, botão voltar do Android, Esc na web e o gesto de escape do leitor de tela (iOS).
- **Acessibilidade:** papel `dialog`, modal, título como nome e como cabeçalho; o resto da tela sai da árvore de acessibilidade enquanto a folha está aberta.
- **Menu do lembrete** (`src/components/ReminderMenu.tsx`, aberto pelas reticências do cartão): título do lembrete, data e hora como subtítulo, e uma lista branca de cantos `radius.lg` com contorno `colors.border.field`. Cada linha (`size.menu.*`) tem um círculo com o ícone (menta `colors.bg.iconCircle` no Editar; rosado `colors.feedback.dangerCircle` na lixeira) e o rótulo em negrito; Excluir usa `colors.text.danger`. Ponteiro em cima e pressionado trocam o fundo (`colors.control.rowHover` e `rowPressed`; rosados no Excluir). A linha Editar só aparece quando quem abre sabe editar.
- **Confirmação** (`src/components/ConfirmSheet.tsx`, no lugar do `Alert` do sistema, que muda de cara em cada plataforma): "Excluir lembrete?", a mensagem "“título” será removido e você não receberá mais esse aviso." e dois botões empilhados a `space.sm`: `destructive` (vermelho sólido `colors.action.danger`, texto branco) e `frost` ("Cancelar", `colors.action.frost`, texto escuro). Confirmar só confirma; Cancelar, o véu e o Esc só fecham. Sem aviso de "desfazer".

### 11.6 Abas e cabeçalho

- **Barra de abas:** fundo `colors.bg.card`, filete superior `colors.border.divider`, altura `size.tabBar` mais a área segura do sistema. Ativa: `colors.text.brand` com o ícone preenchido; inativa: `colors.icon.muted` com o ícone em contorno. Rótulo em `fontSize.micro` e `fontWeight.medium`, sem altura de linha própria (com ela o React Navigation cortava o pé do texto na web).
- **Cabeçalho:** fundo `colors.bg.page`, sem sombra, título `textStyles.heading` em `colors.text.primary`.
- **Cabeçalho verde** (`src/components/GreenHeader.tsx`, na lista e nas configurações): degradê `gradients.cabecalhoVerde` (base a 168°, luz menta e sombra de pinheiro) com as curvas de nível por cima (imagem `assets/art/topo-lista.webp`, ver `assets/art/LEIA-ME.md`), altura mínima `size.header.height` e margem lateral `size.header.side`. O conteúdo começa em `size.header.contentTop`, ou abaixo da barra de status do aparelho (entalhe, ilha) mais `space.sm` quando ela é maior; o cabeçalho cresce o quanto o conteúdo desceu. O grão de 9% do original não se vê e não é reproduzido. A folha clara (`colors.bg.sheet`, cantos `radius.sheet`) sobe sobre ele a partir de `size.header.sheetTop`.
- **Marca** (`src/components/AppBrand.tsx`): tile de `size.header.brandTile` com `gradients.marcaTile`, símbolo `locate-fixed` em `colors.brand.glyph`, nome em serifa negrito (`colors.text.onDarkWarm`; o original usa um peso a menos, que o app não carrega) e a frase "Sua rotina, mais leve." em `colors.text.onDarkFaint`.
- **Busca** (`src/components/SearchField.tsx`): campo em pílula de `size.header.searchHeight` no lugar da marca; fundo `colors.glass.field`, contorno `colors.glass.border`; em foco, contorno `colors.border.focusOnDark` e fundo `colors.glass.fieldFocus`. Abre com o teclado, tecla "buscar"; o Enter só recolhe o teclado e o Esc (web) fecha. Filtra enquanto se digita.

### 11.8 Cartão de dica (`TipCard`)

"Dica para você" no fim da lista (`src/components/TipCard.tsx`): fundo `colors.feedback.infoBg`, raio `size.tip.radius`, círculo `size.tip.circle` em `colors.feedback.tipCircle` com a lâmpada (`lightbulb`, `colors.icon.tip`) e a seta `chevron-right` à direita. Título em negrito (`colors.text.primary`) e texto em `colors.text.tip` (`fontSize.micro`). Na lista é só informação: o original não o torna tocável.

### 11.9 Lista "Meus lembretes"

Tela `app/(app)/index.tsx`, sobre o cabeçalho verde (`GreenHeader`): marca e botões de vidro (busca e conta) na primeira linha; na segunda o título `textStyles.display` em `colors.text.onDarkWarm`, o subtítulo "N lembretes ativos" (`colors.text.onHeader`) e o botão compacto "Novo lembrete". A folha clara sobe sobre o cabeçalho e traz, de cima para baixo: os quatro chips (Todos, Hoje, Esta semana, Locais, cada um com a contagem, que acompanha a busca), os grupos Hoje, Amanhã e Esta semana (título `textStyles.heading`; Hoje e Amanhã mostram a data à direita), os cartões e a dica. Medidas em `size.list.*`.

- **Grupos:** Hoje = a data de hoje; Amanhã = hoje mais um dia; **Esta semana = qualquer outra data, passada ou futura** (como no original; o filtro "Esta semana" soma Amanhã). Grupo sem itens não aparece.
- **Busca:** o botão de vidro troca a marca pelo campo e vira "Fechar busca"; casa em título, lugar, data e hora, sem acento; fechar zera o texto e mantém o filtro. A dica some enquanto se busca.
- **Menu e exclusão:** as reticências abrem o menu do lembrete; Excluir fecha o menu e abre a confirmação. O subtítulo "N lembretes ativos" conta a lista inteira (ignora busca e filtro).
- **Rolagem:** os chips ficam fixos (e rolam na horizontal se a tela for estreita); só a lista rola, com puxar para atualizar (o original não tem).

### 11.7 Coluna da web

No navegador o app vive numa coluna de celular centralizada (como o frame do app web): `layout.columnMax` (430, a largura das capturas) de largura máxima, fundo `colors.bg.page`, sombra `shadow.column`, sobre o palco escuro `colors.bg.stage` (o verde mais fundo da marca). No iOS e no Android ocupa a tela toda.

### 11.10 Onboarding

`src/components/Onboarding.tsx`, com duas rotas: `app/(app)/inicio.tsx` (aba Início, com a barra de abas; os dois botões levam a `/novo`) e `app/auth/bem-vindo.tsx` (primeira tela de quem ainda não entrou; os dois botões levam ao login, sem barra de abas, com a base respeitando a área segura). Foto de fundo `bg-onboarding.jpg` (`contentFit="cover"`; o fundo `colors.onboarding.bg` só aparece enquanto ela carrega), e por cima um único fluxo vertical:

- **Topo:** `AppBrand variant="onboarding"` (nome em sans negrito de `size.onboarding.brandName`, com "Ai" em `colors.text.brandAccent`) e o `GlassPill` "Pular" (`size.onboarding.skipWidth` por `skipHeight`, seta `chevron-right`).
- **Cena** (largura da coluna; altura `layout.onboardingSceneRatio` da largura, no máximo 32% da altura da janela): o pino 3D (`hero-pino.png`), o letreiro manuscrito (`hero-script.png`, com texto alternativo) e dois balões de vidro (`colors.glass.balloon` com contorno `balloonRing`) **inclinados −14° e 14°**, como na captura; o esquerdo passa atrás do pino. O CSS do app web desenha os balões retos e mais acima; a imagem vence.
- **Título:** "Lembre" em `colors.text.onDark` e "de tudo!" em `colors.text.onDarkAccent`, serifa em `fontSize.hero` com altura de linha igual ao tamanho; abaixo, o subtítulo em `colors.text.onHeader`.
- **Benefícios:** três colunas (relógio, pino, raio) com círculo `size.onboarding.feature` (`colors.glass.featureFill` e `featureRing`), título em negrito e descrição, separadas por divisórias que somem nas pontas (`gradients.divisorVertical`).
- **Botão grande:** `Button hero iconEnd="arrow-right"`, laranja, `size.onboarding.heroButton` de altura, sem o brilho (a captura não tem), seta a `space.xl` do rótulo. Depois, o pager (três pontos, o primeiro aceso; enfeite, sem toque) e "Seus lembretes, sua privacidade." com o cadeado desenhado à mão (`LockIcon`).
- **Folgas elásticas:** entre os blocos há espaços com peso (113, 107, 32, 47, 43, 56, 96 e 156, como no app web): `flexGrow` pelo peso e base proporcional à largura; em tela alta os blocos se afastam, em tela baixa as folgas encolhem primeiro e depois a cena.
- **Desvios das imagens:** textos no piso de 12 (a captura tem 9 a 11), o nome da marca em serifa 700 nas listas (a captura usa um peso a menos), sem a sombra do título e sem o halo escuro em volta dos textos pequenos (a arte tem; o CSS não).

## 12. Imagens e ilustrações

- **A interface é código, nunca imagem de tela.** Texto, botões e cartões nunca viram PNG.
- **Ícone do app:** tile menta em degradê (`colors.brand.tile` para `colors.brand.tileEnd`) com o símbolo em `colors.brand.glyph`, 1024 por 1024 (`assets/images/icon.png`). Android adaptativo: `android-icon-foreground/background/monochrome.png`, 1024 por 1024; o símbolo deve ficar dentro dos 66% centrais (regra do Android para o recorte do launcher).
- **Abertura (splash):** `splash-icon.png` (`imageWidth: 160`) sobre `colors.brand.tile`. **Notificação do Android:** `notification-icon.png` (96 por 96) tingido com `colors.action.primary`. **Web:** `public/favicon.svg`, `public/icons/*` (PWA 192, 512 e maskable) e o manifesto com o fundo `colors.bg.page`.
- As cores de marca que vivem em JSON e SVG (que não importam tokens) são conferidas por `src/design/__tests__/marca.test.ts`.
- **Fotos e ilustrações novas:** nunca esticar (`contentFit="cover"` ou `"contain"`); `accessibilityLabel` quando informam, escondidas do leitor de tela quando decorativas; alvo de menos de 200 KB, em WebP ou PNG. O pino 3D, o letreiro e o fundo de folhagem do onboarding vêm de `assets/art/` (recortes de `tools/build-assets.py` do app web, cópias idênticas) e entram em `src/components/Onboarding.tsx`.
- **Mapa:** tiles do OpenStreetMap com a atribuição sempre visível (é obrigatória). O halo do raio usa a cor da categoria com transparência.

## 13. Animações e transições

Filosofia: o mínimo. O feedback de toque é instantâneo (troca de cor e escala `motion.pressedScale`, sem animar); a navegação usa o padrão de cada plataforma; a folha do mapa entra em `slide`.

<!-- tokens:movimento:inicio -->
| Token | Valor | Uso |
|---|---|---|
| `motion.duration.fast` | `120` | Feedback de toque (ms) |
| `motion.duration.base` | `200` | Troca de estado (ms) |
| `motion.duration.slow` | `300` | Entrada de modais (ms) |
| `motion.duration.scrim` | `180` | Entrada do véu atrás de uma folha (ms) |
| `motion.duration.sheet` | `260` | Subida de uma folha inferior (ms) |
| `motion.duration.toggle` | `180` | Troca de estado do interruptor (ms) |
| `motion.ease.x1` | `0.25` | Curva `ease` do CSS: cubic-bezier(x1, y1, x2, y2) |
| `motion.ease.y1` | `0.1` | Curva `ease` do CSS: cubic-bezier(x1, y1, x2, y2) |
| `motion.ease.x2` | `0.25` | Curva `ease` do CSS: cubic-bezier(x1, y1, x2, y2) |
| `motion.ease.y2` | `1` | Curva `ease` do CSS: cubic-bezier(x1, y1, x2, y2) |
| `motion.curve.x1` | `0.2` | Curva de entrada das folhas: cubic-bezier(x1, y1, x2, y2) |
| `motion.curve.y1` | `0.8` | Curva de entrada das folhas: cubic-bezier(x1, y1, x2, y2) |
| `motion.curve.x2` | `0.2` | Curva de entrada das folhas: cubic-bezier(x1, y1, x2, y2) |
| `motion.curve.y2` | `1` | Curva de entrada das folhas: cubic-bezier(x1, y1, x2, y2) |
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
| `size.chip` | `34` | Altura visível do chip (a área de toque chega a 44 com `size.hitSlop`) |
| `size.closeButton` | `32` | Botão de fechar visível (a área de toque chega a 44 com `size.hitSlop`) |
| `size.hitSlop` | `6` | Folga de toque ao redor de controles menores que 44 |
| `size.icon.xs` | `14` | Ícone dentro do botão compacto |
| `size.icon.sm` | `16` | Ícones ao lado de texto pequeno |
| `size.icon.md` | `20` | Ícones de ação |
| `size.icon.lg` | `24` | Ícones de aba |
| `size.icon.xl` | `40` | Ícone do estado vazio |
| `size.mapPin.width` | `29` | Largura do pino do mapa no formulário |
| `size.mapPin.height` | `37` | Altura do pino do mapa no formulário (a ponta marca o local) |
| `size.glassButton` | `42` | Botão redondo de vidro do cabeçalho verde (busca e conta); o toque chega a 44 com `size.hitSlop` |
| `size.buttonCompact` | `36` | Altura do botão compacto ("Novo lembrete" no cabeçalho) |
| `size.header.height` | `174` | Altura da arte do cabeçalho verde |
| `size.header.contentTop` | `41` | Topo da marca e dos botões no cabeçalho verde (sobe com a barra de status do aparelho) |
| `size.header.sheetTop` | `150` | Onde começa a folha clara que sobe sobre o cabeçalho verde |
| `size.header.side` | `19` | Margem lateral do conteúdo do cabeçalho verde |
| `size.header.brandTile` | `38` | Lado do tile da marca |
| `size.header.brandGap` | `11` | Vão entre o tile da marca e o nome |
| `size.header.brandGlyph` | `22` | Lado do símbolo dentro do tile da marca |
| `size.header.searchHeight` | `38` | Altura do campo de busca |
| `size.onboarding.side` | `25` | Onboarding: margem dos lados |
| `size.onboarding.skipWidth` | `82` | Onboarding: largura do botão "Pular" |
| `size.onboarding.skipHeight` | `42` | Onboarding: altura do botão "Pular" |
| `size.onboarding.balloonLeft.width` | `150` | Onboarding: balão "Na hora certa", largura |
| `size.onboarding.balloonLeft.height` | `51` | Onboarding: balão "Na hora certa", altura |
| `size.onboarding.balloonRight.width` | `150` | Onboarding: balão "No lugar certo", largura |
| `size.onboarding.balloonRight.height` | `58` | Onboarding: balão "No lugar certo", altura |
| `size.onboarding.feature` | `53` | Onboarding: círculo do ícone de cada benefício |
| `size.onboarding.featureIcon` | `25` | Onboarding: ícone dentro do círculo do benefício |
| `size.onboarding.heroButton` | `55` | Onboarding: altura do botão "Criar meu primeiro lembrete" |
| `size.onboarding.pagerWidth` | `16` | Onboarding: largura de cada ponto da página |
| `size.onboarding.pagerHeight` | `6` | Onboarding: altura de cada ponto da página |
| `size.onboarding.pagerGap` | `7` | Onboarding: vão entre os pontos da página |
| `size.onboarding.brandName` | `19` | Onboarding: tamanho do nome da marca |
| `size.list.chipsTop` | `11` | Lista: distância da borda da folha até os chips |
| `size.list.chipsGap` | `10` | Lista: vão entre os chips |
| `size.list.listTop` | `17` | Lista: espaço entre os chips e o primeiro título de seção |
| `size.list.sectionHead` | `22` | Lista: altura do título de seção (Hoje, Amanhã, Esta semana) |
| `size.list.headGap` | `5` | Lista: vão entre o título da seção e o primeiro cartão |
| `size.list.firstHeadGap` | `8` | Lista: o mesmo vão na primeira seção |
| `size.list.cardGap` | `8` | Lista: vão entre cartões |
| `size.list.sectionGap` | `15` | Lista: vão entre seções |
| `size.list.tipGap` | `11` | Lista: vão entre o último cartão e a dica |
| `size.list.emptyTop` | `76` | Lista: espaço acima da mensagem de lista vazia |
| `size.menu.row` | `59` | Linha do menu: altura mínima |
| `size.menu.circle` | `34` | Linha do menu: círculo do ícone |
| `size.menu.icon` | `16` | Linha do menu: ícone dentro do círculo |
| `size.menu.gap` | `13` | Linha do menu: vão entre o círculo e o texto |
| `size.menu.paddingHorizontal` | `17` | Linha do menu: recuo dos lados |
| `size.menu.listTop` | `13` | Linha do menu: distância da lista até o título da folha |
| `size.tag.height` | `18` | Etiqueta "Por horário" / "Por local": altura |
| `size.tag.left` | `7` | Etiqueta: recuo antes do ícone |
| `size.tag.right` | `9` | Etiqueta: recuo depois do texto |
| `size.tag.gap` | `6` | Etiqueta: vão entre o ícone e o texto |
| `size.tag.icon` | `12` | Etiqueta: lado do ícone |
| `size.tip.radius` | `14` | Cartão de dica: raio |
| `size.tip.circle` | `49` | Cartão de dica: círculo do ícone |
| `size.tip.padding` | `11` | Cartão de dica: recuo do círculo até a borda |
| `size.tip.gap` | `15` | Cartão de dica: vão entre o círculo e o texto |
| `size.card.minHeight` | `78` | Cartão de lembrete: altura mínima (cresce com o texto e com a fonte grande) |
| `size.card.circle` | `46` | Cartão de lembrete: círculo do ícone da categoria (alinhado ao topo) |
| `size.card.circleLeft` | `14` | Cartão de lembrete: distância do círculo até a borda esquerda |
| `size.card.circleTop` | `9` | Cartão de lembrete: distância do círculo até o topo |
| `size.card.glyph` | `25` | Cartão de lembrete: glifo da categoria dentro do círculo |
| `size.card.textGap` | `17` | Cartão de lembrete: vão entre o círculo e o texto |
| `size.card.metaIcon` | `15` | Cartão de lembrete: ícone da data e do lugar |
| `size.card.metaGap` | `7` | Cartão de lembrete: vão entre o ícone e o texto da data |
| `size.card.rightColumn` | `45` | Cartão de lembrete: largura da coluna da hora e do interruptor |
| `size.card.rightTop` | `13` | Cartão de lembrete: distância da hora até o topo (lembrete por horário) |
| `size.card.localShift` | `18` | Cartão de lembrete por local: quanto a coluna da hora desce (o cartão é mais alto) |
| `size.card.rightInset` | `35` | Cartão de lembrete: distância da coluna da direita até a borda |
| `size.card.dotsWidth` | `44` | Botão "mais opções": largura da área de toque |
| `size.card.dotsCenter` | `18` | Botão "mais opções": distância do centro das reticências até a borda direita |
| `size.card.dotsHeight` | `33` | Botão "mais opções": altura da área de toque |
| `size.card.thumbWidth` | `69` | Lembrete por local: largura da miniatura do mapa |
| `size.card.thumbHeight` | `70` | Lembrete por local: altura da miniatura do mapa |
| `size.toggle.card.width` | `35` | Interruptor (cartão · formulário): largura do trilho |
| `size.toggle.card.height` | `21` | Interruptor (cartão · formulário): altura do trilho |
| `size.toggle.card.thumb` | `18` | Interruptor (cartão · formulário): diâmetro da bolinha |
| `size.toggle.card.inset` | `1.5` | Interruptor (cartão · formulário): folga da bolinha até a borda do trilho |
| `size.toggle.form.width` | `43` | Interruptor (cartão · formulário): largura do trilho |
| `size.toggle.form.height` | `26` | Interruptor (cartão · formulário): altura do trilho |
| `size.toggle.form.thumb` | `22` | Interruptor (cartão · formulário): diâmetro da bolinha |
| `size.toggle.form.inset` | `2` | Interruptor (cartão · formulário): folga da bolinha até a borda do trilho |
| `size.sheet.paddingTop` | `11` | Folha inferior: espaço acima da alça |
| `size.sheet.paddingHorizontal` | `20` | Folha inferior: margem dos lados |
| `size.sheet.paddingBottom` | `35` | Folha inferior: espaço embaixo (a barra home do iOS) |
| `size.sheet.handleWidth` | `49` | Alça da folha: largura (só enfeite, não arrasta) |
| `size.sheet.handleHeight` | `4` | Alça da folha: altura |
| `size.sheet.handleGap` | `14` | Vão entre a alça e o título da folha |
| `size.sheet.actionTop` | `25` | Ação no canto da folha (o "Pronto" do horário): distância do topo |
| `size.sheet.actionRight` | `17` | Ação no canto da folha: distância da direita |
| `layout.columnMax` | `430` | Largura máxima da coluna do app na web (a das capturas de referência); no celular a coluna é a tela toda |
| `layout.readingMax` | `720` | Largura máxima de texto corrido (política de privacidade) |
| `layout.sheetMaxHeight` | `0.82` | Altura máxima de uma folha inferior, como fração da tela |
| `layout.onboardingSceneRatio` | `0.5934195064629847` | Onboarding: altura da cena (pino e balões) como fração da largura, a proporção da arte (505 por 851) |
<!-- tokens:tamanhos:fim -->

- Texto corrido (política de privacidade) tem no máximo `layout.readingMax` de largura.
- **Não há layout de duas colunas:** as referências só têm celular, o iPad não é alvo (`supportsTablet: false`) e tablets Android usam a mesma coluna cheia.
- Conferido em 375 por 812 (celular), 768 por 1024 (tablet) e 1280 por 800 (computador).
- Áreas seguras (entalhe, barra de gestos): quem cuida é o `react-native-safe-area-context` via `Tabs` e `Stack`; a folha do mapa tem `space.xxl` embaixo.
- Com fonte grande no sistema, o texto quebra de linha; `numberOfLines` só onde as reticências são aceitáveis (título do cartão).

## 15. Estados de carregamento, vazio, sucesso e erro

| Estado | Como aparece |
|---|---|
| Carregando a tela | `ActivityIndicator` grande em `colors.spinner`, centralizado, com "Carregando…" em `textStyles.bodyLg` e `colors.text.secondary`. Só quando não há dado antigo para mostrar; havendo, use puxar para atualizar. Na lista, só o texto "Carregando seus lembretes…" sob os chips |
| Carregando uma ação | Botão desabilitado com o rótulo no gerúndio ("Criando…"); o formulário fica bloqueado |
| Vazio | Título `textStyles.title` ("Nenhum lembrete ainda"), uma frase de orientação e o botão compacto "Novo lembrete". Na lista, uma busca sem resultado diz `Nenhum resultado para “texto”` e sugere conferir a grafia; filtro sem itens (sem busca) mostra só a dica |
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
| `colors.control.onCard` | `colors.bg.card` | 3,05:1 | 3:1 | ✓ exceção | Interruptor ligado no cartão |
| `colors.control.thumb` | `colors.control.onCard` | 3,10:1 | 3:1 | ✓ exceção | Bolinha do interruptor do cartão sobre o trilho ligado |
| `colors.control.onForm` | `colors.bg.card` | 6,25:1 | 3:1 | ✓ exceção | Interruptor ligado nos formulários e nas configurações |
| `colors.control.thumb` | `colors.control.onForm` | 6,36:1 | 3:1 | ✓ exceção | Bolinha do interruptor do formulário sobre o trilho ligado |
| `colors.control.on` | `colors.bg.card` | 6,20:1 | 3:1 | ✓ exceção | Preenchimento do controle deslizante do raio |
| `colors.feedback.infoBar` | `colors.feedback.infoBg` | 6,24:1 | 3:1 | ✓ exceção | Faixa lateral do aviso informativo |
| `colors.category.green.ink` | `colors.category.green.bg` | 14,61:1 | 3:1 | ✓ exceção | Glifo do ícone da categoria green |
| `colors.category.orange.ink` | `colors.category.orange.bg` | 16,47:1 | 3:1 | ✓ exceção | Glifo do ícone da categoria orange |
| `colors.category.blue.ink` | `colors.category.blue.bg` | 7,89:1 | 3:1 | ✓ exceção | Glifo do ícone da categoria blue |
| `colors.category.purple.ink` | `colors.category.purple.bg` | 15,42:1 | 3:1 | ✓ exceção | Glifo do ícone da categoria purple |
| `colors.category.pink.ink` | `colors.category.pink.bg` | 16,23:1 | 3:1 | ✓ exceção | Glifo do ícone da categoria pink |
| `colors.category.green.tagInk` | `colors.category.green.tag` | 5,15:1 | 4,5:1 | ✓ | Texto da etiqueta "Por horário" da categoria green |
| `colors.category.orange.tagInk` | `colors.category.orange.tag` | 11,63:1 | 4,5:1 | ✓ | Texto da etiqueta "Por horário" da categoria orange |
| `colors.category.blue.tagInk` | `colors.category.blue.tag` | 4,83:1 | 4,5:1 | ✓ | Texto da etiqueta "Por horário" da categoria blue |
| `colors.category.purple.tagInk` | `colors.category.purple.tag` | 4,82:1 | 4,5:1 | ✓ | Texto da etiqueta "Por horário" da categoria purple |
| `colors.category.pink.tagInk` | `colors.category.pink.tag` | 5,03:1 | 4,5:1 | ✓ | Texto da etiqueta "Por horário" da categoria pink |
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
| 21/09/2026 | **As 15 imagens de `referencias/` são a fonte de verdade visual** (cópia integral e conferida por SHA-256 das capturas do João). A paleta foi medida contra elas: 21 de 29 pontos batem com os tokens (ΔE ≤ 1,5); 4 valores existem só no app web e 4 são fundos em degradê (`referencias/MEDICOES.md`) | O João entregou todas as imagens do app e pediu o Design System "em cima" delas. Converter o perfil de cor da tela para sRGB evitou comparar o laranja cru `#EB603C` das capturas com o token `#FE532A` |
| 21/09/2026 | **Escala:** tamanhos fixos em dp derivados das imagens (`dp = du × 430 / 851`), layout flexível na largura, texto nunca abaixo de 12; a coluna da web volta a 430. **Ainda não aplicada:** entra com cada tela | As capturas são de uma coluna de 430 px. Fixo e com piso de 12 mantém a leitura e o tamanho de fonte do sistema; o app web escalava tudo pela largura e chegava a 9 |
| 21/09/2026 | **Tokens da folha, da barra de abas e do palco:** `radius.sheet` 19, `size.sheet.*` (alça de 49 por 4), `shadow.sheet`/`tabBar`/`column`, véu `colors.overlay` verde-escuro a 46%, `colors.bg.stage` verde `#0D2A1B` (era areia), `layout.columnMax` 430 (era 560), tempos e curva das folhas (`motion.duration.scrim/sheet`, `motion.curve.*`) | Valores do CSS do app web (`../lembreiAI`, versão do disco). A conferência lado a lado com as capturas acontece quando cada folha e a barra de abas entram nas telas, nos próximos commits |
| 21/09/2026 | **Ícones: Lucide no lugar de Ionicons** (`lucide-react-native` com `react-native-svg`, ambos gratuitos), traço por papel em `iconStroke.*` | As capturas e o app web desenham com Lucide; o Ionicons tem outro traço e outras formas (calendário, relógio, pino, lâmpada). O `react-native-svg` é o que o SDK 57 fixa (15.15.4). Pacote em `moduleNameMapper` no Jest (só publica `.mjs`) |
| 21/09/2026 | **Interruptor próprio** (`Toggle` com duas variantes) no lugar do `Switch` do sistema; verde do cartão `#2EA275` em vez do `#30AB7B` da imagem | O `Switch` do sistema não tem o tamanho nem a cor das imagens (35 por 21 e 43 por 26). O `#30AB7B` medido dá 2,76:1 com o cartão e 2,80:1 com a bolinha, abaixo dos 3:1 do WCAG 1.4.11 que o teste de contraste exige; escurecer 5% resolve (3,05:1 e 3,10:1) e a diferença não se vê. Voltar ao valor da imagem é trocar `palette.toggleCardOn` |
| 21/09/2026 | **Etiqueta do cartão com texto escurecido** (`colors.category.*.tagInk`); a lista, o cabeçalho verde, a marca, o botão de vidro e a busca entram como no original, com o texto no piso de 12 | Na imagem o texto da etiqueta azul dá 2,7:1 e o rosa 2,4:1 sobre o fundo da etiqueta; o `fg` escurecido só até 4,5:1 mantém a cor e cumpre o teste. O original usa texto de 9 a 10 dp nas etiquetas, nos chips e nas datas, abaixo do piso do Design System: sobe para 12 e os cartões ficam um pouco mais altos que na imagem |

## 19. Pendências

- **Corte óptico do Source Serif 4:** os pacotes trazem um corte por peso. Comparar os títulos grandes com as referências (o app web fixa `opsz` por estilo); se destoarem, gerar instâncias estáticas com o corte de título.
- **Peso das fontes na web:** cada arquivo `.ttf` tem 110 KB (Nunito Sans) e 322 KB (Source Serif 4). Um subconjunto latino em `woff2` reduziria, se o carregamento incomodar.
- **Portar as telas e folhas de `referencias/`** (tabela da seção 2.3), na ordem da tarefa `visual-original-no-expo`. A barra de abas passa a ser Início, Lembretes, Mapa e Configurações.
- **Tokens a criar** junto com cada tela: interruptor de cartão, vidro, botão de perigo, folha, avisos, texto sobre verde e os três degradês (lista e configurações, formulário, contas). Valores exatos em `referencias/MEDICOES.md`.
- **Calendário próprio:** o original usa o popup do navegador; o app nativo precisa de um seletor de data desenhado no padrão das folhas `13` e `14`.
- **Leitura com VoiceOver e TalkBack** e **navegação por teclado** na web: verificar em aparelho real.
- **Modo escuro:** fora de escopo até haver referência.
- **Layout de tablet nativo:** não desenhado (só existe referência de celular).
