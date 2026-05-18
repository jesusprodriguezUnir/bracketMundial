"""
extract_panini.py - Extract player photos from Panini World Cup 2026 album PDF
using EasyOCR to identify teams (via badge) and player names, then save as
300px-wide WebP files matching the project's existing photo format.

Uso:
    python scripts/extract_panini.py "docs/TODAS LAS FIGURITAS EN PDF.pdf"
    python scripts/extract_panini.py "docs/TODAS LAS FIGURITAS EN PDF.pdf" --team ARG
    python scripts/extract_panini.py "docs/TODAS LAS FIGURITAS EN PDF.pdf" --pages 5-6 --team ARG
    python scripts/extract_panini.py "docs/TODAS LAS FIGURITAS EN PDF.pdf" --dry-run
    python scripts/extract_panini.py docs/HOLANDA.pdf --team NED --layout-name standard

Dependencias: PyMuPDF, Pillow, NumPy, EasyOCR (pip install easyocr)
"""

import sys
import io

# Fix Unicode output on Windows cp1252 consoles
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")


import fitz  # PyMuPDF
from PIL import Image
import numpy as np
import easyocr
import os
import sys
import re
import argparse
import io
from difflib import SequenceMatcher
from typing import Optional, Dict, List, Tuple, Set


# ─── CONFIGURATION ──────────────────────────────────────────────────────────

DPI = 150          # DPI for page rendering (balance speed vs quality)
SCALE = DPI / 72.0

N_COLS = 4
MARGIN_LEFT   = 8.0
MARGIN_RIGHT  = 8.0
MARGIN_TOP    = 8.0
MARGIN_BOT    = 8.0
GAP_H = 3.5
GAP_V = 3.5

OUTPUT_BASE = "public/players"
WEBP_QUALITY = 80
PHOTO_WIDTH = 300

# ─── TEAM NAME MAPPING ──────────────────────────────────────────────────────
# Portuguese/Spanish names -&gt; FIFA 3-letter code.
# Includes fuzzy variants that OCR might produce.

