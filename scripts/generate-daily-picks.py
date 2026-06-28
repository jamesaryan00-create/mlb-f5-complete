#!/usr/bin/env python3
import requests
import json
import csv
from datetime import datetime

def get_today_games():
    try:
        res = requests.get('https://statsapi.mlb.com/api/v1/schedule?sportId=1', verify=False)
        if res.status_code == 200:
            data = res.json()
            if data.get('dates') and data['dates'][0].get('games'):
                return data['dates'][0]['games']
    except:
        pass
    return []

def load_pitcher_stats():
    stats = {}
    try:
        with open('data/pitcher_stats.csv', 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                name = row['Name'].strip()
                stats[name.lower()] = {
                    'era': float(row['ERA']) if row.get('ERA') else 3.8,
                    'whip': float(row['BB/9']) if row.get('BB/9') else 1.15,
                    'k9': float(row['K/9']) if row.get('K/9') else 9.0
                }
    except:
        pass
    return stats

def get_ml_prediction(away_era, home_era, away_whip, home_whip):
    try:
        res = requests.post('http://localhost:5000/predict', json={
            'away_pitcher_era': away_era,
            'home_pitcher_era': home_era,
            'away_pitcher_whip': away_whip,
            'home_pitcher_whip': home_whip,
            'away_team_f5_win_pct': 0.50,
            'home_team_f5_win_pct': 0.50,
            'temperature': 72,
            'wind_speed': 8,
            'altitude': 0,
            'away_rest_days': 1,
            'home_rest_days': 1,
        }, timeout=5)
        if res.status_code == 200:
            return res.json()
    except:
        pass
    return None

def generate_picks():
    print("🤖 Generating daily ML picks...")
    
    games = get_today_games()
    print(f"Found {len(games)} games today")
    
    if not games:
        print("No games found")
        return
    
    pitcher_stats = load_pitcher_stats()
    picks = []
    
    for i, game in enumerate(games[:16]):
        away_team = game['teams']['away']['team']['name']
        home_team = game['teams']['home']['team']['name']
        
        away_pitcher = game['teams']['away'].get('probablePitcher', {}).get('fullName', 'TBA')
        home_pitcher = game['teams']['home'].get('probablePitcher', {}).get('fullName', 'TBA')
        
        print(f"Game {i+1}: {away_team} @ {home_team}")
        print(f"  Pitchers: {away_pitcher} vs {home_pitcher}")
        
        if away_pitcher == 'TBA' or home_pitcher == 'TBA':
            print(f"  Skipping - probable pitchers not set")
            continue
        
        away_stats = pitcher_stats.get(away_pitcher.lower(), {'era': 3.8, 'whip': 1.15, 'k9': 9.0})
        home_stats = pitcher_stats.get(home_pitcher.lower(), {'era': 3.8, 'whip': 1.15, 'k9': 9.0})
        
        print(f"  Stats: {away_pitcher} ERA {away_stats['era']:.2f} vs {home_pitcher} ERA {home_stats['era']:.2f}")
        
        pred = get_ml_prediction(
            away_stats['era'], home_stats['era'],
            away_stats['whip'], home_stats['whip']
        )
        
        if not pred:
            print(f"  No prediction")
            continue
        
        confidence = pred.get('confidence', 5)
        print(f"  Prediction: {pred['pick']} (Confidence: {confidence:.1f}/10)")
        
        # Lower threshold to 5.0 for testing
        if confidence >= 5.0:
            pick = {
                'game_pk': game['gamePk'],
                'away_team': away_team,
                'home_team': home_team,
                'pick': pred['pick'],
                'confidence': confidence,
                'ensemble_prob': pred.get('ensemble_prob', 0.5),
                'away_pitcher': away_pitcher,
                'home_pitcher': home_pitcher,
                'away_era': away_stats['era'],
                'home_era': home_stats['era'],
                'timestamp': datetime.now().isoformat()
            }
            picks.append(pick)
    
    if picks:
        with open('data/daily_picks.json', 'w') as f:
            json.dump(picks, f, indent=2)
        
        print(f"\n📊 Generated {len(picks)} picks today!")
    else:
        print("\n❌ No picks generated (probable pitchers likely not set yet)")

if __name__ == "__main__":
    generate_picks()
