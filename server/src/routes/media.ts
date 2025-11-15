import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { db } from '../db/unified-database.js';
import { authenticate, authorize, tenantIsolation } from '../middleware/auth.js';

// FFmpeg import - optional
let ffmpeg: any = null;
try {
  const ffmpegModule = await import('fluent-ffmpeg');
  ffmpeg = ffmpegModule.default;
} catch (error) {
  console.warn('FFmpeg not available. Video thumbnails will not be generated on backend.');
  console.warn('To enable video thumbnails, install FFmpeg: https://ffmpeg.org/download.html');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Increase limits for large base64 thumbnails (up to 10MB for thumbnail field)
const upload = multer({ 
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB for video files
    fieldSize: 10 * 1024 * 1024, // 10MB for thumbnail base64 string
  }
});

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);
router.use(tenantIsolation);

// Get all media items
router.get('/', async (req, res) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const tenantMediaItems = await db.getMediaByTenant(tenantId);
    res.json(tenantMediaItems);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get media by ID
router.get('/:id', async (req, res) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const item = await db.getMediaById(req.params.id);
    if (!item || item.tenantId !== tenantId) {
      return res.status(404).json({ error: 'Media item not found' });
    }
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Generate thumbnail from video
async function generateVideoThumbnail(videoPath: string, outputPath: string): Promise<string | null> {
  if (!ffmpeg) {
    console.warn('FFmpeg not available. Skipping thumbnail generation.');
    return null;
  }

  return new Promise((resolve) => {
    try {
      ffmpeg(videoPath)
        .screenshots({
          timestamps: ['00:00:03'], // 3. saniye
          filename: path.basename(outputPath),
          folder: path.dirname(outputPath),
          size: '640x360'
        })
        .on('end', () => {
          resolve(outputPath);
        })
        .on('error', (err) => {
          console.error('Thumbnail generation error:', err);
          resolve(null);
        });
    } catch (error) {
      console.error('FFmpeg error:', error);
      resolve(null);
    }
  });
}

// Upload media file
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { name, type, category, tags, thumbnail } = req.body;
    console.log('Upload request received:', {
      fileName: req.file?.filename,
      originalName: req.file?.originalname,
      mimeType: req.file?.mimetype,
      frontendType: type,
      hasThumbnail: !!thumbnail,
      thumbnailLength: thumbnail ? thumbnail.length : 0,
      thumbnailPreview: thumbnail ? thumbnail.substring(0, 50) + '...' : 'none'
    });
    
    const id = uuidv4();
    const now = new Date().toISOString();
    const url = `/uploads/${req.file.filename}`;
    const size = req.file.size;
    const filePath = path.join(uploadsDir, req.file.filename);
    
    // Always use server-side type detection, ignore frontend type
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    let detectedType = 'image'; // default
    
    if (req.file.mimetype.startsWith('video/') || ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'].includes(fileExtension)) {
      detectedType = 'video';
    } else if (req.file.mimetype.startsWith('audio/') || ['.mp3', '.wav', '.ogg', '.aac', '.flac'].includes(fileExtension)) {
      detectedType = 'audio';
    }
    
    console.log('Server detected type:', detectedType, 'for file:', req.file.originalname);

    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        parsedTags = [];
      }
    }

    // Use provided thumbnail (from frontend) or generate one
    let finalThumbnail = thumbnail || null;
    console.log('Final thumbnail before processing:', finalThumbnail ? `data URL (${finalThumbnail.length} chars)` : 'null');
    
    // If no thumbnail provided and it's a video, try to generate one (if FFmpeg available)
    if (!finalThumbnail && detectedType === 'video' && ffmpeg) {
      try {
        const thumbnailPath = path.join(uploadsDir, `${req.file.filename}_thumb.jpg`);
        const thumbnailResult = await generateVideoThumbnail(filePath, thumbnailPath);
        if (thumbnailResult) {
          finalThumbnail = `/uploads/${path.basename(thumbnailResult)}`;
        }
      } catch (error) {
        console.error('Thumbnail generation failed:', error);
        // Continue without thumbnail
      }
    }
    
    // If thumbnail is a data URL (from frontend), save it as a file
    if (finalThumbnail && finalThumbnail.startsWith('data:image/')) {
      try {
        console.log('Saving thumbnail from data URL, length:', finalThumbnail.length);
        const base64Data = finalThumbnail.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const thumbnailFilename = `${req.file.filename}_thumb.jpg`;
        const thumbnailPath = path.join(uploadsDir, thumbnailFilename);
        fs.writeFileSync(thumbnailPath, buffer);
        finalThumbnail = `/uploads/${thumbnailFilename}`;
        console.log('Thumbnail saved to:', finalThumbnail);
      } catch (error) {
        console.error('Error saving thumbnail from data URL:', error);
        finalThumbnail = null;
      }
    }

    const item = await db.createMedia({
      tenantId: (req as any).user.tenantId,
      name: name || req.file.originalname,
      type: detectedType,
      url,
      size,
      duration: null,
      thumbnailUrl: finalThumbnail,
      metadata: {
        category: category || null,
        tags: parsedTags
      }
    });

    res.status(201).json(item);
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'File upload failed' });
  }
});

// Create media item (for URLs)
router.post('/', async (req, res) => {
  try {
    const { name, type, url, size, duration, thumbnail, category, tags } = req.body;

    const item = await db.createMedia({
      tenantId: (req as any).user.tenantId,
      name,
      type,
      url,
      size: size || 0,
      duration: duration || null,
      thumbnailUrl: thumbnail || null,
      metadata: {
        category: category || null,
        tags: tags || []
      }
    });

    res.status(201).json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update media item
router.put('/:id', async (req, res) => {
  try {
    const { name, category, tags } = req.body;
    const tenantId = (req as any).user.tenantId;
    
    // Check if item exists and belongs to tenant
    const existingItem = await db.getMediaById(req.params.id);
    if (!existingItem || existingItem.tenantId !== tenantId) {
      return res.status(404).json({ error: 'Media item not found' });
    }

    const updatedItem = await db.updateMedia(req.params.id, {
      name,
      metadata: {
        ...existingItem.metadata,
        category: category || null,
        tags: tags || []
      }
    });

    if (!updatedItem) {
      return res.status(404).json({ error: 'Media item not found' });
    }

    res.json(updatedItem);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete media item
router.delete('/:id', async (req, res) => {
  try {
    const tenantId = (req as any).user.tenantId;
    
    // Check if item exists and belongs to tenant
    const item = await db.getMediaById(req.params.id);
    if (!item || item.tenantId !== tenantId) {
      return res.status(404).json({ error: 'Media item not found' });
    }

    // Delete file if it exists
    if (item.url && item.url.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '../../', item.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    const deleted = await db.deleteMedia(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Media item not found' });
    }

    // TODO: Also remove from playlist items when playlist methods are implemented
    res.json({ message: 'Media item deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Fix video types endpoint
router.post('/fix-video-types', async (req, res) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const mediaItems = await db.getMediaByTenant(tenantId);
    let fixedCount = 0;
    
    for (const item of mediaItems) {
      if (item.url && item.url.endsWith('.mp4') && item.type !== 'video') {
        await db.updateMedia(item.id, { type: 'video' });
        fixedCount++;
      }
    }
    
    res.json({ message: `Fixed ${fixedCount} video types` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Serve uploaded files
router.use('/uploads', express.static(uploadsDir));

export default router;
