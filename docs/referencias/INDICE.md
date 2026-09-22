# Referências visuais do LembreiAi (capturas do app web)

Cópia **integral e idêntica, byte a byte** (SHA-256 conferido arquivo por arquivo), da pasta `imagens paginas lembretes ` da área de trabalho do João, feita em 21/09/2026. As originais continuam lá, intocadas. **Estas imagens são a fonte de verdade visual do app:** o Design System (`../DESIGN_SYSTEM.md`) e as telas seguem o que elas mostram.

## Como ler as capturas

- São capturas do app web original (`Aplicativos/lembreiAI`) numa coluna de 430 px, em tela retina (144 dpi): **1 px de CSS = 2 px de imagem**. Divida as medidas por 2. A `01-onboarding.png` é a arte original (851 px de largura, 1 px = 1 `du`).
- O perfil de cor embutido é o da tela ("Display"), **não** o sRGB. Converta para sRGB antes de comparar cores: o laranja `#FE532A` aparece cru como `#EB603C`. `scripts/amostrar-referencias.py` faz a conversão.
- Imagem parada não mostra sombra em movimento, animação nem estado de toque: para isso valem os CSS do app web (`Aplicativos/lembreiAI/src`).
- Não copie erro de renderização: o popup de data do navegador (`12`), o botão escondido atrás do mapa (`06` e `15`, página rolada) e o corte inferior das telas rolantes.
- **Divergência deliberada, não conserte:** a `01-onboarding.png` mostra uma foto de parede verde desfocada por trás do pino e do título. O João pediu essa foto fora em 22/09/2026 (Design System, 18); no Expo a abertura tem fundo liso. O resto da `01` continua valendo.

## Índice (15 arquivos, 7.4 MB)

| Arquivo | Dimensões | Bytes | O que mostra |
|---|---|---|---|
| [`01-onboarding.png`](01-onboarding.png) | 851×1848 | 1.840.341 | Onboarding "Lembre de tudo!" (rota `/`. aba Início **no app web**; no Expo ela só existe para quem ainda não entrou, ver `DESIGN_SYSTEM.md` 2.3). Arte de referência original: sem perfil de cor e com 1 px = 1 du. |
| [`02-entrar.png`](02-entrar.png) | 818×1484 | 551.222 | Entrar (login) sobre o fundo de curvas de nível: cartão creme. campos. "Lembrar-me". "Esqueci minha senha" e o painel de vidro "Criar conta". |
| [`03-recorte-degrade-do-formulario.png`](03-recorte-degrade-do-formulario.png) | 48×140 | 9.430 | Recorte de 48×140 do canto superior esquerdo do cabeçalho do Novo lembrete: amostra do degradê menta e o início do botão voltar. |
| [`04-novo-lembrete-por-data-e-horario.png`](04-novo-lembrete-por-data-e-horario.png) | 860×1654 | 321.488 | Novo lembrete no modo "Por data e horário" (padrão). com Local desligado e a barra de abas. |
| [`05-folha-minha-conta.png`](05-folha-minha-conta.png) | 862×1652 | 178.440 | Folha "Minha conta" (Alterar senha e Sair) aberta pelo botão de conta do cabeçalho. sobre o Novo lembrete. |
| [`06-novo-lembrete-por-local.png`](06-novo-lembrete-por-local.png) | 862×1654 | 647.939 | Novo lembrete no modo "Por local": Horário desabilitado. busca de endereço e mapa dentro do formulário. Página rolada: o botão fica atrás do mapa. |
| [`07-lista-meus-lembretes.png`](07-lista-meus-lembretes.png) | 860×1652 | 520.932 | Meus lembretes: cabeçalho verde com curvas de nível. busca. conta. "Novo lembrete". filtros com contagem. seção por período. cartões e "Dica para você". |
| [`08-configuracoes.png`](08-configuracoes.png) | 862×1654 | 513.969 | Configurações: conta com "Sair". lembretes por local (com aviso de permissão negada). notificações. instalar o app e "Até onde vai o monitoramento". |
| [`09-sucesso-lembrete-criado.png`](09-sucesso-lembrete-criado.png) | 864×1656 | 863.629 | "Lembrete criado com sucesso!": ícone animado. resumo do lembrete. ações Editar. Excluir e Compartilhar. "Dica inteligente" e "Ver todos os lembretes". |
| [`10-confirmar-exclusao.png`](10-confirmar-exclusao.png) | 862×1654 | 636.031 | Folha "Excluir lembrete?" (botão vermelho e "Cancelar") sobre a tela de sucesso escurecida. |
| [`11-folha-menu-do-lembrete.png`](11-folha-menu-do-lembrete.png) | 862×1652 | 269.683 | Folha do menu "..." de um cartão da lista: título. data e hora. "Editar" e "Excluir". |
| [`12-seletor-de-data.png`](12-seletor-de-data.png) | 864×1656 | 357.625 | Seletor de data. **É o popup nativo do navegador** (calendário azul do Chrome). não um desenho do app: o original não tem calendário próprio. |
| [`13-folha-horario.png`](13-folha-horario.png) | 862×1652 | 260.993 | Folha "Horário": roda de horas e minutos (09 : 00) com faixa de seleção e "Pronto". |
| [`14-folha-repetir.png`](14-folha-repetir.png) | 862×1652 | 284.227 | Folha "Repetir": Nunca (marcado). Todos os dias. Dias úteis. Toda semana. Todo mês e Todo ano. cada um com sua explicação. |
| [`15-novo-lembrete-por-local-repetindo.png`](15-novo-lembrete-por-local-repetindo.png) | 860×1654 | 544.896 | Novo lembrete "Por local" com Repetir = Todos os dias (valor em verde) e o mapa em outro ponto. Página rolada: o botão fica atrás do mapa. |

