import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Hardcoded Supabase credentials (same as register/login)
const supabaseUrl = 'https://ixqkqvhqfbpjpibhlqtb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4cWtxdmhxZmJwanBpYmhscXRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3MjU5NzEsImV4cCI6MjA0NzMwMTk3MX0.YCOkdOJNHS8tJoqeGBYyJlBxKOqaQkGOQKJmrOQKqhI';

const supabase = createClient(supabaseUrl, supabaseKey);

// Field conversion helpers
function convertToSnakeCase(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  const converted: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    converted[snakeKey] = value;
  }
  return converted;
}

function convertToCamelCase(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  const converted: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    converted[camelKey] = value;
  }
  return converted;
}

// Simple in-memory database for demo
let database = {
  devices: [] as any[]
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('📱 Devices API called:', req.method, req.url);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req;
  
  // Handle individual device operations (/devices/{id})
  const deviceIdMatch = url?.match(/\/devices\/([^\/\?]+)/);
  if (deviceIdMatch) {
    const deviceId = deviceIdMatch[1];

    try {
      if (req.method === 'GET') {
        console.log('📋 Getting single device:', deviceId);
        
        const { data, error } = await supabase
          .from('devices')
          .select('*')
          .eq('id', deviceId)
          .single();

        if (error) {
          console.error('❌ Supabase device error:', error);
          console.log('🔄 Using fallback database...');
          
          const device = database.devices.find(d => d.id === deviceId);
          if (!device) {
            return res.status(404).json({
              success: false,
              message: 'Device not found'
            });
          }
          
          return res.status(200).json({
            success: true,
            data: device,
            source: 'fallback'
          });
        }

        console.log('✅ Device retrieved from Supabase:', data);
        
        // Convert snake_case to camelCase for frontend
        const convertedData = convertToCamelCase(data);
        
        return res.status(200).json({
          success: true,
          data: convertedData,
          source: 'supabase'
        });
      }

      if (req.method === 'PUT') {
        console.log('✏️ Updating device:', deviceId);
        const updateData = req.body;

        // Convert camelCase to snake_case for database
        const dbData = convertToSnakeCase({
          ...updateData,
          updatedAt: new Date().toISOString()
        });

        console.log('💾 Updating device in Supabase:', deviceId, dbData);

        const { data, error } = await supabase
          .from('devices')
          .update(dbData)
          .eq('id', deviceId)
          .select()
          .single();

        if (error) {
          console.error('❌ Supabase device update error:', error);
          console.log('🔄 Using fallback database...');
          
          const deviceIndex = database.devices.findIndex(d => d.id === deviceId);
          if (deviceIndex === -1) {
            return res.status(404).json({
              success: false,
              message: 'Device not found'
            });
          }
          
          database.devices[deviceIndex] = {
            ...database.devices[deviceIndex],
            ...updateData,
            updatedAt: new Date().toISOString()
          };
          
          return res.status(200).json({
            success: true,
            data: database.devices[deviceIndex],
            source: 'fallback'
          });
        }

        console.log('✅ Device updated in Supabase:', data);
        
        // Convert back to camelCase for response
        const convertedData = convertToCamelCase(data);
        
        return res.status(200).json({
          success: true,
          data: convertedData,
          source: 'supabase'
        });
      }

      if (req.method === 'DELETE') {
        console.log('🗑️ Deleting device:', deviceId);

        const { error } = await supabase
          .from('devices')
          .delete()
          .eq('id', deviceId);

        if (error) {
          console.error('❌ Supabase device delete error:', error);
          console.log('🔄 Using fallback database...');
          
          const deviceIndex = database.devices.findIndex(d => d.id === deviceId);
          if (deviceIndex === -1) {
            return res.status(404).json({
              success: false,
              message: 'Device not found'
            });
          }
          
          database.devices.splice(deviceIndex, 1);
          
          return res.status(200).json({
            success: true,
            message: 'Device deleted',
            source: 'fallback'
          });
        }

        console.log('✅ Device deleted from Supabase');
        
        return res.status(200).json({
          success: true,
          message: 'Device deleted',
          source: 'supabase'
        });
      }

    } catch (error) {
      console.error('💥 Device operation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Handle collection operations (/devices)
  try {
    if (req.method === 'GET') {
      console.log('📋 Getting devices from Supabase...');
      
      const { data: devices, error } = await supabase
        .from('devices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Supabase devices error:', error);
        console.log('🔄 Using fallback database...');
        return res.status(200).json({
          success: true,
          data: database.devices,
          source: 'fallback'
        });
      }

      console.log('✅ Devices retrieved from Supabase:', devices?.length || 0);
      
      // Convert snake_case to camelCase for frontend
      const convertedData = devices?.map(convertToCamelCase) || [];
      
      return res.status(200).json({
        success: true,
        data: convertedData,
        source: 'supabase'
      });
    }

    if (req.method === 'POST') {
      console.log('➕ Creating new device...');
      const deviceData = req.body;
      
      // Convert camelCase to snake_case for database
      const dbData = convertToSnakeCase({
        ...deviceData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      console.log('💾 Inserting device to Supabase:', dbData);

      const { data, error } = await supabase
        .from('devices')
        .insert([dbData])
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase device insert error:', error);
        console.log('🔄 Using fallback database...');
        
        const fallbackData = {
          ...deviceData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        database.devices.push(fallbackData);
        
        return res.status(201).json({
          success: true,
          data: fallbackData,
          source: 'fallback'
        });
      }

      console.log('✅ Device created in Supabase:', data);
      
      // Convert back to camelCase for response
      const convertedData = convertToCamelCase(data);
      
      return res.status(201).json({
        success: true,
        data: convertedData,
        source: 'supabase'
      });
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });

  } catch (error) {
    console.error('💥 Devices API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}