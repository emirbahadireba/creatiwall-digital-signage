import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'database.json');

export interface Device {
  id: string;
  tenantId: string;
  name: string;
  location: string;
  resolution: string;
  orientation: 'landscape' | 'portrait';
  status: 'online' | 'offline' | 'maintenance';
  lastSeen: string;
  currentPlaylistId?: string;
  groupName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaItem {
  id: string;
  tenantId: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'html' | 'web' | 'pdf' | 'rss';
  size: number;
  duration?: number;
  url: string;
  tags: string[];
  category?: string;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Layout {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  thumbnail?: string | null;
  dimensions: { width: number; height: number };
  zones: Zone[];
  createdAt: string;
  updatedAt: string;
  template?: string;
  category?: string;
  orientation?: 'landscape' | 'portrait';
  backgroundColor?: string;
}

export interface Zone {
  id: string;
  layoutId: string;
  name?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'media' | 'text' | 'clock' | 'weather' | 'rss' | 'widgets' | 'playlist';
  content?: string;
  mediaId?: string;
  playlistId?: string;
  widgetInstanceId?: string;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  opacity?: number;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  style?: any;
}

export interface Playlist {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  items: PlaylistItem[];
  duration: number;
  loop: boolean;
  shuffle?: boolean;
  priority?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistItem {
  id: string;
  playlistId: string;
  mediaId: string;
  duration: number;
  order: number;
  orderIndex: number;
  transition?: 'fade' | 'slide' | 'cut' | 'zoom';
  transitionDuration?: number;
  volume?: boolean;
  repeat?: number;
}

export interface Schedule {
  id: string;
  tenantId: string;
  name: string;
  playlistId: string;
  deviceIds: string[];
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  days: string[];
  priority: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WidgetTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'time' | 'weather' | 'social' | 'data' | 'interactive' | 'custom';
  thumbnail?: string;
  version: string;
  author: string;
  configSchema: WidgetConfigField[];
  defaultConfig: Record<string, unknown>;
  htmlUrl: string;
  previewUrl?: string;
  requirements?: string[];
  isPremium?: boolean;
}

export interface WidgetConfigField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'color' | 'toggle' | 'url' | 'textarea';
  default?: unknown;
  options?: { label: string; value: unknown }[];
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  description?: string;
}

export interface WidgetInstance {
  id: string;
  templateId: string;
  name: string;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  subdomain?: string;
  plan: string;
  status: string;
  settings?: any;
  branding?: {
    logo: string | null;
    primaryColor: string;
    secondaryColor: string;
  };
}

export interface User {
  id: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
  status: string;
  loginAttempts?: number;
  lockedUntil?: string | null;
  lastLogin?: string;
  preferences?: any;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  lastActivity?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  createdAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface Database {
  devices: Device[];
  media: MediaItem[];
  mediaItems: MediaItem[];
  layouts: Layout[];
  playlists: Playlist[];
  playlistItems: PlaylistItem[];
  schedules: Schedule[];
  scheduleDevices: any[];
  widgetTemplates: WidgetTemplate[];
  widgetInstances: WidgetInstance[];
  tenants: Tenant[];
  users: User[];
  userSessions: UserSession[];
  auditLogs: AuditLog[];
  permissions: Permission[];
  rolePermissions: any[];
  zones: Zone[];
}

let database: Database = {
  devices: [],
  media: [],
  mediaItems: [],
  layouts: [],
  playlists: [],
  playlistItems: [],
  schedules: [],
  scheduleDevices: [],
  widgetTemplates: [],
  widgetInstances: [],
  tenants: [],
  users: [],
  userSessions: [],
  auditLogs: [],
  permissions: [],
  rolePermissions: [],
  zones: []
};

// Load database from file
function loadDatabase(): Database {
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf8');
      database = JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading database:', error);
  }
  return database;
}

// Save database to file
function saveDatabase(): void {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(database, null, 2));
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

// Initialize database
loadDatabase();

// Database object with all methods
const db = {
  data: database,
  database,
  loadDatabase,
  saveDatabase,
  write: saveDatabase,
  save: saveDatabase
};

export { database, loadDatabase, saveDatabase, db };
export default db;
