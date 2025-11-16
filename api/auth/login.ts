import { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

// Unified Database Interface
interface DatabaseInterface {
  findUserByEmail(email: string): Promise<any>;
}

// Supabase Database Implementation
class SupabaseDatabase implements DatabaseInterface {
  private supabase: any;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || 'https://jlrsklomfbfoogaekfyd.supabase.co';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpscnNrbG9tZmJmb29nYWVrZnlkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzE0NTI3NSwiZXhwIjoyMDc4NzIxMjc1fQ.ugrz_KRYflk6uGPz3-uD0dIXeNJFiC4xurjyViLf8KE';
    
    console.log('🔧 Login SupabaseDatabase constructor - URL:', supabaseUrl);
    console.log('🔧 Login SupabaseDatabase constructor - Key:', supabaseServiceKey ? 'SET' : 'NOT SET');
    
    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  async findUserByEmail(email: string): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      // Convert snake_case to camelCase
      if (data) {
        return {
          id: data.id,
          tenantId: data.tenant_id,
          email: data.email,
          password: data.password,
          firstName: data.first_name,
          lastName: data.last_name,
          role: data.role,
          status: data.status,
          emailVerified: data.email_verified,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };
      }
      
      return null;
    } catch (error) {
      console.error('Supabase findUserByEmail error:', error);
      return null;
    }
  }
}

// JSON Database Implementation (Fallback)
class JsonDatabase implements DatabaseInterface {
  async findUserByEmail(email: string): Promise<any> {
    // Fallback database with existing users
    const users = [
      {
        id: "user-admin-001",
        tenantId: "tenant-demo-001",
        email: "admin@demo.com",
        password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXzgVrqZm9vO", // password: "admin123"
        firstName: "Admin",
        lastName: "User",
        role: "tenant_admin",
        status: "active",
        createdAt: "2025-11-14T04:00:00.000Z",
        updatedAt: "2025-11-14T04:00:00.000Z"
      }
    ];
    
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  }
}

// Factory function to create the appropriate database instance
function createDatabase(): DatabaseInterface {
  console.log('🚀 FORCING Supabase PostgreSQL database for login');
  return new SupabaseDatabase();
}

const JWT_SECRET = process.env.JWT_SECRET || '431cc51f80b54beb2905d81bfef8cab17fee760f5a2f36af07edb1189dae9205';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { email, password } = req.body;
    console.log('🔐 Login attempt for:', email);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email ve şifre gereklidir'
      });
    }

    // Initialize unified database
    const db = createDatabase();
    console.log('📊 Database initialized for login');

    // Use unified database to find user
    console.log('🔍 Searching for user in Supabase database...');
    const user = await db.findUserByEmail(email);
    console.log('👤 User found:', !!user);

    if (!user) {
      console.log('❌ User not found for email:', email);
      return res.status(401).json({
        success: false,
        error: 'Geçersiz email veya şifre'
      });
    }

    console.log('🔑 Comparing password for user:', user.id);
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('✅ Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password for user:', user.id);
      return res.status(401).json({
        success: false,
        error: 'Geçersiz email veya şifre'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    console.log('🎉 Login successful for user:', user.id);
    return res.status(200).json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      }
    });

  } catch (error) {
    console.error('💥 Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Sunucu hatası'
    });
  }
}