// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Device Types
export interface DeviceData {
  id?: string;
  name: string;
  location: string;
  resolution: string;
  orientation: 'landscape' | 'portrait';
  status: 'online' | 'offline' | 'maintenance';
  lastSeen?: Date | string;
  currentPlaylistId?: string;
  groupName?: string;
}

// Media Types
export interface MediaData {
  id?: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'html' | 'web' | 'pdf' | 'rss';
  size: number;
  duration?: number;
  url: string;
  tags: string[];
  category?: string;
  thumbnail?: string;
  createdAt?: Date | string;
}

// Layout Types
export interface LayoutData {
  id?: string;
  name: string;
  description?: string;
  thumbnail?: string | null;
  dimensions: { width: number; height: number };
  zones: ZoneData[];
  createdAt?: Date | string;
  template?: string;
  category?: string;
  orientation?: 'landscape' | 'portrait';
  backgroundColor?: string;
  preset?: string;
}

export interface ZoneData {
  id: string;
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
  style?: Record<string, string | number>;
}

// Playlist Types
export interface PlaylistData {
  id?: string;
  name: string;
  description?: string;
  items: PlaylistItemData[];
  duration: number;
  loop: boolean;
  shuffle?: boolean;
  priority?: number;
  createdAt?: Date | string;
}

export interface PlaylistItemData {
  id: string;
  mediaId: string;
  duration: number;
  order: number;
  transition?: 'fade' | 'slide' | 'cut' | 'zoom';
  transitionDuration?: number;
  volume?: boolean;
  repeat?: number;
}

// Schedule Types
export interface ScheduleData {
  id?: string;
  name: string;
  playlistId: string;
  deviceIds: string[];
  startDate: Date | string;
  endDate: Date | string;
  startTime: string;
  endTime: string;
  days: string[];
  priority: number;
  active: boolean;
}

// Widget Types
export interface WidgetTemplateData {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'time' | 'weather' | 'social' | 'data' | 'interactive' | 'custom';
  thumbnail?: string;
  version: string;
  author: string;
  configSchema: WidgetConfigFieldData[];
  defaultConfig: Record<string, unknown>;
  htmlUrl: string;
  previewUrl?: string;
  requirements?: string[];
  isPremium?: boolean;
}

export interface WidgetConfigFieldData {
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

export interface WidgetInstanceData {
  id?: string;
  templateId: string;
  name: string;
  config: Record<string, unknown>;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  template?: WidgetTemplateData;
}

// Auth Types
export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  companyDomain?: string;
}

export interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
  preferences?: {
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      browser: boolean;
      mobile: boolean;
    };
  };
}

export interface TenantData {
  id: string;
  name: string;
  domain: string;
  plan: string;
  status: string;
  branding?: {
    logo: string | null;
    primaryColor: string;
    secondaryColor: string;
  };
}

// Form Event Types
export type FormSubmitEvent = React.FormEvent<HTMLFormElement>;
export type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;
export type SelectChangeEvent = React.ChangeEvent<HTMLSelectElement>;
export type TextareaChangeEvent = React.ChangeEvent<HTMLTextAreaElement>;

// Generic Types
export type RequestHandler<T = unknown> = (data?: T) => Promise<void>;
export type ErrorHandler = (error: Error) => void;
export type LoadingState = Record<string, boolean>;