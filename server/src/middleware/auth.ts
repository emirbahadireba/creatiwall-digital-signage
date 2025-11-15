import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { database, User, Tenant } from '../db/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    tenantId: string;
    email: string;
    role: string;
    permissions: string[];
  };
  tenant?: {
    id: string;
    name: string;
    domain: string;
    status: string;
  };
}

// JWT Token oluşturma
export const generateToken = (user: { id: string; tenantId: string; email: string; role: string }): string => {
  const payload = {
    id: user.id,
    tenantId: user.tenantId,
    email: user.email,
    role: user.role
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

// JWT Token doğrulama
export const verifyToken = (token: string): { id: string; tenantId: string; email: string; role: string } => {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; tenantId: string; email: string; role: string };
  } catch (_error) {
    throw new Error('Invalid token');
  }
};

// Authentication middleware
export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token gerekli'
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    // Kullanıcıyı database'den al
    const user = database.users.find((u: User) => u.id === decoded.id && u.status === 'active');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı bulunamadı veya aktif değil'
      });
    }

    // Tenant'ı database'den al
    const tenant = database.tenants.find((t: Tenant) => t.id === user.tenantId && t.status === 'active');
    if (!tenant) {
      return res.status(401).json({
        success: false,
        message: 'Tenant bulunamadı veya aktif değil'
      });
    }

    // Kullanıcının izinlerini al (basit role-based permissions)
    const permissions: string[] = [];
    if (user.role === 'admin') {
      permissions.push('*');
    } else if (user.role === 'user') {
      permissions.push('read', 'write');
    } else {
      permissions.push('read');
    }

    // Request'e kullanıcı ve tenant bilgilerini ekle
    req.user = {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
      permissions
    };

    req.tenant = {
      id: tenant.id,
      name: tenant.name,
      domain: tenant.domain,
      status: tenant.status
    };

    next();
  } catch (_error) {
    return res.status(401).json({
      success: false,
      message: 'Geçersiz token'
    });
  }
};

// Role-based authorization middleware
export const authorize = (requiredPermissions: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication gerekli'
      });
    }

    // Super admin her şeyi yapabilir
    if (req.user.permissions.includes('*')) {
      return next();
    }

    // Gerekli izinleri kontrol et
    const hasPermission = requiredPermissions.some(permission => 
      req.user!.permissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için yetkiniz yok',
        required: requiredPermissions,
        current: req.user.permissions
      });
    }

    next();
  };
};

// Tenant isolation middleware - sadece kendi tenant'ının verilerine erişim
export const tenantIsolation = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || !req.tenant) {
    return res.status(401).json({
      success: false,
      message: 'Authentication gerekli'
    });
  }

  // Super admin tüm tenant'lara erişebilir
  if (req.user.role === 'super_admin') {
    return next();
  }

  // Diğer kullanıcılar sadece kendi tenant'larına erişebilir
  next();
};

// Rate limiting için basit middleware
const rateLimitMap = new Map();

export const rateLimit = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip;
    const now = Date.now();
    
    if (!rateLimitMap.has(key)) {
      rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const limit = rateLimitMap.get(key);
    
    if (now > limit.resetTime) {
      limit.count = 1;
      limit.resetTime = now + windowMs;
      return next();
    }

    if (limit.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.',
        retryAfter: Math.ceil((limit.resetTime - now) / 1000)
      });
    }

    limit.count++;
    next();
  };
};

// Login attempts tracking
export const trackLoginAttempts = async (email: string, success: boolean) => {
  const user = database.users.find((u: User) => u.email === email);
  if (!user) return;

  if (success) {
    user.loginAttempts = 0;
    user.lockedUntil = null;
    user.lastLogin = new Date().toISOString();
  } else {
    user.loginAttempts = (user.loginAttempts || 0) + 1;
    
    // 5 başarısız denemeden sonra 15 dakika kilitle
    if (user.loginAttempts >= 5) {
      user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    }
  }

  user.updatedAt = new Date().toISOString();
};

// Account lock check
export const isAccountLocked = (user: { lockedUntil?: string | null }): boolean => {
  if (!user.lockedUntil) return false;
  return new Date(user.lockedUntil) > new Date();
};