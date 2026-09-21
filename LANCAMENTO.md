# Lançamento: caminho gratuito e, depois, as lojas

Atualizado em 20/09/2026. Este guia separa o que **já está pronto e verificado** do que **só você pode fazer** (contas, dinheiro, credenciais) e traz os comandos exatos.
Nada aqui foi enviado a nenhuma loja e **nada foi implantado na sua VPS ainda** (falta o acesso, seção 3).

## 1. Situação

| Item | Estado |
|---|---|
| Código: typecheck, 133 testes (com testes de mutação), `expo-doctor` 21/21 | ✅ verificado |
| Configuração nativa (`expo prebuild`): permissões, textos em português, ícones, bundle id | ✅ verificado (AndroidManifest e Info.plist inspecionados) |
| Web estático (`expo export`), política de privacidade e página de exclusão como HTML pronto | ✅ verificado no navegador |
| **Backend próprio** (`deploy/`): Postgres + login (GoTrue) + API (PostgREST), compatível com o `supabase-js` do app | ✅ **91 checagens** em Docker descartável: 67 de ponta a ponta nos 3 formatos + 24 de operação (backup/restauração de desastre, reset de senha, site). Detalhes em `deploy/README.md` |
| **APK de Android** (release, assinado, ~56 MB) | ✅ compilado localmente e **testado num emulador Android 16**: login, lista, mapa, marcador, sessão, notificação exata, exclusão de conta (seção 5) |
| Mapa do Android **sem chave do Google** (Leaflet + OpenStreetMap num WebView) | ✅ verificado no emulador; tiles carregam, marcadores respondem ao toque |
| Aviso por horário **exato** no Android | ✅ verificado: alvo 17:42:00, notificação às 17:42:00 (antes da correção chegou +2 min 14 s) |
| Implantação na VPS (Hostinger, Easypanel) | ⛔ **não feita**: precisa do seu acesso (seção 3) |
| Teste em aparelho Android/iPhone **reais** | ⛔ só emulador Android; **nada foi testado em iOS** (este Mac não tem Xcode completo) |
| Lojas (App Store, Google Play), build no EAS | ⛔ não feito: exige contas e taxas suas (seções 7 a 9) |
| E-mail real de recuperação de senha | ⛔ falta um SMTP seu (seção 4); o código do e-mail foi testado com SMTP de teste |

## 2. O caminho gratuito, plataforma por plataforma

| Plataforma | Como distribuir de graça | O que funciona |
|---|---|---|
| **Android** | APK assinado baixado do seu próprio site (`https://SEU-HOST/lembreiai.apk`) | tudo: lembretes, mapa, avisos por horário exatos, aviso por local com o app aberto |
| **iPhone** | Só a versão **web** (abrir o site no Safari e "Adicionar à Tela de Início") | criar/ver lembretes e mapa. **Não avisa**: notificações não existem na web do app |
| **iPhone nativo** | **Não há forma gratuita de distribuir.** TestFlight/App Store exigem o Apple Developer Program (US$ 99/ano). Gratuito só no **seu** aparelho, instalando pelo Xcode com um Apple ID comum (o app expira em 7 dias) | tudo, mas só para você |
| Backend | A sua VPS da Hostinger (Easypanel), pacote `deploy/` | sem limite de projetos, sem pausa por inatividade |
| Mapa | Leaflet + OpenStreetMap (web e Android) | sem chave nem cartão |
| E-mail | Um SMTP gratuito (Gmail com senha de app, por exemplo) ou o plano B por script | recuperação de senha |

Ou seja: o app **completo** é de graça para Android; no iPhone o app completo só existe pagando a Apple.

## 3. O que falta de você para implantar (uma vez, ~5 minutos)

A VPS `srv1974100.hstgr.cloud` roda o **Easypanel** (painel na porta 3000; o certificado do host é `CN=Easypanel` e a raiz responde 404 do Traefik dele). O host raiz ainda não tem nenhum serviço. Preciso de dois acessos seus (passos 1 e 3), que **você** cria e que você pode revogar a qualquer hora:

