export async function POST(req) {
  try {
    const { game_pk } = await req.json();
    
    const res = await fetch(`https://statsapi.mlb.com/api/v1/game/${game_pk}`);
    const data = await res.json();
    
    const gameData = data.gameData;
    const liveData = data.liveData;
    
    const status = liveData.linescore.currentInning || 0;
    const isFinished = data.gameData.status.abstractGameState === 'Final';
    
    let result = null;
    if (isFinished) {
      const awayScore = liveData.linescore.teams[0];
      const homeScore = liveData.linescore.teams[1];
      result = awayScore > homeScore ? 'away_win' : 'home_win';
    }
    
    return Response.json({
      game_pk,
      status: data.gameData.status.abstractGameState,
      inning: status,
      result,
      away_team: gameData.teams.away.name,
      home_team: gameData.teams.home.name,
      away_score: liveData.linescore.teams[0],
      home_score: liveData.linescore.teams[1]
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
