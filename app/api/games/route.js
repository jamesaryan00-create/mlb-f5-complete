export async function GET() {
  const mockGames = [
    {
      game_pk: 1,
      away_team: "Milwaukee Brewers",
      home_team: "Philadelphia Phillies",
      away_pitcher: "Jacob Misiorowski",
      home_pitcher: "Cristopher Sanchez",
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
    },
    {
      game_pk: 3,
      away_team: "San Francisco Giants",
      home_team: "San Diego Padres",
      away_pitcher: "Blake Snell",
      home_pitcher: "Mitch Garver",
      game_time: "7:10 PM",
      game_date: "06/24/2026"
    },
    {
      game_pk: 4,
      away_team: "Boston Red Sox",
      home_team: "New York Mets",
      away_pitcher: "Nathan Eovaldi",
      home_pitcher: "Pete Alonso",
      game_time: "10:10 PM",
      game_date: "06/24/2026"
    }
  ];

  return Response.json(mockGames);
}
