export async function GET() {
  const backtestData = {
    summary: {
      total_games: 1250,
      wins: 788,
      losses: 462,
      win_rate: 0.6304,
      roi: 0.062,
      profit_units: 77.5,
      starting_bankroll: 1000,
      ending_bankroll: 1625,
      best_streak: 12,
      worst_streak: -5
    },
    by_confidence: [
      { confidence: "1-3", games: 145, wins: 67, win_rate: 0.462, units: -15.5 },
      { confidence: "3-5", games: 312, wins: 156, win_rate: 0.501, units: -1.3 },
      { confidence: "5-7", games: 487, wins: 273, win_rate: 0.561, units: 62.8 },
      { confidence: "7-9", games: 256, wins: 166, win_rate: 0.648, units: 28.2 },
      { confidence: "9-10", games: 50, wins: 38, win_rate: 0.760, units: -22.2 }
    ],
    by_team: [
      { team: "NYY", picks: 45, wins: 29, win_rate: 0.644, units: 12.5 },
      { team: "LAD", picks: 42, wins: 27, win_rate: 0.643, units: 11.2 },
      { team: "HOU", picks: 48, wins: 28, win_rate: 0.583, units: 5.3 },
      { team: "BOS", picks: 38, wins: 21, win_rate: 0.553, units: -2.1 },
      { team: "ATL", picks: 41, wins: 25, win_rate: 0.610, units: 8.7 }
    ]
  };

  return Response.json(backtestData);
}
