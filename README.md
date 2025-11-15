# CreatiWall Digital Signage System

A modern digital signage management system built with React, TypeScript, and Node.js.

## Features

- **Device Management**: Monitor and control digital signage displays
- **Media Library**: Upload and organize images, videos, and other content
- **Layout Designer**: Create custom layouts with drag-and-drop interface
- **Playlist Management**: Schedule and organize content playlists
- **Widget System**: Add interactive widgets like weather, RSS feeds, and clocks
- **User Authentication**: Secure login and user management
- **Real-time Updates**: Live content updates across all devices

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Framer Motion for animations
- Zustand for state management
- React Router for navigation

### Backend
- Node.js with Express
- TypeScript
- JWT authentication
- Supabase PostgreSQL database
- File upload handling
- RESTful API design

## Deployment

### Vercel Deployment

This project is configured for deployment on Vercel with the following setup:

1. **Frontend**: Built with Vite and served as static files
2. **Backend**: Deployed as Vercel serverless functions
3. **Database**: Supabase PostgreSQL for production data

#### Environment Variables for Vercel

Set these environment variables in your Vercel dashboard:

```bash
# Frontend
VITE_API_URL=/api

# Backend
NODE_ENV=production
JWT_SECRET=your-jwt-secret-here
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

#### Deployment Steps

1. Connect your repository to Vercel
2. Set the environment variables in Vercel dashboard
3. Deploy - Vercel will automatically build and deploy both frontend and backend

### Database Migration

To migrate from local JSON database to Supabase:

1. Set up a Supabase project
2. Run the SQL schema from `supabase-schema.sql`
3. Use the migration script: `npm run migrate:supabase`

## Getting Started (Development)

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd creatiwall-digital-signage
```

2. Install dependencies:
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

3. Set up environment variables:
```bash
# Copy example environment files
cp .env.example .env
cp server/.env.example server/.env
```

4. Configure your environment variables in the `.env` files.

### Development

Start both frontend and backend in development mode:
```bash
npm run dev:all
```

Or start them separately:
```bash
# Frontend (runs on http://localhost:5173)
npm run dev

# Backend (runs on http://localhost:3001)
npm run dev:backend
```

### Building for Production

```bash
# Build both frontend and backend
npm run build

# Or build separately
npm run build:frontend
npm run build:backend
```

## Project Structure

```
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── contexts/          # React contexts
│   ├── services/          # API services
│   ├── store/             # State management
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── server/                # Backend source code
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   └── db/           # Database utilities
│   ├── data/             # Database files (development)
│   └── uploads/          # Uploaded media files
├── public/               # Static assets
│   └── widgets/          # Widget HTML files
├── dist/                 # Built frontend files
├── vercel.json           # Vercel deployment configuration
└── supabase-schema.sql   # Production database schema
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Devices
- `GET /api/devices` - List all devices
- `POST /api/devices` - Create new device
- `GET /api/devices/:id` - Get device by ID
- `PUT /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Delete device

### Media
- `GET /api/media` - List all media items
- `POST /api/media/upload` - Upload media file
- `GET /api/media/:id` - Get media item by ID
- `PUT /api/media/:id` - Update media item
- `DELETE /api/media/:id` - Delete media item

### Layouts
- `GET /api/layouts` - List all layouts
- `POST /api/layouts` - Create new layout
- `GET /api/layouts/:id` - Get layout by ID
- `PUT /api/layouts/:id` - Update layout
- `DELETE /api/layouts/:id` - Delete layout

### Playlists
- `GET /api/playlists` - List all playlists
- `POST /api/playlists` - Create new playlist
- `GET /api/playlists/:id` - Get playlist by ID
- `PUT /api/playlists/:id` - Update playlist
- `DELETE /api/playlists/:id` - Delete playlist

### Schedules
- `GET /api/schedules` - List all schedules
- `POST /api/schedules` - Create new schedule
- `GET /api/schedules/:id` - Get schedule by ID
- `PUT /api/schedules/:id` - Update schedule
- `DELETE /api/schedules/:id` - Delete schedule

### Widgets
- `GET /api/widgets/templates` - List widget templates
- `GET /api/widgets/instances` - List widget instances
- `POST /api/widgets/instances` - Create widget instance
- `PUT /api/widgets/instances/:id` - Update widget instance
- `DELETE /api/widgets/instances/:id` - Delete widget instance

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
