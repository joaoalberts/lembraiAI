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
- Pontos de recuperação (tags `ponto-de-recuperacao/*`): `01-antes-do-design-system`, `02-design-system-aplicado`, `03-antes-do-visual-original`.
- **A referência visual é o app web `../lembreiAI` (versão do disco, 19/09) e `ref/*.png`.** Fonte, imagens, efeitos e telas ainda estão sendo alinhados a ele (tarefa `visual-original-no-expo`, quadro `Tarefas/` do workspace). Onde este app divergir do original, vale o original.

## Versionamento (leia antes de commitar)

Um commit por mudança, `npm run typecheck && npm test` antes, tag `ponto-de-recuperacao/NN-...` antes de fase grande, nunca `reset --hard`, `checkout` de arquivo nem `clean`, sem push sem pedido. Regras e comandos completos: `docs/VERSIONAMENTO.md`.

## Fonte da verdade

- **Schema do banco:** `../lembreiAI/supabase/migrations/` (`kind`, `lat/lng`, `remind_date/time`, `icon`, `repeat`, `active`; categorias `green/orange/blue/purple/pink`;
  `delete_my_account()` para a exclusão de conta).
- **Modelo e linhas:** `src/lib/reminder-rows.ts` (`toRow`/`fromRow`) e `src/lib/categorize.ts` (cópia do web). Regras de senha/e-mail e tradução de erros do Supabase: `src/lib/validacao.ts` (port do web).
- **Geofence:** `src/lib/geofence.ts`. Histerese e piso de precisão de 200 m são decisões do usuário, não "otimizar".

## Armadilhas

- Rotas ficam em `app/`. **Não criar `src/app/`**: o Expo Router prioriza `src/app` e ignora `app/`.
- Rota nova? As rotas tipadas só são regeneradas por `expo start` (o `export` não). Sem isso o `tsc` recusa `router.push('/rota-nova')`: suba o dev server uma vez.
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

- `src/**/__tests__/` (133 testes, 13 suítes). Lógica pura (formato, geofence, agenda de avisos, validação, linhas do banco, armazenamento da sessão), o `AuthProvider` com o Supabase simulado e o texto das páginas públicas.
- Bom teste falha quando o bug volta: depois de escrever, quebre o código de propósito (mutação) e veja o teste vermelho. Uma rede que nunca falha não prova nada.
- O `act` do teste junta atualizações do React, então **não** prova ordem de renders; isso se confere no navegador com o build de produção.
