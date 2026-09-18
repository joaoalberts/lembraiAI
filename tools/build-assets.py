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


def smooth_erase(img, hole, s=6, iters=2500, feather=3, grain=0.9):
    """Apaga `hole` de regiões de névoa/desfoque. Preenche por difusão (equação de Laplace: cada pixel do buraco = média
    dos vizinhos) num quadro reduzido, então a transição casa com a borda. O pull-push usa a média global e deixa um
    'disco' mais claro que o entorno quando o buraco é grande."""
    h, w = hole.shape
    small = cv2.resize(img, (w // s, h // s), interpolation=cv2.INTER_AREA)
    hs = cv2.resize(hole.astype(np.uint8), (w // s, h // s), interpolation=cv2.INTER_AREA) > 0     # qualquer cobertura conta
    hs = cv2.dilate(hs.astype(np.uint8), np.ones((3, 3), np.uint8)) > 0
    fill = pull_push(small, hs)
    for _ in range(iters):
        fill = np.where(hs[..., None], cv2.blur(fill, (3, 3)), small)       # buraco = média dos vizinhos; fora = dado original
    filled = cv2.resize(fill, (w, h), interpolation=cv2.INTER_CUBIC)
    filled = filled + np.random.default_rng(7).normal(0, grain, filled.shape).astype(np.float32)
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


def two_pass(img, text_m, shape_m, blur_text=3.5, blur_shape=8, feather_shape=3, grain=None):
    """passada única sobre a união (texto + formas): evita que o fill de um herde cor do outro
    (ex.: o brilho laranja do CTA contaminando as manchas dos textos vizinhos).
    grain=None estima o grão pelo anel ao redor; passe um valor fixo quando o anel pega bordas de glifos."""
    return erase(img, text_m | shape_m, blur=(blur_text + blur_shape) / 2, feather=feather_shape, grain=grain)


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
    # chips flutuantes: o balão de vidro (que passa POR TRÁS do pino 3D) fica na arte; só o ícone e o
    # texto saem (viram código). Apagar o balão inteiro deixava filetes do contorno e borrava o pino.
    g = cv2.cvtColor(img.astype(np.uint8), cv2.COLOR_RGB2GRAY)
    xx = np.arange(W)[None, :]
    chips = np.zeros((H, W), bool)
    for c, ang, x_max in (((207, 326), -9, 294), ((674, 473), 10, W)):   # x_max: não invade o aro do pino
        inside = Mask().rot_rrect(c, 196, 60, ang, 10).get() & (xx <= x_max)   # miolo do balão, sem a borda
        chips |= dilate((g > 110) & inside, 7)
    img = erase(img, chips, blur=4, grain=0.6)   # passada própria; grão fixo: o miolo do balão é liso (a estimativa pelo anel pega as bordas dos glifos)
    m = Mask()
    m.rrect((45, 103, 116, 175), 28)                                  # tile do app
    m.rrect((651, 103, 804, 178), 40)                                 # Pular
    for x0, x1 in ((104, 200), (378, 474), (653, 750)):
        m.rrect((x0, 1135, x1, 1231), 42)                             # caixas de ícone das features
    m.rect((365, 1626, 487, 1642))                                    # pager
    m.rect((258, 1738, 296, 1768))                                    # cadeado (corpo sólido)
    m.rect((35, 1420, 816, 1620))                                     # CTA + glow
    save(two_pass(img, t, m.get(dilate=4), blur_shape=9, feather_shape=8), "bg-onboarding.jpg")


# (o topo do formulário não é mais imagem: virou CSS em NovoLembrete.module.css — .topBg)


# ───────────────────────── 3. Lista (header, versão B = 5.png) ─────────────────────────
def topo_header():
    """Curvas de nível (mapa topográfico) do fundo do cabeçalho da lista: um morro no canto superior direito, atrás dos
    botões de vidro, e ondulações que se espalham para a esquerda. Saída: public/assets/topo-header.svg (851 × 345).
    O resto do fundo (degradês, brilho, grão) é CSS (ListHeaderBg). Não depende de ./ref/: é gerado, e determinístico."""
    Wd, Hd, PAD = 851, 345, 80                       # PAD: o campo se estende além do quadro, senão o contorno "cola" na borda
    yy, xx = np.mgrid[-PAD:Hd + PAD, -PAD:Wd + PAD].astype(np.float32)
    f = np.zeros_like(xx)
    for px, py, sx, sy, a in ((735, 30, 250, 165, 1.0), (500, -10, 190, 120, .55), (845, 250, 160, 130, .5), (60, 330, 210, 120, .4)):
        f += a * np.exp(-(((xx - px) / sx) ** 2 + ((yy - py) / sy) ** 2) / 2)             # morros
    f += .05 * np.sin(xx / 71 + yy / 57) + .04 * np.sin(xx / 39 - yy / 47 + 1.3) + .03 * np.sin(yy / 24 + xx / 93 + .6)   # relevo orgânico
    normal, mestra = [], []
    for i, lv in enumerate(np.arange(0.08, float(f.max()), 0.07)):
        cs, _ = cv2.findContours((f > lv).astype(np.uint8), cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE)
        for c in cs:
            p = c[:, 0, :].astype(np.float32)
            if len(p) < 60: continue
            k = 9                                                                   # média móvel circular: alisa a escada de pixels
            ker = np.ones(k) / k
            sx_ = np.convolve(np.r_[p[-k:, 0], p[:, 0], p[:k, 0]], ker, "same")[k:-k]
            sy_ = np.convolve(np.r_[p[-k:, 1], p[:, 1], p[:k, 1]], ker, "same")[k:-k]
            pts = np.stack([sx_, sy_], 1)[::6] - PAD
            if pts[:, 0].max() < -8 or pts[:, 0].min() > Wd + 8 or pts[:, 1].max() < -8 or pts[:, 1].min() > Hd + 8: continue   # fora do quadro
            d = "M" + "L".join(f"{round(x)} {round(y)}" for x, y in pts) + "Z"      # inteiros: 1 du = 0,5 px no celular, imperceptível
            (mestra if i % 4 == 0 else normal).append(d)                            # a cada 4 curvas, uma "mestra" (mais marcada)
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {Wd} {Hd}" fill="none" stroke="#E4FBF0" stroke-linejoin="round" stroke-linecap="round">'
           f'<path stroke-opacity=".15" stroke-width="1.6" d="{" ".join(normal)}"/>'
           f'<path stroke-opacity=".3" stroke-width="2.2" d="{" ".join(mestra)}"/></svg>')
    with open(OUT + "topo-header.svg", "w") as fh: fh.write(svg)
    print("ok topo-header.svg", f"{len(svg) / 1024:.0f} KB", f"({len(normal)} curvas + {len(mestra)} mestras)")


# ───────────────────────── 4. Sucesso ─────────────────────────
def success():
    img = load(4)
    # 1) topo: o ícone 3D (+ anéis, pontos e brilho) vira código (SuccessHero) e o texto também. O fundo ali é névoa,
    #    então preenche por difusão; a dilatação grande leva junto o halo claro que o texto original tinha em volta.
    #    Um bloco só (ícone + título + subtítulo): máscaras por glifo deixavam lascas do halo entre elas.
    hero = (Mask().ellipse((240, 10, 610, 380)).rrect((180, 296, 680, 562), 60)
            .poly([(246, 250), (604, 250), (680, 306), (180, 306)]).get())       # o polígono fecha o vão entre o arco e o retângulo
    link = text_mask(img, (305, 1660, 545, 1698), "dark", 13, 5, 9, 15)   # "Criar outro lembrete"
    img = smooth_erase(img, hero, feather=12)
    # 2) o resto da UI sobre a foto
    t = link
    m = Mask()
    m.ellipse((739, 54, 820, 136))                                    # fechar
    m.rrect((33, 584, 817, 1128), 38)                                 # card resumo
    for x0, x1 in ((57, 212), (250, 406), (444, 601), (638, 795)):
        m.rrect((x0, 1157, x1, 1282), 32)                             # ações
    m.rrect((33, 1315, 816, 1473), 38)                                # dica
    m.rrect((38, 1513, 811, 1623), 62)                                # CTA
    save(two_pass(img, t, m.get(dilate=3), blur_shape=10, grain=0.9), "bg-success.jpg")


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
    onboarding(); topo_header(); success(); form_map()
    thumb(5, (522, 501, 658, 639), "thumb-mercado.jpg")
    thumb(5, (522, 700, 658, 838), "thumb-academia.jpg")
    thumb(4, (620, 866, 783, 985), "thumb-sucesso.jpg")
