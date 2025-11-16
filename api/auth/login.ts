import { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Import unified database
const db = (() => {
  try {
    // Try to import from server directory first
    return require('../../server/src/db/unified-database.js').db;
  } catch (error) {
    console.log('Server unified database not found, using fallback');
    // Fallback implementation
    return {
      async findUserByEmail(email: string) {
        // Fallback database with existing users
        const users = [
          {
            id: "user-admin-001",
            tenantId: "tenant-demo-001",
            email: "admin@demo.com",
            password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXzgVrqZm9vO", // password: "admin123"
            firstName: "Admin",
            lastName: "User",
            role: "tenant_admin",
            status: "active",
            createdAt: "2025-11-14T04:00:00.000Z",
            updatedAt: "2025-11-14T04:00:00.000Z"
          },
          {
            id: "simple-test-user",
            tenantId: "tenant-demo-001",
            email: "test@test.com",
            password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXzgVrqZm9vO", // password: "password123"
            firstName: "Test",
            lastName: "User",
            role: "tenant_admin",
            status: "active",
            createdAt: "2025-11-15T12:00:00.000Z",
            updatedAt: "2025-11-15T12:00:00.000Z"
          },
          {
            id: "f2708bf9-0b00-4952-bc9e-d278e109c918",
            tenantId: "aa11e13c-323c-4724-b5d7-fde42ab80fd4",
            email: "emirbahadir@gmail.com",
            password: "$2b$12$moetwvTw.pKMPFMg1yM4K.Sfm4m57vAeXAkjXIhAK5z9WL9pY4HsG",
            firstName: "Emir",
            lastName: "Bahadır",
            role: "tenant_admin",
            status: "active",
            createdAt: "2025-11-14T04:25:32.017Z",
            updatedAt: "2025-11-14T04:25:32.017Z"
          },
          {
            id: "de9eb699-2d55-4298-825a-ee2ef4a8874f",
            tenantId: "ecac70bf-3b60-40b3-a366-eafa6ad5dfac",
            email: "test@demo.com",
            password: "$2b$12$eFqSJAxC2jOUreRf31P4yusBxoyHTC8pTwkKptA/Tf.xjmfyLL3Y.",
            firstName: "Test",
            lastName: "User",
            role: "tenant_admin",
            status: "active",
            createdAt: "2025-11-14T04:28:29.726Z",
            updatedAt: "2025-11-14T04:28:29.726Z"
          },
          {
            id: "a6cdc0e5-57d3-43e7-82b2-44be508b33d1",
            tenantId: "2c3e79b5-6ff1-4f20-93a7-969f69ec94a3",
            email: "test@example.com",
            password: "$2b$12$xrYYfOdOBqIGCiBS8wtAKOSx9XQNh5hEcZwCUEUzjg1CxPZasW.s2",
            firstName: "Test",
            lastName: "User",
            role: "tenant_admin",
            status: "active",
            createdAt: "2025-11-15T11:37:34.302Z",
            updatedAt: "2025-11-15T11:37:34.302Z"
          }
        ];
        
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        return user || null;
      }
    };
  }
})();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { email, password } = req.body;
    console.log('🔐 Login attempt for:', email);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email ve şifre gereklidir'
      });
    }

    // Use unified database to find user
    console.log('🔍 Searching for user in unified database...');
    const user = await db.findUserByEmail(email);
    console.log('👤 User found:', !!user);

    if (!user) {
      console.log('❌ User not found for email:', email);
      return res.status(401).json({
        success: false,
        error: 'Geçersiz email veya şifre'
      });
    }

    console.log('🔑 Comparing password for user:', user.id);
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('✅ Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password for user:', user.id);
      return res.status(401).json({
        success: false,
        error: 'Geçersiz email veya şifre'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    console.log('🎉 Login successful for user:', user.id);
    return res.status(200).json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      }
    });

  } catch (error) {
    console.error('💥 Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Sunucu hatası'
    });
  }
}