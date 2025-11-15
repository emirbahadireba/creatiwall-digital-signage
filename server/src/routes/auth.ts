import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { 
  generateToken, 
  authenticate, 
  trackLoginAttempts, 
  isAccountLocked,
  rateLimit,
  AuthenticatedRequest 
} from '../middleware/auth.js';

const router = express.Router();

// Rate limiting for auth endpoints
const authRateLimit = rateLimit(10, 15 * 60 * 1000); // 10 requests per 15 minutes

// Register endpoint
router.post('/register', authRateLimit, async (req, res) => {
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
    const existingUser = db.database.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Bu email adresi zaten kullanılıyor'
      });
    }

    // Check if company domain already exists
    const subdomain = companyDomain || companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const existingTenant = db.database.tenants.find((t: any) =>
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
    db.database.tenants.push(newTenant);
    db.database.users.push(newUser);
    db.saveDatabase();

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
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    };
    const auditLogWithCreatedAt = {
      ...auditLog,
      createdAt: new Date().toISOString()
    };
    db.database.auditLogs.push(auditLogWithCreatedAt);
    db.saveDatabase();

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
});

// Login endpoint
router.post('/login', authRateLimit, async (req, res) => {
  try {
    const { email, password, rememberMe = false } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email ve şifre gereklidir'
      });
    }

    // Find user
    const user = db.database.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      await trackLoginAttempts(email, false);
      return res.status(401).json({
        success: false,
        message: 'Geçersiz email veya şifre'
      });
    }

    // Check if account is locked
    if (isAccountLocked(user)) {
      return res.status(423).json({
        success: false,
        message: 'Hesap geçici olarak kilitlendi. Lütfen daha sonra tekrar deneyin.',
        lockedUntil: user.lockedUntil
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Hesap aktif değil'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await trackLoginAttempts(email, false);
      return res.status(401).json({
        success: false,
        message: 'Geçersiz email veya şifre'
      });
    }

    // Check tenant status
    const tenant = db.database.tenants.find((t: any) => t.id === user.tenantId);
    if (!tenant || tenant.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Şirket hesabı aktif değil'
      });
    }

    // Successful login
    await trackLoginAttempts(email, true);

    // Generate token with longer expiry if remember me is checked
    const tokenExpiry = rememberMe ? '30d' : '7d';
    process.env.JWT_EXPIRES_IN = tokenExpiry;
    const token = generateToken(user);

    // Create session record
    const sessionId = uuidv4();
    const session = {
      id: sessionId,
      userId: user.id,
      tenantId: user.tenantId,
      token: token,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      rememberMe: rememberMe,
      expiresAt: new Date(Date.now() + (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };
    db.database.userSessions.push(session);

    // Log audit event
    const auditLog = {
      id: uuidv4(),
      tenantId: user.tenantId,
      userId: user.id,
      action: 'user_login',
      resource: 'auth',
      details: {
        email: user.email,
        rememberMe: rememberMe,
        sessionId: sessionId
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    };
    const auditLogWithCreatedAt = {
      ...auditLog,
      createdAt: new Date().toISOString()
    };
    db.database.auditLogs.push(auditLogWithCreatedAt);
    db.saveDatabase();

    res.json({
      success: true,
      message: 'Giriş başarılı',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenantId: user.tenantId,
          preferences: user.preferences
        },
        tenant: {
          id: tenant.id,
          name: tenant.name,
          domain: tenant.domain,
          plan: tenant.plan,
          branding: tenant.branding
        },
        session: {
          id: sessionId,
          expiresAt: session.expiresAt
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası oluştu'
    });
  }
});

// Logout endpoint
router.post('/logout', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // Find and remove session
      const sessionIndex = db.database.userSessions.findIndex((s: any) => s.token === token);
      if (sessionIndex > -1) {
        db.database.userSessions.splice(sessionIndex, 1);
      }

      // Log audit event
      const auditLog = {
        id: uuidv4(),
        tenantId: req.user!.tenantId,
        userId: req.user!.id,
        action: 'user_logout',
        resource: 'auth',
        details: {
          email: req.user!.email
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      };
      const auditLogWithCreatedAt = {
        ...auditLog,
        createdAt: new Date().toISOString()
      };
      db.database.auditLogs.push(auditLogWithCreatedAt);
      db.saveDatabase();
    }

    res.json({
      success: true,
      message: 'Çıkış başarılı'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası oluştu'
    });
  }
});

// Get current user profile
router.get('/me', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const user = db.database.users.find((u: any) => u.id === req.user!.id);
    const tenant = db.database.tenants.find((t: any) => t.id === req.user!.tenantId);

    if (!user || !tenant) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı veya şirket bulunamadı'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenantId: user.tenantId,
          preferences: user.preferences,
          lastLogin: user.lastLogin,
          emailVerified: user.emailVerified,
          twoFactorEnabled: user.twoFactorEnabled
        },
        tenant: {
          id: tenant.id,
          name: tenant.name,
          domain: tenant.domain,
          plan: tenant.plan,
          branding: tenant.branding,
          settings: tenant.settings
        },
        permissions: req.user!.permissions
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası oluştu'
    });
  }
});

// Refresh token endpoint
router.post('/refresh', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const user = db.database.users.find((u: any) => u.id === req.user!.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    // Generate new token
    const newToken = generateToken(user);

    // Update session
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const oldToken = authHeader.substring(7);
      const session = db.database.userSessions.find((s: any) => s.token === oldToken);
      if (session) {
        session.token = newToken;
        session.lastActivity = new Date().toISOString();
        db.saveDatabase();
      }
    }

    res.json({
      success: true,
      message: 'Token yenilendi',
      data: {
        token: newToken
      }
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası oluştu'
    });
  }
});

export default router;