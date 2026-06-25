import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const predictionsPath = path.join(process.cwd(), 'data', 'predictions_log.json');
    let predictions = [];
    
    if (fs.existsSync(predictionsPath)) {
      const data = fs.readFileSync(predictionsPath, 'utf8');
      predictions = JSON.parse(data);
    }
    
    // Calculate stats from predictions
    const completed = predictions.filter(p => p.result);
    const wins = completed.filter(p => {
      if (p.pick.includes(p.away_team) && p.result === 'away_win') return true;
      if (p.pick.includes(p.home_team) && p.result === 'home_win') return true;
      return false;
    });
    
    const winRate = completed.length > 0 ? wins.length / completed.length : 0;
    const profit = wins.length * 1.1 - (completed.length - wins.length);
    
    const byConfidence = {};
    completed.forEach(p => {
      const confBucket = Math.floor(p.confidence);
      if (!byConfidence[confBucket]) {
        byConfidence[confBucket] = { games: 0, wins: 0 };
      }
      byConfidence[confBucket].games++;
      
      if ((p.pick.includes(p.away_team) && p.result === 'away_win') ||
          (p.pick.includes(p.home_team) && p.result === 'home_win')) {
        byConfidence[confBucket].wins++;
      }
    });
    
    return Response.json({
      summary: {
        total_predictions: predictions.length,
        completed_games: completed.length,
        wins: wins.length,
        losses: completed.length - wins.length,
        win_rate: winRate,
        profit_units: profit
      },
      recent_predictions: predictions.slice(-10).reverse(),
      by_confidence: byConfidence
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
