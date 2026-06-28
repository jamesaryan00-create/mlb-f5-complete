#!/usr/bin/env python3
import requests
import csv
from datetime import datetime
import os
import ssl

# Bypass SSL
requests.packages.urllib3.disable_warnings()
ssl._create_default_https_context = ssl._create_unverified_context

API_KEY = "1f82d808b85834a1a4608962c3c9bc0f"

def get_vegas_lines():
    try:
        url = f"https://api.the-odds.com/v4/sports/baseball_mlb/odds?apiKey={API_KEY}&regions=us&markets=h2h&oddsFormat=american"
        res = requests.get(url, verify=False, timeout=10)
        print(f"Response status: {res.status_code}")
        if res.status_code == 200:
            return res.json()
        else:
            print(f"API Error: {res.text[:200]}")
            return None
    except Exception as e:
        print(f"Error: {str(e)[:100]}")
        return None

def save_lines(data):
    if not data or 'events' not in data:
        print("No events in response")
        return False
    
    csv_path = 'data/vegas_lines.csv'
    
    with open(csv_path, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['date', 'away_team', 'home_team', 'away_line', 'home_line'])
        
        for event in data['events'][:16]:
            writer.writerow([
                datetime.now().strftime('%Y-%m-%d'),
                event.get('away_team', 'N/A'),
                event.get('home_team', 'N/A'),
                'TBA',
                'TBA'
            ])
    
    print(f"✓ Saved {min(16, len(data['events']))} games")
    return True

if __name__ == "__main__":
    print("Fetching Vegas lines...")
    data = get_vegas_lines()
    if data:
        save_lines(data)
    else:
        print("Creating empty CSV...")
        with open('data/vegas_lines.csv', 'w') as f:
            f.write('date,away_team,home_team,away_line,home_line\n')
