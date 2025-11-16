import { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';

// Unified Database Interface
interface DatabaseInterface {
  findUserByEmail(email: string): Promise<any>;
  findTenantBySubdomain(subdomain: string): Promise<any>;
  findTenantByDomain(domain: string): Promise<any>;
  createUser(user: any): Promise<any>;
  createTenant(tenant: any): Promise<any>;
  findUserById(id: string): Promise<any>;
}

// Supabase Database Implementation
class SupabaseDatabase implements DatabaseInterface {
  private supabase: any;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || 'https://jlrsklomfbfoogaekfyd.supabase.co';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpscnNrbG9tZmJmb29nYWVrZnlkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzE0NTI3NSwiZXhwIjoyMDc4NzIxMjc1fQ.ugrz_KRYflk6uGPz3-uD0dIXeNJFiC4xurjyViLf8KE';
    
    console.log('🔧 SupabaseDatabase constructor - URL:', supabaseUrl);
    console.log('🔧 SupabaseDatabase constructor - Key:', supabaseServiceKey ? 'SET' : 'NOT SET');
    
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

  async findUserById(id: string): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      // Convert snake_case to camelCase
      if (data) {
        return {
          id: data.id,
          tenantId: data.tenant_id,
          email: data.email,
          firstName: data.first_name,
          lastName: data.last_name,
          role: data.role,
          status: data.status,
          emailVerified: data.email_verified,
          preferences: data.preferences,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };
      }
      
      return null;
    } catch (error) {
      console.error('Supabase findUserById error:', error);
      return null;
    }
  }

  async findTenantBySubdomain(subdomain: string): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('tenants')
        .select('*')
        .eq('subdomain', subdomain)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Supabase findTenantBySubdomain error:', error);
      return null;
    }
  }

  async findTenantByDomain(domain: string): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('tenants')
        .select('*')
        .eq('domain', domain)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Supabase findTenantByDomain error:', error);
      return null;
    }
  }

  async createUser(user: any): Promise<any> {
    try {
      const now = new Date().toISOString();
      const supabaseUser = {
        id: user.id,
        tenant_id: user.tenantId,
        email: user.email,
        password: user.password,
        first_name: user.firstName,
        last_name: user.lastName,
        role: user.role,
        status: 'active',
        email_verified: true,
        created_at: now,
        updated_at: now
      };

      const { data, error } = await this.supabase
        .from('users')
        .insert(supabaseUser)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Supabase createUser error:', error);
      throw error;
    }
  }

  async createTenant(tenant: any): Promise<any> {
    try {
      const now = new Date().toISOString();
      const supabaseTenant = {
        id: tenant.id,
        name: tenant.name,
        domain: tenant.domain,
        subdomain: tenant.subdomain,
        plan: tenant.plan,
        status: tenant.status,
        created_at: now,
        updated_at: now
      };

      const { data, error } = await this.supabase
        .from('tenants')
        .insert(supabaseTenant)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Supabase createTenant error:', error);
      throw error;
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
      },
      {
        id: "user-test-001",
        tenantId: "tenant-test-001",
        email: "test@test.com",
        password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXzgVrqZm9vO", // password: "123456"
        firstName: "Test",
        lastName: "User",
        role: "tenant_admin",
        status: "active",
        createdAt: "2025-11-16T21:00:00.000Z",
        updatedAt: "2025-11-16T21:00:00.000Z"
      },
      {
        id: "user-emirbahadir-001",
        tenantId: "tenant-emirbahadir-001",
        email: "emirbahadir@gmail.com",
        password: "$2b$12$8K7qGxvWxJ5nF2mH9pL3qOzYvX4wR6tE8sA1bC3dF5gH7jK9mN2pQ", // password: "134679Eba"
        firstName: "Emir Bahadir",
        lastName: "Eba",
        role: "tenant_admin",
        status: "active",
        createdAt: "2025-11-16T21:00:00.000Z",
        updatedAt: "2025-11-16T21:00:00.000Z"
      }
    ];
    
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  }

  async findUserById(id: string): Promise<any> {
    const users = [
      {
        id: "user-admin-001",
        tenantId: "tenant-demo-001",
        email: "admin@demo.com",
        firstName: "Admin",
        lastName: "User",
        role: "tenant_admin",
        status: "active",
        preferences: {
          language: 'tr',
          timezone: 'Europe/Istanbul',
          notifications: {
            email: true,
            browser: true,
            mobile: false
          }
        },
        createdAt: "2025-11-14T04:00:00.000Z",
        updatedAt: "2025-11-14T04:00:00.000Z"
      },
      {
        id: "user-test-001",
        tenantId: "tenant-test-001",
        email: "test@test.com",
        firstName: "Test",
        lastName: "User",
        role: "tenant_admin",
        status: "active",
        preferences: {
          language: 'tr',
          timezone: 'Europe/Istanbul',
          notifications: {
            email: true,
            browser: true,
            mobile: false
          }
        },
        createdAt: "2025-11-16T21:00:00.000Z",
        updatedAt: "2025-11-16T21:00:00.000Z"
      },
      {
        id: "user-emirbahadir-001",
        tenantId: "tenant-emirbahadir-001",
        email: "emirbahadir@gmail.com",
        firstName: "Emir Bahadir",
        lastName: "Eba",
        role: "tenant_admin",
        status: "active",
        preferences: {
          language: 'tr',
          timezone: 'Europe/Istanbul',
          notifications: {
            email: true,
            browser: true,
            mobile: false
          }
        },
        createdAt: "2025-11-16T21:00:00.000Z",
        updatedAt: "2025-11-16T21:00:00.000Z"
      }
    ];
    
    const user = users.find(u => u.id === id);
    return user || null;
  }

  async findTenantBySubdomain(subdomain: string): Promise<any> {
    return null;
  }

  async findTenantByDomain(domain: string): Promise<any> {
    return null;
  }

  async createUser(user: any): Promise<any> {
    console.log('✅ User saved to JSON database:', user.email);
    return user;
  }

  async createTenant(tenant: any): Promise<any> {
    console.log('✅ Tenant saved to JSON database:', tenant.name);
    return tenant;
  }
}

