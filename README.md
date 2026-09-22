# LembreiAi (Expo)

Lembretes que avisam **na hora certa** ou **quando você chega ao lugar certo**. App em Expo (iOS, Android e web) que porta o [`lembreiAI`](..) (a pasta acima; a especificação), com backend próprio em [`deploy/`](deploy/README.md).

**Estado (20/09/2026):** código e testes verdes; APK Android assinado testado em emulador; backend testado em Docker. **Falta implantar na VPS.** O andamento está em [`../../Tarefas/TAREFAS.md`](../../Tarefas/TAREFAS.md).

## Rodar

```bash
cp .env.example .env.local        # e ajuste (veja o comentário no arquivo; o app web vizinho tem o mesmo Supabase local)
npm install
npm start                         # Expo: w abre a web; QR abre no Expo Go
```

Mudou o `.env.local`? Reinicie com `npx expo start --clear` (o valor é embutido no build).

## Conferir

```bash
npm run typecheck
npm test                          # Jest (jest-expo): 133 testes
npx expo-doctor                   # 21 checagens
npx expo install --check          # versões batem com o SDK?
```

## Android (grátis, sem loja)

```bash
export EXPO_PUBLIC_SUPABASE_URL=https://SEU-HOST
export EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<chave anon do backend>
scripts/build-android.sh          # gera dist-android/lembreiai.apk assinado
```

Usa o JDK 17 e o Android SDK deste Mac e a chave de `~/.lembreiai/keys/` (backup: `scripts/backup-keystore.sh`). Detalhes, testes no emulador e o caminho das lojas: [`LANCAMENTO.md`](LANCAMENTO.md).

## Estrutura

| Pasta | O que tem |
|---|---|
| `app/` | rotas (expo-router). **Nunca crie `src/app/`**: ele ganha de `app/` |
| `src/components`, `src/state`, `src/lib`, `src/data` | interface, estado (auth, lembretes, geo, avisos), regras puras e modelo |
| `deploy/` | backend próprio (Postgres + login + API) e scripts de operação: [`deploy/README.md`](deploy/README.md) |
| `plugins/` | plugin de assinatura de release do Android |
| `scripts/` | `build-android.sh`, `backup-keystore.sh` |
| `public/` | manifest e ícones do PWA |

## Leia antes de mexer

[`CLAUDE.md`](CLAUDE.md): armadilhas já pagas (rotas, `.env.local`, notificações do SDK 57, alarmes exatos, backups) · [`AGENTS.md`](AGENTS.md): use a doc **versionada** do Expo (SDK 57) · [`LANCAMENTO.md`](LANCAMENTO.md): distribuição gratuita e lojas.
