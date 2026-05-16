"""
Detecta automáticamente las filas y columnas del grid de cromos
analizando el perfil de color de la página renderizada.
"""

import fitz
import sys
from PIL import Image
import numpy as np

DPI = 150
SCALE = DPI / 72.0

def page_to_array(page):
    mat = fitz.Matrix(SCALE, SCALE)
    pix = page.get_pixmap(matrix=mat, colorspace=fitz.csRGB)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    return np.array(img)

def find_separators(arr, axis, threshold=0.4, min_run=3):
    """
    Encuentra posiciones donde la media de un color "fondo" supera un umbral.
    axis=0 → perfil horizontal (detecta filas separadoras)
    axis=1 → perfil vertical (detecta columnas separadoras)
    """
    # Normaliza: queremos encontrar líneas con poco color saturado (fondo teal o blanco)
    # El fondo del álbum es teal ≈ (0, 183, 195) aprox.
    r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]
    # "Fondo" = píxeles donde G y B son altos relativo a R (teal) O todo es blanco
    teal_mask = (g.astype(int) > 140) & (b.astype(int) > 140) & (g.astype(int) - r.astype(int) > 30)
    white_mask = (r > 200) & (g > 200) & (b > 200)
    bg_mask = teal_mask | white_mask

    if axis == 0:
        profile = bg_mask.mean(axis=1)  # fracción de píxeles "fondo" por fila
    else:
        profile = bg_mask.mean(axis=0)  # fracción de píxeles "fondo" por columna

    # Encuentra posiciones donde el perfil supera el threshold
    is_bg = profile > threshold

    separators = []
    in_run = False
    run_start = 0
    for i, v in enumerate(is_bg):
        if v and not in_run:
            in_run = True
            run_start = i
        elif not v and in_run:
            in_run = False
            run_len = i - run_start
            if run_len >= min_run:
                separators.append((run_start, i - 1, run_start + run_len // 2))
    if in_run:
        run_len = len(is_bg) - run_start
        if run_len >= min_run:
            separators.append((run_start, len(is_bg) - 1, run_start + run_len // 2))

    return separators, profile

def main():
    path = sys.argv[1] if len(sys.argv) > 1 else r"docs\HOLANDA.pdf"
    doc = fitz.open(path)

    for page_num, page in enumerate(doc):
        arr = page_to_array(page)
        h, w = arr.shape[:2]
        print(f"\n=== Pagina {page_num} ({w}x{h} px a {DPI}dpi) ===")

        row_seps, row_profile = find_separators(arr, axis=0, threshold=0.5)
        col_seps, col_profile = find_separators(arr, axis=1, threshold=0.5)

        print(f"Separadores de fila (y): {[s[2] for s in row_seps]}")
        print(f"Separadores de columna (x): {[s[2] for s in col_seps]}")

        # Estima filas de cromos
        all_y = [0] + [s[0] for s in row_seps] + [h]
        all_x = [0] + [s[0] for s in col_seps] + [w]

        print(f"Franjas fila (px): {list(zip(all_y, all_y[1:]))}")
        print(f"Franjas col (px):  {list(zip(all_x, all_x[1:]))}")

if __name__ == "__main__":
    main()
