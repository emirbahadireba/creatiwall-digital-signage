import { VercelRequest, VercelResponse } from '@vercel/node';

// Simple in-memory database for demo
let database = {
  playlists: [] as any[]
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      data: database.playlists
    });
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}