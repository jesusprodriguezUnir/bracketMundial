"""
Extrae fotos de jugadores de los PDFs Panini FIFA World Cup 2026
y las guarda en public/players/{TEAM}/{numero}.webp (300x300 RGBA)
"""
import fitz  # PyMuPDF
from PIL import Image
import io
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ── Coordenadas del grid en la imagen extraída del PDF ──────────────────────
# Página 1: imagen 2316×3072, grid 4 cols × 4 filas
MARGIN_X = 25
MARGIN_Y = 25
GAP_X    = 12
GAP_Y    = 12
COLS     = 4
ROWS_P1  = 4
W_PAGE   = 2316
H_PAGE1  = 3072
H_PAGE2_ROW = None  # se calcula

CARD_W = (W_PAGE - 2 * MARGIN_X - (COLS - 1) * GAP_X) // COLS       # ~557 px
CARD_H1 = (H_PAGE1 - 2 * MARGIN_Y - (ROWS_P1 - 1) * GAP_Y) // ROWS_P1  # ~746 px

# Dentro de cada cromo, la foto del jugador ocupa los primeros ~62 % de la altura.
# Recortamos ese rectángulo y luego centramos en cuadrado 300×300.
FACE_TOP_FRAC    = 0.07   # 7 % desde arriba del cromo
FACE_BOTTOM_FRAC = 0.66   # hasta el 66 %
FACE_LEFT_FRAC   = 0.04
FACE_RIGHT_FRAC  = 0.96

# ── Mappings: posición en el grid → número de camiseta (None = saltar) ───────
# Posición: (página 0-based, fila 0-based, col 0-based)

MAPPINGS = {
    "ARG": [
        # Página 1
        ((0, 0, 0), None),   # escudo
        ((0, 0, 1), None),   # foto equipo
        ((0, 0, 2), 1),      # Emiliano Martínez
        ((0, 0, 3), 10),     # Lionel Messi
        ((0, 1, 0), 27),     # Nico González
        ((0, 1, 1), 21),     # Giuliano Simeone
        ((0, 1, 2), 9),      # Julián Álvarez
        ((0, 1, 3), 11),     # Lautaro Martínez
        ((0, 2, 0), None),   # Franco Mastantuono (no está en el squad)
        ((0, 2, 1), 8),      # Enzo Fernández
        ((0, 2, 2), 6),      # Alexis Mac Allister
        ((0, 2, 3), 29),     # Nico Paz
        ((0, 3, 0), 5),      # Leandro Paredes
        ((0, 3, 1), 7),      # Rodrigo De Paul
        ((0, 3, 2), 15),     # Exequiel Palacios
        ((0, 3, 3), 4),      # Cristian Romero
        # Página 2
        ((1, 0, 0), 24),     # Leonardo Balerdi
        ((1, 0, 1), 13),     # Nicolás Otamendi
        ((1, 0, 2), 2),      # Nahuel Molina
        ((1, 0, 3), 3),      # Nicolás Tagliafico
        ((1, 1, 0), None),   # foto equipo
    ],
    "GER": [
        # Página 1
        ((0, 0, 0), None),   # escudo
        ((0, 0, 1), None),   # foto equipo
        ((0, 0, 2), None),   # Ter Stegen (no está en el squad; Baumann es #1)
        ((0, 0, 3), 7),      # Kai Havertz (Arsenal, 11-6-1999)
        ((0, 1, 0), 19),     # Nick Woltemade
        ((0, 1, 1), None),   # Serge Gnabry (no está en el squad)
        ((0, 1, 2), None),   # Karim Adeyemi (no está en el squad)
        ((0, 1, 3), 16),     # Leroy Sané
        ((0, 2, 0), 6),      # Leon Goretzka
        ((0, 2, 1), 10),     # Florian Wirtz
        ((0, 2, 2), 28),     # Felix Nmecha
        ((0, 2, 3), 2),      # Joshua Kimmich
        ((0, 3, 0), 14),     # Jamal Musiala
        ((0, 3, 1), 3),      # David Raum
        ((0, 3, 2), 25),     # Ridle Baku
        ((0, 3, 3), 5),      # Nico Schlotterbeck
        # Página 2
        ((1, 0, 0), 15),     # Waldemar Anton
        ((1, 0, 1), 4),      # Jonathan Tah
        ((1, 0, 2), 13),     # Antonio Rüdiger
        ((1, 0, 3), 26),     # Maximilian Mittelstädt
        ((1, 1, 0), None),   # foto equipo
    ],
    "BRA": [
        # Página 1
        ((0, 0, 0), 1),      # Alisson Becker
        ((0, 0, 1), 23),     # Bento
        ((0, 0, 2), 4),      # Marquinhos
        ((0, 0, 3), 28),     # Wesley
        ((0, 1, 0), None),   # Éder Militão (no está en el squad)
        ((0, 1, 1), 6),      # Gabriel Magalhães
        ((0, 1, 2), 2),      # Danilo
        ((0, 1, 3), 8),      # Bruno Guimarães
        ((0, 2, 0), 16),     # Lucas Paquetá
        ((0, 2, 1), 5),      # Casemiro
        ((0, 2, 2), None),   # Luiz Henrique (no está en el squad)
        ((0, 2, 3), 10),     # Vinícius Júnior
        ((0, 3, 0), 17),     # Gabriel Martinelli
        ((0, 3, 1), 11),     # Raphinha
        ((0, 3, 2), None),   # Estêvão (no está en el squad)
        ((0, 3, 3), 32),     # Matheus Cunha
        # Página 2
        ((1, 0, 0), None),   # Rodrygo (no está en el squad)
        ((1, 0, 1), 31),     # João Pedro
        ((1, 0, 2), None),   # foto equipo
        ((1, 0, 3), None),   # foto equipo
    ],
    "COL": [
        # Página 1
        ((0, 0, 0), None),   # escudo
        ((0, 0, 1), None),   # foto equipo
        ((0, 0, 2), None),   # David Ospina (no está en el squad; Vargas es #1)
        ((0, 0, 3), 1),      # Camilo Vargas
        ((0, 1, 0), 7),      # Luis Díaz
        ((0, 1, 1), 11),     # Jhon Córdoba
        ((0, 1, 2), 16),     # Jhon Arias
        ((0, 1, 3), None),   # Luis Suárez COL (no está en el squad)
        ((0, 2, 0), 17),     # Jorge Carrascal
        ((0, 2, 1), 8),      # Richard Ríos
        ((0, 2, 2), 21),     # Juan Fernando Quintero
        ((0, 2, 3), 10),     # James Rodríguez
        ((0, 3, 0), 18),     # Kevin Castaño
        ((0, 3, 1), 6),      # Jefferson Lerma
        ((0, 3, 2), None),   # Santiago Arias (no está en el squad)
        ((0, 3, 3), 2),      # Daniel Muñoz
        # Página 2
        ((1, 0, 0), 13),     # Yerry Mina
        ((1, 0, 1), None),   # Johan Mojica (no está en el squad)
        ((1, 0, 2), 4),      # Dávinson Sánchez
        ((1, 0, 3), 3),      # Jhon Lucumí
        ((1, 1, 0), None),   # foto equipo
    ],
}

