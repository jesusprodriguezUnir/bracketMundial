import fitz
import sys

path = sys.argv[1]
doc = fitz.open(path)
for i, page in enumerate(doc):
    text = page.get_text("text")
    print(f"--- Página {i} ---")
    print(repr(text[:500]) if text else "(sin texto seleccionable)")
