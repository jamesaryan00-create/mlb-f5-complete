import fs from 'fs';
import path from 'path';

export async function POST(req) {
  try {
    const body = await req.json();
    const predictionsPath = path.join(process.cwd(), 'data', 'predictions_log.json');
    
    let predictions = [];
    if (fs.existsSync(predictionsPath)) {
      const data = fs.readFileSync(predictionsPath, 'utf8');
      predictions = JSON.parse(data);
    }
    
    const prediction = {
      ...body,
      timestamp: new Date().toISOString(),
      id: `${body.game_pk}_${Date.now()}`
    };
    
    predictions.push(prediction);
    
    fs.writeFileSync(predictionsPath, JSON.stringify(predictions, null, 2));
    
    return Response.json({ success: true, id: prediction.id });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
