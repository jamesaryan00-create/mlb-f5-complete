export async function GET() {
  try {
    const res = await fetch('https://statsapi.mlb.com/api/v1/schedule?sportId=1');
    const data = await res.json();
    
    const testPitchers = [
      "Jacob Misiorowski", "Cristopher Sánchez", "Cam Schlittler", "Reid Detmers",
      "Paul Skenes", "Joe Ryan", "Davis Martin", "Chase Burns",
      "Braxton Ashcraft"
    ];
    
    const games = [];
    let pitcherIndex = 0;
    
    if (data.dates && data.dates.length > 0) {
      const dateObj = data.dates[0];
      
      if (dateObj.games && dateObj.games.length > 0) {
        dateObj.games.forEach((g, idx) => {
          try {
            games.push({
              game_pk: g.gamePk,
              away_team: g.teams?.away?.team?.name || 'Unknown',
              home_team: g.teams?.home?.team?.name || 'Unknown',
              away_pitcher: testPitchers[pitcherIndex % testPitchers.length],
              home_pitcher: testPitchers[(pitcherIndex + 1) % testPitchers.length],
              game_time: `${13 + Math.floor(idx / 4)}:10 PM`,
              game_date: "06/24/2026",
              status: g.status?.abstractGameState || 'Unknown'
            });
            
            pitcherIndex += 2;
          } catch (e) {
            console.error('Error parsing game:', e);
          }
        });
      }
    }
    
    return Response.json(games);
  } catch (e) {
    console.error('Error fetching games:', e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
