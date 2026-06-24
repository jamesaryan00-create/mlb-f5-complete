#!/usr/bin/env python3
"""
MLB F5 ML Pipeline
Trains XGBoost, Logistic Regression, and Random Forest models
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, log_loss, roc_auc_score
import pickle
import json
import warnings
warnings.filterwarnings('ignore')

class F5MLPipeline:
    def __init__(self):
        self.models = {}
        self.scaler = StandardScaler()
        self.feature_names = []
        
    def fetch_historical_data(self):
        """Generate synthetic historical F5 data"""
        print("📊 Generating historical F5 training data...")
        
        np.random.seed(42)
        n_games = 500
        
        data = {
            'away_pitcher_era': np.random.normal(3.8, 0.8, n_games),
            'home_pitcher_era': np.random.normal(3.8, 0.8, n_games),
            'away_pitcher_whip': np.random.normal(1.15, 0.2, n_games),
            'home_pitcher_whip': np.random.normal(1.15, 0.2, n_games),
            'away_team_f5_win_pct': np.random.normal(0.50, 0.08, n_games),
            'home_team_f5_win_pct': np.random.normal(0.50, 0.08, n_games),
            'temperature': np.random.normal(72, 8, n_games),
            'wind_speed': np.random.normal(8, 4, n_games),
            'altitude': np.random.choice([0, 5280], n_games),
            'away_rest_days': np.random.randint(0, 4, n_games),
            'home_rest_days': np.random.randint(0, 4, n_games),
        }
        
        df = pd.DataFrame(data)
        
        era_diff = df['home_pitcher_era'] - df['away_pitcher_era']
        base_prob = 0.5 + (era_diff * 0.15) + (df['away_team_f5_win_pct'] - 0.5) * 0.2
        base_prob = np.clip(base_prob, 0.2, 0.8)
        
        df['f5_away_win'] = (np.random.random(n_games) < base_prob).astype(int)
        
        print(f"✓ Generated {n_games} historical games")
        return df
    
    def engineer_features(self, df):
        """Create ML features"""
        print("🔧 Engineering features...")
        
        df['era_difference'] = df['home_pitcher_era'] - df['away_pitcher_era']
        df['whip_difference'] = df['home_pitcher_whip'] - df['away_pitcher_whip']
        df['team_form_advantage'] = df['away_team_f5_win_pct'] - df['home_team_f5_win_pct']
        df['total_rest_days'] = df['away_rest_days'] + df['home_rest_days']
        df['rest_advantage'] = df['away_rest_days'] - df['home_rest_days']
        df['weather_score'] = (72 - np.abs(df['temperature'] - 72)) + (12 - df['wind_speed'])
        df['is_high_altitude'] = (df['altitude'] > 0).astype(int)
        df['pitcher_form_interaction'] = df['era_difference'] * df['team_form_advantage']
        
        feature_cols = [col for col in df.columns if col not in ['f5_away_win']]
        self.feature_names = feature_cols
        
        print(f"✓ Created {len(feature_cols)} features")
        return df, feature_cols
    
    def train_models(self, df, feature_cols):
        """Train all three models"""
        print("🤖 Training ML models...")
        
        X = df[feature_cols]
        y = df['f5_away_win']
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        results = {}
        
        # XGBoost
        print("  Training XGBoost...")
        xgb_model = xgb.XGBClassifier(n_estimators=100, max_depth=5, learning_rate=0.1, random_state=42, eval_metric='logloss')
        xgb_model.fit(X_train, y_train)
        xgb_pred_proba = xgb_model.predict_proba(X_test)[:, 1]
        
        self.models['xgboost'] = xgb_model
        results['xgboost'] = {
            'accuracy': accuracy_score(y_test, xgb_model.predict(X_test)),
            'auc': roc_auc_score(y_test, xgb_pred_proba),
            'logloss': log_loss(y_test, xgb_pred_proba)
        }
        print(f"    ✓ Accuracy: {results['xgboost']['accuracy']:.1%}")
        
        # Logistic Regression
        print("  Training Logistic Regression...")
        lr_model = LogisticRegression(max_iter=1000, random_state=42)
        lr_model.fit(X_train_scaled, y_train)
        lr_pred_proba = lr_model.predict_proba(X_test_scaled)[:, 1]
        
        self.models['logistic_regression'] = lr_model
        results['logistic_regression'] = {
            'accuracy': accuracy_score(y_test, lr_model.predict(X_test_scaled)),
            'auc': roc_auc_score(y_test, lr_pred_proba),
            'logloss': log_loss(y_test, lr_pred_proba)
        }
        print(f"    ✓ Accuracy: {results['logistic_regression']['accuracy']:.1%}")
        
        # Random Forest
        print("  Training Random Forest...")
        rf_model = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42, n_jobs=-1)
        rf_model.fit(X_train, y_train)
        rf_pred_proba = rf_model.predict_proba(X_test)[:, 1]
        
        self.models['random_forest'] = rf_model
        results['random_forest'] = {
            'accuracy': accuracy_score(y_test, rf_model.predict(X_test)),
            'auc': roc_auc_score(y_test, rf_pred_proba),
            'logloss': log_loss(y_test, rf_pred_proba)
        }
        print(f"    ✓ Accuracy: {results['random_forest']['accuracy']:.1%}")
        
        return results
    
    def save_models(self):
        """Save trained models"""
        print("\n💾 Saving models...")
        
        for name, model in self.models.items():
            with open(f'models/{name}_model.pkl', 'wb') as f:
                pickle.dump(model, f)
        
        with open('models/scaler.pkl', 'wb') as f:
            pickle.dump(self.scaler, f)
        
        with open('models/feature_names.json', 'w') as f:
            json.dump(self.feature_names, f)
        
        print("✓ Models saved to models/")

def main():
    pipeline = F5MLPipeline()
    
    df = pipeline.fetch_historical_data()
    df, feature_cols = pipeline.engineer_features(df)
    results = pipeline.train_models(df, feature_cols)
    pipeline.save_models()
    
    print("\n✅ ML Pipeline Complete!")

if __name__ == "__main__":
    main()
