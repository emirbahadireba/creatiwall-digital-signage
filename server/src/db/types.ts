export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          name: string
          domain: string
          subdomain: string
          plan: string
          status: string
          settings: Json
          branding: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          domain: string
          subdomain: string
          plan?: string
          status?: string
          settings?: Json
          branding?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          domain?: string
          subdomain?: string
          plan?: string
          status?: string
          settings?: Json
          branding?: Json
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          tenant_id: string
          email: string
          password: string
          first_name: string
          last_name: string
          role: string
          status: string
          permissions: string[]
          last_login: string | null
          login_attempts: number
          locked_until: string | null
          email_verified: boolean
          email_verification_token: string | null
          password_reset_token: string | null
          password_reset_expires: string | null
          two_factor_enabled: boolean
          two_factor_secret: string | null
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          email: string
          password: string
          first_name: string
          last_name: string
          role?: string
          status?: string
          permissions?: string[]
          last_login?: string | null
          login_attempts?: number
          locked_until?: string | null
          email_verified?: boolean
          email_verification_token?: string | null
          password_reset_token?: string | null
          password_reset_expires?: string | null
          two_factor_enabled?: boolean
          two_factor_secret?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          email?: string
          password?: string
          first_name?: string
          last_name?: string
          role?: string
          status?: string
          permissions?: string[]
          last_login?: string | null
          login_attempts?: number
          locked_until?: string | null
          email_verified?: boolean
          email_verification_token?: string | null
          password_reset_token?: string | null
          password_reset_expires?: string | null
          two_factor_enabled?: boolean
          two_factor_secret?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      devices: {
        Row: {
          id: string
          tenant_id: string
          name: string
          status: string
          last_seen: string
          current_playlist_id: string | null
          group_name: string | null
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          status?: string
          last_seen?: string
          current_playlist_id?: string | null
          group_name?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          status?: string
          last_seen?: string
          current_playlist_id?: string | null
          group_name?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      media_items: {
        Row: {
          id: string
          tenant_id: string
          name: string
          type: string
          url: string
          size: number
          duration: number | null
          thumbnail: string | null
          category: string | null
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          type: string
          url: string
          size: number
          duration?: number | null
          thumbnail?: string | null
          category?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          type?: string
          url?: string
          size?: number
          duration?: number | null
          thumbnail?: string | null
          category?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      layouts: {
        Row: {
          id: string
          tenant_id: string
          name: string
          description: string | null
          template: string
          category: string
          orientation: string
          thumbnail: string | null
          dimensions: Json
          background_color: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          description?: string | null
          template?: string
          category?: string
          orientation?: string
          thumbnail?: string | null
          dimensions: Json
          background_color?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          description?: string | null
          template?: string
          category?: string
          orientation?: string
          thumbnail?: string | null
          dimensions?: Json
          background_color?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      zones: {
        Row: {
          id: string
          layout_id: string
          name: string
          x: number
          y: number
          width: number
          height: number
          type: string
          content: string | null
          media_id: string | null
          playlist_id: string | null
          widget_instance_id: string | null
          background_color: string | null
          text_color: string | null
          font_size: number | null
          font_family: string | null
          text_align: string | null
          opacity: number
          border_radius: number
          border_width: number
          border_color: string | null
          style: Json | null
        }
        Insert: {
          id?: string
          layout_id: string
          name: string
          x: number
          y: number
          width: number
          height: number
          type: string
          content?: string | null
          media_id?: string | null
          playlist_id?: string | null
          widget_instance_id?: string | null
          background_color?: string | null
          text_color?: string | null
          font_size?: number | null
          font_family?: string | null
          text_align?: string | null
          opacity?: number
          border_radius?: number
          border_width?: number
          border_color?: string | null
          style?: Json | null
        }
        Update: {
          id?: string
          layout_id?: string
          name?: string
          x?: number
          y?: number
          width?: number
          height?: number
          type?: string
          content?: string | null
          media_id?: string | null
          playlist_id?: string | null
          widget_instance_id?: string | null
          background_color?: string | null
          text_color?: string | null
          font_size?: number | null
          font_family?: string | null
          text_align?: string | null
          opacity?: number
          border_radius?: number
          border_width?: number
          border_color?: string | null
          style?: Json | null
        }
      }
      playlists: {
        Row: {
          id: string
          tenant_id: string
          name: string
          description: string | null
          duration: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          description?: string | null
          duration?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          description?: string | null
          duration?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      playlist_items: {
        Row: {
          id: string
          playlist_id: string
          media_id: string
          order_index: number
          duration: number | null
          created_at: string
        }
        Insert: {
          id?: string
          playlist_id: string
          media_id: string
          order_index: number
          duration?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          playlist_id?: string
          media_id?: string
          order_index?: number
          duration?: number | null
          created_at?: string
        }
      }
      schedules: {
        Row: {
          id: string
          tenant_id: string
          name: string
          layout_id: string
          start_date: string
          end_date: string | null
          start_time: string
          end_time: string
          days_of_week: string[]
          is_active: boolean
          priority: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          layout_id: string
          start_date: string
          end_date?: string | null
          start_time: string
          end_time: string
          days_of_week: string[]
          is_active?: boolean
          priority?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          layout_id?: string
          start_date?: string
          end_date?: string | null
          start_time?: string
          end_time?: string
          days_of_week?: string[]
          is_active?: boolean
          priority?: number
          created_at?: string
          updated_at?: string
        }
      }
      schedule_devices: {
        Row: {
          id: string
          schedule_id: string
          device_id: string
          created_at: string
        }
        Insert: {
          id?: string
          schedule_id: string
          device_id: string
          created_at?: string
        }
        Update: {
          id?: string
          schedule_id?: string
          device_id?: string
          created_at?: string
        }
      }
      widget_templates: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          category: string
          thumbnail: string | null
          version: string
          author: string
          html_url: string
          preview_url: string | null
          requirements: string[]
          is_premium: boolean
          config_schema: Json
          default_config: Json
        }
        Insert: {
          id: string
          name: string
          description: string
          icon: string
          category: string
          thumbnail?: string | null
          version: string
          author: string
          html_url: string
          preview_url?: string | null
          requirements?: string[]
          is_premium?: boolean
          config_schema: Json
          default_config: Json
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon?: string
          category?: string
          thumbnail?: string | null
          version?: string
          author?: string
          html_url?: string
          preview_url?: string | null
          requirements?: string[]
          is_premium?: boolean
          config_schema?: Json
          default_config?: Json
        }
      }
      widget_instances: {
        Row: {
          id: string
          tenant_id: string
          template_id: string
          name: string
          config: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          template_id: string
          name: string
          config: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          template_id?: string
          name?: string
          config?: Json
          created_at?: string
          updated_at?: string
        }
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          tenant_id: string
          token: string
          ip_address: string
          user_agent: string
          remember_me: boolean
          expires_at: string
          created_at: string
          last_activity: string
        }
        Insert: {
          id?: string
          user_id: string
          tenant_id: string
          token: string
          ip_address: string
          user_agent: string
          remember_me?: boolean
          expires_at: string
          created_at?: string
          last_activity?: string
        }
        Update: {
          id?: string
          user_id?: string
          tenant_id?: string
          token?: string
          ip_address?: string
          user_agent?: string
          remember_me?: boolean
          expires_at?: string
          created_at?: string
          last_activity?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          tenant_id: string
          user_id: string | null
          action: string
          resource: string
          details: Json
          ip_address: string
          user_agent: string
          timestamp: string
        }
        Insert: {
          id?: string
          tenant_id: string
          user_id?: string | null
          action: string
          resource: string
          details: Json
          ip_address: string
          user_agent: string
          timestamp?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          user_id?: string | null
          action?: string
          resource?: string
          details?: Json
          ip_address?: string
          user_agent?: string
          timestamp?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}