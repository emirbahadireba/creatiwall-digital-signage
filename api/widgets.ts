import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Hardcoded Supabase credentials (same as register/login)
const supabaseUrl = 'https://ixqkqvhqfbpjpibhlqtb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4cWtxdmhxZmJwanBpYmhscXRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3MjU5NzEsImV4cCI6MjA0NzMwMTk3MX0.YCOkdOJNHS8tJoqeGBYyJlBxKOqaQkGOQKJmrOQKqhI';

const supabase = createClient(supabaseUrl, supabaseKey);

// Field conversion helpers
function convertToSnakeCase(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  const converted: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    converted[snakeKey] = value;
  }
  return converted;
}

function convertToCamelCase(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  const converted: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    converted[camelKey] = value;
  }
  return converted;
}

// Widget templates (marketplace data)
const WIDGET_TEMPLATES = [
  {
    id: 'clock-digital',
    name: 'Digital Clock',
    description: 'Modern digital clock widget with customizable format',
    icon: '🕐',
    category: 'time',
    version: '1.0.0',
    author: 'CreatiWall',
    configSchema: [
      { key: 'format', label: 'Time Format', type: 'select', options: [
        { label: '24 Hour', value: '24h' },
        { label: '12 Hour', value: '12h' }
      ], default: '24h' },
      { key: 'showSeconds', label: 'Show Seconds', type: 'toggle', default: true },
      { key: 'color', label: 'Text Color', type: 'color', default: '#ffffff' }
    ],
    defaultConfig: { format: '24h', showSeconds: true, color: '#ffffff' },
    htmlUrl: '/widgets/clock.html'
  },
  {
    id: 'weather-current',
    name: 'Current Weather',
    description: 'Display current weather conditions',
    icon: '🌤️',
    category: 'weather',
    version: '1.0.0',
    author: 'CreatiWall',
    configSchema: [
      { key: 'city', label: 'City', type: 'text', required: true, placeholder: 'Istanbul' },
      { key: 'units', label: 'Units', type: 'select', options: [
        { label: 'Celsius', value: 'metric' },
        { label: 'Fahrenheit', value: 'imperial' }
      ], default: 'metric' }
    ],
    defaultConfig: { city: 'Istanbul', units: 'metric' },
    htmlUrl: '/widgets/weather.html'
  },
  {
    id: 'rss-feed',
    name: 'RSS Feed',
    description: 'Display RSS feed content',
    icon: '📰',
    category: 'data',
    version: '1.0.0',
    author: 'CreatiWall',
    configSchema: [
      { key: 'url', label: 'RSS URL', type: 'url', required: true, placeholder: 'https://example.com/rss' },
      { key: 'maxItems', label: 'Max Items', type: 'number', default: 5, min: 1, max: 20 },
      { key: 'scrollSpeed', label: 'Scroll Speed', type: 'number', default: 50, min: 10, max: 200 }
    ],
    defaultConfig: { url: '', maxItems: 5, scrollSpeed: 50 },
    htmlUrl: '/widgets/rss.html'
  }
];

