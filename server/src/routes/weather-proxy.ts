import { Router } from 'express';

const router = Router();

// OpenWeatherMap API Key
const API_KEY = process.env.WEATHER_API_KEY || '4d126cdba24b8b7681a734020f48f8a0';

// Weather Proxy endpoint
router.get('/current', async (req, res) => {
  try {
    const { city, units = 'metric', lang = 'tr' } = req.query;
    
    if (!city || typeof city !== 'string') {
      return res.status(400).json({ error: 'Şehir parametresi gerekli' });
    }

    console.log('Weather Proxy - Fetching:', city, units);

    // Demo mode - use demo data for testing
    const isDemoMode = API_KEY === 'demo' || API_KEY === 'test';
    if (isDemoMode) {
      const demoData = {
        name: city,
        main: {
          temp: 22,
          feels_like: 21,
          humidity: 65,
          pressure: 1013
        },
        weather: [{
          description: 'parçalı bulutlu',
          icon: '02d'
        }],
        wind: {
          speed: 3.5
        }
      };
      
      console.log('Weather Proxy - Demo mode');
      return res.json(demoData);
    }

    // Real API call
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${units}&lang=${lang}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Weather API error:', response.status, errorData);
      
      if (response.status === 401) {
        throw new Error('API key geçersiz');
      } else if (response.status === 404) {
        throw new Error('Şehir bulunamadı');
      } else {
        throw new Error(`API hatası: ${response.status}`);
      }
    }

    const data = await response.json();
    console.log('Weather Proxy - Success:', city);
    
    res.json(data);

  } catch (error: any) {
    console.error('Weather Proxy error:', error);
    res.status(500).json({ 
      error: 'Hava durumu alınırken hata oluştu', 
      details: error.message 
    });
  }
});

export default router;

