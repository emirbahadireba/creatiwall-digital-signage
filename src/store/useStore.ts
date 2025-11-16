import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Initial State
      sidebarCollapsed: false,
      theme: 'light',
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
          set({
            devices: devices.map(d => ({
              ...d,
              id: d.id || '',
              lastSeen: new Date(d.lastSeen || Date.now())
            }))
          });
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
          set({
            mediaItems: mediaItems.map(m => ({
              ...m,
              id: m.id || '',
              uploadDate: new Date(m.createdAt || Date.now())
            }))
          });
        } catch (error: any) {
          toast.error('Medya öğeleri yüklenirken hata oluştu: ' + error.message);
        } finally {
          set(state => ({ loading: { ...state.loading, media: false } }));
        }
      },
      
      fetchLayouts: async (filters?: { category?: string; orientation?: string; search?: string }) => {
        set(state => ({ loading: { ...state.loading, layouts: true } }));
        try {
          const layouts = await api.getLayouts();
          const layoutsArray = Array.isArray(layouts) ? layouts : [];
          const processedLayouts = layoutsArray.map((l: any) => ({
            ...l,
            createdAt: new Date(l.createdAt || Date.now()),
            zones: Array.isArray(l.zones) ? l.zones : []
          }));
          
          set({ layouts: processedLayouts });
          return processedLayouts;
        } catch (error: any) {
          toast.error('Layout\'lar yüklenirken hata oluştu: ' + error.message);
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
          
          const response = await fetch('/api/layouts?type=presets', { headers });
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
          
          const response = await fetch('/api/layouts?type=categories', { headers });
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
          set({
            playlists: playlists.map(p => ({
              ...p,
              id: p.id || '',
              createdAt: new Date(p.createdAt || Date.now())
            }))
          });
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
              id: s.id || '',
              startDate: new Date(s.startDate || Date.now()),
              endDate: new Date(s.endDate || Date.now())
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
          set(state => ({
            devices: [...state.devices, {
              ...newDevice,
              id: newDevice.id || '',
              lastSeen: new Date(newDevice.lastSeen || Date.now())
            }]
          }));
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
              device.id === id ? {
                ...updated,
                id: updated.id || id,
                lastSeen: new Date(updated.lastSeen || Date.now())
              } : device
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
            mediaItems: [...state.mediaItems, {
              ...newItem,
              id: newItem.id || '',
              uploadDate: new Date(newItem.createdAt || Date.now())
            }]
          }));
          toast.success('Medya öğesi eklendi!');
        } catch (error: any) {
          toast.error('Medya öğesi eklenirken hata oluştu: ' + error.message);
          throw error;
        }
      },
      
      uploadMediaFile: async (file, data) => {
        try {
          const newItem = await api.uploadMedia(file, data);
          const itemWithDate = {
            ...newItem,
            id: newItem.id || '',
            uploadDate: new Date(newItem.createdAt || Date.now())
          };
          set(state => ({
            mediaItems: [...state.mediaItems, itemWithDate]
          }));
          toast.success('Dosya yüklendi!');
          return itemWithDate;
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
            throw new Error(errorData.error || `HTTP ${response.status}`);
          }
          
          const newLayout = await response.json();
          
          set(state => ({
            layouts: [...state.layouts, {
              ...newLayout,
              createdAt: new Date(newLayout.createdAt),
              zones: Array.isArray(newLayout.zones) ? newLayout.zones : []
            }]
          }));
          toast.success('Layout başarıyla eklendi!');
        } catch (error: any) {
          toast.error('Layout eklenirken hata oluştu: ' + error.message);
          throw error;
        }
      },

      updateLayout: async (id, layout) => {
        try {
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
            throw new Error(errorData.error || `HTTP ${response.status}`);
          }
          
          const updated = await response.json();
          
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
          toast.error('Layout güncellenirken hata oluştu: ' + error.message);
          throw error;
        }
      },

      deleteLayout: async (id) => {
        try {
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
            throw new Error(errorData.error || `HTTP ${response.status}`);
          }
          
          set(state => ({ layouts: state.layouts.filter(layout => layout.id !== id) }));
          toast.success('Layout başarıyla silindi!');
        } catch (error: any) {
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
            playlists: [...state.playlists, {
              ...newPlaylist,
              id: newPlaylist.id || '',
              createdAt: new Date(newPlaylist.createdAt || Date.now())
            }]
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
              p.id === id ? {
                ...updated,
                id: updated.id || id,
                createdAt: new Date(updated.createdAt || Date.now())
              } : p
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
              id: newSchedule.id || '',
              startDate: new Date(newSchedule.startDate || Date.now()),
              endDate: new Date(newSchedule.endDate || Date.now())
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
                id: updated.id || id,
                startDate: new Date(updated.startDate || Date.now()),
                endDate: new Date(updated.endDate || Date.now())
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
    }),
    {
      name: 'creatiwall-store',
      partialize: (state) => ({
        // Persist only essential data, not loading states
        mediaItems: state.mediaItems,
        layouts: state.layouts,
        playlists: state.playlists,
        schedules: state.schedules,
        devices: state.devices,
        layoutPresets: state.layoutPresets,
        layoutCategories: state.layoutCategories,
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
