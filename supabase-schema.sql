-- CreatiWall Digital Signage System - Supabase Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- Create tenants table
CREATE TABLE tenants (
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

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT DEFAULT 'viewer',
    status TEXT DEFAULT 'active',
    permissions TEXT[] DEFAULT '{}',
    last_login TIMESTAMPTZ,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    email_verified BOOLEAN DEFAULT false,
    email_verification_token TEXT,
    password_reset_token TEXT,
    password_reset_expires TIMESTAMPTZ,
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create devices table
CREATE TABLE devices (
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

-- Create media_items table
CREATE TABLE media_items (
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

-- Create layouts table
CREATE TABLE layouts (
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

-- Create zones table
CREATE TABLE zones (
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

-- Create playlists table
CREATE TABLE playlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    duration INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create playlist_items table
CREATE TABLE playlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
    media_id UUID REFERENCES media_items(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    duration INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create schedules table
CREATE TABLE schedules (
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

-- Create schedule_devices table
CREATE TABLE schedule_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE,
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(schedule_id, device_id)
);

-- Create widget_templates table
CREATE TABLE widget_templates (
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

-- Create widget_instances table
CREATE TABLE widget_instances (
    id TEXT PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    template_id TEXT REFERENCES widget_templates(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    config JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_sessions table
CREATE TABLE user_sessions (
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

-- Create audit_logs table
CREATE TABLE audit_logs (
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

-- Create indexes for performance
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_devices_tenant_id ON devices(tenant_id);
CREATE INDEX idx_media_items_tenant_id ON media_items(tenant_id);
CREATE INDEX idx_layouts_tenant_id ON layouts(tenant_id);
CREATE INDEX idx_zones_layout_id ON zones(layout_id);
CREATE INDEX idx_playlists_tenant_id ON playlists(tenant_id);
CREATE INDEX idx_schedules_tenant_id ON schedules(tenant_id);
CREATE INDEX idx_widget_instances_tenant_id ON widget_instances(tenant_id);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(token);
CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);

-- Enable Row Level Security (RLS)
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

-- RLS Policies for multi-tenant isolation
-- Users can only access their own tenant's data

-- Tenants policies
CREATE POLICY "Users can view their own tenant" ON tenants
    FOR SELECT USING (id = (current_setting('app.current_tenant_id'))::uuid);

-- Users policies
CREATE POLICY "Users can view users in their tenant" ON users
    FOR SELECT USING (tenant_id = (current_setting('app.current_tenant_id'))::uuid);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (id = (current_setting('app.current_user_id'))::uuid);

-- Devices policies
CREATE POLICY "Users can manage devices in their tenant" ON devices
    FOR ALL USING (tenant_id = (current_setting('app.current_tenant_id'))::uuid);

-- Media items policies
CREATE POLICY "Users can manage media in their tenant" ON media_items
    FOR ALL USING (tenant_id = (current_setting('app.current_tenant_id'))::uuid);

-- Layouts policies
CREATE POLICY "Users can manage layouts in their tenant" ON layouts
    FOR ALL USING (tenant_id = (current_setting('app.current_tenant_id'))::uuid);

-- Zones policies (inherit from layouts)
CREATE POLICY "Users can manage zones in their tenant" ON zones
    FOR ALL USING (
        layout_id IN (
            SELECT id FROM layouts WHERE tenant_id = (current_setting('app.current_tenant_id'))::uuid
        )
    );

-- Playlists policies
CREATE POLICY "Users can manage playlists in their tenant" ON playlists
    FOR ALL USING (tenant_id = (current_setting('app.current_tenant_id'))::uuid);

-- Playlist items policies (inherit from playlists)
CREATE POLICY "Users can manage playlist items in their tenant" ON playlist_items
    FOR ALL USING (
        playlist_id IN (
            SELECT id FROM playlists WHERE tenant_id = (current_setting('app.current_tenant_id'))::uuid
        )
    );

-- Schedules policies
CREATE POLICY "Users can manage schedules in their tenant" ON schedules
    FOR ALL USING (tenant_id = (current_setting('app.current_tenant_id'))::uuid);

-- Schedule devices policies (inherit from schedules)
CREATE POLICY "Users can manage schedule devices in their tenant" ON schedule_devices
    FOR ALL USING (
        schedule_id IN (
            SELECT id FROM schedules WHERE tenant_id = (current_setting('app.current_tenant_id'))::uuid
        )
    );

-- Widget templates policies (public read)
CREATE POLICY "Anyone can view widget templates" ON widget_templates
    FOR SELECT USING (true);

-- Widget instances policies
CREATE POLICY "Users can manage widget instances in their tenant" ON widget_instances
    FOR ALL USING (tenant_id = (current_setting('app.current_tenant_id'))::uuid);

-- User sessions policies
CREATE POLICY "Users can manage their own sessions" ON user_sessions
    FOR ALL USING (user_id = (current_setting('app.current_user_id'))::uuid);

-- Audit logs policies
CREATE POLICY "Users can view audit logs in their tenant" ON audit_logs
    FOR SELECT USING (tenant_id = (current_setting('app.current_tenant_id'))::uuid);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_items_updated_at BEFORE UPDATE ON media_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_layouts_updated_at BEFORE UPDATE ON layouts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE ON playlists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_widget_instances_updated_at BEFORE UPDATE ON widget_instances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default widget templates
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
'{"feedUrl": "https://www.trthaber.com/xml_mobile.rss", "maxItems": 10, "refreshInterval": 300, "textColor": "#ffffff", "backgroundColor": "transparent", "displayMode": "list"}');

-- Create demo tenant
INSERT INTO tenants (id, name, domain, subdomain, plan, status, settings, branding) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Demo Şirketi', 'demo.creatiwall.com', 'demo', 'premium', 'active', 
'{"maxUsers": 50, "maxDevices": 100, "maxStorage": "10GB", "features": ["advanced_widgets", "custom_branding", "api_access"]}',
'{"logo": null, "primaryColor": "#ffc000", "secondaryColor": "#333333"}');

-- Create demo admin user (password: admin123)
INSERT INTO users (id, tenant_id, email, password, first_name, last_name, role, status, permissions, email_verified) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'admin@demo.com', '$2a$10$example.hash.will.be.generated', 'Admin', 'User', 'tenant_admin', 'active', ARRAY['*'], true);

-- Success message
SELECT 'CreatiWall Supabase schema created successfully!' as message;