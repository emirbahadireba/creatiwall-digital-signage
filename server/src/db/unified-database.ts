import { createClient } from '@supabase/supabase-js';
import { Database } from './types.js';
import { database as jsonDatabase, saveDatabase } from './database.js';

// Types matching our existing structure
export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
  status: string;
  loginAttempts?: number;
  lockedUntil?: string | null;
  lastLogin?: string | null;
  preferences?: any;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  permissions?: string[];
  passwordResetToken?: string | null;
  passwordResetExpires?: string | null;
  emailVerificationToken?: string | null;
  twoFactorSecret?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  subdomain: string;
  plan: string;
  status: string;
  settings?: any;
  branding?: {
    logo: string | null;
    primaryColor: string;
    secondaryColor: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  id: string;
  userId: string;
  tenantId: string;
  token: string;
  ipAddress?: string;
  userAgent?: string;
  rememberMe?: boolean;
  expiresAt: string;
  createdAt: string;
  lastActivity: string;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  userId: string;
  action: string;
  resource: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  createdAt: string;
}

// Database interface
export interface DatabaseInterface {
  // Users
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(id: string): Promise<User | null>;
  createUser(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | null>;
  
  // Tenants
  findTenantById(id: string): Promise<Tenant | null>;
  findTenantByDomain(domain: string): Promise<Tenant | null>;
  findTenantBySubdomain(subdomain: string): Promise<Tenant | null>;
  createTenant(tenant: Omit<Tenant, 'createdAt' | 'updatedAt'>): Promise<Tenant>;
  
  // Sessions
  createSession(session: Omit<UserSession, 'createdAt' | 'lastActivity'>): Promise<UserSession>;
  findSessionByToken(token: string): Promise<UserSession | null>;
  deleteSession(token: string): Promise<boolean>;
  
  // Audit Logs
  createAuditLog(log: Omit<AuditLog, 'createdAt'>): Promise<AuditLog>;
}

// Supabase row types
type SupabaseUserRow = Database['public']['Tables']['users']['Row'];
type SupabaseTenantRow = Database['public']['Tables']['tenants']['Row'];
type SupabaseSessionRow = Database['public']['Tables']['user_sessions']['Row'];
type SupabaseAuditRow = Database['public']['Tables']['audit_logs']['Row'];

// Supabase implementation
class SupabaseDatabase implements DatabaseInterface {
  private supabase: ReturnType<typeof createClient<Database>>;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    this.supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  private convertSupabaseUserToUser(data: SupabaseUserRow): User {
    return {
      id: data.id,
      email: data.email,
      password: data.password,
      firstName: data.first_name,
      lastName: data.last_name,
      role: data.role,
      tenantId: data.tenant_id,
      status: data.status,
      loginAttempts: data.login_attempts,
      lockedUntil: data.locked_until,
      lastLogin: data.last_login,
      preferences: data.preferences as any,
      emailVerified: data.email_verified,
      twoFactorEnabled: data.two_factor_enabled,
      permissions: data.permissions,
      passwordResetToken: data.password_reset_token,
      passwordResetExpires: data.password_reset_expires,
      emailVerificationToken: data.email_verification_token,
      twoFactorSecret: data.two_factor_secret,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  async findUserByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();
      
      if (error || !data) return null;
      
      return this.convertSupabaseUserToUser(data as SupabaseUserRow);
    } catch (error) {
      console.error('Supabase findUserByEmail error:', error);
      return null;
    }
  }

  async findUserById(id: string): Promise<User | null> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error || !data) return null;
      
