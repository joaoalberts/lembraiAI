#!/usr/bin/env bash
# Preflight SOMENTE LEITURA da VPS: mostra o que precisamos saber antes de implantar.
# Não altera nada, não imprime variáveis de ambiente nem o conteúdo de arquivos (só nomes e versões).
#   ssh -i ~/.ssh/lembreiai_vps root@SEU-HOST 'bash -s' < deploy/scripts/vps-preflight.sh
set -u
t() { printf '\n== %s\n' "$1"; }
tem() { command -v "$1" >/dev/null 2>&1; }

t "Sistema"
if [ -r /etc/os-release ]; then . /etc/os-release; echo "$PRETTY_NAME"; fi
uname -sr; echo "CPUs: $(nproc 2>/dev/null || echo '?')"

t "Memória (MB) e disco"
if tem free; then free -m | sed -n '1,3p'; else echo "free: indisponível"; fi
df -h / | tail -1

t "Docker e Compose (o compose do Easypanel exige Compose >= 2.23.1)"
if tem docker; then
  docker version --format 'docker {{.Server.Version}} (API {{.Server.APIVersion}})' 2>&1 | head -2
  docker compose version 2>&1 | head -1
  docker info --format 'swarm: {{.Swarm.LocalNodeState}}' 2>&1 | head -1
else echo "docker: NÃO instalado"; fi

t "Contêineres em execução (nome, imagem, portas; sem variáveis de ambiente)"
if tem docker; then docker ps --format '{{.Names}}\t{{.Image}}\t{{.Ports}}' 2>&1 | head -60; fi

t "Serviços do Swarm (se houver)"
if tem docker; then docker service ls --format '{{.Name}}\t{{.Image}}\t{{.Ports}}' 2>/dev/null | head -40 || true; fi

t "Redes e volumes do Docker (só nomes)"
if tem docker; then docker network ls --format 'rede {{.Name}} ({{.Driver}}, {{.Scope}})' 2>&1; docker volume ls -q 2>/dev/null | sed 's/^/volume /' | head -40; fi

t "Portas em escuta (22, 80, 443, 3000, 8000, 8081)"
{ ss -ltn 2>/dev/null || netstat -ltn 2>/dev/null; } | grep -E ':(22|80|443|3000|8000|8081)[[:space:]]' | awk '{print $1, $4}' | sort -u | head -20

t "Easypanel"
if [ -d /etc/easypanel ]; then echo "/etc/easypanel existe; conteúdo (só nomes):"; ls -1 /etc/easypanel | head -20; else echo "/etc/easypanel: não existe"; fi

t "Traefik: como descobre serviços (argumentos de linha de comando)"
if tem docker; then
  docker service inspect traefik --format '{{json .Spec.TaskTemplate.ContainerSpec.Args}}' 2>/dev/null \
    || docker inspect traefik --format '{{json .Args}}' 2>/dev/null || echo "sem serviço ou contêiner chamado 'traefik'"
fi

t "Firewall e cron (só resumo)"
if tem ufw; then ufw status 2>&1 | head -12; else echo "ufw: não instalado"; fi
echo "crontab do usuário: $(crontab -l 2>/dev/null | grep -vc '^#') linha(s) ativa(s)"

printf '\n== fim\npreflight concluído; nada foi alterado.\n'
