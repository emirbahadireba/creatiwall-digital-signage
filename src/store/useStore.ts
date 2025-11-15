import { create } from 'zustand';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export interface Device {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'maintenance';
  resolution: string;
  lastSeen: Date;
  orientation: 'landscape' | 'portrait';
  currentPlaylistId?: string;
  groupName?: string;
}

export interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'html' | 'web' | 'pdf' | 'rss';
  size: number;
  duration?: number;
  uploadDate: Date;
  url: string;
  tags: string[];
  category?: string;
  thumbnail?: string;
}

export interface Layout {
  id: string;
  name: string;
  thumbnail: string | null;
  dimensions: { width: number; height: number };
  zones: Zone[];
  createdAt: Date;
  description?: string;
  template?: string;
  category?: string;
  orientation?: 'landscape' | 'portrait';
}

export interface LayoutPreset {
  width: number;
  height: number;
  name: string;
}

export interface LayoutPresets {
  [key: string]: LayoutPreset;
}

export interface Zone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'media' | 'text' | 'clock' | 'weather' | 'rss' | 'widgets' | 'playlist';
  content?: any;
  mediaId?: string;
  playlistId?: string;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  opacity?: number;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  style?: Record<string, any>;
}

export interface Playlist {
  id: string;
  name: string;
  items: PlaylistItem[];
  duration: number;
  loop: boolean;
  createdAt: Date;
  description?: string;
  shuffle?: boolean;
  priority?: number;
}

export interface PlaylistItem {
  id: string;
  mediaId: string;
  duration: number;
  order: number;
  transition?: 'fade' | 'slide' | 'cut' | 'zoom';
  transitionDuration?: number;
  volume?: boolean;
  repeat?: number;
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

interface StoreState {
  // UI State
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  activeView: string;
  
  // Data
  devices: Device[];
  mediaItems: MediaItem[];
  layouts: Layout[];
  playlists: Playlist[];
  schedules: Schedule[];
  layoutPresets: LayoutPresets;
  layoutCategories: string[];
  
  // Loading states
  loading: {
    devices: boolean;
    media: boolean;
    layouts: boolean;
    playlists: boolean;
    schedules: boolean;
  };
  hasUnsavedLayoutChanges: boolean;
  setHasUnsavedLayoutChanges: (value: boolean) => void;
  triggerLayoutSave: number;
  setTriggerLayoutSave: () => void;
  
  // Actions
  toggleSidebar: () => void;
  toggleTheme: () => void;
  setActiveView: (view: string) => void;
  
  // Data fetching
  fetchDevices: () => Promise<void>;
  fetchMediaItems: () => Promise<void>;
  fetchLayouts: (filters?: { category?: string; orientation?: string; search?: string }) => Promise<any[]>;
  fetchLayoutPresets: () => Promise<void>;
  fetchLayoutCategories: () => Promise<void>;
  fetchPlaylists: () => Promise<void>;
  fetchSchedules: () => Promise<void>;
  fetchAll: () => Promise<void>;
  
  // Device Actions
  addDevice: (device: Omit<Device, 'id'>) => Promise<void>;
  updateDevice: (id: string, updates: Partial<Device>) => Promise<void>;
  deleteDevice: (id: string) => Promise<void>;
  
  // Media Actions
  addMediaItem: (item: Omit<MediaItem, 'id' | 'uploadDate'>) => Promise<void>;
  uploadMediaFile: (file: File, data: { name?: string; type?: string; category?: string; tags?: string[]; thumbnail?: string }) => Promise<any>;
  deleteMediaItem: (id: string) => Promise<void>;
  
  // Layout Actions
  addLayout: (layout: Omit<Layout, 'id' | 'createdAt'> & { preset?: string }) => Promise<void>;
  updateLayout: (id: string, layout: Partial<Layout> & { preset?: string }) => Promise<void>;
  deleteLayout: (id: string) => Promise<void>;
  validateLayoutName: (name: string, excludeId?: string) => boolean;
  
  // Playlist Actions
  addPlaylist: (playlist: Omit<Playlist, 'id' | 'createdAt'>) => Promise<void>;
  updatePlaylist: (id: string, playlist: Partial<Playlist>) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  
  // Schedule Actions
  addSchedule: (schedule: Omit<Schedule, 'id'>) => Promise<void>;
  updateSchedule: (id: string, updates: Partial<Schedule>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  // Initial State
  sidebarCollapsed: false,
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  activeView: 'dashboard',
  
  devices: [],
  mediaItems: [],
  layouts: [],
  playlists: [],
  schedules: [],
  layoutPresets: {},
  layoutCategories: [],
  
  loading: {
    devices: false,
    media: false,
    layouts: false,
    playlists: false,
    schedules: false,
  },
  hasUnsavedLayoutChanges: false,
  setHasUnsavedLayoutChanges: (value: boolean) => set({ hasUnsavedLayoutChanges: value }),
  triggerLayoutSave: 0,
  setTriggerLayoutSave: () => set(state => ({ triggerLayoutSave: state.triggerLayoutSave + 1 })),
  
  // Actions
  toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  toggleTheme: () => set(state => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    return { theme: newTheme };
  }),
  setActiveView: (view: string) => set({ activeView: view }),
  