1. **Chave SSH** (só a parte pública passa por aqui). Já gerei um par dedicado em `~/.ssh/lembreiai_vps` neste Mac. Adicione a chave pública (está na resposta do chat) na página da VPS no hPanel, na área de chaves SSH (o nome do menu pode variar).
   Alternativa: no terminal do navegador do hPanel, `mkdir -p ~/.ssh && echo 'CHAVE-PÚBLICA' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys`. Para revogar depois, apague essa linha.
2. **Túnel SSH até o painel.** A porta 3000 do Easypanel é HTTP puro (sem HTTPS), então **nem o login no painel nem a API key** devem trafegar por ela. No seu terminal (troque `root` se o seu usuário SSH for outro):

```bash
ssh -f -N -o StrictHostKeyChecking=accept-new -L 13000:127.0.0.1:3000 -i ~/.ssh/lembreiai_vps root@srv1974100.hstgr.cloud
```

3. **API key do Easypanel** (para eu criar o serviço no painel de forma visível para você). Abra **`http://127.0.0.1:13000`** no navegador (é o painel, pelo túnel), entre e vá em Settings → Server → Users → **Generate API Key**.
4. **CLI do Easypanel** no **seu** terminal. A chave é digitada por você e fica no Keychain do macOS; não passa pelo chat:

```bash
curl -fsSL https://get.easypanel.io/cli | sh
```

```bash
easypanel server add vps http://127.0.0.1:13000
```

Com isso eu inspeciono a VPS só para leitura (Docker, versão do Compose, o que já roda), crio o projeto `lembreiai` com o serviço Compose, ligo o domínio, faço o deploy, publico o site e o APK e verifico tudo.
Tudo é revogável: apague a linha da chave SSH e a API key no painel e o meu acesso acaba.
Depois, considere fechar a porta 3000 no firewall da VPS (o painel passa a ser acessado só pelo túnel).

## 4. E-mail de recuperação de senha

Sem SMTP o cadastro entra direto, mas o "Esqueci minha senha" **não envia nada**. A tela diz "enviamos um código" e agora orienta: se não chegar, veja o spam e peça ao administrador (o `reset-password.sh` abaixo). Antes de divulgar o app:

- **Gmail**: conta com verificação em duas etapas → "Senhas de app" → gere uma. No painel do Easypanel (aba Environment do serviço) coloque `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_USER` e `SMTP_ADMIN_EMAIL` = seu Gmail, `SMTP_PASS` = a senha de app, e faça Deploy. **Digite você mesmo**; eu não preciso ver essa senha.
- Ou o plano B, sem e-mail: `deploy/scripts/reset-password.sh` (redefine a senha de uma conta pelo servidor; detalhes em `deploy/README.md`).

## 5. Android sem loja: build local, assinatura e testes

**Ferramentas já instaladas neste Mac** (só no seu usuário, sem sudo): JDK 17 em `~/Library/Java/JavaVirtualMachines/`, Android SDK 36 + build-tools 36.0.0 + NDK 27.1 + emulador em `~/Library/Android/sdk`, AVD `lembreiai_test` (Android 16, arm64). As licenças do SDK foram aceitas em seu nome, como você autorizou.

**Gerar o APK de produção** (depois que o backend estiver no ar; a URL e a chave ficam embutidas no app):

```bash
export EXPO_PUBLIC_SUPABASE_URL=https://SEU-HOST
export EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<ANON_KEY do backend>
scripts/build-android.sh          # gera dist-android/lembreiai.apk assinado (~10 min na 1ª vez, ~3 min depois)
```

**A chave de assinatura é sua e é insubstituível.** Fica em `~/.lembreiai/keys/lembreiai-release.keystore` (senhas em `keystore.env`, permissão 600). **Backup:** o `.keystore` já tem cópia no iCloud Drive (`joaoai-backups/keystore/`, feita e testada com `scripts/backup-keystore.sh`). **Falta você guardar as duas senhas do `keystore.env` no seu gerenciador de senhas** (elas não foram copiadas de propósito).
Sem ela não dá para atualizar quem já instalou o app: a pessoa teria de desinstalar e instalar de novo (os dados ficam no servidor, mas é ruim). Impressão digital do certificado atual (SHA-256): `e5522a50…0696278`.

