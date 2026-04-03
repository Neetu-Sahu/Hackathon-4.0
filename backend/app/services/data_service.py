import pandas as pd
from pathlib import Path
import time

BASE_DIR = Path(__file__).resolve().parents[3]
DATA_PATH = BASE_DIR / "data" / "processed" / "district_master_dataset.csv"

# Cache for district data
_district_cache = None
_cache_timestamp = None
_cache_ttl = 600  # 10 minutes in seconds

def load_district_data():
    """Load district data with caching to avoid repeated CSV reads."""
    global _district_cache, _cache_timestamp
    
    # Check if cache is still valid
    if _district_cache is not None and _cache_timestamp is not None:
        if time.time() - _cache_timestamp < _cache_ttl:
            return _district_cache
    
    # Load fresh data
    df = pd.read_csv(DATA_PATH)
    df['district'] = df['district'].str.strip()
    
    # Update cache
    _district_cache = df
    _cache_timestamp = time.time()
    
    return df

def get_all_districts():
    df = load_district_data()
    df['district'] = df['district'].str.strip()
    return df.to_dict(orient="records")