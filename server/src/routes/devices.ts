import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database';
import { authenticate, authorize, tenantIsolation } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);
router.use(tenantIsolation);

// Get all devices
router.get('/', (req, res) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const tenantDevices = db.database.devices.filter((device: any) => device.tenantId === tenantId);
    res.json(tenantDevices);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get device by ID
router.get('/:id', (req, res) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const device = db.database.devices.find((d: any) => d.id === req.params.id && d.tenantId === tenantId);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    res.json(device);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create device
router.post('/', (req, res) => {
  try {
    const { name, location, resolution, orientation, status = 'offline' } = req.body;
    const id = uuidv4();
    const now = new Date().toISOString();

    const device = {
      id,
      tenantId: (req as any).user.tenantId,
      name,
      location,
      status,
      resolution,
      lastSeen: now,
      orientation,
      currentPlaylistId: null,
      groupName: null,
      createdAt: now,
      updatedAt: now
    };

    db.database.devices.push(device);
    db.saveDatabase();
    res.status(201).json(device);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update device
router.put('/:id', (req, res) => {
  try {
    const { name, location, status, resolution, orientation, currentPlaylistId, groupName } = req.body;
    const tenantId = (req as any).user.tenantId;
    const deviceIndex = db.database.devices.findIndex((d: any) => d.id === req.params.id && d.tenantId === tenantId);
    
    if (deviceIndex === -1) {
      return res.status(404).json({ error: 'Device not found' });
    }

    const now = new Date().toISOString();
    db.database.devices[deviceIndex] = {
      ...db.database.devices[deviceIndex],
      name,
      location,
      status,
      resolution,
      orientation,
      currentPlaylistId: currentPlaylistId || null,
      groupName: groupName || null,
      updatedAt: now,
      lastSeen: now
    };
    db.saveDatabase();
    res.json(db.database.devices[deviceIndex]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete device
router.delete('/:id', (req, res) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const deviceIndex = db.database.devices.findIndex((d: any) => d.id === req.params.id && d.tenantId === tenantId);
    if (deviceIndex === -1) {
      return res.status(404).json({ error: 'Device not found' });
    }
    db.database.devices.splice(deviceIndex, 1);
    // Also remove from schedule_devices
    db.database.scheduleDevices = db.database.scheduleDevices.filter((sd: any) => sd.deviceId !== req.params.id);
    db.saveDatabase();
    res.json({ message: 'Device deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
