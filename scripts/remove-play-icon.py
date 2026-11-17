"""Remove o ícone de "play" que o Instagram embute na capa dos reels (capas usadas só como miniaturas).
Uso: python3 scripts/remove-play-icon.py assets-src/arquivo.jpg ...  (o original vai para research/reel-orig/)"""
import sys, shutil
import numpy as np
from PIL import Image, ImageFilter
from pathlib import Path

for f in sys.argv[1:]:
    p = Path(f)
    orig = Path('research/reel-orig') / p.name
    if not orig.exists(): shutil.copy(p, orig)
    a = np.asarray(Image.open(orig).convert('RGB')).astype(np.float32)
    H, W, _ = a.shape
    cy, cx = H / 2, W / 2
    # triângulo branco perto do centro
    yy, xx = np.mgrid[0:H, 0:W]
    near = (abs(yy - cy) < 60) & (abs(xx - cx) < 60)
    white = near & (a.min(axis=2) > 225)
    if white.sum() > 30:
        cy, cx = yy[white].mean(), xx[white].mean() - 3
    r = np.hypot(yy - cy, xx - cx)
    R = 50.5
    # o círculo escurece o fundo: compensa pela razão entre o anel de dentro e o de fora
    inner = (r > R - 6) & (r < R - 2); outer = (r > R + 2) & (r < R + 6)
    ratio = np.clip(a[outer].mean(0) / np.maximum(a[inner].mean(0), 1), 1, 3)
    circ = r < R
    a[circ] *= ratio
    # triângulo + borda do círculo: preenche por difusão
    mask = (circ & (a.min(axis=2) > 215 * ratio.min())) | ((r > R - 3) & (r < R + 3))
    mask = np.asarray(Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))) > 0
    out = a.copy()
    out[mask] = a[~mask].mean(0)
    for _ in range(400):
        blur = np.asarray(Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).filter(ImageFilter.BoxBlur(2))).astype(np.float32)
        out[mask] = blur[mask]
    # costura suave do círculo
    soft = np.asarray(Image.fromarray(((r < R + 4) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))).astype(np.float32)[..., None] / 255
    final = out * soft + np.asarray(Image.open(orig).convert('RGB')).astype(np.float32) * (1 - soft)
    Image.fromarray(np.clip(final, 0, 255).astype(np.uint8)).save(p, quality=95)
    print(p.name, 'centro', round(cx), round(cy), 'razão', ratio.round(2))
