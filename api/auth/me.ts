import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

// Hardcoded Supabase credentials (same as register/login)
const supabaseUrl = 'https://ixqkqvhqfbpjpibhlqtb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4cWtxdmhxZmJwanBpYmhscXRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3MjU5NzEsImV4cCI6MjA0NzMwMTk3MX0.YCOkdOJNHS8tJoqeGBYyJlBxKOqaQkGOQKJmrOQKqhI';

const supabase = createClient(supabaseUrl, supabaseKey);

// JWT Secret (same as login/register)
const JWT_SECRET = process.env.JWT_SECRET || 'creatiwall-super-secret-jwt-key-2024';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('👤 Auth Me API called:', req.method, req.url);
  
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
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('🔑 Verifying token...');

    // Verify JWT token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log('✅ Token verified:', decoded.userId);
    } catch (jwtError) {
      console.error('❌ JWT verification failed:', jwtError);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Get user from Supabase
    console.log('👤 Getting user from Supabase:', decoded.userId);
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (userError || !user) {
      console.error('❌ User not found in Supabase:', userError);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get tenant from Supabase
    console.log('🏢 Getting tenant from Supabase:', user.tenant_id);
    
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', user.tenant_id)
      .single();

    if (tenantError || !tenant) {
      console.error('❌ Tenant not found in Supabase:', tenantError);
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    // Convert snake_case to camelCase for frontend
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      tenantId: user.tenant_id,
      preferences: user.preferences || {
        language: 'tr',
        timezone: 'Europe/Istanbul',
        notifications: {
          email: true,
          browser: true,
          mobile: false
        }
      }
    };

    const tenantData = {
      id: tenant.id,
      name: tenant.name,
      domain: tenant.domain,
      plan: tenant.plan,
      status: tenant.status,
      branding: tenant.branding || {
        logo: null,
        primaryColor: '#3B82F6',
        secondaryColor: '#6B7280'
      }
    };

    console.log('✅ User and tenant data retrieved successfully');

    return res.status(200).json({
      success: true,
      data: {
        user: userData,
        tenant: tenantData
      },
      source: 'supabase'
    });

  } catch (error) {
    console.error('💥 Auth Me API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}