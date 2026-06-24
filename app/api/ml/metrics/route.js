export async function GET() {
  const metrics = {
    xgboost: {
      accuracy: 0.611,
      auc: 0.618,
      logloss: 0.686
    },
    logistic_regression: {
      accuracy: 0.650,
      auc: 0.612,
      logloss: 0.692
    },
    random_forest: {
      accuracy: 0.630,
      auc: 0.614,
      logloss: 0.688
    },
    ensemble: {
      accuracy: 0.630,
      auc: 0.618,
      logloss: 0.689
    }
  };

  return Response.json(metrics);
}
