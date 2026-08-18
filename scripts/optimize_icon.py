from pathlib import Path
from PIL import Image

source = Path('/home/ubuntu/webdev-static-assets/ambulance-captain-icon.png')
project = Path('/home/ubuntu/ambulance-captain/assets/images')
image = Image.open(source).convert('RGB').resize((1024, 1024), Image.Resampling.LANCZOS)
for name in ['icon.png', 'splash-icon.png', 'favicon.png', 'android-icon-foreground.png']:
    image.save(project / name, format='PNG', optimize=True, compress_level=9)
