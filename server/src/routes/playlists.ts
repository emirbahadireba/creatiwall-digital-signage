import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/unified-database.js';
import { authenticate, authorize, tenantIsolation } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);
router.use(tenantIsolation);

// Get all playlists
router.get('/', async (req, res) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const playlists = await db.getPlaylists(tenantId);
    
    // Add items to each playlist
    for (const playlist of playlists) {
      const items = await db.getPlaylistItemsByPlaylistId(playlist.id);
      const enrichedItems = [];
      
      for (const item of items) {
        const media = await db.getMediaById(item.mediaId);
        enrichedItems.push({
          id: item.id,
          mediaId: item.mediaId,
          duration: item.duration,
          transition: item.transition,
          transitionDuration: item.transitionDuration,
          volume: Boolean(item.volume),
          repeat: item.repeat,
          order: item.orderIndex,
          mediaName: media?.name,
          mediaType: media?.type,
          mediaUrl: media?.url
        });
      }
      
      (playlist as any).items = enrichedItems;
      (playlist as any).loop = Boolean(playlist.loop);
      (playlist as any).shuffle = Boolean(playlist.shuffle);
    }
    
    res.json(playlists);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get playlist by ID
router.get('/:id', async (req, res) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const playlist = await db.getPlaylistById(req.params.id, tenantId);
    
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    
    const items = await db.getPlaylistItemsByPlaylistId(playlist.id);
    const enrichedItems = [];
    
    for (const item of items) {
      const media = await db.getMediaById(item.mediaId);
      enrichedItems.push({
        id: item.id,
        mediaId: item.mediaId,
        duration: item.duration,
        transition: item.transition,
        transitionDuration: item.transitionDuration,
        volume: Boolean(item.volume),
        repeat: item.repeat,
        order: item.orderIndex,
        mediaName: media?.name,
        mediaType: media?.type,
        mediaUrl: media?.url
      });
    }
    
    res.json({
      ...playlist,
      loop: Boolean(playlist.loop),
      shuffle: Boolean(playlist.shuffle),
      items: enrichedItems
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create playlist
router.post('/', async (req, res) => {
  try {
    const { name, description, loop = true, shuffle = false, priority = 0, items = [] } = req.body;
    const id = uuidv4();
    const tenantId = (req as any).user.tenantId;
    
    const duration = items.reduce((sum: number, item: any) => sum + (item.duration || 0), 0);

    const playlist = {
      id,
      tenantId,
      name,
      description: description || null,
      loop: Boolean(loop),
      shuffle: Boolean(shuffle),
      priority,
      duration,
      items: []
    };

    // Create playlist in database
    const createdPlaylist = await db.createPlaylist(playlist);

    // Create playlist items
    const createdItems = [];
    if (items && Array.isArray(items)) {
      for (const [index, item] of items.entries()) {
        const itemData = {
          id: item.id || uuidv4(),
          playlistId: id,
          mediaId: item.mediaId,
          duration: item.duration || 10,
          transition: item.transition || null,
          transitionDuration: item.transitionDuration || null,
          volume: Boolean(item.volume),
          repeat: item.repeat || 1,
          orderIndex: item.order !== undefined ? item.order : index
        };
        
        const createdItem = await db.createPlaylistItem(itemData);
        const media = await db.getMediaById(createdItem.mediaId);
        
        createdItems.push({
          id: createdItem.id,
          mediaId: createdItem.mediaId,
          duration: createdItem.duration,
          transition: createdItem.transition,
          transitionDuration: createdItem.transitionDuration,
          volume: Boolean(createdItem.volume),
          repeat: createdItem.repeat,
          order: createdItem.orderIndex,
          mediaName: media?.name,
          mediaType: media?.type,
          mediaUrl: media?.url
        });
      }
    }

    res.status(201).json({
      ...createdPlaylist,
      loop: Boolean(createdPlaylist.loop),
      shuffle: Boolean(createdPlaylist.shuffle),
      items: createdItems
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update playlist
router.put('/:id', async (req, res) => {
  try {
    const { name, description, loop, shuffle, priority, items } = req.body;
    const tenantId = (req as any).user.tenantId;
    
    // Get existing playlist
    const existingPlaylist = await db.getPlaylistById(req.params.id, tenantId);
    if (!existingPlaylist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const duration = items ? items.reduce((sum: number, item: any) => sum + (item.duration || 0), 0) : existingPlaylist.duration;
    
    const updatedPlaylistData = {
      ...existingPlaylist,
      name,
      description: description || null,
      loop: Boolean(loop),
      shuffle: Boolean(shuffle),
      priority,
      duration
    };

    // Update playlist in database
    const updatedPlaylist = await db.updatePlaylist(req.params.id, updatedPlaylistData, tenantId);

    // Update items if provided
    let updatedItems = [];
    if (items && Array.isArray(items)) {
      // Delete old items
      await db.deletePlaylistItemsByPlaylistId(req.params.id);
      
      // Create new items
      for (const [index, item] of items.entries()) {
        const itemData = {
          id: item.id || uuidv4(),
          playlistId: req.params.id,
          mediaId: item.mediaId,
          duration: item.duration || 10,
          transition: item.transition || null,
          transitionDuration: item.transitionDuration || null,
          volume: Boolean(item.volume),
          repeat: item.repeat || 1,
          orderIndex: item.order !== undefined ? item.order : index
        };
        
        const createdItem = await db.createPlaylistItem(itemData);
        const media = await db.getMediaById(createdItem.mediaId);
        
        updatedItems.push({
          id: createdItem.id,
          mediaId: createdItem.mediaId,
          duration: createdItem.duration,
          transition: createdItem.transition,
          transitionDuration: createdItem.transitionDuration,
          volume: Boolean(createdItem.volume),
          repeat: createdItem.repeat,
          order: createdItem.orderIndex,
          mediaName: media?.name,
          mediaType: media?.type,
          mediaUrl: media?.url
        });
      }
    } else {
      // Get existing items if items not provided
      const existingItems = await db.getPlaylistItemsByPlaylistId(req.params.id);
      for (const item of existingItems) {
        const media = await db.getMediaById(item.mediaId);
        updatedItems.push({
          id: item.id,
          mediaId: item.mediaId,
          duration: item.duration,
          transition: item.transition,
          transitionDuration: item.transitionDuration,
          volume: Boolean(item.volume),
          repeat: item.repeat,
          order: item.orderIndex,
          mediaName: media?.name,
          mediaType: media?.type,
          mediaUrl: media?.url
        });
      }
    }

    res.json({
      ...updatedPlaylist,
      loop: Boolean(updatedPlaylist?.loop),
      shuffle: Boolean(updatedPlaylist?.shuffle),
      items: updatedItems
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete playlist
router.delete('/:id', async (req, res) => {
  try {
    const tenantId = (req as any).user.tenantId;
    
    // Check if playlist exists
    const existingPlaylist = await db.getPlaylistById(req.params.id, tenantId);
    if (!existingPlaylist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    
    // Delete playlist items first
    await db.deletePlaylistItemsByPlaylistId(req.params.id);
    
    // Delete playlist
    await db.deletePlaylist(req.params.id, tenantId);
    
    res.json({ message: 'Playlist deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
