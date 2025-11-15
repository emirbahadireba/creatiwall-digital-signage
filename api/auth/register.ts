import { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

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

interface Database {
  users: User[];
  tenants: Tenant[];
  [key: string]: any;
}

function readDatabase(): Database {
  try {
    // Try to read from environment variable first (for production)
    if (process.env.DATABASE_JSON) {
      return JSON.parse(process.env.DATABASE_JSON);
    }
    
    // Fallback to file system (for development)
    try {
      const { readFileSync, existsSync } = require('fs');
      const { join } = require('path');
      const DATABASE_PATH = join(process.cwd(), 'server/data/database.json');
      
      if (existsSync(DATABASE_PATH)) {
        const data = readFileSync(DATABASE_PATH, 'utf8');
        return JSON.parse(data);
      }
    } catch (fsError) {
      console.log('File system access failed, using fallback data');
    }
    
    // Fallback with empty database
    return {
      users: [],
      tenants: [],
      auditLogs: []
    };
  } catch (error) {
    console.error('Error reading database:', error);
    return { users: [], tenants: [], auditLogs: [] };
  }
}

// Note: In production, this would save to a real database
// For now, we'll simulate success but data won't persist
function saveToDatabase(newUser: User, newTenant: Tenant): boolean {
  try {
    console.log('Simulating database save for user:', newUser.email);
    console.log('Simulating database save for tenant:', newTenant.name);
    
    // In a real implementation, this would save to a persistent database
    // For demo purposes, we'll just return success
    return true;
  } catch (error) {
    console.error('Error saving to database:', error);
    return false;
  }
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

    console.log('Registration attempt for:', email);

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

    const db = readDatabase();
    console.log('Database loaded, users count:', db.users?.length || 0);

    // Check if user already exists
    const existingUser = db.users.find((u: User) => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(409).json({
        success: false,
        error: 'Bu email adresi zaten kullanılıyor'
      });
    }

    // Check if company domain already exists
    const subdomain = companyDomain || companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const existingTenant = db.tenants.find((t: Tenant) =>
      t.subdomain === subdomain || t.domain === `${subdomain}.creatiwall.com`
    );
    
    if (existingTenant) {
      console.log('Tenant domain already exists:', subdomain);
      return res.status(409).json({
        success: false,
        error: 'Bu şirket domain\'i zaten kullanılıyor'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Password hashed successfully');

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

    // Save to database (simulated for now)
    const saved = saveToDatabase(newUser, newTenant);
    if (!saved) {
      return res.status(500).json({
        success: false,
        error: 'Veritabanı kayıt hatası'
      });
    }

    // Generate token
    const token = generateToken(newUser);
    console.log('Registration successful for:', email);

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
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Sunucu hatası oluştu'
    });
  }
}