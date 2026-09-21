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

Cada tela e cada folha do app tem uma imagem em `referencias/`. O estado do Expo é o de 21/09/2026, conferido por captura de tela e leitura do código. A barra de abas das imagens é **Início, Lembretes, Mapa e Configurações** (o Início abre o onboarding, a rota `/` do app web); "Novo lembrete" abre pelo botão laranja da lista. O Expo tem as quatro abas (Início, Lembretes, Mapa, Configurações); "Novo" deixou de ser aba e abre pelo botão laranja da lista.

| Imagem | Tela | Estado no Expo |
|---|---|---|
| [`01`](referencias/01-onboarding.png) | Onboarding | Feito (`Onboarding`, aba Início e primeira tela do visitante); ver 11.10 |
| [`02`](referencias/02-entrar.png) | Entrar | Feito (`AuthLayout`, mais Criar conta, Recuperar e Redefinir); ver 11.15; falta só o horizonte espelhado do rodapé |
| [`03`](referencias/03-recorte-degrade-do-formulario.png) | Recorte do degradê do formulário | Amostra de cor (usada nas medições) |
| [`04`](referencias/04-novo-lembrete-por-data-e-horario.png) | Novo lembrete, por data e horário | Feito (`FormularioDeLembrete`); ver 11.11 |
| [`05`](referencias/05-folha-minha-conta.png) | Folha "Minha conta" | Feito (`ContaSheet`, na lista e no formulário); ver 11.13 |
| [`06`](referencias/06-novo-lembrete-por-local.png) | Novo lembrete, por local | Feito (busca de endereço, mapa Leaflet e raio); ver 11.11 |
| [`07`](referencias/07-lista-meus-lembretes.png) | Meus lembretes | Feito (11.9); o menu "⋯" tem Editar e Excluir |
| [`08`](referencias/08-configuracoes.png) | Configurações | Feito (`CartaoDeConfig`, cabeçalho verde); ver 11.14; sem o cartão "Instalar o app" (é do app web instalável) |
| [`09`](referencias/09-sucesso-lembrete-criado.png) | Lembrete criado | Feito (`SucessoHeroi`, `CartaoDeResumo`); ver 11.12 |
| [`10`](referencias/10-confirmar-exclusao.png) | Confirmar exclusão | Feito (`ConfirmSheet`), na lista e na tela de sucesso |
| [`11`](referencias/11-folha-menu-do-lembrete.png) | Menu do lembrete | Feito (`ReminderMenu`, com Editar e Excluir) |
| [`12`](referencias/12-seletor-de-data.png) | Seletor de data | Calendário próprio (`CalendarSheet`, 11.11): o original usa o popup do navegador, que não existe no celular |
| [`13`](referencias/13-folha-horario.png) | Folha Horário | Feito (`TimeSheet`, duas rodas); ver 11.11 |
| [`14`](referencias/14-folha-repetir.png) | Folha Repetir | Feito (`RepeatSheet`); ver 11.11 |
| [`15`](referencias/15-novo-lembrete-por-local-repetindo.png) | Novo lembrete, por local, repetindo | Feito (é a `06` com Repetir em destaque); ver 11.11 |

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
| `palette.optionBadge` | `#195A48` | Selo de seleção dos cartões de modo e das linhas escolhidas |
| `palette.sliderThumb` | `#FFFEFF` | Bolinha do controle deslizante do raio |
| `palette.hint` | `#717074` | Subtítulo do cabeçalho claro do formulário |
| `palette.suggestionHover` | `#F2F5F0` | Sugestão de endereço com o ponteiro em cima (web) |
| `palette.mapControl` | `#FDFDFD` | Botões que flutuam sobre o mapa do formulário |
| `palette.mapControlPressed` | `#F0F0F0` | Botão sobre o mapa pressionado |
| `palette.mapControlDivider` | `#E2E2E2` | Divisória entre os botões de zoom do mapa |
| `palette.wheelItem` | `#9EA1A8` | Número não escolhido da roda do horário (o app usa `colors.text.secondary` para dar contraste) |
| `palette.rowHover` | `#F7F8F4` | Linha de menu com o ponteiro em cima (web) |
| `palette.rowPressed` | `#EEF1EA` | Linha de menu pressionada |
| `palette.dangerTint` | `#FBE7E4` | Círculo do ícone de excluir e linha de excluir pressionada |
| `palette.dangerRowHover` | `#FDF3F1` | Linha de excluir com o ponteiro em cima (web) |
| `palette.tabInactive` | `#777C8A` | Rótulo e ícone da aba inativa (medido nas capturas) |
| `palette.tabActiveIcon` | `#134B36` | Ícone da aba ativa |
| `palette.homeIndicator` | `#B7B3AE` | Traço "home" do iOS sob a barra de abas |
| `palette.tabBarBg` | `#F8F8F4` | Fundo da barra de abas |
| `palette.sucessoCategoria` | `#D4EADE` | Círculo atrás do ícone da categoria no cartão de resumo do sucesso |
| `palette.sucessoDica` | `#D6ECE0` | Círculo atrás da lâmpada da dica do sucesso |
| `palette.sucessoDado` | `#F7F5F3` | Círculo dos dados do resumo (Data, Horário, Local, Repetir) |
| `palette.sucessoDadoAnel` | `#E6E5E4` | Anel do círculo dos dados do resumo |
| `palette.sucessoSeloAnel` | `#DCEBE2` | Anel do selo "Ativo" |
| `palette.contaPilula` | `#A9F7D4` | Texto da pastilha "Criar conta" sobre o verde das telas de conta |
| `palette.contaLink` | `#9FF3D0` | Link "Voltar para entrar" sobre o verde das telas de conta |
| `palette.medidorMedio` | `#E8A33D` | Barra do meio do medidor de força da senha (senha razoável) |
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
| `colors.icon.onFrost` | `#12432F` | `palette.forest900` | Ícone dos botões de ação sobre o fundo `frost` (Editar, Excluir, Compartilhar) |
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
| `colors.border.selectedBand` | `#C6E4D5` | `palette.mint200` | Contorno da faixa que marca o número escolhido nas rodas do horário |
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
| `colors.control.suggestionHover` | `#F2F5F0` | `palette.suggestionHover` | Sugestão de endereço com o ponteiro em cima (web) |
| `colors.control.rowPressed` | `#EEF1EA` | `palette.rowPressed` | Linha de menu pressionada |
| `colors.control.dangerRowHover` | `#FDF3F1` | `palette.dangerRowHover` | Linha de excluir com o ponteiro em cima (web) |
| `colors.control.dangerRowPressed` | `#FBE7E4` | `palette.dangerTint` | Linha de excluir pressionada |
| `colors.control.badge` | `#195A48` | `palette.optionBadge` | Selo de escolhido (o visto) dos cartões de modo e das linhas escolhidas |
| `colors.control.sliderThumb` | `#FFFEFF` | `palette.sliderThumb` | Bolinha do controle deslizante do raio |
| `colors.control.haloHover` | `rgba(20, 40, 30, 0.07)` | — | Halo atrás das reticências do cartão com o ponteiro em cima (web) |
| `colors.control.haloPressed` | `rgba(20, 40, 30, 0.13)` | — | Halo atrás das reticências do cartão pressionado |
| `colors.feedback.dangerWash` | `#FFF5F5` | `palette.red50` | Fundo da zona de perigo |
| `colors.feedback.successBg` | `#E7F4EB` | `palette.mint50` | Fundo do aviso de sucesso |
| `colors.feedback.infoBg` | `#DDE8DD` | `palette.mintTint` | Fundo do aviso informativo (ex.: "você está dentro do raio") |
| `colors.feedback.infoBar` | `#185C4B` | `palette.forest700` | Faixa lateral do aviso informativo |
| `colors.feedback.emptyCircle` | `#DBF1E5` | `palette.mint100` | Círculo atrás do ícone do estado vazio |
| `colors.feedback.errorBg` | `#FDF0EE` | `palette.alertErrorBg` | Fundo do aviso de erro (todo `Banner` de erro: contas, configurações e formulário) |
| `colors.feedback.errorInk` | `#8E2418` | `palette.alertErrorInk` | Texto e ícone do aviso de erro (todo `Banner` de erro) |
| `colors.feedback.infoInk` | `#1B4436` | `palette.alertInfoInk` | Texto do aviso informativo |
| `colors.feedback.tipCircle` | `#C3DFCE` | `palette.tipCircle` | Círculo atrás da lâmpada do cartão de dica |
| `colors.feedback.dangerCircle` | `#FBE7E4` | `palette.dangerTint` | Círculo atrás do ícone de excluir e de sair |
| `colors.onboarding.bg` | `#12301F` | `palette.onboardingBg` | Fundo do Onboarding enquanto a foto carrega |
| `colors.onboarding.pagerOn` | `#F8F9F9` | `palette.pagerOn` | Ponto da página ativa do Onboarding |
| `colors.onboarding.pagerOff` | `rgba(255, 255, 255, 0.26)` | — | Pontos das outras páginas do Onboarding |
| `colors.status.active` | `#029554` | `palette.statusGreen` | Ponto do selo "Ativo" |
| `colors.sucesso.categoria` | `#D4EADE` | `palette.sucessoCategoria` | Círculo atrás do ícone da categoria no cartão de resumo |
| `colors.sucesso.dica` | `#D6ECE0` | `palette.sucessoDica` | Círculo atrás da lâmpada da dica |
| `colors.sucesso.dado` | `#F7F5F3` | `palette.sucessoDado` | Círculo dos dados do resumo (Data, Horário, Local, Repetir) |
| `colors.sucesso.dadoAnel` | `#E6E5E4` | `palette.sucessoDadoAnel` | Anel do círculo dos dados do resumo |
| `colors.sucesso.seloAnel` | `#DCEBE2` | `palette.sucessoSeloAnel` | Anel do selo "Ativo" |
| `colors.conta.barra` | `rgba(255, 255, 255, 0.06)` | — | Barra de vidro do rodapé das telas de conta ("Ainda não tem conta?") |
| `colors.conta.barraAnel` | `rgba(190, 255, 228, 0.18)` | — | Contorno da barra de vidro do rodapé |
| `colors.conta.pergunta` | `#CCD8D0` | `palette.onDark200` | Texto da pergunta na barra de vidro do rodapé |
| `colors.conta.pilula` | `rgba(159, 243, 208, 0.15)` | — | Fundo da pastilha de ação na barra de vidro |
| `colors.conta.pilulaAnel` | `rgba(159, 243, 208, 0.28)` | — | Contorno da pastilha de ação |
| `colors.conta.pilulaTexto` | `#A9F7D4` | `palette.contaPilula` | Texto da pastilha de ação |
| `colors.conta.link` | `#9FF3D0` | `palette.contaLink` | Link de voltar do rodapé, quando não há barra de vidro |
| `colors.conta.nota` | `#B1C3B8` | `palette.onDark300` | Nota do cadeado no pé das telas de conta |
| `colors.conta.medidorFraco` | `#D43A2A` | `palette.danger` | Medidor de força: senha fraca (uma barra) |
| `colors.conta.medidorMedio` | `#E8A33D` | `palette.medidorMedio` | Medidor de força: senha razoável (duas barras) |
| `colors.conta.medidorForte` | `#029554` | `palette.statusGreen` | Medidor de força: senha forte (três barras) |
| `colors.tab.background` | `#F8F8F4` | `palette.tabBarBg` | Fundo da barra de abas |
| `colors.tab.inactive` | `#777C8A` | `palette.tabInactive` | Rótulo e ícone da aba inativa |
| `colors.tab.activeIcon` | `#134B36` | `palette.tabActiveIcon` | Ícone da aba ativa |
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
| `colors.glass.ctaCircle` | `rgba(255, 255, 255, 0.13)` | — | Círculo da seta dentro do botão "Criar lembrete" |
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
| `colors.map.control` | `#FDFDFD` | `palette.mapControl` | Botões que flutuam sobre o mapa do formulário |
| `colors.map.controlPressed` | `#F0F0F0` | `palette.mapControlPressed` | Botão sobre o mapa pressionado |
| `colors.map.controlDivider` | `#E2E2E2` | `palette.mapControlDivider` | Divisória entre os botões de zoom do mapa |
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
| `textStyles.sucessoSubtitulo` | 15 | 21 | `NunitoSans_400Regular` | Subtítulo da tela de sucesso, em duas linhas |
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
| `fontSize.wheel` | `23` | Número da roda do horário |
| `fontSize.wheelOn` | `28` | Número escolhido da roda do horário |
| `fontSize.colon` | `26` | Dois-pontos entre as rodas do horário |
| `fontSize.sucessoTitulo` | `31` | Título da tela de sucesso, "Lembrete criado com sucesso!" (60,5 du no original; fora de `textStyles`: altura de linha 1,03, sem descendentes nas duas linhas fixas) |
| `fontSize.sucessoSubtitulo` | `15` | Subtítulo da tela de sucesso (29 du no original) |
| `fontSize.contaTitulo` | `23` | Título do cartão das telas de conta (46 du no original) |
| `fontSize.contaMarca` | `16` | Nome da marca no alto das telas de conta (32 du no original) |
| `lineHeight.micro` | `16` | Altura de linha do tamanho de mesmo nome |
| `lineHeight.caption` | `18` | Altura de linha do tamanho de mesmo nome |
| `lineHeight.body` | `20` | Altura de linha do tamanho de mesmo nome |
| `lineHeight.bodyLg` | `24` | Altura de linha do tamanho de mesmo nome |
| `lineHeight.heading` | `24` | Altura de linha do tamanho de mesmo nome |
| `lineHeight.title` | `26` | Altura de linha do tamanho de mesmo nome |
| `lineHeight.display` | `34` | Altura de linha do tamanho de mesmo nome |
| `lineHeight.sucessoTitulo` | `32` | Altura de linha do tamanho de mesmo nome |
| `lineHeight.sucessoSubtitulo` | `21` | Altura de linha do tamanho de mesmo nome |
| `lineHeight.contaTitulo` | `28` | Altura de linha do tamanho de mesmo nome |
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
| `radius.campo` | `13` | Caixa do campo de texto das telas de conta e da folha "Minha conta" |
| `radius.field` | `15` | Campos e seletores dentro dos cartões do formulário |
| `radius.lg` | `16` | Painéis grandes |
| `radius.form` | `17` | Cartões do formulário de novo lembrete |
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
| `shadow.formCard` | `0px 1px 3px rgba(20, 40, 30, 0.05), 0px 4px 12px rgba(20, 40, 30, 0.04), inset 0px 0px 0px 1px rgba(255, 255, 255, 0.8)` | Cartão do formulário (anel branco por dentro e sombra suave) |
| `shadow.field` | `inset 0px 0px 0px 1px rgba(231, 232, 234, 1), 0px 1px 2px rgba(20, 40, 30, 0.03)` | Campo branco do formulário (anel cinza por dentro) |
| `shadow.fieldHover` | `inset 0px 0px 0px 1px rgba(214, 213, 213, 1), 0px 1px 2px rgba(20, 40, 30, 0.03)` | Campo do formulário com o ponteiro em cima (web) |
| `shadow.fieldFocus` | `inset 0px 0px 0px 2px rgba(24, 92, 75, 1), 0px 0px 0px 4px rgba(24, 92, 75, 0.15)` | Campo do formulário em foco (anel verde e halo) |
| `shadow.optionOn` | `inset 0px 0px 0px 2px rgba(24, 92, 75, 1)` | Cartão de modo escolhido (anel verde por dentro) |
| `shadow.slider` | `0px 2px 6px rgba(0, 0, 0, 0.25)` | Bolinha do controle deslizante |
| `shadow.suggestions` | `0px 6px 16px rgba(20, 40, 30, 0.18), inset 0px 0px 0px 1px rgba(231, 232, 234, 1)` | Lista de sugestões de endereço (sombra funda e anel cinza) |
| `shadow.cartaoDeConta` | `0px 12px 30px rgba(6, 32, 20, 0.3)` | Cartão creme das telas de conta, flutuando sobre o verde |
| `shadow.campoErro` | `inset 0px 0px 0px 2px rgba(212, 58, 42, 1), 0px 1px 2px rgba(20, 40, 30, 0.03)` | Campo de texto com erro (anel vermelho por dentro) |
| `shadow.campoErroFoco` | `inset 0px 0px 0px 2px rgba(212, 58, 42, 1), 0px 0px 0px 4px rgba(212, 58, 42, 0.16)` | Campo de texto com erro e em foco (anel vermelho e halo vermelho) |
| `shadow.cartaoDoSucesso` | `inset 0px 0px 0px 1px rgba(255, 255, 255, 0.8)` | Cartões de resumo e de dica da tela de sucesso: só o anel branco por dentro |
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
| `gradients.rodaDeHorario` | `linear-gradient(to bottom, rgba(250, 249, 246, 0.92) 0%, rgba(250, 249, 246, 0.76) 10%, rgba(250, 249, 246, 0.45) 30%, rgba(250, 249, 246, 0) 40%, rgba(250, 249, 246, 0) 60%, rgba(250, 249, 246, 0.45) 70%, rgba(250, 249, 246, 0.76) 90%, rgba(250, 249, 246, 0.92) 100%)` | Esmaecimento das rodas do horário (números longe do meio somem no fundo da folha) |
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

