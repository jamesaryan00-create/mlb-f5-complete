'use client';
import { useState, useEffect } from "react";

export default function F5Picker() {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      const res = await fetch('https://statsapi.mlb.com/api/v1/schedule?sportId=1');
      const data = await res.json();
      const games = [];
      
      if (data.dates) {
        data.dates.forEach(d => {
          if (d.games) {
            games.push(...d.games.map(g => ({
              game_pk: g.gamePk,
              away_team: g.teams.away.team.name,
              home_team: g.teams.home.team.name,
              away_pitcher: g.teams.away.probablePitcher?.fullName || "TBA",
              home_pitcher: g.teams.home.probablePitcher?.fullName || "TBA",
              game_time: new Date(g.gameDateTime).toLocaleTimeString()
            })));
          }
        });
      }
      
      setGames(games.slice(0, 10));
      if (games.length > 0) setSelectedGame(games[0]);
    } catch (e) {
      console.error('Error:', e);
    }
  };

  const predictGame = async () => {
    if (!selectedGame) return;
    setLoading(true);
    
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          away_team: selectedGame.away_team,
          home_team: selectedGame.home_team,
          away_pitcher: selectedGame.away_pitcher,
          home_pitcher: selectedGame.home_pitcher
        })
      });
      
      const data = await res.json();
      setPredictions(data);
    } catch (e) {
      console.error('Error:', e);
    }
    
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a1428 0%, #1a2a4a 100%)", color: "#e6edf3", fontFamily: "system-ui" }}>
      <div style={{ background: "rgba(10, 20, 40, 0.95)", borderBottom: "1px solid rgba(56, 139, 253, 0.2)", padding: "1.5rem 2rem", display: "flex", justifyContent: "space-between" }}>
        <div style={{ fontSize: "20px", fontWeight: "700", color: "#00d4aa" }}>⚾ MLB F5 ML Finder</div>
        <a href="/dashboard" style={{ color: "#58a6ff", textDecoration: "none" }}>📊 Dashboard</a>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
        <h1 style={{ marginBottom: "1.5rem" }}>Find F5 ML Edges</h1>

        {games.length > 0 ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
              {games.map((g, i) => (
                <div 
                  key={i} 
                  onClick={() => setSelectedGame(g)}
                  style={{ 
                    background: selectedGame?.game_pk === g.game_pk ? "rgba(0, 212, 170, 0.08)" : "rgba(30, 42, 66, 0.6)",
                    border: selectedGame?.game_pk === g.game_pk ? "1px solid #00d4aa" : "1px solid rgba(56, 139, 253, 0.15)",
                    borderRadius: "8px", 
                    padding: "1.5rem", 
                    cursor: "pointer",
                    transition: "all 0.3s"
                  }}
                >
                  <div style={{ fontSize: "16px", fontWeight: "700", marginBottom: "1rem" }}>{g.away_team} @ {g.home_team}</div>
                  <div style={{ fontSize: "12px", color: "#8b949e" }}>
                    <div>{g.away_pitcher}</div>
                    <div>{g.home_pitcher}</div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={predictGame} 
              disabled={loading}
              style={{ 
                width: "100%", 
                padding: "0.75rem", 
                background: "#00d4aa", 
                color: "#0a1428", 
                border: "none", 
                borderRadius: "6px", 
                fontWeight: "600", 
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? "Analyzing..." : "⚡ Get ML Prediction"}
            </button>

            {predictions && (
              <div style={{ background: "rgba(30, 42, 66, 0.6)", border: "1px solid rgba(56, 139, 253, 0.2)", borderRadius: "8px", padding: "2rem", marginTop: "2rem" }}>
                <div style={{ fontSize: "36px", fontWeight: "700", color: "#00d4aa" }}>{predictions.pick}</div>
                <div style={{ fontSize: "14px", color: "#8b949e", marginTop: "0.5rem" }}>Confidence: {(predictions.confidence || 5).toFixed(1)}/10</div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginTop: "1.5rem" }}>
                  <div style={{ background: "rgba(0, 212, 170, 0.08)", padding: "1rem", borderRadius: "6px" }}>
                    <div style={{ fontSize: "12px", color: "#8b949e" }}>XGBoost</div>
                    <div style={{ fontSize: "18px", color: "#00d4aa", fontWeight: "700", marginTop: "0.5rem" }}>{((predictions.xgb_prob || 0.5) * 100).toFixed(0)}%</div>
                  </div>
                  <div style={{ background: "rgba(0, 212, 170, 0.08)", padding: "1rem", borderRadius: "6px" }}>
                    <div style={{ fontSize: "12px", color: "#8b949e" }}>Logistic Reg</div>
                    <div style={{ fontSize: "18px", color: "#00d4aa", fontWeight: "700", marginTop: "0.5rem" }}>{((predictions.lr_prob || 0.5) * 100).toFixed(0)}%</div>
                  </div>
                  <div style={{ background: "rgba(0, 212, 170, 0.08)", padding: "1rem", borderRadius: "6px" }}>
                    <div style={{ fontSize: "12px", color: "#8b949e" }}>Random Forest</div>
                    <div style={{ fontSize: "18px", color: "#00d4aa", fontWeight: "700", marginTop: "0.5rem" }}>{((predictions.rf_prob || 0.5) * 100).toFixed(0)}%</div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ color: "#8b949e" }}>Loading games...</div>
        )}
      </div>
    </div>
  );
}
