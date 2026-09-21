@AGENTS.md

# lembreiai-expo

Port do app web `../lembreiAI` para Expo (iOS, Android e web). O app web é a especificação: não reinventar regras. Distribuição gratuita e, depois, as lojas: `LANCAMENTO.md`. Backend próprio: `deploy/README.md`.

## Comandos

```bash
npm start                  # Expo (web: tecla w). Mudou .env.local? use `npx expo start --clear`
npm test                   # Jest (jest-expo); `npm run test:watch` para acompanhar
npm run typecheck          # tsc --noEmit
npx expo install --check   # versões batem com o SDK?
npx expo-doctor            # saúde do projeto (21 checagens)
npx expo export --platform all --output-dir /tmp/lembreiai-export   # valida os bundles iOS/Android/web
npm run design:docs        # regenera as tabelas de docs/DESIGN_SYSTEM.md a partir dos tokens
```

## Design System (leia antes de mexer em qualquer visual)

- **Padrão:** `docs/DESIGN_SYSTEM.md`. **Valores:** `src/design/tokens.ts` (cor, tipografia, espaço, raio, sombra, tamanho). As tabelas do documento são geradas dos tokens; um teste falha se divergirem.
- **Nunca valor solto** (`#hex`, `fontSize: 16`, `padding: 12`, `fontWeight: '600'`) fora de `src/design/`: `src/design/__tests__/valores-soltos.test.ts` barra. Ele tem uma lista `PENDENTES` de arquivos ainda não migrados; ela só encolhe.
- Mudou uma decisão visual? Token → descrição em `src/design/doc.ts` → `npm run design:docs` → registro na seção 18 do documento → `npm test`.
- Contraste é testado (`src/design/a11y.ts`). Laranja nunca é cor de texto; cinza de texto é só `colors.text.secondary`/`placeholder`.
- Ver o app sem conta e sem servidor real: `scripts/preview-backend-falso.mjs` (instruções no topo). Apague o `.env.development.local` depois: ele vence o `.env.local`.
- Pontos de recuperação (tags `ponto-de-recuperacao/*`): `01-antes-do-design-system`, `02-design-system-aplicado`, `03-antes-do-visual-original`, `04-visual-original` (as 15 telas portadas), `05-verificado-e-corrigido` (depois do Verificador e do Android), `06-toque-44-e-barra-de-status` (alvo de 44, contraste a 3:1, barra de status e páginas públicas).
- **A fonte de verdade visual são as 15 imagens de `docs/referencias/`** (capturas do app web, 430 px em retina; índice em `INDICE.md`, medição de cor em `MEDICOES.md`) e, para o que imagem parada não mostra, o CSS do app web `../lembreiAI` (versão do disco, 19/09). Fonte, imagens, efeitos e as 15 telas já foram portados e conferidos no navegador e no emulador Android (tarefa `visual-original-no-expo`, quadro `Tarefas/` do workspace); falta o iOS e o aparelho físico. O que ainda não tem tela (aba Mapa) e o que ficou de fora está nas tarefas do backlog. Onde o app divergir das imagens, valem as imagens. Capturas trazem o perfil de cor da tela: converta para sRGB antes de comparar (`scripts/amostrar-referencias.py`).

## Versionamento (leia antes de commitar)

Um commit por mudança, `npm run typecheck && npm test` antes, tag `ponto-de-recuperacao/NN-...` antes de fase grande, nunca `reset --hard`, `checkout` de arquivo nem `clean`, sem push sem pedido. Regras e comandos completos: `docs/VERSIONAMENTO.md`.

## Fonte da verdade

- **Schema do banco:** `../lembreiAI/supabase/migrations/` (`kind`, `lat/lng`, `remind_date/time`, `icon`, `repeat`, `active`; categorias `green/orange/blue/purple/pink`;
  `delete_my_account()` para a exclusão de conta).
