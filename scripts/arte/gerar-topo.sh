#!/usr/bin/env bash
# Gera as camadas de curvas de nível (assets/art/topo-lista.webp, topo-contas.webp e horizonte-contas.webp) a partir de
# assets/art/topo-header.svg, com o mesmo recorte e a mesma máscara do CSS do app web (modelos HTML ao lado deste arquivo).
# Fundo transparente.
#
#   scripts/arte/gerar-topo.sh                     # gera as três
#   scripts/arte/gerar-topo.sh horizonte-contas    # só a(s) pedida(s), para não regravar as outras
#
# Precisa do Google Chrome (`CHROME=/caminho/do/chrome` se não estiver em /Applications) e do Pillow (`pip install pillow`).
# Ferramenta de desenvolvimento: não entra no bundle. Rode de novo se o SVG ou os modelos mudarem.
set -euo pipefail

RAIZ="$(cd "$(dirname "$0")/../.." && pwd)"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
[ -x "$CHROME" ] || { echo "Chrome não encontrado em: $CHROME (use CHROME=...)"; exit 1; }
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# nome, largura e altura da imagem em pixels (a 2 px por du) e, se a arte só ocupa uma faixa, o topo e a altura do recorte
gerar() {
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --default-background-color=00000000 \
    --window-size="$2,$3" --screenshot="$TMP/$1.png" "file://$RAIZ/scripts/arte/$1.html" >/dev/null 2>&1
  python3 - "$TMP/$1.png" "$RAIZ/assets/art/$1.webp" "$2" "$3" "${4:-0}" "${5:-$3}" <<'PY'
import os, sys
from PIL import Image
origem, destino, largura, altura = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
corte_topo, corte_altura = int(sys.argv[5]), int(sys.argv[6])
im = Image.open(origem).convert("RGBA")
assert im.size == (largura, altura), f"tamanho inesperado: {im.size}"
im = im.crop((0, corte_topo, largura, corte_topo + corte_altura))
im.save(destino, "WEBP", quality=82, method=6)
print(f"{os.path.basename(destino)}: {im.size[0]}×{im.size[1]}, {os.path.getsize(destino):,} bytes".replace(",", "."))
PY
}

SELECAO=" $* "
quer() { [ "$SELECAO" = "  " ] || [[ "$SELECAO" == *" $1 "* ]]; }

if quer topo-lista; then gerar topo-lista 1702 690; fi
if quer topo-contas; then gerar topo-contas 1702 1040; fi
# o traço só existe entre 28% e 72% da altura de 1000 du (é simétrico): recorta essa faixa, de 560 a 1440 px, e não guarda o transparente
if quer horizonte-contas; then gerar horizonte-contas 1702 2000 560 880; fi
