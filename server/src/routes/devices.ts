import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/unified-database.js';
import { authenticate, authorize, tenantIsolation } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);
router.use(tenantIsolation);

// Get all devices
router.get('/', async (req, res) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const devices = await db.getDevicesByTenant(tenantId);
    res.json(devices);
  } catch (error: any) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get device by ID
router.get('/:id', async (req, res) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const device = await db.getDeviceById(req.params.id);
    
    if (!device || device.tenantId !== tenantId) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    res.json(device);
  } catch (error: any) {
    console.error('Error fetching device:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create device
router.post('/', async (req, res) => {
  try {
    const { name, location, resolution, orientation, status = 'offline' } = req.body;
    const id = uuidv4();
    const tenantId = (req as any).user.tenantId;

    const deviceData = {
      id,
      tenantId,
      name,
      location,
      status,
      resolution,
      lastSeen: new Date(),
      orientation,
      currentPlaylistId: null,
      groupName: null
    };

    const device = await db.createDevice(deviceData);
    res.status(201).json(device);
  } catch (error: any) {
    console.error('Error creating device:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update device
router.put('/:id', async (req, res) => {
  try {
    const { name, location, status, resolution, orientation, currentPlaylistId, groupName } = req.body;
    const tenantId = (req as any).user.tenantId;
    
    // First check if device exists and belongs to tenant
    const existingDevice = await db.getDeviceById(req.params.id);
    if (!existingDevice || existingDevice.tenantId !== tenantId) {
      return res.status(404).json({ error: 'Device not found' });
    }

    const updateData = {
      name,
      location,
      status,
      resolution,
      orientation,
      currentPlaylistId: currentPlaylistId || null,
      groupName: groupName || null,
      lastSeen: new Date()
    };

    const updatedDevice = await db.updateDevice(req.params.id, updateData);
    res.json(updatedDevice);
  } catch (error: any) {
    console.error('Error updating device:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete device
router.delete('/:id', async (req, res) => {
  try {
    const tenantId = (req as any).user.tenantId;
    
    // First check if device exists and belongs to tenant
    const existingDevice = await db.getDeviceById(req.params.id);
    if (!existingDevice || existingDevice.tenantId !== tenantId) {
      return res.status(404).json({ error: 'Device not found' });
    }

    await db.deleteDevice(req.params.id);
    res.json({ message: 'Device deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting device:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
