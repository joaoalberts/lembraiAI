#!/usr/bin/env python3
"""
Mede cores nas capturas de docs/referencias e compara com os tokens do Design System.

  python3 scripts/amostrar-referencias.py            tabela em Markdown (a de docs/referencias/MEDICOES.md)

Por que existe: as capturas trazem o perfil de cor da tela ("Display"), não o sRGB. O laranja `#FE532A` aparece cru como
`#EB603C`. Sem converter, a comparação com os tokens engana. Aqui cada imagem é convertida para sRGB antes de amostrar.

Cada ponto é a média de 5×5 pixels (ou 1 pixel, quando cai numa borda fina) em coordenadas da captura (2×: divida por 2
para CSS px). Compara com a paleta do Expo (src/design/tokens.ts) e com os tokens do app web (o que o original usa).
Requer Pillow (`pip install pillow`). É ferramenta de desenvolvimento: não entra no bundle do app.
"""
import io
import json
import os
import re
import subprocess
import sys

try:
    from PIL import Image, ImageCms
except ImportError:
    sys.exit("Falta o Pillow: pip install pillow")

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
REFS = os.path.join(RAIZ, "docs", "referencias")
TOKENS_EXPO = os.path.join(RAIZ, "src", "design", "tokens.ts")
TOKENS_WEB = os.path.join(RAIZ, "..", "lembreiAI", "src", "styles", "tokens.css")
LIMITE = 1.5  # ΔE (CIE76) até aqui conta como "bate"

# Valores do CSS do app web que não estão em tokens.css (Toggle.module.css, ConfirmSheet.module.css, Button.module.css)
EXTRAS_WEB = {
    "toggle-cartao-ligado": "#30AB7B", "toggle-formulario-ligado": "#256855", "botao-perigo": "#D43A2A",
    "botao-perigo-hover": "#C63424", "polegar-do-toggle": "#FBFBFA", "texto-da-acao-translucida": "#1A2C23",
}


def hex_para_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def paleta_expo():
    """Todas as cores `#RRGGBB` de `palette` e `colors` (papéis e categorias), lidas do próprio tokens.ts pelo Node."""
    js = (
        f"const m = await import({TOKENS_EXPO!r}.replace(/^/, 'file://')); const out = {{}};"
        "const achatar = (o, p) => { for (const [k, v] of Object.entries(o)) {"
        " if (v && typeof v === 'object') achatar(v, p + '.' + k);"
        " else if (typeof v === 'string' && /^#[0-9A-Fa-f]{6}$/.test(v)) out[p + '.' + k] = v; } };"
        "achatar(m.palette, 'palette'); achatar(m.colors, 'colors'); console.log(JSON.stringify(out));"
    )
    saida = subprocess.run(["node", "--input-type=module", "-e", js], capture_output=True, text=True, cwd=RAIZ)
    if saida.returncode != 0:
        sys.exit(f"Não consegui ler {TOKENS_EXPO} com o Node:\n{saida.stderr}")
    return {nome: hex_para_rgb(h) for nome, h in json.loads(saida.stdout).items()}


def paleta_web():
    if not os.path.exists(TOKENS_WEB):
        return {}
    css = open(TOKENS_WEB, encoding="utf-8").read()
    cores = {f"--{n}": hex_para_rgb(h) for n, h in re.findall(r"--([\w-]+):\s*(#[0-9A-Fa-f]{6})", css)}
    cores.update({f"css:{n}": hex_para_rgb(h) for n, h in EXTRAS_WEB.items()})
    return cores


SRGB = ImageCms.createProfile("sRGB")
_cache = {}


def em_srgb(nome):
    if nome not in _cache:
        im = Image.open(os.path.join(REFS, nome))
        rgb = im.convert("RGB")
        icc = im.info.get("icc_profile")
        if icc:
            origem = ImageCms.ImageCmsProfile(io.BytesIO(icc))
            rgb = ImageCms.profileToProfile(rgb, origem, SRGB, renderingIntent=ImageCms.Intent.RELATIVE_COLORIMETRIC, outputMode="RGB")
        _cache[nome] = rgb
    return _cache[nome]


def media(im, x, y, r):
    pts = [im.getpixel((min(max(x + dx, 0), im.width - 1), min(max(y + dy, 0), im.height - 1))) for dx in range(-r, r + 1) for dy in range(-r, r + 1)]
    return tuple(round(sum(p[k] for p in pts) / len(pts)) for k in range(3))


def lab(c):
    def lin(v):
        v /= 255
        return ((v + 0.055) / 1.055) ** 2.4 if v > 0.04045 else v / 12.92

    def f(t):
        return t ** (1 / 3) if t > 0.008856 else 7.787 * t + 16 / 116

    r, g, b = (lin(v) for v in c)
    x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047
    y = 0.2126 * r + 0.7152 * g + 0.0722 * b
    z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883
    return (116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z)))


def delta_e(a, b):
    return sum((p - q) ** 2 for p, q in zip(lab(a), lab(b))) ** 0.5