      return this.convertSupabaseUserToUser(data as SupabaseUserRow);
    } catch (error) {
      console.error('Supabase findUserById error:', error);
      return null;
    }
  }

  async createUser(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    try {
      const now = new Date().toISOString();
      
      // Convert our format to Supabase format
      const supabaseUser = {
        id: user.id,
        tenant_id: user.tenantId,
        email: user.email,
        password: user.password,
        first_name: user.firstName,
        last_name: user.lastName,
        role: user.role,
        status: user.status,
        permissions: user.permissions || [],
        last_login: user.lastLogin || null,
        login_attempts: user.loginAttempts || 0,
        locked_until: user.lockedUntil || null,
        email_verified: user.emailVerified || true,
        email_verification_token: user.emailVerificationToken || null,
        password_reset_token: user.passwordResetToken || null,
        password_reset_expires: user.passwordResetExpires || null,
        two_factor_enabled: user.twoFactorEnabled || false,
        two_factor_secret: user.twoFactorSecret || null,
        preferences: user.preferences || {},
        created_at: now,
        updated_at: now
      };

      const { data, error } = await this.supabase
        .from('users')
        .insert(supabaseUser as any)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from insert');
      
      return this.convertSupabaseUserToUser(data as SupabaseUserRow);
    } catch (error) {
      console.error('Supabase createUser error:', error);
      throw error;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    try {
      const supabaseUpdates: any = {
        updated_at: new Date().toISOString()
      };

      // Convert field names
      if (updates.firstName !== undefined) supabaseUpdates.first_name = updates.firstName;
      if (updates.lastName !== undefined) supabaseUpdates.last_name = updates.lastName;
      if (updates.tenantId !== undefined) supabaseUpdates.tenant_id = updates.tenantId;
      if (updates.loginAttempts !== undefined) supabaseUpdates.login_attempts = updates.loginAttempts;
      if (updates.lockedUntil !== undefined) supabaseUpdates.locked_until = updates.lockedUntil;
      if (updates.lastLogin !== undefined) supabaseUpdates.last_login = updates.lastLogin;
      if (updates.emailVerified !== undefined) supabaseUpdates.email_verified = updates.emailVerified;
      if (updates.twoFactorEnabled !== undefined) supabaseUpdates.two_factor_enabled = updates.twoFactorEnabled;
      if (updates.passwordResetToken !== undefined) supabaseUpdates.password_reset_token = updates.passwordResetToken;
      if (updates.passwordResetExpires !== undefined) supabaseUpdates.password_reset_expires = updates.passwordResetExpires;
      if (updates.emailVerificationToken !== undefined) supabaseUpdates.email_verification_token = updates.emailVerificationToken;
      if (updates.twoFactorSecret !== undefined) supabaseUpdates.two_factor_secret = updates.twoFactorSecret;

      // Direct field mappings
      ['email', 'password', 'role', 'status', 'permissions', 'preferences'].forEach(field => {
        if (updates[field as keyof User] !== undefined) {
          supabaseUpdates[field] = updates[field as keyof User];
        }
      });

      const { data, error } = await (this.supabase as any)
        .from('users')
        .update(supabaseUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error || !data) return null;

      return this.convertSupabaseUserToUser(data as SupabaseUserRow);
    } catch (error) {
      console.error('Supabase updateUser error:', error);
      return null;
    }
  }

  async findTenantById(id: string): Promise<Tenant | null> {
    try {
      const { data, error } = await this.supabase
        .from('tenants')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error || !data) return null;
      
      const tenantData = data as SupabaseTenantRow;
      return {
        id: tenantData.id,
        name: tenantData.name,
        domain: tenantData.domain,
        subdomain: tenantData.subdomain,
        plan: tenantData.plan,
        status: tenantData.status,
        settings: tenantData.settings as any,
        branding: tenantData.branding as any,
        createdAt: tenantData.created_at,
        updatedAt: tenantData.updated_at
      };
    } catch (error) {
      console.error('Supabase findTenantById error:', error);
      return null;
    }
  }

  async findTenantByDomain(domain: string): Promise<Tenant | null> {
    try {
      const { data, error } = await this.supabase
        .from('tenants')
        .select('*')
        .eq('domain', domain)
        .single();
      
      if (error || !data) return null;
      
      const tenantData = data as SupabaseTenantRow;
      return {
        id: tenantData.id,
        name: tenantData.name,
        domain: tenantData.domain,
        subdomain: tenantData.subdomain,
        plan: tenantData.plan,
        status: tenantData.status,
        settings: tenantData.settings as any,
        branding: tenantData.branding as any,
        createdAt: tenantData.created_at,
        updatedAt: tenantData.updated_at
      };
    } catch (error) {
      console.error('Supabase findTenantByDomain error:', error);
      return null;
    }
  }

  async findTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
    try {
      const { data, error } = await this.supabase
        .from('tenants')
        .select('*')
        .eq('subdomain', subdomain)
        .single();
      
      if (error || !data) return null;
      
      const tenantData = data as SupabaseTenantRow;
      return {
        id: tenantData.id,
        name: tenantData.name,
        domain: tenantData.domain,
        subdomain: tenantData.subdomain,
        plan: tenantData.plan,
        status: tenantData.status,
        settings: tenantData.settings as any,
        branding: tenantData.branding as any,
        createdAt: tenantData.created_at,
        updatedAt: tenantData.updated_at
      };
    } catch (error) {
      console.error('Supabase findTenantBySubdomain error:', error);
      return null;
    }
  }

  async createTenant(tenant: Omit<Tenant, 'createdAt' | 'updatedAt'>): Promise<Tenant> {
    try {
      const now = new Date().toISOString();
      const supabaseTenant = {
        ...tenant,
        created_at: now,
        updated_at: now
      };

      const { data, error } = await this.supabase
        .from('tenants')
        .insert(supabaseTenant as any)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from insert');
      
      const tenantData = data as SupabaseTenantRow;
      return {
        id: tenantData.id,
        name: tenantData.name,
        domain: tenantData.domain,
        subdomain: tenantData.subdomain,
        plan: tenantData.plan,
        status: tenantData.status,
        settings: tenantData.settings as any,
        branding: tenantData.branding as any,
        createdAt: tenantData.created_at,
        updatedAt: tenantData.updated_at
      };
    } catch (error) {
      console.error('Supabase createTenant error:', error);
      throw error;
    }
  }

  async createSession(session: Omit<UserSession, 'createdAt' | 'lastActivity'>): Promise<UserSession> {
    try {
      const now = new Date().toISOString();
      const supabaseSession = {
        id: session.id,
        user_id: session.userId,
        tenant_id: session.tenantId,
        token: session.token,
        ip_address: session.ipAddress || '',
        user_agent: session.userAgent || '',
        remember_me: session.rememberMe || false,
        expires_at: session.expiresAt,
        created_at: now,
        last_activity: now
      };

      const { data, error } = await this.supabase
        .from('user_sessions')
        .insert(supabaseSession as any)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from insert');
      
      const sessionData = data as SupabaseSessionRow;
      return {
        id: sessionData.id,
        userId: sessionData.user_id,
        tenantId: sessionData.tenant_id,
        token: sessionData.token,
        ipAddress: sessionData.ip_address,
        userAgent: sessionData.user_agent,
        rememberMe: sessionData.remember_me,
        expiresAt: sessionData.expires_at,
        createdAt: sessionData.created_at,
        lastActivity: sessionData.last_activity
      };
    } catch (error) {
      console.error('Supabase createSession error:', error);
      throw error;
    }
  }

  async findSessionByToken(token: string): Promise<UserSession | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_sessions')
        .select('*')
        .eq('token', token)
        .single();
      
      if (error || !data) return null;
      
      const sessionData = data as SupabaseSessionRow;
      return {
        id: sessionData.id,
        userId: sessionData.user_id,
        tenantId: sessionData.tenant_id,
        token: sessionData.token,
        ipAddress: sessionData.ip_address,
        userAgent: sessionData.user_agent,
        rememberMe: sessionData.remember_me,
        expiresAt: sessionData.expires_at,
        createdAt: sessionData.created_at,
        lastActivity: sessionData.last_activity
      };
    } catch (error) {
      console.error('Supabase findSessionByToken error:', error);
      return null;
    }
  }

  async deleteSession(token: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('user_sessions')
        .delete()
        .eq('token', token);
      
      return !error;
    } catch (error) {
      console.error('Supabase deleteSession error:', error);
      return false;
    }
  }

  async createAuditLog(log: Omit<AuditLog, 'createdAt'>): Promise<AuditLog> {
    try {
      const supabaseLog = {
        id: log.id,
        tenant_id: log.tenantId,
        user_id: log.userId,
        action: log.action,
        resource: log.resource,
        details: log.details || {},
        ip_address: log.ipAddress || '',
        user_agent: log.userAgent || '',
        timestamp: log.timestamp
      };

      const { data, error } = await this.supabase
        .from('audit_logs')
        .insert(supabaseLog as any)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from insert');
      
      const auditData = data as SupabaseAuditRow;
      return {
        id: auditData.id,
        tenantId: auditData.tenant_id,
        userId: auditData.user_id || '',
        action: auditData.action,
        resource: auditData.resource,
        details: auditData.details as any,
        ipAddress: auditData.ip_address,
        userAgent: auditData.user_agent,
        timestamp: auditData.timestamp,
        createdAt: auditData.timestamp
      };
    } catch (error) {
      console.error('Supabase createAuditLog error:', error);
      throw error;
    }
  }
}