- **Modelo e linhas:** `src/lib/reminder-rows.ts` (`toRow`/`fromRow`) e `src/lib/categorize.ts` (cópia do web). Regras de senha/e-mail e tradução de erros do Supabase: `src/lib/validacao.ts` (port do web).
- **Geofence:** `src/lib/geofence.ts`. Histerese e piso de precisão de 200 m são decisões do usuário, não "otimizar".
- **Editar e compartilhar (decisão do João, 21/09: entram funcionando):** `update(id, rascunho)` em `src/state/reminders.tsx` (avisos e geofences se refazem sozinhos, porque dependem só da lista) e `src/lib/compartilhar.ts` (folha do sistema no celular; folha do navegador ou cópia na web). O calendário do seletor de data é próprio (`src/lib/calendario.ts`): o original usa o popup do navegador. A busca de endereço é `src/lib/geocodificar.ts` (Nominatim: gratuito, sem chave; uso leve, um pedido por vez).
- **Tela de sucesso** (`app/(app)/sucesso.tsx`, imagem 09; Design System 11.12): herói animado em `src/components/SucessoHeroi.tsx` com os dados em `src/design/heroi.ts`; "Compartilhar" envia **texto** (o original gera uma imagem JPEG: fica como tarefa própria) e responde "Copiado"/"Indisponível" no lugar do rótulo. A rota não é aba e esconde a barra de abas.

## Armadilhas

- Rotas ficam em `app/`. **Não criar `src/app/`**: o Expo Router prioriza `src/app` e ignora `app/`.
- Rota nova? As rotas tipadas só são regeneradas por `expo start` (o `export` não). Sem isso o `tsc` recusa `router.push('/rota-nova')`: suba o dev server uma vez.
- **Abas ficam montadas** (`app/(app)/`): a aba em segundo plano continua na árvore (na web, visível e só `aria-hidden`). Dois formulários montados juntos duplicariam campos e ids, então `novo` e `editar` só renderizam o formulário com `useIsFocused()` (`src/__tests__/novo.test.tsx`, `editar.test.tsx`).
- **Teclado no Android (tela cheia):** as barras do sistema são translúcidas e a janela **não** é redimensionada para o teclado; o que fica no pé da tela (a `Sheet`) precisa subir sozinho. Use `useAlturaDoTeclado` (`src/lib/teclado.ts`): no Android o evento `keyboardDidShow` desconta a barra de navegação (`height = ime − barras`) e o hook a soma de volta; no iOS `keyboardWillShow` já cobre o indicador de início. Na web não há evento. O formulário usa `KeyboardAvoidingView` só no iOS e, nos dois, rola até o cartão do Local quando a busca de endereço ganha o foco com o teclado aberto (senão a lista de sugestões, que nasce debaixo do campo, ficava atrás dele).
- **Barra de status (relógio, sinal, bateria) no nativo:** o app desenha por baixo dela, então a cor do texto segue o fundo. O padrão (escuro, para as telas claras) é `BarraDeStatusPadrao` na raiz; telas de fundo escuro declaram `<BarraDeStatus sobre="escuro" />` (cabeçalho verde, contas, abertura) e **só a tela em foco declara** (as abas ficam montadas e a última `StatusBar` montada venceria). Nunca importe `expo-status-bar` fora de `BarraDeStatus.tsx` (`src/__tests__/barra-de-status.test.ts`). Design System 11.16.
- **Nenhum toque atravessa a barra de status do sistema (Android):** um botão encostado nela perde a folga de cima do `Toque` (medido: o "Voltar" das contas fica com 44 × 40, porque o desenho o põe na linha da barra). Não é defeito do `Toque`: a folga vale por inteiro onde há espaço. Completar os 44 exige respiro abaixo da barra, o que desloca a imagem (pergunta aberta ao João; Design System 16.2).
- **Toque que vaza para a WebView (Android):** o mapa do formulário é uma WebView; uma lista que passa do limite do contêiner dela (as sugestões da busca, em posição absoluta) recebe o toque do React Native, mas a WebView de baixo também o recebe pelo caminho nativo. Enquanto a lista está aberta o contêiner do mapa fica com `pointerEvents: 'none'` no estilo (o `ReactViewGroup` intercepta), como o formulário já faz (`PlaceSearch.aoMudarSugestoes`).
- **Voltar nas abas:** o padrão do `Tabs` (`backBehavior: 'firstRoute'`) leva sempre à primeira aba e faz `router.canGoBack()` mentir num acesso direto por endereço. O layout usa `backBehavior="history"`; sem isso o Salvar da edição caía em Início e o "sem histórico → lista" do formulário nunca valia (`src/__tests__/navegacao.test.tsx`).
- **react-native-web 0.21 não é o React Native:** `accessibilityState` não chega ao DOM (use `aria-checked`, `aria-selected` ou a prop `disabled`), o `Pressable` só lê `tabIndex` (para tirar do Tab: `tabIndex={-1}`, além de `focusable={false}` no celular) e `hitSlop` não existe (por isso todo controle usa o `Toque`, que completa o alvo de 44 nas duas plataformas; nunca importe o `Pressable` cru). `src/__tests__/acessibilidade-web.test.ts` barra os dois primeiros; na dúvida, confira o DOM no navegador.
- **`Animated` + SVG na web:** o RN Web injeta `collapsable={false}` em todo componente animado; a `View` ignora, mas um `Path` do `react-native-svg` a repassa ao `<path>` e o React reclama no console. Envolva o `Path` num componente que descarte a prop antes de `Animated.createAnimatedComponent` (ver `SucessoHeroi.tsx`; `SucessoHeroiSvg.test.tsx` cobre). Não existe mais `StyleSheet.absoluteFillObject` no RN 0.86: use `StyleSheet.absoluteFill` numa lista de estilos.
- Proteção de rotas: `Stack.Protected` em `app/_layout.tsx`, com `autenticado = !!session && !recuperando`. **Nunca** navegar à mão após login/logout.
  Páginas públicas estáticas (política de privacidade, exclusão de conta) entram em `ROTAS_PUBLICAS` para saírem como HTML pronto.
