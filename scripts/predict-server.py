#!/usr/bin/env python3
from flask import Flask, request, jsonify
import pickle
import json
import pandas as pd
import numpy as np
import os
import sys

app = Flask(__name__)

models = {}
scaler = None
feature_names = []
pitcher_data = None

def load_models():
    global models, scaler, feature_names, pitcher_data
    
    print("Loading models...", file=sys.stderr)
    
    for name in ['xgboost', 'logistic_regression', 'random_forest']:
        try:
            with open(f'models/{name}_model.pkl', 'rb') as f:
                models[name] = pickle.load(f)
            print(f"✓ Loaded {name}", file=sys.stderr)
        except Exception as e:
            print(f"✗ Error loading {name}: {e}", file=sys.stderr)
    
    try:
        with open('models/scaler.pkl', 'rb') as f:
            scaler = pickle.load(f)
        print("✓ Loaded scaler", file=sys.stderr)
    except Exception as e:
        print(f"✗ Error loading scaler: {e}", file=sys.stderr)
    
    try:
        with open('models/feature_names.json', 'r') as f:
            feature_names = json.load(f)
        print(f"✓ Loaded {len(feature_names)} features", file=sys.stderr)
    except Exception as e:
        print(f"✗ Error loading features: {e}", file=sys.stderr)
    
    try:
        pitcher_data = pd.read_csv('data/pitcher_stats.csv')
        print(f"✓ Loaded {len(pitcher_data)} pitchers", file=sys.stderr)
    except Exception as e:
        print(f"✗ Error loading pitchers: {e}", file=sys.stderr)

def get_pitcher_era(name):
    global pitcher_data
    if pitcher_data is None:
        return 3.8
    
    try:
        row = pitcher_data[pitcher_data['Name'].str.contains(name, case=False, na=False)]
        if len(row) > 0:
            era = row.iloc[0]['ERA']
            return float(era) if not pd.isna(era) else 3.8
    except:
        pass
    
    return 3.8

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        
        away_era = get_pitcher_era(data.get('away_pitcher_era', 3.8))
        home_era = get_pitcher_era(data.get('home_pitcher_era', 3.8))
        
        # Create 19 features matching training
        features = np.array([[
            away_era,
            home_era,
            data.get('away_pitcher_whip', 1.15),
            data.get('home_pitcher_whip', 1.15),
            data.get('away_team_f5_win_pct', 0.50),
            data.get('home_team_f5_win_pct', 0.50),
            data.get('temperature', 72),
            data.get('wind_speed', 8),
            data.get('altitude', 0),
            data.get('away_rest_days', 1),
            data.get('home_rest_days', 1),
            home_era - away_era,  # era_difference
            data.get('home_pitcher_whip', 1.15) - data.get('away_pitcher_whip', 1.15),  # whip_difference
            data.get('away_team_f5_win_pct', 0.50) - data.get('home_team_f5_win_pct', 0.50),  # team_form_advantage
            data.get('away_rest_days', 1) + data.get('home_rest_days', 1),  # total_rest_days
            data.get('away_rest_days', 1) - data.get('home_rest_days', 1),  # rest_advantage
            (72 - abs(data.get('temperature', 72) - 72)) + (12 - data.get('wind_speed', 8)),  # weather_score
            data.get('altitude', 0) > 0,  # is_high_altitude
            (home_era - away_era) * (data.get('away_team_f5_win_pct', 0.50) - data.get('home_team_f5_win_pct', 0.50))  # pitcher_form_interaction
        ]])
        
        predictions = {}
        
        if 'xgboost' in models:
            xgb_prob = models['xgboost'].predict_proba(features)[0][1]
            predictions['xgb'] = float(xgb_prob)
        
        if 'logistic_regression' in models and scaler:
            features_scaled = scaler.transform(features)
            lr_prob = models['logistic_regression'].predict_proba(features_scaled)[0][1]
            predictions['lr'] = float(lr_prob)
        
        if 'random_forest' in models:
            rf_prob = models['random_forest'].predict_proba(features)[0][1]
            predictions['rf'] = float(rf_prob)
        
        probs = list(predictions.values())
        ensemble = np.mean(probs) if probs else 0.5
        
        return jsonify({
            'xgb_prob': predictions.get('xgb', 0.5),
            'lr_prob': predictions.get('lr', 0.5),
            'rf_prob': predictions.get('rf', 0.5),
            'ensemble_prob': float(ensemble),
            'confidence': min(10, max(1, 5 + (ensemble - 0.5) * 20))
        })
        
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    load_models()
    app.run(host='0.0.0.0', port=5000, debug=False)
