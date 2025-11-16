import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Hardcoded Supabase credentials
const supabaseUrl = 'https://ixqkqvhqfbpjpibhlqtb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4cWtxdmhxZmJwanBpYmhscXRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3MjU5NzEsImV4cCI6MjA0NzMwMTk3MX0.YCOkdOJNHS8tJoqeGBYyJlBxKOqaQkGOQKJmrOQKqhI';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🔍 Storage Debug API called');
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('📦 Testing Supabase Storage connection...');
    
    // Test 1: List buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    console.log('🪣 Buckets result:', { buckets, bucketsError });
    
    // Test 2: Try to access media-files bucket
    let bucketExists = false;
    let bucketFiles = null;
    let bucketError = null;
    
    if (buckets && buckets.find(b => b.name === 'media-files')) {
      bucketExists = true;
      console.log('✅ media-files bucket exists');
      
      // Try to list files in bucket
      const { data: files, error: filesError } = await supabase.storage
        .from('media-files')
        .list('', { limit: 10 });
      
      bucketFiles = files;
      bucketError = filesError;
      console.log('📁 Bucket files:', { files, filesError });
    } else {
      console.log('❌ media-files bucket does not exist');
    }
    
    // Test 3: Try a simple upload test
    let uploadTest = null;
    if (bucketExists) {
      try {
        const testData = Buffer.from('test file content', 'utf8');
        const testFileName = `test-${Date.now()}.txt`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('media-files')
          .upload(testFileName, testData, {
            contentType: 'text/plain',
            upsert: false
          });
        
        uploadTest = { uploadData, uploadError };
        console.log('📤 Upload test:', uploadTest);
        
        // Clean up test file
        if (!uploadError) {
          await supabase.storage.from('media-files').remove([testFileName]);
          console.log('🧹 Test file cleaned up');
        }
      } catch (uploadTestError) {
        uploadTest = { error: uploadTestError };
        console.log('❌ Upload test failed:', uploadTestError);
      }
    }

    return res.status(200).json({
      success: true,
      debug: {
        supabaseUrl,
        buckets: buckets || [],
        bucketsError,
        bucketExists,
        bucketFiles,
        bucketError,
        uploadTest
      }
    });

  } catch (error) {
    console.error('💥 Storage debug error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        supabaseUrl,
        message: 'Failed to connect to Supabase Storage'
      }
    });
  }
}