#!/usr/bin/env python3
"""
Generate sample FanGraphs data for testing
In production, replace with actual FanGraphs data
"""

import pandas as pd
import numpy as np
import os

def generate_pitcher_stats():
    """Generate realistic pitcher stats"""
    print("📊 Generating sample pitcher stats...")
    
    np.random.seed(42)
    n_pitchers = 100
    
    data = {
        'Name': [f'Pitcher {i}' for i in range(n_pitchers)],
        'Team': np.random.choice(['NYY', 'LAD', 'HOU', 'BOS', 'ATL', 'NYM', 'WSH', 'PHI'], n_pitchers),
        'ERA': np.random.normal(3.8, 0.8, n_pitchers),
        'FIP': np.random.normal(3.7, 0.8, n_pitchers),
        'xFIP': np.random.normal(3.6, 0.8, n_pitchers),
        'WHIP': np.random.normal(1.15, 0.2, n_pitchers),
        'K/9': np.random.normal(10.2, 2.0, n_pitchers),
        'BB/9': np.random.normal(2.8, 0.8, n_pitchers),
        'WAR': np.random.normal(2.0, 1.5, n_pitchers),
    }
    
    df = pd.DataFrame(data)
    df = df[df['ERA'] > 0]  # Remove negative values
    
    os.makedirs('data', exist_ok=True)
    df.to_csv('data/pitcher_stats.csv', index=False)
    
    print(f"✓ Generated {len(df)} pitchers")
    print(f"✓ Saved to data/pitcher_stats.csv")
    
    return df

def generate_team_splits():
    """Generate realistic team splits"""
    print("\n🏟️  Generating sample team splits...")
    
    teams = ['NYY', 'LAD', 'HOU', 'BOS', 'ATL', 'NYM', 'WSH', 'PHI', 'SEA', 'OAK']
    
    data = {
        'Team': teams,
        'G': [162] * len(teams),
        'PA': [6200] * len(teams),
        'R': [700 + np.random.randint(-50, 50) for _ in teams],
        'H': [1500 + np.random.randint(-50, 50) for _ in teams],
        'AVG': [np.random.normal(0.260, 0.020) for _ in teams],
        'OBP': [np.random.normal(0.330, 0.025) for _ in teams],
        'SLG': [np.random.normal(0.420, 0.030) for _ in teams],
        'OPS': [np.random.normal(0.750, 0.050) for _ in teams],
    }
    
    df = pd.DataFrame(data)
    
    df.to_csv('data/team_splits.csv', index=False)
    
    print(f"✓ Generated {len(df)} teams")
    print(f"✓ Saved to data/team_splits.csv")
    
    return df

def main():
    print("FanGraphs Data Generator")
    print("=" * 50)
    
    pitcher_df = generate_pitcher_stats()
    team_df = generate_team_splits()
    
    print("\n✅ Sample data generation complete!")
    print("\n📝 Note: This is sample data for testing.")
    print("To use real FanGraphs data:")
    print("  1. Visit https://www.fangraphs.com/leaders/major-league/pitcher")
    print("  2. Export as CSV")
    print("  3. Save to data/pitcher_stats.csv")

if __name__ == "__main__":
    main()
