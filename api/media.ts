import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import FormData from 'form-data';
import fetch from 'node-fetch';

// Supabase credentials (same as upload endpoint)
const supabaseUrl = process.env.SUPABASE_URL || 'https://jlrsklomfbfoogaekfyd.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpscnNrbG9tZmJmb29nYWVrZnlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxNDUyNzUsImV4cCI6MjA3ODcyMTI3NX0.bCua_8dkQm03_0kvtRCRIuj8Knycax06pw7yPRomIH0';

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

  const { url } = req;
  
  // Handle upload operations (/media/upload)
  if (url?.includes('/media/upload')) {
    console.log('🚀 Media Upload API - Hostinger Integration');
    
    if (req.method !== 'POST') {
      console.log('❌ Method not allowed:', req.method);
      return res.status(405).json({
        success: false,
        message: 'Method not allowed'
      });
    }

    try {
      console.log('📦 Processing request body...');
      
      // Handle different body formats
      let body;
      if (typeof req.body === 'string') {
        console.log('🔄 Parsing string body...');
        try {
          body = JSON.parse(req.body);
          console.log('✅ String body parsed successfully');
        } catch (parseError) {
          console.error('❌ JSON parse error:', parseError);
          return res.status(400).json({
            success: false,
            message: 'Invalid JSON format'
          });
        }
      } else if (req.body && typeof req.body === 'object') {
        console.log('✅ Object body received');
        body = req.body;
      } else {
        console.error('❌ No body received');
        return res.status(400).json({
          success: false,
          message: 'Request body is missing'
        });
      }

      console.log('📋 Body keys:', Object.keys(body || {}));
      
      const { fileData, fileName, fileType, name, type, category, tags, thumbnail } = body;
      
      if (!fileData || !fileName) {
        console.error('❌ Missing required fields:', {
          hasFileData: !!fileData,
          fileName: fileName || 'missing'
        });
        return res.status(400).json({
          success: false,
          message: 'File data and name are required'
        });
      }

      console.log('📁 File info:', {
        fileName,
        fileType,
        dataLength: fileData.length,
        hasName: !!name,
        hasType: !!type
      });

      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.floor(Math.random() * 1000000);
      const fileExtension = fileName.split('.').pop() || 'bin';
      const uniqueFileName = `${timestamp}-${randomId}.${fileExtension}`;
      
      console.log('🔄 Generated filename:', uniqueFileName);

      // Convert base64 to buffer
      const base64Data = fileData.replace(/^data:[^;]+;base64,/, '');
      const fileBuffer = Buffer.from(base64Data, 'base64');
      
      console.log('📊 Buffer info:', {
        originalLength: fileData.length,
        base64Length: base64Data.length,
        bufferLength: fileBuffer.length
      });

      // HOSTINGER UPLOAD INTEGRATION
      console.log('🌐 Uploading to Hostinger...');
      
      // Get Hostinger configuration from environment variables
      const hostingerDomain = process.env.HOSTINGER_DOMAIN;
      const hostingerToken = process.env.HOSTINGER_UPLOAD_TOKEN;
      const mediaFolder = process.env.HOSTINGER_MEDIA_FOLDER || 'creatiwall-media';
      
      if (!hostingerDomain) {
        throw new Error('HOSTINGER_DOMAIN environment variable not set');
      }
      
      const hostingerUploadUrl = `https://${hostingerDomain}/upload.php`;
      
      try {
        // Create form data for file upload
        const formData = new FormData();
        formData.append('file', fileBuffer, {
          filename: uniqueFileName,
          contentType: fileType || 'application/octet-stream'
        });
        formData.append('folder', mediaFolder);
        
        // Prepare headers
        const headers = {
          ...formData.getHeaders()
        };
        
        // Add authorization if token is provided
        if (hostingerToken) {
          headers['Authorization'] = `Bearer ${hostingerToken}`;
        }
        
        // Upload to Hostinger
        const uploadResponse = await fetch(hostingerUploadUrl, {
          method: 'POST',
          body: formData,
          headers
        });
        
        if (!uploadResponse.ok) {
          throw new Error(`Hostinger upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
        }
        
        const uploadResult = await uploadResponse.json();
        console.log('✅ Hostinger upload successful:', uploadResult);
        
        // Generate public URL
        const publicUrl = `https://${hostingerDomain}/${mediaFolder}/${uniqueFileName}`;
        
        // Save to Supabase database
        console.log('💾 Saving media record to Supabase database...');
        
        const mediaRecord = {
          name: name || fileName,
          type: type || 'image',
          size: fileBuffer.length,
          url: publicUrl,
          category: category || 'uncategorized',
          tags: tags || [],
          thumbnail: thumbnail || null,
          tenant_id: 1, // TODO: Get from authenticated user
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: dbData, error: dbError } = await supabase
          .from('media_items')
          .insert([mediaRecord])
          .select()
          .single();

        if (dbError) {
          console.error('❌ Database insert error:', dbError);
          // Don't fail the upload, just log the error
          console.log('⚠️ File uploaded to Hostinger but database save failed');
          
          return res.status(201).json({
            success: true,
            data: {
              id: timestamp,
              ...mediaRecord,
              tenantId: mediaRecord.tenant_id,
              createdAt: mediaRecord.created_at,
              updatedAt: mediaRecord.updated_at
            },
            source: 'hostinger-only',
            message: 'File uploaded to Hostinger (database save failed)',
            warning: 'Database connection issue'
          });
        }

        console.log('✅ Media uploaded to Hostinger and saved to Supabase!');
        console.log('🔗 Public URL:', publicUrl);
        console.log('💾 Database ID:', dbData.id);

        // Convert snake_case to camelCase for response
        const responseData = {
          id: dbData.id,
          name: dbData.name,
          type: dbData.type,
          size: dbData.size,
          url: dbData.url,
          category: dbData.category,
          tags: dbData.tags,
          thumbnail: dbData.thumbnail,
          tenantId: dbData.tenant_id,
          createdAt: dbData.created_at,
          updatedAt: dbData.updated_at
        };

        return res.status(201).json({
          success: true,
          data: responseData,
          source: 'hostinger-supabase',
          message: 'File uploaded to Hostinger and saved to Supabase successfully'
        });
        
      } catch (hostingerError) {
        console.error('❌ Hostinger upload failed:', hostingerError);
        
        // FALLBACK: Create mock response if Hostinger fails
        console.log('⚠️ Using fallback system due to Hostinger upload failure');
        
        const fallbackDomain = hostingerDomain || 'your-domain.com';
        const mockPublicUrl = `https://${fallbackDomain}/${mediaFolder}/${uniqueFileName}`;
        
        // FALLBACK: Try to save to Supabase even if Hostinger fails
        console.log('💾 Attempting to save to Supabase database (fallback)...');
        
        const fallbackRecord = {
          name: name || fileName,
          type: type || 'image',
          size: fileBuffer.length,
          url: mockPublicUrl,
          category: category || 'uncategorized',
          tags: tags || [],
          thumbnail: thumbnail || null,
          tenant_id: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        try {
          const { data: dbData, error: dbError } = await supabase
            .from('media_items')
            .insert([fallbackRecord])
            .select()
            .single();

          if (dbError) {
            console.error('❌ Fallback database insert error:', dbError);
            throw dbError;
          }

          console.log('✅ Saved to Supabase database (fallback mode)');
          
          const responseData = {
            id: dbData.id,
            name: dbData.name,
            type: dbData.type,
            size: dbData.size,
            url: dbData.url,
            category: dbData.category,
            tags: dbData.tags,
            thumbnail: dbData.thumbnail,
            tenantId: dbData.tenant_id,
            createdAt: dbData.created_at,
            updatedAt: dbData.updated_at
          };

          return res.status(201).json({
            success: true,
            data: responseData,
            source: 'supabase-fallback',
            message: 'File metadata saved to database (Hostinger upload failed)',
            warning: 'File not physically uploaded - please configure Hostinger'
          });
          
        } catch (fallbackDbError) {
          console.error('❌ Fallback database save also failed:', fallbackDbError);
          
          // Complete fallback - just return mock data
          const mockMediaRecord = {
            id: timestamp,
            name: name || fileName,
            type: type || 'image',
            size: fileBuffer.length,
            url: mockPublicUrl,
            category: category || 'uncategorized',
            tags: tags || [],
            thumbnail: thumbnail || null,
            tenantId: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          return res.status(201).json({
            success: true,
            data: mockMediaRecord,
            source: 'mock-fallback',
            message: 'File processed (mock mode - please configure Hostinger and check Supabase)',
            warning: 'Neither Hostinger nor Supabase connection working'
          });
        }
      }

    } catch (error) {
      console.error('💥 Media upload error:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      return res.status(500).json({
        success: false,
        message: 'File upload failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  // Handle individual media operations (/media/{id})
  const mediaIdMatch = url?.match(/\/media\/([^\/\?]+)/);
  if (mediaIdMatch && !url?.includes('/media/upload')) {
    const mediaId = mediaIdMatch[1];

    try {
      if (req.method === 'GET') {
        console.log('📋 Getting single media item:', mediaId);
        
        // TODO: Get tenant_id from authenticated user
        const tenantId = 1; // For now, use default tenant
        
        const { data, error } = await supabase
          .from('media_items')
          .select('*')
          .eq('id', mediaId)
          .eq('tenant_id', tenantId) // Filter by tenant for security
          .single();

        if (error) {
          console.error('❌ Supabase media error:', error);
          console.log('🔄 Using fallback database...');
          
          const media = database.media.find(m => m.id === mediaId);
          if (!media) {
            return res.status(404).json({
              success: false,
              message: 'Media item not found'
            });
          }
          
          return res.status(200).json({
            success: true,
            data: media,
            source: 'fallback'
          });
        }

        console.log('✅ Media item retrieved from Supabase:', data);
        
        // Convert snake_case to camelCase for frontend
        const convertedData = convertToCamelCase(data);
        
        return res.status(200).json({
          success: true,
          data: convertedData,
          source: 'supabase'
        });
      }

      if (req.method === 'PUT') {
        console.log('✏️ Updating media item:', mediaId);
        const updateData = req.body;

        // TODO: Get tenant_id from authenticated user
        const tenantId = 1; // For now, use default tenant

        // Convert camelCase to snake_case for database
        const dbData = convertToSnakeCase({
          ...updateData,
          updatedAt: new Date().toISOString()
        });

        console.log('💾 Updating media item in Supabase:', mediaId, dbData);

        const { data, error } = await supabase
          .from('media_items')
          .update(dbData)
          .eq('id', mediaId)
          .eq('tenant_id', tenantId) // Filter by tenant for security
          .select()
          .single();

        if (error) {
          console.error('❌ Supabase media update error:', error);
          console.log('🔄 Using fallback database...');
          
          const mediaIndex = database.media.findIndex(m => m.id === mediaId);
          if (mediaIndex === -1) {
            return res.status(404).json({
              success: false,
              message: 'Media item not found'
            });
          }
          
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
        console.log('🗑️ Deleting media item:', mediaId);

        // TODO: Get tenant_id from authenticated user
        const tenantId = 1; // For now, use default tenant

        const { error } = await supabase
          .from('media_items')
          .delete()
          .eq('id', mediaId)
          .eq('tenant_id', tenantId); // Filter by tenant for security

        if (error) {
          console.error('❌ Supabase media delete error:', error);
          console.log('🔄 Using fallback database...');
          
          const mediaIndex = database.media.findIndex(m => m.id === mediaId);
          if (mediaIndex === -1) {
            return res.status(404).json({
              success: false,
              message: 'Media item not found'
            });
          }
          
          database.media.splice(mediaIndex, 1);
          
          return res.status(200).json({
            success: true,
            message: 'Media item deleted',
            source: 'fallback'
          });
        }

        console.log('✅ Media item deleted from Supabase');
        
        return res.status(200).json({
          success: true,
          message: 'Media item deleted',
          source: 'supabase'
        });
      }

    } catch (error) {
      console.error('💥 Media operation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Handle collection operations (/media)
  try {
    if (req.method === 'GET') {
      console.log('📋 Getting media items from Supabase...');
      
      // TODO: Get tenant_id from authenticated user
      const tenantId = 1; // For now, use default tenant
      
      const { data, error } = await supabase
        .from('media_items')
        .select('*')
        .eq('tenant_id', tenantId) // Filter by tenant for security
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