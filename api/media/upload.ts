import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Hardcoded Supabase credentials
const supabaseUrl = 'https://ixqkqvhqfbpjpibhlqtb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4cWtxdmhxZmJwanBpYmhscXRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3MjU5NzEsImV4cCI6MjA0NzMwMTk3MX0.YCOkdOJNHS8tJoqeGBYyJlBxKOqaQkGOQKJmrOQKqhI';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🚀 Media Upload API - Start');
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    console.log('✅ OPTIONS request handled');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    console.log('📦 Raw body type:', typeof req.body);
    console.log('📦 Raw body:', req.body ? 'exists' : 'null/undefined');
    
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

    // Test Supabase connection first
    console.log('🔗 Testing Supabase connection...');
    try {
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) {
        console.error('❌ Supabase connection error:', bucketsError);
        throw new Error(`Supabase connection failed: ${bucketsError.message}`);
      }
      console.log('✅ Supabase connected, buckets:', buckets?.map(b => b.name));
      
      const mediaFilesBucket = buckets?.find(b => b.name === 'media-files');
      if (!mediaFilesBucket) {
        console.error('❌ media-files bucket not found');
        throw new Error('media-files bucket not found');
      }
      console.log('✅ media-files bucket found');
    } catch (connectionError) {
      console.error('❌ Supabase connection test failed:', connectionError);
      throw connectionError;
    }
    
    // Upload to Supabase Storage
    console.log('📤 Uploading to Supabase Storage...');
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

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('media-files')
      .getPublicUrl(uniqueFileName);

    const publicUrl = urlData.publicUrl;
    console.log('🔗 Public URL generated:', publicUrl);

    // Save to database
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

    console.log('💾 Saving to database:', mediaRecord);

    const { data: dbData, error: dbError } = await supabase
      .from('media_items')
      .insert([mediaRecord])
      .select()
      .single();

    if (dbError) {
      console.error('❌ Database insert error:', dbError);
      
      // Clean up uploaded file
      try {
        await supabase.storage.from('media-files').remove([uniqueFileName]);
        console.log('🧹 Cleaned up uploaded file');
      } catch (cleanupError) {
        console.error('❌ Cleanup error:', cleanupError);
      }
      
      throw new Error(`Database insert failed: ${dbError.message}`);
    }

    console.log('✅ Media item saved to database:', dbData.id);

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

    console.log('🎉 Upload completed successfully!');

    return res.status(201).json({
      success: true,
      data: responseData,
      source: 'supabase'
    });

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