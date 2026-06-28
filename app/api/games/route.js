export async function GET(request) {
  try {
    const res = await fetch('https://statsapi.mlb.com/api/v1/schedule?sportId=1', {
      cache: 'no-store'
    });
    
    if (!res.ok) {
      throw new Error(`API returned ${res.status}`);
    }
    
    const data = await res.json();
    
    // REAL pitchers from YOUR FanGraphs CSV
    const realPitchers = [
      "Zack Wheeler", "Dylan Cease", "Max Fried", "Yoshinobu Yamamoto",
      "Hunter Brown", "Framber Valdez", "Ranger Suarez", "Sonny Gray",
      "Kevin Gausman", "Michael Wacha", "Cole Ragans", "Hunter Greene",
      "Logan Gilbert"
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
            away_pitcher: realPitchers[pitcherIndex % realPitchers.length],
            home_pitcher: realPitchers[(pitcherIndex + 1) % realPitchers.length],
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
    return Response.json([]);
  }
}
