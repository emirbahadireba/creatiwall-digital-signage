-- CreatiWall Digital Signage System - Supabase Schema Fix
-- Bu script mevcut tabloları kontrol eder ve eksik kolonları ekler
-- Supabase Auth ile uyumlu çalışır

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- First, let's check what columns exist in users table and add missing ones
DO $$
BEGIN
    -- Add password column to users table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password') THEN
        ALTER TABLE users ADD COLUMN password TEXT;
    END IF;
    
    -- Add tenant_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'tenant_id') THEN
        ALTER TABLE users ADD COLUMN tenant_id UUID;
    END IF;
    
    -- Add first_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'first_name') THEN
        ALTER TABLE users ADD COLUMN first_name TEXT;
    END IF;
    
    -- Add last_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_name') THEN
        ALTER TABLE users ADD COLUMN last_name TEXT;
    END IF;
    
    -- Add role column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'viewer';
    END IF;
    
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'status') THEN
        ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active';
    END IF;
    
    -- Add permissions column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'permissions') THEN
        ALTER TABLE users ADD COLUMN permissions TEXT[] DEFAULT '{}';
    END IF;
    
    -- Add last_login column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_login') THEN
        ALTER TABLE users ADD COLUMN last_login TIMESTAMPTZ;
    END IF;
    
    -- Add login_attempts column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'login_attempts') THEN
        ALTER TABLE users ADD COLUMN login_attempts INTEGER DEFAULT 0;
    END IF;
    
    -- Add locked_until column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'locked_until') THEN
        ALTER TABLE users ADD COLUMN locked_until TIMESTAMPTZ;
    END IF;
    
    -- Add email_verified column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email_verified') THEN
        ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT false;
    END IF;
    
    -- Add email_verification_token column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email_verification_token') THEN
        ALTER TABLE users ADD COLUMN email_verification_token TEXT;
    END IF;
    
    -- Add password_reset_token column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_reset_token') THEN
        ALTER TABLE users ADD COLUMN password_reset_token TEXT;
    END IF;
    
    -- Add password_reset_expires column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_reset_expires') THEN
        ALTER TABLE users ADD COLUMN password_reset_expires TIMESTAMPTZ;
    END IF;
    
    -- Add two_factor_enabled column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'two_factor_enabled') THEN
        ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT false;
    END IF;
    
    -- Add two_factor_secret column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'two_factor_secret') THEN
        ALTER TABLE users ADD COLUMN two_factor_secret TEXT;
    END IF;
    
    -- Add preferences column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'preferences') THEN
        ALTER TABLE users ADD COLUMN preferences JSONB DEFAULT '{}';
    END IF;
END $$;

-- Create tenants table if not exists
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    domain TEXT UNIQUE NOT NULL,
    subdomain TEXT UNIQUE NOT NULL,
    plan TEXT DEFAULT 'trial',
    status TEXT DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    branding JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create devices table if not exists
CREATE TABLE IF NOT EXISTS devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'offline',
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    current_playlist_id UUID,
    group_name TEXT,
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create media_items table if not exists
CREATE TABLE IF NOT EXISTS media_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    size BIGINT NOT NULL,
    duration INTEGER,
    thumbnail TEXT,
    category TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create layouts table if not exists
CREATE TABLE IF NOT EXISTS layouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    template TEXT DEFAULT 'custom',
    category TEXT DEFAULT 'custom',
    orientation TEXT DEFAULT 'landscape',
    thumbnail TEXT,
    dimensions JSONB NOT NULL,
    background_color TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create zones table if not exists
CREATE TABLE IF NOT EXISTS zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    layout_id UUID REFERENCES layouts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    x DECIMAL NOT NULL,
    y DECIMAL NOT NULL,
    width DECIMAL NOT NULL,
    height DECIMAL NOT NULL,
    type TEXT NOT NULL,
    content TEXT,
    media_id UUID REFERENCES media_items(id) ON DELETE SET NULL,
    playlist_id UUID,
    widget_instance_id TEXT,
    background_color TEXT,
    text_color TEXT,
    font_size INTEGER,
    font_family TEXT,
    text_align TEXT,
    opacity DECIMAL DEFAULT 1,
    border_radius INTEGER DEFAULT 0,
    border_width INTEGER DEFAULT 0,
    border_color TEXT,
    style JSONB
);

