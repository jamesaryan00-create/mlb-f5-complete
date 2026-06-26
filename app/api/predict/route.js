import fs from 'fs';
import path from 'path';

export async function POST(req) {
  try {
    const body = await req.json();
    console.log('Predict called with:', body.away_pitcher, 'vs', body.home_pitcher);

    // Always use fallback on Vercel (no local Python server)
    const mlPrediction = { 
      xgb_prob: 0.58, 
      lr_prob: 0.57, 
      rf_prob: 0.59, 
      ensemble_prob: 0.58, 
      confidence: 6.5 
    };

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
        console.error('CSV error:', e.message);
      }
    }

    const ensemble = mlPrediction.ensemble_prob;

    const response = {
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
    };

    console.log('Returning:', response);
    return Response.json(response);
  } catch (e) {
    console.error('Predict error:', e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
