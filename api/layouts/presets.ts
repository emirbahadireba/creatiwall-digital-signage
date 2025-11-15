import { VercelRequest, VercelResponse } from '@vercel/node';

// Layout dimensions presets
const LAYOUT_PRESETS = {
  'landscape-hd': { width: 1920, height: 1080, name: 'Landscape HD (1920x1080)' },
  'portrait-hd': { width: 1080, height: 1920, name: 'Portrait HD (1080x1920)' },
  'landscape-4k': { width: 3840, height: 2160, name: 'Landscape 4K (3840x2160)' },
  'portrait-4k': { width: 2160, height: 3840, name: 'Portrait 4K (2160x3840)' },
  'square-hd': { width: 1080, height: 1080, name: 'Square HD (1080x1080)' },
  'ultrawide': { width: 2560, height: 1080, name: 'Ultrawide (2560x1080)' },
  'custom': { width: 1920, height: 1080, name: 'Custom' }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      data: LAYOUT_PRESETS
    });
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}