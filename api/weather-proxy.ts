import { VercelRequest, VercelResponse } from '@vercel/node';

// OpenWeatherMap API Key - demo key for testing
const API_KEY = process.env.WEATHER_API_KEY || '4d126cdba24b8b7681a734020f48f8a0';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🌤️ Weather Proxy API called:', req.method, req.url);
  
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
    const { city, units = 'metric', lang = 'tr' } = req.query;
    
    if (!city || typeof city !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'City parameter is required'
      });
    }

    console.log('🌤️ Weather Proxy - Fetching:', city, units);

    // Demo mode - use demo data for testing
    const isDemoMode = API_KEY === 'demo' || API_KEY === 'test' || API_KEY === '4d126cdba24b8b7681a734020f48f8a0';
    if (isDemoMode) {
      const demoData = {
        name: city,
        main: {
          temp: Math.round(15 + Math.random() * 20), // Random temp between 15-35°C
          feels_like: Math.round(15 + Math.random() * 20),
          humidity: Math.round(40 + Math.random() * 40), // 40-80%
          pressure: Math.round(1000 + Math.random() * 50) // 1000-1050 hPa
        },
        weather: [{
          description: ['güneşli', 'parçalı bulutlu', 'bulutlu', 'hafif yağmurlu'][Math.floor(Math.random() * 4)],
          icon: ['01d', '02d', '03d', '10d'][Math.floor(Math.random() * 4)]
        }],
        wind: {
          speed: Math.round(Math.random() * 10 * 10) / 10 // 0-10 m/s with 1 decimal
        },
        sys: {
          country: 'TR'
        }
      };
      
      console.log('✅ Weather Proxy - Demo mode data for:', city);
      
      // Add cache headers
      res.setHeader('Cache-Control', 'public, max-age=600'); // Cache for 10 minutes
      
      return res.status(200).json({
        success: true,
        data: demoData,
        source: 'demo'
      });
    }

    // Real API call
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${units}&lang=${lang}`;
    
    console.log('🌐 Making API call to OpenWeatherMap...');
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'CreatiWall-Weather-Widget/1.0'
      },
      // Add timeout
      signal: AbortSignal.timeout(10000) // 10 seconds timeout
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Weather API error:', response.status, errorData);
      
      let errorMessage = 'Weather API error';
      if (response.status === 401) {
        errorMessage = 'Invalid API key';
      } else if (response.status === 404) {
        errorMessage = 'City not found';
      } else if (response.status === 429) {
        errorMessage = 'API rate limit exceeded';
      } else {
        errorMessage = `API error: ${response.status}`;
      }
      
      return res.status(response.status).json({
        success: false,
        message: errorMessage,
        details: errorData
      });
    }

    const data = await response.json();
    console.log('✅ Weather Proxy - Success for:', city);
    
    // Add cache headers
    res.setHeader('Cache-Control', 'public, max-age=600'); // Cache for 10 minutes
    
    return res.status(200).json({
      success: true,
      data: data,
      source: 'openweathermap'
    });

  } catch (error: any) {
    console.error('💥 Weather Proxy error:', error);
    
    // Handle timeout errors
    if (error.name === 'AbortError') {
      return res.status(408).json({
        success: false,
        message: 'Request timeout - Weather API took too long to respond'
      });
    }

    // Handle network errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'Weather API server is not reachable'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch weather data',
      error: error.message
    });
  }
}