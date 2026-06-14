"""
main_scraper.py — Offline HTML Data Extraction

This script iterates over all .html files in the HTML_DIR, parses them
using BeautifulSoup4, extracts vehicle details, and consolidates them
into a single raw_vehicles.json file.
"""

import json
import logging
from bs4 import BeautifulSoup
import config

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("scraper")

def parse_html_file(file_path) -> list:
    """Parses a single HTML file and extracts vehicle data."""
    logger.info(f"Parsing {file_path.name}...")
    
    with open(file_path, "r", encoding="utf-8") as f:
        html_content = f.read()
        
    soup = BeautifulSoup(html_content, "html.parser")
    
    # Selectors for both Mioto and Chungxe
    car_cards = soup.select(".item-car, .list-car, .car-box, .prod")
    
    logger.info(f"Found {len(car_cards)} vehicle cards in {file_path.name}")
    
    vehicles = []
    
    for car in car_cards:
        try:
            # Mioto Strategy
            mioto_name_el = car.select_one(".desc-name p")
            mioto_price_el = car.select_one(".price-special, .price")
            mioto_loc_el = car.select_one(".address p")
            
            # Chungxe Strategy
            chungxe_name_el = car.select_one(".info-vehicle h2 a, a.vehicle-image")
            chungxe_price_el = car.select_one(".info-price .price")
            chungxe_loc_els = car.select(".properties .col-6")
            chungxe_loc_el = chungxe_loc_els[-1] if chungxe_loc_els else None
            
            # Combine Strategies
            name_el = mioto_name_el or chungxe_name_el
            price_el = mioto_price_el or chungxe_price_el
            location_el = mioto_loc_el or chungxe_loc_el
            img_el = car.select_one("img")
            
            name = ""
            if name_el:
                name = name_el.get_text(strip=True)
                if not name and name_el.get("title"):
                    name = name_el.get("title")
                    
            if not name:
                continue # Skip if we can't even find a name
                
            price_text = price_el.get_text(strip=True) if price_el else "0"
            location = location_el.get_text(strip=True) if location_el else "Unknown Location"
            img_url = img_el.get("src") if img_el else ""
            
            # Clean name for Chungxe (sometimes it might have extra spaces)
            name = name.strip()
            
            # Basic Parse logic for brand/model/year
            parts = name.split()
            if not parts:
                continue
                
            brand = parts[0]
            model = " ".join(parts[1:3]) if len(parts) > 1 else "Unknown"
            year_str = parts[-1] if parts[-1].isdigit() else "2023"
            
            # Clean price (e.g. 800K -> 800000, or 500.000đ -> 500000)
            price_clean = price_text.upper().replace("K", "000").replace("Đ", "").replace("VND", "").replace(",", "").replace(".", "").replace("/NGÀY", "").strip()
            
            vehicle = {
                "source": config.TARGET_SOURCE_NAME,
                "name": name,
                "brand": brand,
                "model": model,
                "year": year_str,
                "original_price": price_clean,
                "location": location,
                "image_url": img_url,
                "seats": 5, 
                "transmission": "Auto",
                "fuel": "Gasoline"
            }
            vehicles.append(vehicle)
        except Exception as e:
            logger.warning(f"Error parsing a vehicle card: {e}")
            
    return vehicles

def main():
    logger.info("Starting Offline HTML Scraper...")
    
    if not config.HTML_DIR.exists() or not any(config.HTML_DIR.iterdir()):
        logger.error(f"No HTML files found in {config.HTML_DIR}. Please save Mioto search pages there.")
        return
        
    all_raw_data = []
    
    for html_file in config.HTML_DIR.glob("*.html"):
        scraped_data = parse_html_file(html_file)
        all_raw_data.extend(scraped_data)
        
    # Save to JSON
    with open(config.RAW_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(all_raw_data, f, ensure_ascii=False, indent=2)
        
    logger.info(f"Scraping complete. Saved {len(all_raw_data)} total records to {config.RAW_JSON_PATH}")

if __name__ == "__main__":
    main()
