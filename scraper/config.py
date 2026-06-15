"""
config.py — Configuration for LuxeWay Vehicle Scraper

This file centralizes all configurations, avoiding hardcoded values in the scraper scripts.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file (if exists)
load_dotenv()

# Base directories
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
ASSETS_IMAGE_DIR = BASE_DIR.parent / "src" / "Front_end" / "public" / "images" / "cars"

# Ensure directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
ASSETS_IMAGE_DIR.mkdir(parents=True, exist_ok=True)

# File paths
HTML_DIR = DATA_DIR / "html_sources"
HTML_DIR.mkdir(parents=True, exist_ok=True)

RAW_JSON_PATH = DATA_DIR / "raw_vehicles.json"
CLEANED_JSON_PATH = DATA_DIR / "cleaned_vehicles.json"
BACKEND_RESOURCES_DIR = BASE_DIR.parent / "src" / "Back_end" / "src" / "main" / "resources"
SQL_SEED_PATH = BACKEND_RESOURCES_DIR / "seed_vehicles.sql"

# Target Settings
TARGET_SOURCE_NAME = "MIOTO"

# Scraping Behavior
DOWNLOAD_IMAGES = os.getenv("DOWNLOAD_IMAGES", "true").lower() == "true"

# SQL Server Configuration (for MERGE script generation)
DB_SCHEMA = "dbo"