**Publicar uma versão nova:** aumente `android.versionCode` (e `version`) em `app.json`, rode o build e envie o APK de novo com `deploy/scripts/publish-site.sh`. Quem já instalou atualiza por cima.

**Instalar no celular:** abra `https://SEU-HOST/lembreiai.apk`, permita "instalar apps desconhecidos" para o navegador. O Google Play Protect pode avisar que o app não é conhecido (esperado fora da loja).
O build de teste com servidor local usa `ALLOW_CLEARTEXT=1` **só** para o emulador; o de produção **não** libera HTTP puro (confira com `aapt2 dump xmltree` se quiser).

**Verificado no emulador Android 16 (arm64), com o APK de release assinado:**

- login, lista de lembretes, criar lembrete por horário, sair e entrar de novo;
- "Manter conectado" ligado: reabre direto na lista; desligado: volta ao login;
- aba Mapa: Leaflet com tiles do OpenStreetMap e círculos de raio; toque no marcador abre o painel nativo (distância em pt-BR);
- notificação por horário na hora exata, canal "lembretes", cor da marca; instalar por cima de uma versão anterior mantém a sessão;
- política de privacidade abrindo dentro do app; exclusão de conta com confirmação (cancelar mantém, confirmar encerra e volta ao login).

**Não verificado em Android real:** GPS de verdade (usei uma posição simulada), economia de bateria de fabricantes (Xiaomi/Samsung podem atrasar avisos com o app fechado), Wi-Fi/4G reais.

## 6. Testar agora no celular (Expo Go) com o Supabase local

1. Docker Desktop aberto e `cd ../lembreiAI && supabase start` (a pasta do app web fica ao lado desta).
2. Em `lembreiai-expo/.env.local`, troque a URL pelo IP do Mac na rede (o celular não alcança `127.0.0.1`):
   `EXPO_PUBLIC_SUPABASE_URL="http://SEU-IP:54321"`. Descubra o IP com `ipconfig getifaddr en0`. A API local responde nesse IP (verificado).
3. `npx expo start --clear` e escaneie o QR no Expo Go (celular e Mac na mesma rede Wi-Fi).
4. **`.env.local` vence variável de shell no modo dev** (o Expo gera um módulo virtual a partir do arquivo). No `expo export` é o contrário: o shell vence.
   Depois de mudar o `.env.local`, use sempre `--clear`, senão o app segue com o valor antigo.
5. Para o e-mail de recuperação trazer o código de 6 números, reinicie o Supabase depois de editar o template:
   `supabase stop && supabase start`. Os e-mails de teste aparecem no Mailpit: http://127.0.0.1:54324.
6. Roteiro: cadastro → criar lembrete por horário e por local (usar minha localização) → ligar "Monitorar lugares" em Config → mapa → sair → "Esqueci minha senha"
   → código do Mailpit → nova senha → entrar → excluir conta.

No Expo Go, notificações locais e o mapa funcionam. O que **não** dá para validar no Expo Go: ícone/splash finais, o comportamento de produção.

---

# Caminho das lojas (pago; só se decidir por ele)

## 7. Decisões suas (permanentes: pensem antes do 1º envio)

- **Identificador do app** — hoje `com.joaoai.lembreiai` (`ios.bundleIdentifier` e `android.package` em `app.json`). **Não muda depois de publicado.**
  Se você tem um domínio próprio, o costume é `com.seudominio.lembreiai`. No APK de sideload ele também vale (trocar depois = app novo).
- **Nome na loja** — "LembreiAi" (confira se está livre nas duas lojas).
- **Domínio público** — as lojas exigem URL de política de privacidade e de exclusão de conta. A web exportada tem `/privacidade` e `/excluir-conta`.
  Um domínio próprio (pago) é melhor que o `hstgr.cloud` da Hostinger: a URL fica embutida no app para sempre.
- **E-mail de contato** — vai nessas duas páginas via `EXPO_PUBLIC_CONTACT_EMAIL`. **Não coloquei o seu no código nem no build.** Sem ele as páginas continuam coerentes (a política não cita contato; a exclusão se faz pelo app, pelo site ou por "Esqueci minha senha"),
  mas as **lojas costumam exigir um contato** na ficha e na política: decida um endereço (pode ser um e-mail só para o app) antes de publicar nelas.
