import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import supabase from './supabase.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface JsonDatabase {
  tenants: any[];
  users: any[];
  devices: any[];
  mediaItems: any[];
  layouts: any[];
  zones: any[];
  playlists: any[];
  playlistItems: any[];
  schedules: any[];
  scheduleDevices: any[];
  widgetTemplates: any[];
  widgetInstances: any[];
  userSessions: any[];
  auditLogs: any[];
}

async function loadJsonDatabase(): Promise<JsonDatabase> {
  try {
    const dbPath = path.join(__dirname, '../../../data/database.json');
    const data = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading JSON database:', error);
    throw error;
  }
}

async function migrateTenants(tenants: any[]) {
  console.log('Migrating tenants...');
  
  for (const tenant of tenants) {
    const { error } = await supabase
      .from('tenants')
      .upsert({
        id: tenant.id,
        name: tenant.name,
        domain: tenant.domain,
        subdomain: tenant.subdomain,
        plan: tenant.plan,
        status: tenant.status,
        settings: tenant.settings,
        branding: tenant.branding,
        created_at: tenant.createdAt,
        updated_at: tenant.updatedAt
      });
    
    if (error) {
      console.error('Error migrating tenant:', tenant.id, error);
    } else {
      console.log('✓ Migrated tenant:', tenant.name);
    }
  }
}

async function migrateUsers(users: any[]) {
  console.log('Migrating users...');
  
  for (const user of users) {
    // Hash password if it's not already hashed
    let hashedPassword = user.password;
    if (!user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
      hashedPassword = await bcrypt.hash(user.password, 12);
    }
    
    const { error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        tenant_id: user.tenantId,
        email: user.email,
        password: hashedPassword,
        first_name: user.firstName,
        last_name: user.lastName,
        role: user.role,
        status: user.status,
        permissions: user.permissions,
        last_login: user.lastLogin,
        login_attempts: user.loginAttempts,
        locked_until: user.lockedUntil,
        email_verified: user.emailVerified,
        email_verification_token: user.emailVerificationToken,
        password_reset_token: user.passwordResetToken,
        password_reset_expires: user.passwordResetExpires,
        two_factor_enabled: user.twoFactorEnabled,
        two_factor_secret: user.twoFactorSecret,
        preferences: user.preferences,
        created_at: user.createdAt,
        updated_at: user.updatedAt
      });
    
    if (error) {
      console.error('Error migrating user:', user.email, error);
    } else {
      console.log('✓ Migrated user:', user.email);
    }
  }
}

async function migrateDevices(devices: any[]) {
  console.log('Migrating devices...');
  
  for (const device of devices) {
    const { error } = await supabase
      .from('devices')
      .upsert({
        id: device.id,
        tenant_id: device.tenantId,
        name: device.name,
        status: device.status,
        last_seen: device.lastSeen,
        current_playlist_id: device.currentPlaylistId,
        group_name: device.groupName,
        location: device.location,
        created_at: device.createdAt,
        updated_at: device.updatedAt
      });
    
    if (error) {
      console.error('Error migrating device:', device.name, error);
    } else {
      console.log('✓ Migrated device:', device.name);
    }
  }
}

async function migrateMediaItems(mediaItems: any[]) {
  console.log('Migrating media items...');
  
  for (const media of mediaItems) {
    const { error } = await supabase
      .from('media_items')
      .upsert({
        id: media.id,
        tenant_id: media.tenantId,
        name: media.name,
        type: media.type,
        url: media.url,
        size: media.size,
        duration: media.duration,
        thumbnail: media.thumbnail,
        category: media.category,
        tags: media.tags || [],
        created_at: media.createdAt,
        updated_at: media.updatedAt
      });
    
    if (error) {
      console.error('Error migrating media item:', media.name, error);
    } else {
      console.log('✓ Migrated media item:', media.name);
    }
  }
}

async function migrateLayouts(layouts: any[]) {
  console.log('Migrating layouts...');
  
  for (const layout of layouts) {
    const { error } = await supabase
      .from('layouts')
      .upsert({
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
        created_at: layout.createdAt,
        updated_at: layout.updatedAt
      });
    
    if (error) {
      console.error('Error migrating layout:', layout.name, error);
    } else {
      console.log('✓ Migrated layout:', layout.name);
    }
  }
}

