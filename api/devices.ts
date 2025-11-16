import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Unified Database Interface
interface DatabaseInterface {
  getDevices(tenantId: string): Promise<any[]>;
  createDevice(device: any): Promise<any>;
  updateDevice(id: string, device: any): Promise<any>;
  deleteDevice(id: string): Promise<boolean>;
}

// Supabase Database Implementation
class SupabaseDatabase implements DatabaseInterface {
  private supabase: any;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || 'https://jlrsklomfbfoogaekfyd.supabase.co';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpscnNrbG9tZmJmb29nYWVrZnlkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzE0NTI3NSwiZXhwIjoyMDc4NzIxMjc1fQ.ugrz_KRYflk6uGPz3-uD0dIXeNJFiC4xurjyViLf8KE';
    
    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  async getDevices(tenantId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('devices')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Convert snake_case to camelCase
      return data?.map((device: any) => ({
        id: device.id,
        tenantId: device.tenant_id,
        name: device.name,
        status: device.status,
        lastSeen: device.last_seen,
        currentPlaylistId: device.current_playlist_id,
        groupName: device.group_name,
        location: device.location,
        createdAt: device.created_at,
        updatedAt: device.updated_at
      })) || [];
    } catch (error) {
      console.error('Supabase getDevices error:', error);
      return [];
    }
  }

  async createDevice(device: any): Promise<any> {
    try {
      const now = new Date().toISOString();
      const supabaseDevice = {
        id: device.id,
        tenant_id: device.tenantId,
        name: device.name,
        status: device.status || 'offline',
        last_seen: device.lastSeen,
        current_playlist_id: device.currentPlaylistId,
        group_name: device.groupName,
        location: device.location,
        created_at: now,
        updated_at: now
      };

      const { data, error } = await this.supabase
        .from('devices')
        .insert(supabaseDevice)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Supabase createDevice error:', error);
      throw error;
    }
  }

  async updateDevice(id: string, device: any): Promise<any> {
    try {
      const supabaseDevice = {
        name: device.name,
        status: device.status,
        last_seen: device.lastSeen,
        current_playlist_id: device.currentPlaylistId,
        group_name: device.groupName,
        location: device.location,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('devices')
        .update(supabaseDevice)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Supabase updateDevice error:', error);
      throw error;
    }
  }

  async deleteDevice(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('devices')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Supabase deleteDevice error:', error);
      return false;
    }
  }
}

// JSON Database Implementation (Fallback)
class JsonDatabase implements DatabaseInterface {
  private data: any = { devices: [] };

  async getDevices(tenantId: string): Promise<any[]> {
    return this.data.devices.filter((device: any) => device.tenantId === tenantId) || [];
  }

  async createDevice(device: any): Promise<any> {
    this.data.devices.push(device);
    console.log('✅ Device saved to JSON database:', device.name);
    return device;
  }

  async updateDevice(id: string, device: any): Promise<any> {
    const index = this.data.devices.findIndex((d: any) => d.id === id);
    if (index !== -1) {
      this.data.devices[index] = { ...this.data.devices[index], ...device };
      return this.data.devices[index];
    }
    throw new Error('Device not found');
  }

  async deleteDevice(id: string): Promise<boolean> {
    const index = this.data.devices.findIndex((d: any) => d.id === id);
    if (index !== -1) {
      this.data.devices.splice(index, 1);
      return true;
    }
    return false;
  }
}

// Factory function to create the appropriate database instance
function createDatabase(): DatabaseInterface {
  console.log('🚀 FORCING Supabase PostgreSQL database for devices');
  return new SupabaseDatabase();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Initialize unified database
    const db = createDatabase();
    console.log('📊 Database initialized for devices');

    // Extract tenant ID from auth header (simplified for demo)
    const tenantId = 'tenant-demo-001'; // In real app, extract from JWT token

    if (req.method === 'GET') {
      console.log('🔍 Getting devices for tenant:', tenantId);
      const devices = await db.getDevices(tenantId);
      console.log('📱 Found devices:', devices.length);
      
      return res.status(200).json({
        success: true,
        data: devices
      });
    }

    if (req.method === 'POST') {
      const device = req.body;
      console.log('➕ Creating device:', device.name);
      
      const newDevice = await db.createDevice({
        ...device,
        tenantId,
        id: device.id || `device-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ Device created:', newDevice.id);
      return res.status(201).json({
        success: true,
        data: newDevice
      });
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const device = req.body;
      console.log('✏️ Updating device:', id);
      
      const updatedDevice = await db.updateDevice(id as string, device);
      console.log('✅ Device updated:', updatedDevice.id);
      
      return res.status(200).json({
        success: true,
        data: updatedDevice
      });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      console.log('🗑️ Deleting device:', id);
      
      const deleted = await db.deleteDevice(id as string);
      console.log('✅ Device deleted:', deleted);
      
      return res.status(200).json({
        success: true,
        data: { deleted }
      });
    }

    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });

  } catch (error) {
    console.error('❌ Devices API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Sunucu hatası oluştu'
    });
  }
}