// JSON Database implementation (fallback)
class JsonDatabase implements DatabaseInterface {
  async findUserByEmail(email: string): Promise<User | null> {
    const user = jsonDatabase.users.find((u: any) => 
      u.email.toLowerCase() === email.toLowerCase()
    );
    return user ? { ...user, password: user.password || '' } : null;
  }

  async findUserById(id: string): Promise<User | null> {
    const user = jsonDatabase.users.find((u: any) => u.id === id);
    return user ? { ...user, password: user.password || '' } : null;
  }

  async createUser(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    const now = new Date().toISOString();
    const newUser = {
      ...user,
      createdAt: now,
      updatedAt: now
    } as User;

    jsonDatabase.users.push(newUser);
    saveDatabase();
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const userIndex = jsonDatabase.users.findIndex((u: any) => u.id === id);
    if (userIndex === -1) return null;

    const updatedUser = {
      ...jsonDatabase.users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    jsonDatabase.users[userIndex] = updatedUser;
    saveDatabase();
    return updatedUser as User;
  }

  async findTenantById(id: string): Promise<Tenant | null> {
    const tenant = jsonDatabase.tenants.find((t: any) => t.id === id);
    if (!tenant) return null;
    return {
      ...tenant,
      subdomain: tenant.subdomain || '',
      createdAt: (tenant as any).createdAt || new Date().toISOString(),
      updatedAt: (tenant as any).updatedAt || new Date().toISOString()
    } as Tenant;
  }

  async findTenantByDomain(domain: string): Promise<Tenant | null> {
    const tenant = jsonDatabase.tenants.find((t: any) => t.domain === domain);
    if (!tenant) return null;
    return {
      ...tenant,
      subdomain: tenant.subdomain || '',
      createdAt: (tenant as any).createdAt || new Date().toISOString(),
      updatedAt: (tenant as any).updatedAt || new Date().toISOString()
    } as Tenant;
  }

  async findTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
    const tenant = jsonDatabase.tenants.find((t: any) => t.subdomain === subdomain);
    if (!tenant) return null;
    return {
      ...tenant,
      subdomain: tenant.subdomain || '',
      createdAt: (tenant as any).createdAt || new Date().toISOString(),
      updatedAt: (tenant as any).updatedAt || new Date().toISOString()
    } as Tenant;
  }

