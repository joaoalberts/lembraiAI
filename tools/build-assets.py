"""
Gera os assets raster de public/assets/ a partir de ./ref/*.png.

Regra do projeto: a INTERFACE é código. Aqui só saem as partes fotográficas/3D:
  - fundos (folhagem/montanhas desfocadas, pino 3D e ícone 3D ficam embutidos na arte)
  - mapas e miniaturas de mapa
Tudo que é UI (textos, botões, cards, chips, ícones) é REMOVIDO dos fundos por inpainting
(pull-push), para o código redesenhar por cima.

Uso:  python tools/build-assets.py
"""
import math
import numpy as np, cv2
from PIL import Image, ImageDraw

REF, OUT = "ref/", "public/assets/"
W, H = 851, 1848


def load(n):
    return np.array(Image.open(f"{REF}{n}.png").convert("RGB")).astype(np.float32)


# ───────────────────────── máscaras ─────────────────────────
class Mask:
    def __init__(self, size=(W, H)):
        self.im = Image.new("L", size, 0); self.d = ImageDraw.Draw(self.im)
    def rect(self, b):            self.d.rectangle(b, fill=255); return self
    def rrect(self, b, r):        self.d.rounded_rectangle(b, radius=r, fill=255); return self
    def ellipse(self, b):         self.d.ellipse(b, fill=255); return self
    def poly(self, pts):          self.d.polygon(pts, fill=255); return self
    def rot_rrect(self, c, w, h, ang, r):
        """retângulo arredondado rotacionado (para os chips inclinados)"""
        pts = []
        for sx, sy in ((-1,-1),(1,-1),(1,1),(-1,1)):
            x, y = sx*w/2, sy*h/2; a = math.radians(ang)
            pts.append((c[0]+x*math.cos(a)-y*math.sin(a), c[1]+x*math.sin(a)+y*math.cos(a)))
        return self.poly(pts)
    def get(self, dilate=0):
        m = np.array(self.im) > 127
        if dilate:
            k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (dilate*2+1, dilate*2+1))
            m = cv2.dilate(m.astype(np.uint8), k) > 0
        return m


# ───────────────────────── inpainting (pull-push) ─────────────────────────
def pull_push(img, hole):
    """preenche `hole` com interpolação suave a partir dos pixels conhecidos"""
    w = (~hole).astype(np.float32)
    c = img * w[..., None]
    levels = [(c, w)]
    while min(levels[-1][1].shape) > 2:
        c0, w0 = levels[-1]
        h2, w2 = (w0.shape[0] + 1) // 2, (w0.shape[1] + 1) // 2
        levels.append((cv2.resize(c0, (w2, h2), interpolation=cv2.INTER_AREA),
                       cv2.resize(w0, (w2, h2), interpolation=cv2.INTER_AREA)))
    # base: cor normalizada do nível mais grosso
    cb, wb = levels[-1]
    cur = cb / np.maximum(wb, 1e-6)[..., None]
    if (wb < 1e-6).any():  # tudo desconhecido (não deve ocorrer)
        cur[wb < 1e-6] = img[~hole].mean(0)
    for c0, w0 in reversed(levels[:-1]):
        up = cv2.resize(cur, (w0.shape[1], w0.shape[0]), interpolation=cv2.INTER_LINEAR)
        cur = c0 + (1 - w0)[..., None] * up
    return cur


def erase(img, hole, blur=7, grain=None, feather=2):
    """remove `hole` do `img`: preenchimento suave + grão equivalente ao da vizinhança"""
    filled = pull_push(img, hole)
    filled = cv2.GaussianBlur(filled, (0, 0), blur)
    if grain is None:  # estima o grão em uma faixa ao redor do buraco
        ring = cv2.dilate(hole.astype(np.uint8), np.ones((41, 41), np.uint8)) > 0
        ring &= ~hole
        hp = img - cv2.GaussianBlur(img, (0, 0), 2)
        grain = float(hp[ring].std()) if ring.any() else 0.8
    rng = np.random.default_rng(7)
    filled = filled + rng.normal(0, grain, filled.shape).astype(np.float32)
    a = cv2.GaussianBlur(hole.astype(np.float32), (0, 0), feather)[..., None]
    a = np.where(hole[..., None], 1.0, a)
    return img * (1 - a) + filled * a


def save(arr, name, q=92):
    Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).save(OUT + name, quality=q, optimize=True)
    print("ok", name)



def dilate(m, r):
    if not r: return m
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (r * 2 + 1, r * 2 + 1))
    return cv2.dilate(m.astype(np.uint8), k) > 0


