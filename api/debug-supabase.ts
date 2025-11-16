import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('🔍 Environment Variables Check:');
    console.log('SUPABASE_URL:', supabaseUrl ? 'SET' : 'NOT SET');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'SET' : 'NOT SET');

    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(200).json({
        success: false,
        message: 'Supabase environment variables eksik',
        debug: {
          SUPABASE_URL: supabaseUrl ? 'SET' : 'NOT SET',
          SUPABASE_SERVICE_ROLE_KEY: supabaseServiceKey ? 'SET' : 'NOT SET'
        }
      });
    }

    // Supabase bağlantısını test et
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Users tablosunu kontrol et
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);

    // Tenants tablosunu kontrol et
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('*')
      .limit(5);

    return res.status(200).json({
      success: true,
      message: 'Supabase bağlantısı başarılı',
      debug: {
        SUPABASE_URL: supabaseUrl ? 'SET' : 'NOT SET',
        SUPABASE_SERVICE_ROLE_KEY: supabaseServiceKey ? 'SET' : 'NOT SET',
        users: {
          count: users?.length || 0,
          data: users,
          error: usersError?.message
        },
        tenants: {
          count: tenants?.length || 0,
          data: tenants,
          error: tenantsError?.message
        }
      }
    });

  } catch (error) {
    console.error('❌ Supabase debug error:', error);
    return res.status(500).json({
      success: false,
      error: 'Supabase debug hatası',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}