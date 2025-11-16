-- CreatiWall Otomatik Schema (Demo Mode)
-- Bu schema otomatik olarak oluşturulmuştur

-- Demo tenant oluştur
INSERT INTO tenants (id, name, domain, subdomain, plan, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Demo Şirketi', 'demo.creatiwall.com', 'demo', 'premium', 'active')
ON CONFLICT (id) DO NOTHING;

-- Demo admin kullanıcısı oluştur (admin@demo.com / admin123)
INSERT INTO users (id, tenant_id, email, password, first_name, last_name, role, status, email_verified) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'admin@demo.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXzgVrqZm9vO', 'Admin', 'User', 'tenant_admin', 'active', true)
ON CONFLICT (email) DO NOTHING;

-- Widget templates ekle
INSERT INTO widget_templates (id, name, description, icon, category, version, author, html_url, config_schema, default_config) VALUES
('widget-clock', 'Dijital Saat', 'Özelleştirilebilir dijital saat widget''ı', '🕐', 'time', '1.0.0', 'CreatiWall', '/widgets/clock.html', '[]', '{}'),
('widget-weather', 'Hava Durumu', 'Canlı hava durumu bilgileri', '🌤️', 'weather', '1.0.0', 'CreatiWall', '/widgets/weather.html', '[]', '{}'),
('widget-rss', 'RSS Haber Akışı', 'RSS beslemelerinden haber gösterimi', '📰', 'data', '1.0.0', 'CreatiWall', '/widgets/rss.html', '[]', '{}')
ON CONFLICT (id) DO NOTHING;

SELECT 'CreatiWall otomatik setup tamamlandı!' as message;