// Simple in-memory database for demo
let database = {
  widgetInstances: [] as any[]
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🧩 Widgets API called:', req.method, req.url);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req;

  try {
    // Handle /templates endpoint
    if (url?.includes('/templates')) {
      if (req.method === 'GET') {
        console.log('📋 Getting widget templates...');
        return res.status(200).json({
          success: true,
          data: WIDGET_TEMPLATES,
          source: 'static'
        });
      }
    }

    // Handle /instances endpoint
    if (url?.includes('/instances')) {
      if (req.method === 'GET') {
        console.log('📋 Getting widget instances from Supabase...');
        
        const { data: instances, error } = await supabase
          .from('widget_instances')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Supabase widget instances error:', error);
          console.log('🔄 Using fallback database...');
          return res.status(200).json({
            success: true,
            data: database.widgetInstances,
            source: 'fallback'
          });
        }

        console.log('✅ Widget instances retrieved from Supabase:', instances?.length || 0);
        
        // Convert snake_case to camelCase and enrich with template data
        const convertedData = instances?.map(instance => {
          const convertedInstance = convertToCamelCase(instance);
          const template = WIDGET_TEMPLATES.find(t => t.id === convertedInstance.templateId);
          return { ...convertedInstance, template };
        }) || [];
        
        return res.status(200).json({
          success: true,
          data: convertedData,
          source: 'supabase'
        });
      }

      if (req.method === 'POST') {
        console.log('➕ Creating new widget instance...');
        const { templateId, name, config } = req.body;
        
        const template = WIDGET_TEMPLATES.find(t => t.id === templateId);
        if (!template) {
          return res.status(404).json({
            success: false,
            message: 'Widget template not found'
          });
        }

        // Convert camelCase to snake_case for database
        const dbData = convertToSnakeCase({
          id: Date.now().toString(),
          templateId,
          name: name || template.name,
          config: config || template.defaultConfig,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        console.log('💾 Inserting widget instance to Supabase:', dbData);

        const { data, error } = await supabase
          .from('widget_instances')
          .insert([dbData])
          .select()
          .single();

        if (error) {
          console.error('❌ Supabase widget instance insert error:', error);
          console.log('🔄 Using fallback database...');
          
          const fallbackData = {
            id: Date.now().toString(),
            templateId,
            name: name || template.name,
            config: config || template.defaultConfig,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            template
          };
          
          database.widgetInstances.push(fallbackData);
          
          return res.status(201).json({
            success: true,
            data: fallbackData,
            source: 'fallback'
          });
        }

        console.log('✅ Widget instance created in Supabase:', data);
        
        // Convert back to camelCase for response
        const convertedData = convertToCamelCase(data);
        convertedData.template = template;
        
        return res.status(201).json({
          success: true,
          data: convertedData,
          source: 'supabase'
        });
      }
    }

    // Handle single instance operations
    const instanceIdMatch = url?.match(/\/instances\/([^\/]+)$/);
    if (instanceIdMatch) {
      const instanceId = instanceIdMatch[1];

      if (req.method === 'GET') {
        console.log('📋 Getting widget instance:', instanceId);
        
        const { data, error } = await supabase
          .from('widget_instances')
          .select('*')
          .eq('id', instanceId)
          .single();

        if (error) {
          console.error('❌ Supabase widget instance error:', error);
          console.log('🔄 Using fallback database...');
          
          const instance = database.widgetInstances.find(i => i.id === instanceId);
          if (!instance) {
            return res.status(404).json({
              success: false,
              message: 'Widget instance not found'
            });
          }
          
          return res.status(200).json({
            success: true,
            data: instance,
            source: 'fallback'
          });
        }

        console.log('✅ Widget instance retrieved from Supabase:', data);
        
        // Convert and enrich with template
        const convertedData = convertToCamelCase(data);
        const template = WIDGET_TEMPLATES.find(t => t.id === convertedData.templateId);
        convertedData.template = template;
        
        return res.status(200).json({
          success: true,
          data: convertedData,
          source: 'supabase'
        });
      }

      if (req.method === 'PUT') {
        console.log('✏️ Updating widget instance:', instanceId);
        const { name, config } = req.body;

        // Convert camelCase to snake_case for database
        const dbData = convertToSnakeCase({
          name,
          config,
          updatedAt: new Date().toISOString()
        });

        console.log('💾 Updating widget instance in Supabase:', instanceId, dbData);

        const { data, error } = await supabase
          .from('widget_instances')
          .update(dbData)
          .eq('id', instanceId)
          .select()
          .single();

        if (error) {
          console.error('❌ Supabase widget instance update error:', error);
          console.log('🔄 Using fallback database...');
          
          const instanceIndex = database.widgetInstances.findIndex(i => i.id === instanceId);
          if (instanceIndex === -1) {
            return res.status(404).json({
              success: false,
              message: 'Widget instance not found'
            });
          }
          
          database.widgetInstances[instanceIndex] = {
            ...database.widgetInstances[instanceIndex],
            name: name || database.widgetInstances[instanceIndex].name,
            config: config || database.widgetInstances[instanceIndex].config,
            updatedAt: new Date().toISOString()
          };
          
          return res.status(200).json({
            success: true,
            data: database.widgetInstances[instanceIndex],
            source: 'fallback'
          });
        }

        console.log('✅ Widget instance updated in Supabase:', data);
        
        // Convert and enrich with template
        const convertedData = convertToCamelCase(data);
        const template = WIDGET_TEMPLATES.find(t => t.id === convertedData.templateId);
        convertedData.template = template;
        
        return res.status(200).json({
          success: true,
          data: convertedData,
          source: 'supabase'
        });
      }

      if (req.method === 'DELETE') {
        console.log('🗑️ Deleting widget instance:', instanceId);

        const { error } = await supabase
          .from('widget_instances')
          .delete()
          .eq('id', instanceId);

        if (error) {
          console.error('❌ Supabase widget instance delete error:', error);
          console.log('🔄 Using fallback database...');
          
          const instanceIndex = database.widgetInstances.findIndex(i => i.id === instanceId);
          if (instanceIndex === -1) {
            return res.status(404).json({
              success: false,
              message: 'Widget instance not found'
            });
          }
          
          database.widgetInstances.splice(instanceIndex, 1);
          
          return res.status(200).json({
            success: true,
            message: 'Widget instance deleted',
            source: 'fallback'
          });
        }

        console.log('✅ Widget instance deleted from Supabase');
        
        return res.status(200).json({
          success: true,
          message: 'Widget instance deleted',
          source: 'supabase'
        });
      }
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });

  } catch (error) {
    console.error('💥 Widgets API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}