// Factory function to create the appropriate database instance
function createDatabase(): DatabaseInterface {
  console.log('🚀 FORCING Supabase PostgreSQL database');
  return new SupabaseDatabase();
}

const JWT_SECRET = process.env.JWT_SECRET || '431cc51f80b54beb2905d81bfef8cab17fee760f5a2f36af07edb1189dae9205';

// Type definitions
interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
  createdAt: string;
}

interface Tenant {
  id: string;
  name: string;
  domain: string;
  subdomain: string;
  plan: string;
  status: string;
  createdAt: string;
}

const generateToken = (user: { id: string; tenantId: string; email: string; role: string }): string => {
  const payload = {
    userId: user.id,
    id: user.id,
    tenantId: user.tenantId,
    email: user.email,
    role: user.role
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🔐 Auth API called:', req.method, req.url);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req;

  try {
    // Handle /auth/login
    if (req.method === 'POST' && req.body?.email && req.body?.password && !req.body?.firstName) {
      console.log('🔐 Login request');
      
      const { email, password } = req.body;

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
      const token = generateToken(user);

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
    }

    // Handle /auth/register
    if (req.method === 'POST' && req.body?.firstName) {
      console.log('📝 Register request');
      
      const {
        email,
        password,
        firstName,
        lastName,
        companyName,
        companyDomain,
        role = 'tenant_admin'
      } = req.body;

      console.log('🔐 Registration attempt for:', email);

      // Validation
      if (!email || !password || !firstName || !lastName || !companyName) {
        return res.status(400).json({
          success: false,
          error: 'Tüm gerekli alanları doldurun'
        });
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Geçerli bir email adresi girin'
        });
      }

      // Password strength validation
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          error: 'Şifre en az 8 karakter olmalıdır'
        });
      }

      // Initialize unified database
      const db = createDatabase();
      console.log('📊 Database initialized for registration');

      // Check if user already exists
      const existingUser = await db.findUserByEmail(email);
      if (existingUser) {
        console.log('❌ User already exists:', email);
        return res.status(409).json({
          success: false,
          error: 'Bu email adresi zaten kullanılıyor'
        });
      }

      // Check if company domain already exists
      const subdomain = companyDomain || companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const existingTenantBySubdomain = await db.findTenantBySubdomain(subdomain);
      const existingTenantByDomain = await db.findTenantByDomain(`${subdomain}.creatiwall.com`);
      
      if (existingTenantBySubdomain || existingTenantByDomain) {
        console.log('❌ Tenant domain already exists:', subdomain);
        return res.status(409).json({
          success: false,
          error: 'Bu şirket domain\'i zaten kullanılıyor'
        });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      console.log('🔒 Password hashed successfully');

      // Create tenant
      const tenantId = uuidv4();
      const newTenant: Tenant = {
        id: tenantId,
        name: companyName,
        domain: `${subdomain}.creatiwall.com`,
        subdomain: subdomain,
        plan: 'trial',
        status: 'active',
        createdAt: new Date().toISOString()
      };

      // Create user
      const userId = uuidv4();
      const newUser: User = {
        id: userId,
        tenantId: tenantId,
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        role,
        createdAt: new Date().toISOString()
      };

      // Save to unified database
      try {
        console.log('🔄 Attempting to save tenant:', newTenant);
        const savedTenant = await db.createTenant(newTenant);
        console.log('✅ Tenant saved:', savedTenant);
        
        console.log('🔄 Attempting to save user:', newUser);
        const savedUser = await db.createUser(newUser);
        console.log('✅ User saved:', savedUser);
        
        console.log('✅ Registration successful for:', email);
      } catch (dbError) {
        console.error('❌ Database save error:', dbError);
        console.error('❌ Error details:', JSON.stringify(dbError, null, 2));
        return res.status(500).json({
          success: false,
          error: 'Veritabanı kayıt hatası: ' + (dbError instanceof Error ? dbError.message : 'Unknown error')
        });
      }

      // Generate token
      const token = generateToken(newUser);

      return res.status(201).json({
        success: true,
        message: 'Hesap başarıyla oluşturuldu',
        data: {
          token,
          user: {
            id: newUser.id,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            role: newUser.role,
            tenantId: newUser.tenantId
          },
          tenant: {
            id: newTenant.id,
            name: newTenant.name,
            domain: newTenant.domain,
            plan: newTenant.plan
          }
        }
      });
    }

    // Handle /auth/me
    if (req.method === 'GET') {
      console.log('👤 Me request');
      
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

      // Initialize database
      const db = createDatabase();

      // Get user from database
      console.log('👤 Getting user from database:', decoded.userId);
      const user = await db.findUserById(decoded.userId);

      if (!user) {
        console.error('❌ User not found in database:', decoded.userId);
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Get tenant from Supabase
      console.log('🏢 Getting tenant from Supabase:', user.tenantId);
      
      const supabase = createClient(
        process.env.SUPABASE_URL || 'https://jlrsklomfbfoogaekfyd.supabase.co',
        process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpscnNrbG9tZmJmb29nYWVrZnlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxNDUyNzUsImV4cCI6MjA3ODcyMTI3NX0.bCua_8dkQm03_0kvtRCRIuj8Knycax06pw7yPRomIH0'
      );

      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', user.tenantId)
        .single();

      if (tenantError || !tenant) {
        console.error('❌ Tenant not found in Supabase:', tenantError);
        // Don't fail completely, just return user data without tenant
      }

      // Prepare user data
      const userData = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
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

      const tenantData = tenant ? {
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
      } : null;

      console.log('✅ User data retrieved successfully');

      return res.status(200).json({
        success: true,
        data: {
          user: userData,
          tenant: tenantData
        },
        source: 'supabase'
      });
    }

    return res.status(404).json({
      success: false,
      message: 'Endpoint not found'
    });

  } catch (error) {
    console.error('💥 Auth API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}