#!/usr/bin/env bash
# Publica o site (deploy/site: export web do Expo + lembreiai.apk) no volume `site-data` do stack, por SSH.
#   scripts/publish-site.sh usuario@host [nome-do-volume]
# Manda um tar por SSH para um contêiner descartável (alpine) que descompacta dentro do volume: sem rsync e sem pasta temporária na VPS.
# Sem o 2º argumento, usa o único volume que termina em `site-data`; se houver mais de um (ou nenhum), o script para e lista.
# Variáveis: SSH (padrão "ssh"; ex.: SSH="ssh -i ~/.ssh/lembreiai_vps").
set -euo pipefail
cd "$(dirname "$0")/.."

alvo="${1:?uso: scripts/publish-site.sh usuario@host [nome-do-volume]}"
ssh_cmd="${SSH:-ssh}"

[ -f site/index.html ] || { echo "site/index.html não existe: gere o export web antes (README, 'Publicar o site e o APK')."; exit 1; }
[ -f site/lembreiai.apk ] || echo "aviso: site/lembreiai.apk não existe; o link de download do Android vai dar 404."

volume="${2:-}"
if [ -z "$volume" ]; then
  candidatos="$($ssh_cmd "$alvo" "docker volume ls -q" | grep -E 'site-data$' || true)"
  [ "$(printf '%s\n' "$candidatos" | grep -c .)" = "1" ] || { echo "não achei um único volume *site-data; passe o nome como 2º argumento. Achei:"; echo "${candidatos:-(nenhum)}"; exit 1; }
  volume="$candidatos"
fi
[[ "$volume" =~ ^[A-Za-z0-9_.-]+$ ]] || { echo "nome de volume estranho: $volume"; exit 1; }

echo "enviando site/ ($(du -sh site | cut -f1)) para o volume $volume em $alvo ..."
COPYFILE_DISABLE=1 tar czf - -C site . \
  | $ssh_cmd "$alvo" "docker run --rm -i -v $volume:/dst alpine sh -c 'find /dst -mindepth 1 -delete && tar xzf - -C /dst && chmod -R a+rX /dst && ls /dst | wc -l'" \
  | sed 's/^/arquivos e pastas na raiz do site: /'
