'use client';
import { useState, useEffect } from "react";

export default function BacktestPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await fetch('/api/backtest-detailed');
      const backtest = await res.json();
      setData(backtest);
    } catch (e) {
      console.error('Error:', e);
    }
  };

  if (!data) return <div style={{ color: '#e6edf3', padding: '2rem' }}>Loading...</div>;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a1428 0%, #1a2a4a 100%)", color: "#e6edf3", fontFamily: "system-ui" }}>
      <div style={{ background: "rgba(10, 20, 40, 0.95)", borderBottom: "1px solid rgba(56, 139, 253, 0.2)", padding: "1.5rem 2rem", display: "flex", justifyContent: "space-between" }}>
        <div style={{ fontSize: "20px", fontWeight: "700", color: "#00d4aa" }}>⚾ Backtest Results</div>
        <a href="/" style={{ color: "#58a6ff", textDecoration: "none" }}>← Back</a>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          <div style={{ background: "rgba(30, 42, 66, 0.6)", border: "1px solid rgba(56, 139, 253, 0.15)", borderRadius: "8px", padding: "1.5rem" }}>
            <div style={{ fontSize: "12px", color: "#8b949e", marginBottom: "0.5rem" }}>WIN RATE</div>
            <div style={{ fontSize: "32px", fontWeight: "700", color: "#00d4aa" }}>{(data.summary.win_rate * 100).toFixed(1)}%</div>
            <div style={{ fontSize: "12px", color: "#6e7681" }}>{data.summary.wins}W / {data.summary.losses}L</div>
          </div>
          
          <div style={{ background: "rgba(30, 42, 66, 0.6)", border: "1px solid rgba(56, 139, 253, 0.15)", borderRadius: "8px", padding: "1.5rem" }}>
            <div style={{ fontSize: "12px", color: "#8b949e", marginBottom: "0.5rem" }}>ROI</div>
            <div style={{ fontSize: "32px", fontWeight: "700", color: "#3fb950" }}>{(data.summary.roi * 100).toFixed(1)}%</div>
            <div style={{ fontSize: "12px", color: "#6e7681" }}>+{data.summary.profit_units.toFixed(1)} units</div>
          </div>

          <div style={{ background: "rgba(30, 42, 66, 0.6)", border: "1px solid rgba(56, 139, 253, 0.15)", borderRadius: "8px", padding: "1.5rem" }}>
            <div style={{ fontSize: "12px", color: "#8b949e", marginBottom: "0.5rem" }}>BANKROLL</div>
            <div style={{ fontSize: "32px", fontWeight: "700", color: "#00d4aa" }}>${data.summary.ending_bankroll}</div>
            <div style={{ fontSize: "12px", color: "#6e7681" }}>from ${data.summary.starting_bankroll}</div>
          </div>

          <div style={{ background: "rgba(30, 42, 66, 0.6)", border: "1px solid rgba(56, 139, 253, 0.15)", borderRadius: "8px", padding: "1.5rem" }}>
            <div style={{ fontSize: "12px", color: "#8b949e", marginBottom: "0.5rem" }}>GAMES</div>
            <div style={{ fontSize: "32px", fontWeight: "700", color: "#00d4aa" }}>{data.summary.total_games}</div>
            <div style={{ fontSize: "12px", color: "#6e7681" }}>historical games</div>
          </div>
        </div>

        <div style={{ background: "rgba(30, 42, 66, 0.6)", border: "1px solid rgba(56, 139, 253, 0.15)", borderRadius: "8px", padding: "1.5rem", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "1.5rem" }}>By Confidence Level</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(56, 139, 253, 0.2)" }}>
                <th style={{ textAlign: "left", padding: "0.75rem", color: "#8b949e", fontSize: "12px" }}>Confidence</th>
                <th style={{ textAlign: "left", padding: "0.75rem", color: "#8b949e", fontSize: "12px" }}>Games</th>
                <th style={{ textAlign: "left", padding: "0.75rem", color: "#8b949e", fontSize: "12px" }}>Win %</th>
                <th style={{ textAlign: "left", padding: "0.75rem", color: "#8b949e", fontSize: "12px" }}>Units</th>
              </tr>
            </thead>
            <tbody>
              {data.by_confidence.map((conf, i) => (
                <tr key={i} style={{ borderBottom: "1px solid rgba(56, 139, 253, 0.1)" }}>
                  <td style={{ padding: "0.75rem", fontSize: "13px" }}>{conf.confidence}</td>
                  <td style={{ padding: "0.75rem", fontSize: "13px" }}>{conf.games}</td>
                  <td style={{ padding: "0.75rem", fontSize: "13px", color: conf.win_rate > 0.52 ? "#3fb950" : "#f85149" }}>{(conf.win_rate * 100).toFixed(1)}%</td>
                  <td style={{ padding: "0.75rem", fontSize: "13px", color: conf.units > 0 ? "#3fb950" : "#f85149", fontWeight: "600" }}>{conf.units > 0 ? '+' : ''}{conf.units.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ background: "rgba(30, 42, 66, 0.6)", border: "1px solid rgba(56, 139, 253, 0.15)", borderRadius: "8px", padding: "1.5rem" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "1.5rem" }}>Best Teams</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
            {data.by_team.map((team, i) => (
              <div key={i} style={{ background: "rgba(0, 212, 170, 0.08)", padding: "1rem", borderRadius: "6px" }}>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#00d4aa" }}>{team.team}</div>
                <div style={{ fontSize: "11px", color: "#8b949e", marginTop: "0.5rem" }}>{team.picks} picks</div>
                <div style={{ fontSize: "11px", color: "#8b949e" }}>{(team.win_rate * 100).toFixed(1)}% WR</div>
                <div style={{ fontSize: "12px", fontWeight: "600", color: team.units > 0 ? "#3fb950" : "#f85149", marginTop: "0.5rem" }}>{team.units > 0 ? '+' : ''}{team.units.toFixed(1)}u</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
