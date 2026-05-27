import fitz

doc = fitz.open(r'docs/HOLANDA.pdf')
for i in range(len(doc)):
    page = doc[i]
    imgs = page.get_images(full=True)
    large = 0
    total_small = 0
    for img in imgs:
        xref = img[0]
        info = doc.extract_image(xref)
        w, h = info['width'], info['height']
        if w > 1000 or h > 1000:
            large += 1
            print(f'  LARGE img[{xref}]: {w}x{h} ext={info["ext"]} bytes={len(info["image"])}')
        else:
            total_small += 1
    print(f'Page {i}: {len(imgs)} total, {large} large, {total_small} small')

# Also check is_full_page_image logic
p0 = doc[0]
imgs = p0.get_images(full=True)
print(f'\nis_full_page_image check:')
print(f'  len(imgs) == 1? {len(imgs) == 1}')
print(f'  is_two_image_spread check: large imgs = {sum(1 for img in imgs if doc.extract_image(img[0])["width"] > 1000)}')
