import {
  DeviceData,
  MediaData,
  LayoutData,
  PlaylistData,
  ScheduleData,
  WidgetTemplateData,
  WidgetInstanceData
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('auth_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const headers = this.getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Devices
  async getDevices() {
    return this.request<DeviceData[]>('/devices');
  }

  async getDevice(id: string) {
    return this.request<DeviceData>(`/devices/${id}`);
  }

  async createDevice(device: Omit<DeviceData, 'id'>) {
    return this.request<DeviceData>('/devices', {
      method: 'POST',
      body: JSON.stringify(device),
    });
  }

  async updateDevice(id: string, device: Partial<DeviceData>) {
    return this.request<DeviceData>(`/devices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(device),
    });
  }

  async deleteDevice(id: string) {
    return this.request<void>(`/devices/${id}`, {
      method: 'DELETE',
    });
  }

  // Media
  async getMediaItems() {
    return this.request<MediaData[]>('/media');
  }

  async getMediaItem(id: string) {
    return this.request<MediaData>(`/media/${id}`);
  }

  async uploadMedia(file: File, data: { name?: string; type?: string; category?: string; tags?: string[]; thumbnail?: string }) {
    const formData = new FormData();
    formData.append('file', file);
    if (data.name) formData.append('name', data.name);
    if (data.type) formData.append('type', data.type);
    if (data.category) formData.append('category', data.category);
    if (data.tags && data.tags.length > 0) formData.append('tags', JSON.stringify(data.tags));
    if (data.thumbnail) formData.append('thumbnail', data.thumbnail);

    try {
      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/media/upload`, {
        method: 'POST',
        headers,
        body: formData,
        // Don't set Content-Type header - browser will set it automatically with boundary for FormData
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error: unknown) {
      // Network error or fetch failed
      if (error instanceof Error && error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Backend sunucusuna bağlanılamıyor. Lütfen backend\'in çalıştığından emin olun (http://localhost:3001)');
      }
      throw error;
    }
  }

  async createMediaItem(media: Omit<MediaData, 'id'>) {
    return this.request<MediaData>('/media', {
      method: 'POST',
      body: JSON.stringify(media),
    });
  }

  async updateMediaItem(id: string, media: Partial<MediaData>) {
    return this.request<MediaData>(`/media/${id}`, {
      method: 'PUT',
      body: JSON.stringify(media),
    });
  }

  async deleteMediaItem(id: string) {
    return this.request<void>(`/media/${id}`, {
      method: 'DELETE',
    });
  }

  // Layouts
  async getLayouts() {
    return this.request<LayoutData[]>('/layouts');
  }

  async getLayout(id: string) {
    return this.request<LayoutData>(`/layouts/${id}`);
  }

  async createLayout(layout: Omit<LayoutData, 'id'>) {
    return this.request<LayoutData>('/layouts', {
      method: 'POST',
      body: JSON.stringify(layout),
    });
  }

  async updateLayout(id: string, layout: Partial<LayoutData>) {
    return this.request<LayoutData>(`/layouts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(layout),
    });
  }

  async deleteLayout(id: string) {
    return this.request<void>(`/layouts/${id}`, {
      method: 'DELETE',
    });
  }

  // Playlists
  async getPlaylists() {
    return this.request<PlaylistData[]>('/playlists');
  }

  async getPlaylist(id: string) {
    return this.request<PlaylistData>(`/playlists/${id}`);
  }

  async createPlaylist(playlist: Omit<PlaylistData, 'id'>) {
    return this.request<PlaylistData>('/playlists', {
      method: 'POST',
      body: JSON.stringify(playlist),
    });
  }

  async updatePlaylist(id: string, playlist: Partial<PlaylistData>) {
    return this.request<PlaylistData>(`/playlists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(playlist),
    });
  }

  async deletePlaylist(id: string) {
    return this.request<void>(`/playlists/${id}`, {
      method: 'DELETE',
    });
  }

  // Schedules
  async getSchedules() {
    return this.request<ScheduleData[]>('/schedules');
  }

  async getSchedule(id: string) {
    return this.request<ScheduleData>(`/schedules/${id}`);
  }

  async createSchedule(schedule: Omit<ScheduleData, 'id'>) {
    return this.request<ScheduleData>('/schedules', {
      method: 'POST',
      body: JSON.stringify(schedule),
    });
  }

  async updateSchedule(id: string, schedule: Partial<ScheduleData>) {
    return this.request<ScheduleData>(`/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(schedule),
    });
  }

  async deleteSchedule(id: string) {
    return this.request<void>(`/schedules/${id}`, {
      method: 'DELETE',
    });
  }

  // Widgets
  async getWidgetTemplates() {
    return this.request<WidgetTemplateData[]>('/widgets/templates');
  }

  async getWidgetTemplate(id: string) {
    return this.request<WidgetTemplateData>(`/widgets/templates/${id}`);
  }

  async getWidgetInstances() {
    return this.request<WidgetInstanceData[]>('/widgets/instances');
  }

  async getWidgetInstance(id: string) {
    return this.request<WidgetInstanceData>(`/widgets/instances/${id}`);
  }

  async createWidgetInstance(instance: Omit<WidgetInstanceData, 'id'>) {
    return this.request<WidgetInstanceData>('/widgets/instances', {
      method: 'POST',
      body: JSON.stringify(instance),
    });
  }

  async updateWidgetInstance(id: string, instance: Partial<WidgetInstanceData>) {
    return this.request<WidgetInstanceData>(`/widgets/instances/${id}`, {
      method: 'PUT',
      body: JSON.stringify(instance),
    });
  }

  async deleteWidgetInstance(id: string) {
    return this.request<void>(`/widgets/instances/${id}`, {
      method: 'DELETE',
    });
  }

  // Generic methods for flexibility
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();

