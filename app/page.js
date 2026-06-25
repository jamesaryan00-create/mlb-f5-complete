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
      const res = await fetch('/api/games');
      const data = await res.json();
      setGames(data);
      if (data.length > 0) setSelectedGame(data[0]);
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
          home_pitcher: selectedGame.home_pitcher,
          game_pk: selectedGame.game_pk,
          game_date: selectedGame.game_date
        })
      });
      
      const pred = await res.json();
      
      await fetch('/api/predictions/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_pk: selectedGame.game_pk,
          away_team: selectedGame.away_team,
          home_team: selectedGame.home_team,
          pick: pred.pick,
          confidence: pred.confidence,
          xgb_prob: pred.xgb_prob,
          lr_prob: pred.lr_prob,
          rf_prob: pred.rf_prob,
          away_era: pred.away_era,
          home_era: pred.home_era
        })
      });
      
      setPredictions(pred);
    } catch (e) {
      console.error('Error:', e);
    }
    
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a1428 0%, #1a2a4a 100%)", color: "#e6edf3", fontFamily: "system-ui" }}>
      <div style={{ background: "rgba(10, 20, 40, 0.95)", borderBottom: "1px solid rgba(56, 139, 253, 0.2)", padding: "1.5rem 2rem", display: "flex", justifyContent: "space-between" }}>
        <div style={{ fontSize: "20px", fontWeight: "700", color: "#00d4aa" }}>⚾ MLB F5 ML Finder</div>
        <div>
          <a href="/dashboard" style={{ color: "#58a6ff", textDecoration: "none", marginRight: "1.5rem" }}>📊 Dashboard</a>
          <a href="/backtest" style={{ color: "#58a6ff", textDecoration: "none", marginRight: "1.5rem" }}>📈 Backtest</a>
          <a href="/live-backtest" style={{ color: "#00d4aa", textDecoration: "none", fontWeight: "600" }}>🔴 LIVE</a>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
        <h1 style={{ marginBottom: "1.5rem" }}>Find F5 <span style={{ color: "#00d4aa" }}>ML Edges</span></h1>

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
                  <div style={{ fontSize: "11px", color: "#6e7681", marginBottom: "0.5rem" }}>{g.game_date} • {g.game_time}</div>
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
                <div style={{ fontSize: "36px", fontWeight: "700", color: "#00d4aa", marginBottom: "0.5rem" }}>{predictions.pick}</div>
                <div style={{ fontSize: "16px", color: "#8b949e", marginBottom: "1.5rem" }}>Confidence: {(predictions.confidence || 5).toFixed(1)}/10</div>
                
                <div style={{ marginBottom: "2rem", padding: "1rem", background: "rgba(0, 212, 170, 0.08)", borderRadius: "6px", border: "1px solid rgba(0, 212, 170, 0.2)" }}>
                  <div style={{ fontSize: "12px", color: "#8b949e", marginBottom: "1rem" }}>📊 PITCHER MATCHUP</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "13px" }}>
                    <div>
                      <div style={{ color: "#8b949e", marginBottom: "0.25rem" }}>Away</div>
                      <div style={{ color: "#c9d1d9", fontWeight: "600" }}>{predictions.away_pitcher}</div>
                      <div style={{ color: "#00d4aa", marginTop: "0.25rem" }}>ERA: {predictions.away_era}</div>
                    </div>
                    <div>
                      <div style={{ color: "#8b949e", marginBottom: "0.25rem" }}>Home</div>
                      <div style={{ color: "#c9d1d9", fontWeight: "600" }}>{predictions.home_pitcher}</div>
                      <div style={{ color: "#00d4aa", marginTop: "0.25rem" }}>ERA: {predictions.home_era}</div>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: "2rem" }}>
                  <div style={{ fontSize: "12px", color: "#8b949e", marginBottom: "1rem" }}>🤖 MODEL ENSEMBLE</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                    <div style={{ background: "rgba(0, 212, 170, 0.08)", padding: "1rem", borderRadius: "6px" }}>
                      <div style={{ fontSize: "11px", color: "#8b949e", marginBottom: "0.5rem" }}>XGBoost</div>
                      <div style={{ fontSize: "24px", color: "#00d4aa", fontWeight: "700" }}>{((predictions.xgb_prob || 0.5) * 100).toFixed(0)}%</div>
                      <div style={{ fontSize: "10px", color: "#6e7681", marginTop: "0.25rem" }}>Gradient Boost</div>
                    </div>
                    <div style={{ background: "rgba(0, 212, 170, 0.08)", padding: "1rem", borderRadius: "6px" }}>
                      <div style={{ fontSize: "11px", color: "#8b949e", marginBottom: "0.5rem" }}>Logistic Reg</div>
                      <div style={{ fontSize: "24px", color: "#00d4aa", fontWeight: "700" }}>{((predictions.lr_prob || 0.5) * 100).toFixed(0)}%</div>
                      <div style={{ fontSize: "10px", color: "#6e7681", marginTop: "0.25rem" }}>Linear Model</div>
                    </div>
                    <div style={{ background: "rgba(0, 212, 170, 0.08)", padding: "1rem", borderRadius: "6px" }}>
                      <div style={{ fontSize: "11px", color: "#8b949e", marginBottom: "0.5rem" }}>Random Forest</div>
                      <div style={{ fontSize: "24px", color: "#00d4aa", fontWeight: "700" }}>{((predictions.rf_prob || 0.5) * 100).toFixed(0)}%</div>
                      <div style={{ fontSize: "10px", color: "#6e7681", marginTop: "0.25rem" }}>Ensemble Trees</div>
                    </div>
                  </div>
                </div>

                <div style={{ padding: "1rem", background: "rgba(88, 166, 255, 0.1)", borderRadius: "6px", border: "1px solid rgba(88, 166, 255, 0.2)" }}>
                  <div style={{ fontSize: "12px", color: "#58a6ff", fontWeight: "600", marginBottom: "0.5rem" }}>💡 Analysis</div>
                  <div style={{ fontSize: "13px", color: "#c9d1d9", lineHeight: "1.6" }}>
                    {predictions.away_era < predictions.home_era 
                      ? `${predictions.away_pitcher} has a significant ERA advantage (${predictions.away_era} vs ${predictions.home_era}). This is the primary edge driving the prediction.`
                      : `${predictions.home_pitcher} has the ERA advantage (${predictions.home_era} vs ${predictions.away_era}). The home team is favored.`
                    }
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ color: "#8b949e" }}>No games found</div>
        )}
      </div>
    </div>
  );
}
