'use client';
import { useState, useEffect } from "react";

export default function LiveBacktestPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBacktest();
    const interval = setInterval(loadBacktest, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadBacktest = async () => {
    try {
      const res = await fetch('/api/live-backtest');
      const backtest = await res.json();
      setData(backtest);
    } catch (e) {
      console.error('Error:', e);
    }
    setLoading(false);
  };

  if (loading) return <div style={{ color: '#e6edf3', padding: '2rem' }}>Loading...</div>;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a1428 0%, #1a2a4a 100%)", color: "#e6edf3", fontFamily: "system-ui" }}>
      <div style={{ background: "rgba(10, 20, 40, 0.95)", borderBottom: "1px solid rgba(56, 139, 253, 0.2)", padding: "1.5rem 2rem", display: "flex", justifyContent: "space-between" }}>
        <div style={{ fontSize: "20px", fontWeight: "700", color: "#00d4aa" }}>📊 Live Backtest</div>
        <a href="/" style={{ color: "#58a6ff", textDecoration: "none" }}>← Picker</a>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
        {data && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
              <div style={{ background: "rgba(30, 42, 66, 0.6)", border: "1px solid rgba(56, 139, 253, 0.15)", borderRadius: "8px", padding: "1.5rem" }}>
                <div style={{ fontSize: "12px", color: "#8b949e" }}>PREDICTIONS</div>
                <div style={{ fontSize: "32px", fontWeight: "700", color: "#00d4aa" }}>{data.summary.total_predictions}</div>
                <div style={{ fontSize: "12px", color: "#6e7681" }}>total picks</div>
              </div>
              
              <div style={{ background: "rgba(30, 42, 66, 0.6)", border: "1px solid rgba(56, 139, 253, 0.15)", borderRadius: "8px", padding: "1.5rem" }}>
                <div style={{ fontSize: "12px", color: "#8b949e" }}>COMPLETED</div>
                <div style={{ fontSize: "32px", fontWeight: "700", color: "#00d4aa" }}>{data.summary.completed_games}</div>
                <div style={{ fontSize: "12px", color: "#6e7681" }}>games finished</div>
              </div>

              <div style={{ background: "rgba(30, 42, 66, 0.6)", border: "1px solid rgba(56, 139, 253, 0.15)", borderRadius: "8px", padding: "1.5rem" }}>
                <div style={{ fontSize: "12px", color: "#8b949e" }}>WIN RATE</div>
                <div style={{ fontSize: "32px", fontWeight: "700", color: data.summary.win_rate > 0.52 ? "#3fb950" : "#f85149" }}>
                  {(data.summary.win_rate * 100).toFixed(1)}%
                </div>
                <div style={{ fontSize: "12px", color: "#6e7681" }}>{data.summary.wins}W / {data.summary.losses}L</div>
              </div>

              <div style={{ background: "rgba(30, 42, 66, 0.6)", border: "1px solid rgba(56, 139, 253, 0.15)", borderRadius: "8px", padding: "1.5rem" }}>
                <div style={{ fontSize: "12px", color: "#8b949e" }}>PROFIT</div>
                <div style={{ fontSize: "32px", fontWeight: "700", color: data.summary.profit_units > 0 ? "#3fb950" : "#f85149" }}>
                  {data.summary.profit_units > 0 ? '+' : ''}{data.summary.profit_units.toFixed(2)}u
                </div>
                <div style={{ fontSize: "12px", color: "#6e7681" }}>units P/L</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