Regras: uma ação primária por tela. Ação destrutiva sempre pede confirmação (`confirmar`, em `src/lib/confirm.ts`). O botão tem `accessibilityRole="button"` e a prop `disabled`, que o React Native converte no estado do leitor de tela (e o react-native-web, em `aria-disabled`).

- **Excluir sólido e cancelar** (`variant="destructive"` e `"frost"`): só dentro da confirmação de uma ação sem volta. `destructive` usa `colors.action.danger` (ponteiro `dangerHover`, pressionado `dangerPressed`) com texto `colors.text.onAction`; `frost` usa `colors.action.frost` (`frostHover`, `frostPressed`) com texto `colors.text.primary`.
- **Compacto** (`compact`, com `icon` opcional): altura `size.buttonCompact`, padding `space.lg`, rótulo `fontSize.micro` em negrito e sem o brilho `shadow.cta`; o ícone (`size.icon.xs`, traço `iconStroke.action`) vai à esquerda, na cor do rótulo, a `space.sm`. É o "Novo lembrete" do cabeçalho verde.
- **Vidro** (`src/components/GlassButton.tsx`): botão redondo de `size.glassButton` sobre o verde escuro, para busca e conta. Fundo `colors.glass.fill` (ponteiro `fillHover`, pressionado `fillPressed` e escala `motion.pressedScale`), contorno `borderWidth.hairline` em `colors.glass.border`, ícone branco de `size.icon.md`. Sempre com `accessibilityLabel` (o ícone sozinho não diz nada) e toque de 44. O desfoque de fundo do original não é reproduzido: sobre um verde quase liso não se vê. Foco de teclado em menta (`colors.border.focusOnDark`), porque o verde-floresta some no fundo escuro.

## 10. Campos e formulários

Componente: `src/components/TextField.tsx` (campo das telas de conta e da folha "Minha conta"; o campo do formulário de lembrete é o `FormInput`, seção 11.11).

- **Anatomia:** rótulo acima (`textStyles.micro` em `fontFamily.bold`, `colors.text.primary`), e a caixa branca (`colors.bg.field`) de `size.campo.height` de altura e raio `radius.campo`, com o anel cinza por dentro (`shadow.field`, em vez de borda). O texto usa `textStyles.caption`, recuo `size.campo.padding`, placeholder `colors.text.placeholder`. Cada campo fica a `size.campo.top` do de cima e o vão do rótulo à caixa é `size.campo.gap`.

| Estado | Como fica |
|---|---|
| Repouso | como na anatomia |
| Foco | anel verde-floresta e halo (`shadow.fieldFocus`) |
| Erro | anel vermelho (`shadow.campoErro`); abaixo, o ícone de alerta (`size.campo.mensagemIcon`) e a mensagem em `textStyles.micro` e `colors.text.danger`, anunciada como alerta; o fundo continua branco |
| Erro em foco | anel vermelho com halo vermelho (`shadow.campoErroFoco`): o verde do foco não aparece |
| Desabilitado | fundo `colors.bg.disabled`, texto `colors.text.secondary` |
| Dica | `textStyles.micro` em `colors.text.secondary`; some quando há erro |

