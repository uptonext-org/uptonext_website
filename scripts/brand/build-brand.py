#!/usr/bin/env python3
"""
Erzeugt die Logo-Dateien unter public/brand/ sowie apple-touch-icon.png und og-image.png
aus den beiden extrahierten Logo-PNGs der alten Seite (741x620, gestapelt).

Aufruf:  python3 scripts/brand/build-brand.py <ordner-mit-logo0.png-und-logo1.png>
         logo0.png = helles Theme (dunkle Schrift), logo1.png = dunkles Theme (helle Schrift)

Benötigt Pillow (mit WebP-Unterstützung). Nur einmal auszuführen; die Ergebnisse liegen im Repo.
TODO: Sobald das SVG-Logo vom Designer vorliegt, ersetzt es diese Rastergrafiken.
"""
import os
import sys

from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'public', 'brand')
PUBLIC = os.path.join(ROOT, 'public')

# Bereiche im Quellbild (gemessen an der Alpha-Maske)
MARK_BOX = (0, 0, 741, 440)  # Bildmarke „UN“ + Pfeil
WORD_BOX = (0, 450, 741, 620)  # Wortmarke „UpToNext“
WORD_CAP_TOP = 464  # Oberkante der Versalien (absolut)
WORD_BASELINE = 586  # Grundlinie (absolut)


def premul_resize(im, size):
    """RGBA mit vormultipliziertem Alpha skalieren (keine dunklen Säume)."""
    return im.convert('RGBa').resize(size, Image.LANCZOS).convert('RGBA')


def trim(im, box):
    part = im.crop(box)
    bbox = part.getchannel('A').getbbox()
    return part.crop(bbox), (box[0] + bbox[0], box[1] + bbox[1])


def save_pair(im, name):
    """PNG (auf 256 Farben palettiert) + WebP (verlustfrei aus derselben Palette); gibt Größen zurück."""
    png_path = os.path.join(OUT, name + '.png')
    webp_path = os.path.join(OUT, name + '.webp')
    q = im.quantize(colors=256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE)
    q.save(png_path, optimize=True)
    q.convert('RGBA').save(webp_path, 'WEBP', lossless=True, method=6, quality=100)
    return im.size, os.path.getsize(png_path), os.path.getsize(webp_path)


def lockup(src):
    """Horizontal: Bildmarke links, Wortmarke rechts, Versalhöhe = 40 % der Markenhöhe."""
    mark, _ = trim(src, MARK_BOX)
    word, (wx, wy) = trim(src, WORD_BOX)
    mh = mark.height
    cap = WORD_BASELINE - WORD_CAP_TOP
    s = (0.40 * mh) / cap
    word = premul_resize(word, (round(word.width * s), round(word.height * s)))
    cap_top_in_word = (WORD_CAP_TOP - wy) * s
    baseline_in_word = (WORD_BASELINE - wy) * s
    gap = round(0.17 * mh)
    W = mark.width + gap + word.width
    H = mh
    canvas = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    canvas.alpha_composite(mark, (0, 0))
    centre = H / 2
    y = round(centre - (cap_top_in_word + baseline_in_word) / 2)
    y = max(0, min(H - word.height, y))
    canvas.alpha_composite(word, (mark.width + gap, y))
    return canvas


def stacked(src):
    trimmed, _ = trim(src, (0, 0, src.width, src.height))
    return trimmed


def mark_only(src):
    mark, _ = trim(src, MARK_BOX)
    return mark


def at_height(im, h):
    w = round(im.width * h / im.height)
    return premul_resize(im, (w, h))


def main(src_dir):
    os.makedirs(OUT, exist_ok=True)
    light = Image.open(os.path.join(src_dir, 'logo0.png')).convert('RGBA')
    dark = Image.open(os.path.join(src_dir, 'logo1.png')).convert('RGBA')
    report = []
    for theme, src in (('light', light), ('dark', dark)):
        report.append(('lockup-' + theme, save_pair(at_height(lockup(src), 64), 'uptonext-lockup-' + theme)))
        report.append(('stacked-' + theme, save_pair(at_height(stacked(src), 128), 'uptonext-stacked-' + theme)))
        report.append(('mark-' + theme, save_pair(at_height(mark_only(src), 192), 'uptonext-mark-' + theme)))

    # apple-touch-icon: Bildmarke (helle Variante) auf Weiß, mit Innenabstand
    icon = Image.new('RGBA', (180, 180), (255, 255, 255, 255))
    m = mark_only(light)
    box = 180 - 2 * 30
    s = min(box / m.width, box / m.height)
    m = premul_resize(m, (round(m.width * s), round(m.height * s)))
    icon.alpha_composite(m, ((180 - m.width) // 2, (180 - m.height) // 2 + 2))
    icon.convert('RGB').save(os.path.join(PUBLIC, 'apple-touch-icon.png'), optimize=True)

    # og-image: heller Hintergrund, Logo zentriert, grüne Akzentlinie
    og = Image.new('RGBA', (1200, 630), (245, 246, 247, 255))
    card = Image.new('RGBA', (1200, 630 - 12), (255, 255, 255, 255))
    og.alpha_composite(card, (0, 0))
    st = at_height(stacked(light), 300)
    og.alpha_composite(st, ((1200 - st.width) // 2, (630 - 12 - st.height) // 2))
    bar = Image.new('RGBA', (1200, 12), (46, 194, 106, 255))
    og.alpha_composite(bar, (0, 630 - 12))
    og_rgb = og.convert('RGB')
    og_q = og_rgb.quantize(colors=128, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    og_q.save(os.path.join(PUBLIC, 'og-image.png'), optimize=True)

    for name, (size, png, webp) in report:
        print(f'{name:16} {size[0]}x{size[1]}  png {png/1024:.1f} KB  webp {webp/1024:.1f} KB')
    print('apple-touch-icon', os.path.getsize(os.path.join(PUBLIC, 'apple-touch-icon.png')) // 1024, 'KB')
    print('og-image', os.path.getsize(os.path.join(PUBLIC, 'og-image.png')) // 1024, 'KB')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(1)
    main(sys.argv[1])
