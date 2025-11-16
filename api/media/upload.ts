import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Hardcoded Supabase credentials (same as other endpoints)
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('📤 Media Upload API called:', req.method);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    // For now, we'll use a simpler approach - direct base64 upload
    // This works better with Vercel's serverless environment
    const { fileData, fileName, fileType, name, type, category, tags, thumbnail } = req.body;
    
    if (!fileData || !fileName) {
      return res.status(400).json({
        success: false,
        message: 'File data and name are required'
      });
    }

    console.log('📁 File received:', {
      name: fileName,
      type: fileType,
      dataLength: fileData.length
    });

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.floor(Math.random() * 1000000);
    const fileExtension = fileName.split('.').pop() || 'bin';
    const uniqueFileName = `${timestamp}-${randomId}.${fileExtension}`;
    
    console.log('📤 Uploading to Supabase Storage:', uniqueFileName);

    // Convert base64 to buffer
    const base64Data = fileData.replace(/^data:[^;]+;base64,/, '');
    const fileBuffer = Buffer.from(base64Data, 'base64');
    
    // Upload to Supabase Storage (PUBLIC bucket for layout/player access)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('media-files')
      .upload(uniqueFileName, fileBuffer, {
        contentType: fileType || 'application/octet-stream',
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Supabase Storage upload error:', uploadError);
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    console.log('✅ File uploaded to Supabase Storage:', uploadData.path);

    // Get public URL (for layout/player access)
    const { data: urlData } = supabase.storage
      .from('media-files')
      .getPublicUrl(uniqueFileName);

    const publicUrl = urlData.publicUrl;
    console.log('🔗 Public URL generated:', publicUrl);

    // Handle thumbnail upload if provided
    let thumbnailUrl = null;
    if (thumbnail && thumbnail.startsWith('data:image/')) {
      try {
        console.log('📸 Uploading thumbnail to Supabase Storage...');
        
        // Convert base64 to buffer
        const base64Data = thumbnail.replace(/^data:image\/\w+;base64,/, '');
        const thumbnailBuffer = Buffer.from(base64Data, 'base64');
        
        const thumbnailFileName = `${timestamp}-${randomId}_thumb.jpg`;
        
        const { data: thumbUploadData, error: thumbUploadError } = await supabase.storage
          .from('media-files')
          .upload(thumbnailFileName, thumbnailBuffer, {
            contentType: 'image/jpeg',
            upsert: false
          });

        if (thumbUploadError) {
          console.error('❌ Thumbnail upload error:', thumbUploadError);
        } else {
          // Get public URL for thumbnail
          const { data: thumbUrlData } = supabase.storage
            .from('media-files')
            .getPublicUrl(thumbnailFileName);
          
          thumbnailUrl = thumbUrlData.publicUrl;
          console.log('✅ Thumbnail uploaded with public URL:', thumbnailUrl);
        }
      } catch (thumbError) {
        console.error('❌ Thumbnail processing error:', thumbError);
        // Continue without thumbnail
      }
    }

    // Save media item to database with tenant_id for security
    const mediaData = convertToSnakeCase({
      name: name || fileName,
      type,
      size: fileBuffer.length,
      url: publicUrl, // Use public URL for layout/player access
      category,
      tags,
      thumbnail: thumbnailUrl,
      tenantId: 1, // TODO: Get from authenticated user's tenant
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    console.log('💾 Saving media item to database:', mediaData);

    const { data: dbData, error: dbError } = await supabase
      .from('media_items')
      .insert([mediaData])
      .select()
      .single();

    if (dbError) {
      console.error('❌ Database insert error:', dbError);
      
      // Try to clean up uploaded file
      try {
        await supabase.storage.from('media-files').remove([uniqueFileName]);
        if (thumbnailUrl) {
          const thumbnailFileName = `${timestamp}-${randomId}_thumb.jpg`;
          await supabase.storage.from('media-files').remove([thumbnailFileName]);
        }
      } catch (cleanupError) {
        console.error('❌ Cleanup error:', cleanupError);
      }
      
      throw new Error(`Database insert failed: ${dbError.message}`);
    }

    console.log('✅ Media item saved to database:', dbData);

    // Convert back to camelCase for response
    const responseData = convertToCamelCase(dbData);

    return res.status(201).json({
      success: true,
      data: responseData,
      source: 'supabase'
    });

  } catch (error) {
    console.error('💥 Media upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'File upload failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}