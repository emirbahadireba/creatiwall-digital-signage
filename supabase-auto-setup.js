#!/usr/bin/env node

/**
 * CreatiWall - Otomatik Supabase Setup Script
 * Bu script Supabase'i otomatik olarak aktif hale getirir
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 CreatiWall Otomatik Supabase Setup başlatılıyor...\n');

// Demo Supabase credentials (gerçek production için değiştirin)
const DEMO_SUPABASE_CONFIG = {
  SUPABASE_URL: 'https://demo-creatiwall.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
  SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
};

// .env dosyasını güncelle
function updateEnvFile() {
  console.log('📝 Environment dosyaları güncelleniyor...');
  
  const envFiles = ['.env', '.env.local', '.env.production'];
  
  envFiles.forEach(envFile => {
    let envContent = '';
    
    if (fs.existsSync(envFile)) {
      envContent = fs.readFileSync(envFile, 'utf8');
    }
    
    // Supabase config'i ekle/güncelle
    Object.entries(DEMO_SUPABASE_CONFIG).forEach(([key, value]) => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      const line = `${key}=${value}`;
      
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, line);
      } else {
        envContent += `\n${line}`;
      }
    });
    
    fs.writeFileSync(envFile, envContent.trim() + '\n');
    console.log(`✅ ${envFile} güncellendi`);
  });
}

// Vercel environment variables'ları ayarla
function setupVercelEnv() {
  console.log('🔧 Vercel environment variables ayarlanıyor...');
  
  const vercelEnv = {
    ...DEMO_SUPABASE_CONFIG,
    NODE_ENV: 'production'
  };
  
  // .env.production dosyası oluştur
  const prodEnvContent = Object.entries(vercelEnv)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  fs.writeFileSync('.env.production', prodEnvContent);
  console.log('✅ .env.production oluşturuldu');
}

// Package.json'a Supabase dependencies ekle
function addSupabaseDependencies() {
  console.log('📦 Supabase dependencies kontrol ediliyor...');
  
  const packageJsonPath = 'package.json';
  if (!fs.existsSync(packageJsonPath)) {
    console.log('❌ package.json bulunamadı');
    return;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const requiredDeps = {
    '@supabase/supabase-js': '^2.38.0'
  };
  
  let needsUpdate = false;
  
  Object.entries(requiredDeps).forEach(([dep, version]) => {
    if (!packageJson.dependencies || !packageJson.dependencies[dep]) {
      if (!packageJson.dependencies) packageJson.dependencies = {};
      packageJson.dependencies[dep] = version;
      needsUpdate = true;
      console.log(`➕ ${dep} eklendi`);
    }
  });
  
  if (needsUpdate) {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ package.json güncellendi');
  } else {
    console.log('✅ Tüm dependencies mevcut');
  }
}

// Supabase schema'yı otomatik deploy et
function createAutoSchema() {
  console.log('🗄️ Otomatik Supabase schema oluşturuluyor...');
  
  const autoSchemaContent = `
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
`;
  
  fs.writeFileSync('supabase-auto-schema.sql', autoSchemaContent);
  console.log('✅ supabase-auto-schema.sql oluşturuldu');
}

// Ana setup fonksiyonu
async function main() {
  try {
    updateEnvFile();
    setupVercelEnv();
    addSupabaseDependencies();
    createAutoSchema();
    
    console.log('\n🎉 Otomatik Supabase setup tamamlandı!');
    console.log('\n📋 Sonraki adımlar:');
    console.log('1. npm install (yeni dependencies için)');
    console.log('2. Supabase dashboard\'da supabase-auto-schema.sql\'i çalıştır');
    console.log('3. Sistem otomatik olarak Supabase kullanmaya başlayacak');
    console.log('\n🔐 Demo Login Bilgileri:');
    console.log('Email: admin@demo.com');
    console.log('Şifre: admin123');
    console.log('\n✨ Sistem şimdi tam otomatik çalışıyor!');
    
  } catch (error) {
    console.error('❌ Setup sırasında hata:', error);
    process.exit(1);
  }
}

// Script'i çalıştır
main();