COUNTRY_TO_FIFA: Dict[str, str] = {
    # Full names as they appear in Panini album (Portuguese/Spanish)
    "ALEMANHA": "GER", "ALEMANIA": "GER", "ALEMANHA FC": "GER",
    "ARGENTINA": "ARG", "ARGENTINA FC": "ARG",
    "AUSTRALIA": "AUS", "AUSTRALIA FC": "AUS",
    "AUSTRIA": "AUT", "AUSTRIA FC": "AUT",
    "ARGELIA": "ALG", "ARGELIA FC": "ALG",
    "ARABIA SAUDITA": "KSA", "ARABIA SAUDI": "KSA",
    "BIH": "BIH", "BOSNIA": "BIH", "BOSNIA E HERZEGOVINA": "BIH",
    "BOSNIA-HERZEGOVINA": "BIH", "BOSNIA Y HERZEGOVINA": "BIH",
    "BRASIL": "BRA", "BRASIL FC": "BRA",
    "BELGICA": "BEL", "BELGICA FC": "BEL",
    "CANADA": "CAN", "CANADA FC": "CAN",
    "CABO VERDE": "CPV", "CABO VERDE FC": "CPV",
    "COREIA DO SUL": "KOR", "COREIA": "KOR", "COREA DEL SUR": "KOR",
    "COSTA DO MARFIM": "CIV", "COSTA DE MARFIL": "CIV",
    "CROACIA": "CRO", "CROACIA FC": "CRO",
    "COLOMBIA": "COL", "COLOMBIA FC": "COL",
    "CONGO": "COD", "RD CONGO": "COD", "REP DEM CONGO": "COD",
    "CUW": "CUW", "CURACAO": "CUW", "CURAÇAO": "CUW", "CURAZAO": "CUW",
    "CZE": "CZE", "REPUBLICA CHECA": "CZE", "REPUBLICA TCHECA": "CZE",
    "REP CHECA": "CZE", "REP TCHECA": "CZE",
    "EGITO": "EGY", "EGIPTO": "EGY",
    "EQUADOR": "ECU", "ECUADOR": "ECU",
    "ESCOCIA": "SCO", "ESCOCIA FC": "SCO",
    "ESPANHA": "ESP", "ESPANA": "ESP", "ESPANHA FC": "ESP",
    "ESTADOS UNIDOS": "USA", "EUA": "USA", "USA": "USA",
    "FRANCA": "FRA", "FRANCA FC": "FRA", "FRANCIA": "FRA",
    "GANA": "GHA", "GHANA": "GHA",
    "HAITI": "HAI", "HAITI FC": "HAI",
    "HOLANDA": "NED", "PAISES BAIXOS": "NED", "PAISES BAJOS": "NED",
    "INGLATERRA": "ENG", "INGLATERRA FC": "ENG",
    "IRA": "IRN", "IRAN": "IRN",
    "IRAQUE": "IRQ", "IRAQ": "IRQ", "IRAQU": "IRQ",
    "JAPAO": "JPN", "JAPON": "JPN",
    "JORDANIA": "JOR", "JORDANIA FC": "JOR",
    "MARROCOS": "MAR", "MARRUECOS": "MAR", "MARROCOS FC": "MAR",
    "MEXICO": "MEX", "MEXICO FC": "MEX",
    "NOVA ZELANDIA": "NZL", "NUEVA ZELANDA": "NZL", "NUEVA ZELANDIA": "NZL",
    "NORUEGA": "NOR", "NORUEGA FC": "NOR",
    "PANAMA": "PAN", "PANAMA FC": "PAN",
    "PARAGUAI": "PAR", "PARAGUAY": "PAR",
    "PORTUGAL": "POR", "PORTUGAL FC": "POR",
    "QATAR": "QAT", "CATAR": "QAT",
    "SUECIA": "SWE", "SUECIA FC": "SWE",
    "SUICA": "SUI", "SUIZA": "SUI",
    "SENEGAL": "SEN", "SENEGAL FC": "SEN",
    "TUNISIA": "TUN", "TUNEZ": "TUN",
    "TURQUIA": "TUR", "TURQUIA FC": "TUR",
    "URUGUAI": "URU", "URUGUAY": "URU",
    "UZBEQUISTAO": "UZB", "UZBEQUISTAN": "UZB",
    "AFRICA DO SUL": "RSA", "SUDAFRICA": "RSA", "SUDAFRICA FC": "RSA",
    "ESCANER": None,  # noise
    "PANINI": None,  # noise
}

# ─── SQUAD DATA LOADING ─────────────────────────────────────────────────────
# We load squads from the TypeScript source to match player names.
# This is a simplified approach: parse the .ts files for player entries.

SQUADS: Dict[str, List[Dict]] = {}


def _parse_squad_ts(filepath: str) -> List[Dict]:
    """Parse a squad .ts file extracting number, name, position, club."""
    players = []
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    # Match: { number: N, name: 'Full Name', position: 'XX', ... }
    pattern = re.compile(
        r"\{\s*number:\s*(\d+)\s*,\s*name:\s*'([^']+)'\s*,\s*"
        r"position:\s*'([A-Z]+)'\s*,\s*age:\s*\d+\s*,\s*"
        r"club:\s*'([^']*)'"
    )
    for m in pattern.finditer(content):
        number = int(m.group(1))
        name = m.group(2).strip()
        position = m.group(3)
        club = m.group(4).strip()
        players.append({"number": number, "name": name, "position": position, "club": club})
    return players


def load_squads(squads_dir: str = "src/data/squads") -> Dict[str, List[Dict]]:
    """Load all squad data from .ts files."""
    squads = {}
    if not os.path.isdir(squads_dir):
        print(f"  WARNING: squads dir not found: {squads_dir}")
        return squads
    for fname in sorted(os.listdir(squads_dir)):
        if fname == "index.ts" or not fname.endswith(".ts"):
            continue
        team_code = fname.replace(".ts", "").upper()
        path = os.path.join(squads_dir, fname)
        players = _parse_squad_ts(path)
        if players:
            squads[team_code] = players
    return squads


# ─── PDF / GRID HELPERS ──────────────────────────────────────────────────────

def pts_to_px(v: float) -> int:
    return int(round(v * SCALE))