- **Senha:** com `secureTextEntry` o campo começa escondido e ganha o botão do olho (`size.campo.eye` de largura, ícone `eye` ou `eye-off` de `size.campo.eyeIcon`, `colors.icon.muted` e `colors.icon.default` com o ponteiro em cima). O botão se chama "Mostrar senha" ou "Ocultar senha" e não entra na ordem de tab (`focusable={false}` no celular e `tabIndex={-1}` na web: o `Pressable` do react-native-web só lê o `tabIndex`).
- **Rótulo sempre visível.** Placeholder é exemplo ("seu@email.com"), não rótulo.
- **Teclado certo:** o `TextField` escolhe sozinho só a capitalização (`autoCapitalize`: nenhuma em e-mail, senha e números, para o teclado não pôr a 1ª letra do e-mail em maiúscula); `keyboardType` e `autoComplete` vêm de quem o usa (`email-address` com `email`; `current-password` ou `new-password` na senha).
- **Erro em português, dizendo o que fazer.** Mensagem curta, sem código técnico.
- **Anel suave é identidade** (1,2:1 sobre o fundo, como nas referências). O foco é o reforço: exceção registrada na seção 16.
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
| `error` | `colors.feedback.errorBg` | `colors.feedback.errorInk` | Falha ao entrar, salvar, carregar |
| `success` | `colors.feedback.successBg` | `colors.text.success` | "Senha redefinida. Entre com a nova senha." |
| `info` | `colors.feedback.infoBg` e faixa `colors.feedback.infoBar` | `colors.text.primary` | "Você está dentro do raio de 1 lembrete", local definido |

Raio `radius.sm`, padding `space.md`, texto `textStyles.body`. O de erro tem `accessibilityRole="alert"`, para o leitor de tela anunciá-lo. Com a prop `icon` o aviso leva um ícone antes do texto, na cor dele (`triangle-alert` no erro, `circle-check` no sucesso): o segundo sinal além da cor, usado na folha "Minha conta" (11.13).

### 11.4 Chip

Opção de escolha rápida e filtro (`src/components/Chip.tsx`). Altura `size.chip` e área de toque de 44 (`size.hitSlop`), raio `radius.pill`, rótulo em `fontSize.micro` e negrito. Com `count`, o número vem depois do rótulo (`fontFamily.semibold`, `colors.text.chipCount`), a `space.lg`; zero também aparece. Selecionado: `colors.control.chipOn` e texto branco (rótulo e contagem). Não selecionado: `colors.control.chipOff`, contorno `colors.border.chip` e rótulo `colors.text.chip`. Para o leitor de tela lê "Hoje: 3" e informa se está selecionado. Na lista os quatro chips dividem a largura (`flexGrow`).

### 11.5 Folha (modal inferior)

Componente `src/components/Sheet.tsx`. Véu `colors.overlay` (verde-escuro a 46%); folha `colors.bg.card` colada no fim da tela, cantos de cima `radius.sheet`, sombra `shadow.sheet`, no máximo `layout.sheetMaxHeight` da altura da tela (o resto rola). Espaços em `size.sheet.*`: a base nunca é menor que a área segura do sistema. Alça decorativa de `size.sheet.handleWidth` por `size.sheet.handleHeight` em `colors.tab.indicator` (não arrasta nem fecha). Título `textStyles.sheetTitle`; subtítulo `textStyles.micro` em `colors.text.secondary`, a `space.xs` do título. A ação do canto (o "Pronto" do horário) fica a `size.sheet.actionTop` do topo e `size.sheet.actionRight` da direita. Na web a folha tem `layout.columnMax` de largura máxima e fica centralizada, senão viraria uma faixa da largura da janela (o `Modal` sai da coluna do app).

- **Entrada:** o véu aparece em `motion.duration.scrim` (ease-out) e a folha sobe de baixo em `motion.duration.sheet`, com a curva `motion.curve`. Com "reduzir movimento" (`src/lib/movimento.ts`) ela já entra pronta. Não há animação de saída (some na hora) nem arrastar para fechar, como no app web.
- **Fechar:** toque no véu, botão voltar do Android, Esc na web e o gesto de escape do leitor de tela (iOS).
- **Teclado:** com as barras do sistema translúcidas o Android não redimensiona a janela para o teclado (a `adjustResize` não vale mais em tela cheia), então a folha ficava por baixo dele e escondia os campos de "Alterar senha". `useAlturaDoTeclado` (`src/lib/teclado.ts`) informa quanto do pé da tela o teclado cobre (no Android soma de volta a barra de navegação, que o evento desconta); a folha sobe essa altura e encolhe para caber acima do teclado e abaixo da barra de status, com um respiro de `space.md` (o resto rola). Com o teclado aberto a base não reserva a área segura, porque o teclado já a cobre. Na web não há evento e nada muda.
- **Acessibilidade:** papel `dialog`, modal, título como nome e como cabeçalho; o resto da tela sai da árvore de acessibilidade enquanto a folha está aberta.
- **Linha de lista da folha** (`src/components/LinhaDeMenu.tsx`, usada pelo menu do lembrete e pela folha "Minha conta"): círculo com o ícone (`size.menu.circle`), título em negrito e, se houver, uma linha de apoio em `textStyles.micro` e `colors.text.secondary`. A ação sem volta (Excluir, Sair) usa `colors.feedback.dangerCircle` e `colors.text.danger`. Ícone e círculo ficam centrados: na captura `05` o glifo aparece no alto do círculo por um efeito de CSS do original, e a `11` o mostra no meio.
- **Menu do lembrete** (`src/components/ReminderMenu.tsx`, aberto pelas reticências do cartão): título do lembrete, data e hora como subtítulo, e uma lista branca de cantos `radius.lg` com contorno `colors.border.field`. Cada linha (`size.menu.*`) tem um círculo com o ícone (menta `colors.bg.iconCircle` no Editar; rosado `colors.feedback.dangerCircle` na lixeira) e o rótulo em negrito; Excluir usa `colors.text.danger`. Ponteiro em cima e pressionado trocam o fundo (`colors.control.rowHover` e `rowPressed`; rosados no Excluir). A linha Editar só aparece quando quem abre sabe editar.
- **Confirmação** (`src/components/ConfirmSheet.tsx`, no lugar do `Alert` do sistema, que muda de cara em cada plataforma): "Excluir lembrete?", a mensagem "“título” será removido e você não receberá mais esse aviso." e dois botões empilhados a `space.sm`: `destructive` (vermelho sólido `colors.action.danger`, texto branco) e `frost` ("Cancelar", `colors.action.frost`, texto escuro). Confirmar só confirma; Cancelar, o véu e o Esc só fecham. Sem aviso de "desfazer".

### 11.6 Abas e cabeçalho

- **Barra de abas** (`src/components/BarraDeAbas.tsx`, uma barra própria no lugar da padrão do React Navigation, ligada por `tabBar` em `Tabs` de `expo-router/js-tabs`): quatro abas iguais, Início, Lembretes, Mapa e Configurações. Fundo `colors.tab.background` com a sombra `shadow.tabBar` para cima, `size.tabBar.top` de espaço em cima e, embaixo, no mínimo `size.tabBar.bottom` (a área segura do sistema o substitui quando é maior). Cada aba tem o ícone de `size.tabBar.icon` com traço `iconStroke.tab` e o rótulo em `textStyles.micro`, ambos em `colors.tab.inactive`; a ativa engrossa o traço (`iconStroke.base`), pinta o ícone de `colors.tab.activeIcon` e põe o rótulo em negrito e `colors.text.brand`. Pressionada, `opacity.tab`. Tocar na aba em que já se está não faz nada; o formulário de novo lembrete acende "Lembretes"; a tela de sucesso esconde a barra (`tabBarStyle: { display: 'none' }`). Papéis `tablist` e `tab`, `aria-current="page"` na ativa.
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

### 11.11 Formulário de novo lembrete

As peças do formulário (imagens `04`, `06` e `15`), em `src/components`:

- **Cartão** (`FormCard`): `colors.bg.card`, raio `radius.form`, recuo `size.form.cardPadding`, sombra `shadow.formCard` (anel branco por dentro e sombra suave).
- **Campo de texto** (`FormInput`, a descrição): branco (`colors.bg.field`), altura `size.form.field`, raio `radius.field`, sombra `shadow.field` (anel cinza por dentro); em foco `shadow.fieldFocus` (anel verde e halo). O rótulo fica fora, no cartão.
- **Seletor** (`SelectField`; data, horário e repetir): campo branco que abre uma folha. Uma linha com ícone, valor (`fontFamily.medium`) e seta para baixo; ou duas linhas (rótulo em negrito e valor em `colors.text.secondary`, ou em `colors.text.accent` e negrito quando há valor escolhido) com seta para o lado. Ponteiro em cima escurece o anel (`shadow.fieldHover`); pressionado encolhe (`motion.pressedScale`); desabilitado esmaece (`opacity.disabled`) e não responde.
- **Cartão de modo** (`OptionCard`; "Por data e horário" e "Por local"): papel `radio`. Escolhido: fundo branco, anel verde por dentro (`shadow.optionOn`) e o selo de visto (`colors.control.badge`, `size.form.optionBadge`); não escolhido: fundo de cartão e só o anel vazio de opção (`colors.border.strong`). Círculo do ícone `colors.bg.iconCircle`. Os dois cartões dividem a linha na proporção das caixas do original, 418 e 353 du (`layout.modeCardWeight`): o da data e horário é mais largo, porque o título dele é mais longo (com `flex: 1` nos dois, o texto encostava no selo no Android de 411 dp). A folga da direita cobre o selo, a distância dele até a borda e um respiro (`space.sm + size.form.optionBadge + space.xs`): o texto quebra antes de correr por baixo dele.
- **Controle deslizante** (`Slider`; o raio de aviso): trilho `colors.control.off`, preenchimento `colors.control.on`, bolinha `colors.control.sliderThumb` com `shadow.slider`, que passa meio raio de cada ponta. Toque, arrasto e, para o leitor de tela, papel `adjustable` com os gestos de aumentar e diminuir. Valor sempre no passo pedido e dentro dos limites.

A tela (`FormularioDeLembrete`, nas rotas `novo` e `editar?id=`), de cima para baixo: o cabeçalho claro (`CabecalhoClaro`: `gradients.cabecalhoClaro` mais cinco anéis brancos no canto direito, `size.form.header` de altura; o conteúdo desce com a barra de status do aparelho) com os botões redondos de voltar e de conta (`size.form.nav`, brancos, `shadow.float`), o título em serifa e "Na hora certa. No lugar certo."; o cartão **Descrição**; os dois **cartões de modo**; o cartão de **data, horário e repetir**; o cartão **Local (opcional)**, com o interruptor `form`; e, fixo embaixo sobre o esmaecimento `gradients.esmaecerParaPagina`, o botão **Criar lembrete** (`CtaButton`: laranja, `size.form.cta`, rótulo em serifa e a seta num círculo `colors.glass.ctaCircle`).

