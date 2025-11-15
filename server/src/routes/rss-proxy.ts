import { Router } from 'express';
import https from 'https';
import http from 'http';

const router = Router();

// RSS Proxy endpoint - CORS sorununu çözmek için
router.get('/fetch', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL parametresi gerekli' });
    }

    // URL validation
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      return res.status(400).json({ error: 'Geçersiz URL' });
    }

    console.log('RSS Proxy - Fetching:', url);

    // Node.js http/https kullanarak fetch yapıyoruz
    const protocol = parsedUrl.protocol === 'https:' ? https : http;
    
    protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
      }
    }, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        console.log('RSS Proxy - Success, length:', data.length);
        res.setHeader('Content-Type', response.headers['content-type'] || 'application/xml');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.send(data);
      });
    }).on('error', (error) => {
      console.error('RSS Proxy - HTTP error:', error);
      res.status(500).json({ 
        error: 'RSS feed alınırken hata oluştu', 
        details: error.message 
      });
    });

  } catch (error: any) {
    console.error('RSS Proxy error:', error);
    res.status(500).json({ 
      error: 'RSS feed alınırken hata oluştu', 
      details: error.message 
    });
  }
});

export default router;

