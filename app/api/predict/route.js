import fs from 'fs';
import path from 'path';

export async function POST(req) {
  try {
    const body = await req.json();
    console.log('Predict called:', body.away_pitcher, 'vs', body.home_pitcher);

    const pitcherStatsPath = path.join(process.cwd(), 'data', 'pitcher_stats.csv');
    let awayStats = { era: 3.8, whip: 1.15, k9: 9.0 };
    let homeStats = { era: 3.8, whip: 1.15, k9: 9.0 };

    if (fs.existsSync(pitcherStatsPath)) {
      try {
        const csv = fs.readFileSync(pitcherStatsPath, 'utf8');
        const lines = csv.split('\n');
        console.log(`CSV has ${lines.length} lines`);
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (!line.trim()) continue;
          
          const parts = line.split(',');
          const name = parts[0]?.trim() || '';
          const era = parseFloat(parts[16]) || 3.8;
          
          if (name.toLowerCase() === body.away_pitcher.toLowerCase()) {
            awayStats = { era, whip: parseFloat(parts[10]) || 1.15, k9: parseFloat(parts[8]) || 9.0 };
            console.log(`Found away: ${name} ERA ${era}`);
          }
          if (name.toLowerCase() === body.home_pitcher.toLowerCase()) {
            homeStats = { era, whip: parseFloat(parts[10]) || 1.15, k9: parseFloat(parts[8]) || 9.0 };
            console.log(`Found home: ${name} ERA ${era}`);
          }
        }
      } catch (e) {
        console.error('CSV error:', e.message);
      }
    }

    let mlPrediction = { 
      xgb_prob: 0.5, 
      lr_prob: 0.5, 
      rf_prob: 0.5, 
      ensemble_prob: 0.5, 
      confidence: 5 
    };
    
    try {
      const mlRes = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          away_pitcher_era: awayStats.era,
          home_pitcher_era: homeStats.era,
          away_pitcher_whip: awayStats.whip,
          home_pitcher_whip: homeStats.whip,
          away_team_f5_win_pct: 0.50,
          home_team_f5_win_pct: 0.50,
          temperature: 72,
          wind_speed: 8,
          altitude: 0,
          away_rest_days: 1,
          home_rest_days: 1,
        })
      });

      if (mlRes.ok) {
        mlPrediction = await mlRes.json();
      }
    } catch (e) {
      console.error('ML server error:', e.message);
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
      away_era: awayStats.era.toFixed(2),
      home_era: homeStats.era.toFixed(2),
      away_whip: awayStats.whip.toFixed(2),
      home_whip: homeStats.whip.toFixed(2),
      away_k9: awayStats.k9.toFixed(2),
      home_k9: homeStats.k9.toFixed(2),
    });
  } catch (e) {
    console.error('Error:', e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
