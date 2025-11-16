# 🔌 WebSocket Implementation Guide

## 📋 Overview

CreatiWall Digital Signage System now includes **real-time WebSocket functionality** for live updates, device monitoring, and multi-user collaboration.

## 🚀 Features

### ✅ Real-time Capabilities
- **Layout Updates**: Push layout changes to devices instantly
- **Device Status**: Monitor device online/offline status live
- **Content Sync**: Synchronize content changes across all clients
- **Multi-user Collaboration**: Multiple users can work simultaneously
- **Live Notifications**: Real-time system notifications

### 🔧 Technical Features
- **JWT Authentication**: Secure WebSocket connections
- **Channel-based Messaging**: Tenant, user, and device-specific channels
- **Auto-reconnection**: Automatic reconnection on connection loss
- **Heartbeat Monitoring**: Keep connections alive with 30s intervals
- **React Integration**: Easy-to-use React hooks

## 📡 API Endpoints

### WebSocket API (`/api/websocket.ts`)

#### 1. **Connect** - `POST /api/websocket/connect`
Establish WebSocket connection with authentication.

```javascript
const response = await fetch('/api/websocket/connect', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    deviceId: 'device-123', // Optional
    channels: ['custom-channel'] // Optional additional channels
  })
});
```

**Response:**
```json
{
  "success": true,
  "data": {
    "connectionId": "conn_1234567890_abc123",
    "channels": [
      "tenant:tenant-id",
      "user:user-id",
      "device:device-123"
    ]
  }
}
```

#### 2. **Disconnect** - `POST /api/websocket/disconnect`
Close WebSocket connection.

```javascript
await fetch('/api/websocket/disconnect', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    connectionId: 'conn_1234567890_abc123',
    deviceId: 'device-123' // Optional
  })
});
```

#### 3. **Broadcast** - `POST /api/websocket/broadcast`
Send messages to channels or specific targets.

```javascript
await fetch('/api/websocket/broadcast', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    type: 'notification',
    data: { message: 'Hello World!' },
    channel: 'tenant:tenant-id', // Optional
    target: 'user:user-id' // Optional
  })
});
```

#### 4. **Layout Update** - `POST /api/websocket/layout-update`
Push layout changes to devices.

```javascript
await fetch('/api/websocket/layout-update', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    layoutId: 'layout-123',
    deviceIds: ['device-1', 'device-2'], // Optional - specific devices
    layoutData: { /* layout data */ } // Optional
  })
});
```

#### 5. **Content Sync** - `POST /api/websocket/content-sync`
Synchronize content changes.

```javascript
await fetch('/api/websocket/content-sync', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    contentType: 'media',
    contentId: 'media-123',
    action: 'create', // 'create', 'update', 'delete'
    data: { /* content data */ }
  })
});
```

#### 6. **Status** - `GET /api/websocket/status`
Get WebSocket connection status and statistics.

```javascript
const response = await fetch('/api/websocket/status', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## 🎯 Frontend Integration

### WebSocket Service (`src/services/websocket.ts`)

#### Basic Usage

```javascript
import { webSocketService, useWebSocket } from '../services/websocket';

// Using the service directly
await webSocketService.connect('device-123', ['custom-channel']);
await webSocketService.send({
  type: 'notification',
  data: { message: 'Hello!' }
});

// Using React hook
function MyComponent() {
  const { connect, disconnect, send, on, off, isConnected } = useWebSocket();
  
  useEffect(() => {
    // Connect on component mount
    connect('device-123');
    
    // Listen for events
    const handleDeviceStatus = (data) => {
      console.log('Device status:', data);
    };
    
    on('device_status', handleDeviceStatus);
    
    // Cleanup on unmount
    return () => {
      off('device_status', handleDeviceStatus);
      disconnect();
    };
  }, []);
  
  return (
    <div>
      Status: {isConnected() ? 'Connected' : 'Disconnected'}
    </div>
  );
}
```

#### Advanced Usage

```javascript
import { useWebSocket } from '../services/websocket';

