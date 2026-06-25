import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const vegasPath = path.join(process.cwd(), 'data', 'vegas_lines.json');
    
    if (fs.existsSync(vegasPath)) {
      const vegasData = fs.readFileSync(vegasPath, 'utf8');
      const lines = JSON.parse(vegasData);
      
      return Response.json({
        success: true,
        games: lines,
        updated_at: new Date().toISOString()
      });
    } else {
      return Response.json({
        success: false,
        message: 'Vegas lines not available yet'
      });
    }
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
