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

export interface Device {
  id: string;
  tenantId: string;
  name: string;
  status: string;
  lastSeen: Date | string;
  currentPlaylistId?: string | null;
  groupName?: string | null;
  location?: string | null;
  resolution?: string | null;
  orientation?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WidgetTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  thumbnail?: string | null;
  version: string;
  author: string;
  htmlUrl: string;
  previewUrl?: string | null;
  requirements?: string[];
  isPremium?: boolean;
  configSchema: any;
  defaultConfig: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface WidgetInstance {
  id: string;
  tenantId: string;
  templateId: string;
  name: string;
  config: any;
  createdAt: string;
  updatedAt: string;
}

export interface MediaItem {
  id: string;
  tenantId: string;
  name: string;
  type: string;
  url: string;
  thumbnailUrl?: string | null;
  duration?: number | null;
  size?: number | null;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface Layout {
  id: string;
  tenantId: string;
  name: string;
  description?: string | null;
  template?: string;
  category?: string;
  orientation?: string;
  thumbnail?: string | null;
  dimensions?: { width: number; height: number };
  backgroundColor?: string;
  zones: any[];
  settings?: any;
  createdAt: string;
  updatedAt: string;
}

export interface Playlist {
  id: string;
  tenantId: string;
  name: string;
  description?: string | null;
  loop?: boolean;
  shuffle?: boolean;
  priority?: number;
  duration?: number;
  items: any[];
  settings?: any;
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  id: string;
  tenantId: string;
  name: string;
  playlistId: string;
  startDate: string;
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  daysOfWeek?: string[] | null;
  priority?: number | null;
  isActive: boolean;
  deviceIds?: string[];
  createdAt: string;
  updatedAt: string;
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
  
  // Devices
  getDevicesByTenant(tenantId: string): Promise<Device[]>;
  getDeviceById(id: string): Promise<Device | null>;
  createDevice(device: Omit<Device, 'createdAt' | 'updatedAt'>): Promise<Device>;
  updateDevice(id: string, updates: Partial<Device>): Promise<Device | null>;
  deleteDevice(id: string): Promise<boolean>;
  
