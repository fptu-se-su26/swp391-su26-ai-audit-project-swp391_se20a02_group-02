"""
data_cleaner.py — Validate, Clean, Deduplicate, and Download Images

Pipeline step 2:
1. Reads raw_vehicles.json
2. Validates essential attributes
3. Deduplicates using composite key (brand+model+year+source)
4. Downloads images locally
5. Writes cleaned_vehicles.json
"""

import json
import logging
import re
import urllib.request
from pathlib import Path
from urllib.parse import urlparse

import config

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("cleaner")

def validate_vehicle(v: dict) -> bool:
    """Validates if a vehicle meets minimum data quality requirements."""
    if not v.get("name") or v.get("name") == "Unknown Vehicle":
        return False
    if not v.get("brand") or v.get("brand") == "Unknown":
        return False
    
    # Extract numeric price
    price_str = re.sub(r'\D', '', str(v.get("original_price", "0")))
    price = int(price_str) if price_str else 0
    if price <= 0:
        return False
        
    return True

def download_image(url: str, filename: str) -> str:
    """Downloads an image and returns the local relative path."""
    if not config.DOWNLOAD_IMAGES or not url:
        return ""
        
    try:
        # Simple extension extraction
        parsed = urlparse(url)
        ext = Path(parsed.path).suffix
        if not ext:
            ext = ".jpg"
            
        safe_filename = f"{filename}{ext}"
        local_path = config.ASSETS_IMAGE_DIR / safe_filename
        
        # In a real app, use requests with timeouts and User-Agents
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response, open(local_path, 'wb') as out_file:
            out_file.write(response.read())
            
        # Return path relative to the frontend public dir
        return f"/images/cars/{safe_filename}"
    except Exception as e:
        logger.warning(f"Failed to download image {url}: {e}")
        return ""

def clean_data():
    if not config.RAW_JSON_PATH.exists():
        logger.error(f"Raw data file not found: {config.RAW_JSON_PATH}")
        return

    with open(config.RAW_JSON_PATH, "r", encoding="utf-8") as f:
        raw_data = json.load(f)

    logger.info(f"Loaded {len(raw_data)} raw records.")

    cleaned_data = []
    seen_keys = set()

    for v in raw_data:
        if not validate_vehicle(v):
            continue

        # Deduplication using Composite Key
        # Key: brand + model + year + source
        comp_key = f"{v.get('brand')}_{v.get('model')}_{v.get('year')}_{v.get('source')}".lower()
        
        if comp_key in seen_keys:
            continue
            
        seen_keys.add(comp_key)
        
        # Clean price
        price_str = re.sub(r'\D', '', str(v.get("original_price", "0")))
        v["base_price"] = int(price_str) if price_str else 0
        
        # Download Image
        if v.get("image_url"):
            img_filename = f"{v.get('source')}_{comp_key}"
            local_url = download_image(v.get("image_url"), img_filename)
            v["local_image_url"] = local_url

        cleaned_data.append(v)

    with open(config.CLEANED_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(cleaned_data, f, ensure_ascii=False, indent=2)

    logger.info(f"Cleaning complete. Retained {len(cleaned_data)} valid unique records.")

if __name__ == "__main__":
    clean_data()
