import fs from 'fs';
import path from 'path';

export async function POST(req) {
  try {
    const body = await req.json();

    // Load pitcher stats from CSV
    const pitcherStatsPath = path.join(process.cwd(), 'data', 'pitcher_stats.csv');
    const pitcherData = fs.readFileSync(pitcherStatsPath, 'utf8');
    const pitchers = pitcherData.split('\n').slice(1);

    // Find matching pitchers
    const awayPitcher = pitchers.find(line => 
      line.toLowerCase().includes(body.away_pitcher.toLowerCase())
    );
    const homePitcher = pitchers.find(line => 
      line.toLowerCase().includes(body.home_pitcher.toLowerCase())
    );

    // Parse pitcher stats
    const parseStats = (line) => {
      const parts = line.split(',');
      return {
        name: parts[0],
        era: parseFloat(parts[2]) || 3.8,
        whip: parseFloat(parts[5]) || 1.15,
      };
    };

    const awayStats = awayPitcher ? parseStats(awayPitcher) : { name: body.away_pitcher, era: 3.8, whip: 1.15 };
    const homeStats = homePitcher ? parseStats(homePitcher) : { name: body.home_pitcher, era: 3.8, whip: 1.15 };

    // Call Python ML server
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

    const mlPrediction = await mlRes.json();

    const ensemble = mlPrediction.ensemble_prob;

    return Response.json({
      pick: ensemble > 0.52 ? `${body.away_team} F5 ML` : `${body.home_team} F5 ML`,
      confidence: mlPrediction.confidence,
      xgb_prob: mlPrediction.xgb_prob,
      lr_prob: mlPrediction.lr_prob,
      rf_prob: mlPrediction.rf_prob,
      ensemble_prob: ensemble,
      away_pitcher: awayStats.name,
      home_pitcher: homeStats.name,
      away_era: awayStats.era.toFixed(2),
      home_era: homeStats.era.toFixed(2),
    });
  } catch (e) {
    console.error('Error:', e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
