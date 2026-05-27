import fitz
import sys

path = sys.argv[1] if len(sys.argv) > 1 else r'd:\Personal\bracketMundial\docs\HOLANDA.pdf'
doc = fitz.open(path)
print(f'Páginas: {len(doc)}')
for i, page in enumerate(doc):
    imgs = page.get_images(full=True)
    print(f'  Página {i}: {len(imgs)} imágenes')
    for img in imgs[:5]:
        xref = img[0]
        info = doc.extract_image(xref)
        print(f'    xref={xref} ext={info["ext"]} size={info["width"]}x{info["height"]} bytes={len(info["image"])}')
