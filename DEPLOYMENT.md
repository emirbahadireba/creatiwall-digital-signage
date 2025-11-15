# CreatiWall Digital Signage System - Deployment Guide

## 🚀 Production Deployment

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Vercel account (for deployment)
- OpenWeather API key (for weather widget)

### Environment Variables

Set these in your Vercel dashboard or hosting provider:

```bash
# Required
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-secret-key-change-this-in-production-2024
OPENWEATHER_API_KEY=your-openweather-api-key-here

# Optional (with defaults)
PORT=3001
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-domain.vercel.app
BCRYPT_ROUNDS=12
```

### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add JWT_SECRET
   vercel env add OPENWEATHER_API_KEY
   ```

### Manual Deployment

1. **Build Frontend**
   ```bash
   npm run build
   ```

2. **Build Backend**
   ```bash
   cd server && npm run build
   ```

3. **Start Production Server**
   ```bash
   cd server && npm start
   ```

## 🔧 Configuration

### CORS Settings
Update `CORS_ORIGIN` environment variable with your domain:
```bash
CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com
```

### Database
- Uses JSON file database (`server/data/database.json`)
- Automatically creates demo data on first run
- For production, consider migrating to PostgreSQL/MongoDB

### File Uploads
- Stored in `server/uploads/` directory
- Max file size: 50MB (configurable)
- Supported formats: JPG, PNG, MP4, MOV

## 🎯 Features

### ✅ Completed Features
- **Authentication System**: JWT-based auth with bcrypt password hashing
- **Multi-tenant Architecture**: Isolated data per organization
- **Media Management**: Upload, organize, and manage media files
- **Layout Designer**: Drag-and-drop layout creation with zones
- **Device Management**: Remote device control and monitoring
- **Widget System**: Clock, Weather, RSS feed widgets
- **Playlist Management**: Schedule content playback
- **User Management**: Role-based access control
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live content synchronization
- **Security**: CORS, rate limiting, input validation
- **TypeScript**: Full type safety across frontend and backend

### 🎮 Player Features
- **Standalone Player**: Independent HTML player (`/player.html`)
- **Kiosk Mode**: Full-screen digital signage display
- **Auto-scaling**: Responsive to different screen sizes
- **Widget Support**: Embedded clock, weather, RSS widgets
- **Media Playback**: Images, videos with auto-loop
- **Real-time Sync**: Updates content without refresh

## 🔒 Security Features

- JWT authentication with secure tokens
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- Secure file upload handling

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Media Management
- `GET /api/media` - List media files
- `POST /api/media/upload` - Upload media
- `DELETE /api/media/:id` - Delete media

### Layout Management
- `GET /api/layouts` - List layouts
- `POST /api/layouts` - Create layout
- `PUT /api/layouts/:id` - Update layout
- `DELETE /api/layouts/:id` - Delete layout

### Device Management
- `GET /api/devices` - List devices
- `POST /api/devices` - Register device
- `PUT /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Remove device

### Widget System
- `GET /api/widgets/templates` - List widget templates
- `GET /api/widgets/instances` - List widget instances
- `POST /api/widgets/instances` - Create widget instance

## 🎨 Widget Development

### Creating Custom Widgets

1. **Create HTML file** in `public/widgets/`
2. **Add widget template** to database
3. **Configure widget schema** for settings
4. **Test in layout designer**

### Widget Configuration Schema
```json
{
  "key": "textColor",
  "label": "Text Color",
  "type": "color",
  "default": "#ffffff",
  "required": false,
  "description": "Widget text color"
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Errors**
   - Ensure all TypeScript errors are resolved
   - Check environment variables are set
   - Verify all dependencies are installed

2. **CORS Errors**
   - Update `CORS_ORIGIN` environment variable
   - Check frontend API base URL configuration

3. **File Upload Issues**
   - Verify upload directory permissions
   - Check file size limits
   - Ensure supported file formats

4. **Widget Loading Issues**
   - Check widget HTML files exist
   - Verify widget configuration
   - Check browser console for errors

### Performance Optimization

- Enable gzip compression
- Use CDN for static assets
- Optimize images before upload
- Monitor memory usage for large files

## 📊 Monitoring

### Health Checks
- `GET /api/health` - Server health status
- Monitor database file size
- Check upload directory space
- Monitor memory usage

### Logging
- Server logs available in console
- Error tracking for production
- User activity audit logs

## 🔄 Updates

### Updating the System
1. Pull latest changes
2. Install dependencies: `npm install`
3. Build frontend: `npm run build`
4. Build backend: `cd server && npm run build`
5. Restart server

### Database Migration
- Backup `server/data/database.json`
- Update schema if needed
- Test with sample data

## 📞 Support

For issues and questions:
- Check troubleshooting section
- Review server logs
- Test in development mode first
- Verify environment variables

---

**CreatiWall Digital Signage System v1.0.0**
Built with React, TypeScript, Node.js, and Express