## Origem e integridade

| Arquivo | Nome original | SHA-256 |
|---|---|---|
| `01-onboarding.png` | `1.png` | `b9913c5edb7669d2ffc10048aaf7701589e28019f0155cf21a0606ffe05435f2` |
| `02-entrar.png` | `Captura de Tela 2026-09-21 às 01.45.19.png` | `4e1fd732bb9c04ba59ef154c5afb9ae465b29e91c0ed6b0d18b95ed22d30595c` |
| `03-recorte-degrade-do-formulario.png` | `Captura de Tela 2026-09-21 às 01.51.22.png` | `db9c493e8d91481e25e04a7cc488bb46ddf7d38cc1e68e804cc0384a545ad8b0` |
| `04-novo-lembrete-por-data-e-horario.png` | `Captura de Tela 2026-09-21 às 01.51.59.png` | `116659f6d4d94220668592e142ecd18ebc80d15d06a75763e63969d12eaa7725` |
| `05-folha-minha-conta.png` | `Captura de Tela 2026-09-21 às 01.52.34.png` | `5a99d79fb1b56a07920ed1d9f53a6e3ddff432bf4242f25fcb30327911c9066a` |
| `06-novo-lembrete-por-local.png` | `Captura de Tela 2026-09-21 às 01.53.21.png` | `4e8b81c7d7da6f5dda9b69c5b2b581b1c012c001a6ae6a134f801471262d73ee` |
| `07-lista-meus-lembretes.png` | `Captura de Tela 2026-09-21 às 01.53.42.png` | `b4fa803651f04f33aa4fbae0d2b22be226fed2d5151e437c3869671cbb9dcff4` |
| `08-configuracoes.png` | `Captura de Tela 2026-09-21 às 01.54.40.png` | `e42eb9581adef8f4084a14945e707cf8423adb8b86e19d9a9b325b9fa708d6fa` |
| `09-sucesso-lembrete-criado.png` | `Captura de Tela 2026-09-21 às 01.55.15.png` | `0ef75cf678f37f18ae47f33b980290df8a2461a37a3694d98b218a7b36b305bf` |
| `10-confirmar-exclusao.png` | `Captura de Tela 2026-09-21 às 01.55.37.png` | `13e62a8f9d0ad69c0fbf7eec02d79204e50d2b58a640804bdc8aacdcd7e467f6` |
| `11-folha-menu-do-lembrete.png` | `Captura de Tela 2026-09-21 às 01.56.07.png` | `86949f4bf44077cd0ac12396ea04a301422cb646a9d363dea6d5a4ba1eb98795` |
| `12-seletor-de-data.png` | `Captura de Tela 2026-09-21 às 01.56.39.png` | `752429c2c25742f9852fdcaca8a212b1da717d909700f0a812372feb337c2382` |
| `13-folha-horario.png` | `Captura de Tela 2026-09-21 às 01.56.58.png` | `e86eba07cbecce29e23cd4405e43c66b824e6ae4945fa14fb9285c7ad99d7d6c` |
| `14-folha-repetir.png` | `Captura de Tela 2026-09-21 às 01.57.28.png` | `cac8e6508b710cdaeba61230b791fa27bf34a5b98e1f7000770e1ed897e0285a` |
| `15-novo-lembrete-por-local-repetindo.png` | `Captura de Tela 2026-09-21 às 01.57.53.png` | `f00a6710fda62ec52a10998ddddbba7172c5cb751b58c6c40a5fddd9f553199c` |

Conferir de novo (na pasta `docs/referencias`): `shasum -a 256 *.png` e comparar com a tabela acima.

A `01-onboarding.png` é idêntica (mesmo SHA-256) à `ref/1.png` do app web. As referências antigas do app web (`ref/2.png`, `4.png` e `5.png`) foram superadas por estas capturas e ficam só como histórico em `Aplicativos/lembreiAI/ref/`.
