import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/unified-database.js';
import { authenticate, authorize, tenantIsolation } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);
router.use(tenantIsolation);

// Get all schedules
router.get('/', async (req, res) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const schedules = await db.getSchedulesByTenant(tenantId);
    res.json(schedules);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get schedule by ID
router.get('/:id', async (req, res) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const schedule = await db.getScheduleById(req.params.id);
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    res.json(schedule);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create schedule
router.post('/', async (req, res) => {
  try {
    const { name, playlistId, deviceIds, startDate, endDate, startTime, endTime, days, priority = 0, active = true } = req.body;
    const id = uuidv4();
    const now = new Date().toISOString();

    const scheduleData = {
      tenantId: (req as any).user.tenantId,
      name,
      playlistId,
      startDate,
      endDate,
      startTime,
      endTime,
      daysOfWeek: Array.isArray(days) ? days : [],
      priority,
      isActive: Boolean(active),
      deviceIds: deviceIds || []
    };

    const createdSchedule = await db.createSchedule(scheduleData);
    res.status(201).json(createdSchedule);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update schedule
router.put('/:id', async (req, res) => {
  try {
    const { name, playlistId, deviceIds, startDate, endDate, startTime, endTime, days, priority, active } = req.body;
    const tenantId = (req as any).user.tenantId;
    
    const updateData = {
      name,
      playlistId,
      startDate,
      endDate,
      startTime,
      endTime,
      daysOfWeek: Array.isArray(days) ? days : [],
      priority,
      isActive: Boolean(active),
      deviceIds: deviceIds || []
    };

    const updatedSchedule = await db.updateSchedule(req.params.id, updateData);
    if (!updatedSchedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    res.json(updatedSchedule);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete schedule
router.delete('/:id', async (req, res) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const deleted = await db.deleteSchedule(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
