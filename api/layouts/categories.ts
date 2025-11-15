import { VercelRequest, VercelResponse } from '@vercel/node';

// Layout categories
const LAYOUT_CATEGORIES = [
  'fullscreen',
  'split',
  'grid',
  'sidebar',
  'creative',
  'dashboard',
  'ticker',
  'custom'
];

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
      data: LAYOUT_CATEGORIES
    });
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}