- **Modo:** o cartão "Por local" e o interruptor do Local são a mesma escolha. Por local, o campo Horário esmaece e não responde (o lembrete guarda o horário mesmo assim); Data e Repetir continuam ativos.
- **Local ligado:** a busca de endereço (`PlaceSearch`: Nominatim, só com 3 letras ou mais, 650 ms depois da última, pedido anterior cancelado; até cinco sugestões; falha diz "Não foi possível buscar agora."), o mapa (`MapaDeEscolha`, Leaflet + OpenStreetMap, `size.form.map` de altura; toque ou arrasto do pino põe o ponto e o nome do lugar vem do serviço 700 ms depois; o círculo mostra o raio), o raio (50 a 550 m de 10 em 10, padrão 150) e a dica "Você será avisado ao entrar no raio selecionado.". No mapa flutuam três botões: centralizar no pino, zoom e "Usar minha localização" (`colors.map.control`, `shadow.float`). A roda do mouse só dá zoom no mapa depois de um clique, senão rolar a página com o cursor em cima dele o faria dar zoom sozinho. **Teclado:** a lista de sugestões nasce debaixo do campo de busca, justamente onde o teclado fica; com a busca em foco e o teclado aberto (`useAlturaDoTeclado`) o formulário rola até o cartão do Local ficar no alto da área visível, abaixo da barra de status (conferido no Android, onde as sugestões apareciam atrás do teclado).
- **Salvar:** a descrição é obrigatória ("Dê uma descrição ao lembrete.", embaixo do campo, em `colors.text.danger`); por local precisa de um ponto escolhido ("Escolha o local no mapa ou busque um endereço."). Criar leva à tela de sucesso; editar volta de onde veio. Falha do banco: aviso `error` no topo e o botão volta a funcionar. **Decisões do app, diferentes do original:** o original grava um lembrete sem descrição como "Comprar água no mercado" e um "por local" sem ponto no endereço de exemplo de Fortaleza; o app exige a descrição e o ponto. A localização só é pedida quando a pessoa toca em "Usar minha localização".

As folhas do formulário (`Sheet`, seção 11.5):

- **Repetir** (`RepeatSheet`, imagem `14`): título "Repetir", uma lista branca de seis linhas (Nunca, Todos os dias, Dias úteis, Toda semana, Todo mês, Todo ano), cada uma com o título em negrito e a explicação embaixo (`REPEAT_OPTIONS.desc`). A linha escolhida tem o fundo `colors.feedback.successBg` e o selo de visto (`size.form.rowBadge`); as outras, um anel vazio. Papéis `radiogroup` e `radio`. Escolher uma linha aplica e fecha na hora.
- **Horário** (`TimeSheet`, imagem `13`): duas rodas (horas de 00 a 23 e minutos de 00 a 59) de cinco números visíveis (`layout.wheelRows`), com a faixa da escolha (`colors.feedback.successBg`, contorno `colors.border.selectedBand`) atrás do número do meio, que é maior e em negrito (`fontSize.wheelOn`); os outros esmaecem para o fundo da folha (`gradients.rodaDeHorario`) e usam `colors.text.secondary` (o cinza claro da imagem não chega a 4,5:1). O número vira escolhido depois de `120` ms parado; a hora vai para o campo sem fechar a folha, os minutos fecham sozinha depois de `800` ms se ninguém mexer mais. "Pronto" (`colors.text.accent`, no canto) e o véu fecham a qualquer hora. Cada roda tem papel `adjustable`, com os gestos de aumentar e diminuir.
- **Data** (`CalendarSheet`): o app web usa o popup do navegador (imagem `12`), que não existe no celular; o app tem calendário próprio, de seis semanas de domingo a sábado (`src/lib/calendario.ts`), com as setas para trocar de mês, o dia escolhido em `colors.control.chipOn`, o de hoje com contorno e o atalho "Hoje". Dias do mês vizinho em `colors.text.placeholder`. Escolher um dia aplica e fecha.

### 11.12 Tela de sucesso do lembrete

A tela da imagem `09` (rota `sucesso?id=…`, `app/(app)/sucesso.tsx`): aparece depois de criar um lembrete e lê o lembrete pelo `id`. Fica sobre a foto de folhagem `assets/art/bg-success.jpg` (`contentFit="cover"`, presa ao topo, parada; a coluna rola por cima) num canvas de `size.sucesso.canvas` de altura (1848 du): em tela mais baixa rola, e o link "Criar outro lembrete" só aparece rolando, como nas capturas. **Não é uma aba**: a barra de abas fica escondida (`tabBarStyle: { display: 'none' }`), então a tela sempre tem saída (Fechar, "Ver todos os lembretes" e, sem lembrete, um botão para a lista). Só monta com a aba em foco: as abas ficam montadas e o herói tem um pulso infinito que não deve rodar escondido; chegar de novo repete a animação. Em aparelho com entalhe tudo desce o que a barra de status passar da distância do botão de fechar (`size.sucesso.fecharTop`). As posições vêm dos vãos `size.sucesso.*` (diferença entre as posições medidas) e não de coordenadas soltas.

De cima para baixo:

- **Herói** (`SucessoHeroi`; geometria, cores, curvas e tempos em `src/design/heroi.ts`): o selo verde de cantos redondos (`HEROI.selo`, degradê e brilho em SVG) com o visto que se desenha, um brilho menta atrás, um anel fino, um disco com halo, duas ondas que crescem, 14 faíscas (nove círculos e cinco estrelas, em menta, branco, verde-floresta e laranja), um brilho diagonal que cruza o selo e dois pontos que cintilam para sempre. É decorativo (escondido do leitor de tela) e não recebe toque. A tabela abaixo é a linha do tempo.
- **Fechar**: `GlassButton` com `tamanho="fechar"` (`size.sucesso.fechar`, X de `size.sucesso.fecharIcon` com traço `iconStroke.action`), no canto direito. Leva à lista. O desfoque do fundo do original não é reproduzido (ver seção 9).
- **Título e subtítulo**: "Lembrete criado / com sucesso!" em serifa (`fontSize.sucessoTitulo` com `lineHeight.sucessoTitulo`, fora de `textStyles`: altura de linha 1,03, aceitável porque as duas linhas fixas não têm descendentes, como o título do Onboarding) e "Você será avisado na hora certa. / Pode ficar tranquilo." em `textStyles.sucessoSubtitulo` na cor `colors.text.secondary`. Entram subindo (`Subida`, 22 du). Cada um tem uma caixa de altura fixa (`size.sucesso.tituloBox`, `size.sucesso.subtituloBox`): o que vem embaixo não muda de lugar com a fonte.
- **Cartão de resumo** (`CartaoDeResumo`): `colors.bg.card`, raio `radius.sheet`, só o anel branco por dentro (`shadow.cartaoDoSucesso`). Cabeçalho: círculo `colors.sucesso.categoria` com o ícone da categoria em pé (o haltere e o avião não giram como na lista), o título em `textStyles.heading` (largura máxima `size.sucesso.resumo.tituloMax`, quebra em quantas linhas precisar, nunca é cortado) e o selo "Ativo" (`colors.feedback.successBg`, anel `colors.sucesso.seloAnel`, ponto `colors.status.active`; só aparece com o lembrete ativo). Depois Data e Horário lado a lado (o Horário também aparece no lembrete por local: mostra o que está gravado), um divisor `colors.border.divider`, e, **só por local** (decide o tipo do lembrete, não o nome do lugar: se o serviço de endereços não devolveu um nome, o endereço diz "Local escolhido", como o cartão da lista), a linha do Local (endereço numa linha com reticências, "Raio de N metros" e a miniatura `thumb-sucesso.jpg`, que é a mesma imagem para qualquer lugar, como no original) com outro divisor; por fim Repetir. Cada dado tem um círculo (`colors.sucesso.dado`, anel `colors.sucesso.dadoAnel`); o nome vai em `colors.text.placeholder` e o valor em `colors.text.primary`. O cartão fica dentro de uma reserva de altura (`size.sucesso.resumo.slot`, a da variante com local): as ações ficam no mesmo lugar com e sem local.
- **Ações** (`BotaoDeAcao`, três em partes iguais): fundo `colors.action.frost` (ponteiro em cima `frostHover`, pressionado `frostPressed` e `motion.pressedScale`), raio `size.sucesso.acao.radius`, ícone `colors.icon.onFrost`, rótulo `textStyles.micro` em `fontFamily.medium` e `colors.text.onFrost`. **Editar** abre `editar?id=`; salvando, volta ao sucesso, que continua dizendo "criado" (como no original). **Excluir** abre a folha de confirmação da lista (`ConfirmSheet`, imagem `10`); confirmar exclui e leva à lista, e a tela não mostra nada entre uma coisa e outra (senão piscaria "não existe mais"). **Compartilhar** envia o texto do lembrete (`src/lib/compartilhar.ts`); quando só deu para copiar, o rótulo vira "Copiado", e sem como copiar, "Indisponível", por `motion.duration.aviso`, e volta (o rótulo é uma região viva para o leitor de tela).
- **Dica inteligente** (`DicaInteligente`): cartão claro com o mesmo anel branco, círculo `colors.sucesso.dica` com a lâmpada e a seta. É um botão que abre o formulário novo (a dica é sobre lembretes recorrentes); ponteiro em cima clareia para `colors.bg.field`, pressionado encolhe. Não é o `TipCard` verde da lista, que só informa. O texto não tem quebra de linha forçada (o original tem um `\n` depois de "esquecer", que só cabe nos 430 px da captura): a largura máxima `size.sucesso.dica.textMax` fecha a primeira linha onde a imagem a fecha, e em tela mais estreita o texto quebra sozinho em duas linhas, sem deixar "esquecer" sozinho (medido no Android de 411 dp).
- **"Ver todos os lembretes"**: `Button` `secondary` (verde-floresta) com a seta, `size.sucesso.cta` de altura. **"Criar outro lembrete"** (`LinkButton`): texto cinza sem fundo, esmaece com `opacity.link` ao ser pressionado, com a área de toque completada até 44.
- **Sem lembrete**: enquanto a lista chega (página recarregada) mostra o indicador de carga; se o lembrete não existe mais, "Esse lembrete não existe mais." e um botão para a lista.

Linha do tempo do herói (segundos desde a chegada; `useMovimentoReduzido`, seção 13: com "reduzir movimento" fica o quadro final, sem ondas, faíscas nem brilho que passa, com o visto inteiro e os pontos parados; enquanto o sistema não responde, nada é desenhado):

