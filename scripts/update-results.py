#!/usr/bin/env python3
"""
Check game results and update predictions_log.json
Run this daily to mark completed predictions as win/loss
"""

import json
import requests
import os
from datetime import datetime

def get_game_result(game_pk):
    """Fetch game result from MLB API"""
    try:
        url = f"https://statsapi.mlb.com/api/v1/game/{game_pk}"
        res = requests.get(url)
        data = res.json()
        
        status = data['gameData']['status']['abstractGameState']
        
        if status == 'Final':
            away_score = data['liveData']['linescore']['teams'][0]
            home_score = data['liveData']['linescore']['teams'][1]
            
            result = 'away_win' if away_score > home_score else 'home_win'
            
            return {
                'status': status,
                'result': result,
                'away_score': away_score,
                'home_score': home_score
            }
        else:
            return {
                'status': status,
                'result': None,
                'inning': data['liveData']['linescore'].get('currentInning', 0)
            }
    except Exception as e:
        print(f"Error fetching game {game_pk}: {e}")
        return None

def check_prediction_result(prediction, game_result):
    """Check if prediction was correct"""
    if game_result['result'] is None:
        return None
    
    # Extract away team from pick
    away_team = prediction['away_team']
    home_team = prediction['home_team']
    pick = prediction['pick']
    
    # Check if pick matches result
    if away_team in pick and game_result['result'] == 'away_win':
        return 'WIN'
    elif home_team in pick and game_result['result'] == 'home_win':
        return 'WIN'
    else:
        return 'LOSS'

def main():
    predictions_file = 'data/predictions_log.json'
    
    if not os.path.exists(predictions_file):
        print("No predictions file found")
        return
    
    # Load predictions
    with open(predictions_file, 'r') as f:
        predictions = json.load(f)
    
    print(f"Checking results for {len(predictions)} predictions...")
    
    updated = 0
    for pred in predictions:
        # Skip if already has result
        if 'result' in pred and pred['result']:
            continue
        
        game_pk = pred['game_pk']
        print(f"Checking game {game_pk}...", end=' ')
        
        game_result = get_game_result(game_pk)
        
        if game_result and game_result['result']:
            pred_result = check_prediction_result(pred, game_result)
            pred['result'] = pred_result
            pred['game_status'] = game_result['status']
            pred['away_score'] = game_result['away_score']
            pred['home_score'] = game_result['home_score']
            pred['checked_at'] = datetime.now().isoformat()
            
            print(f"{pred_result} ({game_result['away_score']}-{game_result['home_score']})")
            updated += 1
        else:
            if game_result:
                status = game_result.get('status', 'Unknown')
                inning = game_result.get('inning', 0)
                print(f"In Progress (Inning {inning})")
            else:
                print("Error fetching")
    
    # Save updated predictions
    with open(predictions_file, 'w') as f:
        json.dump(predictions, f, indent=2)
    
    print(f"\nUpdated {updated} predictions")

if __name__ == "__main__":
    main()
