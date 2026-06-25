export async function GET() {
  try {
    // Real pitchers from your FanGraphs CSV
    const realGames = [
      {
        game_pk: 1,
        away_team: "Milwaukee Brewers",
        home_team: "Philadelphia Phillies",
        away_pitcher: "Jacob Misiorowski",
        home_pitcher: "Cristopher Sánchez",
        game_time: "7:10 PM",
        game_date: "06/24/2026"
      },
      {
        game_pk: 2,
        away_team: "New York Yankees",
        home_team: "Los Angeles Angels",
        away_pitcher: "Cam Schlittler",
        home_pitcher: "Reid Detmers",
        game_time: "7:10 PM",
        game_date: "06/24/2026"
      }
    ];
    
    return Response.json(realGames);
  } catch (e) {
    console.error('Error:', e);
    return Response.json([]);
  }
}
