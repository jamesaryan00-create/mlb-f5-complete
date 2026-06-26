export async function GET(request) {
  try {
    const res = await fetch('https://statsapi.mlb.com/api/v1/schedule?sportId=1', {
      cache: 'no-store'
    });
    
    if (!res.ok) {
      throw new Error(`API returned ${res.status}`);
    }
    
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
        dateObj.games.slice(0, 16).forEach((g, idx) => {
          games.push({
            game_pk: g.gamePk,
            away_team: g.teams?.away?.team?.name || 'Unknown',
            home_team: g.teams?.home?.team?.name || 'Unknown',
            away_pitcher: testPitchers[pitcherIndex % testPitchers.length],
            home_pitcher: testPitchers[(pitcherIndex + 1) % testPitchers.length],
            game_time: `${13 + Math.floor(idx / 4)}:10 PM`,
            game_date: new Date().toLocaleDateString(),
            status: g.status?.abstractGameState || 'Unknown'
          });
          pitcherIndex += 2;
        });
      }
    }
    
    return Response.json(games, {
      headers: { 'Cache-Control': 'no-store' }
    });
  } catch (e) {
    console.error('Error:', e.message);
    // Return mock games if API fails
    return Response.json([
      { game_pk: 1, away_team: "Texas Rangers", home_team: "Miami Marlins", away_pitcher: "Jacob Misiorowski", home_pitcher: "Cristopher Sánchez", game_time: "1:10 PM", game_date: new Date().toLocaleDateString(), status: "Live" },
      { game_pk: 2, away_team: "New York Yankees", home_team: "Boston Red Sox", away_pitcher: "Cam Schlittler", home_pitcher: "Reid Detmers", game_time: "7:10 PM", game_date: new Date().toLocaleDateString(), status: "Scheduled" }
    ]);
  }
}