- **Recuperação de senha** = código de 6 números do e-mail (`verifyOtp` com e-mail + token). O link do e-mail usa o Site URL do Supabase e abre o app web. Entre validar o código e definir a senha já
  existe sessão; sem o estado `recuperando` o layout jogaria a pessoa para dentro do app.
- **Sessão do Supabase** vive sempre em memória (`src/lib/session-storage.ts`); só a cópia em disco depende de "Manter conectado". Descartar a gravação deixa as chamadas sem token (RLS devolve vazio).
- Nunca `{texto && <Text/>}` com string possivelmente vazia (crash no iOS/Android): use `texto !== ''` ou `!!texto`.
- Dependências nativas: sempre `npx expo install <pacote>` (não `npm install`); o SDK fixa as versões.
- **`.env.local` vence variável de shell no modo dev** (módulo virtual gerado do arquivo) e o shell vence no `expo export`. Mudou o arquivo: `--clear`. No celular físico, `127.0.0.1` não alcança o Mac.
- `react-native-maps` não roda na web: `RemindersMap.native.tsx` (mapa) + `RemindersMap.web.tsx`. **Os dois usam Leaflet** pelo mesmo componente DOM `src/components/LeafletMapDom.tsx` (`'use dom'`, tiles do OpenStreetMap):
  na web ele é carregado só no cliente (importar `leaflet` fora do `useEffect` quebra o export estático); no Android sem chave do Google roda num WebView (props serializáveis; callbacks viram assíncronos).
  Na web o `Modal` sai da coluna do app: dê `maxWidth` ao painel. `expo-maps` é alpha e não roda no Expo Go.
  **A WebView cria o mapa com 0 × 0** (o tamanho chega depois): um `fitBounds` nesse instante põe o mapa no zoom 0 com os pinos empilhados. O enquadramento dos marcadores passa por `criarEnquadramento` (`src/lib/enquadramento.ts`), que espera o tamanho e o cumpre no `ResizeObserver`; o Jest não alcança o arquivo `'use dom'` (o Babel o troca por um proxy), então a função é testada à parte e a fiação se confere no navegador (mapa sem tamanho, depois com) e no emulador.
- Mapa no Android sem chave do Google Maps derrubaria o app: `app.config.ts` injeta `GOOGLE_MAPS_ANDROID_API_KEY` e `nativeMapUnavailable` (src/lib/map-availability.ts) manda para o Leaflet quando não há chave (Expo Go ou build sem chave).
  Com chave do Google (loja), a política de privacidade (`app/privacidade.tsx`, seção "Mapas") precisa citar o Google Maps.
