import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { Music, List } from 'lucide-react';

interface Zone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
  content?: string;
  mediaId?: string;
  playlistId?: string;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  textAlign?: string;
  opacity?: number;
  borderRadius?: number;
}

interface MediaItem {
  id: string;
  name: string;
  type: string;
  url: string;
}

interface Layout {
  id: string;
  name: string;
  dimensions: { width: number; height: number };
  zones: Zone[];
}

const LayoutPreview = () => {
  const { id } = useParams<{ id: string }>();
  const [layout, setLayout] = useState<Layout | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch layout from backend
        const layoutData = await api.getLayout(id!);
        setLayout(layoutData);

        // Fetch media items
        const media = await api.getMediaItems();
        setMediaItems(media);

        setLoading(false);
      } catch (error) {
        console.error('Error loading layout:', error);
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Yükleniyor...</div>
      </div>
    );
  }

  if (!layout) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Layout bulunamadı</div>
      </div>
    );
  }

  // KIOSK MODE: Tam ekran, siyah arka plan, hiç UI yok
  return (
    <div 
      className="w-screen h-screen bg-black relative overflow-hidden"
      style={{ margin: 0, padding: 0 }}
    >
      {/* Render zones - Her zone bir region */}
      {layout.zones && layout.zones.map((zone) => {
        // Zone'un stilini hazırla
        const zoneStyle: React.CSSProperties = {
          position: 'absolute',
          left: `${zone.x}%`,
          top: `${zone.y}%`,
          width: `${zone.width}%`,
          height: `${zone.height}%`,
          backgroundColor: zone.backgroundColor || 'transparent',
          opacity: zone.opacity !== undefined ? zone.opacity : 1,
          borderRadius: zone.borderRadius ? `${zone.borderRadius}px` : '0',
          overflow: 'hidden'
        };

        // Text zone
        if (zone.type === 'text') {
          return (
            <div key={zone.id} style={zoneStyle}>
              <div
                className="w-full h-full flex items-center justify-center p-4"
                style={{
                  color: zone.textColor || '#ffffff',
                  fontSize: zone.fontSize ? `${zone.fontSize}px` : '16px',
                  textAlign: (zone.textAlign as any) || 'center'
                }}
              >
                {zone.content}
              </div>
            </div>
          );
        }

        // Media zone
        if (zone.type === 'media' && zone.mediaId) {
          const media = mediaItems.find(m => m.id === zone.mediaId);
          if (!media) {
            return <div key={zone.id} style={zoneStyle} />;
          }

          if (media.type === 'image') {
            return (
              <div key={zone.id} style={zoneStyle}>
                <img
                  src={media.url.startsWith('http') ? media.url : `${import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'production' ? '' : 'http://localhost:3001')}${media.url}`}
                  alt={media.name}
                  className="w-full h-full object-cover"
                />
              </div>
            );
          }

          if (media.type === 'video') {
            return (
              <div key={zone.id} style={zoneStyle}>
                <video
                  src={media.url.startsWith('http') ? media.url : `${import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'production' ? '' : 'http://localhost:3001')}${media.url}`}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              </div>
            );
          }

          if (media.type === 'audio') {
            return (
              <div key={zone.id} style={zoneStyle}>
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="w-16 h-16 text-white/30" />
                </div>
              </div>
            );
          }
        }

        // Playlist zone
        if (zone.type === 'playlist' && zone.playlistId) {
          return (
            <div key={zone.id} style={zoneStyle}>
              <div className="w-full h-full flex items-center justify-center">
                <List className="w-16 h-16 text-white/30" />
              </div>
            </div>
          );
        }

        // Widget zones
        if (zone.type === 'widgets' || zone.type === 'clock' || zone.type === 'weather' || zone.type === 'rss') {
          return (
            <div key={zone.id} style={zoneStyle}>
              <div className="w-full h-full flex items-center justify-center text-white">
                {zone.content || zone.type}
              </div>
            </div>
          );
        }

        // Empty zone
        return <div key={zone.id} style={zoneStyle} />;
      })}
    </div>
  );
};

export default LayoutPreview;
