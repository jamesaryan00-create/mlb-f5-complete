#!/usr/bin/env python3
"""
Fetch Vegas F5 moneyline data from The Odds API
"""

import requests
import json
import os
from datetime import datetime

class VegasLinesFetcher:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://api.the-odds-api.com/v4"
    
    def get_baseball_odds(self):
        """Get MLB F5 moneyline odds"""
        print("🎰 Fetching Vegas F5 lines...")
        
        try:
            url = f"{self.base_url}/sports/baseball_mlb/events"
            params = {
                'apiKey': self.api_key,
                'regions': 'us',
                'markets': 'moneyline',
                'oddsFormat': 'decimal'
            }
            
            res = requests.get(url, params=params)
            
            if res.status_code == 200:
                events = res.json()
                games = []
                
                for event in events:
                    # Only get upcoming games
                    if event['status'] == 'scheduled':
                        game = {
                            'game_id': event['id'],
                            'away_team': event['away_team'],
                            'home_team': event['home_team'],
                            'commence_time': event['commence_time'],
                            'bookmakers': []
                        }
                        
                        # Extract odds from each bookmaker
                        for bm in event.get('bookmakers', []):
                            for market in bm.get('markets', []):
                                if market['key'] == 'moneyline':
                                    game['bookmakers'].append({
                                        'name': bm['title'],
                                        'outcomes': market['outcomes']
                                    })
                        
                        games.append(game)
                
                print(f"✓ Fetched {len(games)} games")
                
                # Save to file
                os.makedirs('data', exist_ok=True)
                with open('data/vegas_lines.json', 'w') as f:
                    json.dump(games, f, indent=2)
                print("✓ Saved to data/vegas_lines.json")
                
                return games
            else:
                print(f"✗ Error: HTTP {res.status_code}")
                return None
        
        except Exception as e:
            print(f"✗ Error: {e}")
            return None
    
    def calculate_fair_probability(self, decimal_odds):
        """Convert decimal odds to implied probability"""
        return 1.0 / decimal_odds
    
    def compare_to_ml(self, ml_prob, bookmaker_odds):
        """Compare ML prediction to Vegas odds"""
        fair_prob = self.calculate_fair_probability(bookmaker_odds)
        
        if ml_prob > fair_prob:
            edge = ml_prob - fair_prob
            return {
                'edge': edge,
                'direction': 'BET',
                'ml_prob': ml_prob,
                'fair_prob': fair_prob
            }
        else:
            return {
                'edge': fair_prob - ml_prob,
                'direction': 'FADE',
                'ml_prob': ml_prob,
                'fair_prob': fair_prob
            }

def main():
    print("Vegas Lines Fetcher")
    print("=" * 50)
    
    api_key = os.environ.get('ODDS_API_KEY')
    if not api_key:
        print("✗ ODDS_API_KEY not set")
        print("Get free API key at: https://the-odds-api.com/")
        return
    
    fetcher = VegasLinesFetcher(api_key)
    games = fetcher.get_baseball_odds()
    
    if games:
        print(f"\n✅ Vegas lines fetched!")

if __name__ == "__main__":
    main()
