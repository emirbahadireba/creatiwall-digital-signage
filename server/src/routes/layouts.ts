import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/unified-database';
import { authenticate, authorize, tenantIsolation } from '../middleware/auth';

const router = express.Router();

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

// Validate layout name uniqueness
const validateLayoutName = async (name: string, tenantId: string, excludeId?: string) => {
  const database = db;
  const layouts = await database.getLayouts(tenantId);
  const existingLayout = layouts.find((l: any) =>
    l.name.toLowerCase() === name.toLowerCase() && l.id !== excludeId
  );
  return !existingLayout;
};

// Generate unique layout name
const generateUniqueLayoutName = async (baseName: string, tenantId: string) => {
  let name = baseName;
  let counter = 1;
  
  while (!(await validateLayoutName(name, tenantId))) {
    name = `${baseName} ${counter}`;
    counter++;
  }
  
  return name;
};

// Generate layout thumbnail (placeholder for now)
const generateLayoutThumbnail = async (layout: any) => {
  // TODO: Implement actual thumbnail generation using canvas or similar
  // For now, return null to use default placeholder
  return null;
};

// Get layout presets (public endpoint)
router.get('/presets', (req, res) => {
  try {
    res.json({
      success: true,
      data: LAYOUT_PRESETS
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get layout categories (public endpoint)
router.get('/categories', (req, res) => {
  try {
    res.json({
      success: true,
      data: LAYOUT_CATEGORIES
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Apply authentication middleware to protected routes
router.use(authenticate);
router.use(tenantIsolation);

// Get all layouts with filtering
router.get('/', async (req, res) => {
  try {
    const { category, orientation, search } = req.query;
    const tenantId = (req as any).user.tenantId;
    const database = db;
    
    let layouts = await database.getLayouts(tenantId);

    // Add zones to each layout
    for (const layout of layouts) {
      const zones = await database.getZonesByLayoutId(layout.id);
      (layout as any).zones = zones;
    }

    // Filter by category
    if (category && category !== 'all') {
      layouts = layouts.filter((layout: any) => layout.category === category);
    }

    // Filter by orientation
    if (orientation && orientation !== 'all') {
      layouts = layouts.filter((layout: any) => layout.orientation === orientation);
    }

    // Search by name or description
    if (search) {
      const searchTerm = search.toString().toLowerCase();
      layouts = layouts.filter((layout: any) =>
        layout.name.toLowerCase().includes(searchTerm) ||
        layout.description?.toLowerCase().includes(searchTerm)
      );
    }

    res.json(layouts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get layout by ID
router.get('/:id', async (req, res) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const database = db;
    const layout = await database.getLayoutById(req.params.id, tenantId);
    
    if (!layout) {
      return res.status(404).json({ error: 'Layout not found' });
    }
    
    const zones = await database.getZonesByLayoutId(layout.id);
    res.json({
      ...layout,
      zones
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create layout
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      template,
      category,
      orientation,
      dimensions,
      zones,
      preset,
      backgroundColor
    } = req.body;

    const tenantId = (req as any).user.tenantId;
    const database = db;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Layout name is required' });
    }

    // Generate unique name if needed
    const uniqueName = await generateUniqueLayoutName(name.trim(), tenantId);
    
    // Validate category
    if (category && !LAYOUT_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    // Get dimensions from preset or use provided dimensions
    let layoutDimensions = dimensions;
    if (preset && typeof preset === 'string' && LAYOUT_PRESETS[preset as keyof typeof LAYOUT_PRESETS]) {
      const presetData = LAYOUT_PRESETS[preset as keyof typeof LAYOUT_PRESETS];
      layoutDimensions = {
        width: presetData.width,
        height: presetData.height
      };
    }

    // Default dimensions if not provided
    if (!layoutDimensions) {
      layoutDimensions = { width: 1920, height: 1080 };
    }

    // Determine orientation if not provided
    let layoutOrientation = orientation;
    if (!layoutOrientation) {
      layoutOrientation = layoutDimensions.width >= layoutDimensions.height ? 'landscape' : 'portrait';
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    // Generate thumbnail (placeholder for now)
    const thumbnail = await generateLayoutThumbnail({ zones });

    const layout = {
      id,
      tenantId,
      name: uniqueName,
      description: description || `${zones?.length || 0} bölgeli özel tasarım`,
      template: template || 'custom',
      category: category || 'custom',
      orientation: layoutOrientation,
      thumbnail,
      dimensions: layoutDimensions,
      backgroundColor: backgroundColor || '#000000',
      zones: [],
      createdAt: now,
      updatedAt: now
    };

    // Create layout in database
    const createdLayout = await database.createLayout(layout);

    // Create zones if provided
    const createdZones = [];
    if (zones && Array.isArray(zones)) {
      for (const [index, zone] of zones.entries()) {
        const zoneData = {
          id: zone.id || uuidv4(),
          layoutId: id,
          name: zone.name || `Bölge ${index + 1}`,
          x: zone.x,
          y: zone.y,
          width: zone.width,
          height: zone.height,
          type: zone.type,
          content: zone.content || null,
          mediaId: zone.mediaId || null,
          playlistId: zone.playlistId || null,
          widgetInstanceId: zone.widgetInstanceId || null,
          backgroundColor: zone.backgroundColor || null,
          textColor: zone.textColor || null,
          fontSize: zone.fontSize || null,
          fontFamily: zone.fontFamily || null,
          textAlign: zone.textAlign || null,
          opacity: zone.opacity !== undefined ? zone.opacity : 1,
          borderRadius: zone.borderRadius !== undefined ? zone.borderRadius : 0,
          borderWidth: zone.borderWidth !== undefined ? zone.borderWidth : 2,
          borderColor: zone.borderColor || null,
          style: zone.style || null
        };
        const createdZone = await database.createZone(zoneData);
        createdZones.push(createdZone);
      }
    }

    res.status(201).json({
      ...createdLayout,
      zones: createdZones
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update layout
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      orientation,
      dimensions,
      zones,
      preset,
      backgroundColor
    } = req.body;
    
    const tenantId = (req as any).user.tenantId;
    const database = db;
    
    // Get existing layout
    const existingLayout = await database.getLayoutById(req.params.id, tenantId);
    if (!existingLayout) {
      return res.status(404).json({ error: 'Layout not found' });
    }

    // Validate name uniqueness (excluding current layout)
    if (name && name.trim()) {
      if (!(await validateLayoutName(name.trim(), tenantId, req.params.id))) {
        return res.status(400).json({ error: 'Layout name already exists' });
      }
    }

    // Validate category
    if (category && !LAYOUT_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    // Get dimensions from preset or use provided dimensions
    let layoutDimensions = dimensions || existingLayout.dimensions;
    if (preset && typeof preset === 'string' && LAYOUT_PRESETS[preset as keyof typeof LAYOUT_PRESETS]) {
      const presetData = LAYOUT_PRESETS[preset as keyof typeof LAYOUT_PRESETS];
      layoutDimensions = {
        width: presetData.width,
        height: presetData.height
      };
    }

    // Determine orientation if not provided
    let layoutOrientation = orientation || existingLayout.orientation;
    if (!layoutOrientation) {
      layoutOrientation = layoutDimensions.width >= layoutDimensions.height ? 'landscape' : 'portrait';
    }

    const now = new Date().toISOString();

    // Generate new thumbnail if zones changed
    const thumbnail = zones ? await generateLayoutThumbnail({ zones }) : existingLayout.thumbnail;

    // Update layout data
    const updatedLayoutData = {
      ...existingLayout,
      name: name?.trim() || existingLayout.name,
      description: description !== undefined ? description : existingLayout.description,
      category: category || existingLayout.category,
      orientation: layoutOrientation,
      thumbnail: thumbnail,
      dimensions: layoutDimensions,
      backgroundColor: backgroundColor !== undefined ? backgroundColor : (existingLayout.backgroundColor || '#000000'),
      updatedAt: now
    };

    // Update layout in database
    const updatedLayout = await database.updateLayout(req.params.id, updatedLayoutData, tenantId);

    // Update zones if provided
    let updatedZones = [];
    if (zones && Array.isArray(zones)) {
      // Delete old zones
      await database.deleteZonesByLayoutId(req.params.id);

      // Create new zones
      for (const [index, zone] of zones.entries()) {
        const zoneData = {
          id: zone.id || uuidv4(),
          layoutId: req.params.id,
          name: zone.name || `Bölge ${index + 1}`,
          x: zone.x,
          y: zone.y,
          width: zone.width,
          height: zone.height,
          type: zone.type,
          content: zone.content || null,
          mediaId: zone.mediaId || null,
          playlistId: zone.playlistId || null,
          widgetInstanceId: zone.widgetInstanceId || null,
          backgroundColor: zone.backgroundColor || null,
          textColor: zone.textColor || null,
          fontSize: zone.fontSize || null,
          fontFamily: zone.fontFamily || null,
          textAlign: zone.textAlign || null,
          opacity: zone.opacity !== undefined ? zone.opacity : 1,
          borderRadius: zone.borderRadius !== undefined ? zone.borderRadius : 0,
          borderWidth: zone.borderWidth !== undefined ? zone.borderWidth : 2,
          borderColor: zone.borderColor || null,
          style: zone.style || null
        };
        const createdZone = await database.createZone(zoneData);
        updatedZones.push(createdZone);
      }
    } else {
      // Get existing zones if zones not provided
      updatedZones = await database.getZonesByLayoutId(req.params.id);
    }

    res.json({
      ...updatedLayout,
      zones: updatedZones
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete layout
router.delete('/:id', async (req, res) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const database = db;
    
    // Check if layout exists
    const existingLayout = await database.getLayoutById(req.params.id, tenantId);
    if (!existingLayout) {
      return res.status(404).json({ error: 'Layout not found' });
    }
    
    // Delete layout and its zones
    await database.deleteZonesByLayoutId(req.params.id);
    await database.deleteLayout(req.params.id, tenantId);
    
    res.json({ message: 'Layout deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
