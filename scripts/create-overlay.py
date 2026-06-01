from PIL import Image, ImageDraw, ImageFont

img = Image.new('RGBA', (1080, 1920), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

try:
    font_big = ImageFont.truetype('C:/Windows/Fonts/impact.ttf', 52)
    font_small = ImageFont.truetype('C:/Windows/Fonts/impact.ttf', 36)
    font_tiny = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 22)
    font_sub = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 18)
except Exception as e:
    print(f'Font error: {e}')
    font_big = ImageFont.load_default()
    font_small = ImageFont.load_default()
    font_tiny = ImageFont.load_default()
    font_sub = ImageFont.load_default()

# Top text
top_text = 'Mundial 2026'
tw = draw.textlength(top_text, font=font_tiny)
draw.text(((1080 - tw) / 2, 60), top_text, fill=(255, 255, 255, 200), font=font_tiny)

# 'PREDICE AL CAMPEON' (yellow)
text1 = 'PREDICE AL CAMPEON'
tw1 = draw.textlength(text1, font=font_small)
draw.text(((1080 - tw1) / 2, 1920 - 210), text1, fill=(240, 176, 33, 255), font=font_small)

# 'bracketmundial.com' (white, big)
text2 = 'bracketmundial.com'
tw2 = draw.textlength(text2, font=font_big)
draw.text(((1080 - tw2) / 2, 1920 - 145), text2, fill=(255, 255, 255, 255), font=font_big)

# Footer line
sub = 'Juega gratis - Predice el Mundial 2026'
sw = draw.textlength(sub, font=font_sub)
draw.text(((1080 - sw) / 2, 1920 - 80), sub, fill=(255, 255, 255, 150), font=font_sub)

img.save('recordings/overlay.png', 'PNG')
print(f'Overlay created: {img.size}')
