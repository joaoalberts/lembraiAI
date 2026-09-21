# Medições nas capturas: o Design System bate com as imagens?

Método: cada captura é convertida do perfil de cor da tela para sRGB e amostrada em pontos escolhidos (média de 5×5 pixels; coordenadas em pixels da captura, que valem o dobro do CSS px). O resultado é comparado com a paleta do Expo (`src/design/tokens.ts`) e com os tokens do app web (o que o original usa). ΔE é a distância de cor CIE76: até 1,5 é imperceptível.

Refazer: `python3 scripts/amostrar-referencias.py` (precisa do Pillow). Medido em 21/09/2026.

## Resultado

**21 de 29 pontos batem com os tokens do Expo (ΔE ≤ 1.5).** A paleta do Design System já está sobre as imagens: fundo, cartões, laranja, verdes da marca, chips, interruptor de formulário, dica, botão escuro e a caixa de "Lembrar-me". 4 valores existem só no app web e faltam no Expo, e 4 são fundos em degradê ou de foto, que não têm token.

| Ponto | Captura | sRGB medido | Token do Expo mais próximo (ΔE) | Token do app web mais próximo (ΔE) | Veredito |
|---|---|---|---|---|---|
| Fundo da página | `04` | `#F6F2EE` | `palette.cream200` `#F5F2ED` (0.6) | `--cream-200` `#F5F2ED` (0.6) | bate |
| Superfície do cartão | `04` | `#FAF9F6` | `palette.cream100` `#FAF9F6` (0.0) | `--cream-100` `#FAF9F6` (0.0) | bate |
| Botão primário (laranja) | `04` | `#FE532B` | `palette.orange500` `#FE532A` (0.4) | `--orange-500` `#FE532A` (0.4) | bate |
| Barra de abas | `04` | `#F8F8F5` | `palette.cream100` `#FAF9F6` (0.5) | `--cream-100` `#FAF9F6` (0.5) | bate |
| Círculo do ícone (menta) | `04` | `#DBF2E5` | `colors.category.green.bg` `#DBF1E4` (0.4) | `--cat-green-bg` `#DBF1E4` (0.4) | bate |
| Trilho do interruptor desligado | `04` | `#D6D5D5` | `palette.trackOff` `#D6D5D5` (0.0) | `--track-off` `#D6D5D5` (0.0) | bate |
| Cabeçalho em degradê: canto superior esquerdo | `04` | `#BAECD4` | `colors.category.green.bg` `#DBF1E4` (12.0) | `--mint-200` `#C6E4D5` (8.5) | sem token |
| Tile da marca (topo) | `07` | `#82F7D7` | `palette.mintBrand` `#84FADA` (1.0) | `--mint-400` `#7FEAC6` (5.2) | bate |
| Botão Novo lembrete | `07` | `#FE532B` | `palette.orange500` `#FE532A` (0.4) | `--orange-500` `#FE532A` (0.4) | bate |
| Chip Todos (selecionado) | `07` | `#134330` | `palette.forest900` `#12432F` (0.7) | `--forest-900` `#12432F` (0.7) | bate |
| Chip não selecionado | `07` | `#F3F4F0` | `palette.chipOff` `#F3F4EF` (0.5) | `--chip-off` `#F3F4EF` (0.5) | bate |
| Folha da lista (fundo) | `07` | `#EFF0EB` | `palette.chipOff` `#F3F4EF` (1.4) | `--chip-off` `#F3F4EF` (1.4) | bate |
| Superfície do cartão de lembrete | `07` | `#F9F8F5` | `palette.cream100` `#FAF9F6` (0.3) | `--cream-100` `#FAF9F6` (0.3) | bate |
| Faixa lateral do cartão (categoria verde) | `07` | `#38C492` | `colors.category.green.bar` `#39C391` (0.5) | `--cat-green-bar` `#39C391` (0.5) | bate |
| Interruptor ligado (cartão) | `07` | `#31AB7C` | `colors.category.green.bar` `#39C391` (9.0) | `css:toggle-cartao-ligado` `#30AB7B` (0.6) | falta no Expo |
| Cartão Dica para você | `07` | `#DDE8DD` | `palette.mintTint` `#DDE8DD` (0.0) | `--mint-tint` `#DDE8DD` (0.0) | bate |
| Cabeçalho verde (parte baixa) | `07` | `#1F5544` | `palette.forest700` `#185C4B` (4.0) | `--forest-700` `#185C4B` (4.0) | sem token |
| Folha de Configurações (fundo) | `08` | `#EFF0EB` | `palette.chipOff` `#F3F4EF` (1.4) | `--chip-off` `#F3F4EF` (1.4) | bate |
| Cartão de Configurações | `08` | `#FAF9F6` | `palette.cream100` `#FAF9F6` (0.0) | `--cream-100` `#FAF9F6` (0.0) | bate |
| Aviso de erro (fundo) | `08` | `#FDF1EF` | `palette.red50` `#FFF5F5` (1.8) | `--cream-200` `#F5F2ED` (3.6) | sem token |
| Interruptor ligado (formulário e configurações) | `08` | `#246855` | `palette.forest600` `#216955` (1.2) | `css:toggle-formulario-ligado` `#256855` (0.2) | bate |
| Botão escuro Ver todos os lembretes | `09` | `#264233` | `palette.forest800` `#254233` (0.4) | `--forest-800` `#254233` (0.4) | bate |
| Botão de ação translúcido (Editar) | `09` | `#E3E7DC` | `palette.mintTint` `#DDE8DD` (2.5) | `--frost` `#E3E7DC` (0.0) | falta no Expo |
| Botão Excluir lembrete (perigo) | `10` | `#D53A2A` | `palette.red700` `#C62828` (6.9) | `css:botao-perigo` `#D43A2A` (0.4) | falta no Expo |
| Botão Cancelar | `10` | `#E3E7DC` | `palette.mintTint` `#DDE8DD` (2.5) | `--frost` `#E3E7DC` (0.0) | falta no Expo |
| Cartão de entrada | `02` | `#FAF9F6` | `palette.cream100` `#FAF9F6` (0.0) | `--cream-100` `#FAF9F6` (0.0) | bate |
| Botão Entrar | `02` | `#FE532B` | `palette.orange500` `#FE532A` (0.4) | `--orange-500` `#FE532A` (0.4) | bate |
| Caixa Lembrar-me marcada | `02` | `#175C4B` | `palette.forest700` `#185C4B` (0.2) | `--forest-700` `#185C4B` (0.2) | bate |
| Fundo do login (verde escuro) | `02` | `#194534` | `palette.forest900` `#12432F` (2.8) | `--forest-900` `#12432F` (2.8) | sem token |

