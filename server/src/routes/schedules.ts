import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { authenticate, authorize, tenantIsolation } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);
router.use(tenantIsolation);

// Get all schedules
router.get('/', (req, res) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const schedules = db.database.schedules
      .filter((schedule: any) => schedule.tenantId === tenantId)
      .map((schedule: any) => ({
        ...schedule,
        active: Boolean(schedule.active),
        days: Array.isArray(schedule.days) ? schedule.days : (schedule.days ? JSON.parse(schedule.days) : []),
        deviceIds: db.database.scheduleDevices
          .filter((sd: any) => sd.scheduleId === schedule.id)
          .map((sd: any) => sd.deviceId)
      }));
    res.json(schedules);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get schedule by ID
router.get('/:id', (req, res) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const schedule = db.database.schedules.find((s: any) => s.id === req.params.id && s.tenantId === tenantId);
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    const deviceIds = db.database.scheduleDevices
      .filter((sd: any) => sd.scheduleId === schedule.id)
      .map((sd: any) => sd.deviceId);
    res.json({
      ...schedule,
      active: Boolean(schedule.active),
      days: Array.isArray(schedule.days) ? schedule.days : (schedule.days ? JSON.parse(schedule.days) : []),
      deviceIds
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create schedule
router.post('/', (req, res) => {
  try {
    const { name, playlistId, deviceIds, startDate, endDate, startTime, endTime, days, priority = 0, active = true } = req.body;
    const id = uuidv4();
    const now = new Date().toISOString();

    const schedule = {
      id,
      tenantId: (req as any).user.tenantId,
      name,
      playlistId,
      startDate,
      endDate,
      startTime,
      endTime,
      days: Array.isArray(days) ? days : [],
      priority,
      active: Boolean(active),
      deviceIds: deviceIds || [],
      createdAt: now,
      updatedAt: now
    };

    db.database.schedules.push(schedule);

    // Insert schedule devices
    if (deviceIds && Array.isArray(deviceIds)) {
      deviceIds.forEach((deviceId: string) => {
        db.database.scheduleDevices.push({
          scheduleId: id,
          deviceId
        });
      });
    }

    db.saveDatabase();
    const scheduleDeviceIds = db.database.scheduleDevices
      .filter((sd: any) => sd.scheduleId === id)
      .map((sd: any) => sd.deviceId);
    res.status(201).json({
      ...schedule,
      active: Boolean(schedule.active),
      days: schedule.days,
      deviceIds: scheduleDeviceIds
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update schedule
router.put('/:id', (req, res) => {
  try {
    const { name, playlistId, deviceIds, startDate, endDate, startTime, endTime, days, priority, active } = req.body;
    const tenantId = (req as any).user.tenantId;
    const scheduleIndex = db.database.schedules.findIndex((s: any) => s.id === req.params.id && s.tenantId === tenantId);
    
    if (scheduleIndex === -1) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    const now = new Date().toISOString();
    db.database.schedules[scheduleIndex] = {
      ...db.database.schedules[scheduleIndex],
      name,
      playlistId,
      startDate,
      endDate,
      startTime,
      endTime,
      days: Array.isArray(days) ? days : [],
      priority,
      active: Boolean(active),
      updatedAt: now
    };

    // Update schedule devices
    if (deviceIds && Array.isArray(deviceIds)) {
      db.database.scheduleDevices = db.database.scheduleDevices.filter((sd: any) => sd.scheduleId !== req.params.id);
      deviceIds.forEach((deviceId: string) => {
        db.database.scheduleDevices.push({
          scheduleId: req.params.id,
          deviceId
        });
      });
    }

    db.saveDatabase();
    const scheduleDeviceIds = db.database.scheduleDevices
      .filter((sd: any) => sd.scheduleId === req.params.id)
      .map((sd: any) => sd.deviceId);
    res.json({
      ...db.database.schedules[scheduleIndex],
      active: Boolean(db.database.schedules[scheduleIndex].active),
      days: db.database.schedules[scheduleIndex].days,
      deviceIds: scheduleDeviceIds
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete schedule
router.delete('/:id', (req, res) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const scheduleIndex = db.database.schedules.findIndex((s: any) => s.id === req.params.id && s.tenantId === tenantId);
    if (scheduleIndex === -1) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    db.database.schedules.splice(scheduleIndex, 1);
    // Also delete schedule devices
    db.database.scheduleDevices = db.database.scheduleDevices.filter((sd: any) => sd.scheduleId !== req.params.id);
    db.saveDatabase();
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
