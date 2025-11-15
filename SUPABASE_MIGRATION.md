# 🚀 CreatiWall Supabase Migration Guide

## 📋 Prerequisites

1. **Supabase Account**: Create account at [supabase.com](https://supabase.com)
2. **Node.js 18+**: Ensure you have Node.js installed
3. **Backup**: Your current JSON database is backed up

## 🔧 Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Choose organization and enter project details:
   - **Name**: `creatiwall-production`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
4. Wait for project to be created (~2 minutes)

## 🗄️ Step 2: Setup Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the entire content from [`supabase-schema.sql`](supabase-schema.sql)
3. Paste it in the SQL Editor
4. **Important**: Replace `'your-jwt-secret-here'` with your actual JWT secret
5. Click **Run** to execute the schema
6. Verify all tables are created in the **Table Editor**

## 🔑 Step 3: Get Supabase Credentials

From your Supabase project dashboard, go to **Settings > API**:

```bash
# Copy these values:
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## ⚙️ Step 4: Configure Environment Variables

Update your environment files:

### `server/.env`
```bash
# Add these Supabase variables
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Keep existing variables
NODE_ENV=development
JWT_SECRET=your-jwt-secret-here
OPENWEATHER_API_KEY=your-api-key
```

### `server/.env.production`
```bash
# Add these Supabase variables
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Keep existing variables
NODE_ENV=production
JWT_SECRET=your-jwt-secret-here
OPENWEATHER_API_KEY=your-api-key
```

## 📦 Step 5: Run Migration

1. **Install dependencies** (already done):
   ```bash
   cd server
   npm install @supabase/supabase-js
   ```

2. **Run migration script**:
   ```bash
   cd server
   npm run migrate:supabase
   ```

3. **Verify migration**:
   - Check Supabase dashboard **Table Editor**
   - Verify data is migrated correctly
   - Test a few API endpoints

## 🔄 Step 6: Update Database Layer

The migration includes a new database layer that automatically switches between JSON and Supabase based on environment variables.

### Automatic Detection
- If `SUPABASE_URL` is set → Uses Supabase
- If not set → Falls back to JSON database

### No Code Changes Required
Your existing API routes will work without modification!

## 🎯 Step 7: File Storage Migration

### Option A: Supabase Storage (Recommended)
1. Go to **Storage** in Supabase dashboard
2. Create bucket named `media-files`
3. Set bucket to **Public**
4. Upload existing files from `server/uploads/`

### Option B: Keep Local Storage
- Files will continue to work from `server/uploads/`
- Consider using CDN for better performance

## 🧪 Step 8: Testing

### Test Authentication
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.com","password":"admin123"}'
```

### Test Media API
```bash
curl -X GET http://localhost:3001/api/media \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test Layouts API
```bash
curl -X GET http://localhost:3001/api/layouts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🚀 Step 9: Deploy to Production

### Vercel Deployment
1. **Set Environment Variables** in Vercel dashboard:
   ```bash
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   JWT_SECRET=your-jwt-secret
   OPENWEATHER_API_KEY=your-api-key
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

### Other Platforms
- Set the same environment variables
- Deploy as usual

## 🔒 Step 10: Security Configuration

### Row Level Security (RLS)
- ✅ Already configured in schema
- ✅ Multi-tenant isolation enabled
- ✅ Users can only access their tenant's data

### API Security
- ✅ JWT authentication maintained
- ✅ CORS protection enabled
- ✅ Rate limiting active

## 📊 Benefits After Migration

### Performance
- **Faster queries** with PostgreSQL indexes
- **Concurrent access** without file locking
- **Real-time updates** with Supabase subscriptions

### Scalability
- **Unlimited concurrent users**
- **Auto-scaling database**
- **Built-in backup and recovery**

### Features
- **Real-time collaboration** on layouts
- **Advanced querying** with SQL
- **Built-in authentication** (optional)
- **File storage** with CDN

## 🔧 Troubleshooting

### Migration Fails
1. Check Supabase credentials are correct
2. Verify schema was applied successfully
3. Check network connectivity
4. Review error logs

### API Errors After Migration
1. Verify environment variables are set
2. Check Supabase project is active
3. Test database connection
4. Review RLS policies

### Performance Issues
1. Check database indexes
2. Monitor Supabase dashboard
3. Optimize queries if needed
4. Consider connection pooling

## 🔄 Rollback Plan

If you need to rollback to JSON database:

1. **Remove Supabase environment variables**:
   ```bash
   # Comment out or remove these:
   # SUPABASE_URL=...
   # SUPABASE_ANON_KEY=...
   # SUPABASE_SERVICE_ROLE_KEY=...
   ```

2. **Restart server**:
   ```bash
   npm restart
   ```

3. **System automatically falls back to JSON database**

## 📞 Support

### Common Issues
- **Connection errors**: Check credentials and network
- **Permission errors**: Verify RLS policies
- **Migration errors**: Check data format and constraints

### Resources
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [CreatiWall GitHub Issues](https://github.com/your-repo/issues)

---

**🎉 Congratulations!** Your CreatiWall system is now powered by Supabase PostgreSQL with enterprise-grade features, scalability, and performance.