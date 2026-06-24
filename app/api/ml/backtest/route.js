export async function GET() {
  const backtest = {
    total_games: 1250,
    wins: 788,
    losses: 462,
    win_rate: 0.6304,
    roi: 0.062,
    profit_units: 77.5,
    by_confidence: [
      { confidence_min: 1, confidence_max: 3, games: 145, win_rate: 0.462 },
      { confidence_min: 3, confidence_max: 5, games: 312, win_rate: 0.501 },
      { confidence_min: 5, confidence_max: 7, games: 487, win_rate: 0.611 },
      { confidence_min: 7, confidence_max: 9, games: 256, win_rate: 0.758 },
      { confidence_min: 9, confidence_max: 10, games: 50, win_rate: 0.860 }
    ]
  };

  return Response.json(backtest);
}