def text_mask(img, rect, mode, k, thr, dil=3, close=0):
    """mancha (blob) que cobre os GLIFOS de `rect`, incluindo halo/sombra.
    mode='light': letras claras sobre fundo escuro · 'dark': letras escuras sobre fundo claro.
    k = elemento estruturante (> espessura do traço) · thr = limiar (baixo = pega o anti-aliasing)
    dil = dilatação · close = fechamento morfológico que une letras e linhas."""
    g = cv2.cvtColor(np.clip(img, 0, 255).astype(np.uint8), cv2.COLOR_RGB2GRAY).astype(np.float32)
    ker = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k))
    if mode == "light": diff = g - cv2.morphologyEx(g, cv2.MORPH_OPEN, ker)
    else:               diff = cv2.morphologyEx(g, cv2.MORPH_CLOSE, ker) - g
    m = diff > thr
    box = np.zeros_like(m); x0, y0, x1, y1 = rect; box[y0:y1, x0:x1] = True
    m = dilate(m & box, dil)
    if close:
        ck = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (close, close))
        m = cv2.morphologyEx(m.astype(np.uint8), cv2.MORPH_CLOSE, ck) > 0
    return m


def two_pass(img, text_m, shape_m, blur_text=3.5, blur_shape=8, feather_shape=3):
    """passada única sobre a união (texto + formas): evita que o fill de um herde cor do outro
    (ex.: o brilho laranja do CTA contaminando as manchas dos textos vizinhos)"""
    return erase(img, text_m | shape_m, blur=(blur_text + blur_shape) / 2, feather=feather_shape)


# ───────────────────────── 1. Onboarding ─────────────────────────
def onboarding():
    img = load(1)
    t = np.zeros((H, W), bool)
    t |= text_mask(img, (130, 105, 335, 172), "light", 21, 8, 9, 15)     # wordmark + tagline
    t |= text_mask(img, (195, 745, 680, 985), "light", 61, 8, 16, 25)     # Lembre de viver.
    t |= text_mask(img, (120, 1000, 730, 1085), "light", 11, 8, 10, 21)   # subtítulo
    for r in ((85, 1250, 225, 1385), (335, 1250, 520, 1360), (605, 1250, 800, 1390)):
        t |= text_mask(img, r, "light", 11, 8, 10, 19)                    # títulos/descrições das features
    t |= text_mask(img, (260, 1735, 600, 1768), "light", 11, 8, 9, 15)   # cadeado + privacidade
    m = Mask()
    m.rrect((45, 103, 116, 175), 28)                                  # tile do app
    m.rrect((651, 103, 804, 178), 40)                                 # Pular
    m.rot_rrect((204, 321), 215, 73, -9, 36)                          # chip "Na hora certa"
    m.rot_rrect((674, 477), 224, 68, 10, 34)                          # chip "No lugar certo"
    for x0, x1 in ((104, 200), (378, 474), (653, 750)):
        m.rrect((x0, 1135, x1, 1231), 42)                             # caixas de ícone das features
    m.rect((365, 1626, 487, 1642))                                    # pager
    m.rect((258, 1738, 296, 1768))                                    # cadeado (corpo sólido)
    m.rect((35, 1420, 816, 1620))                                     # CTA + glow
    save(two_pass(img, t, m.get(dilate=4), blur_shape=9, feather_shape=8), "bg-onboarding.jpg")


# ───────────────────────── 2. Formulário (topo) ─────────────────────────
def form_top():
    img = load(2)
    t = np.zeros((H, W), bool)
    t |= text_mask(img, (292, 110, 560, 164), "dark", 41, 4, 20, 33)      # título
    t |= text_mask(img, (248, 168, 602, 202), "dark", 13, 5, 9, 17)      # subtítulo
    m = Mask()
    m.ellipse((27, 108, 103, 186))                                    # botão voltar (+ sombra)
    m.rrect((29, 226, 821, 448), 34)                                  # card Descrição
    m.rect((29, 466, 821, 591))                                       # linha de opções
    out = two_pass(img, t, dilate(m.get(), 3) if False else m.get(dilate=5), blur_shape=8)
    # o topo é uma névoa que vai sumindo no creme da página: corta e funde no fim
    bg_h = 560
    crop = out[:bg_h].copy(); cream = np.array([0xF6, 0xF2, 0xED], np.float32)
    ramp = np.clip((np.arange(bg_h) - (bg_h - 90)) / 90.0, 0, 1)[:, None, None]
    save(crop * (1 - ramp) + cream * ramp, "bg-form-top.jpg")


# ───────────────────────── 3. Lista (header, versão B = 5.png) ─────────────────────────
def list_header():
    img = load(5)
    t = np.zeros((H, W), bool)
    t |= text_mask(img, (126, 86, 332, 152), "light", 21, 7, 9, 15)      # wordmark + tagline
    t |= text_mask(img, (34, 178, 452, 246), "light", 45, 7, 12, 21)      # Meus lembretes
    t |= text_mask(img, (34, 246, 272, 284), "light", 13, 7, 9, 15)      # 5 lembretes ativos
    m = Mask()
    m.rrect((36, 80, 113, 158), 28)                                   # tile
    m.ellipse((610, 75, 698, 163)); m.ellipse((728, 78, 816, 165))    # busca / mais
    m.rrect((558, 186, 816, 266), 40)                                 # botão Novo lembrete
    m.rrect((-2, 296, W + 2, 600), 38)                                # sheet (vira CSS)
    out = two_pass(img, t, m.get(dilate=4), blur_shape=8)
    save(out[:345], "bg-list-header.jpg")