| Camada | Começa | Termina | O que faz |
|---|---|---|---|
| Brilho | 0 | 1,0 | aparece e cresce de 0,7 a 1 |
| Disco | 0,05 | 0,95 | aparece e cresce de 0,55 a 1 |
| Selo | 0,10 | 0,85 | "estouro": aparece até 0,55 s, cresce de 0,35 a 1,09 e assenta em 1, girando de -10° a 2° a 0° |
| Anel | 0,12 | 1,12 | aparece e cresce de 0,55 a 1 |
| Visto | 0,55 | 1,10 | traço se desenha (só esse roda no JS: o SVG não anima no driver nativo) |
| Título | 0,6 | 1,4 | sobe 22 du e aparece |
| Onda 1 | 0,6 | 2,2 | cresce de 0,7 a 2,15 enquanto some (antes da vez fica parada em 0,7, como o `both` do CSS) |
| Subtítulo | 0,8 | 1,6 | igual ao título |
| Onda 2 | 0,98 | 2,58 | igual à onda 1 |
| Faíscas | 0,62 a 0,73 | 1,87 a 1,98 | cada uma dura 1,25 s: sai do centro, chega a 0,85 do tamanho e some |
| Brilho do selo | 1,15 | 2,05 | faixa inclinada -18° cruza o selo da esquerda para a direita |
| Pontos | 1,1 e 1,3 | 1,7 e 1,9 | aparecem; depois pulsam para sempre (1 a 0,35 de opacidade, ciclo de 2,8 s, a partir de 1,7 s e 2,6 s) |

### 11.13 Folha "Minha conta"

A folha da imagem `05` (`src/components/ContaSheet.tsx`), aberta pelo botão redondo de conta do cabeçalho da lista e do formulário de lembrete. É uma `Sheet` (11.5) com três etapas na mesma folha, e quando fecha, de qualquer jeito, volta ao menu e esquece o que foi digitado (inclusive a resposta de uma troca de senha que ainda estava no ar: ela é descartada, para não abrir a folha seguinte em "Senha alterada" nem com o aviso de erro de antes):

- **Menu:** o título é o nome do perfil (ou "Minha conta") e o subtítulo o e-mail. Numa lista branca (`LinhaDeMenu`), **Alterar senha** ("Pede a senha atual antes de trocar.", ícone `key-round`) e **Sair** ("Encerra a sessão neste aparelho.", em vermelho, ícone `log-out`). Sair só encerra a sessão e fecha a folha; quem leva à tela de entrada é a proteção de rotas do layout raiz.
- **Alterar senha:** "Confirme a senha atual e escolha a nova." Três `TextField` de senha (Senha atual, Nova senha com a dica "Pelo menos 8 caracteres, com letras e números.", Confirmar nova senha). Ao salvar, valida na ordem e mostra todos os avisos de uma vez, cada um no seu campo ("Informe sua senha atual.", a regra de `validarSenha` e "Repita a senha." ou "As senhas não são iguais."); digitar num campo apaga só o aviso dele. Com tudo certo chama `trocarSenha` (que confere a atual com um login); se o servidor recusar ("Senha atual incorreta.", sessão expirada, senha fraca, falta de rede), o aviso `error` com ícone aparece no topo e os campos ficam como estão. Enquanto salva, o botão diz "Salvando…", não aceita outro toque e os campos travam. "Voltar" volta ao menu e apaga o aviso do servidor.
- **Senha alterada:** título "Senha alterada", subtítulo "Use a nova senha da próxima vez que entrar.", o aviso `success` com ícone ("Pronto, sua senha foi trocada.") e o botão escuro "Fechar".

### 11.14 Configurações

A tela da imagem `08` (`app/(app)/config.tsx`, aba Configurações): o cabeçalho verde da lista (`GreenHeader`, com a marca, "Configurações" em `textStyles.display` e "Permissões e monitoramento." em `colors.text.onHeader`) e, por cima dele, a folha clara de cantos altos (`folhaSobreOCabecalho`, a mesma da lista) com os cartões, um por assunto, a `size.config.cardsGap` uns dos outros. Não usa o cabeçalho do React Navigation.

O cartão (`CartaoDeConfig`, em `src/components/CartaoDeConfig.tsx`): `colors.bg.card`, raio `radius.form`, `shadow.formCard`, recuo `size.config.cardV` por `size.config.cardH`. Cabeçalho com o círculo do ícone (`size.config.circle`, `colors.bg.iconCircle`), o ícone em cinza `colors.icon.muted` (como na captura), o título em negrito (é um cabeçalho para o leitor de tela), o subtítulo em `colors.text.secondary` e, à direita, a ação: o botão escuro compacto (`Button` `compact` `secondary`) ou o interruptor (`Toggle` `form`). Abaixo, avisos (`Banner` com ícone) e linhas de dados (`DadoDoCartao`: nome em cinza e valor em negrito à direita). O cartão de excluir conta é o único de perigo (`colors.feedback.dangerWash`, contorno `colors.border.dangerSoft`, título vermelho).

Os cartões, na ordem:

- **Conta:** o nome do perfil (ou "Minha conta"), o e-mail e o botão **Sair** (trava enquanto a conta está sendo excluída).
- **Lembretes por local:** o interruptor "Monitorar lembretes por local" liga e desliga a vigia. Aviso vermelho se a localização deu erro. Linhas: Permissão de localização ("permitida" ou "não permitida"), Lembretes monitorados, Dentro do raio agora e Mais próximo ("título · N m") só monitorando, Última posição ("há 30s", "há 2 min" ou "nunca", atualizada a cada `motion.duration.relogio`; "—" desligado) e Precisão do sinal ("± N m"; "—" desligado). Aviso informativo "Último aviso: título (há 5 min)." quando houve chegada.
- **Notificações:** "Estado: permitida." ou "não permitida." (com o aviso vermelho de como liberar) e quantos avisos por horário estão agendados; na web, "Não estão disponíveis na versão web." e nada mais.
- **Até onde vai o monitoramento:** três itens, com o começo em negrito: app aberto, aberto e minimizado, fechado.
- **Últimas chegadas** (só com chegadas; até cinco, com a hora e o lugar), **Política de privacidade** (botão "Abrir") e **Excluir conta** (confirmação, "Excluindo..." e o erro do servidor): o que as lojas exigem e o original web não tem.

### 11.15 Telas de conta (Entrar, Criar conta, Recuperar e Redefinir a senha)

A base das quatro telas é o `AuthLayout` (`src/components/AuthLayout.tsx`, imagem `02`), de cima para baixo: o fundo verde em degradê (`gradients.contas`) com as curvas de nível no alto (`assets/art/topo-contas.webp`), ambos decorativos e sem receber toque; o botão redondo de voltar (`GlassButton` `tamanho="voltar"`, só quando a tela diz para onde voltar); a marca (tile menta com o símbolo e "LembreiAi" em serifa, `fontSize.contaMarca`); o **cartão creme** (`colors.bg.card`, raio `size.auth.cardRadius`, `shadow.cartaoDeConta`) com o título em serifa (`fontSize.contaTitulo`, é o cabeçalho para o leitor de tela), o subtítulo em `colors.text.secondary` e o formulário; e o rodapé. Com pergunta, o rodapé é a **barra de vidro** (`colors.conta.barra`, contorno `colors.conta.barraAnel`) com a pergunta ("Ainda não tem conta?") e a **pastilha** de ação (`colors.conta.pilula`, texto `colors.conta.pilulaTexto`); sem pergunta, só o link de voltar (`colors.conta.link`). Por último, a nota "Por onde você passa fica no seu aparelho." com o cadeado (`colors.conta.nota`). Em aparelho com entalhe tudo desce o que a barra de status passar da distância do botão de voltar. As medidas são `size.auth.*`. O "horizonte" espelhado do rodapé do original não é reproduzido (a arte não está pré-renderizada).

- **Entrar:** "Acesse seus lembretes por hora e por lugar."; E-mail ("nome@dominio.com") e Senha ("Sua senha", com o olho, 10); na mesma linha a **caixinha "Lembrar-me"** (`CaixaDeMarcar`: branca com o anel cinza desmarcada, `colors.border.focus` com o visto branco marcada; marcada de saída, como o app já fazia) e o link "Esqueci minha senha" (`colors.text.accent`); botão "Entrar" / "Entrando…" (campos e caixinha travam). O aviso de senha redefinida é verde com `circle-check`; o erro, vermelho com `triangle-alert`. Rodapé: "Ainda não tem conta?" e "Criar conta"; voltar leva à abertura.
- **Criar conta:** "Leva menos de um minuto."; Nome ("Como podemos te chamar?"), E-mail, Senha (dica "Pelo menos 8 caracteres, com letras e números.") com o **medidor de força** (`MedidorDeSenha`: três barras finas que acendem uma vermelha, duas âmbar ou três verdes, e o rótulo "Senha fraca", "razoável" ou "forte"; só com a senha digitada) e Confirmar senha; "Criar conta" / "Criando conta…". Sem sessão (falta confirmar o e-mail) o aviso é informativo, com `mail-check`, e não vermelho como no original. Rodapé: "Já tem conta?" e "Entrar".
- **Recuperar senha e Redefinir senha:** o app recupera por **código de 6 números** e não pelo link do original, então os textos seguem o fluxo do app; o visual é o da base (o voltar, o rodapé com o link "Voltar para entrar", o medidor na nova senha).

## 12. Imagens e ilustrações

- **A interface é código, nunca imagem de tela.** Texto, botões e cartões nunca viram PNG.
- **Ícone do app:** tile menta em degradê (`colors.brand.tile` para `colors.brand.tileEnd`) com o símbolo em `colors.brand.glyph`, 1024 por 1024 (`assets/images/icon.png`). Android adaptativo: `android-icon-foreground/background/monochrome.png`, 1024 por 1024; o símbolo deve ficar dentro dos 66% centrais (regra do Android para o recorte do launcher).
- **Abertura (splash):** `splash-icon.png` (`imageWidth: 160`) sobre `colors.brand.tile`. **Notificação do Android:** `notification-icon.png` (96 por 96) tingido com `colors.action.primary`. **Web:** `public/favicon.svg`, `public/icons/*` (PWA 192, 512 e maskable) e o manifesto com o fundo `colors.bg.page`.
- As cores de marca que vivem em JSON e SVG (que não importam tokens) são conferidas por `src/design/__tests__/marca.test.ts`.
- **Fotos e ilustrações novas:** nunca esticar (`contentFit="cover"` ou `"contain"`); `accessibilityLabel` quando informam, escondidas do leitor de tela quando decorativas; alvo de menos de 200 KB, em WebP ou PNG. O pino 3D, o letreiro e o fundo de folhagem do onboarding vêm de `assets/art/` (recortes de `tools/build-assets.py` do app web, cópias idênticas) e entram em `src/components/Onboarding.tsx`.
- **Mapa:** tiles do OpenStreetMap com a atribuição sempre visível (é obrigatória). O halo do raio usa a cor da categoria com transparência.

