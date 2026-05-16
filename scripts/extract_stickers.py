"""
Extrae cromos individuales de PDFs de álbum Panini y los guarda como .webp
en public/assets/players/<TEAM_CODE>/<nombre_jugador>.webp

Uso:
  python scripts/extract_stickers.py <pdf_path> <team_code>
  python scripts/extract_stickers.py docs/HOLANDA.pdf NED

El script:
  1. Renderiza cada página del PDF a alta resolución.
  2. Recorta la cuadrícula de cromos (4 columnas, filas variables).
  3. Guarda los cromos como archivos webp numerados (01, 02...) para
     que el usuario confirme los nombres antes de renombrar.
"""

import sys
import os
import fitz
from PIL import Image
import io

# ─── Configuración del grid ────────────────────────────────────────────────
# Coordenadas en PUNTOS del PDF (72 dpi base) para el álbum Panini 2026.
# El PDF típico del álbum mide 613 × 860 pts.
# Ajusta TOP_OFFSETS/HEIGHTS si los márgenes difieren entre PDFs.

DPI = 300
SCALE = DPI / 72.0

N_COLS = 4
# Márgenes y separadores en puntos
MARGIN_LEFT  = 8.0
MARGIN_RIGHT = 8.0
MARGIN_TOP   = 8.0
MARGIN_BOT   = 8.0
GAP_H = 3.5   # gap horizontal entre cromos
GAP_V = 3.5   # gap vertical entre filas

def compute_cols(page_w_pts):
    usable_w = page_w_pts - MARGIN_LEFT - MARGIN_RIGHT - GAP_H * (N_COLS - 1)
    cell_w = usable_w / N_COLS
    xs = []
    for c in range(N_COLS):
        x0 = MARGIN_LEFT + c * (cell_w + GAP_H)
        x1 = x0 + cell_w
        xs.append((x0, x1))
    return xs

def compute_rows(page_h_pts, n_rows):
    usable_h = page_h_pts - MARGIN_TOP - MARGIN_BOT - GAP_V * (n_rows - 1)
    cell_h = usable_h / n_rows
    ys = []
    for r in range(n_rows):
        y0 = MARGIN_TOP + r * (cell_h + GAP_V)
        y1 = y0 + cell_h
        ys.append((y0, y1))
    return ys

def pts_to_px(v):
    return int(round(v * SCALE))

def crop_sticker(pix_img: Image.Image, x0, y0, x1, y1) -> Image.Image:
    return pix_img.crop((pts_to_px(x0), pts_to_px(y0), pts_to_px(x1), pts_to_px(y1)))

def page_to_pil(page) -> Image.Image:
    mat = fitz.Matrix(SCALE, SCALE)
    pix = page.get_pixmap(matrix=mat, colorspace=fitz.csRGB)
    return Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

# ─── Lógica de layout por página ──────────────────────────────────────────
# Cada entrada: (n_rows, lista de posiciones (row, col) a SALTAR — no son jugadores)
# Las posiciones saltadas son el badge del equipo, cromos especiales, foto de equipo, etc.
# Ajusta si un PDF concreto tiene un layout diferente.

# Layout estándar Panini 2026 (HOLANDA, etc.):
#   Página 0: 4 filas × 4 cols, skip (0,0)=badge, (0,1)=especial
#   Página 1: 2 filas × 4 cols, skip (1,0)=foto equipo (última fila, col 0)
PAGE_LAYOUTS = {
    0: {"n_rows": 4, "skip": {(0, 0), (0, 1)}},
    1: {"n_rows": 2, "skip": {(1, 0)}},
}

def extract(pdf_path: str, team_code: str, out_dir: str):
    team_upper = team_code.upper()
    os.makedirs(out_dir, exist_ok=True)

    doc = fitz.open(pdf_path)
    sticker_idx = 1

    for page_num, page in enumerate(doc):
        layout = PAGE_LAYOUTS.get(page_num)
        if layout is None:
            print(f"  Página {page_num}: sin layout definido, saltando.")
            continue

        n_rows = layout["n_rows"]
        skip   = layout["skip"]

        page_w = page.rect.width
        page_h = page.rect.height
        print(f"  Página {page_num}: {page_w:.0f}×{page_h:.0f} pts, {n_rows} filas")

        pil = page_to_pil(page)
        cols = compute_cols(page_w)
        rows = compute_rows(page_h, n_rows)

        for r, (y0, y1) in enumerate(rows):
            for c, (x0, x1) in enumerate(cols):
                if (r, c) in skip:
                    continue
                img = crop_sticker(pil, x0, y0, x1, y1)
                fname = f"{team_upper}_{sticker_idx:02d}.webp"
                fpath = os.path.join(out_dir, fname)
                img.save(fpath, "WEBP", quality=85)
                print(f"    [{r},{c}] -> {fname}")
                sticker_idx += 1

    print(f"\nTotal cromos extraídos: {sticker_idx - 1}")
    print(f"Guardados en: {out_dir}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Uso: python extract_stickers.py <pdf_path> <team_code>")
        print("Ej:  python extract_stickers.py docs/HOLANDA.pdf NED")
        sys.exit(1)

    pdf_path  = sys.argv[1]
    team_code = sys.argv[2]
    out_dir   = os.path.join("public", "assets", "players", team_code.upper())
    extract(pdf_path, team_code, out_dir)