async function migrateZones(zones: any[]) {
  console.log('Migrating zones...');
  
  for (const zone of zones) {
    const { error } = await supabase
      .from('zones')
      .upsert({
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
        opacity: zone.opacity || 1,
        border_radius: zone.borderRadius || 0,
        border_width: zone.borderWidth || 0,
        border_color: zone.borderColor,
        style: zone.style
      });
    
    if (error) {
      console.error('Error migrating zone:', zone.name, error);
    } else {
      console.log('✓ Migrated zone:', zone.name);
    }
  }
}

async function migrateWidgetTemplates(templates: any[]) {
  console.log('Migrating widget templates...');
  
  for (const template of templates) {
    const { error } = await supabase
      .from('widget_templates')
      .upsert({
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
        requirements: template.requirements || [],
        is_premium: template.isPremium || false,
        config_schema: template.configSchema,
        default_config: template.defaultConfig
      });
    
    if (error) {
      console.error('Error migrating widget template:', template.name, error);
    } else {
      console.log('✓ Migrated widget template:', template.name);
    }
  }
}

async function migrateWidgetInstances(instances: any[]) {
  console.log('Migrating widget instances...');
  
  for (const instance of instances) {
    const { error } = await supabase
      .from('widget_instances')
      .upsert({
        id: instance.id,
        tenant_id: instance.tenantId,
        template_id: instance.templateId,
        name: instance.name,
        config: instance.config,
        created_at: instance.createdAt,
        updated_at: instance.updatedAt
      });
    
    if (error) {
      console.error('Error migrating widget instance:', instance.name, error);
    } else {
      console.log('✓ Migrated widget instance:', instance.name);
    }
  }
}

async function migrateAuditLogs(logs: any[]) {
  console.log('Migrating audit logs...');
  
  for (const log of logs) {
    const { error } = await supabase
      .from('audit_logs')
      .upsert({
        id: log.id,
        tenant_id: log.tenantId,
        user_id: log.userId,
        action: log.action,
        resource: log.resource,
        details: log.details,
        ip_address: log.ipAddress,
        user_agent: log.userAgent,
        timestamp: log.timestamp
      });
    
    if (error) {
      console.error('Error migrating audit log:', log.id, error);
    } else {
      console.log('✓ Migrated audit log:', log.action);
    }
  }
}

async function main() {
  try {
    console.log('🚀 Starting migration from JSON to Supabase...');
    
    // Load JSON database
    const jsonDb = await loadJsonDatabase();
    
    // Migrate in order (respecting foreign key constraints)
    await migrateTenants(jsonDb.tenants || []);
    await migrateUsers(jsonDb.users || []);
    await migrateDevices(jsonDb.devices || []);
    await migrateMediaItems(jsonDb.mediaItems || []);
    await migrateLayouts(jsonDb.layouts || []);
    await migrateZones(jsonDb.zones || []);
    await migrateWidgetTemplates(jsonDb.widgetTemplates || []);
    await migrateWidgetInstances(jsonDb.widgetInstances || []);
    await migrateAuditLogs(jsonDb.auditLogs || []);
    
    console.log('✅ Migration completed successfully!');
    console.log('📊 Migration Summary:');
    console.log(`   - Tenants: ${jsonDb.tenants?.length || 0}`);
    console.log(`   - Users: ${jsonDb.users?.length || 0}`);
    console.log(`   - Devices: ${jsonDb.devices?.length || 0}`);
    console.log(`   - Media Items: ${jsonDb.mediaItems?.length || 0}`);
    console.log(`   - Layouts: ${jsonDb.layouts?.length || 0}`);
    console.log(`   - Zones: ${jsonDb.zones?.length || 0}`);
    console.log(`   - Widget Templates: ${jsonDb.widgetTemplates?.length || 0}`);
    console.log(`   - Widget Instances: ${jsonDb.widgetInstances?.length || 0}`);
    console.log(`   - Audit Logs: ${jsonDb.auditLogs?.length || 0}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as migrateToSupabase };