  // Data fetching
  fetchDevices: async () => {
    set(state => ({ loading: { ...state.loading, devices: true } }));
    try {
      const devices = await api.getDevices();
      set({ devices: devices.map(d => ({ ...d, lastSeen: new Date(d.lastSeen) })) });
    } catch (error: any) {
      toast.error('Cihazlar yüklenirken hata oluştu: ' + error.message);
    } finally {
      set(state => ({ loading: { ...state.loading, devices: false } }));
    }
  },
  
  fetchMediaItems: async () => {
    set(state => ({ loading: { ...state.loading, media: true } }));
    try {
      const mediaItems = await api.getMediaItems();
      set({ mediaItems: mediaItems.map(m => ({ ...m, uploadDate: new Date(m.createdAt) })) });
    } catch (error: any) {
      toast.error('Medya öğeleri yüklenirken hata oluştu: ' + error.message);
    } finally {
      set(state => ({ loading: { ...state.loading, media: false } }));
    }
  },
  
  fetchLayouts: async (filters?: { category?: string; orientation?: string; search?: string }) => {
    set(state => ({ loading: { ...state.loading, layouts: true } }));
    try {
      const params = new URLSearchParams();
      if (filters?.category && filters.category !== 'all') params.append('category', filters.category);
      if (filters?.orientation && filters.orientation !== 'all') params.append('orientation', filters.orientation);
      if (filters?.search && filters.search.trim()) params.append('search', filters.search.trim());
      
      const url = `/api/layouts${params.toString() ? `?${params.toString()}` : ''}`;
      console.log('Store - Fetching layouts from:', url);
      
      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, { headers });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Store - Layout fetch error:', response.status, errorText);
        throw new Error(`Layout fetch failed: HTTP ${response.status} - ${errorText}`);
      }
      
      const layouts = await response.json();
      console.log('Store - Layouts fetched:', layouts.length);
      
      // Ensure layouts have proper date objects and zone arrays
      const processedLayouts = layouts.map((l: any) => ({
        ...l,
        createdAt: new Date(l.createdAt),
        zones: Array.isArray(l.zones) ? l.zones : []
      }));
      