-- Create playlists table if not exists
CREATE TABLE IF NOT EXISTS playlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    duration INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create playlist_items table if not exists
CREATE TABLE IF NOT EXISTS playlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
    media_id UUID REFERENCES media_items(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    duration INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create schedules table if not exists
CREATE TABLE IF NOT EXISTS schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    layout_id UUID REFERENCES layouts(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    days_of_week TEXT[] NOT NULL,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create schedule_devices table if not exists
CREATE TABLE IF NOT EXISTS schedule_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE,
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(schedule_id, device_id)
);

-- Create widget_templates table if not exists
CREATE TABLE IF NOT EXISTS widget_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category TEXT NOT NULL,
    thumbnail TEXT,
    version TEXT NOT NULL,
    author TEXT NOT NULL,
    html_url TEXT NOT NULL,
    preview_url TEXT,
    requirements TEXT[] DEFAULT '{}',
    is_premium BOOLEAN DEFAULT false,
    config_schema JSONB NOT NULL,
    default_config JSONB NOT NULL
);

-- Create widget_instances table if not exists
CREATE TABLE IF NOT EXISTS widget_instances (
    id TEXT PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    template_id TEXT REFERENCES widget_templates(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    config JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_sessions table if not exists
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    ip_address TEXT NOT NULL,
    user_agent TEXT NOT NULL,
    remember_me BOOLEAN DEFAULT false,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit_logs table if not exists
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    ip_address TEXT NOT NULL,
    user_agent TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint to users.tenant_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_tenant_id_fkey' 
        AND table_name = 'users'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_tenant_id_fkey 
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create indexes if they don't exist
DO $$
BEGIN
    -- Users indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_tenant_id') THEN
        CREATE INDEX idx_users_tenant_id ON users(tenant_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_email') THEN
        CREATE INDEX idx_users_email ON users(email);
    END IF;
    
    -- Devices indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_devices_tenant_id') THEN
        CREATE INDEX idx_devices_tenant_id ON devices(tenant_id);
    END IF;
    
    -- Media items indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_media_items_tenant_id') THEN
        CREATE INDEX idx_media_items_tenant_id ON media_items(tenant_id);
    END IF;
    
    -- Layouts indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_layouts_tenant_id') THEN
        CREATE INDEX idx_layouts_tenant_id ON layouts(tenant_id);
    END IF;
    
    -- Zones indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_zones_layout_id') THEN
        CREATE INDEX idx_zones_layout_id ON zones(layout_id);
    END IF;
    
    -- Playlists indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_playlists_tenant_id') THEN
        CREATE INDEX idx_playlists_tenant_id ON playlists(tenant_id);
    END IF;
    
    -- Schedules indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_schedules_tenant_id') THEN
        CREATE INDEX idx_schedules_tenant_id ON schedules(tenant_id);
    END IF;
    
    -- Widget instances indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_widget_instances_tenant_id') THEN
        CREATE INDEX idx_widget_instances_tenant_id ON widget_instances(tenant_id);
    END IF;
    
    -- User sessions indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_sessions_user_id') THEN
        CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_sessions_token') THEN
        CREATE INDEX idx_user_sessions_token ON user_sessions(token);
    END IF;
    
    -- Audit logs indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_audit_logs_tenant_id') THEN
        CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
    END IF;
END $$;

-- Enable Row Level Security on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies (DROP IF EXISTS to avoid conflicts)
-- Tenants policies
DROP POLICY IF EXISTS "Users can view their own tenant" ON tenants;
CREATE POLICY "Users can view their own tenant" ON tenants
    FOR SELECT USING (id = (current_setting('app.current_tenant_id', true))::uuid);

-- Users policies
DROP POLICY IF EXISTS "Users can view users in their tenant" ON users;
CREATE POLICY "Users can view users in their tenant" ON users
    FOR SELECT USING (tenant_id = (current_setting('app.current_tenant_id', true))::uuid);

DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (id = (current_setting('app.current_user_id', true))::uuid);

-- Devices policies
DROP POLICY IF EXISTS "Users can manage devices in their tenant" ON devices;
CREATE POLICY "Users can manage devices in their tenant" ON devices
    FOR ALL USING (tenant_id = (current_setting('app.current_tenant_id', true))::uuid);

-- Media items policies
DROP POLICY IF EXISTS "Users can manage media in their tenant" ON media_items;
CREATE POLICY "Users can manage media in their tenant" ON media_items
    FOR ALL USING (tenant_id = (current_setting('app.current_tenant_id', true))::uuid);

-- Layouts policies
DROP POLICY IF EXISTS "Users can manage layouts in their tenant" ON layouts;
CREATE POLICY "Users can manage layouts in their tenant" ON layouts
    FOR ALL USING (tenant_id = (current_setting('app.current_tenant_id', true))::uuid);

-- Zones policies
DROP POLICY IF EXISTS "Users can manage zones in their tenant" ON zones;
CREATE POLICY "Users can manage zones in their tenant" ON zones
    FOR ALL USING (
        layout_id IN (
            SELECT id FROM layouts WHERE tenant_id = (current_setting('app.current_tenant_id', true))::uuid
        )
    );

-- Playlists policies
DROP POLICY IF EXISTS "Users can manage playlists in their tenant" ON playlists;
CREATE POLICY "Users can manage playlists in their tenant" ON playlists
    FOR ALL USING (tenant_id = (current_setting('app.current_tenant_id', true))::uuid);

-- Playlist items policies
DROP POLICY IF EXISTS "Users can manage playlist items in their tenant" ON playlist_items;
CREATE POLICY "Users can manage playlist items in their tenant" ON playlist_items
    FOR ALL USING (
        playlist_id IN (
            SELECT id FROM playlists WHERE tenant_id = (current_setting('app.current_tenant_id', true))::uuid
        )
    );

-- Schedules policies
DROP POLICY IF EXISTS "Users can manage schedules in their tenant" ON schedules;
CREATE POLICY "Users can manage schedules in their tenant" ON schedules
    FOR ALL USING (tenant_id = (current_setting('app.current_tenant_id', true))::uuid);

-- Schedule devices policies
DROP POLICY IF EXISTS "Users can manage schedule devices in their tenant" ON schedule_devices;
CREATE POLICY "Users can manage schedule devices in their tenant" ON schedule_devices
    FOR ALL USING (
        schedule_id IN (
            SELECT id FROM schedules WHERE tenant_id = (current_setting('app.current_tenant_id', true))::uuid
        )
    );

-- Widget templates policies (public read)
DROP POLICY IF EXISTS "Anyone can view widget templates" ON widget_templates;
CREATE POLICY "Anyone can view widget templates" ON widget_templates
    FOR SELECT USING (true);

-- Widget instances policies
DROP POLICY IF EXISTS "Users can manage widget instances in their tenant" ON widget_instances;
CREATE POLICY "Users can manage widget instances in their tenant" ON widget_instances
    FOR ALL USING (tenant_id = (current_setting('app.current_tenant_id', true))::uuid);

-- User sessions policies
DROP POLICY IF EXISTS "Users can manage their own sessions" ON user_sessions;
CREATE POLICY "Users can manage their own sessions" ON user_sessions
    FOR ALL USING (user_id = (current_setting('app.current_user_id', true))::uuid);

-- Audit logs policies
DROP POLICY IF EXISTS "Users can view audit logs in their tenant" ON audit_logs;
CREATE POLICY "Users can view audit logs in their tenant" ON audit_logs
    FOR SELECT USING (tenant_id = (current_setting('app.current_tenant_id', true))::uuid);

-- Create or replace updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers if they don't exist
DO $$
BEGIN
    -- Tenants trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_tenants_updated_at') THEN
        CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Users trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Devices trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_devices_updated_at') THEN
        CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Media items trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_media_items_updated_at') THEN
        CREATE TRIGGER update_media_items_updated_at BEFORE UPDATE ON media_items
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Layouts trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_layouts_updated_at') THEN
        CREATE TRIGGER update_layouts_updated_at BEFORE UPDATE ON layouts
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Playlists trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_playlists_updated_at') THEN
        CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE ON playlists
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Schedules trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_schedules_updated_at') THEN
        CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Widget instances trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_widget_instances_updated_at') THEN
        CREATE TRIGGER update_widget_instances_updated_at BEFORE UPDATE ON widget_instances
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Insert default widget templates (ON CONFLICT DO NOTHING to avoid duplicates)
INSERT INTO widget_templates (id, name, description, icon, category, version, author, html_url, config_schema, default_config) VALUES
('widget-clock', 'Dijital Saat', 'Özelleştirilebilir dijital saat widget''ı. Tarih, saat ve saniye gösterimi.', '🕐', 'time', '1.0.0', 'CreatiWall', '/widgets/clock.html', 
'[
  {"key": "timeColor", "label": "Saat Rengi", "type": "color", "default": "#ffffff", "required": false, "description": "Saatin görüntüleneceği renk"},
  {"key": "dateColor", "label": "Tarih Rengi", "type": "color", "default": "#ffffff", "required": false, "description": "Tarihin görüntüleneceği renk"},
  {"key": "backgroundColor", "label": "Arkaplan Rengi", "type": "color", "default": "transparent", "required": false, "description": "Widget arkaplan rengi"},
  {"key": "showSeconds", "label": "Saniyeleri Göster", "type": "toggle", "default": true, "required": false, "description": "Saniye gösterimini aç/kapat"},
  {"key": "format24h", "label": "24 Saat Formatı", "type": "toggle", "default": true, "required": false, "description": "24 saat formatını kullan (kapalıysa 12 saat)"},
  {"key": "showDate", "label": "Tarihi Göster", "type": "toggle", "default": true, "required": false, "description": "Tarih gösterimini aç/kapat"}
]',
'{"timeColor": "#ffffff", "dateColor": "#ffffff", "backgroundColor": "transparent", "showSeconds": true, "format24h": true, "showDate": true}'),

('widget-weather', 'Hava Durumu', 'Canlı hava durumu bilgileri. Sıcaklık, nem, rüzgar hızı gösterimi.', '🌤️', 'weather', '1.0.0', 'CreatiWall', '/widgets/weather.html',
'[
  {"key": "city", "label": "Şehir", "type": "text", "default": "Istanbul", "required": true, "placeholder": "Istanbul", "description": "Hava durumu gösterilecek şehir"},
  {"key": "units", "label": "Birim Sistemi", "type": "select", "default": "metric", "options": [{"label": "Metrik (°C)", "value": "metric"}, {"label": "Imperial (°F)", "value": "imperial"}, {"label": "Kelvin", "value": "standard"}], "required": false, "description": "Sıcaklık birimi"},
  {"key": "refreshInterval", "label": "Yenileme Süresi (saniye)", "type": "number", "default": 600, "min": 300, "max": 3600, "required": false, "description": "Hava durumunun ne sıklıkla güncelleneceği"},
  {"key": "textColor", "label": "Metin Rengi", "type": "color", "default": "#ffffff", "required": false, "description": "Metin rengi"},
  {"key": "backgroundColor", "label": "Arkaplan Rengi", "type": "color", "default": "transparent", "required": false, "description": "Widget arkaplan rengi"},
  {"key": "showDetails", "label": "Detayları Göster", "type": "toggle", "default": true, "required": false, "description": "Nem, rüzgar gibi detayları göster"}
]',
'{"city": "Istanbul", "units": "metric", "refreshInterval": 600, "textColor": "#ffffff", "backgroundColor": "transparent", "showDetails": true}'),

('widget-rss', 'RSS Haber Akışı', 'RSS beslemelerinden haber ve içerik gösterimi. Ticker veya liste modunda çalışır.', '📰', 'data', '1.0.0', 'CreatiWall', '/widgets/rss.html',
'[
  {"key": "feedUrl", "label": "RSS Feed URL", "type": "url", "default": "https://www.trthaber.com/xml_mobile.rss", "required": true, "placeholder": "https://example.com/feed.rss", "description": "RSS beslemesinin URL adresi"},
  {"key": "maxItems", "label": "Maksimum Haber Sayısı", "type": "number", "default": 10, "min": 1, "max": 50, "required": false, "description": "Gösterilecek maksimum haber sayısı"},
  {"key": "refreshInterval", "label": "Yenileme Süresi (saniye)", "type": "number", "default": 300, "min": 60, "max": 3600, "required": false, "description": "Haberlerin ne sıklıkla güncelleneceği"},
  {"key": "textColor", "label": "Metin Rengi", "type": "color", "default": "#ffffff", "required": false, "description": "Haber metinlerinin rengi"},
  {"key": "backgroundColor", "label": "Arkaplan Rengi", "type": "color", "default": "transparent", "required": false, "description": "Widget arkaplan rengi"},
  {"key": "displayMode", "label": "Görüntüleme Modu", "type": "select", "default": "list", "options": [{"label": "Liste", "value": "list"}, {"label": "Yatay Ticker (Kayan Yazı)", "value": "ticker"}, {"label": "Card Slider (Kartlar Değişsin)", "value": "slider"}, {"label": "Dikey Scroll (Yukarı Kayan)", "value": "vertical-scroll"}, {"label": "Fade (Solarak Geçiş)", "value": "fade"}], "required": false, "description": "Haberlerin nasıl gösterileceği"}
]',
'{"feedUrl": "https://www.trthaber.com/xml_mobile.rss", "maxItems": 10, "refreshInterval": 300, "textColor": "#ffffff", "backgroundColor": "transparent", "displayMode": "list"}')
ON CONFLICT (id) DO NOTHING;

-- Insert demo tenant if not exists
INSERT INTO tenants (id, name, domain, subdomain, plan, status, settings, branding) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Demo Şirketi', 'demo.creatiwall.com', 'demo', 'premium', 'active', 
'{"maxUsers": 50, "maxDevices": 100, "maxStorage": "10GB", "features": ["advanced_widgets", "custom_branding", "api_access"]}',
'{"logo": null, "primaryColor": "#ffc000", "secondaryColor": "#333333"}')
ON CONFLICT (id) DO NOTHING;

-- Success message
SELECT 'CreatiWall Supabase schema fix applied successfully! ✅' as message;