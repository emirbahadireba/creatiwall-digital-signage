import { createClient } from '@supabase/supabase-js';
import { database as jsonDatabase } from './database.js';
import bcrypt from 'bcryptjs';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function migrateData() {
  console.log('🚀 Starting migration from JSON to Supabase...\n');

  try {
    // 1. Migrate Tenants
    console.log('📋 Migrating tenants...');
    if (jsonDatabase.tenants && jsonDatabase.tenants.length > 0) {
      const tenants = jsonDatabase.tenants.map((tenant: any) => ({
        id: tenant.id,
        name: tenant.name,
        domain: tenant.domain,
        subdomain: tenant.subdomain || tenant.domain.split('.')[0],
        plan: tenant.plan || 'trial',
        status: tenant.status || 'active',
        settings: tenant.settings || {},
        branding: tenant.branding || {},
        created_at: tenant.createdAt || new Date().toISOString(),
        updated_at: tenant.updatedAt || new Date().toISOString()
      }));

      const { error: tenantsError } = await supabase
        .from('tenants')
        .upsert(tenants);

      if (tenantsError) {
        console.error('❌ Error migrating tenants:', tenantsError);
      } else {
        console.log(`✅ Migrated ${tenants.length} tenants`);
      }
    }

    // 2. Migrate Users
    console.log('👥 Migrating users...');
    if (jsonDatabase.users && jsonDatabase.users.length > 0) {
      const users = await Promise.all(jsonDatabase.users.map(async (user: any) => ({
        id: user.id,
        tenant_id: user.tenantId,
        email: user.email,
        password: user.password || await bcrypt.hash('admin123', 10), // Default password
        first_name: user.firstName,
        last_name: user.lastName,
        role: user.role || 'viewer',
        status: user.status || 'active',
        permissions: user.permissions || [],
        last_login: user.lastLogin,
        login_attempts: user.loginAttempts || 0,
        locked_until: user.lockedUntil,
        email_verified: user.emailVerified || true,
        email_verification_token: user.emailVerificationToken,
        password_reset_token: user.passwordResetToken,
        password_reset_expires: user.passwordResetExpires,
        two_factor_enabled: user.twoFactorEnabled || false,
        two_factor_secret: user.twoFactorSecret,
        preferences: user.preferences || {},
        created_at: user.createdAt || new Date().toISOString(),
        updated_at: user.updatedAt || new Date().toISOString()
      })));

      const { error: usersError } = await supabase
        .from('users')
        .upsert(users);

      if (usersError) {
        console.error('❌ Error migrating users:', usersError);
      } else {
        console.log(`✅ Migrated ${users.length} users`);
      }
    }

    // 3. Migrate Devices
    console.log('📱 Migrating devices...');
    if (jsonDatabase.devices && jsonDatabase.devices.length > 0) {
      const devices = jsonDatabase.devices.map((device: any) => ({
        id: device.id,
        tenant_id: device.tenantId,
        name: device.name,
        status: device.status || 'offline',
        last_seen: device.lastSeen || new Date().toISOString(),
        current_playlist_id: device.currentPlaylistId,
        group_name: device.groupName,
        location: device.location,
        resolution: device.resolution,
        orientation: device.orientation,
        created_at: device.createdAt || new Date().toISOString(),
        updated_at: device.updatedAt || new Date().toISOString()
      }));

      const { error: devicesError } = await supabase
        .from('devices')
        .upsert(devices);

      if (devicesError) {
        console.error('❌ Error migrating devices:', devicesError);
      } else {
        console.log(`✅ Migrated ${devices.length} devices`);
      }
    }

    // 4. Migrate Media Items
    console.log('🎬 Migrating media items...');
    if (jsonDatabase.mediaItems && jsonDatabase.mediaItems.length > 0) {
      const mediaItems = jsonDatabase.mediaItems.map((media: any) => ({
        id: media.id,
        tenant_id: media.tenantId,
        name: media.name,
        type: media.type,
        url: media.url,
        thumbnail_url: media.thumbnailUrl,
        duration: media.duration,
        size: media.size,
        metadata: media.metadata || {},
        created_at: media.createdAt || new Date().toISOString(),
        updated_at: media.updatedAt || new Date().toISOString()
      }));

      const { error: mediaError } = await supabase
        .from('media_items')
        .upsert(mediaItems);

      if (mediaError) {
        console.error('❌ Error migrating media items:', mediaError);
      } else {
        console.log(`✅ Migrated ${mediaItems.length} media items`);
      }
    }

    // 5. Migrate Layouts
    console.log('🎨 Migrating layouts...');
    if (jsonDatabase.layouts && jsonDatabase.layouts.length > 0) {
      const layouts = jsonDatabase.layouts.map((layout: any) => ({
        id: layout.id,
        tenant_id: layout.tenantId,
        name: layout.name,
        description: layout.description,
        template: layout.template || 'custom',
        category: layout.category || 'custom',
        orientation: layout.orientation || 'landscape',
        thumbnail: layout.thumbnail,
        dimensions: layout.dimensions || { width: 1920, height: 1080 },
        background_color: layout.backgroundColor,
        zones: layout.zones || [],
        settings: layout.settings || {},
        created_at: layout.createdAt || new Date().toISOString(),
        updated_at: layout.updatedAt || new Date().toISOString()
      }));

      const { error: layoutsError } = await supabase
        .from('layouts')
        .upsert(layouts);

      if (layoutsError) {
        console.error('❌ Error migrating layouts:', layoutsError);
      } else {
        console.log(`✅ Migrated ${layouts.length} layouts`);
      }
    }

    // 6. Migrate Zones (if separate)
    console.log('🔲 Migrating zones...');
    if (jsonDatabase.zones && jsonDatabase.zones.length > 0) {
      const zones = jsonDatabase.zones.map((zone: any) => ({
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
      }));

      const { error: zonesError } = await supabase
        .from('zones')
        .upsert(zones);

      if (zonesError) {
        console.error('❌ Error migrating zones:', zonesError);
      } else {
        console.log(`✅ Migrated ${zones.length} zones`);
      }
    }

    // 7. Migrate Playlists
    console.log('📋 Migrating playlists...');
    if (jsonDatabase.playlists && jsonDatabase.playlists.length > 0) {
      const playlists = jsonDatabase.playlists.map((playlist: any) => ({
        id: playlist.id,
        tenant_id: playlist.tenantId,
        name: playlist.name,
        description: playlist.description,
        loop: playlist.loop || false,
        shuffle: playlist.shuffle || false,
        priority: playlist.priority || 0,
        duration: playlist.duration,
        items: playlist.items || [],
        settings: playlist.settings || {},
        created_at: playlist.createdAt || new Date().toISOString(),
        updated_at: playlist.updatedAt || new Date().toISOString()
      }));

      const { error: playlistsError } = await supabase
        .from('playlists')
        .upsert(playlists);

      if (playlistsError) {
        console.error('❌ Error migrating playlists:', playlistsError);
      } else {
        console.log(`✅ Migrated ${playlists.length} playlists`);
      }
    }

    // 8. Migrate Playlist Items (if separate)
    console.log('🎵 Migrating playlist items...');
    if (jsonDatabase.playlistItems && jsonDatabase.playlistItems.length > 0) {
      const playlistItems = jsonDatabase.playlistItems.map((item: any) => ({
        id: item.id,
        playlist_id: item.playlistId,
        media_id: item.mediaId,
        duration: item.duration,
        transition: item.transition || 'fade',
        transition_duration: item.transitionDuration || 1000,
        volume: item.volume || 1.0,
        repeat: item.repeat || 1,
        order_index: item.orderIndex,
        created_at: item.createdAt || new Date().toISOString()
      }));

      const { error: playlistItemsError } = await supabase
        .from('playlist_items')
        .upsert(playlistItems);

      if (playlistItemsError) {
        console.error('❌ Error migrating playlist items:', playlistItemsError);
      } else {
        console.log(`✅ Migrated ${playlistItems.length} playlist items`);
      }
    }

    // 9. Migrate Schedules
    console.log('📅 Migrating schedules...');
    if (jsonDatabase.schedules && jsonDatabase.schedules.length > 0) {
      const schedules = jsonDatabase.schedules.map((schedule: any) => ({
        id: schedule.id,
        tenant_id: schedule.tenantId,
        name: schedule.name,
        playlist_id: schedule.playlistId,
        start_date: schedule.startDate,
        end_date: schedule.endDate,
        start_time: schedule.startTime,
        end_time: schedule.endTime,
        days_of_week: schedule.days || schedule.daysOfWeek || [],
        priority: schedule.priority || 0,
        is_active: schedule.active !== undefined ? schedule.active : (schedule.isActive || true),
        created_at: schedule.createdAt || new Date().toISOString(),
        updated_at: schedule.updatedAt || new Date().toISOString()
      }));

      const { error: schedulesError } = await supabase
        .from('schedules')
        .upsert(schedules);

      if (schedulesError) {
        console.error('❌ Error migrating schedules:', schedulesError);
      } else {
        console.log(`✅ Migrated ${schedules.length} schedules`);
      }
    }

    // 10. Migrate Schedule Devices
    console.log('📱 Migrating schedule devices...');
    if (jsonDatabase.scheduleDevices && jsonDatabase.scheduleDevices.length > 0) {
      const scheduleDevices = jsonDatabase.scheduleDevices.map((sd: any) => ({
        schedule_id: sd.scheduleId,
        device_id: sd.deviceId,
        created_at: new Date().toISOString()
      }));

      const { error: scheduleDevicesError } = await supabase
        .from('schedule_devices')
        .upsert(scheduleDevices);

      if (scheduleDevicesError) {
        console.error('❌ Error migrating schedule devices:', scheduleDevicesError);
      } else {
        console.log(`✅ Migrated ${scheduleDevices.length} schedule devices`);
      }
    }

    // 11. Migrate Widget Instances
    console.log('🧩 Migrating widget instances...');
    if (jsonDatabase.widgetInstances && jsonDatabase.widgetInstances.length > 0) {
      const widgetInstances = jsonDatabase.widgetInstances.map((instance: any) => ({
        id: instance.id,
        tenant_id: instance.tenantId,
        template_id: instance.templateId,
        name: instance.name,
        config: instance.config,
        created_at: instance.createdAt || new Date().toISOString(),
        updated_at: instance.updatedAt || new Date().toISOString()
      }));

      const { error: widgetInstancesError } = await supabase
        .from('widget_instances')
        .upsert(widgetInstances);

      if (widgetInstancesError) {
        console.error('❌ Error migrating widget instances:', widgetInstancesError);
      } else {
        console.log(`✅ Migrated ${widgetInstances.length} widget instances`);
      }
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📊 Migration Summary:');
    console.log(`- Tenants: ${jsonDatabase.tenants?.length || 0}`);
    console.log(`- Users: ${jsonDatabase.users?.length || 0}`);
    console.log(`- Devices: ${jsonDatabase.devices?.length || 0}`);
    console.log(`- Media Items: ${jsonDatabase.mediaItems?.length || 0}`);
    console.log(`- Layouts: ${jsonDatabase.layouts?.length || 0}`);
    console.log(`- Zones: ${jsonDatabase.zones?.length || 0}`);
    console.log(`- Playlists: ${jsonDatabase.playlists?.length || 0}`);
    console.log(`- Playlist Items: ${jsonDatabase.playlistItems?.length || 0}`);
    console.log(`- Schedules: ${jsonDatabase.schedules?.length || 0}`);
    console.log(`- Schedule Devices: ${jsonDatabase.scheduleDevices?.length || 0}`);
    console.log(`- Widget Instances: ${jsonDatabase.widgetInstances?.length || 0}`);

    console.log('\n✅ Your CreatiWall system is now powered by Supabase PostgreSQL!');
    console.log('🔄 Restart your server to use the new database.');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateData();