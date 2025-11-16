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

// Simple in-memory fallback for demo
let database = {
  media: [] as any[]
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🎬 Media API called:', req.method, req.url);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      console.log('📋 Getting media items from Supabase...');
      
      const { data, error } = await supabase
        .from('media_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Supabase error:', error);
        console.log('🔄 Using fallback database...');
        return res.status(200).json({
          success: true,
          data: database.media,
          source: 'fallback'
        });
      }

      console.log('✅ Media items retrieved from Supabase:', data?.length || 0);
      
      // Convert snake_case to camelCase for frontend
      const convertedData = data?.map(convertToCamelCase) || [];
      
      return res.status(200).json({
        success: true,
        data: convertedData,
        source: 'supabase'
      });
    }

    if (req.method === 'POST') {
      console.log('➕ Creating new media item...');
      const mediaData = req.body;
      
      // Convert camelCase to snake_case for database
      const dbData = convertToSnakeCase({
        ...mediaData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      console.log('💾 Inserting to Supabase:', dbData);

      const { data, error } = await supabase
        .from('media_items')
        .insert([dbData])
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase insert error:', error);
        console.log('🔄 Using fallback database...');
        
        const fallbackData = {
          ...mediaData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        database.media.push(fallbackData);
        
        return res.status(201).json({
          success: true,
          data: fallbackData,
          source: 'fallback'
        });
      }

      console.log('✅ Media item created in Supabase:', data);
      
      // Convert back to camelCase for response
      const convertedData = convertToCamelCase(data);
      
      return res.status(201).json({
        success: true,
        data: convertedData,
        source: 'supabase'
      });
    }

    if (req.method === 'PUT') {
      console.log('✏️ Updating media item...');
      const { id, ...updateData } = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Media ID is required'
        });
      }

      // Convert camelCase to snake_case for database
      const dbData = convertToSnakeCase({
        ...updateData,
        updatedAt: new Date().toISOString()
      });

      console.log('💾 Updating in Supabase:', id, dbData);

      const { data, error } = await supabase
        .from('media_items')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase update error:', error);
        console.log('🔄 Using fallback database...');
        
        const mediaIndex = database.media.findIndex(m => m.id === id);
        if (mediaIndex !== -1) {
          database.media[mediaIndex] = {
            ...database.media[mediaIndex],
            ...updateData,
            updatedAt: new Date().toISOString()
          };
          
          return res.status(200).json({
            success: true,
            data: database.media[mediaIndex],
            source: 'fallback'
          });
        }
        
        return res.status(404).json({
          success: false,
          message: 'Media item not found'
        });
      }

      console.log('✅ Media item updated in Supabase:', data);
      
      // Convert back to camelCase for response
      const convertedData = convertToCamelCase(data);
      
      return res.status(200).json({
        success: true,
        data: convertedData,
        source: 'supabase'
      });
    }

    if (req.method === 'DELETE') {
      console.log('🗑️ Deleting media item...');
      const { id } = req.query;
      
      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Media ID is required'
        });
      }

      console.log('💾 Deleting from Supabase:', id);

      const { error } = await supabase
        .from('media_items')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Supabase delete error:', error);
        console.log('🔄 Using fallback database...');
        
        const mediaIndex = database.media.findIndex(m => m.id === id);
        if (mediaIndex !== -1) {
          database.media.splice(mediaIndex, 1);
          
          return res.status(200).json({
            success: true,
            message: 'Media item deleted',
            source: 'fallback'
          });
        }
        
        return res.status(404).json({
          success: false,
          message: 'Media item not found'
        });
      }

      console.log('✅ Media item deleted from Supabase');
      
      return res.status(200).json({
        success: true,
        message: 'Media item deleted',
        source: 'supabase'
      });
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });

  } catch (error) {
    console.error('💥 Media API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}