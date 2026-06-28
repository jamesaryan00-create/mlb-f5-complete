#!/usr/bin/env python3
"""
Fetch actual probable pitchers from ESPN
"""

import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime

def get_espn_pitchers():
    """Scrape probable pitchers from ESPN MLB"""
    try:
        url = "https://www.espn.com/mlb/schedule"
        headers = {'User-Agent': 'Mozilla/5.0'}
        res = requests.get(url, headers=headers, timeout=10)
        
        if res.status_code == 200:
            soup = BeautifulSoup(res.content, 'html.parser')
            # Parse pitcher data from ESPN
            print("✓ ESPN data fetched")
            return soup
        else:
            print(f"✗ ESPN returned {res.status_code}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    return None

if __name__ == "__main__":
    print("Fetching probable pitchers from ESPN...")
    get_espn_pitchers()
