#!/usr/bin/env node

/**
 * Register Test Script
 * Bu script register endpoint'ini test eder ve database'e kayıt yapıp yapmadığını kontrol eder
 */

const https = require('https');

// Test data
const testUser = {
  email: `test${Date.now()}@example.com`,
  password: 'testpassword123',
  firstName: 'Test',
  lastName: 'User',
  companyName: `Test Company ${Date.now()}`,
  companyDomain: `testcompany${Date.now()}`
};

console.log('🧪 Register Test Başlatılıyor...\n');
console.log('📝 Test Kullanıcısı:');
console.log(`- Email: ${testUser.email}`);
console.log(`- Şirket: ${testUser.companyName}`);
console.log(`- Domain: ${testUser.companyDomain}\n`);

// Test register endpoint
function testRegister() {
  const postData = JSON.stringify(testUser);
  
  const options = {
    hostname: 'creatiwall-digital-signage.vercel.app',
    port: 443,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log('🚀 Register endpoint test ediliyor...');
  console.log(`📡 URL: https://${options.hostname}${options.path}\n`);

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(`📊 Response Status: ${res.statusCode}`);
      console.log(`📋 Response Headers:`, res.headers);
      console.log(`📄 Response Body:`, data);
      
      try {
        const response = JSON.parse(data);
        
        if (res.statusCode === 201 && response.success) {
          console.log('\n✅ REGISTER BAŞARILI!');
          console.log('🎉 Kullanıcı başarıyla oluşturuldu');
          console.log('🔑 Token alındı:', response.data.token ? 'Evet' : 'Hayır');
          console.log('👤 User ID:', response.data.user?.id);
          console.log('🏢 Tenant ID:', response.data.tenant?.id);
          console.log('\n🗄️ Database\'e kayıt yapıldı!');
          
          // Test login with new user
          setTimeout(() => testLogin(testUser.email, testUser.password), 2000);
        } else {
          console.log('\n❌ REGISTER BAŞARISIZ!');
          console.log('🔍 Hata:', response.error || 'Bilinmeyen hata');
        }
      } catch (parseError) {
        console.log('\n❌ JSON Parse Hatası:', parseError.message);
        console.log('📄 Raw Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request Hatası:', error.message);
  });

  req.write(postData);
  req.end();
}

// Test login with registered user
function testLogin(email, password) {
  const postData = JSON.stringify({ email, password });
  
  const options = {
    hostname: 'creatiwall-digital-signage.vercel.app',
    port: 443,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log('\n🔐 Login test ediliyor (yeni kullanıcı ile)...');

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(`📊 Login Status: ${res.statusCode}`);
      
      try {
        const response = JSON.parse(data);
        
        if (res.statusCode === 200 && response.success) {
          console.log('✅ LOGIN BAŞARILI!');
          console.log('🎉 Yeni kullanıcı ile giriş yapıldı');
          console.log('🔑 Token alındı:', response.data.token ? 'Evet' : 'Hayır');
          console.log('\n🎯 SONUÇ: Database\'e kayıt ÇALIŞIYOR!');
        } else {
          console.log('❌ LOGIN BAŞARISIZ!');
          console.log('🔍 Hata:', response.error || 'Bilinmeyen hata');
          console.log('\n⚠️  Register çalıştı ama login çalışmadı - Database persistence sorunu olabilir');
        }
      } catch (parseError) {
        console.log('❌ Login JSON Parse Hatası:', parseError.message);
      }
      
      console.log('\n🏁 Test tamamlandı!');
    });
  });

  req.on('error', (error) => {
    console.error('❌ Login Request Hatası:', error.message);
  });

  req.write(postData);
  req.end();
}

// Start test
testRegister();