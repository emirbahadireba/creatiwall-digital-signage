import { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Import unified database
import { createClient } from '@supabase/supabase-js';

// Unified Database Interface
interface DatabaseInterface {
  findUserByEmail(email: string): Promise<any>;
  findTenantBySubdomain(subdomain: string): Promise<any>;
  findTenantByDomain(domain: string): Promise<any>;
  createUser(user: any): Promise<any>;
  createTenant(tenant: any): Promise<any>;
}

// Supabase Database Implementation
class SupabaseDatabase implements DatabaseInterface {
  private supabase: any;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
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
      return data;
    } catch (error) {
      console.error('Supabase findUserByEmail error:', error);
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
  private data: any = {};

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    try {
      // Try to read from environment variable first (for production)
      if (process.env.DATABASE_JSON) {
        this.data = JSON.parse(process.env.DATABASE_JSON);
        return;
      }
      
      // Fallback to file system (for development)
      try {
        const { readFileSync, existsSync } = require('fs');
        const { join } = require('path');
        const DATABASE_PATH = join(process.cwd(), 'server/data/database.json');
        
        if (existsSync(DATABASE_PATH)) {
          const data = readFileSync(DATABASE_PATH, 'utf8');
          this.data = JSON.parse(data);
          return;
        }
      } catch (fsError) {
        console.log('File system access failed, using fallback data');
      }
      
      // Fallback with empty database
      this.data = {
        users: [],
        tenants: [],
        auditLogs: []
      };
    } catch (error) {
      console.error('Error reading database:', error);
      this.data = { users: [], tenants: [], auditLogs: [] };
    }
  }

  async findUserByEmail(email: string): Promise<any> {
    return this.data.users?.find((u: any) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async findTenantBySubdomain(subdomain: string): Promise<any> {
    return this.data.tenants?.find((t: any) => t.subdomain === subdomain) || null;
  }

  async findTenantByDomain(domain: string): Promise<any> {
    return this.data.tenants?.find((t: any) => t.domain === domain) || null;
  }

  async createUser(user: any): Promise<any> {
    if (!this.data.users) this.data.users = [];
    this.data.users.push(user);
    console.log('✅ User saved to JSON database:', user.email);
    return user;
  }

  async createTenant(tenant: any): Promise<any> {
    if (!this.data.tenants) this.data.tenants = [];
    this.data.tenants.push(tenant);
    console.log('✅ Tenant saved to JSON database:', tenant.name);
    return tenant;
  }
}

// Factory function to create the appropriate database instance
function createDatabase(): DatabaseInterface {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('🔍 Environment Variables Debug:');
  console.log('SUPABASE_URL:', supabaseUrl ? 'SET' : 'NOT SET');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'SET' : 'NOT SET');
  console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('SUPABASE')));

  if (supabaseUrl && supabaseServiceKey) {
    console.log('🚀 Using Supabase PostgreSQL database for registration');
    return new SupabaseDatabase();
  } else {
    console.log('📁 Using JSON file database (fallback) for registration');
    console.log('❌ REASON: Missing environment variables');
    return new JsonDatabase();
  }
}

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
    id: user.id,
    tenantId: user.tenantId,
    email: user.email,
    role: user.role
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
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

    res.status(201).json({
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

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Sunucu hatası oluştu'
    });
  }
}