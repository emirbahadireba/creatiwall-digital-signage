import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://jlrsklomfbfoogaekfyd.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpscnNrbG9tZmJmb29nYWVrZnlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxNDUyNzUsImV4cCI6MjA3ODcyMTI3NX0.bCua_8dkQm03_0kvtRCRIuj8Knycax06pw7yPRomIH0';

const supabase = createClient(supabaseUrl, supabaseKey);
const JWT_SECRET = process.env.JWT_SECRET || '431cc51f80b54beb2905d81bfef8cab17fee760f5a2f36af07edb1189dae9205';

// In-memory connection store (for demo purposes)
// In production, use Redis or similar persistent store
interface Connection {
  id: string;
  userId: string;
  tenantId: string;
  deviceId?: string;
  channels: string[];
  lastSeen: Date;
}

const connections = new Map<string, Connection>();
const channels = new Map<string, Set<string>>(); // channel -> connection IDs

// WebSocket message types
interface WebSocketMessage {
  type: 'subscribe' | 'unsubscribe' | 'broadcast' | 'device_status' | 'layout_update' | 'content_sync' | 'notification';
  channel?: string;
  data?: any;
  target?: string; // specific device/user ID
}

// Helper functions
function generateConnectionId(): string {
  return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function addToChannel(channelName: string, connectionId: string): void {
  if (!channels.has(channelName)) {
    channels.set(channelName, new Set());
  }
  channels.get(channelName)!.add(connectionId);
}

function removeFromChannel(channelName: string, connectionId: string): void {
  const channel = channels.get(channelName);
  if (channel) {
    channel.delete(connectionId);
    if (channel.size === 0) {
      channels.delete(channelName);
    }
  }
}

function broadcastToChannel(channelName: string, message: any, excludeConnectionId?: string): void {
  const channel = channels.get(channelName);
  if (!channel) return;

  const payload = JSON.stringify(message);
  console.log(`📡 Broadcasting to channel ${channelName}:`, payload);

  channel.forEach(connectionId => {
    if (connectionId !== excludeConnectionId) {
      const connection = connections.get(connectionId);
      if (connection) {
        // In a real WebSocket implementation, you would send the message here
        console.log(`📤 Would send to connection ${connectionId}:`, payload);
      }
    }
  });
}

function authenticateToken(token: string): { userId: string; tenantId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      userId: decoded.userId || decoded.id,
      tenantId: decoded.tenantId
    };
  } catch (error) {
    console.error('❌ Token authentication failed:', error);
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🔌 WebSocket API called:', req.method, req.url);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req;

  try {
    // Handle WebSocket connection establishment
    if (url?.includes('/websocket/connect') && req.method === 'POST') {
      console.log('🔌 WebSocket connection request');
      
      // Get token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Authorization token required'
        });
      }

      const token = authHeader.substring(7);
      const auth = authenticateToken(token);
      
      if (!auth) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }

      const { deviceId, channels: requestedChannels = [] } = req.body;
      
      // Generate connection ID
      const connectionId = generateConnectionId();
      
      // Create connection record
      const connection: Connection = {
        id: connectionId,
        userId: auth.userId,
        tenantId: auth.tenantId,
        deviceId,
        channels: [],
        lastSeen: new Date()
      };

      // Store connection
      connections.set(connectionId, connection);

      // Subscribe to default channels
      const defaultChannels = [
        `tenant:${auth.tenantId}`, // Tenant-wide broadcasts
        `user:${auth.userId}`, // User-specific messages
      ];

      if (deviceId) {
        defaultChannels.push(`device:${deviceId}`); // Device-specific messages
      }

      // Add requested channels
      const allChannels = [...defaultChannels, ...requestedChannels];
      
      allChannels.forEach(channel => {
        addToChannel(channel, connectionId);
        connection.channels.push(channel);
      });

      console.log(`✅ WebSocket connection established: ${connectionId}`);
      console.log(`📡 Subscribed to channels:`, allChannels);

      // Update device status if deviceId provided
      if (deviceId) {
        try {
          await supabase
            .from('devices')
            .update({
              status: 'online',
              last_seen: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', deviceId)
            .eq('tenant_id', auth.tenantId);

          // Broadcast device status update
          broadcastToChannel(`tenant:${auth.tenantId}`, {
            type: 'device_status',
            data: {
              deviceId,
              status: 'online',
              timestamp: new Date().toISOString()
            }
          });
        } catch (error) {
          console.error('❌ Failed to update device status:', error);
        }
      }

      return res.status(200).json({
        success: true,
        data: {
          connectionId,
          channels: allChannels,
          message: 'WebSocket connection established'
        }
      });
    }

    // Handle WebSocket disconnection
    if (url?.includes('/websocket/disconnect') && req.method === 'POST') {
      console.log('🔌 WebSocket disconnection request');
      
      const { connectionId, deviceId } = req.body;
      
      if (!connectionId) {
        return res.status(400).json({
          success: false,
          message: 'Connection ID required'
        });
      }

      const connection = connections.get(connectionId);
      if (!connection) {
        return res.status(404).json({
          success: false,
          message: 'Connection not found'
        });
      }

      // Remove from all channels
      connection.channels.forEach(channel => {
        removeFromChannel(channel, connectionId);
      });

      // Remove connection
      connections.delete(connectionId);

      // Update device status if deviceId provided
      if (deviceId) {
        try {
          await supabase
            .from('devices')
            .update({
              status: 'offline',
              last_seen: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', deviceId)
            .eq('tenant_id', connection.tenantId);

          // Broadcast device status update
          broadcastToChannel(`tenant:${connection.tenantId}`, {
            type: 'device_status',
            data: {
              deviceId,
              status: 'offline',
              timestamp: new Date().toISOString()
            }
          });
        } catch (error) {
          console.error('❌ Failed to update device status:', error);
        }
      }

      console.log(`✅ WebSocket connection closed: ${connectionId}`);

      return res.status(200).json({
        success: true,
        message: 'WebSocket connection closed'
      });
    }

    // Handle message broadcasting
    if (url?.includes('/websocket/broadcast') && req.method === 'POST') {
      console.log('📡 WebSocket broadcast request');
      
      // Get token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Authorization token required'
        });
      }

      const token = authHeader.substring(7);
      const auth = authenticateToken(token);
      
      if (!auth) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }

      const { type, channel, data, target } = req.body as WebSocketMessage;

      if (!type) {
        return res.status(400).json({
          success: false,
          message: 'Message type required'
        });
      }

      const message = {
        type,
        data,
        timestamp: new Date().toISOString(),
        sender: auth.userId
      };

      let broadcastCount = 0;

      if (target) {
        // Send to specific target
        const targetChannel = target.startsWith('device:') ? target : `user:${target}`;
        broadcastToChannel(targetChannel, message);
        broadcastCount = channels.get(targetChannel)?.size || 0;
      } else if (channel) {
        // Send to specific channel
        broadcastToChannel(channel, message);
        broadcastCount = channels.get(channel)?.size || 0;
      } else {
        // Send to tenant-wide channel
        const tenantChannel = `tenant:${auth.tenantId}`;
        broadcastToChannel(tenantChannel, message);
        broadcastCount = channels.get(tenantChannel)?.size || 0;
      }

      console.log(`✅ Message broadcasted to ${broadcastCount} connections`);

      return res.status(200).json({
        success: true,
        data: {
          message: 'Message broadcasted successfully',
          recipientCount: broadcastCount,
          type,
          timestamp: message.timestamp
        }
      });
    }

    // Handle layout updates
    if (url?.includes('/websocket/layout-update') && req.method === 'POST') {
      console.log('🎨 Layout update broadcast');
      
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Authorization token required'
        });
      }

      const token = authHeader.substring(7);
      const auth = authenticateToken(token);
      
      if (!auth) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }

      const { layoutId, deviceIds, layoutData } = req.body;

      if (!layoutId) {
        return res.status(400).json({
          success: false,
          message: 'Layout ID required'
        });
      }

      const message = {
        type: 'layout_update',
        data: {
          layoutId,
          layoutData,
          timestamp: new Date().toISOString()
        },
        sender: auth.userId
      };

      let broadcastCount = 0;

      if (deviceIds && Array.isArray(deviceIds)) {
        // Send to specific devices
        deviceIds.forEach(deviceId => {
          broadcastToChannel(`device:${deviceId}`, message);
          const deviceChannel = channels.get(`device:${deviceId}`);
          if (deviceChannel) broadcastCount += deviceChannel.size;
        });
      } else {
        // Send to all devices in tenant
        broadcastToChannel(`tenant:${auth.tenantId}`, message);
        broadcastCount = channels.get(`tenant:${auth.tenantId}`)?.size || 0;
      }

      console.log(`✅ Layout update sent to ${broadcastCount} connections`);

      return res.status(200).json({
        success: true,
        data: {
          message: 'Layout update broadcasted successfully',
          layoutId,
          recipientCount: broadcastCount
        }
      });
    }

    // Handle content sync
    if (url?.includes('/websocket/content-sync') && req.method === 'POST') {
      console.log('🔄 Content sync broadcast');
      
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Authorization token required'
        });
      }

      const token = authHeader.substring(7);
      const auth = authenticateToken(token);
      
      if (!auth) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }

      const { contentType, contentId, action, data } = req.body;

      if (!contentType || !action) {
        return res.status(400).json({
          success: false,
          message: 'Content type and action required'
        });
      }

      const message = {
        type: 'content_sync',
        data: {
          contentType,
          contentId,
          action, // 'create', 'update', 'delete'
          data,
          timestamp: new Date().toISOString()
        },
        sender: auth.userId
      };

      // Broadcast to tenant
      broadcastToChannel(`tenant:${auth.tenantId}`, message);
      const broadcastCount = channels.get(`tenant:${auth.tenantId}`)?.size || 0;

      console.log(`✅ Content sync sent to ${broadcastCount} connections`);

      return res.status(200).json({
        success: true,
        data: {
          message: 'Content sync broadcasted successfully',
          contentType,
          action,
          recipientCount: broadcastCount
        }
      });
    }

    // Handle connection status
    if (url?.includes('/websocket/status') && req.method === 'GET') {
      console.log('📊 WebSocket status request');
      
      const activeConnections = Array.from(connections.values()).map(conn => ({
        id: conn.id,
        userId: conn.userId,
        tenantId: conn.tenantId,
        deviceId: conn.deviceId,
        channels: conn.channels,
        lastSeen: conn.lastSeen
      }));

      const channelStats = Array.from(channels.entries()).map(([name, connectionIds]) => ({
        name,
        connectionCount: connectionIds.size
      }));

      return res.status(200).json({
        success: true,
        data: {
          totalConnections: connections.size,
          totalChannels: channels.size,
          connections: activeConnections,
          channels: channelStats
        }
      });
    }

    return res.status(404).json({
      success: false,
      message: 'WebSocket endpoint not found'
    });

  } catch (error) {
    console.error('💥 WebSocket API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}