  // Widget Templates
  getWidgetTemplates(): Promise<WidgetTemplate[]>;
  getWidgetTemplateById(id: string): Promise<WidgetTemplate | null>;
  createWidgetTemplate(template: Omit<WidgetTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<WidgetTemplate>;
  updateWidgetTemplate(id: string, updates: Partial<WidgetTemplate>): Promise<WidgetTemplate | null>;
  deleteWidgetTemplate(id: string): Promise<boolean>;
  
  // Widget Instances
  getWidgetInstancesByTenant(tenantId: string): Promise<WidgetInstance[]>;
  getWidgetInstanceById(id: string): Promise<WidgetInstance | null>;
  createWidgetInstance(instance: Omit<WidgetInstance, 'id' | 'createdAt' | 'updatedAt'>): Promise<WidgetInstance>;
  updateWidgetInstance(id: string, updates: Partial<WidgetInstance>): Promise<WidgetInstance | null>;
  deleteWidgetInstance(id: string): Promise<boolean>;

  // Media Items
  getMediaByTenant(tenantId: string): Promise<MediaItem[]>;
  getMediaById(id: string): Promise<MediaItem | null>;
  createMedia(media: Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MediaItem>;
  updateMedia(id: string, updates: Partial<MediaItem>): Promise<MediaItem | null>;
  deleteMedia(id: string): Promise<boolean>;

  // Layouts
  getLayouts(tenantId: string): Promise<Layout[]>;
  getLayoutById(id: string, tenantId?: string): Promise<Layout | null>;
  createLayout(layout: Omit<Layout, 'createdAt' | 'updatedAt'>): Promise<Layout>;
  updateLayout(id: string, updates: Partial<Layout>, tenantId?: string): Promise<Layout | null>;
  deleteLayout(id: string, tenantId?: string): Promise<boolean>;

  // Zones
  getZonesByLayoutId(layoutId: string): Promise<any[]>;
  createZone(zone: any): Promise<any>;
  deleteZonesByLayoutId(layoutId: string): Promise<boolean>;

  // Playlists
  getPlaylists(tenantId: string): Promise<Playlist[]>;
  getPlaylistById(id: string, tenantId?: string): Promise<Playlist | null>;
  createPlaylist(playlist: Omit<Playlist, 'createdAt' | 'updatedAt'>): Promise<Playlist>;
  updatePlaylist(id: string, updates: Partial<Playlist>, tenantId?: string): Promise<Playlist | null>;
  deletePlaylist(id: string, tenantId?: string): Promise<boolean>;

  // Playlist Items
  getPlaylistItemsByPlaylistId(playlistId: string): Promise<any[]>;
  createPlaylistItem(item: any): Promise<any>;
  deletePlaylistItemsByPlaylistId(playlistId: string): Promise<boolean>;

  // Schedules
  getSchedulesByTenant(tenantId: string): Promise<Schedule[]>;
  getScheduleById(id: string): Promise<Schedule | null>;
  createSchedule(schedule: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<Schedule>;
  updateSchedule(id: string, updates: Partial<Schedule>): Promise<Schedule | null>;
  deleteSchedule(id: string): Promise<boolean>;
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

  // Widget Template Converters
  private convertWidgetTemplateToSupabase(template: WidgetTemplate): any {
    return {
      id: template.id,
      name: template.name,
      description: template.description,
      icon: template.icon,
      category: template.category,
      thumbnail: template.thumbnail,
      version: template.version,
      author: template.author,
      html_url: template.htmlUrl,
      preview_url: template.previewUrl,
      requirements: template.requirements,
      is_premium: template.isPremium,
      config_schema: template.configSchema,
      default_config: template.defaultConfig
    };
  }

  private convertWidgetTemplateFromSupabase(data: any): WidgetTemplate {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      icon: data.icon,
      category: data.category,
      thumbnail: data.thumbnail,
      version: data.version,
      author: data.author,
      htmlUrl: data.html_url,
      previewUrl: data.preview_url,
      requirements: data.requirements,
      isPremium: data.is_premium,
      configSchema: data.config_schema,
      defaultConfig: data.default_config
    };
  }

  // Widget Instance Converters
  private convertWidgetInstanceToSupabase(instance: WidgetInstance): any {
    return {
      id: instance.id,
      tenant_id: instance.tenantId,
      template_id: instance.templateId,
      name: instance.name,
      config: instance.config,
      created_at: instance.createdAt,
      updated_at: instance.updatedAt
    };
  }

  private convertWidgetInstanceFromSupabase(data: any): WidgetInstance {
    return {
      id: data.id,
      tenantId: data.tenant_id,
      templateId: data.template_id,
      name: data.name,
      config: data.config,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
  // Widget Template Methods
  async getWidgetTemplates(): Promise<WidgetTemplate[]> {
    try {
      const { data, error } = await this.supabase
        .from('widget_templates')
        .select('*')
        .order('name');

      if (error) throw error;
      return data?.map(this.convertWidgetTemplateFromSupabase) || [];
    } catch (error) {
      console.error('Error getting widget templates:', error);
      return [];
    }
  }

  async getWidgetTemplateById(id: string): Promise<WidgetTemplate | null> {
    try {
      const { data, error } = await this.supabase
        .from('widget_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data ? this.convertWidgetTemplateFromSupabase(data) : null;
    } catch (error) {
      console.error('Error getting widget template by id:', error);
      return null;
    }
  }

  async createWidgetTemplate(template: Omit<WidgetTemplate, 'id'>): Promise<WidgetTemplate> {
    try {
      const newTemplate: WidgetTemplate = {
        ...template,
        id: crypto.randomUUID()
      };
      
      const supabaseTemplate = this.convertWidgetTemplateToSupabase(newTemplate);

      const { data, error } = await this.supabase
        .from('widget_templates')
        .insert(supabaseTemplate)
        .select()
        .single();

      if (error) throw error;
      return this.convertWidgetTemplateFromSupabase(data);
    } catch (error) {
      console.error('Error creating widget template:', error);
      throw error;
    }
  }

  async updateWidgetTemplate(id: string, updates: Partial<WidgetTemplate>): Promise<WidgetTemplate | null> {
    try {
      // Get current template first
      const current = await this.getWidgetTemplateById(id);
      if (!current) return null;

      const updatedTemplate: WidgetTemplate = {
        ...current,
        ...updates
      };
      
      const supabaseUpdates = this.convertWidgetTemplateToSupabase(updatedTemplate);

      const { data, error } = await (this.supabase as any)
        .from('widget_templates')
        .update(supabaseUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data ? this.convertWidgetTemplateFromSupabase(data) : null;
    } catch (error) {
      console.error('Error updating widget template:', error);
      return null;
    }
  }

  async deleteWidgetTemplate(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('widget_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting widget template:', error);
      return false;
    }
  }

  // Widget Instance Methods
  async getWidgetInstancesByTenant(tenantId: string): Promise<WidgetInstance[]> {
    try {
      const { data, error } = await this.supabase
        .from('widget_instances')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data?.map(this.convertWidgetInstanceFromSupabase) || [];
    } catch (error) {
      console.error('Error getting widget instances by tenant:', error);
      return [];
    }
  }

  async getWidgetInstanceById(id: string): Promise<WidgetInstance | null> {
    try {
      const { data, error } = await this.supabase
        .from('widget_instances')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data ? this.convertWidgetInstanceFromSupabase(data) : null;
    } catch (error) {
      console.error('Error getting widget instance by id:', error);
      return null;
    }
  }

  async createWidgetInstance(instance: Omit<WidgetInstance, 'id' | 'createdAt' | 'updatedAt'>): Promise<WidgetInstance> {
    try {
      const now = new Date().toISOString();
      const newInstance: WidgetInstance = {
        ...instance,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now
      };
      
      const supabaseInstance = this.convertWidgetInstanceToSupabase(newInstance);

      const { data, error } = await this.supabase
        .from('widget_instances')
        .insert(supabaseInstance)
        .select()
        .single();

      if (error) throw error;
      return this.convertWidgetInstanceFromSupabase(data);
    } catch (error) {
      console.error('Error creating widget instance:', error);
      throw error;
    }
  }

  async updateWidgetInstance(id: string, updates: Partial<WidgetInstance>): Promise<WidgetInstance | null> {
    try {
      // Get current instance first
      const current = await this.getWidgetInstanceById(id);
      if (!current) return null;

      const updatedInstance: WidgetInstance = {
        ...current,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      const supabaseUpdates = this.convertWidgetInstanceToSupabase(updatedInstance);

      const { data, error } = await (this.supabase as any)
        .from('widget_instances')
        .update(supabaseUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data ? this.convertWidgetInstanceFromSupabase(data) : null;
    } catch (error) {
      console.error('Error updating widget instance:', error);
      return null;
    }
  }

  async deleteWidgetInstance(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('widget_instances')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting widget instance:', error);
      return false;
    }
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

  // Media Methods
  async getMediaByTenant(tenantId: string): Promise<MediaItem[]> {
    try {
      const { data, error } = await this.supabase
        .from('media_items')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data?.map(this.convertMediaFromSupabase.bind(this)) || [];
    } catch (error) {
      console.error('Error getting media by tenant:', error);
      return [];
    }
  }

  async getMediaById(id: string): Promise<MediaItem | null> {
    try {
      const { data, error } = await this.supabase
        .from('media_items')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data ? this.convertMediaFromSupabase(data) : null;
    } catch (error) {
      console.error('Error getting media by id:', error);
      return null;
    }
  }

  async createMedia(media: Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MediaItem> {
    try {
      const now = new Date().toISOString();
      const newMedia: MediaItem = {
        ...media,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now
      };
      
      const supabaseMedia = this.convertMediaToSupabase(newMedia);

      const { data, error } = await this.supabase
        .from('media_items')
        .insert(supabaseMedia)
        .select()
        .single();

      if (error) throw error;
      return this.convertMediaFromSupabase(data);
    } catch (error) {
      console.error('Error creating media:', error);
      throw error;
    }
  }

  async updateMedia(id: string, updates: Partial<MediaItem>): Promise<MediaItem | null> {
    try {
      const current = await this.getMediaById(id);
      if (!current) return null;

      const updatedMedia: MediaItem = {
        ...current,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      const supabaseUpdates = this.convertMediaToSupabase(updatedMedia);

      const { data, error } = await (this.supabase as any)
        .from('media_items')
        .update(supabaseUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data ? this.convertMediaFromSupabase(data) : null;
    } catch (error) {
      console.error('Error updating media:', error);
      return null;
    }
  }

  async deleteMedia(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('media_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting media:', error);
      return false;
    }
  }

  // Media Converters
  private convertMediaToSupabase(media: MediaItem): any {
    return {
      id: media.id,
      tenant_id: media.tenantId,
      name: media.name,
      type: media.type,
      url: media.url,
      thumbnail_url: media.thumbnailUrl,
      duration: media.duration,
      size: media.size,
      metadata: media.metadata,
      created_at: media.createdAt,
      updated_at: media.updatedAt
    };
  }

  private convertMediaFromSupabase(data: any): MediaItem {
    return {
      id: data.id,
      tenantId: data.tenant_id,
      name: data.name,
      type: data.type,
      url: data.url,
      thumbnailUrl: data.thumbnail_url,
      duration: data.duration,
      size: data.size,
      metadata: data.metadata,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  // Layout Methods
  async getLayouts(tenantId: string): Promise<Layout[]> {
    try {
      const { data, error } = await this.supabase
        .from('layouts')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data?.map(this.convertLayoutFromSupabase.bind(this)) || [];
    } catch (error) {
      console.error('Error getting layouts by tenant:', error);
      return [];
    }
  }

  async getLayoutById(id: string, tenantId?: string): Promise<Layout | null> {
    try {
      let query = this.supabase
        .from('layouts')
        .select('*')
        .eq('id', id);

      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }

      const { data, error } = await query.single();

      if (error) throw error;
      return data ? this.convertLayoutFromSupabase(data) : null;
    } catch (error) {
      console.error('Error getting layout by id:', error);
      return null;
    }
  }

  async createLayout(layout: Omit<Layout, 'createdAt' | 'updatedAt'>): Promise<Layout> {
    try {
      const now = new Date().toISOString();
      const newLayout = {
        ...layout,
        createdAt: now,
        updatedAt: now
      };
      
      const supabaseLayout = this.convertLayoutToSupabase(newLayout as Layout);

      const { data, error } = await this.supabase
        .from('layouts')
        .insert(supabaseLayout)
        .select()
        .single();

      if (error) throw error;
      return this.convertLayoutFromSupabase(data);
    } catch (error) {
      console.error('Error creating layout:', error);
      throw error;
    }
  }

  async updateLayout(id: string, updates: Partial<Layout>, tenantId?: string): Promise<Layout | null> {
    try {
      const current = await this.getLayoutById(id, tenantId);
      if (!current) return null;

      const updatedLayout = {
        ...current,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      const supabaseUpdates = this.convertLayoutToSupabase(updatedLayout);

      const { data, error } = await (this.supabase as any)
        .from('layouts')
        .update(supabaseUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data ? this.convertLayoutFromSupabase(data) : null;
    } catch (error) {
      console.error('Error updating layout:', error);
      return null;
    }
  }

  async deleteLayout(id: string, tenantId?: string): Promise<boolean> {
    try {
      let query = this.supabase
        .from('layouts')
        .delete()
        .eq('id', id);

      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }

      const { error } = await query;

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting layout:', error);
      return false;
    }
  }

  // Zone Methods
  async getZonesByLayoutId(layoutId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('zones')
        .select('*')
        .eq('layout_id', layoutId)
        .order('created_at');

      if (error) throw error;
      return data?.map(this.convertZoneFromSupabase.bind(this)) || [];
    } catch (error) {
      console.error('Error getting zones by layout id:', error);
      return [];
    }
  }

  async createZone(zone: any): Promise<any> {
    try {
      const supabaseZone = this.convertZoneToSupabase(zone);

      const { data, error } = await this.supabase
        .from('zones')
        .insert(supabaseZone)
        .select()
        .single();

      if (error) throw error;
      return this.convertZoneFromSupabase(data);
    } catch (error) {
      console.error('Error creating zone:', error);
      throw error;
    }
  }

  async deleteZonesByLayoutId(layoutId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('zones')
        .delete()
        .eq('layout_id', layoutId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting zones by layout id:', error);
      return false;
    }
  }

  // Layout Converters
  private convertLayoutToSupabase(layout: Layout): any {
    return {
      id: layout.id,
      tenant_id: layout.tenantId,
      name: layout.name,
      description: layout.description,
      template: layout.template,
      category: layout.category,
      orientation: layout.orientation,
      thumbnail: layout.thumbnail,
      dimensions: layout.dimensions,
      background_color: layout.backgroundColor,
      zones: layout.zones,
      settings: layout.settings,
      created_at: layout.createdAt,
      updated_at: layout.updatedAt
    };
  }

  private convertLayoutFromSupabase(data: any): Layout {
    return {
      id: data.id,
      tenantId: data.tenant_id,
      name: data.name,
      description: data.description,
      template: data.template,
      category: data.category,
      orientation: data.orientation,
      thumbnail: data.thumbnail,
      dimensions: data.dimensions,
      backgroundColor: data.background_color,
      zones: data.zones || [],
      settings: data.settings,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  // Zone Converters
  private convertZoneToSupabase(zone: any): any {
    return {
      id: zone.id,
      layout_id: zone.layoutId,
      name: zone.name,
      x: zone.x,
      y: zone.y,
      width: zone.width,
      height: zone.height,
      type: zone.type,
      content: zone.content,
      media_id: zone.mediaId,
      playlist_id: zone.playlistId,
      widget_instance_id: zone.widgetInstanceId,
      background_color: zone.backgroundColor,
      text_color: zone.textColor,
      font_size: zone.fontSize,
      font_family: zone.fontFamily,
      text_align: zone.textAlign,
      opacity: zone.opacity,
      border_radius: zone.borderRadius,
      border_width: zone.borderWidth,
      border_color: zone.borderColor,
      style: zone.style
    };
  }

  private convertZoneFromSupabase(data: any): any {
    return {
      id: data.id,
      layoutId: data.layout_id,
      name: data.name,
      x: data.x,
      y: data.y,
      width: data.width,
      height: data.height,
      type: data.type,
      content: data.content,
      mediaId: data.media_id,
      playlistId: data.playlist_id,
      widgetInstanceId: data.widget_instance_id,
      backgroundColor: data.background_color,
      textColor: data.text_color,
      fontSize: data.font_size,
      fontFamily: data.font_family,
      textAlign: data.text_align,
      opacity: data.opacity,
      borderRadius: data.border_radius,
      borderWidth: data.border_width,
      borderColor: data.border_color,
      style: data.style
    };
  }

  // Playlist Methods
  async getPlaylists(tenantId: string): Promise<Playlist[]> {
    try {
      const { data, error } = await this.supabase
        .from('playlists')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data?.map(this.convertPlaylistFromSupabase.bind(this)) || [];
    } catch (error) {
      console.error('Error getting playlists by tenant:', error);
      return [];
    }
  }

  async getPlaylistById(id: string, tenantId?: string): Promise<Playlist | null> {
    try {
      let query = this.supabase
        .from('playlists')
        .select('*')
        .eq('id', id);

      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }

      const { data, error } = await query.single();

      if (error) throw error;
      return data ? this.convertPlaylistFromSupabase(data) : null;
    } catch (error) {
      console.error('Error getting playlist by id:', error);
      return null;
    }
  }

  async createPlaylist(playlist: Omit<Playlist, 'createdAt' | 'updatedAt'>): Promise<Playlist> {
    try {
      const now = new Date().toISOString();
      const newPlaylist = {
        ...playlist,
        createdAt: now,
        updatedAt: now
      };
      
      const supabasePlaylist = this.convertPlaylistToSupabase(newPlaylist as Playlist);

      const { data, error } = await this.supabase
        .from('playlists')
        .insert(supabasePlaylist)
        .select()
        .single();

      if (error) throw error;
      return this.convertPlaylistFromSupabase(data);
    } catch (error) {
      console.error('Error creating playlist:', error);
      throw error;
    }
  }

  async updatePlaylist(id: string, updates: Partial<Playlist>, tenantId?: string): Promise<Playlist | null> {
    try {
      const current = await this.getPlaylistById(id, tenantId);
      if (!current) return null;

      const updatedPlaylist = {
        ...current,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      const supabaseUpdates = this.convertPlaylistToSupabase(updatedPlaylist);

      const { data, error } = await (this.supabase as any)
        .from('playlists')
        .update(supabaseUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data ? this.convertPlaylistFromSupabase(data) : null;
    } catch (error) {
      console.error('Error updating playlist:', error);
      return null;
    }
  }

  async deletePlaylist(id: string, tenantId?: string): Promise<boolean> {
    try {
      let query = this.supabase
        .from('playlists')
        .delete()
        .eq('id', id);

      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }

      const { error } = await query;

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting playlist:', error);
      return false;
    }
  }

  // Playlist Item Methods
  async getPlaylistItemsByPlaylistId(playlistId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('playlist_items')
        .select('*')
        .eq('playlist_id', playlistId)
        .order('order_index');

      if (error) throw error;
      return data?.map(this.convertPlaylistItemFromSupabase.bind(this)) || [];
    } catch (error) {
      console.error('Error getting playlist items by playlist id:', error);
      return [];
    }
  }

  async createPlaylistItem(item: any): Promise<any> {
    try {
      const supabaseItem = this.convertPlaylistItemToSupabase(item);

      const { data, error } = await this.supabase
        .from('playlist_items')
        .insert(supabaseItem)
        .select()
        .single();

      if (error) throw error;
      return this.convertPlaylistItemFromSupabase(data);
    } catch (error) {
      console.error('Error creating playlist item:', error);
      throw error;
    }
  }

  async deletePlaylistItemsByPlaylistId(playlistId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('playlist_items')
        .delete()
        .eq('playlist_id', playlistId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting playlist items by playlist id:', error);
      return false;
    }
  }

  // Playlist Converters
  private convertPlaylistToSupabase(playlist: Playlist): any {
    return {
      id: playlist.id,
      tenant_id: playlist.tenantId,
      name: playlist.name,
      description: playlist.description,
      loop: playlist.loop,
      shuffle: playlist.shuffle,
      priority: playlist.priority,
      duration: playlist.duration,
      items: playlist.items,
      settings: playlist.settings,
      created_at: playlist.createdAt,
      updated_at: playlist.updatedAt
    };
  }

  private convertPlaylistFromSupabase(data: any): Playlist {
    return {
      id: data.id,
      tenantId: data.tenant_id,
      name: data.name,
      description: data.description,
      loop: data.loop,
      shuffle: data.shuffle,
      priority: data.priority,
      duration: data.duration,
      items: data.items || [],
      settings: data.settings,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  // Playlist Item Converters
  private convertPlaylistItemToSupabase(item: any): any {
    return {
      id: item.id,
      playlist_id: item.playlistId,
      media_id: item.mediaId,
      duration: item.duration,
      transition: item.transition,
      transition_duration: item.transitionDuration,
      volume: item.volume,
      repeat: item.repeat,
      order_index: item.orderIndex
    };
  }

  private convertPlaylistItemFromSupabase(data: any): any {
    return {
      id: data.id,
      playlistId: data.playlist_id,
      mediaId: data.media_id,
      duration: data.duration,
      transition: data.transition,
      transitionDuration: data.transition_duration,
      volume: data.volume,
      repeat: data.repeat,
      orderIndex: data.order_index
    };
  }

  // Schedule Methods
  async getSchedulesByTenant(tenantId: string): Promise<Schedule[]> {
    try {
      const { data, error } = await this.supabase
        .from('schedules')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const schedules: Schedule[] = data?.map(this.convertScheduleFromSupabase.bind(this)) || [];
      
      // Get device associations for each schedule
      for (const schedule of schedules) {
        const { data: deviceData, error: deviceError } = await this.supabase
          .from('schedule_devices')
          .select('device_id')
          .eq('schedule_id', schedule.id);
        
        if (!deviceError && deviceData) {
          schedule.deviceIds = deviceData.map((d: any) => d.device_id);
        }
      }
      
      return schedules;
    } catch (error) {
      console.error('Error getting schedules by tenant:', error);
      return [];
    }
  }

  async getScheduleById(id: string): Promise<Schedule | null> {
    try {
      const { data, error } = await this.supabase
        .from('schedules')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;
      
      const schedule = this.convertScheduleFromSupabase(data);
      
      // Get device associations
      const { data: deviceData, error: deviceError } = await this.supabase
        .from('schedule_devices')
        .select('device_id')
        .eq('schedule_id', schedule.id);
      
      if (!deviceError && deviceData) {
        schedule.deviceIds = deviceData.map((d: any) => d.device_id);
      }
      
      return schedule;
    } catch (error) {
      console.error('Error getting schedule by id:', error);
      return null;
    }
  }

  async createSchedule(schedule: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<Schedule> {
    try {
      const now = new Date().toISOString();
      const newSchedule: Schedule = {
        ...schedule,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now
      };
      
      const supabaseSchedule = this.convertScheduleToSupabase(newSchedule);

      const { data, error } = await this.supabase
        .from('schedules')
        .insert(supabaseSchedule)
        .select()
        .single();

      if (error) throw error;
      
      const createdSchedule = this.convertScheduleFromSupabase(data);
      
      // Handle device associations
      if ((schedule as any).deviceIds && Array.isArray((schedule as any).deviceIds)) {
        const deviceInserts = (schedule as any).deviceIds.map((deviceId: string) => ({
          schedule_id: createdSchedule.id,
          device_id: deviceId
        }));
        
        if (deviceInserts.length > 0) {
          await this.supabase
            .from('schedule_devices')
            .insert(deviceInserts);
        }
        
        createdSchedule.deviceIds = (schedule as any).deviceIds;
      }
      
      return createdSchedule;
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  }

  async updateSchedule(id: string, updates: Partial<Schedule>): Promise<Schedule | null> {
    try {
      const current = await this.getScheduleById(id);
      if (!current) return null;

      const updatedSchedule = {
        ...current,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      const supabaseUpdates = this.convertScheduleToSupabase(updatedSchedule);

      const { data, error } = await (this.supabase as any)
        .from('schedules')
        .update(supabaseUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      const result = this.convertScheduleFromSupabase(data);
      
      // Handle device associations
      if ((updates as any).deviceIds && Array.isArray((updates as any).deviceIds)) {
        // Remove existing associations
        await this.supabase
          .from('schedule_devices')
          .delete()
          .eq('schedule_id', id);
        
        // Add new associations
        const deviceInserts = (updates as any).deviceIds.map((deviceId: string) => ({
          schedule_id: id,
          device_id: deviceId
        }));
        
        if (deviceInserts.length > 0) {
          await this.supabase
            .from('schedule_devices')
            .insert(deviceInserts);
        }
        
        result.deviceIds = (updates as any).deviceIds;
      }
      
      return result;
    } catch (error) {
      console.error('Error updating schedule:', error);
      return null;
    }
  }

  async deleteSchedule(id: string): Promise<boolean> {
    try {
      // Delete device associations first
      await this.supabase
        .from('schedule_devices')
        .delete()
        .eq('schedule_id', id);
      
      // Delete the schedule
      const { error } = await this.supabase
        .from('schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting schedule:', error);
      return false;
    }
  }

  // Schedule Converters
  private convertScheduleToSupabase(schedule: Schedule): any {
    return {
      id: schedule.id,
      tenant_id: schedule.tenantId,
      name: schedule.name,
      playlist_id: schedule.playlistId,
      start_date: schedule.startDate,
      end_date: schedule.endDate,
      start_time: schedule.startTime,
      end_time: schedule.endTime,
      days_of_week: schedule.daysOfWeek,
      priority: schedule.priority,
      is_active: schedule.isActive,
      created_at: schedule.createdAt,
      updated_at: schedule.updatedAt
    };
  }

  private convertScheduleFromSupabase(data: any): Schedule {
    return {
      id: data.id,
      tenantId: data.tenant_id,
      name: data.name,
      playlistId: data.playlist_id,
      startDate: data.start_date,
      endDate: data.end_date,
      startTime: data.start_time,
      endTime: data.end_time,
      daysOfWeek: data.days_of_week || [],
      priority: data.priority,
      isActive: data.is_active,
      deviceIds: [],
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
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

  // Device methods for Supabase
  async getDevicesByTenant(tenantId: string): Promise<Device[]> {
    try {
      const { data, error } = await this.supabase
        .from('devices')
        .select('*')
        .eq('tenant_id', tenantId);
      
      if (error) throw error;
      if (!data) return [];
      
      return (data as any[]).map((device: any) => ({
        id: device.id,
        tenantId: device.tenant_id,
        name: device.name,
        status: device.status,
        lastSeen: device.last_seen,
        currentPlaylistId: device.current_playlist_id,
        groupName: device.group_name,
        location: device.location,
        resolution: device.resolution,
        orientation: device.orientation,
        createdAt: device.created_at,
        updatedAt: device.updated_at
      }));
    } catch (error) {
      console.error('Supabase getDevicesByTenant error:', error);
      return [];
    }
  }

  async getDeviceById(id: string): Promise<Device | null> {
    try {
      const { data, error } = await this.supabase
        .from('devices')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error || !data) return null;
      
      const deviceData = data as any;
      return {
        id: deviceData.id,
        tenantId: deviceData.tenant_id,
        name: deviceData.name,
        status: deviceData.status,
        lastSeen: deviceData.last_seen,
        currentPlaylistId: deviceData.current_playlist_id,
        groupName: deviceData.group_name,
        location: deviceData.location,
        resolution: deviceData.resolution,
        orientation: deviceData.orientation,
        createdAt: deviceData.created_at,
        updatedAt: deviceData.updated_at
      };
    } catch (error) {
      console.error('Supabase getDeviceById error:', error);
      return null;
    }
  }

  async createDevice(device: Omit<Device, 'createdAt' | 'updatedAt'>): Promise<Device> {
    try {
      const now = new Date().toISOString();
      const supabaseDevice = {
        id: device.id,
        tenant_id: device.tenantId,
        name: device.name,
        status: device.status,
        last_seen: typeof device.lastSeen === 'string' ? device.lastSeen : device.lastSeen.toISOString(),
        current_playlist_id: device.currentPlaylistId,
        group_name: device.groupName,
        location: device.location,
        resolution: device.resolution,
        orientation: device.orientation,
        created_at: now,
        updated_at: now
      };

      const { data, error } = await this.supabase
        .from('devices')
        .insert(supabaseDevice as any)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from insert');
      
      const deviceData = data as any;
      return {
        id: deviceData.id,
        tenantId: deviceData.tenant_id,
        name: deviceData.name,
        status: deviceData.status,
        lastSeen: deviceData.last_seen,
        currentPlaylistId: deviceData.current_playlist_id,
        groupName: deviceData.group_name,
        location: deviceData.location,
        resolution: deviceData.resolution,
        orientation: deviceData.orientation,
        createdAt: deviceData.created_at,
        updatedAt: deviceData.updated_at
      };
    } catch (error) {
      console.error('Supabase createDevice error:', error);
      throw error;
    }
  }

  async updateDevice(id: string, updates: Partial<Device>): Promise<Device | null> {
    try {
      const supabaseUpdates: any = {
        updated_at: new Date().toISOString()
      };

      // Convert field names
      if (updates.tenantId !== undefined) supabaseUpdates.tenant_id = updates.tenantId;
      if (updates.lastSeen !== undefined) {
        supabaseUpdates.last_seen = typeof updates.lastSeen === 'string'
          ? updates.lastSeen
          : updates.lastSeen.toISOString();
      }
      if (updates.currentPlaylistId !== undefined) supabaseUpdates.current_playlist_id = updates.currentPlaylistId;
      if (updates.groupName !== undefined) supabaseUpdates.group_name = updates.groupName;

      // Direct field mappings
      ['name', 'status', 'location', 'resolution', 'orientation'].forEach(field => {
        if (updates[field as keyof Device] !== undefined) {
          supabaseUpdates[field] = updates[field as keyof Device];
        }
      });

      const { data, error } = await (this.supabase as any)
        .from('devices')
        .update(supabaseUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error || !data) return null;

      const deviceData = data as any;
      return {
        id: deviceData.id,
        tenantId: deviceData.tenant_id,
        name: deviceData.name,
        status: deviceData.status,
        lastSeen: deviceData.last_seen,
        currentPlaylistId: deviceData.current_playlist_id,
        groupName: deviceData.group_name,
        location: deviceData.location,
        resolution: deviceData.resolution,
        orientation: deviceData.orientation,
        createdAt: deviceData.created_at,
        updatedAt: deviceData.updated_at
      };
    } catch (error) {
      console.error('Supabase updateDevice error:', error);
      return null;
    }
  }

  async deleteDevice(id: string): Promise<boolean> {
    try {
      // First delete related schedule_devices
      await this.supabase
        .from('schedule_devices')
        .delete()
        .eq('device_id', id);

      // Then delete the device
      const { error } = await this.supabase
        .from('devices')
        .delete()
        .eq('id', id);
      
      return !error;
    } catch (error) {
      console.error('Supabase deleteDevice error:', error);
      return false;
    }
  }
}

// JSON Database implementation (fallback)
class JsonDatabase implements DatabaseInterface {
  private data: any = {};

  private async loadData(): Promise<void> {
    this.data = jsonDatabase;
  }

  private async saveData(): Promise<void> {
    saveDatabase();
  }
  // Widget Template Methods
  async getWidgetTemplates(): Promise<WidgetTemplate[]> {
    try {
      await this.loadData();
      return this.data.widgetTemplates || [];
    } catch (error) {
      console.error('Error getting widget templates:', error);
      return [];
    }
  }

  async getWidgetTemplateById(id: string): Promise<WidgetTemplate | null> {
    try {
      await this.loadData();
      return this.data.widgetTemplates?.find(template => template.id === id) || null;
    } catch (error) {
      console.error('Error getting widget template by id:', error);
      return null;
    }
  }

  async createWidgetTemplate(template: Omit<WidgetTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<WidgetTemplate> {
    try {
      await this.loadData();
      
      const newTemplate: WidgetTemplate = {
        ...template,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (!this.data.widgetTemplates) {
        this.data.widgetTemplates = [];
      }
      
      this.data.widgetTemplates.push(newTemplate);
      await this.saveData();
      
      return newTemplate;
    } catch (error) {
      console.error('Error creating widget template:', error);
      throw error;
    }
  }

  async updateWidgetTemplate(id: string, updates: Partial<WidgetTemplate>): Promise<WidgetTemplate | null> {
    try {
      await this.loadData();
      
      if (!this.data.widgetTemplates) {
        return null;
      }

      const index = this.data.widgetTemplates.findIndex(template => template.id === id);
      if (index === -1) {
        return null;
      }

      this.data.widgetTemplates[index] = {
        ...this.data.widgetTemplates[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      await this.saveData();
      return this.data.widgetTemplates[index];
    } catch (error) {
      console.error('Error updating widget template:', error);
      return null;
    }
  }

  async deleteWidgetTemplate(id: string): Promise<boolean> {
    try {
      await this.loadData();
      
      if (!this.data.widgetTemplates) {
        return false;
      }

      const index = this.data.widgetTemplates.findIndex(template => template.id === id);
      if (index === -1) {
        return false;
      }

      this.data.widgetTemplates.splice(index, 1);
      await this.saveData();
      return true;
    } catch (error) {
      console.error('Error deleting widget template:', error);
      return false;
    }
  }

  // Widget Instance Methods
  async getWidgetInstancesByTenant(tenantId: string): Promise<WidgetInstance[]> {
    try {
      await this.loadData();
      return this.data.widgetInstances?.filter(instance => instance.tenantId === tenantId) || [];
    } catch (error) {
      console.error('Error getting widget instances by tenant:', error);
      return [];
    }
  }

  async getWidgetInstanceById(id: string): Promise<WidgetInstance | null> {
    try {
      await this.loadData();
      return this.data.widgetInstances?.find(instance => instance.id === id) || null;
    } catch (error) {
      console.error('Error getting widget instance by id:', error);
      return null;
    }
  }

  async createWidgetInstance(instance: Omit<WidgetInstance, 'id' | 'createdAt' | 'updatedAt'>): Promise<WidgetInstance> {
    try {
      await this.loadData();
      
      const newInstance: WidgetInstance = {
        ...instance,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (!this.data.widgetInstances) {
        this.data.widgetInstances = [];
      }
      
      this.data.widgetInstances.push(newInstance);
      await this.saveData();
      
      return newInstance;
    } catch (error) {
      console.error('Error creating widget instance:', error);
      throw error;
    }
  }

  async updateWidgetInstance(id: string, updates: Partial<WidgetInstance>): Promise<WidgetInstance | null> {
    try {
      await this.loadData();
      
      if (!this.data.widgetInstances) {
        return null;
      }

      const index = this.data.widgetInstances.findIndex(instance => instance.id === id);
      if (index === -1) {
        return null;
      }

      this.data.widgetInstances[index] = {
        ...this.data.widgetInstances[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      await this.saveData();
      return this.data.widgetInstances[index];
    } catch (error) {
      console.error('Error updating widget instance:', error);
      return null;
    }
  }

  async deleteWidgetInstance(id: string): Promise<boolean> {
    try {
      await this.loadData();
      
      if (!this.data.widgetInstances) {
        return false;
      }

      const index = this.data.widgetInstances.findIndex(instance => instance.id === id);
      if (index === -1) {
        return false;
      }

      this.data.widgetInstances.splice(index, 1);
      await this.saveData();
      return true;
    } catch (error) {
      console.error('Error deleting widget instance:', error);
      return false;
    }
  }

  // Media Methods for JSON Database
  async getMediaByTenant(tenantId: string): Promise<MediaItem[]> {
    try {
      await this.loadData();
      return this.data.mediaItems?.filter((media: any) => media.tenantId === tenantId) || [];
    } catch (error) {
      console.error('Error getting media by tenant:', error);
      return [];
    }
  }

  async getMediaById(id: string): Promise<MediaItem | null> {
    try {
      await this.loadData();
      return this.data.mediaItems?.find((media: any) => media.id === id) || null;
    } catch (error) {
      console.error('Error getting media by id:', error);
      return null;
    }
  }

  async createMedia(media: Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MediaItem> {
    try {
      await this.loadData();
      
      const newMedia: MediaItem = {
        ...media,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (!this.data.mediaItems) {
        this.data.mediaItems = [];
      }
      
      this.data.mediaItems.push(newMedia);
      await this.saveData();
      
      return newMedia;
    } catch (error) {
      console.error('Error creating media:', error);
      throw error;
    }
  }

  async updateMedia(id: string, updates: Partial<MediaItem>): Promise<MediaItem | null> {
    try {
      await this.loadData();
      
      if (!this.data.mediaItems) {
        return null;
      }

      const index = this.data.mediaItems.findIndex((media: any) => media.id === id);
      if (index === -1) {
        return null;
      }

      this.data.mediaItems[index] = {
        ...this.data.mediaItems[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      await this.saveData();
      return this.data.mediaItems[index];
    } catch (error) {
      console.error('Error updating media:', error);
      return null;
    }
  }

  async deleteMedia(id: string): Promise<boolean> {
    try {
      await this.loadData();
      
      if (!this.data.mediaItems) {
        return false;
      }

      const index = this.data.mediaItems.findIndex((media: any) => media.id === id);
      if (index === -1) {
        return false;
      }

      this.data.mediaItems.splice(index, 1);
      await this.saveData();
      return true;
    } catch (error) {
      console.error('Error deleting media:', error);
      return false;
    }
  }

  // Layout Methods for JSON Database
  async getLayouts(tenantId: string): Promise<Layout[]> {
    try {
      await this.loadData();
      return this.data.layouts?.filter((layout: any) => layout.tenantId === tenantId) || [];
    } catch (error) {
      console.error('Error getting layouts by tenant:', error);
      return [];
    }
  }

  async getLayoutById(id: string, tenantId?: string): Promise<Layout | null> {
    try {
      await this.loadData();
      const layout = this.data.layouts?.find((layout: any) => {
        if (tenantId) {
          return layout.id === id && layout.tenantId === tenantId;
        }
        return layout.id === id;
      });
      return layout || null;
    } catch (error) {
      console.error('Error getting layout by id:', error);
      return null;
    }
  }

  async createLayout(layout: Omit<Layout, 'createdAt' | 'updatedAt'>): Promise<Layout> {
    try {
      await this.loadData();
      
      const newLayout: Layout = {
        ...layout,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (!this.data.layouts) {
        this.data.layouts = [];
      }
      
      this.data.layouts.push(newLayout);
      await this.saveData();
      
      return newLayout;
    } catch (error) {
      console.error('Error creating layout:', error);
      throw error;
    }
  }

  async updateLayout(id: string, updates: Partial<Layout>, tenantId?: string): Promise<Layout | null> {
    try {
      await this.loadData();
      
      if (!this.data.layouts) {
        return null;
      }

      const index = this.data.layouts.findIndex((layout: any) => {
        if (tenantId) {
          return layout.id === id && layout.tenantId === tenantId;
        }
        return layout.id === id;
      });
      
      if (index === -1) {
        return null;
      }

      this.data.layouts[index] = {
        ...this.data.layouts[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      await this.saveData();
      return this.data.layouts[index];
    } catch (error) {
      console.error('Error updating layout:', error);
      return null;
    }
  }

  async deleteLayout(id: string, tenantId?: string): Promise<boolean> {
    try {
      await this.loadData();
      
      if (!this.data.layouts) {
        return false;
      }

      const index = this.data.layouts.findIndex((layout: any) => {
        if (tenantId) {
          return layout.id === id && layout.tenantId === tenantId;
        }
        return layout.id === id;
      });
      
      if (index === -1) {
        return false;
      }

      this.data.layouts.splice(index, 1);
      await this.saveData();
      return true;
    } catch (error) {
      console.error('Error deleting layout:', error);
      return false;
    }
  }

  // Zone Methods for JSON Database
  async getZonesByLayoutId(layoutId: string): Promise<any[]> {
    try {
      await this.loadData();
      return this.data.zones?.filter((zone: any) => zone.layoutId === layoutId) || [];
    } catch (error) {
      console.error('Error getting zones by layout id:', error);
      return [];
    }
  }

  async createZone(zone: any): Promise<any> {
    try {
      await this.loadData();
      
      if (!this.data.zones) {
        this.data.zones = [];
      }
      
      this.data.zones.push(zone);
      await this.saveData();
      
      return zone;
    } catch (error) {
      console.error('Error creating zone:', error);
      throw error;
    }
  }

  async deleteZonesByLayoutId(layoutId: string): Promise<boolean> {
    try {
      await this.loadData();
      
      if (!this.data.zones) {
        return true;
      }

      this.data.zones = this.data.zones.filter((zone: any) => zone.layoutId !== layoutId);
      await this.saveData();
      return true;
    } catch (error) {
      console.error('Error deleting zones by layout id:', error);
      return false;
    }
  }

  // Playlist Methods for JSON Database
  async getPlaylists(tenantId: string): Promise<Playlist[]> {
    try {
      await this.loadData();
      return this.data.playlists?.filter((playlist: any) => playlist.tenantId === tenantId) || [];
    } catch (error) {
      console.error('Error getting playlists by tenant:', error);
      return [];
    }
  }

  async getPlaylistById(id: string, tenantId?: string): Promise<Playlist | null> {
    try {
      await this.loadData();
      const playlist = this.data.playlists?.find((playlist: any) => {
        if (tenantId) {
          return playlist.id === id && playlist.tenantId === tenantId;
        }
        return playlist.id === id;
      });
      return playlist || null;
    } catch (error) {
      console.error('Error getting playlist by id:', error);
      return null;
    }
  }

  async createPlaylist(playlist: Omit<Playlist, 'createdAt' | 'updatedAt'>): Promise<Playlist> {
    try {
      await this.loadData();
      
      const newPlaylist: Playlist = {
        ...playlist,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (!this.data.playlists) {
        this.data.playlists = [];
      }
      
      this.data.playlists.push(newPlaylist);
      await this.saveData();
      
      return newPlaylist;
    } catch (error) {
      console.error('Error creating playlist:', error);
      throw error;
    }
  }

  async updatePlaylist(id: string, updates: Partial<Playlist>, tenantId?: string): Promise<Playlist | null> {
    try {
      await this.loadData();
      
      if (!this.data.playlists) {
        return null;
      }

      const index = this.data.playlists.findIndex((playlist: any) => {
        if (tenantId) {
          return playlist.id === id && playlist.tenantId === tenantId;
        }
        return playlist.id === id;
      });
      
      if (index === -1) {
        return null;
      }

      this.data.playlists[index] = {
        ...this.data.playlists[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      await this.saveData();
      return this.data.playlists[index];
    } catch (error) {
      console.error('Error updating playlist:', error);
      return null;
    }
  }

  async deletePlaylist(id: string, tenantId?: string): Promise<boolean> {
    try {
      await this.loadData();
      
      if (!this.data.playlists) {
        return false;
      }

      const index = this.data.playlists.findIndex((playlist: any) => {
        if (tenantId) {
          return playlist.id === id && playlist.tenantId === tenantId;
        }
        return playlist.id === id;
      });
      
      if (index === -1) {
        return false;
      }

      this.data.playlists.splice(index, 1);
      await this.saveData();
      return true;
    } catch (error) {
      console.error('Error deleting playlist:', error);
      return false;
    }
  }

  // Playlist Item Methods for JSON Database
  async getPlaylistItemsByPlaylistId(playlistId: string): Promise<any[]> {
    try {
      await this.loadData();
      return this.data.playlistItems?.filter((item: any) => item.playlistId === playlistId) || [];
    } catch (error) {
      console.error('Error getting playlist items by playlist id:', error);
      return [];
    }
  }

  async createPlaylistItem(item: any): Promise<any> {
    try {
      await this.loadData();
      
      if (!this.data.playlistItems) {
        this.data.playlistItems = [];
      }
      
      this.data.playlistItems.push(item);
      await this.saveData();
      
      return item;
    } catch (error) {
      console.error('Error creating playlist item:', error);
      throw error;
    }
  }

  async deletePlaylistItemsByPlaylistId(playlistId: string): Promise<boolean> {
    try {
      await this.loadData();
      
      if (!this.data.playlistItems) {
        return true;
      }

      this.data.playlistItems = this.data.playlistItems.filter((item: any) => item.playlistId !== playlistId);
      await this.saveData();
      return true;
    } catch (error) {
      console.error('Error deleting playlist items by playlist id:', error);
      return false;
    }
  }

  // Schedule Methods for JSON Database
  async getSchedulesByTenant(tenantId: string): Promise<Schedule[]> {
    try {
      await this.loadData();
      const schedules = this.data.schedules?.filter((schedule: any) => schedule.tenantId === tenantId) || [];
      
      // Add deviceIds to each schedule
      return schedules.map((schedule: any) => ({
        ...schedule,
        isActive: Boolean(schedule.active || schedule.isActive),
        daysOfWeek: Array.isArray(schedule.days) ? schedule.days : (schedule.daysOfWeek || []),
        deviceIds: this.data.scheduleDevices
          ?.filter((sd: any) => sd.scheduleId === schedule.id)
          ?.map((sd: any) => sd.deviceId) || []
      }));
    } catch (error) {
      console.error('Error getting schedules by tenant:', error);
      return [];
    }
  }

  async getScheduleById(id: string): Promise<Schedule | null> {
    try {
      await this.loadData();
      const schedule = this.data.schedules?.find((schedule: any) => schedule.id === id);
      if (!schedule) return null;
      
      const deviceIds = this.data.scheduleDevices
        ?.filter((sd: any) => sd.scheduleId === schedule.id)
        ?.map((sd: any) => sd.deviceId) || [];
      
      return {
        ...schedule,
        isActive: Boolean(schedule.active || schedule.isActive),
        daysOfWeek: Array.isArray(schedule.days) ? schedule.days : (schedule.daysOfWeek || []),
        deviceIds
      };
    } catch (error) {
      console.error('Error getting schedule by id:', error);
      return null;
    }
  }

  async createSchedule(schedule: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<Schedule> {
    try {
      await this.loadData();
      
      const newSchedule: Schedule = {
        ...schedule,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (!this.data.schedules) {
        this.data.schedules = [];
      }
      
      this.data.schedules.push(newSchedule);
      
      // Handle device associations
      if ((schedule as any).deviceIds && Array.isArray((schedule as any).deviceIds)) {
        if (!this.data.scheduleDevices) {
          this.data.scheduleDevices = [];
        }
        
        (schedule as any).deviceIds.forEach((deviceId: string) => {
          this.data.scheduleDevices.push({
            scheduleId: newSchedule.id,
            deviceId
          });
        });
      }
      
      await this.saveData();
      
      // Return with deviceIds
      return {
        ...newSchedule,
        deviceIds: (schedule as any).deviceIds || []
      } as Schedule;
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  }

  async updateSchedule(id: string, updates: Partial<Schedule>): Promise<Schedule | null> {
    try {
      await this.loadData();
      
      if (!this.data.schedules) {
        return null;
      }

      const index = this.data.schedules.findIndex((schedule: any) => schedule.id === id);
      if (index === -1) {
        return null;
      }

      this.data.schedules[index] = {
        ...this.data.schedules[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      // Handle device associations
      if ((updates as any).deviceIds && Array.isArray((updates as any).deviceIds)) {
        if (!this.data.scheduleDevices) {
          this.data.scheduleDevices = [];
        }
        
        // Remove existing associations
        this.data.scheduleDevices = this.data.scheduleDevices.filter((sd: any) => sd.scheduleId !== id);
        
        // Add new associations
        (updates as any).deviceIds.forEach((deviceId: string) => {
          this.data.scheduleDevices.push({
            scheduleId: id,
            deviceId
          });
        });
      }

      await this.saveData();
      
      // Return with deviceIds
      const deviceIds = this.data.scheduleDevices
        ?.filter((sd: any) => sd.scheduleId === id)
        ?.map((sd: any) => sd.deviceId) || [];
      
      return {
        ...this.data.schedules[index],
        deviceIds
      } as Schedule;
    } catch (error) {
      console.error('Error updating schedule:', error);
      return null;
    }
  }

  async deleteSchedule(id: string): Promise<boolean> {
    try {
      await this.loadData();
      
      if (!this.data.schedules) {
        return false;
      }

      const index = this.data.schedules.findIndex((schedule: any) => schedule.id === id);
      if (index === -1) {
        return false;
      }

      this.data.schedules.splice(index, 1);
      
      // Also delete schedule devices
      if (this.data.scheduleDevices) {
        this.data.scheduleDevices = this.data.scheduleDevices.filter((sd: any) => sd.scheduleId !== id);
      }
      
      await this.saveData();
      return true;
    } catch (error) {
      console.error('Error deleting schedule:', error);
      return false;
    }
  }

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

  // Device methods for JSON Database
  async getDevicesByTenant(tenantId: string): Promise<Device[]> {
    const devices = jsonDatabase.devices.filter((device: any) => device.tenantId === tenantId);
    return devices.map((device: any) => ({
      id: device.id,
      tenantId: device.tenantId,
      name: device.name,
      status: device.status,
      lastSeen: device.lastSeen || new Date().toISOString(),
      currentPlaylistId: device.currentPlaylistId || null,
      groupName: device.groupName || null,
      location: device.location || null,
      resolution: device.resolution || null,
      orientation: device.orientation || null,
      createdAt: device.createdAt || new Date().toISOString(),
      updatedAt: device.updatedAt || new Date().toISOString()
    }));
  }

  async getDeviceById(id: string): Promise<Device | null> {
    const device = jsonDatabase.devices.find((d: any) => d.id === id);
    if (!device) return null;
    
    return {
      id: device.id,
      tenantId: device.tenantId,
      name: device.name,
      status: device.status,
      lastSeen: device.lastSeen || new Date().toISOString(),
      currentPlaylistId: device.currentPlaylistId || null,
      groupName: device.groupName || null,
      location: device.location || null,
      resolution: device.resolution || null,
      orientation: device.orientation || null,
      createdAt: device.createdAt || new Date().toISOString(),
      updatedAt: device.updatedAt || new Date().toISOString()
    };
  }

  async createDevice(device: Omit<Device, 'createdAt' | 'updatedAt'>): Promise<Device> {
    const now = new Date().toISOString();
    const newDevice = {
      ...device,
      lastSeen: typeof device.lastSeen === 'string' ? device.lastSeen : device.lastSeen.toISOString(),
      createdAt: now,
      updatedAt: now
    } as Device;

    (jsonDatabase.devices as any[]).push(newDevice as any);
    saveDatabase();
    return newDevice;
  }

  async updateDevice(id: string, updates: Partial<Device>): Promise<Device | null> {
    const deviceIndex = jsonDatabase.devices.findIndex((d: any) => d.id === id);
    if (deviceIndex === -1) return null;

    const updatedDevice = {
      ...jsonDatabase.devices[deviceIndex],
      ...updates,
      lastSeen: updates.lastSeen
        ? (typeof updates.lastSeen === 'string' ? updates.lastSeen : updates.lastSeen.toISOString())
        : jsonDatabase.devices[deviceIndex].lastSeen,
      updatedAt: new Date().toISOString()
    };

    (jsonDatabase.devices as any[])[deviceIndex] = updatedDevice as any;
    saveDatabase();
    return updatedDevice as Device;
  }

  async deleteDevice(id: string): Promise<boolean> {
    const deviceIndex = jsonDatabase.devices.findIndex((d: any) => d.id === id);
    if (deviceIndex === -1) return false;

    jsonDatabase.devices.splice(deviceIndex, 1);
    // Also remove from schedule_devices
    jsonDatabase.scheduleDevices = jsonDatabase.scheduleDevices.filter((sd: any) => sd.deviceId !== id);
    saveDatabase();
    return true;
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