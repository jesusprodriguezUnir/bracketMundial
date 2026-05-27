import fitz
import sys

path = sys.argv[1]
page_num = int(sys.argv[2]) if len(sys.argv) > 2 else 0
out = sys.argv[3] if len(sys.argv) > 3 else 'preview.png'
scale = float(sys.argv[4]) if len(sys.argv) > 4 else 0.3

doc = fitz.open(path)
page = doc[page_num]
mat = fitz.Matrix(scale, scale)
pix = page.get_pixmap(matrix=mat)
pix.save(out)
print(f'Guardado {out} ({pix.width}x{pix.height}) de página {page_num} (original: {page.rect.width:.0f}x{page.rect.height:.0f} pts)')