      set({ layouts: processedLayouts });
      return processedLayouts;
    } catch (error: any) {
      console.error('Store - Layout fetch error:', error);
      toast.error('Layout\'lar yüklenirken hata oluştu: ' + error.message);
      // Don't throw error, return empty array to prevent UI crashes
      set({ layouts: [] });
      return [];
    } finally {
      set(state => ({ loading: { ...state.loading, layouts: false } }));
    }
  },

  fetchLayoutPresets: async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/layouts/presets', { headers });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const presets = await response.json();
      set({ layoutPresets: presets });
    } catch (error: any) {
      toast.error('Layout presets yüklenirken hata oluştu: ' + error.message);
    }
  },

  fetchLayoutCategories: async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/layouts/categories', { headers });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const categories = await response.json();
      set({ layoutCategories: categories });
    } catch (error: any) {
      toast.error('Layout kategorileri yüklenirken hata oluştu: ' + error.message);
    }
  },
  
  fetchPlaylists: async () => {
    set(state => ({ loading: { ...state.loading, playlists: true } }));
    try {
      const playlists = await api.getPlaylists();
      set({ playlists: playlists.map(p => ({ ...p, createdAt: new Date(p.createdAt) })) });
    } catch (error: any) {
      toast.error('Playlist\'ler yüklenirken hata oluştu: ' + error.message);
    } finally {
      set(state => ({ loading: { ...state.loading, playlists: false } }));
    }
  },
  
  fetchSchedules: async () => {
    set(state => ({ loading: { ...state.loading, schedules: true } }));
    try {
      const schedules = await api.getSchedules();
      set({ 
        schedules: schedules.map(s => ({ 
          ...s, 
          startDate: new Date(s.startDate),
          endDate: new Date(s.endDate)
        })) 
      });
    } catch (error: any) {
      toast.error('Zamanlamalar yüklenirken hata oluştu: ' + error.message);
    } finally {
      set(state => ({ loading: { ...state.loading, schedules: false } }));
    }
  },
  
  fetchAll: async () => {
    await Promise.all([
      get().fetchDevices(),
      get().fetchMediaItems(),
      get().fetchLayouts(),
      get().fetchPlaylists(),
      get().fetchSchedules(),
    ]);
  },
  
  // Device Actions
  addDevice: async (device) => {
    try {
      const newDevice = await api.createDevice(device);
      set(state => ({ devices: [...state.devices, { ...newDevice, lastSeen: new Date(newDevice.lastSeen) }] }));
      toast.success('Cihaz başarıyla eklendi!');
    } catch (error: any) {
      toast.error('Cihaz eklenirken hata oluştu: ' + error.message);
      throw error;
    }
  },
  
  updateDevice: async (id, updates) => {
    try {
      const updated = await api.updateDevice(id, updates);
      set(state => ({
        devices: state.devices.map(device => 
          device.id === id ? { ...updated, lastSeen: new Date(updated.lastSeen) } : device
        )
      }));
      toast.success('Cihaz güncellendi!');
    } catch (error: any) {
      toast.error('Cihaz güncellenirken hata oluştu: ' + error.message);
      throw error;
    }
  },
  
  deleteDevice: async (id) => {
    try {
      await api.deleteDevice(id);
      set(state => ({ devices: state.devices.filter(device => device.id !== id) }));
      toast.success('Cihaz silindi!');
    } catch (error: any) {
      toast.error('Cihaz silinirken hata oluştu: ' + error.message);
      throw error;
    }
  },
  
  // Media Actions
  addMediaItem: async (item) => {
    try {
      const newItem = await api.createMediaItem(item);
      set(state => ({ 
        mediaItems: [...state.mediaItems, { ...newItem, uploadDate: new Date(newItem.createdAt) }] 
      }));
      toast.success('Medya öğesi eklendi!');
    } catch (error: any) {
      toast.error('Medya öğesi eklenirken hata oluştu: ' + error.message);
      throw error;
    }
  },
  
  uploadMediaFile: async (file, data) => {
    try {
      // Send thumbnail to backend for processing
      const newItem = await api.uploadMedia(file, data);
      const itemWithDate = { ...newItem, uploadDate: new Date(newItem.createdAt) };
      set(state => ({
        mediaItems: [...state.mediaItems, itemWithDate]
      }));
      toast.success('Dosya yüklendi!');
      return itemWithDate; // Return the new item so we can use its ID
    } catch (error: any) {
      toast.error('Dosya yüklenirken hata oluştu: ' + error.message);
      throw error;
    }
  },
  
  deleteMediaItem: async (id) => {
    try {
      await api.deleteMediaItem(id);
      set(state => ({ mediaItems: state.mediaItems.filter(item => item.id !== id) }));
      toast.success('Medya öğesi silindi!');
    } catch (error: any) {
      toast.error('Medya öğesi silinirken hata oluştu: ' + error.message);
      throw error;
    }
  },
  
  // Layout Actions
  addLayout: async (layout) => {
    try {
      // Validate layout data before sending
      if (!layout.name || !layout.name.trim()) {
        throw new Error('Layout ismi gereklidir');
      }
      
      if (!layout.zones || !Array.isArray(layout.zones) || layout.zones.length === 0) {
        throw new Error('En az bir bölge gereklidir');
      }
      
      // Validate zones
      for (const zone of layout.zones) {
        if (!zone.type || !['media', 'text', 'clock', 'weather', 'rss', 'widgets', 'playlist'].includes(zone.type)) {
          throw new Error('Geçersiz bölge türü');
        }
        if (typeof zone.x !== 'number' || typeof zone.y !== 'number' ||
            typeof zone.width !== 'number' || typeof zone.height !== 'number') {
          throw new Error('Bölge boyutları sayısal olmalıdır');
        }
      }
      
      console.log('Store - Adding layout:', layout);
      
      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/layouts', {
        method: 'POST',
        headers,
        body: JSON.stringify(layout)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Store - Add layout error:', response.status, errorData);
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const newLayout = await response.json();
      console.log('Store - Layout added:', newLayout);
      
      set(state => ({
        layouts: [...state.layouts, {
          ...newLayout,
          createdAt: new Date(newLayout.createdAt),
          zones: Array.isArray(newLayout.zones) ? newLayout.zones : []
        }]
      }));
      toast.success('Layout başarıyla eklendi!');
    } catch (error: any) {
      console.error('Store - Add layout error:', error);
      toast.error('Layout eklenirken hata oluştu: ' + error.message);
      throw error;
    }
  },

  updateLayout: async (id, layout) => {
    try {
      // Validate layout data before sending
      if (layout.name && !layout.name.trim()) {
        throw new Error('Layout ismi boş olamaz');
      }
      
      if (layout.zones && Array.isArray(layout.zones)) {
        // Validate zones if provided
        for (const zone of layout.zones) {
          if (!zone.type || !['media', 'text', 'clock', 'weather', 'rss', 'widgets', 'playlist'].includes(zone.type)) {
            throw new Error('Geçersiz bölge türü');
          }
          if (typeof zone.x !== 'number' || typeof zone.y !== 'number' ||
              typeof zone.width !== 'number' || typeof zone.height !== 'number') {
            throw new Error('Bölge boyutları sayısal olmalıdır');
          }
        }
      }
      
      console.log('Store - Updating layout:', id, layout);
      
      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/layouts/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(layout)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Store - Update layout error:', response.status, errorData);
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const updated = await response.json();
      console.log('Store - Layout updated:', updated);
      
      set(state => ({
        layouts: state.layouts.map(l =>
          l.id === id ? {
            ...updated,
            createdAt: new Date(updated.createdAt),
            zones: Array.isArray(updated.zones) ? updated.zones : []
          } : l
        )
      }));
      toast.success('Layout başarıyla güncellendi!');
    } catch (error: any) {
      console.error('Store - Update layout error:', error);
      toast.error('Layout güncellenirken hata oluştu: ' + error.message);
      throw error;
    }
  },

  deleteLayout: async (id) => {
    try {
      if (!id || typeof id !== 'string') {
        throw new Error('Geçersiz layout ID');
      }
      
      console.log('Store - Deleting layout:', id);
      
      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/layouts/${id}`, {
        method: 'DELETE',
        headers
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Store - Delete layout error:', response.status, errorData);
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      console.log('Store - Layout deleted:', id);
      
      set(state => ({ layouts: state.layouts.filter(layout => layout.id !== id) }));
      toast.success('Layout başarıyla silindi!');
    } catch (error: any) {
      console.error('Store - Delete layout error:', error);
      toast.error('Layout silinirken hata oluştu: ' + error.message);
      throw error;
    }
  },

  validateLayoutName: (name: string, excludeId?: string) => {
    const { layouts } = get();
    const existingLayout = layouts.find(l =>
      l.name.toLowerCase() === name.toLowerCase() && l.id !== excludeId
    );
    return !existingLayout;
  },
  
  // Playlist Actions
  addPlaylist: async (playlist) => {
    try {
      const newPlaylist = await api.createPlaylist(playlist);
      set(state => ({ 
        playlists: [...state.playlists, { ...newPlaylist, createdAt: new Date(newPlaylist.createdAt) }] 
      }));
      toast.success('Playlist eklendi!');
    } catch (error: any) {
      toast.error('Playlist eklenirken hata oluştu: ' + error.message);
      throw error;
    }
  },
  
  updatePlaylist: async (id, playlist) => {
    try {
      const updated = await api.updatePlaylist(id, playlist);
      set(state => ({
        playlists: state.playlists.map(p => 
          p.id === id ? { ...updated, createdAt: new Date(updated.createdAt) } : p
        )
      }));
      toast.success('Playlist güncellendi!');
    } catch (error: any) {
      toast.error('Playlist güncellenirken hata oluştu: ' + error.message);
      throw error;
    }
  },
  
  deletePlaylist: async (id) => {
    try {
      await api.deletePlaylist(id);
      set(state => ({ playlists: state.playlists.filter(playlist => playlist.id !== id) }));
      toast.success('Playlist silindi!');
    } catch (error: any) {
      toast.error('Playlist silinirken hata oluştu: ' + error.message);
      throw error;
    }
  },
  
  // Schedule Actions
  addSchedule: async (schedule) => {
    try {
      const newSchedule = await api.createSchedule(schedule);
      set(state => ({ 
        schedules: [...state.schedules, { 
          ...newSchedule,
          startDate: new Date(newSchedule.startDate),
          endDate: new Date(newSchedule.endDate)
        }] 
      }));
      toast.success('Zamanlama eklendi!');
    } catch (error: any) {
      toast.error('Zamanlama eklenirken hata oluştu: ' + error.message);
      throw error;
    }
  },
  
  updateSchedule: async (id, updates) => {
    try {
      const updated = await api.updateSchedule(id, updates);
      set(state => ({
        schedules: state.schedules.map(schedule => 
          schedule.id === id ? { 
            ...updated,
            startDate: new Date(updated.startDate),
            endDate: new Date(updated.endDate)
          } : schedule
        )
      }));
      toast.success('Zamanlama güncellendi!');
    } catch (error: any) {
      toast.error('Zamanlama güncellenirken hata oluştu: ' + error.message);
      throw error;
    }
  },
  
  deleteSchedule: async (id) => {
    try {
      await api.deleteSchedule(id);
      set(state => ({ schedules: state.schedules.filter(schedule => schedule.id !== id) }));
      toast.success('Zamanlama silindi!');
    } catch (error: any) {
      toast.error('Zamanlama silinirken hata oluştu: ' + error.message);
      throw error;
    }
  }
}));