## 13. Animações e transições

Filosofia: o mínimo. O feedback de toque é instantâneo (troca de cor e escala `motion.pressedScale`, sem animar); a navegação usa o padrão de cada plataforma; a folha do mapa entra em `slide`. A exceção é a tela de sucesso, com a única animação longa do app (o herói, 2,6 s mais o pulso dos dois pontos, seção 11.12). Toda animação passa por `useMovimentoReduzido` e, com "reduzir movimento", chega pronta.

<!-- tokens:movimento:inicio -->
| Token | Valor | Uso |
|---|---|---|
| `motion.duration.fast` | `120` | Feedback de toque (ms) |
| `motion.duration.base` | `200` | Troca de estado (ms) |
| `motion.duration.slow` | `300` | Entrada de modais (ms) |
| `motion.duration.scrim` | `180` | Entrada do véu atrás de uma folha (ms) |
| `motion.duration.sheet` | `260` | Subida de uma folha inferior (ms) |
| `motion.duration.toggle` | `180` | Troca de estado do interruptor (ms) |
| `motion.duration.aviso` | `2000` | Quanto tempo um aviso curto ("Copiado") fica no lugar do rótulo do botão (ms) |
| `motion.duration.relogio` | `15000` | De quanto em quanto tempo as Configurações atualizam o "há N s" da última posição (ms) |
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
| `opacity.tab` | `0.6` | Aba da barra de abas pressionada |
| `opacity.disabled` | `0.45` | Controle desabilitado |
| `opacity.inactive` | `0.55` | Cartão de lembrete pausado |
| `opacity.pressed` | `0.85` | Toque em elementos que não trocam de cor |
| `opacity.link` | `0.6` | Link de texto pressionado ("Criar outro lembrete") |
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
| `size.tabBar.top` | `15` | Barra de abas: espaço acima das abas |
| `size.tabBar.item` | `51` | Barra de abas: altura de cada aba (ícone, vão e rótulo) |
| `size.tabBar.bottom` | `25` | Barra de abas: espaço mínimo embaixo (a área segura do sistema o substitui quando é maior) |
| `size.tabBar.gap` | `6` | Barra de abas: vão entre o ícone e o rótulo |
| `size.tabBar.icon` | `21` | Barra de abas: lado do ícone |
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
| `size.sucesso.canvas` | `934` | Sucesso: altura do canvas de rolagem (1848 du) |
| `size.sucesso.fechar` | `38` | Sucesso: botão de vidro de fechar |
| `size.sucesso.fecharTop` | `28` | Sucesso: distância do botão de fechar até o topo |
| `size.sucesso.fecharSide` | `17` | Sucesso: distância do botão de fechar até a borda direita |
| `size.sucesso.fecharIcon` | `16` | Sucesso: o X do botão de fechar |
| `size.sucesso.tituloTop` | `166` | Sucesso: distância do título até o topo |
| `size.sucesso.tituloBox` | `65` | Sucesso: altura reservada ao título (duas linhas) |
| `size.sucesso.subtituloGap` | `8` | Sucesso: vão entre o título e o subtítulo |
| `size.sucesso.subtituloBox` | `42` | Sucesso: altura reservada ao subtítulo (duas linhas) |
| `size.sucesso.resumoGap` | `14` | Sucesso: vão entre o subtítulo e o cartão de resumo |
| `size.sucesso.side` | `17` | Sucesso: recuo dos cartões até as bordas da tela |
| `size.sucesso.resumo.slot` | `275` | Resumo: altura reservada ao cartão (a da variante com local), para as ações ficarem no mesmo lugar nas duas |
| `size.sucesso.resumo.padTop` | `17` | Resumo: recuo interno do cartão |
| `size.sucesso.resumo.padLeft` | `18` | Resumo: recuo interno do cartão |
| `size.sucesso.resumo.padRight` | `17` | Resumo: recuo interno do cartão |
| `size.sucesso.resumo.padBottom` | `16` | Resumo: recuo interno do cartão |
| `size.sucesso.resumo.circle` | `52` | Resumo: círculo do ícone da categoria |
| `size.sucesso.resumo.circleIcon` | `27` | Resumo: ícone da categoria dentro do círculo |
| `size.sucesso.resumo.circleGap` | `11` | Resumo: vão entre o círculo da categoria e o título |
| `size.sucesso.resumo.tituloMax` | `136` | Resumo: largura máxima do título (quebra em duas linhas antes de chegar ao selo, como no original) |
| `size.sucesso.resumo.seloHeight` | `26` | Resumo: altura do selo "Ativo" |
| `size.sucesso.resumo.seloLeft` | `11` | Resumo: recuo do selo "Ativo" antes do ponto |
| `size.sucesso.resumo.seloRight` | `12` | Resumo: recuo do selo "Ativo" depois do texto |
| `size.sucesso.resumo.seloGap` | `6` | Resumo: vão entre o ponto e o texto do selo "Ativo" |
| `size.sucesso.resumo.seloDot` | `9` | Resumo: ponto verde do selo "Ativo" |
| `size.sucesso.resumo.linhaGap` | `17` | Resumo: vão entre o cabeçalho e a linha de Data e Horário |
| `size.sucesso.resumo.dado` | `35` | Resumo: círculo do ícone de cada dado |
| `size.sucesso.resumo.dadoIcon` | `18` | Resumo: ícone dentro do círculo do dado |
| `size.sucesso.resumo.dadoGap` | `9` | Resumo: vão entre o círculo do dado e o texto |
| `size.sucesso.resumo.dadoColuna` | `210` | Resumo: largura da coluna da Data (o Horário começa depois dela) |
| `size.sucesso.resumo.divisorAntes` | `13` | Resumo: vão entre uma linha e o divisor que vem depois |
| `size.sucesso.resumo.divisorDepois` | `9` | Resumo: vão entre o divisor e a linha seguinte |
| `size.sucesso.resumo.divisor` | `1` | Resumo: espessura do divisor |
| `size.sucesso.resumo.thumbWidth` | `83` | Resumo: largura da miniatura do mapa (lembrete por local) |
| `size.sucesso.resumo.thumbHeight` | `60` | Resumo: altura da miniatura do mapa |
| `size.sucesso.resumo.thumbRadius` | `12` | Resumo: raio da miniatura do mapa |
| `size.sucesso.acao.height` | `62` | Ações (Editar, Excluir, Compartilhar): altura de cada botão |
| `size.sucesso.acao.radius` | `16` | Ações: raio dos botões |
| `size.sucesso.acao.gap` | `20` | Ações: vão entre os botões |
| `size.sucesso.acao.side` | `29` | Ações: recuo da fileira até as bordas da tela |
| `size.sucesso.acao.icon` | `20` | Ações: ícone de cada botão |
| `size.sucesso.acao.top` | `12` | Ações: recuo do ícone até o topo do botão |
| `size.sucesso.acao.iconGap` | `9` | Ações: vão entre o ícone e o rótulo |
| `size.sucesso.dica.height` | `79` | Dica do sucesso: altura mínima do cartão |
| `size.sucesso.dica.circle` | `46` | Dica do sucesso: círculo da lâmpada |
| `size.sucesso.dica.icon` | `23` | Dica do sucesso: lâmpada dentro do círculo |
| `size.sucesso.dica.arrow` | `16` | Dica do sucesso: seta à direita |
| `size.sucesso.dica.left` | `18` | Dica do sucesso: recuo do círculo até a borda esquerda |
| `size.sucesso.dica.right` | `19` | Dica do sucesso: recuo da seta até a borda direita |
| `size.sucesso.dica.gap` | `16` | Dica do sucesso: vão entre o círculo e o texto |
| `size.sucesso.dica.textGap` | `3` | Dica do sucesso: vão entre o título e o texto |
| `size.sucesso.dica.textMax` | `246` | Dica do sucesso: largura máxima do texto; é onde a primeira linha da imagem fecha ("… esquecer"), então a quebra cai onde a captura mostra e, em tela estreita, o texto quebra sozinho |
| `size.sucesso.cta` | `55` | Sucesso: altura do botão escuro "Ver todos os lembretes" |
| `size.sucesso.ctaSide` | `19` | Sucesso: recuo do botão escuro até as bordas |
| `size.sucesso.link` | `16` | Sucesso: altura do link "Criar outro lembrete" |
| `size.sucesso.espaco.acoes` | `15` | Sucesso: vão entre o cartão de resumo (reserva) e as ações |
| `size.sucesso.espaco.dica` | `17` | Sucesso: vão entre as ações e a dica |
| `size.sucesso.espaco.cta` | `21` | Sucesso: vão entre a dica e o botão escuro |
| `size.sucesso.espaco.link` | `20` | Sucesso: vão entre o botão escuro e o link |
| `size.sucesso.espaco.fim` | `78` | Sucesso: folga no fim da rolagem, abaixo do link |
| `size.campo.height` | `46` | Campo de texto: altura da caixa |
| `size.campo.padding` | `13` | Campo de texto: recuo do texto dentro da caixa |
| `size.campo.gap` | `5` | Campo de texto: vão entre o rótulo e a caixa |
| `size.campo.top` | `13` | Campo de texto: distância do campo de cima |
| `size.campo.eye` | `38` | Campo de senha: largura do botão do olho |
| `size.campo.eyeIcon` | `16` | Campo de senha: ícone do olho |
| `size.campo.mensagemGap` | `4` | Campo de texto: vão entre o ícone e o texto da mensagem de erro |
| `size.campo.mensagemIcon` | `12` | Campo de texto: ícone de alerta da mensagem de erro |
| `size.config.scrollTop` | `15` | Configurações: distância do primeiro cartão até o topo da folha clara |
| `size.config.scrollSide` | `19` | Configurações: recuo dos cartões até as bordas da tela |
| `size.config.scrollBottom` | `20` | Configurações: folga no fim da rolagem, abaixo do último cartão |
| `size.config.cardsGap` | `11` | Configurações: vão entre os cartões |
| `size.config.cardV` | `14` | Configurações: recuo de cima e de baixo dentro do cartão |
| `size.config.cardH` | `15` | Configurações: recuo dos lados dentro do cartão |
| `size.config.cardGap` | `10` | Configurações: vão entre o cabeçalho do cartão, os avisos e as linhas |
| `size.config.headGap` | `12` | Configurações: vão entre o círculo, o texto e a ação do cabeçalho do cartão |
| `size.config.circle` | `43` | Configurações: círculo do ícone do cartão |
| `size.config.icon` | `20` | Configurações: ícone dentro do círculo do cartão |
| `size.config.textGap` | `3` | Configurações: vão entre o título e o subtítulo do cartão |
| `size.config.rowsGap` | `6` | Configurações: vão entre as linhas de dados |
| `size.config.rowGap` | `10` | Configurações: vão entre o nome e o valor de uma linha de dados |
| `size.config.listIndent` | `13` | Configurações: recuo dos marcadores da lista de limites |
| `size.config.listGap` | `5` | Configurações: vão entre os itens da lista de limites |
| `size.auth.side` | `19` | Contas: recuo da tela até as bordas |
| `size.auth.top` | `49` | Contas: distância do topo da tela até a marca |
| `size.auth.bottom` | `30` | Contas: folga no fim da rolagem |
| `size.auth.voltar` | `36` | Contas: botão redondo de voltar |
| `size.auth.voltarIcon` | `18` | Contas: seta do botão de voltar |
| `size.auth.voltarTop` | `20` | Contas: distância do botão de voltar até o topo |
| `size.auth.marcaTile` | `32` | Contas: tile da marca |
| `size.auth.marcaRadius` | `11` | Contas: raio do tile da marca |
| `size.auth.marcaIcon` | `18` | Contas: símbolo dentro do tile da marca |
| `size.auth.marcaGap` | `9` | Contas: vão entre o tile e o nome da marca |
| `size.auth.marcaBottom` | `22` | Contas: vão entre a marca e o cartão |
| `size.auth.cardRadius` | `20` | Contas: raio do cartão creme |
| `size.auth.cardTop` | `22` | Contas: recuo de cima dentro do cartão |
| `size.auth.cardSide` | `19` | Contas: recuo dos lados dentro do cartão |
| `size.auth.cardBottom` | `20` | Contas: recuo de baixo dentro do cartão |
| `size.auth.subtituloTop` | `5` | Contas: vão entre o título e o subtítulo |
| `size.auth.formTop` | `4` | Contas: vão entre o subtítulo e o formulário |
| `size.auth.rodapeTop` | `28` | Contas: vão mínimo entre o cartão e o rodapé |
| `size.auth.barra` | `59` | Contas: altura mínima da barra de vidro do rodapé |
| `size.auth.barraLeft` | `17` | Contas: recuo do texto na barra de vidro |
| `size.auth.barraRight` | `9` | Contas: recuo da pastilha na barra de vidro |
| `size.auth.barraGap` | `9` | Contas: vão entre o texto e a pastilha da barra |
| `size.auth.barraRadius` | `17` | Contas: raio da barra de vidro |
| `size.auth.pilula` | `42` | Contas: altura da pastilha de ação |
| `size.auth.pilulaSide` | `15` | Contas: recuo dos lados da pastilha |
| `size.auth.pilulaRadius` | `14` | Contas: raio da pastilha |
| `size.auth.linkVolta` | `9` | Contas: recuo do link de voltar |
| `size.auth.notaTop` | `15` | Contas: distância da nota do cadeado até o que vem antes |
| `size.auth.notaGap` | `6` | Contas: vão entre o cadeado e o texto da nota |
| `size.auth.notaIcon` | `13` | Contas: cadeado da nota |
| `size.auth.check` | `21` | Contas: caixinha "Lembrar-me" |
| `size.auth.checkRadius` | `6` | Contas: raio da caixinha "Lembrar-me" |
| `size.auth.checkIcon` | `13` | Contas: visto da caixinha "Lembrar-me" |
| `size.auth.checkGap` | `7` | Contas: vão entre a caixinha e o texto |
| `size.auth.linhaTop` | `14` | Contas: distância da linha "Lembrar-me" / "Esqueci minha senha" até os campos |
| `size.auth.linhaGap` | `10` | Contas: vão entre "Lembrar-me" e "Esqueci minha senha" |
| `size.auth.medidorBarra` | `4` | Contas: altura de cada barra do medidor de força |
| `size.auth.medidorGap` | `3` | Contas: vão entre as barras do medidor |
| `size.auth.medidorTop` | `7` | Contas: distância do medidor até o campo de senha |
| `size.auth.medidorRotuloGap` | `6` | Contas: vão entre as barras e o rótulo do medidor |
| `size.suggestions.maxHeight` | `212` | Sugestões de endereço: altura máxima da lista (o resto rola) |
| `size.suggestions.padding` | `3` | Sugestões de endereço: recuo da lista |
| `size.suggestions.gap` | `4` | Sugestões de endereço: vão entre o campo e a lista |
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
| `size.mapControl.button` | `29` | Mapa do formulário: lado dos botões de centralizar e zoom |
| `size.mapControl.pill` | `24` | Mapa do formulário: altura da pílula "Usar minha localização" |
| `size.mapControl.icon` | `15` | Mapa do formulário: ícone dentro dos botões |
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
| `size.form.cardPadding` | `17` | Formulário: recuo interno dos cartões |
| `size.form.circle` | `43` | Formulário: círculo do ícone do cartão Descrição |
| `size.form.field` | `40` | Formulário: altura do campo e dos seletores |
| `size.form.fieldIcon` | `16` | Formulário: ícone dentro do seletor de data e hora |
| `size.form.option` | `61` | Formulário: altura do cartão de modo |
| `size.form.optionCircle` | `38` | Formulário: círculo do ícone do cartão de modo |
| `size.form.optionIcon` | `17` | Formulário: ícone dentro do cartão de modo |
| `size.form.optionBadge` | `19` | Formulário: selo de escolhido do cartão de modo |
| `size.form.optionCheck` | `12` | Formulário: visto dentro do selo de escolhido |
| `size.form.optionRadio` | `15` | Formulário: anel do cartão de modo não escolhido |
| `size.form.sliderTrack` | `6` | Formulário: espessura do trilho do controle deslizante |
| `size.form.sliderThumb` | `22` | Formulário: bolinha do controle deslizante |
| `size.form.sliderHeight` | `30` | Formulário: altura da área de toque do controle deslizante |
| `size.form.header` | `222` | Formulário: altura da arte do cabeçalho claro |
| `size.form.nav` | `36` | Formulário: botões redondos de voltar e de conta |
| `size.form.navTop` | `56` | Formulário: distância dos botões até o topo (desce com a barra de status do aparelho) |
| `size.form.navSide` | `15` | Formulário: distância dos botões até as bordas |
| `size.form.map` | `138` | Formulário: altura do mapa |
| `size.form.mapRadius` | `10` | Formulário: raio do mapa |
| `size.form.cta` | `59` | Formulário: altura do botão "Criar lembrete" |
| `size.form.ctaCircle` | `40` | Formulário: círculo da seta do botão "Criar lembrete" |
| `size.form.dock` | `86` | Formulário: altura da base que esmaece atrás do botão fixo |
| `size.form.row` | `55` | Folha Repetir: altura mínima de cada linha |
| `size.form.rowLeft` | `19` | Folha Repetir: recuo da esquerda |
| `size.form.rowRight` | `17` | Folha Repetir: recuo da direita |
| `size.form.rowGap` | `10` | Folha Repetir: vão entre o texto e a marca |
| `size.form.rowBadge` | `20` | Folha Repetir: selo da linha escolhida |
| `size.form.rowRadio` | `17` | Folha Repetir: anel das linhas não escolhidas |
| `size.form.rowCheck` | `11` | Folha Repetir: visto do selo |
| `size.wheel.width` | `116` | Roda do horário: largura de cada coluna |
| `size.wheel.item` | `44` | Roda do horário: altura de cada número |
| `size.wheel.gap` | `11` | Roda do horário: vão entre as colunas |
| `size.wheel.top` | `15` | Roda do horário: espaço acima das rodas |
| `size.wheel.band.width` | `293` | Roda do horário: largura da faixa da escolha |
| `size.wheel.band.radius` | `14` | Roda do horário: raio da faixa da escolha |
| `size.calendar.day` | `44` | Calendário: lado da célula de cada dia (toque de 44) |
| `size.calendar.selected` | `40` | Calendário: círculo do dia escolhido |
| `size.calendar.arrow` | `40` | Calendário: botão de trocar de mês |
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
| `layout.modeCardWeight.time` | `418` | Formulário: peso da largura do cartão "Por data e horário" (caixa de 418 du no original) |
| `layout.modeCardWeight.place` | `353` | Formulário: peso da largura do cartão "Por local" (caixa de 353 du no original) |
| `layout.wheelRows` | `5` | Números visíveis de cada roda do horário |
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
| `colors.feedback.errorInk` | `colors.feedback.errorBg` | 7,81:1 | 7:1 | ✓ | Texto do aviso de erro |
| `colors.icon.default` | `colors.bg.page` | 17,73:1 | 4,5:1 | ✓ | Ícones em tinta principal |
| `colors.text.secondary` | `colors.bg.page` | 5,89:1 | 4,5:1 | ✓ | Subtítulos, dicas e metadados nas telas |
| `colors.text.secondary` | `colors.bg.card` | 6,24:1 | 4,5:1 | ✓ | Metadados nos cartões |
| `colors.text.secondary` | `colors.bg.field` | 6,57:1 | 4,5:1 | ✓ | Dicas dentro de painéis brancos |
| `colors.text.secondary` | `colors.feedback.infoBg` | 5,22:1 | 4,5:1 | ✓ | Texto de apoio em avisos informativos |
| `colors.text.secondary` | `colors.feedback.successBg` | 5,80:1 | 4,5:1 | ✓ | Texto de apoio da tela "Confira seu e-mail" |
| `colors.text.placeholder` | `colors.bg.field` | 5,10:1 | 4,5:1 | ✓ | Placeholder dos campos |
| `colors.text.placeholder` | `colors.bg.card` | 4,84:1 | 4,5:1 | ✓ | Nomes dos dados no cartão de resumo (Data, Horário, Local e Repetir) |
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
| `colors.text.onFrost` | `colors.action.frost` | 11,71:1 | 4,5:1 | ✓ | Rótulo dos botões Editar, Excluir e Compartilhar |
| `colors.text.onFrost` | `colors.action.frostHover` | 10,71:1 | 4,5:1 | ✓ | Rótulo dos botões de ação com o ponteiro em cima (web) |
| `colors.text.onFrost` | `colors.action.frostPressed` | 9,78:1 | 4,5:1 | ✓ | Rótulo dos botões de ação pressionados |
| `colors.text.danger` | `colors.bg.page` | 5,03:1 | 4,5:1 | ✓ | Erro solto na tela |
| `colors.text.danger` | `colors.bg.card` | 5,34:1 | 4,5:1 | ✓ | Erro em cartão |
| `colors.text.danger` | `colors.bg.field` | 5,62:1 | 4,5:1 | ✓ | Erro em painel branco e mensagem de campo |
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
- **Exceção conhecida: o anel da caixinha desmarcada** (`colors.border.strong` sobre `colors.bg.field`, 1,97:1 contra os 3:1 do WCAG 1.4.11) e **a barra âmbar do medidor de senha** (2,05:1) são o que as referências mostram. A caixinha tem o rótulo ao lado e o estado por `aria-checked` (o visto marca a diferença), e o medidor é enfeite: o rótulo diz o mesmo em texto. Se a marca preferir cumprir 3:1, escureça esses dois tokens (pergunta em aberto para o João).
- **Alvos de toque de no mínimo 44** (`size.touch`). Controle visualmente menor usa `hitSlop` de `size.hitSlop`. **Vale no celular:** o react-native-web 0.21 não implementa `hitSlop`, então na web o alvo é o tamanho visual (ver as pendências).
- **Todo controle tem papel e nome:** `accessibilityRole`, `accessibilityLabel` e o estado em props `aria-*` (`aria-checked`, `aria-selected`; `disabled` pela prop do `Pressable`). **Não use `accessibilityState`:** o react-native-web 0.21 não o repassa ao DOM e o estado some para quem usa leitor de tela na web (`src/__tests__/acessibilidade-web.test.ts` barra). O papel do voltar de `AuthLayout` vem antes do conteúdo na árvore, para o Tab começar por ele.
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
| 21/09/2026 | **Barra de abas própria** (`BarraDeAbas`) com Início, Lembretes, Mapa e Configurações; "Novo" sai da barra; `Tabs` vem de `expo-router/js-tabs` | O padrão do React Navigation não reproduz a barra das imagens (abas iguais, traço que engrossa, sombra para cima, base da área segura) e não deixa o formulário acender "Lembretes". Em `expo-router` 57 o `Tabs` da raiz do pacote está marcado como obsoleto em favor de `expo-router/js-tabs` |
| 21/09/2026 | **Formulário de novo lembrete e de edição no mesmo componente** (`FormularioDeLembrete`; rotas `novo` e `editar?id=`), com descrição e ponto de local obrigatórios, raio de 50 a 550 m e a localização só a pedido | O original aceita descrição vazia (grava um exemplo) e "por local" sem ponto (grava Fortaleza): serve para demonstração, não para uma pessoa real; a tabela aceita 10 a 5000 m e as capturas mostram o controle de 0 a 550, e abaixo de 50 m o aviso por geofence não é confiável (o piso de 200 m de precisão já é decisão do usuário) |
| 21/09/2026 | **Tela de sucesso** (imagem `09`): herói animado em SVG e `Animated` (dados em `src/design/heroi.ts`), cartão de resumo, três ações, dica e botão escuro; a rota não é uma aba e esconde a barra de abas | É o que a imagem mostra; a animação do original é parte do que o João chamou de "efeitos" que vieram errados |
| 21/09/2026 | Na tela de sucesso os textos de 10 e 11 dp do original sobem ao piso de 12 dp; rótulos cinza (`#84848A`) e subtítulo (`#767880`) usam `colors.text.placeholder` e `colors.text.secondary` | O piso do app é 12; os dois cinzas do original dão menos de 4,5:1 nos fundos da tela |
| 21/09/2026 | O título da tela de sucesso fica fora de `textStyles` (altura de linha 1,03) | É a altura do original e as duas linhas fixas não têm descendentes; o teste de tipografia exige 1,2 dentro de `textStyles` |
| 21/09/2026 | O selo "Ativo" do cartão de resumo só aparece com o lembrete ativo | O original o mostrava sempre, mesmo pausado, o que seria dizer uma coisa falsa |
| 21/09/2026 | "Compartilhar" envia **texto** (folha do sistema no celular; folha do navegador ou cópia na web) e responde com "Copiado" ou "Indisponível" no lugar do rótulo | O original gera uma imagem JPEG do cartão na web e não avisa nada; a imagem exige captura de tela nativa e fica como tarefa própria. Sem aviso, copiar não pareceria fazer nada |
| 21/09/2026 | O sombreado do visto é um segundo traço deslocado e mais grosso; as ondas esperam a vez em repouso; o desfoque do botão de fechar não é reproduzido | O SVG nativo não tem `feDropShadow`; o `both` do CSS mostra o primeiro quadro antes do atraso; o desfoque some sobre a foto suave. Nenhum dos três foi comparado em aparelho |
| 21/09/2026 | O "voltar" das abas segue o histórico (`backBehavior="history"`) | O padrão volta sempre à primeira aba: Salvar na edição caía em Início e o acesso direto a `editar` parecia ter para onde voltar |
| 21/09/2026 | **Campo de texto das telas de conta refeito** (`TextField`): caixa de 46 com o anel cinza por dentro em vez de borda, olho para mostrar e esconder a senha, ícone de alerta na mensagem de erro; rótulo e mensagem sobem de 11 para o piso de 12 | É o campo das imagens `02` e `05`; a mensagem de erro com ícone e o anel vermelho dão o segundo sinal além da cor |
| 21/09/2026 | **Folha "Minha conta"** (`ContaSheet`) abre pelo botão de conta da lista e do formulário, no lugar do desvio para Configurações; ícone das linhas centrado no círculo | É o que a imagem `05` mostra. O glifo no alto do círculo na captura é um efeito de CSS que o próprio original não pretendia (a imagem `11` o centraliza) |
| 21/09/2026 | O aviso de erro (`Banner` `error`) passa de `#FFE6E6`/`#C62828` para `#FDF0EE`/`#8E2418` (`colors.feedback.errorBg` e `errorInk`), em todas as telas | É o vermelho do aviso de erro do original nas telas de conta e nas configurações; o par dá mais contraste que o anterior e está na tabela testada |
| 21/09/2026 | **Configurações** no visual da imagem `08`, com a lógica do app (permissão, monitoramento, notificações, chegadas, excluir conta); sem o cartão "Instalar o app"; "Permitir" das notificações também não existe (o estado só sabe se está permitida); os limites do monitoramento foram reescritos para o app (a frase do original manda "usar um app nativo") | O original é um app web instalável; no Expo o estado real é "permitida" ou "não", sem "ainda não pedida", e o que a tela afirma tem de ser verdade nas duas plataformas |
| 21/09/2026 | **Telas de conta** no visual da imagem `02` (`AuthLayout`: fundo verde com curvas de nível, cartão creme, barra de vidro, nota do cadeado); "Lembrar-me" vira caixinha e o medidor de força entra no cadastro e na redefinição; a recuperação continua por código | O original recupera por link e não mostra o medidor na imagem, mas o app já recuperava por código e já tinha a regra de força; o horizonte do rodapé precisa de arte que não existe pré-renderizada |
| 21/09/2026 | **Dica da tela de sucesso sem quebra de linha forçada**, com largura máxima do texto (`size.sucesso.dica.textMax`) | O `\n` do original só cabe nos 430 px da captura: no Android de 411 dp sobrava "esquecer" sozinho numa linha. A largura máxima mantém a quebra da imagem em tela larga e deixa quebrar sozinho em tela estreita |
| 21/09/2026 | **Cartões de modo do formulário com a largura do original** (pesos 418 e 353, `layout.modeCardWeight`) e folga do texto até o selo | No original os dois cartões são caixas de larguras diferentes (a captura `04` mostra ~210 e ~178 dp); com `flex: 1` o título do primeiro encostava no selo no Android de 411 dp |
| 21/09/2026 | **A folha inferior acompanha o teclado** (`useAlturaDoTeclado`): sobe até ficar acima dele e encolhe para caber no espaço que sobra | No Android de tela cheia o teclado cobria os campos de "Alterar senha" (medido no emulador: o teclado ocupa 336 dp e a janela não é redimensionada). O iOS foi escrito pela documentação do React Native e **não foi verificado** (sem Xcode neste Mac) |
| 21/09/2026 | **Estado dos controles em props `aria-*`** (nada de `accessibilityState`), olho da senha com `tabIndex={-1}` e o voltar das telas de conta antes do conteúdo na árvore | O react-native-web 0.21 não repassa `accessibilityState` ao DOM (o estado de caixinha, interruptor, aba e opção sumia na web), o `Pressable` dele só lê `tabIndex` (o olho era parada do Tab) e o "Voltar", montado depois da rolagem, era o último do Tab. Conferido no DOM (Playwright); um teste de fontes barra a volta do padrão |
| 21/09/2026 | **O formulário rola até o cartão do Local quando a busca de endereço ganha o foco com o teclado aberto** | No Android (medido no emulador) as sugestões da busca nasciam debaixo do campo, atrás do teclado: não dava para vê-las nem tocá-las |