def mais_proximo(cor, paleta):
    if not paleta:
        return "-", None, 99.0
    nome, ref = min(paleta.items(), key=lambda kv: delta_e(cor, kv[1]))
    return nome, ref, delta_e(cor, ref)


def hexa(c):
    return "#%02X%02X%02X" % c


# (captura, x, y, raio, o que é) — coordenadas na captura (2×)
PONTOS = [
    ("04-novo-lembrete-por-data-e-horario.png", 430, 1240, 2, "Fundo da página"),
    ("04-novo-lembrete-por-data-e-horario.png", 700, 430, 2, "Superfície do cartão"),
    ("04-novo-lembrete-por-data-e-horario.png", 200, 1396, 2, "Botão primário (laranja)"),
    ("04-novo-lembrete-por-data-e-horario.png", 60, 1590, 2, "Barra de abas"),
    ("04-novo-lembrete-por-data-e-horario.png", 106, 277, 2, "Círculo do ícone (menta)"),
    ("04-novo-lembrete-por-data-e-horario.png", 780, 982, 2, "Trilho do interruptor desligado"),
    ("04-novo-lembrete-por-data-e-horario.png", 5, 5, 2, "Cabeçalho em degradê: canto superior esquerdo"),
    ("07-lista-meus-lembretes.png", 48, 95, 1, "Tile da marca (topo)"),
    ("07-lista-meus-lembretes.png", 580, 228, 2, "Botão Novo lembrete"),
    ("07-lista-meus-lembretes.png", 60, 342, 2, "Chip Todos (selecionado)"),
    ("07-lista-meus-lembretes.png", 300, 345, 2, "Chip não selecionado"),
    ("07-lista-meus-lembretes.png", 397, 335, 2, "Folha da lista (fundo)"),
    ("07-lista-meus-lembretes.png", 620, 560, 2, "Superfície do cartão de lembrete"),
    ("07-lista-meus-lembretes.png", 41, 560, 0, "Faixa lateral do cartão (categoria verde)"),
    ("07-lista-meus-lembretes.png", 705, 574, 2, "Interruptor ligado (cartão)"),
    ("07-lista-meus-lembretes.png", 700, 1380, 2, "Cartão Dica para você"),
    ("07-lista-meus-lembretes.png", 15, 240, 2, "Cabeçalho verde (parte baixa)"),
    ("08-configuracoes.png", 430, 345, 2, "Folha de Configurações (fundo)"),
    ("08-configuracoes.png", 700, 1090, 2, "Cartão de Configurações"),
    ("08-configuracoes.png", 700, 725, 2, "Aviso de erro (fundo)"),
    ("08-configuracoes.png", 730, 612, 2, "Interruptor ligado (formulário e configurações)"),
    ("09-sucesso-lembrete-criado.png", 100, 1585, 2, "Botão escuro Ver todos os lembretes"),
    ("09-sucesso-lembrete-criado.png", 220, 1230, 2, "Botão de ação translúcido (Editar)"),
    ("10-confirmar-exclusao.png", 100, 1400, 2, "Botão Excluir lembrete (perigo)"),
    ("10-confirmar-exclusao.png", 100, 1530, 2, "Botão Cancelar"),
    ("02-entrar.png", 400, 265, 2, "Cartão de entrada"),
    ("02-entrar.png", 200, 795, 2, "Botão Entrar"),
    ("02-entrar.png", 90, 693, 1, "Caixa Lembrar-me marcada"),
    ("02-entrar.png", 20, 700, 2, "Fundo do login (verde escuro)"),
]


def main():
    expo, web = paleta_expo(), paleta_web()
    linhas, contagem = [], {"bate": 0, "falta no Expo": 0, "sem token": 0}
    for arq, x, y, r, rotulo in PONTOS:
        cor = media(em_srgb(arq), x, y, r)
        n_expo, c_expo, d_expo = mais_proximo(cor, expo)
        n_web, c_web, d_web = mais_proximo(cor, web)
        if d_expo <= LIMITE:
            veredito = "bate"
        elif d_web <= LIMITE:
            veredito = "falta no Expo"
        else:
            veredito = "sem token"
        contagem[veredito] += 1
        linhas.append(f"| {rotulo} | `{arq.split('-')[0]}` | `{hexa(cor)}` | `{n_expo}` `{hexa(c_expo)}` ({d_expo:.1f}) | "
                      f"{('`' + n_web + '` `' + hexa(c_web) + '` (' + format(d_web, '.1f') + ')') if c_web else '-'} | {veredito} |")
    print("| Ponto | Captura | sRGB medido | Token do Expo mais próximo (ΔE) | Token do app web mais próximo (ΔE) | Veredito |")
    print("|---|---|---|---|---|---|")
    print("\n".join(linhas))
    print(f"\n<!-- {len(PONTOS)} pontos: {contagem['bate']} batem (ΔE ≤ {LIMITE}), {contagem['falta no Expo']} existem só no app web, {contagem['sem token']} sem token -->")


if __name__ == "__main__":
    main()
