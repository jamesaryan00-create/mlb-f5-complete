#!/usr/bin/env python3
"""
ML Prediction Server
Loads trained models and makes predictions
"""

from flask import Flask, request, jsonify
import pickle
import json
import pandas as pd
import numpy as np
import os

app = Flask(__name__)

# Load models
models = {}
scaler = None
feature_names = []

def load_models():
    global models, scaler, feature_names
    
    print("Loading models...")
    
    for name in ['xgboost', 'logistic_regression', 'random_forest']:
        try:
            with open(f'models/{name}_model.pkl', 'rb') as f:
                models[name] = pickle.load(f)
            print(f"✓ Loaded {name}")
        except Exception as e:
            print(f"✗ Error loading {name}: {e}")
    
    try:
        with open('models/scaler.pkl', 'rb') as f:
            scaler = pickle.load(f)
        print("✓ Loaded scaler")
    except Exception as e:
        print(f"✗ Error loading scaler: {e}")
    
    try:
        with open('models/feature_names.json', 'r') as f:
            feature_names = json.load(f)
        print(f"✓ Loaded {len(feature_names)} features")
    except Exception as e:
        print(f"✗ Error loading features: {e}")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        
        # Create feature vector
        features = np.array([[
            data.get('away_pitcher_era', 3.8),
            data.get('home_pitcher_era', 3.8),
            data.get('away_pitcher_whip', 1.15),
            data.get('home_pitcher_whip', 1.15),
            data.get('away_team_f5_win_pct', 0.50),
            data.get('home_team_f5_win_pct', 0.50),
            data.get('temperature', 72),
            data.get('wind_speed', 8),
            data.get('altitude', 0),
            data.get('away_rest_days', 1),
            data.get('home_rest_days', 1),
        ]])
        
        # Get predictions from each model
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
        
        # Ensemble
        probs = list(predictions.values())
        ensemble = np.mean(probs)
        
        return jsonify({
            'xgb_prob': predictions.get('xgb', 0.5),
            'lr_prob': predictions.get('lr', 0.5),
            'rf_prob': predictions.get('rf', 0.5),
            'ensemble_prob': float(ensemble),
            'confidence': min(10, max(1, 5 + (ensemble - 0.5) * 20))
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'models_loaded': len(models)})

if __name__ == '__main__':
    load_models()
    app.run(port=5000, debug=False)
