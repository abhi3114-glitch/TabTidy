from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, text):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Colors
    bg_color = "#1e1e2e"
    accent_color = "#89b4fa"
    text_color = "#ffffff"
    
    # Background circle
    draw.ellipse([0, 0, size, size], fill=bg_color)
    
    # Inner accent (simulating the SVG tabs look vaguely, simplifed)
    padding = size // 5
    draw.ellipse([padding, padding, size-padding, size-padding], outline=accent_color, width=max(1, size//20))
    
    # Text
    # Load default font potentially? Or just draw simple shapes if font fails
    try:
        # Try to use a system font or default
        font = ImageFont.truetype("arial.ttf", size // 2)
    except IOError:
        font = ImageFont.load_default()
        
    # Center text
    # In newer Pillow, textbbox is preferred, but let's stick to getbbox/size for compat if needed, 
    # actually textbbox is in newer PIL (10+). We have 10.0.0 (presumably based on "Python 3.12" being likely or "Python 3.14" which is very new).
    # "12.0.0" was the output for PIL version.
    
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    
    x = (size - text_width) / 2
    y = (size - text_height) / 2 - (text_height * 0.1) # slight adjustment
    
    draw.text((x, y), text, fill=text_color, font=font)
    
    return img

def main():
    if not os.path.exists('icons'):
        os.makedirs('icons')
        
    sizes = [16, 48, 128]
    for size in sizes:
        img = create_icon(size, "TT")
        img.save(f"icons/icon{size}.png")
        print(f"Created icons/icon{size}.png")

if __name__ == "__main__":
    main()