def page_to_pil(page) -> Image.Image:
    """Render a PDF page to a PIL Image at SCALE resolution."""
    mat = fitz.Matrix(SCALE, SCALE)
    pix = page.get_pixmap(matrix=mat, colorspace=fitz.csRGB)
    return Image.frombytes("RGB", [pix.width, pix.height], pix.samples)


def compute_cols(page_w_pts: float) -> List[Tuple[float, float]]:
    usable_w = page_w_pts - MARGIN_LEFT - MARGIN_RIGHT - GAP_H * (N_COLS - 1)
    cell_w = usable_w / N_COLS
    xs = []
    for c in range(N_COLS):
        x0 = MARGIN_LEFT + c * (cell_w + GAP_H)
        x1 = x0 + cell_w
        xs.append((x0, x1))
    return xs


def compute_rows(page_h_pts: float, n_rows: int) -> List[Tuple[float, float]]:
    usable_h = page_h_pts - MARGIN_TOP - MARGIN_BOT - GAP_V * (n_rows - 1)
    cell_h = usable_h / n_rows
    ys = []
    for r in range(n_rows):
        y0 = MARGIN_TOP + r * (cell_h + GAP_V)
        y1 = y0 + cell_h
        ys.append((y0, y1))
    return ys


def crop_cell(pil_img: Image.Image, x0, y0, x1, y1) -> Image.Image:
    """Crop a grid cell from the rendered page image."""
    return pil_img.crop((pts_to_px(x0), pts_to_px(y0), pts_to_px(x1), pts_to_px(y1)))