  async createTenant(tenant: Omit<Tenant, 'createdAt' | 'updatedAt'>): Promise<Tenant> {
    const now = new Date().toISOString();
    const newTenant = {
      ...tenant,
      createdAt: now,
      updatedAt: now
    } as Tenant;

    jsonDatabase.tenants.push(newTenant);
    saveDatabase();
    return newTenant;
  }

  async createSession(session: Omit<UserSession, 'createdAt' | 'lastActivity'>): Promise<UserSession> {
    const now = new Date().toISOString();
    const newSession = {
      ...session,
      createdAt: now,
      lastActivity: now
    } as UserSession;

    jsonDatabase.userSessions.push(newSession);
    saveDatabase();
    return newSession;
  }

  async findSessionByToken(token: string): Promise<UserSession | null> {
    const session = jsonDatabase.userSessions.find((s: any) => s.token === token);
    if (!session) return null;
    return {
      ...session,
      tenantId: (session as any).tenantId || '',
      lastActivity: session.lastActivity || new Date().toISOString()
    } as UserSession;
  }

  async deleteSession(token: string): Promise<boolean> {
    const sessionIndex = jsonDatabase.userSessions.findIndex((s: any) => s.token === token);
    if (sessionIndex === -1) return false;

    jsonDatabase.userSessions.splice(sessionIndex, 1);
    saveDatabase();
    return true;
  }

  async createAuditLog(log: Omit<AuditLog, 'createdAt'>): Promise<AuditLog> {
    const newLog = {
      ...log,
      createdAt: new Date().toISOString()
    } as AuditLog;

    jsonDatabase.auditLogs.push(newLog);
    saveDatabase();
    return newLog;
  }
}

// Factory function to create the appropriate database instance
function createDatabase(): DatabaseInterface {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && supabaseServiceKey) {
    console.log('🚀 Using Supabase PostgreSQL database');
    return new SupabaseDatabase();
  } else {
    console.log('📁 Using JSON file database (fallback)');
    return new JsonDatabase();
  }
}

// Export singleton instance
export const db = createDatabase();
export default db;