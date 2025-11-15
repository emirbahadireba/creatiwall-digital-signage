import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { authenticate, authorize, tenantIsolation } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);
router.use(tenantIsolation);

// Get all playlists
router.get('/', (req, res) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const playlists = db.database.playlists
      .filter((playlist: any) => playlist.tenantId === tenantId)
      .map((playlist: any) => ({
        ...playlist,
        loop: Boolean(playlist.loop),
        shuffle: Boolean(playlist.shuffle),
        items: db.database.playlistItems
          .filter((pi: any) => pi.playlistId === playlist.id)
          .sort((a: any, b: any) => a.orderIndex - b.orderIndex)
          .map((item: any) => {
            const media = db.database.mediaItems.find((m: any) => m.id === item.mediaId);
            return {
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
            };
          })
      }));
    res.json(playlists);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get playlist by ID
router.get('/:id', (req, res) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const playlist = db.database.playlists.find((p: any) => p.id === req.params.id && p.tenantId === tenantId);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    const items = db.database.playlistItems
      .filter((pi: any) => pi.playlistId === playlist.id)
      .sort((a: any, b: any) => a.orderIndex - b.orderIndex)
      .map((item: any) => {
        const media = db.database.mediaItems.find((m: any) => m.id === item.mediaId);
        return {
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
        };
      });
    res.json({
      ...playlist,
      loop: Boolean(playlist.loop),
      shuffle: Boolean(playlist.shuffle),
      items
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create playlist
router.post('/', (req, res) => {
  try {
    const { name, description, loop = true, shuffle = false, priority = 0, items = [] } = req.body;
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const duration = items.reduce((sum: number, item: any) => sum + (item.duration || 0), 0);

    const playlist = {
      id,
      tenantId: (req as any).user.tenantId,
      name,
      description: description || null,
      loop: Boolean(loop),
      shuffle: Boolean(shuffle),
      priority,
      duration,
      items: [],
      createdAt: now,
      updatedAt: now
    };

    db.database.playlists.push(playlist);

    // Insert playlist items
    if (items && Array.isArray(items)) {
      items.forEach((item: any, index: number) => {
        db.database.playlistItems.push({
          id: item.id || uuidv4(),
          playlistId: id,
          mediaId: item.mediaId,
          duration: item.duration || 10,
          transition: item.transition || null,
          transitionDuration: item.transitionDuration || null,
          volume: Boolean(item.volume),
          repeat: item.repeat || 1,
          order: item.order !== undefined ? item.order : index,
          orderIndex: item.order !== undefined ? item.order : index
        });
      });
    }

    db.saveDatabase();
    const playlistItems = db.database.playlistItems
      .filter((pi: any) => pi.playlistId === id)
      .sort((a: any, b: any) => a.orderIndex - b.orderIndex)
      .map((item: any) => {
        const media = db.database.mediaItems.find((m: any) => m.id === item.mediaId);
        return {
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
        };
      });
    res.status(201).json({
      ...playlist,
      loop: Boolean(playlist.loop),
      shuffle: Boolean(playlist.shuffle),
      items: playlistItems
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update playlist
router.put('/:id', (req, res) => {
  try {
    const { name, description, loop, shuffle, priority, items } = req.body;
    const tenantId = (req as any).user.tenantId;
    const playlistIndex = db.database.playlists.findIndex((p: any) => p.id === req.params.id && p.tenantId === tenantId);
    
    if (playlistIndex === -1) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const now = new Date().toISOString();
    const duration = items ? items.reduce((sum: number, item: any) => sum + (item.duration || 0), 0) : db.database.playlists[playlistIndex].duration;
    
    db.database.playlists[playlistIndex] = {
      ...db.database.playlists[playlistIndex],
      name,
      description: description || null,
      loop: Boolean(loop),
      shuffle: Boolean(shuffle),
      priority,
      duration,
      updatedAt: now
    };

    // Update items if provided
    if (items && Array.isArray(items)) {
      db.database.playlistItems = db.database.playlistItems.filter((pi: any) => pi.playlistId !== req.params.id);
      items.forEach((item: any, index: number) => {
        db.database.playlistItems.push({
          id: item.id || uuidv4(),
          playlistId: req.params.id,
          mediaId: item.mediaId,
          duration: item.duration || 10,
          transition: item.transition || null,
          transitionDuration: item.transitionDuration || null,
          volume: Boolean(item.volume),
          repeat: item.repeat || 1,
          order: item.order !== undefined ? item.order : index,
          orderIndex: item.order !== undefined ? item.order : index
        });
      });
    }

    db.saveDatabase();
    const playlistItems = db.database.playlistItems
      .filter((pi: any) => pi.playlistId === req.params.id)
      .sort((a: any, b: any) => a.orderIndex - b.orderIndex)
      .map((item: any) => {
        const media = db.database.mediaItems.find((m: any) => m.id === item.mediaId);
        return {
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
        };
      });
    res.json({
      ...db.database.playlists[playlistIndex],
      loop: Boolean(db.database.playlists[playlistIndex].loop),
      shuffle: Boolean(db.database.playlists[playlistIndex].shuffle),
      items: playlistItems
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete playlist
router.delete('/:id', (req, res) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const playlistIndex = db.database.playlists.findIndex((p: any) => p.id === req.params.id && p.tenantId === tenantId);
    if (playlistIndex === -1) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    db.database.playlists.splice(playlistIndex, 1);
    // Also delete playlist items
    db.database.playlistItems = db.database.playlistItems.filter((pi: any) => pi.playlistId !== req.params.id);
    db.saveDatabase();
    res.json({ message: 'Playlist deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
