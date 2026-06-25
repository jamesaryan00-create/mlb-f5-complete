export async function GET() {
  try {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    
    const res = await fetch(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${dateStr}`);
    const data = await res.json();
    
    const games = [];
    
    if (data.dates && data.dates[0] && data.dates[0].games) {
      data.dates[0].games.forEach(g => {
        games.push({
          game_pk: g.gamePk,
          away_team: g.teams.away.team.name,
          home_team: g.teams.home.team.name,
          away_pitcher: g.teams.away.probablePitcher?.fullName || "TBA",
          home_pitcher: g.teams.home.probablePitcher?.fullName || "TBA",
          game_time: new Date(g.gameDateTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          game_date: new Date(g.gameDateTime).toLocaleDateString("en-US"),
          status: g.status.abstractGameState,
          game_status: g.status.detailedState
        });
      });
    }
    
    return Response.json(games.length > 0 ? games : []);
  } catch (e) {
    console.error('Error:', e);
    return Response.json([]);
  }
}
