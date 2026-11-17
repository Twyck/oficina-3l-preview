"""Gera as versões responsivas (WebP) de assets-src/ em public/img/ e a imagem Open Graph.

Uso: python3 scripts/build-images.py
Fonte: fotos do proprietário na ficha "Oficina 3L" do Google Maps e capas de reels do Instagram público @oficina.3l.
Nenhuma foto de banco de imagens ou gerada.
"""
import json
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw, ImageFont, ImageEnhance

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets-src"
OUT = ROOT / "public" / "img"
OUT.mkdir(parents=True, exist_ok=True)
WIDTHS = [480, 800, 1200, 1600, 2048]


def grade(im):
    """Correção única (celular sob luz fria de oficina): tira o verde da lâmpada,
    segura a saturação para o dourado da interface brilhar e firma o contraste."""
    r, g, b = im.split()[:3]
    r = r.point(lambda c: min(255, c * 1.02 + 2))
    g = g.point(lambda c: c * 0.985)
    out = Image.merge("RGB", (r, g, b))
    out = ImageEnhance.Color(out).enhance(0.9)
    out = ImageEnhance.Contrast(out).enhance(1.1)
    return out.point(lambda c: 4 + c * (248 - 4) / 255)


manifest = {}
for f in sorted(p for p in SRC.iterdir() if p.suffix in (".jpg", ".png", ".webp")):
    im = ImageOps.exif_transpose(Image.open(f)).convert("RGB")
    if im.width > 2048:
        im = im.resize((2048, round(im.height * 2048 / im.width)), Image.LANCZOS)
    im = grade(im)
    w, h = im.size
    sizes = sorted(set([x for x in WIDTHS if x < w] + [w]))
    for tw in sizes:
        im.resize((tw, round(h * tw / w)), Image.LANCZOS).save(OUT / f"{f.stem}-{tw}.webp", "WEBP", quality=80, method=6)
    manifest[f.stem] = {"w": w, "h": h, "sizes": sizes}
    print(f.stem, w, h, sizes)
(ROOT / "src" / "images.json").write_text(json.dumps(manifest, indent=2))

# Open Graph 1200x630: preto + dourado da marca, foto da equipe
BLACK, GOLD, WHITE = (12, 12, 13), (242, 185, 15), (240, 238, 232)
og = Image.new("RGB", (1200, 630), BLACK)
photo = ImageOps.fit(grade(ImageOps.exif_transpose(Image.open(SRC / "equipe.jpg")).convert("RGB")), (520, 630), centering=(0.5, 0.45))
og.paste(photo, (680, 0))
d = ImageDraw.Draw(og)
for i in range(0, 1300, 44):  # fita zebrada
    d.polygon([(i, 600), (i + 22, 600), (i + 2, 630), (i - 20, 630)], fill=GOLD)
black = "/System/Library/Fonts/Supplemental/Arial Black.ttf"
bold = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
d.text((64, 70), "MECÂNICA EM FRANCO DA ROCHA · SP", font=ImageFont.truetype(bold, 22), fill=GOLD)
d.text((60, 120), "OFICINA", font=ImageFont.truetype(black, 104), fill=WHITE)
d.text((60, 240), "3L", font=ImageFont.truetype(black, 104), fill=GOLD)
d.text((64, 400), "Transparência e cuidado", font=ImageFont.truetype(bold, 38), fill=WHITE)
d.text((64, 448), "do início ao fim.", font=ImageFont.truetype(bold, 38), fill=WHITE)
d.text((64, 525), "★ 5,0 no Google · 36 avaliações", font=ImageFont.truetype(bold, 24), fill=GOLD)
og.save(ROOT / "public" / "og-oficina-3l.jpg", "JPEG", quality=88, optimize=True)
print("og ok")
