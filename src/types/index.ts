export interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'editor' | 'viewer';
  organization?: string;
  avatar?: string;
}

export interface Device {
  id: string;
  name: string;
  location: string;
  resolution: string;
  orientation: 'landscape' | 'portrait';
  status: 'online' | 'offline';
  lastSync: Date;
  currentPlaylist?: string;
  group?: string;
}

export interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'html' | 'web' | 'pdf' | 'rss';
  url: string;
  duration: number;
  thumbnail?: string;
  category?: string;
  tags: string[];
  size: number;
  createdAt: Date;
}

export interface Layout {
  id: string;
  name: string;
  description: string;
  template: 'fullscreen' | 'split' | 'sidebar' | 'grid';
  zones: Zone[];
  preview?: string;
}

export interface Zone {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'playlist' | 'ticker' | 'clock' | 'weather' | 'widget';
  content?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  items: PlaylistItem[];
  loop: boolean;
  shuffle: boolean;
  priority: number;
  duration: number;
}

export interface PlaylistItem {
  id: string;
  mediaId: string;
  duration: number;
  transition: 'fade' | 'slide' | 'cut' | 'zoom';
  transitionDuration: number;
  volume: boolean;
  repeat: number;
}

export interface Schedule {
  id: string;
  name: string;
  playlistId: string;
  deviceIds: string[];
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  days: string[];
  priority: number;
  active: boolean;
}

export interface Overlay {
  id: string;
  name: string;
  type: 'ticker' | 'logo' | 'clock' | 'weather' | 'qr' | 'announcement';
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  content: string;
  style: Record<string, any>;
}

// Widget System Types
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
  defaultConfig: Record<string, any>;
  htmlUrl: string; // URL to the widget's HTML file
  previewUrl?: string;
  requirements?: string[];
  isPremium?: boolean;
}

export interface WidgetConfigField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'color' | 'toggle' | 'url' | 'textarea';
  default?: any;
  options?: { label: string; value: any }[];
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
  config: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
