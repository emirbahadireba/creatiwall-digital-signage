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
  schedules: [] as any[]
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('📅 Schedules API called:', req.method, req.url);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      console.log('📋 Getting schedules from Supabase...');
      
      // Get schedules with their devices, playlists, and layouts
      const { data: schedules, error: schedulesError } = await supabase
        .from('schedules')
        .select(`
          *,
          schedule_devices (
            *,
            devices (*)
          ),
          playlists (*),
          layouts (*)
        `)
        .order('created_at', { ascending: false });

      if (schedulesError) {
        console.error('❌ Supabase schedules error:', schedulesError);
        console.log('🔄 Using fallback database...');
        return res.status(200).json({
          success: true,
          data: database.schedules,
          source: 'fallback'
        });
      }

      console.log('✅ Schedules retrieved from Supabase:', schedules?.length || 0);
      
      // Convert snake_case to camelCase for frontend
      const convertedData = schedules?.map(schedule => {
        const convertedSchedule = convertToCamelCase(schedule);
        
        // Convert schedule devices and their devices
        if (convertedSchedule.scheduleDevices) {
          convertedSchedule.scheduleDevices = convertedSchedule.scheduleDevices.map((item: any) => {
            const convertedItem = convertToCamelCase(item);
            if (convertedItem.devices) {
              convertedItem.devices = convertToCamelCase(convertedItem.devices);
            }
            return convertedItem;
          });
        }
        
        // Convert playlists and layouts
        if (convertedSchedule.playlists) {
          convertedSchedule.playlists = convertToCamelCase(convertedSchedule.playlists);
        }
        if (convertedSchedule.layouts) {
          convertedSchedule.layouts = convertToCamelCase(convertedSchedule.layouts);
        }
        
        return convertedSchedule;
      }) || [];
      
      return res.status(200).json({
        success: true,
        data: convertedData,
        source: 'supabase'
      });
    }

    if (req.method === 'POST') {
      console.log('➕ Creating new schedule...');
      const { devices, ...scheduleData } = req.body;
      
      // Convert camelCase to snake_case for database
      const dbScheduleData = convertToSnakeCase({
        ...scheduleData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      console.log('💾 Inserting schedule to Supabase:', dbScheduleData);

      const { data: schedule, error: scheduleError } = await supabase
        .from('schedules')
        .insert([dbScheduleData])
        .select()
        .single();

      if (scheduleError) {
        console.error('❌ Supabase schedule insert error:', scheduleError);
        console.log('🔄 Using fallback database...');
        
        const fallbackData = {
          ...scheduleData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          devices: devices || []
        };
        
        database.schedules.push(fallbackData);
        
        return res.status(201).json({
          success: true,
          data: fallbackData,
          source: 'fallback'
        });
      }

      // Insert schedule devices if provided
      let insertedDevices = [];
      if (devices && devices.length > 0) {
        console.log('💾 Inserting schedule devices to Supabase:', devices.length);
        
        const dbDevices = devices.map((deviceId: string) => convertToSnakeCase({
          id: `${schedule.id}_${deviceId}_${Date.now()}`,
          scheduleId: schedule.id,
          deviceId: deviceId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));

        const { data: devicesData, error: devicesError } = await supabase
          .from('schedule_devices')
          .insert(dbDevices)
          .select(`
            *,
            devices (*)
          `);

        if (devicesError) {
          console.error('❌ Supabase schedule devices insert error:', devicesError);
        } else {
          insertedDevices = devicesData?.map(item => {
            const convertedItem = convertToCamelCase(item);
            if (convertedItem.devices) {
              convertedItem.devices = convertToCamelCase(convertedItem.devices);
            }
            return convertedItem;
          }) || [];
          console.log('✅ Schedule devices created in Supabase:', insertedDevices.length);
        }
      }

      console.log('✅ Schedule created in Supabase:', schedule);
      
      // Convert back to camelCase for response
      const convertedSchedule = convertToCamelCase(schedule);
      convertedSchedule.scheduleDevices = insertedDevices;
      
      return res.status(201).json({
        success: true,
        data: convertedSchedule,
        source: 'supabase'
      });
    }

    if (req.method === 'PUT') {
      console.log('✏️ Updating schedule...');
      const { id, devices, ...updateData } = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Schedule ID is required'
        });
      }

      // Convert camelCase to snake_case for database
      const dbData = convertToSnakeCase({
        ...updateData,
        updatedAt: new Date().toISOString()
      });

      console.log('💾 Updating schedule in Supabase:', id, dbData);

      const { data: schedule, error: scheduleError } = await supabase
        .from('schedules')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();

      if (scheduleError) {
        console.error('❌ Supabase schedule update error:', scheduleError);
        console.log('🔄 Using fallback database...');
        
        const scheduleIndex = database.schedules.findIndex(s => s.id === id);
        if (scheduleIndex !== -1) {
          database.schedules[scheduleIndex] = {
            ...database.schedules[scheduleIndex],
            ...updateData,
            devices: devices || database.schedules[scheduleIndex].devices,
            updatedAt: new Date().toISOString()
          };
          
          return res.status(200).json({
            success: true,
            data: database.schedules[scheduleIndex],
            source: 'fallback'
          });
        }
        
        return res.status(404).json({
          success: false,
          message: 'Schedule not found'
        });
      }

      // Update schedule devices if provided
      let updatedDevices = [];
      if (devices) {
        console.log('💾 Updating schedule devices in Supabase...');
        
        // Delete existing devices
        await supabase
          .from('schedule_devices')
          .delete()
          .eq('schedule_id', id);

        // Insert new devices
        if (devices.length > 0) {
          const dbDevices = devices.map((deviceId: string) => convertToSnakeCase({
            id: `${id}_${deviceId}_${Date.now()}`,
            scheduleId: id,
            deviceId: deviceId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));

          const { data: devicesData, error: devicesError } = await supabase
            .from('schedule_devices')
            .insert(dbDevices)
            .select(`
              *,
              devices (*)
            `);

          if (!devicesError) {
            updatedDevices = devicesData?.map(item => {
              const convertedItem = convertToCamelCase(item);
              if (convertedItem.devices) {
                convertedItem.devices = convertToCamelCase(convertedItem.devices);
              }
              return convertedItem;
            }) || [];
            console.log('✅ Schedule devices updated in Supabase:', updatedDevices.length);
          }
        }
      }

      console.log('✅ Schedule updated in Supabase:', schedule);
      
      // Convert back to camelCase for response
      const convertedSchedule = convertToCamelCase(schedule);
      convertedSchedule.scheduleDevices = updatedDevices;
      
      return res.status(200).json({
        success: true,
        data: convertedSchedule,
        source: 'supabase'
      });
    }

    if (req.method === 'DELETE') {
      console.log('🗑️ Deleting schedule...');
      const { id } = req.query;
      
      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Schedule ID is required'
        });
      }

      console.log('💾 Deleting schedule from Supabase:', id);

      // Delete schedule devices first (cascade should handle this, but being explicit)
      await supabase
        .from('schedule_devices')
        .delete()
        .eq('schedule_id', id);

      // Delete schedule
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Supabase delete error:', error);
        console.log('🔄 Using fallback database...');
        
        const scheduleIndex = database.schedules.findIndex(s => s.id === id);
        if (scheduleIndex !== -1) {
          database.schedules.splice(scheduleIndex, 1);
          
          return res.status(200).json({
            success: true,
            message: 'Schedule deleted',
            source: 'fallback'
          });
        }
        
        return res.status(404).json({
          success: false,
          message: 'Schedule not found'
        });
      }

      console.log('✅ Schedule deleted from Supabase');
      
      return res.status(200).json({
        success: true,
        message: 'Schedule deleted',
        source: 'supabase'
      });
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });

  } catch (error) {
    console.error('💥 Schedules API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}