## 19. Pendências

- **Corte óptico do Source Serif 4:** os pacotes trazem um corte por peso. Comparar os títulos grandes com as referências (o app web fixa `opsz` por estilo); se destoarem, gerar instâncias estáticas com o corte de título.
- **Peso das fontes na web:** cada arquivo `.ttf` tem 110 KB (Nunito Sans) e 322 KB (Source Serif 4). Um subconjunto latino em `woff2` reduziria, se o carregamento incomodar.
- **Portar as telas e folhas de `referencias/`** (tabela da seção 2.3), na ordem da tarefa `visual-original-no-expo`. A barra de abas passa a ser Início, Lembretes, Mapa e Configurações.
- **Tokens a criar** junto com cada tela: interruptor de cartão, vidro, botão de perigo, folha, avisos, texto sobre verde e os três degradês (lista e configurações, formulário, contas). Valores exatos em `referencias/MEDICOES.md`.
- **Leitura com VoiceOver e TalkBack** e **navegação por teclado** na web: verificar em aparelho real.
- **Modo escuro:** fora de escopo até haver referência.
- **Alvo de toque na web:** `hitSlop` não existe no react-native-web 0.21, então "Lembrar-me" (21 px de altura), "Esqueci minha senha" (16 px) e o link "Criar outro lembrete" ficam com o tamanho visual quando o app roda no navegador (no celular chegam a 44). Solução se importar: folga por `padding` com margem negativa nesses controles.
- **Layout de tablet nativo:** não desenhado (só existe referência de celular).