- **Confirmação de e-mail no cadastro** — o padrão do backend próprio deixa desligada (`MAILER_AUTOCONFIRM=true`), como no projeto web; com SMTP dá para ligar (`false`).
- **Revisão jurídica** — o texto de `app/privacidade.tsx` descreve o que o app faz hoje, mas foi escrito por mim, não por advogado.

## 8. Variáveis e segredos no EAS

`.env.local` **não** vai para o EAS (o git o ignora). Crie as variáveis na nuvem, uma vez por ambiente (`production` e `preview`):

```bash
eas env:create --environment production --environment preview --name EXPO_PUBLIC_SUPABASE_URL --value https://SEU-HOST --visibility plaintext
eas env:create --environment production --environment preview --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --value <ANON_KEY> --visibility plaintext
eas env:create --environment production --environment preview --name GOOGLE_MAPS_ANDROID_API_KEY --value SUA-CHAVE --visibility secret
```

A chave do Google Maps (Android) é **opcional**: sem ela o app usa o mapa Leaflet (já verificado). Com ela, o `react-native-maps` usa o Google Maps (e a seção "Mapas" da política de privacidade passa a precisar citá-lo); crie no Google Cloud (exige conta de cobrança), ative o
**Maps SDK for Android** e restrinja a chave ao pacote `com.joaoai.lembreiai` e ao SHA-1 do build. O build **`eas production` para Android** exige a chave (falha de propósito em `app.config.ts`); o `scripts/build-android.sh` não.
iOS usa o Apple Maps e não precisa de chave.

## 9. Builds e lojas

```bash
npm i -g eas-cli            # ou: npx eas-cli@latest <comando>
eas login
eas init                    # cria o projeto no EAS e grava o projectId no app.json
eas build --profile preview --platform android      # APK
eas build --profile production --platform all       # .aab (Android) e .ipa (iOS) para as lojas
```

O número de build (versionCode/buildNumber) sobe sozinho no EAS (`appVersionSource: remote` + `autoIncrement`). Com o `scripts/build-android.sh` você sobe o `versionCode` na mão.

**App Store (iOS)**

1. Apple Developer Program (US$ 99/ano) e um app criado no App Store Connect com o bundle id.
2. `eas submit --platform ios --profile production --latest` (ele pergunta as credenciais; **não** as coloque no `eas.json`).
3. **App Privacy**: coletados e ligados à conta, para funcionamento do app: nome e e-mail; conteúdo do usuário (lembretes); **localização precisa** (as coordenadas salvas nos lembretes vão para o servidor). Sem rastreamento e sem publicidade.
4. **Notas para a revisão**: crie uma conta de teste no backend de produção e informe e-mail/senha. Explique: "lembretes por local avisam quando o app está aberto e a pessoa entra no raio; a localização é usada só em uso (nunca em segundo plano)".
   A exclusão de conta existe no app (Configurações), como a guideline 5.1.1(v) exige.
5. Screenshots de iPhone nos tamanhos que o App Store Connect pedir na hora.

**Google Play (Android)**

1. Conta de desenvolvedor Google Play (taxa única, US$ 25) e um app criado no Play Console.
2. **O primeiro envio é manual**: baixe o `.aab` do EAS e suba pelo Play Console. Depois disso, `eas submit --platform android --profile production --latest` funciona (precisa da chave de serviço do Google; não a commite).
3. **Segurança dos dados**: coleta nome, e-mail, conteúdo do usuário e localização (coordenadas salvas); criptografado em trânsito; o usuário pode pedir exclusão (no app **e** pela URL `/excluir-conta`).
4. Confira no Play Console as regras atuais para contas novas (hoje há exigência de teste fechado com testadores antes de liberar produção).
5. Permissões finais: localização, notificações e **alarmes exatos** (`SCHEDULE_EXACT_ALARM` e `USE_EXACT_ALARM`). `SYSTEM_ALERT_WINDOW` e armazenamento foram removidos de propósito.
   **Atenção:** o Google Play restringe `USE_EXACT_ALARM` a apps cujo núcleo é alarme/timer/calendário e pede uma declaração no Play Console. Um app de lembretes pode se enquadrar, mas se a declaração for negada, remova
   `USE_EXACT_ALARM` do `app.json` (o `SCHEDULE_EXACT_ALARM` fica) e o app passa a pedir ao usuário, nas configurações do Android ("Alarmes e lembretes"), que libere os alarmes exatos.
   Fora da Play Store (APK direto) não há restrição.

