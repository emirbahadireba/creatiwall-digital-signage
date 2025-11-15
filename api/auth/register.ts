import { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

// Simple in-memory database for demo (in production, use a real database)
let database = {
  users: [] as any[],
  tenants: [] as any[],
  auditLogs: [] as any[]
};

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

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
      message: 'Method not allowed'
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

    // Validation
    if (!email || !password || !firstName || !lastName || !companyName) {
      return res.status(400).json({
        success: false,
        message: 'Tüm gerekli alanları doldurun'
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir email adresi girin'
      });
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Şifre en az 8 karakter olmalıdır'
      });
    }

    // Check if user already exists
    const existingUser = database.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Bu email adresi zaten kullanılıyor'
      });
    }

    // Check if company domain already exists
    const subdomain = companyDomain || companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const existingTenant = database.tenants.find((t: any) =>
      t.subdomain === subdomain || t.domain === `${subdomain}.creatiwall.com`
    );
    
    if (existingTenant) {
      return res.status(409).json({
        success: false,
        message: 'Bu şirket domain\'i zaten kullanılıyor'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create tenant
    const tenantId = uuidv4();
    const newTenant = {
      id: tenantId,
      name: companyName,
      domain: `${subdomain}.creatiwall.com`,
      subdomain: subdomain,
      plan: 'trial',
      status: 'active',
      settings: {
        maxUsers: 5,
        maxDevices: 10,
        maxStorage: '1GB',
        features: ['basic_widgets']
      },
      branding: {
        logo: null,
        primaryColor: '#ffc000',
        secondaryColor: '#333333'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Create user
    const userId = uuidv4();
    const newUser = {
      id: userId,
      tenantId: tenantId,
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      role,
      status: 'active',
      permissions: ['*'], // Tenant admin gets all permissions
      lastLogin: null,
      loginAttempts: 0,
      lockedUntil: null,
      emailVerified: true, // Auto-verify for now
      emailVerificationToken: null,
      passwordResetToken: null,
      passwordResetExpires: null,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      preferences: {
        language: 'tr',
        timezone: 'Europe/Istanbul',
        notifications: {
          email: true,
          browser: true,
          mobile: false
        }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to database
    database.tenants.push(newTenant);
    database.users.push(newUser);

    // Generate token
    const token = generateToken(newUser);

    // Log audit event
    const auditLog = {
      id: uuidv4(),
      tenantId: tenantId,
      userId: userId,
      action: 'user_registered',
      resource: 'auth',
      details: {
        email: email,
        companyName: companyName,
        role: role
      },
      ipAddress: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown',
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    database.auditLogs.push(auditLog);

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
      message: 'Sunucu hatası oluştu'
    });
  }
}