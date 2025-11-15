import { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
  createdAt: string;
}

interface Database {
  users: User[];
  [key: string]: any;
}

function readDatabase(): Database {
  try {
    // Try to read from environment variable first (for production)
    if (process.env.DATABASE_JSON) {
      return JSON.parse(process.env.DATABASE_JSON);
    }
    
    // Fallback to file system (for development)
    try {
      const { readFileSync, existsSync } = require('fs');
      const { join } = require('path');
      const DATABASE_PATH = join(process.cwd(), 'server/data/database.json');
      
      if (existsSync(DATABASE_PATH)) {
        const data = readFileSync(DATABASE_PATH, 'utf8');
        return JSON.parse(data);
      }
    } catch (fsError) {
      console.log('File system access failed, using fallback data');
    }
    
    // Fallback with demo users
    return {
      users: [
        {
          id: "user-admin-001",
          tenantId: "tenant-demo-001",
          email: "admin@demo.com",
          password: "$2a$10$example.hash.will.be.generated",
          firstName: "Admin",
          lastName: "User",
          role: "tenant_admin",
          createdAt: "2025-11-14T04:00:00.000Z"
        },
        {
          id: "f2708bf9-0b00-4952-bc9e-d278e109c918",
          tenantId: "aa11e13c-323c-4724-b5d7-fde42ab80fd4",
          email: "emirbahadir@gmail.com",
          password: "$2b$12$moetwvTw.pKMPFMg1yM4K.Sfm4m57vAeXAkjXIhAK5z9WL9pY4HsG",
          firstName: "Emir",
          lastName: "Bahadır",
          role: "tenant_admin",
          createdAt: "2025-11-14T04:25:32.017Z"
        },
        {
          id: "de9eb699-2d55-4298-825a-ee2ef4a8874f",
          tenantId: "ecac70bf-3b60-40b3-a366-eafa6ad5dfac",
          email: "test@demo.com",
          password: "$2b$12$eFqSJAxC2jOUreRf31P4yusBxoyHTC8pTwkKptA/Tf.xjmfyLL3Y.",
          firstName: "Test",
          lastName: "User",
          role: "tenant_admin",
          createdAt: "2025-11-14T04:28:29.726Z"
        },
        {
          id: "a6cdc0e5-57d3-43e7-82b2-44be508b33d1",
          tenantId: "2c3e79b5-6ff1-4f20-93a7-969f69ec94a3",
          email: "test@example.com",
          password: "$2b$12$xrYYfOdOBqIGCiBS8wtAKOSx9XQNh5hEcZwCUEUzjg1CxPZasW.s2",
          firstName: "Test",
          lastName: "User",
          role: "tenant_admin",
          createdAt: "2025-11-15T11:37:34.302Z"
        }
      ]
    };
  } catch (error) {
    console.error('Error reading database:', error);
    return { users: [] };
  }
}

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

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email ve şifre gereklidir'
      });
    }

    const db = readDatabase();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Geçersiz email veya şifre'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
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

    return res.status(200).json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Sunucu hatası'
    });
  }
}