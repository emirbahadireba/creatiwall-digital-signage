import { Router } from 'express';
import db from '../db/database';
import { authenticate, authorize, tenantIsolation } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);
router.use(tenantIsolation);

// Get all widget templates (marketplace) - Global but requires authentication
router.get('/templates', authenticate, (req, res) => {
  try {
    const templates = db.database.widgetTemplates;
    res.json(templates);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single widget template - Global but requires authentication
router.get('/templates/:id', authenticate, (req, res) => {
  try {
    const template = db.database.widgetTemplates.find((t: any) => t.id === req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Widget template not found' });
    }
    res.json(template);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all widget instances (user's installed widgets)
router.get('/instances', (req, res) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const instances = db.database.widgetInstances
      .filter((instance: any) => instance.tenantId === tenantId)
      .map((instance: any) => {
        const template = db.database.widgetTemplates.find((t: any) => t.id === instance.templateId);
        return {
          ...instance,
          template
        };
      });
    res.json(instances);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single widget instance
router.get('/instances/:id', (req, res) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const instance = db.database.widgetInstances.find((i: any) => i.id === req.params.id && i.tenantId === tenantId);
    if (!instance) {
      return res.status(404).json({ error: 'Widget instance not found' });
    }
    
    const template = db.database.widgetTemplates.find((t: any) => t.id === instance.templateId);
    res.json({ ...instance, template });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create widget instance (install widget)
router.post('/instances', (req, res) => {
  try {
    const { templateId, name, config } = req.body;
    
    const template = db.database.widgetTemplates.find((t: any) => t.id === templateId);
    if (!template) {
      return res.status(404).json({ error: 'Widget template not found' });
    }
    
    const newInstance = {
      id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
      tenantId: (req as any).user.tenantId,
      templateId,
      name: name || template.name,
      config: config || template.defaultConfig,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    db.database.widgetInstances.push(newInstance);
    db.saveDatabase();
    
    res.status(201).json({ ...newInstance, template });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update widget instance
router.put('/instances/:id', (req, res) => {
  try {
    const { name, config } = req.body;
    const tenantId = (req as any).user.tenantId;
    const index = db.database.widgetInstances.findIndex((i: any) => i.id === req.params.id && i.tenantId === tenantId);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Widget instance not found' });
    }
    
    db.database.widgetInstances[index] = {
      ...db.database.widgetInstances[index],
      name: name || db.database.widgetInstances[index].name,
      config: config || db.database.widgetInstances[index].config,
      updatedAt: new Date().toISOString()
    };
    
    db.saveDatabase();
    
    const template = db.database.widgetTemplates.find((t: any) => t.id === db.database.widgetInstances[index].templateId);
    res.json({ ...db.database.widgetInstances[index], template });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete widget instance
router.delete('/instances/:id', (req, res) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const index = db.database.widgetInstances.findIndex((i: any) => i.id === req.params.id && i.tenantId === tenantId);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Widget instance not found' });
    }
    
    db.database.widgetInstances.splice(index, 1);
    db.saveDatabase();
    
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