- Notificações não existem na web. No SDK 57 não há `presentNotificationAsync` (use `trigger: null`) e o handler exige `shouldShowBanner`/`shouldShowList`.
- `app.json`: `userInterfaceStyle: light` (a UI é toda clara); `blockedPermissions` tira SYSTEM_ALERT_WINDOW e armazenamento; `motionUsagePermission: false` tira o texto de movimento do iOS. Conferido com `expo prebuild` numa cópia.
- `.claude/` do projeto é do usuário; o `launch.json` de preview vive no workspace da sessão, não aqui.
- Neste Mac há **JDK 17 + Android SDK e emulador** (só no usuário: `~/Library/Java`, `~/Library/Android/sdk`; AVD `lembreiai_test`), então o Android compila e roda de verdade. **Não há Xcode completo**: iOS só é validado por `expo export`/`expo prebuild` e Expo Go.
- `EXPO_PUBLIC_CONTACT_EMAIL` fica **vazio** até o usuário decidir; não publicar o e-mail pessoal dele. As páginas públicas leem a variável ao renderizar e já tratam a falta (testado em `src/__tests__/paginas-publicas.test.tsx`).

## Android sem loja e backend próprio

- APK: `scripts/build-android.sh` (exige `EXPO_PUBLIC_SUPABASE_URL` e `_PUBLISHABLE_KEY`; `ALLOW_CLEARTEXT=1` só para emulador com servidor http). Assina com o keystore de `~/.lembreiai/keys/` (fora do repo; o backup é do usuário). Teste no emulador com `adb` + `uiautomator dump` (acha elementos por texto).
- **Alarmes exatos**: `SCHEDULE_EXACT_ALARM` + `USE_EXACT_ALARM` em `app.json`. Sem eles o Android atrasa o aviso por horário (medido: +2 min 14 s); com eles chegou na hora exata. `USE_EXACT_ALARM` exige declaração no Google Play (ver `LANCAMENTO.md`).
- `deploy/` é o backend (Postgres + GoTrue + PostgREST compatíveis com o `supabase-js`). Formatos: compose base + overlay Traefik ou Caddy, e o **compose único do Easypanel** gerado por `node deploy/scripts/build-easypanel.mjs` a partir de `deploy/easypanel/docker-compose.template.yml` (o `dist/` é ignorado pelo git; nunca edite o gerado).
- A VPS do usuário (`srv1974100.hstgr.cloud`) roda **Easypanel**: o compose dele não pode ter `ports`/`container_name`; o domínio aponta para `gateway:80`. Acesso depende do usuário (chave SSH pública + API key do Easypanel digitada por ele na CLI). Nada foi implantado ainda.
- **`pg_restore --clean` do banco inteiro falha** (o schema `auth` pertence ao GoTrue). Backup/restauração é só de dados (`auth.users`, `auth.identities`, `profiles`, `reminders`), por `deploy/scripts/backup.sh` e `restore.sh` (superusuário `supabase_admin`). A política de privacidade promete backups por até 14 dias: `backup.sh` e o texto andam juntos.
- Testar o backend: sempre numa stack Docker descartável (`docker compose -p ... down -v` no fim), com o `supabase-js` do app. Nunca criar contas de teste em servidor real.

## Testes

- `src/**/__tests__/` (a contagem sai de `npm test`). Lógica pura (formato, geofence, agenda de avisos, validação, linhas do banco, armazenamento da sessão, filtros da lista, formulário), o `AuthProvider` com o Supabase simulado, o texto das páginas públicas, os componentes e as telas. Testing Library 14: `render`, `fireEvent` e `act` são assíncronos, sempre com `await`.
- Navegação de verdade: `renderRouter` (`expo-router/testing-library`) foi escrito para o `render` síncrono do RNTL 13 e no 14 devolve uma Promise que carrega os auxiliares: `const app = renderRouter(telas, { initialUrl }); await app;` e leia `app.getPathname()` sem passar `app` por uma função `async` (ela o desembrulha e os auxiliares somem). Exemplo em `src/__tests__/navegacao.test.tsx`.
- Bom teste falha quando o bug volta: depois de escrever, quebre o código de propósito (mutação) e veja o teste vermelho. Uma rede que nunca falha não prova nada.
- O `act` do teste junta atualizações do React, então **não** prova ordem de renders; isso se confere no navegador com o build de produção.