## 10. Textos da ficha (rascunho em PT-BR)

Dentro dos limites das lojas (conferido): Apple subtítulo 26/30, palavras-chave 93/100; Google título 20/30, descrição curta 71/80.

- **Nome**: LembreiAi · **Subtítulo (Apple)**: Lembretes por hora e lugar · **Título (Google)**: LembreiAi: lembretes
- **Descrição curta (Google)**: Lembretes que avisam na hora certa ou quando você chega ao lugar certo.
- **Palavras-chave (Apple)**: lembrete,lembretes,tarefas,alarme,localização,geofence,lugar,horário,agenda,notificação,aviso
- **Descrição**:
  LembreiAi avisa você na hora certa e no lugar certo. Crie lembretes por horário (com repetição diária, semanal, mensal ou nos dias úteis) ou por lugar:
  escolha um local, defina o raio e receba o aviso quando chegar perto.
  • Lembretes por horário, com repetição
  • Lembretes por local, com mapa e raio de aviso
  • Categorias e ícones automáticos pela descrição
  • Pause e reative com um toque
  • Sua conta e seus dados podem ser excluídos a qualquer momento, dentro do app
  Aviso por local funciona com o app aberto.
- **Categoria**: Produtividade · **Classificação**: para todos (sem conteúdo sensível; sem compras)

## 11. Pré-voo (marque antes de divulgar)

- [ ] Acesso à VPS concedido (seção 3) e backend no ar em HTTPS: `https://SEU-HOST/auth/v1/health` responde `GoTrue`
- [ ] SMTP configurado (ou você decidiu usar só o `reset-password.sh`) (seção 4)
- [ ] APK de produção gerado com a URL/chave finais e **backup do keystore feito** (seção 5)
- [ ] Web e APK publicados; `/privacidade` e `/excluir-conta` abrem; decidiu o e-mail de contato (`EXPO_PUBLIC_CONTACT_EMAIL`)
- [ ] Texto da política revisado por você (e por advogado, se possível)
- [ ] APK instalado em um Android **real**: cadastro, lembrete por horário (chega o aviso na hora?), lembrete por local, mapa, recuperação de senha, exclusão de conta
- [ ] Backup diário (`deploy/scripts/backup.sh` no cron da VPS) e uma cópia dos backups **e do `.env`** fora da VPS. A política de privacidade promete que os backups somem em até 14 dias: apague as cópias de fora no mesmo prazo
- [ ] Lojas: só se decidir pagar (seções 7 a 9); conta de teste criada para os revisores

## 12. Limitações conhecidas (não são bugs novos; decida se aceita)

- **Aviso por local só com o app aberto** (mesma limitação documentada em `../lembreiAI/GEOFENCING.md`); com o app fechado não há geofencing. Background exigiria
  localização em segundo plano (permissão e revisão bem mais duras nas duas lojas).
- **Android, fabricantes**: alguns (Xiaomi, Samsung, Huawei) matam apps em segundo plano e podem atrasar/perder avisos; a pessoa precisa tirar o app da otimização de bateria. Só foi testado em emulador.
- **iOS** aceita no máximo 64 notificações agendadas por app; lembretes repetitivos usam poucos gatilhos, mas muitos lembretes únicos futuros podem passar disso.
- Repetição cuja data de início ainda não chegou agenda só a 1ª ocorrência até o app abrir de novo depois dessa data.
- Mapa Leaflet com tiles do OpenStreetMap (web e Android sem chave do Google): política de uso justo; com muito tráfego, trocar por um serviço com contrato.
- Notificações não existem na web (logo, nem no iPhone pelo caminho gratuito).
- Sem SMTP, "Esqueci minha senha" não envia e-mail (seção 4).
