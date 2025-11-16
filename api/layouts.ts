import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Hardcoded Supabase credentials (same as register/login)
const supabaseUrl = 'https://ixqkqvhqfbpjpibhlqtb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4cWtxdmhxZmJwanBpYmhscXRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3MjU5NzEsImV4cCI6MjA0NzMwMTk3MX0.YCOkdOJNHS8tJoqeGBYyJlBxKOqaQkGOQKJmrOQKqhI';

const supabase = createClient(supabaseUrl, supabaseKey);

// Layout dimensions presets
const LAYOUT_PRESETS = {
  'landscape-hd': { width: 1920, height: 1080, name: 'Landscape HD (1920x1080)' },
  'portrait-hd': { width: 1080, height: 1920, name: 'Portrait HD (1080x1920)' },
  'landscape-4k': { width: 3840, height: 2160, name: 'Landscape 4K (3840x2160)' },
  'portrait-4k': { width: 2160, height: 3840, name: 'Portrait 4K (2160x3840)' },
  'square-hd': { width: 1080, height: 1080, name: 'Square HD (1080x1080)' },
  'ultrawide': { width: 2560, height: 1080, name: 'Ultrawide (2560x1080)' },
  'custom': { width: 1920, height: 1080, name: 'Custom' }
};

// Layout categories
const LAYOUT_CATEGORIES = [
  'fullscreen',
  'split',
  'grid',
  'sidebar',
  'creative',
  'dashboard',
  'ticker',
  'custom'
];

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
  layouts: [] as any[]
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🎨 Layouts API called:', req.method, req.url);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req;
  
  // Handle /presets endpoint
  if (url?.includes('/presets')) {
    if (req.method === 'GET') {
      console.log('📐 Getting layout presets...');
      return res.status(200).json({
        success: true,
        data: LAYOUT_PRESETS
      });
    }
  }
  
  // Handle /categories endpoint
  if (url?.includes('/categories')) {
    if (req.method === 'GET') {
      console.log('📂 Getting layout categories...');
      return res.status(200).json({
        success: true,
        data: LAYOUT_CATEGORIES
      });
    }
  }

  try {
    // Handle main layouts endpoint
    if (req.method === 'GET') {
      console.log('📋 Getting layouts from Supabase...');
      
      // Get layouts with their zones
      const { data: layouts, error: layoutsError } = await supabase
        .from('layouts')
        .select(`
          *,
          zones (*)
        `)
        .order('created_at', { ascending: false });

      if (layoutsError) {
        console.error('❌ Supabase layouts error:', layoutsError);
        console.log('🔄 Using fallback database...');
        return res.status(200).json({
          success: true,
          data: database.layouts,
          source: 'fallback'
        });
      }

      console.log('✅ Layouts retrieved from Supabase:', layouts?.length || 0);
      
      // Convert snake_case to camelCase for frontend
      const convertedData = layouts?.map(layout => {
        const convertedLayout = convertToCamelCase(layout);
        // Convert zones too
        if (convertedLayout.zones) {
          convertedLayout.zones = convertedLayout.zones.map(convertToCamelCase);
        }
        return convertedLayout;
      }) || [];
      
      return res.status(200).json({
        success: true,
        data: convertedData,
        source: 'supabase'
      });
    }

    if (req.method === 'POST') {
      console.log('➕ Creating new layout...');
      const { zones, ...layoutData } = req.body;
      
      // Convert camelCase to snake_case for database
      const dbLayoutData = convertToSnakeCase({
        ...layoutData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      console.log('💾 Inserting layout to Supabase:', dbLayoutData);

      const { data: layout, error: layoutError } = await supabase
        .from('layouts')
        .insert([dbLayoutData])
        .select()
        .single();

      if (layoutError) {
        console.error('❌ Supabase layout insert error:', layoutError);
        console.log('🔄 Using fallback database...');
        
        const fallbackData = {
          ...layoutData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          zones: zones || []
        };
        
        database.layouts.push(fallbackData);
        
        return res.status(201).json({
          success: true,
          data: fallbackData,
          source: 'fallback'
        });
      }

      // Insert zones if provided
      let insertedZones = [];
      if (zones && zones.length > 0) {
        console.log('💾 Inserting zones to Supabase:', zones.length);
        
        const dbZones = zones.map((zone: any) => convertToSnakeCase({
          ...zone,
          id: `${layout.id}_${Date.now()}_${Math.random()}`,
          layoutId: layout.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));

        const { data: zonesData, error: zonesError } = await supabase
          .from('zones')
          .insert(dbZones)
          .select();

        if (zonesError) {
          console.error('❌ Supabase zones insert error:', zonesError);
        } else {
          insertedZones = zonesData?.map(convertToCamelCase) || [];
          console.log('✅ Zones created in Supabase:', insertedZones.length);
        }
      }

      console.log('✅ Layout created in Supabase:', layout);
      
      // Convert back to camelCase for response
      const convertedLayout = convertToCamelCase(layout);
      convertedLayout.zones = insertedZones;
      
      return res.status(201).json({
        success: true,
        data: convertedLayout,
        source: 'supabase'
      });
    }

    if (req.method === 'PUT') {
      console.log('✏️ Updating layout...');
      const { id, zones, ...updateData } = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Layout ID is required'
        });
      }

      // Convert camelCase to snake_case for database
      const dbData = convertToSnakeCase({
        ...updateData,
        updatedAt: new Date().toISOString()
      });

      console.log('💾 Updating layout in Supabase:', id, dbData);

      const { data: layout, error: layoutError } = await supabase
        .from('layouts')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();

      if (layoutError) {
        console.error('❌ Supabase layout update error:', layoutError);
        console.log('🔄 Using fallback database...');
        
        const layoutIndex = database.layouts.findIndex(l => l.id === id);
        if (layoutIndex !== -1) {
          database.layouts[layoutIndex] = {
            ...database.layouts[layoutIndex],
            ...updateData,
            zones: zones || database.layouts[layoutIndex].zones,
            updatedAt: new Date().toISOString()
          };
          
          return res.status(200).json({
            success: true,
            data: database.layouts[layoutIndex],
            source: 'fallback'
          });
        }
        
        return res.status(404).json({
          success: false,
          message: 'Layout not found'
        });
      }

      // Update zones if provided
      let updatedZones = [];
      if (zones) {
        console.log('💾 Updating zones in Supabase...');
        
        // Delete existing zones
        await supabase
          .from('zones')
          .delete()
          .eq('layout_id', id);

        // Insert new zones
        if (zones.length > 0) {
          const dbZones = zones.map((zone: any) => convertToSnakeCase({
            ...zone,
            id: `${id}_${Date.now()}_${Math.random()}`,
            layoutId: id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));

          const { data: zonesData, error: zonesError } = await supabase
            .from('zones')
            .insert(dbZones)
            .select();

          if (!zonesError) {
            updatedZones = zonesData?.map(convertToCamelCase) || [];
            console.log('✅ Zones updated in Supabase:', updatedZones.length);
          }
        }
      }

      console.log('✅ Layout updated in Supabase:', layout);
      
      // Convert back to camelCase for response
      const convertedLayout = convertToCamelCase(layout);
      convertedLayout.zones = updatedZones;
      
      return res.status(200).json({
        success: true,
        data: convertedLayout,
        source: 'supabase'
      });
    }

    if (req.method === 'DELETE') {
      console.log('🗑️ Deleting layout...');
      const { id } = req.query;
      
      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Layout ID is required'
        });
      }

      console.log('💾 Deleting layout from Supabase:', id);

      // Delete zones first (cascade should handle this, but being explicit)
      await supabase
        .from('zones')
        .delete()
        .eq('layout_id', id);

      // Delete layout
      const { error } = await supabase
        .from('layouts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Supabase delete error:', error);
        console.log('🔄 Using fallback database...');
        
        const layoutIndex = database.layouts.findIndex(l => l.id === id);
        if (layoutIndex !== -1) {
          database.layouts.splice(layoutIndex, 1);
          
          return res.status(200).json({
            success: true,
            message: 'Layout deleted',
            source: 'fallback'
          });
        }
        
        return res.status(404).json({
          success: false,
          message: 'Layout not found'
        });
      }

      console.log('✅ Layout deleted from Supabase');
      
      return res.status(200).json({
        success: true,
        message: 'Layout deleted',
        source: 'supabase'
      });
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });

  } catch (error) {
    console.error('💥 Layouts API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}