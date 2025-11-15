import { Router } from 'express';
import { db } from '../db/unified-database.js';
import { authenticate, authorize, tenantIsolation } from '../middleware/auth.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);
router.use(tenantIsolation);

// Get all widget templates (marketplace) - Global but requires authentication
router.get('/templates', authenticate, async (req, res) => {
  try {
    const templates = await db.getWidgetTemplates();
    res.json(templates);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single widget template - Global but requires authentication
router.get('/templates/:id', authenticate, async (req, res) => {
  try {
    const template = await db.getWidgetTemplateById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Widget template not found' });
    }
    res.json(template);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all widget instances (user's installed widgets)
router.get('/instances', async (req, res) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const instances = await db.getWidgetInstancesByTenant(tenantId);
    
    // Enrich instances with template data
    const enrichedInstances = await Promise.all(
      instances.map(async (instance) => {
        const template = await db.getWidgetTemplateById(instance.templateId);
        return {
          ...instance,
          template
        };
      })
    );
    
    res.json(enrichedInstances);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single widget instance
router.get('/instances/:id', async (req, res) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const instance = await db.getWidgetInstanceById(req.params.id);
    
    if (!instance || instance.tenantId !== tenantId) {
      return res.status(404).json({ error: 'Widget instance not found' });
    }
    
    const template = await db.getWidgetTemplateById(instance.templateId);
    res.json({ ...instance, template });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create widget instance (install widget)
router.post('/instances', async (req, res) => {
  try {
    const { templateId, name, config } = req.body;
    
    const template = await db.getWidgetTemplateById(templateId);
    if (!template) {
      return res.status(404).json({ error: 'Widget template not found' });
    }
    
    const newInstance = await db.createWidgetInstance({
      tenantId: (req as any).user.tenantId,
      templateId,
      name: name || template.name,
      config: config || template.defaultConfig
    });
    
    res.status(201).json({ ...newInstance, template });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update widget instance
router.put('/instances/:id', async (req, res) => {
  try {
    const { name, config } = req.body;
    const tenantId = (req as any).user.tenantId;
    
    // Check if instance exists and belongs to tenant
    const existingInstance = await db.getWidgetInstanceById(req.params.id);
    if (!existingInstance || existingInstance.tenantId !== tenantId) {
      return res.status(404).json({ error: 'Widget instance not found' });
    }
    
    const updatedInstance = await db.updateWidgetInstance(req.params.id, {
      name: name || existingInstance.name,
      config: config || existingInstance.config
    });
    
    if (!updatedInstance) {
      return res.status(404).json({ error: 'Widget instance not found' });
    }
    
    const template = await db.getWidgetTemplateById(updatedInstance.templateId);
    res.json({ ...updatedInstance, template });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete widget instance
router.delete('/instances/:id', async (req, res) => {
  try {
    const tenantId = (req as any).user.tenantId;
    
    // Check if instance exists and belongs to tenant
    const existingInstance = await db.getWidgetInstanceById(req.params.id);
    if (!existingInstance || existingInstance.tenantId !== tenantId) {
      return res.status(404).json({ error: 'Widget instance not found' });
    }
    
    const deleted = await db.deleteWidgetInstance(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Widget instance not found' });
    }
    
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

