'use client';
import { useState, useEffect } from "react";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("predictions");
  const [modelMetrics, setModelMetrics] = useState(null);
  const [backtestResults, setBacktestResults] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const metricsRes = await fetch('/api/ml/metrics');
      const metrics = await metricsRes.json();
      setModelMetrics(metrics);

      const btRes = await fetch('/api/ml/backtest');
      const backtest = await btRes.json();
      setBacktestResults(backtest);
    } catch (e) {
      console.error('Error loading dashboard:', e);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a1428 0%, #1a2a4a 100%)", color: "#e6edf3", fontFamily: "system-ui" }}>
      <style>{`
        .navbar { background: rgba(10, 20, 40, 0.95); border-bottom: 1px solid rgba(56, 139, 253, 0.2); padding: 1.5rem 2rem; display: flex; justify-content: space-between; }
        .logo { font-size: 20px; font-weight: 700; color: #00d4aa; }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .tabs { display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 1px solid rgba(56, 139, 253, 0.2); padding-bottom: 1rem; }
        .tab-btn { padding: 0.75rem 1.5rem; background: transparent; border: none; color: #8b949e; cursor: pointer; font-weight: 600; border-bottom: 2px solid transparent; transition: all 0.3s; }
        .tab-btn:hover { color: #00d4aa; }
        .tab-btn.active { color: #00d4aa; border-bottom-color: #00d4aa; }
        .card { background: rgba(30, 42, 66, 0.6); border: 1px solid rgba(56, 139, 253, 0.15); border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; }
        .card-title { font-size: 14px; font-weight: 600; color: #8b949e; text-transform: uppercase; margin-bottom: 1rem; }
        .metric-value { font-size: 32px; font-weight: 700; color: #00d4aa; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .model-card { background: rgba(10, 20, 40, 0.7); border: 1px solid rgba(56, 139, 253, 0.2); border-radius: 8px; padding: 1.5rem; text-align: center; }
        .model-name { font-size: 14px; font-weight: 600; color: #58a6ff; margin-bottom: 1rem; }
        .model-stat { display: flex; justify-content: space-between; margin-bottom: 0.75rem; font-size: 13px; }
        .stat-label { color: #8b949e; }
        .stat-value { color: #c9d1d9; font-weight: 600; }
      `}</style>

      <div className="navbar">
        <div className="logo">⚾ MLB F5 ML Dashboard</div>
        <a href="/" style={{ color: '#58a6ff', textDecoration: 'none' }}>← Back to Picker</a>
      </div>

      <div className="container">
        <div className="tabs">
          <button className={`tab-btn ${activeTab === 'predictions' ? 'active' : ''}`} onClick={() => setActiveTab('predictions')}>
            🎯 Model Performance
          </button>
          <button className={`tab-btn ${activeTab === 'backtest' ? 'active' : ''}`} onClick={() => setActiveTab('backtest')}>
            📈 Backtest Results
          </button>
        </div>

        {activeTab === 'predictions' && (
          <div>
            <h1 style={{ marginBottom: '1.5rem' }}>Model <span style={{ color: '#00d4aa' }}>Performance</span></h1>
            
            {modelMetrics && (
              <>
                <div className="grid">
                  <div className="card">
                    <div className="card-title">XGBoost Accuracy</div>
                    <div className="metric-value">{(modelMetrics.xgboost.accuracy * 100).toFixed(1)}%</div>
                  </div>
                  <div className="card">
                    <div className="card-title">Logistic Regression</div>
                    <div className="metric-value">{(modelMetrics.logistic_regression.accuracy * 100).toFixed(1)}%</div>
                  </div>
                  <div className="card">
                    <div className="card-title">Random Forest</div>
                    <div className="metric-value">{(modelMetrics.random_forest.accuracy * 100).toFixed(1)}%</div>
                  </div>
                  <div className="card">
                    <div className="card-title">Ensemble</div>
                    <div className="metric-value">{(modelMetrics.ensemble.accuracy * 100).toFixed(1)}%</div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-title">Individual Models</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div className="model-card">
                      <div className="model-name">XGBoost</div>
                      <div className="model-stat">
                        <span className="stat-label">Accuracy</span>
                        <span className="stat-value">{(modelMetrics.xgboost.accuracy * 100).toFixed(1)}%</span>
                      </div>
                      <div className="model-stat">
                        <span className="stat-label">AUC</span>
                        <span className="stat-value">{modelMetrics.xgboost.auc.toFixed(3)}</span>
                      </div>
                    </div>

                    <div className="model-card">
                      <div className="model-name">Logistic Regression</div>
                      <div className="model-stat">
                        <span className="stat-label">Accuracy</span>
                        <span className="stat-value">{(modelMetrics.logistic_regression.accuracy * 100).toFixed(1)}%</span>
                      </div>
                      <div className="model-stat">
                        <span className="stat-label">AUC</span>
                        <span className="stat-value">{modelMetrics.logistic_regression.auc.toFixed(3)}</span>
                      </div>
                    </div>

                    <div className="model-card">
                      <div className="model-name">Random Forest</div>
                      <div className="model-stat">
                        <span className="stat-label">Accuracy</span>
                        <span className="stat-value">{(modelMetrics.random_forest.accuracy * 100).toFixed(1)}%</span>
                      </div>
                      <div className="model-stat">
                        <span className="stat-label">AUC</span>
                        <span className="stat-value">{modelMetrics.random_forest.auc.toFixed(3)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'backtest' && (
          <div>
            <h1 style={{ marginBottom: '1.5rem' }}>Backtest <span style={{ color: '#00d4aa' }}>Results</span></h1>
            
            {backtestResults && (
              <>
                <div className="grid">
                  <div className="card">
                    <div className="card-title">Total Games</div>
                    <div className="metric-value">{backtestResults.total_games}</div>
                  </div>
                  <div className="card">
                    <div className="card-title">Win Rate</div>
                    <div className="metric-value">{(backtestResults.win_rate * 100).toFixed(1)}%</div>
                  </div>
                  <div className="card">
                    <div className="card-title">ROI</div>
                    <div className="metric-value" style={{ color: backtestResults.roi > 0 ? '#3fb950' : '#f85149' }}>
                      {(backtestResults.roi * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-title">Accuracy by Confidence</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(56, 139, 253, 0.2)' }}>
                        <th style={{ textAlign: 'left', padding: '0.75rem', color: '#8b949e', fontSize: '12px' }}>Confidence</th>
                        <th style={{ textAlign: 'left', padding: '0.75rem', color: '#8b949e', fontSize: '12px' }}>Games</th>
                        <th style={{ textAlign: 'left', padding: '0.75rem', color: '#8b949e', fontSize: '12px' }}>Win Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {backtestResults.by_confidence.map((conf, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(56, 139, 253, 0.1)' }}>
                          <td style={{ padding: '0.75rem', fontSize: '13px' }}>{conf.confidence_min}-{conf.confidence_max}</td>
                          <td style={{ padding: '0.75rem', fontSize: '13px' }}>{conf.games}</td>
                          <td style={{ padding: '0.75rem', fontSize: '13px', color: conf.win_rate > 0.52 ? '#3fb950' : '#f85149' }}>
                            {(conf.win_rate * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