PDF_FILES = {
    "ARG": "docs/ARGENTINA.pdf",
    "GER": "docs/ALEMANHA.pdf",
    "BRA": "docs/BRASIL.pdf",
    "COL": "docs/COLOMBIA.pdf",
}


def get_page_rgb_image(doc, page_idx: int) -> Image.Image:
    """Extrae la imagen RGB embebida de una página del PDF."""
    page = doc[page_idx]
    imgs = page.get_images(full=True)
    for img_info in imgs:
        xref = img_info[0]
        pix = fitz.Pixmap(doc, xref)
        if pix.colorspace and pix.colorspace.n == 3:
            data = pix.tobytes("png")
            return Image.open(io.BytesIO(data)).convert("RGBA")
    raise RuntimeError(f"No se encontró imagen RGB en la página {page_idx}")


def card_bbox(row: int, col: int, card_w: int, card_h: int):
    """Devuelve (x0, y0, x1, y1) del cromo en la imagen de página."""
    x0 = MARGIN_X + col * (card_w + GAP_X)
    y0 = MARGIN_Y + row * (card_h + GAP_Y)
    return x0, y0, x0 + card_w, y0 + card_h


def crop_face(card_img: Image.Image) -> Image.Image:
    """Recorta la zona de la cara dentro del cromo y la redimensiona a 300×300."""
    w, h = card_img.size
    x0 = int(w * FACE_LEFT_FRAC)
    y0 = int(h * FACE_TOP_FRAC)
    x1 = int(w * FACE_RIGHT_FRAC)
    y1 = int(h * FACE_BOTTOM_FRAC)
    face = card_img.crop((x0, y0, x1, y1))

    # Centrar en cuadrado
    fw, fh = face.size
    side = min(fw, fh)
    left = (fw - side) // 2
    top  = (fh - side) // 2
    face = face.crop((left, top, left + side, top + side))
    return face.resize((300, 300), Image.LANCZOS)


def process_team(team: str, verbose: bool = True):
    pdf_path = os.path.join(ROOT, PDF_FILES[team])
    doc = fitz.open(pdf_path)

    # Precarga imágenes de páginas
    pages: dict[int, Image.Image] = {}

    saved = 0
    skipped = 0

    for (page_idx, row, col), number in MAPPINGS[team]:
        if number is None:
            skipped += 1
            continue

        if page_idx not in pages:
            pages[page_idx] = get_page_rgb_image(doc, page_idx)

        page_img = pages[page_idx]
        pw, ph = page_img.size

        # Altura de cromo ajustada a la página real
        rows_in_page = 4 if page_idx == 0 else 2
        card_w = (pw - 2 * MARGIN_X - (COLS - 1) * GAP_X) // COLS
        card_h = (ph - 2 * MARGIN_Y - (rows_in_page - 1) * GAP_Y) // rows_in_page

        bbox = card_bbox(row, col, card_w, card_h)
        card_img = page_img.crop(bbox)
        face_img = crop_face(card_img)

        out_dir = os.path.join(ROOT, "public", "players", team)
        os.makedirs(out_dir, exist_ok=True)
        out_path = os.path.join(out_dir, f"{number}.webp")
        face_img.save(out_path, "WEBP", quality=90)

        if verbose:
            print(f"  OK {team}/{number}.webp  (pag {page_idx+1}, fila {row}, col {col})")
        saved += 1

    doc.close()
    print(f"{team}: {saved} fotos guardadas, {skipped} posiciones saltadas")
    return saved


def main():
    total = 0
    for team in ["ARG", "GER", "BRA", "COL"]:
        print(f"\n--- {team} ---")
        total += process_team(team)
    print(f"\nTotal: {total} fotos extraídas y guardadas")


if __name__ == "__main__":
    main()