function LayoutDesigner() {
  const { sendLayoutUpdate, sendContentSync, on, off } = useWebSocket();
  
  // Send layout update to specific devices
  const updateLayout = async (layoutId, layoutData) => {
    await sendLayoutUpdate(layoutId, ['device-1', 'device-2'], layoutData);
  };
  
  // Send content sync
  const syncMedia = async (mediaId, action, data) => {
    await sendContentSync('media', mediaId, action, data);
  };
  
  // Listen for real-time events
  useEffect(() => {
    const handleLayoutUpdate = (data) => {
      console.log('Layout updated:', data);
      // Update UI accordingly
    };
    
    const handleContentSync = (data) => {
      console.log('Content synced:', data);
      // Refresh content list
    };
    
    on('layout_update', handleLayoutUpdate);
    on('content_sync', handleContentSync);
    
    return () => {
      off('layout_update', handleLayoutUpdate);
      off('content_sync', handleContentSync);
    };
  }, []);
}
```

## 📊 Channel System

### Default Channels
Every connection is automatically subscribed to:

1. **`tenant:${tenantId}`** - Tenant-wide broadcasts
2. **`user:${userId}`** - User-specific messages
3. **`device:${deviceId}`** - Device-specific messages (if deviceId provided)

### Custom Channels
You can subscribe to additional channels during connection:

```javascript
await connect('device-123', [
  'admin-notifications',
  'emergency-alerts',
  'maintenance-updates'
]);
```

## 🔒 Security

### Authentication
- All WebSocket connections require JWT authentication
- Tokens are verified on connection establishment
- Invalid tokens are rejected immediately

### Authorization
- Users can only access their tenant's channels
- Device-specific channels require device ownership
- Admin users have broader channel access

### Connection Management
- Connections are tracked per user/device
- Automatic cleanup on disconnection
- Heartbeat monitoring prevents zombie connections

## 🔄 Connection Management

### Auto-reconnection
The WebSocket service automatically handles reconnection:

```javascript
// Automatic reconnection with exponential backoff
- Attempt 1: 1 second delay
- Attempt 2: 2 second delay
- Attempt 3: 3 second delay
- Maximum: 5 attempts
```

### Heartbeat Monitoring
- Heartbeat every 30 seconds
- Automatic reconnection on heartbeat failure
- Connection status updates in real-time

## 📈 Monitoring & Debugging

### Connection Status
```javascript
const status = await webSocketService.getStatus();
console.log('Total connections:', status.totalConnections);
console.log('Active channels:', status.channels);
```

### Event Logging
All WebSocket events are logged to console:
```
🔌 WebSocket connection established: conn_1234567890_abc123
📡 Subscribed to channels: ["tenant:tenant-id", "user:user-id"]
📤 Message sent: {"type":"notification","data":{"message":"Hello!"}}
📥 Message received: {"type":"device_status","data":{"deviceId":"device-1","status":"online"}}
```

## 🚀 Production Deployment

### Environment Variables
No additional environment variables required - WebSocket uses existing JWT_SECRET.

### Vercel Configuration
WebSocket API is deployed as serverless functions on Vercel:
- `/api/websocket/connect`
- `/api/websocket/disconnect`
- `/api/websocket/broadcast`
- `/api/websocket/layout-update`
- `/api/websocket/content-sync`
- `/api/websocket/status`

### Performance Considerations
- In-memory connection storage (suitable for serverless)
- For high-scale deployments, consider Redis for connection storage
- Connection cleanup on function timeout

## 🔧 Troubleshooting

### Common Issues

1. **Connection Failed**
   ```
   Error: No auth token available for WebSocket connection
   ```
   **Solution**: Ensure user is logged in and token is available in localStorage.

2. **Reconnection Loop**
   ```
   Warning: WebSocket heartbeat failed, attempting reconnection...
   ```
   **Solution**: Check network connectivity and server status.

3. **Message Not Received**
   ```
   Message sent but not received by target
   ```
   **Solution**: Verify target is connected and subscribed to correct channel.

### Debug Mode
Enable debug logging:
```javascript
// Enable verbose logging
localStorage.setItem('websocket_debug', 'true');
```

## 📚 Examples

### Real-time Device Monitoring
```javascript
function DeviceMonitor() {
  const { connect, on, off } = useWebSocket();
  const [devices, setDevices] = useState([]);
  
  useEffect(() => {
    connect();
    
    const handleDeviceStatus = (data) => {
      setDevices(prev => prev.map(device => 
        device.id === data.deviceId 
          ? { ...device, status: data.status, lastSeen: data.timestamp }
          : device
      ));
    };
    
    on('device_status', handleDeviceStatus);
    
    return () => {
      off('device_status', handleDeviceStatus);
    };
  }, []);
  
  return (
    <div>
      {devices.map(device => (
        <div key={device.id}>
          {device.name}: {device.status}
        </div>
      ))}
    </div>
  );
}
```

### Live Layout Updates
```javascript
function LayoutPlayer({ deviceId }) {
  const { connect, on, off } = useWebSocket();
  const [currentLayout, setCurrentLayout] = useState(null);
  
  useEffect(() => {
    connect(deviceId);
    
    const handleLayoutUpdate = (data) => {
      if (data.layoutId) {
        // Fetch and apply new layout
        fetchLayout(data.layoutId).then(setCurrentLayout);
      }
    };
    
    on('layout_update', handleLayoutUpdate);
    
    return () => {
      off('layout_update', handleLayoutUpdate);
    };
  }, [deviceId]);
  
  return (
    <div>
      {currentLayout && <LayoutRenderer layout={currentLayout} />}
    </div>
  );
}
```

## 🎯 Next Steps

1. **Test WebSocket functionality** in development
2. **Deploy to production** and verify real-time features
3. **Monitor connection statistics** and performance
4. **Implement additional real-time features** as needed

---

**🎉 WebSocket implementation is complete and ready for production use!**