## O que falta no Design System do Expo

Valores exatos vêm do CSS do app web (`Aplicativos/lembreiAI/src`); as capturas confirmam cada um (ΔE ≤ 1,5). Entram como tokens junto com a tela que os usa, com descrição e teste, como manda o documento.

| Token a criar | Valor | Onde aparece | Fonte no app web |
|---|---|---|---|
| Interruptor ligado (cartão) | `#30AB7B` | lista (`07`) | `Toggle.module.css` (`.sm.on`; 69×42 du) |
| Interruptor ligado (formulário) | `#256855` | formulário e configurações (`06`, `08`) | `.lg.on` (85×52 du). O `palette.forest600` do Expo (`#216955`) está 1,2 ΔE mais claro |
| Vidro (translúcido) | `#E3E7DC`, pressionado `#D9DECF` e `#CFD5C4` | ações do sucesso (`09`), Cancelar (`10`) | `--frost` |
| Botão de perigo | `#D43A2A`, hover `#C63424`, pressionado `#B92F20` | Excluir lembrete (`10`) | `ConfirmSheet.module.css` |
| Folha (painel de cantos altos) | `#EFF0EA`, raio de 38 du nos cantos de cima | lista e configurações (`07`, `08`) | `Lembretes.module.css` `.sheet` |
| Aviso de erro | fundo `#FDF0EE`, texto `#8E2418` | permissão negada (`08`) | `Configuracoes.module.css` `.erro` |
| Aviso informativo | fundo `#E7F4EB`, texto `#1B4436` | dicas nas configurações (`08`) | `.aviso` |
| Ativo (ponto de status) | `#029554` | selo "Ativo" do sucesso (`09`) | `--status-green` |
| Texto sobre verde escuro | `#FDFAF6`, `#CCD8D0`, `#B1C3B8`, `#A7B9B0` | subtítulos nos cabeçalhos verdes (`07`, `08`) | `--on-dark-100` a `-400` |
| Menta e floresta extras | `--forest-950 #0D2A1B`, `--mint-200 #C6E4D5`, `--mint-300 #94F9CD`, `--mint-400 #7FEAC6` | palco, degradês e foco | `tokens.css` |
| Aba inativa e barra home | `#777C8A` e `#B7B3AE` | barra de abas (`04`, `07`) | `--tab-inactive`, `--home-indicator` |
| Vidro sobre verde | fundo `rgba(255,255,255,.05)`, borda `rgba(255,255,255,.20)`, desfoque de 8 du | botões redondos do cabeçalho (`07`, `02`) | `Button.module.css` `.glass` |

### Fundos em degradê (sem token; viram tokens de degradê)

- **Cabeçalho da lista e das configurações** (`07`, `08`; altura de 345 du): `linear-gradient(168deg, #2A5B47 0%, #184434 50%, #0E301F 100%)`, mais uma luz menta `radial-gradient(560 du 330 du em 90% 6%, rgba(127,234,198,.28) até transparente em 70%)` e uma sombra de pinheiro `radial-gradient(520 du 300 du em 4% 92%, rgba(33,105,85,.6) até transparente em 72%)`. Por cima, as curvas de nível (`topo-header.svg`) com máscara radial e um grão fino (opacidade 0,09, `soft-light`).
- **Cabeçalho do formulário** (`04`, `06`, `12` a `15`): `linear-gradient(180deg, #CBE4D6 0%, #E3EEE5 44%, #F5F2ED 100%)`, luz menta `rgba(148,249,205,.36)` no canto superior esquerdo, sombra `rgba(33,105,85,.58)` no canto superior direito, brilho branco `rgba(255,255,255,.55)` e anéis concêntricos de `rgba(255,255,255,.34)` com máscara radial.
- **Telas de conta** (`02`): o mesmo verde do cabeçalho da lista (`168deg`, `#2A5B47`, `#184434` a 52%, `#0E301F`) com três luzes radiais (`rgba(127,234,198,.26)`, `rgba(132,250,218,.15)`, `rgba(33,105,85,.55)`) e as curvas de nível em cima.

## Geometria

Ainda não medida em código. As medidas vêm em `du` do CSS do app web (1 du = 1 px da arte de 851 px). Nas capturas de 430 px de largura, **1 du = 0,505 px de CSS = 1,01 px de imagem**, ou seja, a captura de 860 px reproduz a arte 1:1. Para converter em dp do Expo: `dp = du × 430 / 851`. Textos abaixo de 12 (o app web chega a 9) sobem para o piso de 12 do Design System.