# ───────────────────────── 4. Sucesso ─────────────────────────
def success():
    img = load(4)
    t = np.zeros((H, W), bool)
    t |= text_mask(img, (185, 322, 675, 465), "dark", 61, 4, 24, 41)      # título
    t |= text_mask(img, (205, 468, 650, 555), "dark", 13, 4, 16, 33)      # subtítulo
    t |= text_mask(img, (305, 1660, 545, 1698), "dark", 13, 5, 9, 15)    # link
    m = Mask()
    m.ellipse((739, 54, 820, 136))                                    # fechar
    m.rrect((33, 584, 817, 1128), 38)                                 # card resumo
    for x0, x1 in ((57, 212), (250, 406), (444, 601), (638, 795)):
        m.rrect((x0, 1157, x1, 1282), 32)                             # ações
    m.rrect((33, 1315, 816, 1473), 38)                                # dica
    m.rrect((38, 1513, 811, 1623), 62)                                # CTA
    save(two_pass(img, t, m.get(dilate=3), blur_shape=10), "bg-success.jpg")


# ───────────────────────── 5. Mapas e miniaturas ─────────────────────────
def edge(im, pts):
    g = np.array(Image.fromarray(im.astype(np.uint8)).convert("L")).astype(int)
    best, at = -1, pts[0]
    for a, b in zip(pts[:-1], pts[1:]):
        d = abs(g[b[1], b[0]] - g[a[1], a[0]])
        if d > best: best, at = d, a
    return at


def refine(im, box, w=8):
    x0, y0, x1, y1 = box; cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    L = edge(im, [(x, cy) for x in range(x0 - w, x0 + w)])[0]
    R = edge(im, [(x, cy) for x in range(x1 - w, x1 + w)])[0]
    T = edge(im, [(cx, y) for y in range(y0 - w, y0 + w)])[1]
    B = edge(im, [(cx, y) for y in range(y1 - w, y1 + w)])[1]
    return L, T, R, B


def thumb(n, box, name, inset=2):
    im = load(n); L, T, R, B = refine(im, box)
    print(f"  {name}: {L},{T},{R},{B}  ({R-L}x{B-T})")
    save(im[T+inset:B-inset, L+inset:R-inset], name, q=94)


def form_map():
    img = load(2); x0, y0, x1, y1 = 65, 1108, 793, 1382
    crop = img[y0:y1, x0:x1].copy()
    hh, ww = crop.shape[:2]
    yy, xx = np.mgrid[0:hh, 0:ww]
    cx, cy = 430 - x0, 1246 - y0
    r = np.hypot(xx - cx, yy - cy)
    a, col = 0.21, np.array([45, 170, 120], np.float32)     # halo: rgba(45,170,120,.21)
    inside = r < 119
    crop[inside] = np.clip((crop[inside] - col * a) / (1 - a), 0, 255)   # desfaz o halo
    m = Mask((ww, hh))
    m.ellipse((cx - 126, cy - 126, cx + 126, cy + 126))
    ring = np.array(m.im) > 127
    ring &= ~(r < 116)                                       # só o aro
    # pino + botões flutuantes + chip: removidos (viram UI)
    mm = Mask((ww, hh))
    mm.poly([(403-x0, 1200-y0), (459-x0, 1200-y0), (459-x0, 1244-y0), (431-x0, 1272-y0), (403-x0, 1244-y0)])
    mm.rrect((720-x0, 1126-y0, 781-x0, 1189-y0), 14)         # navegação
    mm.rrect((720-x0, 1205-y0, 781-x0, 1330-y0), 14)         # +/-
    mm.rrect((75-x0, 1308-y0, 376-x0, 1361-y0), 26)          # "Usar minha localização"
    hole = ring | (np.array(mm.im) > 127)
    hole = cv2.dilate(hole.astype(np.uint8), np.ones((5, 5), np.uint8))
    u8 = np.clip(crop, 0, 255).astype(np.uint8)
    res = cv2.inpaint(u8, hole, 3, cv2.INPAINT_TELEA)
    save(res.astype(np.float32), "map-form.jpg", q=94)


if __name__ == "__main__":
    onboarding(); form_top(); list_header(); success(); form_map()
    thumb(5, (522, 501, 658, 639), "thumb-mercado.jpg")
    thumb(5, (522, 700, 658, 838), "thumb-academia.jpg")
    thumb(4, (620, 866, 783, 985), "thumb-sucesso.jpg")
