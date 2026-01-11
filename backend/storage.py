import json
import os
from typing import Optional, Dict, List, Any


WARDROBE_FILE = "wardrobe.json"
PERSONAL_INFO_FILE = "personal_info.json"


def init_storage():
    """Initialize storage files if they don't exist"""
    if not os.path.exists(WARDROBE_FILE):
        with open(WARDROBE_FILE, 'w') as f:
            json.dump({"clothes": []}, f, indent=2)
    
    if not os.path.exists(PERSONAL_INFO_FILE):
        with open(PERSONAL_INFO_FILE, 'w') as f:
            json.dump({}, f, indent=2)


def load_clothes() -> list[dict]:
    """Load all clothing items from JSON file"""
    try:
        if not os.path.exists(WARDROBE_FILE):
            init_storage()
        with open(WARDROBE_FILE, 'r') as f:
            data = json.load(f)
            return data.get("clothes", [])
    except (FileNotFoundError, json.JSONDecodeError):
        init_storage()
        return []


def save_clothes(clothes: list[dict]):
    """Save clothing items to JSON file"""
    with open(WARDROBE_FILE, 'w') as f:
        json.dump({"clothes": clothes}, f, indent=2)


def load_personal_info() -> dict:
    """Load personal info from JSON file"""
    try:
        if not os.path.exists(PERSONAL_INFO_FILE):
            init_storage()
        with open(PERSONAL_INFO_FILE, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        init_storage()
        return {}


def save_personal_info(personal_info: dict):
    """Save personal info to JSON file"""
    with open(PERSONAL_INFO_FILE, 'w') as f:
        json.dump(personal_info, f, indent=2)


def add_clothing_item(item: dict) -> dict:
    """Add a new clothing item and return it with generated ID"""
    clothes = load_clothes()
    if not item.get("id"):
        item["id"] = f"{len(clothes)}_{hash(item.get('name', '')) % 10000}"
    clothes.append(item)
    save_clothes(clothes)
    return item


def get_clothing_item(item_id: str) -> Optional[dict]:
    """Get a specific clothing item by ID"""
    clothes = load_clothes()
    for item in clothes:
        if item.get("id") == item_id:
            return item
    return None


def delete_clothing_item(item_id: str) -> bool:
    """Delete a clothing item by ID"""
    clothes = load_clothes()
    original_count = len(clothes)
    clothes = [item for item in clothes if item.get("id") != item_id]
    if len(clothes) < original_count:
        save_clothes(clothes)
        return True
    return False


def save_wardrobe_data(wardrobe_data: dict):
    """Save complete wardrobe data (import)"""
    if "clothes" in wardrobe_data:
        save_clothes(wardrobe_data["clothes"])
    if "personalInfo" in wardrobe_data:
        save_personal_info(wardrobe_data["personalInfo"])


def load_wardrobe_data() -> Dict[str, Any]:
    """Load complete wardrobe data (export)"""
    clothes = load_clothes()
    personal_info = load_personal_info()
    return {
        "clothes": clothes,
        "personalInfo": personal_info
    }
