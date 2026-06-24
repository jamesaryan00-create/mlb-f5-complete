#!/usr/bin/env python3
"""
Download FanGraphs data via public leaderboards
Alternative to Selenium - uses direct CSV export
"""

import requests
import pandas as pd
import os

def download_pitcher_stats(season=2026):
    """Download pitcher stats from FanGraphs public leaderboards"""
    print(f"📊 Downloading pitcher stats ({season})...")
    
    # FanGraphs leaderboard CSV export URL
    url = f"https://www.fangraphs.com/api/leaders/pitcher?season={season}"
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
        }
        
        res = requests.get(url, headers=headers, timeout=10)
        
        if res.status_code == 200:
            data = res.json()
            df = pd.DataFrame(data)
            
            print(f"✓ Downloaded {len(df)} pitchers")
            
            os.makedirs('data', exist_ok=True)
            df.to_csv('data/pitcher_stats.csv', index=False)
            print("✓ Saved to data/pitcher_stats.csv")
            
            return df
        else:
            print(f"✗ Error: HTTP {res.status_code}")
            return None
            
    except Exception as e:
        print(f"✗ Error downloading: {e}")
        print("\nAlternative: Manually download from:")
        print(f"  https://www.fangraphs.com/leaders/major-league/pitcher?Season={season}")
        print("  Then save as data/pitcher_stats.csv")
        return None

def main():
    print("FanGraphs Data Downloader")
    print("=" * 50)
    
    pitcher_df = download_pitcher_stats(season=2026)
    
    if pitcher_df is not None:
        print("\n✅ FanGraphs download complete!")
    else:
        print("\n⚠️  Download failed. Please manually download from FanGraphs.")

if __name__ == "__main__":
    main()
