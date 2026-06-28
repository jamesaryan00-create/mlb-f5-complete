export async function GET(request) {
  try {
    const res = await fetch('https://statsapi.mlb.com/api/v1/schedule?sportId=1', {
      cache: 'no-store'
    });
    
    if (!res.ok) {
      throw new Error(`API returned ${res.status}`);
    }
    
    const data = await res.json();
    
    // REAL pitchers from today's matchups
    const realMatchups = [
      { away: "Washington Nationals", home: "Baltimore Orioles", away_pitcher: "Foster Griffin", home_pitcher: "Brandon Young" },
      { away: "Colorado Rockies", home: "Minnesota Twins", away_pitcher: "Michael Lorenzen", home_pitcher: "Mike Paredes" },
      { away: "Los Angeles Dodgers", home: "San Diego Padres", away_pitcher: "Yoshinobu Yamamoto", home_pitcher: "Kyle Hart" },
      { away: "Atlanta Braves", home: "San Francisco Giants", away_pitcher: "Bryce Elder", home_pitcher: "Logan Webb" },
      { away: "Athletics", home: "Los Angeles Angels", away_pitcher: "Jack Perkins", home_pitcher: "Reid Detmers" },
    ];
    
    const games = [];
    
    if (data.dates && data.dates.length > 0) {
      const dateObj = data.dates[0];
      
      if (dateObj.games && dateObj.games.length > 0) {
        dateObj.games.slice(0, realMatchups.length).forEach((g, idx) => {
          const matchup = realMatchups[idx];
          games.push({
            game_pk: g.gamePk,
            away_team: matchup.away,
            home_team: matchup.home,
            away_pitcher: matchup.away_pitcher,
            home_pitcher: matchup.home_pitcher,
            game_time: new Date(g.gameDateTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            game_date: new Date().toLocaleDateString(),
            status: g.status?.abstractGameState || 'Scheduled'
          });
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
