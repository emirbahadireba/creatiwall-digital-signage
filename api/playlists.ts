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
  playlists: [] as any[]
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🎵 Playlists API called:', req.method, req.url);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      console.log('📋 Getting playlists from Supabase...');
      
      // Get playlists with their items
      const { data: playlists, error: playlistsError } = await supabase
        .from('playlists')
        .select(`
          *,
          playlist_items (
            *,
            media_items (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (playlistsError) {
        console.error('❌ Supabase playlists error:', playlistsError);
        console.log('🔄 Using fallback database...');
        return res.status(200).json({
          success: true,
          data: database.playlists,
          source: 'fallback'
        });
      }

      console.log('✅ Playlists retrieved from Supabase:', playlists?.length || 0);
      
      // Convert snake_case to camelCase for frontend
      const convertedData = playlists?.map(playlist => {
        const convertedPlaylist = convertToCamelCase(playlist);
        // Convert playlist items and their media items
        if (convertedPlaylist.playlistItems) {
          convertedPlaylist.playlistItems = convertedPlaylist.playlistItems.map((item: any) => {
            const convertedItem = convertToCamelCase(item);
            if (convertedItem.mediaItems) {
              convertedItem.mediaItems = convertToCamelCase(convertedItem.mediaItems);
            }
            return convertedItem;
          });
        }
        return convertedPlaylist;
      }) || [];
      
      return res.status(200).json({
        success: true,
        data: convertedData,
        source: 'supabase'
      });
    }

    if (req.method === 'POST') {
      console.log('➕ Creating new playlist...');
      const { items, ...playlistData } = req.body;
      
      // Convert camelCase to snake_case for database
      const dbPlaylistData = convertToSnakeCase({
        ...playlistData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      console.log('💾 Inserting playlist to Supabase:', dbPlaylistData);

      const { data: playlist, error: playlistError } = await supabase
        .from('playlists')
        .insert([dbPlaylistData])
        .select()
        .single();

      if (playlistError) {
        console.error('❌ Supabase playlist insert error:', playlistError);
        console.log('🔄 Using fallback database...');
        
        const fallbackData = {
          ...playlistData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          items: items || []
        };
        
        database.playlists.push(fallbackData);
        
        return res.status(201).json({
          success: true,
          data: fallbackData,
          source: 'fallback'
        });
      }

      // Insert playlist items if provided
      let insertedItems = [];
      if (items && items.length > 0) {
        console.log('💾 Inserting playlist items to Supabase:', items.length);
        
        const dbItems = items.map((item: any, index: number) => convertToSnakeCase({
          ...item,
          id: `${playlist.id}_${Date.now()}_${index}`,
          playlistId: playlist.id,
          order: index,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));

        const { data: itemsData, error: itemsError } = await supabase
          .from('playlist_items')
          .insert(dbItems)
          .select(`
            *,
            media_items (*)
          `);

        if (itemsError) {
          console.error('❌ Supabase playlist items insert error:', itemsError);
        } else {
          insertedItems = itemsData?.map(item => {
            const convertedItem = convertToCamelCase(item);
            if (convertedItem.mediaItems) {
              convertedItem.mediaItems = convertToCamelCase(convertedItem.mediaItems);
            }
            return convertedItem;
          }) || [];
          console.log('✅ Playlist items created in Supabase:', insertedItems.length);
        }
      }

      console.log('✅ Playlist created in Supabase:', playlist);
      
      // Convert back to camelCase for response
      const convertedPlaylist = convertToCamelCase(playlist);
      convertedPlaylist.playlistItems = insertedItems;
      
      return res.status(201).json({
        success: true,
        data: convertedPlaylist,
        source: 'supabase'
      });
    }

    if (req.method === 'PUT') {
      console.log('✏️ Updating playlist...');
      const { id, items, ...updateData } = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Playlist ID is required'
        });
      }

      // Convert camelCase to snake_case for database
      const dbData = convertToSnakeCase({
        ...updateData,
        updatedAt: new Date().toISOString()
      });

      console.log('💾 Updating playlist in Supabase:', id, dbData);

      const { data: playlist, error: playlistError } = await supabase
        .from('playlists')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();

      if (playlistError) {
        console.error('❌ Supabase playlist update error:', playlistError);
        console.log('🔄 Using fallback database...');
        
        const playlistIndex = database.playlists.findIndex(p => p.id === id);
        if (playlistIndex !== -1) {
          database.playlists[playlistIndex] = {
            ...database.playlists[playlistIndex],
            ...updateData,
            items: items || database.playlists[playlistIndex].items,
            updatedAt: new Date().toISOString()
          };
          
          return res.status(200).json({
            success: true,
            data: database.playlists[playlistIndex],
            source: 'fallback'
          });
        }
        
        return res.status(404).json({
          success: false,
          message: 'Playlist not found'
        });
      }

      // Update playlist items if provided
      let updatedItems = [];
      if (items) {
        console.log('💾 Updating playlist items in Supabase...');
        
        // Delete existing items
        await supabase
          .from('playlist_items')
          .delete()
          .eq('playlist_id', id);

        // Insert new items
        if (items.length > 0) {
          const dbItems = items.map((item: any, index: number) => convertToSnakeCase({
            ...item,
            id: `${id}_${Date.now()}_${index}`,
            playlistId: id,
            order: index,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));

          const { data: itemsData, error: itemsError } = await supabase
            .from('playlist_items')
            .insert(dbItems)
            .select(`
              *,
              media_items (*)
            `);

          if (!itemsError) {
            updatedItems = itemsData?.map(item => {
              const convertedItem = convertToCamelCase(item);
              if (convertedItem.mediaItems) {
                convertedItem.mediaItems = convertToCamelCase(convertedItem.mediaItems);
              }
              return convertedItem;
            }) || [];
            console.log('✅ Playlist items updated in Supabase:', updatedItems.length);
          }
        }
      }

      console.log('✅ Playlist updated in Supabase:', playlist);
      
      // Convert back to camelCase for response
      const convertedPlaylist = convertToCamelCase(playlist);
      convertedPlaylist.playlistItems = updatedItems;
      
      return res.status(200).json({
        success: true,
        data: convertedPlaylist,
        source: 'supabase'
      });
    }

    if (req.method === 'DELETE') {
      console.log('🗑️ Deleting playlist...');
      const { id } = req.query;
      
      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Playlist ID is required'
        });
      }

      console.log('💾 Deleting playlist from Supabase:', id);

      // Delete playlist items first (cascade should handle this, but being explicit)
      await supabase
        .from('playlist_items')
        .delete()
        .eq('playlist_id', id);

      // Delete playlist
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Supabase delete error:', error);
        console.log('🔄 Using fallback database...');
        
        const playlistIndex = database.playlists.findIndex(p => p.id === id);
        if (playlistIndex !== -1) {
          database.playlists.splice(playlistIndex, 1);
          
          return res.status(200).json({
            success: true,
            message: 'Playlist deleted',
            source: 'fallback'
          });
        }
        
        return res.status(404).json({
          success: false,
          message: 'Playlist not found'
        });
      }

      console.log('✅ Playlist deleted from Supabase');
      
      return res.status(200).json({
        success: true,
        message: 'Playlist deleted',
        source: 'supabase'
      });
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });

  } catch (error) {
    console.error('💥 Playlists API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}