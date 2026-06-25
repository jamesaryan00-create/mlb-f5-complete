import fs from 'fs';
import path from 'path';

export async function POST(req) {
  try {
    const body = await req.json();

    // Try to call Python server, fallback to mock if unavailable
    let mlPrediction = { xgb_prob: 0.5, lr_prob: 0.5, rf_prob: 0.5, ensemble_prob: 0.5, confidence: 5 };
    
    try {
      const mlRes = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          away_pitcher_era: body.away_pitcher,
          home_pitcher_era: body.home_pitcher,
          away_pitcher_whip: 1.15,
          home_pitcher_whip: 1.15,
          away_team_f5_win_pct: 0.50,
          home_team_f5_win_pct: 0.50,
          temperature: 72,
          wind_speed: 8,
          altitude: 0,
          away_rest_days: 1,
          home_rest_days: 1,
        }),
        timeout: 5000
      });

      mlPrediction = await mlRes.json();
    } catch (e) {
      console.warn('ML server unavailable, using mock predictions');
    }

    // Get ERA from CSV for display
    const pitcherStatsPath = path.join(process.cwd(), 'data', 'pitcher_stats.csv');
    let awayERA = 3.8;
    let homeERA = 3.8;

    if (fs.existsSync(pitcherStatsPath)) {
      try {
        const csv = fs.readFileSync(pitcherStatsPath, 'utf8');
        const lines = csv.split('\n');
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (!line.trim()) continue;
          
          const parts = line.split(',');
          const name = parts[0]?.replace(/"/g, '') || '';
          const era = parseFloat(parts[1]) || 3.8;
          
          if (name.toLowerCase().includes(body.away_pitcher.toLowerCase())) {
            awayERA = era;
          }
          if (name.toLowerCase().includes(body.home_pitcher.toLowerCase())) {
            homeERA = era;
          }
        }
      } catch (e) {
        console.log('CSV parse:', e.message);
      }
    }

    const ensemble = mlPrediction.ensemble_prob;

    return Response.json({
      pick: ensemble > 0.52 ? `${body.away_team} F5 ML` : `${body.home_team} F5 ML`,
      confidence: mlPrediction.confidence,
      xgb_prob: mlPrediction.xgb_prob,
      lr_prob: mlPrediction.lr_prob,
      rf_prob: mlPrediction.rf_prob,
      ensemble_prob: ensemble,
      away_pitcher: body.away_pitcher,
      home_pitcher: body.home_pitcher,
      away_era: awayERA.toFixed(2),
      home_era: homeERA.toFixed(2),
    });
  } catch (e) {
    console.error('Error:', e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
