
export interface WebSocketMessage {
  type: 'subscribe' | 'unsubscribe' | 'broadcast' | 'device_status' | 'layout_update' | 'content_sync' | 'notification';
  channel?: string;
  data?: any;
  target?: string;
  timestamp?: string;
  sender?: string;
}

export interface WebSocketConnection {
  id: string;
  channels: string[];
  isConnected: boolean;
}

class WebSocketService {
  private baseUrl: string;
  private connection: WebSocketConnection | null = null;
  private token: string | null = null;
  private eventListeners: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || '/api';
  }

  // Initialize WebSocket connection
  async connect(deviceId?: string, channels: string[] = []): Promise<boolean> {
    try {
      // Get auth token from localStorage
      this.token = localStorage.getItem('auth_token');

      if (!this.token) {
        console.error('❌ No auth token available for WebSocket connection');
        return false;
      }

      console.log('🔌 Establishing WebSocket connection...');

      // Call connect endpoint
      const response = await fetch(`${this.baseUrl}/websocket/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          deviceId,
          channels
        })
      });

      if (!response.ok) {
        throw new Error(`WebSocket connection failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        this.connection = {
          id: result.data.connectionId,
          channels: result.data.channels,
          isConnected: true
        };

        console.log('✅ WebSocket connection established:', this.connection.id);
        console.log('📡 Subscribed to channels:', this.connection.channels);

        // Start heartbeat to keep connection alive
        this.startHeartbeat();

        // Reset reconnect attempts on successful connection
        this.reconnectAttempts = 0;

        // Simulate receiving messages (in real WebSocket, this would be actual message handling)
        this.simulateMessageHandling();

        return true;
      } else {
        throw new Error(result.message || 'WebSocket connection failed');
      }

    } catch (error) {
      console.error('💥 WebSocket connection error:', error);
      
      // Attempt reconnection
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(`🔄 Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`);
        
        setTimeout(() => {
          this.connect(deviceId, channels);
        }, this.reconnectDelay * this.reconnectAttempts);
      }

      return false;
    }
  }

  // Disconnect WebSocket
  async disconnect(): Promise<void> {
    try {
      if (!this.connection || !this.token) {
        return;
      }

      console.log('🔌 Disconnecting WebSocket...');

      // Stop heartbeat
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }

      // Call disconnect endpoint
      await fetch(`${this.baseUrl}/websocket/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          connectionId: this.connection.id
        })
      });

      this.connection = null;
      console.log('✅ WebSocket disconnected');

    } catch (error) {
      console.error('💥 WebSocket disconnect error:', error);
    }
  }

  // Send message/broadcast
  async send(message: WebSocketMessage): Promise<boolean> {
    try {
      if (!this.connection || !this.token) {
        console.error('❌ WebSocket not connected');
        return false;
      }

      const response = await fetch(`${this.baseUrl}/websocket/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify(message)
      });

      if (!response.ok) {
        throw new Error(`Message send failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('📤 Message sent:', result);

      return result.success;

    } catch (error) {
      console.error('💥 Message send error:', error);
      return false;
    }
  }

  // Send layout update
  async sendLayoutUpdate(layoutId: string, deviceIds?: string[], layoutData?: any): Promise<boolean> {
    try {
      if (!this.connection || !this.token) {
        console.error('❌ WebSocket not connected');
        return false;
      }

      const response = await fetch(`${this.baseUrl}/websocket/layout-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          layoutId,
          deviceIds,
          layoutData
        })
      });

      if (!response.ok) {
        throw new Error(`Layout update failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('🎨 Layout update sent:', result);

      return result.success;

    } catch (error) {
      console.error('💥 Layout update error:', error);
      return false;
    }
  }

  // Send content sync
  async sendContentSync(contentType: string, contentId: string, action: 'create' | 'update' | 'delete', data?: any): Promise<boolean> {
    try {
      if (!this.connection || !this.token) {
        console.error('❌ WebSocket not connected');
        return false;
      }

      const response = await fetch(`${this.baseUrl}/websocket/content-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          contentType,
          contentId,
          action,
          data
        })
      });

      if (!response.ok) {
        throw new Error(`Content sync failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('🔄 Content sync sent:', result);

      return result.success;

    } catch (error) {
      console.error('💥 Content sync error:', error);
      return false;
    }
  }

  // Event listeners
  on(eventType: string, callback: (data: any) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(callback);
  }

  off(eventType: string, callback: (data: any) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  // Emit event to listeners
  private emit(eventType: string, data: any): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('💥 Event listener error:', error);
        }
      });
    }
  }

  // Start heartbeat to keep connection alive
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(async () => {
      try {
        if (!this.connection || !this.token) return;

        // Check connection status
        const response = await fetch(`${this.baseUrl}/websocket/status`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        });

        if (!response.ok) {
          console.warn('⚠️ WebSocket heartbeat failed, attempting reconnection...');
          this.connection.isConnected = false;
          this.connect();
        }

      } catch (error) {
        console.error('💥 Heartbeat error:', error);
        this.connection!.isConnected = false;
      }
    }, 30000); // 30 seconds
  }

  // Simulate message handling (in real WebSocket, this would be actual message reception)
  private simulateMessageHandling(): void {
    // This is a simulation - in a real WebSocket implementation,
    // messages would be received through the WebSocket connection
    
    // For demo purposes, we'll simulate some events
    setTimeout(() => {
      this.emit('device_status', {
        type: 'device_status',
        data: {
          deviceId: 'demo-device-1',
          status: 'online',
          timestamp: new Date().toISOString()
        }
      });
    }, 5000);

    setTimeout(() => {
      this.emit('layout_update', {
        type: 'layout_update',
        data: {
          layoutId: 'demo-layout-1',
          timestamp: new Date().toISOString()
        }
      });
    }, 10000);
  }

  // Get connection status
  isConnected(): boolean {
    return this.connection?.isConnected || false;
  }

  // Get connection info
  getConnection(): WebSocketConnection | null {
    return this.connection;
  }

  // Get WebSocket status
  async getStatus(): Promise<any> {
    try {
      if (!this.token) {
        return null;
      }

      const response = await fetch(`${this.baseUrl}/websocket/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Status request failed: ${response.status}`);
      }

      const result = await response.json();
      return result.data;

    } catch (error) {
      console.error('💥 Status request error:', error);
      return null;
    }
  }
}

// Create singleton instance
export const webSocketService = new WebSocketService();

// React hook for WebSocket
export function useWebSocket() {
  const connect = (deviceId?: string, channels?: string[]) => {
    return webSocketService.connect(deviceId, channels);
  };

  const disconnect = () => {
    return webSocketService.disconnect();
  };

  const send = (message: WebSocketMessage) => {
    return webSocketService.send(message);
  };

  const sendLayoutUpdate = (layoutId: string, deviceIds?: string[], layoutData?: any) => {
    return webSocketService.sendLayoutUpdate(layoutId, deviceIds, layoutData);
  };

  const sendContentSync = (contentType: string, contentId: string, action: 'create' | 'update' | 'delete', data?: any) => {
    return webSocketService.sendContentSync(contentType, contentId, action, data);
  };

  const on = (eventType: string, callback: (data: any) => void) => {
    webSocketService.on(eventType, callback);
  };

  const off = (eventType: string, callback: (data: any) => void) => {
    webSocketService.off(eventType, callback);
  };

  const isConnected = () => {
    return webSocketService.isConnected();
  };

  const getConnection = () => {
    return webSocketService.getConnection();
  };

  const getStatus = () => {
    return webSocketService.getStatus();
  };

  return {
    connect,
    disconnect,
    send,
    sendLayoutUpdate,
    sendContentSync,
    on,
    off,
    isConnected,
    getConnection,
    getStatus
  };
}

export default webSocketService;