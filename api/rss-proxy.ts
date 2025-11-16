import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('📰 RSS Proxy API called:', req.method, req.url);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const { url } = req.query;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'URL parameter is required'
      });
    }

    // URL validation
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      return res.status(400).json({
        success: false,
        message: 'Invalid URL'
      });
    }

    console.log('📰 RSS Proxy - Fetching:', url);

    // Use fetch API to get RSS content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml, */*'
      },
      // Add timeout
      signal: AbortSignal.timeout(10000) // 10 seconds timeout
    });

    if (!response.ok) {
      console.error('❌ RSS Proxy - HTTP error:', response.status, response.statusText);
      return res.status(response.status).json({
        success: false,
        message: `Failed to fetch RSS feed: ${response.status} ${response.statusText}`
      });
    }

    const data = await response.text();
    console.log('✅ RSS Proxy - Success, length:', data.length);

    // Set appropriate headers
    const contentType = response.headers.get('content-type') || 'application/xml';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes

    return res.status(200).send(data);

  } catch (error: any) {
    console.error('💥 RSS Proxy error:', error);
    
    // Handle timeout errors
    if (error.name === 'AbortError') {
      return res.status(408).json({
        success: false,
        message: 'Request timeout - RSS feed took too long to respond'
      });
    }

    // Handle network errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'RSS feed server is not reachable'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch RSS feed',
      error: error.message
    });
  }
}