def detect_rows(page_arr: np.ndarray, threshold: float = 0.5, min_run: int = 3) -> int:
    """
    Auto-detect the number of sticker rows on a page using background color.
    The album background is teal (~(0, 183, 195)) or white between stickers.
    Returns estimated number of rows.
    """
    r, g, b = page_arr[:, :, 0], page_arr[:, :, 1], page_arr[:, :, 2]
    teal_mask = (g.astype(int) > 140) & (b.astype(int) > 140) & (g.astype(int) - r.astype(int) > 30)
    white_mask = (r > 200) & (g > 200) & (b > 200)
    bg_mask = teal_mask | white_mask

    profile = bg_mask.mean(axis=1)  # horizontal profile
    # Find runs of "background" (separator regions)
    is_bg = profile > threshold
    separators = []
    in_run = False
    run_start = 0
    for i, v in enumerate(is_bg):
        if v and not in_run:
            in_run = True
            run_start = i
        elif not v and in_run:
            run_len = i - run_start
            if run_len >= min_run:
                separators.append(run_start + run_len // 2)
            in_run = False
    if in_run:
        run_len = len(is_bg) - run_start
        if run_len >= min_run:
            separators.append(run_start + run_len // 2)

    # Number of separators + 1 = rows; but we also check margins
    if len(separators) >= 1:
        return len(separators) + 1
    # Fallback: try 4 rows (most common)
    return 4


def classify_page(page) -> str:
    """
    Classify a PDF page by its image composition.
    Returns:
        'embedded' - Many small sticker JPEGs embedded (full album PDF)
        'scanned'  - 1-2 large scanned page images (single-team PDFs)
        'fullpage' - One large full-page image (team photo, hologram)
        'empty'    - No usable sticker content
    """
    imgs = page.get_images(full=True)
    if not imgs:
        return "empty"

    large_images = []
    small_images = []
    for img in imgs:
        xref = img[0]
        info = page.parent.extract_image(xref)
        w, h = info["width"], info["height"]
        if w > 1000 or h > 1000:
            large_images.append(img)
        else:
            small_images.append(img)

    # Full-page single image (team photo, hologram, etc.)
    if len(large_images) == 1 and len(small_images) <= 2:
        return "fullpage"

    # Scanned page with 1-2 large images (single-team PDFs like HOLANDA.pdf)
    if len(large_images) >= 1 and len(small_images) < 10:
        return "scanned"

    # Many small embedded sticker images (full album PDF)
    if len(small_images) >= 10:
        return "embedded"

    # Edge case: few images, none very large
    if len(imgs) < 5:
        return "scanned"

    return "empty"


# ─── OCR HELPERS ─────────────────────────────────────────────────────────────

class OCREngine:
    """Wrapper around EasyOCR for reading sticker text."""

    def __init__(self):
        self.reader = easyocr.Reader(["en", "es"], gpu=False, verbose=False)

    def read_text(self, image: Image.Image) -> str:
        """Run OCR on a PIL image, return cleaned text."""
        arr = np.array(image)
        results = self.reader.readtext(arr, detail=0, paragraph=False)
        return " ".join(results).strip().upper()

    def read_text_clean(self, image: Image.Image) -> str:
        """Run OCR and clean up common noise."""
        text = self.read_text(image)
        return clean_ocr_text(text)


def clean_ocr_text(text: str) -> str:
    """Remove OCR noise and normalize."""
    text = text.upper()
    text = re.sub(r"[^A-Z0-9\s\-\.]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def fuzzy_match_name(ocr_name: str, squad: List[Dict], min_score: float = 0.45) -> Optional[Dict]:
    """
    Match an OCR-read name against the squad list.
    Returns the matched player dict or None.
    """
    ocr_clean = ocr_name.upper().strip()
    # Remove common OCR noise
    ocr_clean = re.sub(r"\bPANINI\b", "", ocr_clean)
    ocr_clean = re.sub(r"\bFIGURITA\b", "", ocr_clean)
    ocr_clean = re.sub(r"\bSTICKER\b", "", ocr_clean)
    ocr_clean = ocr_clean.strip()

    if len(ocr_clean) < 3:
        return None

    # Extract likely name: first 2-3 words before any date pattern (dd-dd-dddd)
    # The name is at the beginning, followed by birth date, height, club
    # Birth date pattern: \d{1,2}-\d{1,2}-\d{4}
    date_match = re.search(r"\d{1,2}[-\.]\d{1,2}[-\.]\d{4}", ocr_clean)
    name_part = ocr_clean
    if date_match:
        name_part = ocr_clean[:date_match.start()].strip()
    elif len(ocr_clean.split()) > 4:
        # If no date found but lots of words, take first 3 words
        name_part = " ".join(ocr_clean.split()[:3])

    # Also try with VC correction (OCR often misreads Y as V)
    ocr_variants = [
        name_part,
        name_part.replace(" V ", " Y "),
        name_part.replace(" CODV ", " CODY "),
        name_part.replace(" RVAN ", " RYAN "),
    ]
    # If name_part starts with RVAN, fix to RYAN
    if name_part.startswith("RVAN"):
        ocr_variants.append("RYAN" + name_part[4:])

    best_score = 0.0
    best_player = None

    for player in squad:
        pname = player["name"].upper()
        pname_last = pname.split()[-1] if pname else pname

        for variant in ocr_variants:
            # Full name match
            score = SequenceMatcher(None, variant, pname).ratio()
            # Last name match (weighted higher)
            score_last = SequenceMatcher(None, variant, pname_last).ratio()
            score = max(score, score_last * 0.9)

            # Check if variant contains the name or vice versa
            if pname in variant or variant in pname:
                score = max(score, 0.75)

            # Check word-by-word: if any word matches well
            variant_words = variant.split()
            for vw in variant_words:
                if len(vw) >= 4:
                    ws = SequenceMatcher(None, vw, pname_last).ratio()
                    score = max(score, ws * 0.85)

            if score > best_score:
                best_score = score
                best_player = player

    if best_score >= min_score:
        return best_player
    return None


def match_country(ocr_text: str) -> Optional[str]:
    """
    Match OCR-read country name to FIFA 3-letter code.
    Returns team code or None.
    """
    cleaned = clean_ocr_text(ocr_text)
    # Direct match
    if cleaned in COUNTRY_TO_FIFA:
        return COUNTRY_TO_FIFA[cleaned]

    # Fuzzy match
    best_score = 0.0
    best_code = None
    for key, code in COUNTRY_TO_FIFA.items():
        if code is None:
            continue
        score = SequenceMatcher(None, cleaned, key).ratio()
        if score > best_score:
            best_score = score
            best_code = code

    if best_score >= 0.6:
        return best_code

    return None


# ─── LAYOUT DETECTION & PAGE ANALYSIS ───────────────────────────────────────

# Known layouts for standard 2-page team spreads
KNOWN_LAYOUTS = {
    # Two-page spread: page 0 = 4 rows, page 1 = 2 rows (most teams)
    "standard": {
        0: {"n_rows": 4, "skip": {(0, 0), (0, 1)}},  # badge + special
        1: {"n_rows": 2, "skip": {(1, 0)}},            # team photo
    },
    # Some teams may have single-page layout
    "single": {
        0: {"n_rows": 4, "skip": {(0, 0)}},  # badge only
    },
}


def get_layout_for_page(page_num: int, layout_name: str, n_team_pages_seen: int) -> dict:
    """
    Get the grid layout for a given page within a team's section.
    Uses known layouts when possible, falls back to auto-detection.
    """
    layouts = KNOWN_LAYOUTS.get(layout_name, KNOWN_LAYOUTS["standard"])
    # Map team-relative page number to layout
    team_page = n_team_pages_seen % len(layouts)
    return layouts.get(team_page)


def auto_detect_rows_and_skip(pil_img: Image.Image, n_rows: int) -> Set[Tuple[int, int]]:
    """
    Auto-detect which grid cells to skip (badge, special cards, team photo).
    Returns set of (row, col) positions to skip.
    """
    skip = set()
    arr = np.array(pil_img)
    h, w = arr.shape[:2]
    cell_h = h // n_rows
    cell_w = w // N_COLS

    for r in range(n_rows):
        for c in range(N_COLS):
            y0 = r * cell_h
            y1 = y0 + cell_h
            x0 = c * cell_w
            x1 = x0 + cell_w
            # Add some margin
            margin_h = int(cell_h * 0.05)
            margin_w = int(cell_w * 0.05)
            y0 += margin_h
            y1 -= margin_h
            x0 += margin_w
            x1 -= margin_w
            cell = arr[y0:y1, x0:x1]
            # Skip if mostly background (teal/white > 70%)
            r_ch = cell[:, :, 0]
            g_ch = cell[:, :, 1]
            b_ch = cell[:, :, 2]
            teal = (g_ch.astype(int) > 140) & (b_ch.astype(int) > 140) & (g_ch.astype(int) - r_ch.astype(int) > 30)
            white = (r_ch > 200) & (g_ch > 200) & (b_ch > 200)
            bg_ratio = (teal | white).mean()
            if bg_ratio > 0.75:
                skip.add((r, c))
    return skip


def safe_print(*args, **kwargs):
    """Print safely, replacing unicode chars that fail in cp1252 console."""
    try:
        print(*args, **kwargs)
    except UnicodeEncodeError:
        # Replace problematic chars
        safe_args = []
        for a in args:
            if isinstance(a, str):
                a = a.encode("cp1252", errors="replace").decode("cp1252")
            safe_args.append(a)
        print(*safe_args, **kwargs)

def process_panini_pdf(
    pdf_path: str,
    ocr: OCREngine,
    squads: Dict[str, List[Dict]],
    target_team: Optional[str] = None,
    target_pages: Optional[Tuple[int, int]] = None,
    layout_name: str = "standard",
    dry_run: bool = False,
) -> Dict[str, int]:
    """
    Main extraction pipeline.
    Returns stats dict: {team_code: count_extracted}
    """
    doc = fitz.open(pdf_path)
    total_pages = len(doc)
    print(f"PDF: {pdf_path} ({total_pages} paginas)")
    print(f"DPI: {DPI}, Output: {OUTPUT_BASE}/<TEAM>/<number>.webp")
    if dry_run:
        print("*** DRY RUN - no files will be saved ***")
    print()

    stats: Dict[str, int] = {"_skipped_": 0, "_matched_": 0, "_unmatched_": 0}
    current_team: Optional[str] = None
    n_team_pages_seen = 0

    # Page range
    if target_pages:
        page_range = range(target_pages[0], min(target_pages[1] + 1, total_pages))
    else:
        page_range = range(total_pages)

    if target_team:
        current_team = target_team.upper()

    for page_num in page_range:
        page = doc[page_num]
        page_w = page.rect.width
        page_h = page.rect.height
        page_type = classify_page(page)

        # ─── Handle page type ───
        if page_type == "fullpage":
            print(f"  Pag {page_num}: imagen a pagina completa -&gt; salto")
            stats["_skipped_"] += 1
            current_team = None
            n_team_pages_seen = 0
            continue

        if page_type == "empty":
            print(f"  Pag {page_num}: vacia -&gt; salto")
            stats["_skipped_"] += 1
            continue

        # ─── Render page for OCR and grid cropping ───
        pil = page_to_pil(page)
        arr = np.array(pil)

        # ─── STEP 1: Detect team from badge ───
        if not target_team:
            cols_pts = compute_cols(page_w)
            rows_pts = compute_rows(page_h, 4)  # Always 4-row for badge detection

            detected_team = None
            badge_text = ""
            badge_text2 = ""
            # Try (0,0) - badge position
            badge_img = crop_cell(pil, cols_pts[0][0], rows_pts[0][0],
                                  cols_pts[0][1], rows_pts[0][1])
            badge_text = ocr.read_text_clean(badge_img)
            detected_team = match_country(badge_text)

            if not detected_team:
                # Try (0,1)
                badge_img2 = crop_cell(pil, cols_pts[1][0], rows_pts[0][0],
                                       cols_pts[1][1], rows_pts[0][1])
                badge_text2 = ocr.read_text_clean(badge_img2)
                detected_team = match_country(badge_text2)

            if not detected_team:
                # For embedded pages, check if badge text is just too short/OCR noise
                if len(badge_text) > 2:
                    print(f"    badge OCR (0,0): '{badge_text[:50]}'")
                if len(badge_text2) > 2:
                    print(f"    badge OCR (0,1): '{badge_text2[:50]}'")

            if detected_team and detected_team != current_team:
                current_team = detected_team
                n_team_pages_seen = 0
                print(f"  Pag {page_num}: equipo detectado -&gt; {current_team} (badge: '{badge_text[:30]}')")

        if not current_team:
            print(f"  Pag {page_num}: sin equipo identificado -&gt; salto")
            stats["_skipped_"] += 1
            continue

        if current_team not in squads:
            print(f"  Pag {page_num}: equipo {current_team} sin squad data -&gt; salto")
            stats["_skipped_"] += 1
            continue

        # ─── STEP 2: Extract stickers by page type ───
        if page_type == "embedded":
            # Extract embedded JPEGs directly (full album PDF)
            _extract_embedded_page(page, doc, current_team, squads, stats, ocr,
                                   page_num, dry_run)
        else:
            # Render and crop by grid (single-team PDFs)
            _extract_scanned_page(pil, page_w, page_h, current_team, squads,
                                  stats, ocr, page_num, layout_name,
                                  n_team_pages_seen, dry_run)

        n_team_pages_seen += 1

    doc.close()
    return stats


def _extract_embedded_page(
    page, doc, team: str, squads: Dict[str, List[Dict]],
    stats: Dict[str, int], ocr: OCREngine, page_num: int, dry_run: bool,
):
    """Extract stickers directly from embedded JPEGs in the PDF."""
    imgs = page.get_images(full=True)
    sticker_count = 0

    for img in imgs:
        xref = img[0]
        info = doc.extract_image(xref)
        w, h = info["width"], info["height"]
        ext = info["ext"]

        # Skip large images (backgrounds, full pages) and tiny PNGs (placeholders)
        if w > 1000 or h > 1000:
            continue
        if ext == "png" and len(info["image"]) < 5000:
            # Tiny placeholder PNG (badge/team-photo slot marker)
            continue
        if ext != "jpeg":
            continue

        # Convert JPEG bytes to PIL Image
        cell_img = Image.open(io.BytesIO(info["image"]))
        cell_img = cell_img.convert("RGB")

        # OCR the sticker
        ocr_name = ocr.read_text_clean(cell_img)
        matched = fuzzy_match_name(ocr_name, squads[team])

        if matched:
            number = matched["number"]
            name = matched["name"]
            fname = f"{number}.webp"
            fpath = os.path.join(OUTPUT_BASE, team, fname)

            if dry_run:
                print(f"    [{sticker_count}] -&gt; {team}/{number}.webp  ({name})  OCR: '{ocr_name[:40]}'")
            else:
                os.makedirs(os.path.join(OUTPUT_BASE, team), exist_ok=True)
                _save_photo(cell_img, fpath)
                print(f"    [{sticker_count}] -&gt; {team}/{number}.webp  ({name})")
            stats.setdefault(team, 0)
            stats[team] += 1
            stats["_matched_"] += 1
        else:
            review_dir = os.path.join(OUTPUT_BASE, "_review", team)
            review_name = f"{team}_p{page_num}_i{sticker_count}.webp"
            review_path = os.path.join(review_dir, review_name)
            if dry_run:
                print(f"    [{sticker_count}] -&gt; _review/  (sin match) OCR: '{ocr_name[:50]}'")
            else:
                os.makedirs(review_dir, exist_ok=True)
                _save_photo(cell_img, review_path)
                print(f"    [{sticker_count}] -&gt; _review/{review_name}  OCR: '{ocr_name[:50]}'")
            stats["_unmatched_"] += 1

        sticker_count += 1


def _extract_scanned_page(
    pil: Image.Image, page_w: float, page_h: float,
    team: str, squads: Dict[str, List[Dict]],
    stats: Dict[str, int], ocr: OCREngine, page_num: int,
    layout_name: str, n_team_pages_seen: int, dry_run: bool,
):
    """Extract stickers by rendering page and cropping grid cells."""
    arr = np.array(pil)

    # Determine grid layout
    layout = get_layout_for_page(page_num, layout_name, n_team_pages_seen)
    if layout is None:
        n_rows = detect_rows(arr)
        print(f"  Pag {page_num}: auto-detectado {n_rows} filas")
        skip_set = auto_detect_rows_and_skip(pil, n_rows)
    else:
        n_rows = layout["n_rows"]
        skip_set = layout.get("skip", set())
        print(f"  Pag {page_num}: layout '{layout_name}' -&gt; {n_rows} filas, skip: {skip_set}")

    cols_pts = compute_cols(page_w)
    rows_pts = compute_rows(page_h, n_rows)

    for r, (y0, y1) in enumerate(rows_pts):
        for c, (x0, x1) in enumerate(cols_pts):
            if (r, c) in skip_set:
                continue

            cell_img = crop_cell(pil, x0, y0, x1, y1)

            # OCR player name
            ocr_name = ocr.read_text_clean(cell_img)
            matched = fuzzy_match_name(ocr_name, squads[team])

            if matched:
                number = matched["number"]
                name = matched["name"]
                fname = f"{number}.webp"
                fpath = os.path.join(OUTPUT_BASE, team, fname)

                if dry_run:
                    print(f"    [{r},{c}] -&gt; {team}/{number}.webp  ({name})  OCR: '{ocr_name[:40]}'")
                else:
                    os.makedirs(os.path.join(OUTPUT_BASE, team), exist_ok=True)
                    _save_photo(cell_img, fpath)
                    print(f"    [{r},{c}] -&gt; {team}/{number}.webp  ({name})")
                stats.setdefault(team, 0)
                stats[team] += 1
                stats["_matched_"] += 1
            else:
                review_dir = os.path.join(OUTPUT_BASE, "_review", team)
                review_name = f"{team}_p{page_num}_r{r}_c{c}.webp"
                review_path = os.path.join(review_dir, review_name)
                if dry_run:
                    print(f"    [{r},{c}] -&gt; _review/  (sin match) OCR: '{ocr_name[:50]}'")
                else:
                    os.makedirs(review_dir, exist_ok=True)
                    _save_photo(cell_img, review_path)
                    print(f"    [{r},{c}] -&gt; _review/{review_name}  OCR: '{ocr_name[:50]}'")
                stats["_unmatched_"] += 1


def _save_photo(img: Image.Image, path: str):
    """Resize and save a sticker image as 300px-wide WebP."""
    w, h = img.size
    new_w = PHOTO_WIDTH
    new_h = int(h * (PHOTO_WIDTH / w))
    resized = img.resize((new_w, new_h), Image.LANCZOS)
    resized.save(path, "WEBP", quality=WEBP_QUALITY)


# ─── MANIFEST UPDATE ────────────────────────────────────────────────────────

def update_manifest():
    """Regenerate player-photos.ts manifest by scanning public/players/."""
    players_dir = "public/players"
    entries = []
    if os.path.isdir(players_dir):
        for team in sorted(os.listdir(players_dir)):
            team_dir = os.path.join(players_dir, team)
            if not os.path.isdir(team_dir) or team.startswith("_"):
                continue
            for fname in sorted(os.listdir(team_dir)):
                if fname.endswith(".webp"):
                    try:
                        num = int(fname.replace(".webp", ""))
                        entries.append(f"  '{team}-{num}'")
                    except ValueError:
                        pass

    manifest_path = "src/data/player-photos.ts"
    content = (
        "// Auto-generated by extract_panini.py / fetch-squad-assets.mjs\n"
        f"// {len(entries)} player photos\n"
        "export const PLAYER_PHOTOS = new ReadonlySet([\n"
        + ",\n".join(sorted(entries)) +
        "\n]);\n"
    )
    with open(manifest_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"\nManifest updated: {manifest_path} ({len(entries)} entries)")


# ─── CLI ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Extract player photos from Panini World Cup 2026 album PDF using OCR"
    )
    parser.add_argument("pdf", help="Path to the Panini PDF file")
    parser.add_argument("--team", "-t", help="Process only this team (3-letter FIFA code)")
    parser.add_argument("--pages", "-p", help="Process only these pages (e.g. '5-8')")
    parser.add_argument("--layout-name", default="standard",
                        choices=["standard", "single"],
                        help="Grid layout to use (default: standard)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Show what would be extracted without saving files")
    parser.add_argument("--no-ocr", action="store_true",
                        help="Skip OCR; use sequential numbering")
    parser.add_argument("--update-manifest", action="store_true",
                        help="Regenerate player-photos.ts manifest after extraction")
    parser.add_argument("--dpi", type=int, default=150,
                        help="DPI for page rendering (default: 150)")

    args = parser.parse_args()

    # Parse pages
    target_pages = None
    if args.pages:
        parts = args.pages.split("-")
        if len(parts) == 2:
            target_pages = (int(parts[0]), int(parts[1]))

    global DPI, SCALE
    DPI = args.dpi
    SCALE = DPI / 72.0

    # Load squad data
    print("Loading squad data...")
    squads = load_squads()
    print(f"  Loaded {len(squads)} teams\n")

    # Target team validation
    target_team = args.team.upper() if args.team else None
    if target_team and target_team not in squads:
        print(f"WARNING: Team '{target_team}' not found in squads. Available: {', '.join(sorted(squads.keys()))}")
        if not args.dry_run:
            sys.exit(1)

    # Initialize OCR
    print("Initializing OCR engine (EasyOCR)...")
    ocr = OCREngine()
    print("  OCR ready\n")

    # Process
    stats = process_panini_pdf(
        pdf_path=args.pdf,
        ocr=ocr,
        squads=squads,
        target_team=target_team,
        target_pages=target_pages,
        layout_name=args.layout_name,
        dry_run=args.dry_run,
    )

    # Summary
    print(f"\n{'='*60}")
    print("RESUMEN")
    print(f"{'='*60}")
    total_extracted = 0
    for team, count in sorted(stats.items()):
        if team.startswith("_"):
            continue
        print(f"  {team}: {count} fotos")
        total_extracted += count
    print(f"  ---")
    print(f"  Total matched: {stats.get('_matched_', 0)}")
    print(f"  Total unmatched (en _review/): {stats.get('_unmatched_', 0)}")
    print(f"  Páginas saltadas: {stats.get('_skipped_', 0)}")

    # Update manifest
    if args.update_manifest and not args.dry_run:
        update_manifest()
    elif args.update_manifest and args.dry_run:
        print("  (manifest update skipped in dry-run mode)")

    # Remind about review folder
    if stats.get("_unmatched_", 0) > 0:
        print(f"\n  Revisa las fotos sin match en: {OUTPUT_BASE}/_review/")


if __name__ == "__main__":
    main()
