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

# Wait, previously I replaced '/images/(cars|motorbikes)/[^']+', but now it's '/src/image/[^']+'
def replacer(match):
    path = match.group(0) # e.g. '/src/image/toyota_vios.jpg'
    filename = path.split('/')[-1]
    
    # Try to find a match in the image folder
    if filename.lower() in image_map:
        return f"'/image/{image_map[filename.lower()]}'"
    
    for img in images:
        if filename.split('.')[0].lower().replace('_', '').replace(' ', '') in img.lower().replace('_', '').replace(' ', ''):
            return f"'/image/{img}'"
    return path.replace('/src/image/', '/image/')

content = re.sub(r"'/src/image/[^']+'", replacer, content)

with open(sql_file, 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated import-data.sql with /image/ path')
