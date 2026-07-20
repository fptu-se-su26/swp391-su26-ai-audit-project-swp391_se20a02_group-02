import os
import re

images_dir = 'src/Front_end/src/image'
sql_file = 'import-data.sql'

# Get all images in the directory
images = os.listdir(images_dir)
image_map = {img.lower(): img for img in images}

# Read sql file
with open(sql_file, 'r', encoding='utf-8') as f:
    content = f.read()

def replacer(match):
    path = match.group(0) # e.g. '/images/cars/toyota_vios.jpg'
    filename = path.split('/')[-1]
    
    # Try to find a match in the image folder
    # Exact match
    if filename.lower() in image_map:
        return f"'/src/image/{image_map[filename.lower()]}'"
    
    # Try removing extension or matching car name
    for img in images:
        if filename.split('.')[0].lower().replace('_', '').replace(' ', '') in img.lower().replace('_', '').replace(' ', ''):
            return f"'/src/image/{img}'"
    return path

# We need to replace thumbnail_url in INSERT INTO vehicles
content = re.sub(r"'/images/(cars|motorbikes)/[^']+'", replacer, content)

with open(sql_file, 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated import-data.sql with images')
