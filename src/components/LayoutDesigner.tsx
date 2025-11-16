import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Grid, 
  Monitor, 
  Copy, 
  Edit, 
  Trash2, 
  Eye,
  Layers,
  Maximize,
  Move,
  RotateCcw,
  Save,
  Palette,
  Type,
  Image as ImageIcon,
  Video,
  Clock,
  Rss,
  MousePointer,
  ZoomIn,
  ZoomOut,
  Square,
  Cloud,
  ExternalLink,
  List,
  Search,
  Music,
  X
} from 'lucide-react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

interface LayoutZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'media' | 'text' | 'clock' | 'weather' | 'rss' | 'widgets' | 'playlist';
  content?: string;
  style?: Record<string, any>;
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
}

interface LayoutSettings {
  backgroundColor?: string;
}

interface LayoutTemplate {
  id: string;
  name: string;
  description: string;
  category: 'fullscreen' | 'split' | 'grid' | 'sidebar' | 'creative';
  zones: LayoutZone[];
  dimensions: { width: number; height: number };
}

const layoutTemplates: LayoutTemplate[] = [
  // YATAY ŞABLONLAR (Landscape)
  {
    id: 'fullscreen',
    name: 'Tam Ekran',
    description: 'Tek medya tam ekran gösterim',
    category: 'fullscreen',
    dimensions: { width: 1920, height: 1080 },
    zones: [
      { id: '1', x: 0, y: 0, width: 100, height: 100, type: 'media' }
    ]
  },
  {
    id: 'split-horizontal',
    name: 'Yatay İkiye Bölünmüş',
    description: 'İki eşit yatay alan',
    category: 'split',
    dimensions: { width: 1920, height: 1080 },
    zones: [
      { id: '1', x: 0, y: 0, width: 50, height: 100, type: 'media' },
      { id: '2', x: 50, y: 0, width: 50, height: 100, type: 'media' }
    ]
  },
  {
    id: 'split-vertical',
    name: 'Dikey İkiye Bölünmüş',
    description: 'İki eşit dikey alan',
    category: 'split',
    dimensions: { width: 1920, height: 1080 },
    zones: [
      { id: '1', x: 0, y: 0, width: 100, height: 50, type: 'media' },
      { id: '2', x: 0, y: 50, width: 100, height: 50, type: 'media' }
    ]
  },
  {
    id: 'sidebar-left',
    name: 'Sol Yan Panel',
    description: 'Ana içerik + sol bilgi paneli',
    category: 'sidebar',
    dimensions: { width: 1920, height: 1080 },
    zones: [
      { id: '1', x: 0, y: 0, width: 30, height: 100, type: 'text' },
      { id: '2', x: 30, y: 0, width: 70, height: 100, type: 'media' }
    ]
  },
  {
    id: 'sidebar-right',
    name: 'Sağ Yan Panel',
    description: 'Ana içerik + sağ bilgi paneli',
    category: 'sidebar',
    dimensions: { width: 1920, height: 1080 },
    zones: [
      { id: '1', x: 0, y: 0, width: 70, height: 100, type: 'media' },
      { id: '2', x: 70, y: 0, width: 30, height: 100, type: 'text' }
    ]
  },
  {
    id: 'grid-four',
    name: 'Dörtlü Grid',
    description: 'Eşit dört bölge',
    category: 'grid',
    dimensions: { width: 1920, height: 1080 },
    zones: [
      { id: '1', x: 0, y: 0, width: 50, height: 50, type: 'media' },
      { id: '2', x: 50, y: 0, width: 50, height: 50, type: 'media' },
      { id: '3', x: 0, y: 50, width: 50, height: 50, type: 'media' },
      { id: '4', x: 50, y: 50, width: 50, height: 50, type: 'media' }
    ]
  },
  {
    id: 'hero-bottom',
    name: 'Ana Başlık + Alt Ticker',
    description: 'Büyük içerik + alt bilgi şeridi',
    category: 'creative',
    dimensions: { width: 1920, height: 1080 },
    zones: [
      { id: '1', x: 0, y: 0, width: 100, height: 75, type: 'media' },
      { id: '2', x: 0, y: 75, width: 100, height: 25, type: 'text' }
    ]
  },
  {
    id: 'triple-column',
    name: 'Üçlü Sütun',
    description: 'Üç eşit dikey sütun',
    category: 'grid',
    dimensions: { width: 1920, height: 1080 },
    zones: [
      { id: '1', x: 0, y: 0, width: 33.33, height: 100, type: 'media' },
      { id: '2', x: 33.33, y: 0, width: 33.33, height: 100, type: 'media' },
      { id: '3', x: 66.66, y: 0, width: 33.33, height: 100, type: 'media' }
    ]
  },
  {
    id: 'dashboard-style',
    name: 'Dashboard Stili',
    description: 'Ana içerik + bilgi widget\'ları',
    category: 'creative',
    dimensions: { width: 1920, height: 1080 },
    zones: [
      { id: '1', x: 0, y: 0, width: 65, height: 70, type: 'media' },
      { id: '2', x: 65, y: 0, width: 35, height: 35, type: 'clock' },
      { id: '3', x: 65, y: 35, width: 35, height: 35, type: 'weather' },
      { id: '4', x: 0, y: 70, width: 100, height: 30, type: 'rss' }
    ]
  },
  {
    id: 'ticker-bottom',
    name: 'Alt Ticker',
    description: 'Ana içerik + alt kayan yazı',
    category: 'creative',
    dimensions: { width: 1920, height: 1080 },
    zones: [
      { id: '1', x: 0, y: 0, width: 100, height: 85, type: 'media' },
      { id: '2', x: 0, y: 85, width: 100, height: 15, type: 'text' }
    ]
  },
  {
    id: 'ticker-top',
    name: 'Üst Ticker',
    description: 'Üst kayan yazı + ana içerik',
    category: 'creative',
    dimensions: { width: 1920, height: 1080 },
    zones: [
      { id: '1', x: 0, y: 0, width: 100, height: 15, type: 'text' },
      { id: '2', x: 0, y: 15, width: 100, height: 85, type: 'media' }
    ]
  },
  {
    id: 'ticker-both',
    name: 'Çift Ticker',
    description: 'Üst ve alt kayan yazı + ana içerik',
    category: 'creative',
    dimensions: { width: 1920, height: 1080 },
    zones: [
      { id: '1', x: 0, y: 0, width: 100, height: 12, type: 'text' },
      { id: '2', x: 0, y: 12, width: 100, height: 76, type: 'media' },
      { id: '3', x: 0, y: 88, width: 100, height: 12, type: 'text' }
    ]
  },
  {
    id: 'media-ticker-sidebar',
    name: 'Medya + Ticker + Sidebar',
    description: 'Ana medya + alt ticker + yan panel',
    category: 'creative',
    dimensions: { width: 1920, height: 1080 },
    zones: [
      { id: '1', x: 0, y: 0, width: 75, height: 85, type: 'media' },
      { id: '2', x: 75, y: 0, width: 25, height: 100, type: 'text' },
      { id: '3', x: 0, y: 85, width: 75, height: 15, type: 'text' }
    ]
  },

  // DİKEY ŞABLONLAR (Portrait - 1080x1920)
  {
    id: 'portrait-fullscreen',
    name: 'Dikey Tam Ekran',
    description: 'Tek medya dikey tam ekran gösterim',
    category: 'fullscreen',
    dimensions: { width: 1080, height: 1920 },
    zones: [
      { id: '1', x: 0, y: 0, width: 100, height: 100, type: 'media' }
    ]
  },
  {
    id: 'portrait-split-horizontal',
    name: 'Dikey Yatay Bölünmüş',
    description: 'İki eşit yatay alan (dikey ekran)',
    category: 'split',
    dimensions: { width: 1080, height: 1920 },
    zones: [
      { id: '1', x: 0, y: 0, width: 50, height: 100, type: 'media' },
      { id: '2', x: 50, y: 0, width: 50, height: 100, type: 'media' }
    ]
  },
  {
    id: 'portrait-split-vertical',
    name: 'Dikey İkiye Bölünmüş',
    description: 'İki eşit dikey alan (dikey ekran)',
    category: 'split',
    dimensions: { width: 1080, height: 1920 },
    zones: [
      { id: '1', x: 0, y: 0, width: 100, height: 50, type: 'media' },
      { id: '2', x: 0, y: 50, width: 100, height: 50, type: 'media' }
    ]
  },
  {
    id: 'portrait-triple-row',
    name: 'Dikey Üçlü Satır',
    description: 'Üç eşit yatay satır (dikey ekran)',
    category: 'grid',
    dimensions: { width: 1080, height: 1920 },
    zones: [
      { id: '1', x: 0, y: 0, width: 100, height: 33.33, type: 'media' },
      { id: '2', x: 0, y: 33.33, width: 100, height: 33.33, type: 'media' },
      { id: '3', x: 0, y: 66.66, width: 100, height: 33.33, type: 'media' }
    ]
  },
  {
    id: 'portrait-hero-top',
    name: 'Dikey Ana Başlık + Alt',
    description: 'Büyük üst içerik + alt bölge',
    category: 'creative',
    dimensions: { width: 1080, height: 1920 },
    zones: [
      { id: '1', x: 0, y: 0, width: 100, height: 70, type: 'media' },
      { id: '2', x: 0, y: 70, width: 100, height: 30, type: 'text' }
    ]
  },
  {
    id: 'portrait-sidebar-bottom',
    name: 'Dikey Alt Panel',
    description: 'Ana içerik + alt bilgi paneli',
    category: 'sidebar',
    dimensions: { width: 1080, height: 1920 },
    zones: [
      { id: '1', x: 0, y: 0, width: 100, height: 75, type: 'media' },
      { id: '2', x: 0, y: 75, width: 100, height: 25, type: 'text' }
    ]
  },
  {
    id: 'portrait-grid-four',
    name: 'Dikey Dörtlü Grid',
    description: 'Dört eşit bölge (dikey ekran)',
    category: 'grid',
    dimensions: { width: 1080, height: 1920 },
    zones: [
      { id: '1', x: 0, y: 0, width: 50, height: 50, type: 'media' },
      { id: '2', x: 50, y: 0, width: 50, height: 50, type: 'media' },
      { id: '3', x: 0, y: 50, width: 50, height: 50, type: 'media' },
      { id: '4', x: 50, y: 50, width: 50, height: 50, type: 'media' }
    ]
  },
  {
    id: 'portrait-dashboard',
    name: 'Dikey Dashboard',
    description: 'Ana içerik + widget\'lar (dikey)',
    category: 'creative',
    dimensions: { width: 1080, height: 1920 },
    zones: [
      { id: '1', x: 0, y: 0, width: 100, height: 60, type: 'media' },
      { id: '2', x: 0, y: 60, width: 50, height: 20, type: 'clock' },
      { id: '3', x: 50, y: 60, width: 50, height: 20, type: 'weather' },
      { id: '4', x: 0, y: 80, width: 100, height: 20, type: 'rss' }
    ]
  },
  {
    id: 'portrait-ticker-top',
    name: 'Dikey Üst Ticker',
    description: 'Üst ticker + ana içerik (dikey)',
    category: 'creative',
    dimensions: { width: 1080, height: 1920 },
    zones: [
      { id: '1', x: 0, y: 0, width: 100, height: 10, type: 'text' },
      { id: '2', x: 0, y: 10, width: 100, height: 90, type: 'media' }
    ]
  },
  {
    id: 'portrait-ticker-bottom',
    name: 'Dikey Alt Ticker',
    description: 'Ana içerik + alt ticker (dikey)',
    category: 'creative',
    dimensions: { width: 1080, height: 1920 },
    zones: [
      { id: '1', x: 0, y: 0, width: 100, height: 90, type: 'media' },
      { id: '2', x: 0, y: 90, width: 100, height: 10, type: 'text' }
    ]
  },
  {
    id: 'portrait-story-style',
    name: 'Dikey Story Stili',
    description: 'Sosyal medya story formatı',
    category: 'creative',
    dimensions: { width: 1080, height: 1920 },
    zones: [
      { id: '1', x: 0, y: 0, width: 100, height: 80, type: 'media' },
      { id: '2', x: 0, y: 80, width: 100, height: 20, type: 'text' }
    ]
  },
  {
    id: 'portrait-feed-style',
    name: 'Dikey Feed Stili',
    description: 'Sosyal medya feed formatı',
    category: 'creative',
    dimensions: { width: 1080, height: 1920 },
    zones: [
      { id: '1', x: 0, y: 0, width: 100, height: 15, type: 'text' },
      { id: '2', x: 0, y: 15, width: 100, height: 70, type: 'media' },
      { id: '3', x: 0, y: 85, width: 100, height: 15, type: 'text' }
    ]
  }
];

// Zone type colors
const zoneTypeColors = {
  media: { bg: 'bg-purple-500/20', border: 'border-purple-500', text: 'text-purple-300', solid: '#a855f7' },
  text: { bg: 'bg-blue-500/20', border: 'border-blue-500', text: 'text-blue-300', solid: '#3b82f6' },
  clock: { bg: 'bg-green-500/20', border: 'border-green-500', text: 'text-green-300', solid: '#10b981' },
  weather: { bg: 'bg-orange-500/20', border: 'border-orange-500', text: 'text-orange-300', solid: '#f59e0b' },
  rss: { bg: 'bg-red-500/20', border: 'border-red-500', text: 'text-red-300', solid: '#ef4444' },
  widgets: { bg: 'bg-purple-500/20', border: 'border-purple-500', text: 'text-purple-300', solid: '#a855f7' },
  playlist: { bg: 'bg-indigo-500/20', border: 'border-indigo-500', text: 'text-indigo-300', solid: '#6366f1' }
};

// Zone type icons
const zoneTypeIcons = {
  media: ImageIcon,
  text: Type,
  clock: Clock,
  weather: Cloud,
  rss: Rss,
  widgets: Layers,
  playlist: List
};

// Template Preview Component
const TemplatePreview: React.FC<{ template: LayoutTemplate }> = ({ template }) => {
  const isPortrait = template.dimensions.height > template.dimensions.width;
  
  return (
    <div
      className="relative bg-gray-900 rounded-lg overflow-hidden border border-border"
      style={{
        aspectRatio: isPortrait ? '9/16' : '16/9',
        width: '100%'
      }}
    >
      {template.zones.map((zone) => {
        const colors = zoneTypeColors[zone.type];
        const Icon = zoneTypeIcons[zone.type];
        
        return (
          <div
            key={zone.id}
            className={`absolute ${colors.bg} ${colors.border} border-2 rounded ${colors.text} flex items-center justify-center transition-all hover:scale-105`}
            style={{
              left: `${zone.x}%`,
              top: `${zone.y}%`,
              width: `${zone.width}%`,
              height: `${zone.height}%`
            }}
          >
            <div className="text-center">
              <Icon className="w-4 h-4 mx-auto mb-1" />
              <div className="text-xs font-medium capitalize">{zone.type}</div>
            </div>
          </div>
        );
      })}
      
      {/* Orientation indicator */}
      <div className="absolute top-2 right-2">
        <div className={`px-2 py-1 bg-black/50 text-white text-xs rounded flex items-center gap-1`}>
          <Monitor className={`w-3 h-3 ${isPortrait ? 'rotate-90' : ''}`} />
          <span>{isPortrait ? 'Dikey' : 'Yatay'}</span>
        </div>
      </div>
    </div>
  );
};

export default function LayoutDesigner() {
  const {
    layouts,
    addLayout,
    updateLayout,
    deleteLayout,
    fetchLayouts,
    fetchLayoutPresets,
    fetchLayoutCategories,
    layoutPresets,
    layoutCategories,
    validateLayoutName,
    mediaItems,
    fetchMediaItems, // ✅ MEDYA FETCH FONKSİYONU
    playlists,
    fetchPlaylists, // ✅ PLAYLIST FETCH FONKSİYONU
    setHasUnsavedLayoutChanges
  } = useStore();
  const [viewMode, setViewMode] = useState<'gallery' | 'editor'>('gallery');
  const [activeTab, setActiveTab] = useState<'layouts' | 'templates'>('layouts');
  const [selectedTemplate, setSelectedTemplate] = useState<LayoutTemplate | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'fullscreen' | 'split' | 'grid' | 'sidebar' | 'creative'>('all');
  const [selectedOrientation, setSelectedOrientation] = useState<'all' | 'landscape' | 'portrait'>('all');
  const [editorZones, setEditorZones] = useState<LayoutZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [tool, setTool] = useState<'select' | 'zone'>('select');
  const [showPreview, setShowPreview] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [layoutName, setLayoutName] = useState('');
  const [layoutDescription, setLayoutDescription] = useState('');
  const [layoutCategory, setLayoutCategory] = useState('custom');
  const [layoutPreset, setLayoutPreset] = useState('landscape-hd');
  const [customDimensions, setCustomDimensions] = useState({ width: 1920, height: 1080 });
  const [editingLayoutId, setEditingLayoutId] = useState<string | null>(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showWidgetModal, setShowWidgetModal] = useState(false);
  const [widgetInstances, setWidgetInstances] = useState<any[]>([]);
  const [showLayoutSettingsModal, setShowLayoutSettingsModal] = useState(false);
  const [mediaSearchTerm, setMediaSearchTerm] = useState('');
  const [mediaFilterType, setMediaFilterType] = useState<'all' | 'image' | 'video' | 'audio'>('all');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
  const [layoutBackgroundColor, setLayoutBackgroundColor] = useState('#000000');
  
  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [draggedZone, setDraggedZone] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; zoneX: number; zoneY: number } | null>(null);
  const [hasDragged, setHasDragged] = useState(false);
  const [shouldPreventCanvasClick, setShouldPreventCanvasClick] = useState(false);
  
  // Resize state
  const [isResizing, setIsResizing] = useState(false);
  const [resizedZone, setResizedZone] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number; zoneX: number; zoneY: number; zoneWidth: number; zoneHeight: number } | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef({ isDragging: false, hasDragged: false, draggedZone: null as string | null });

  const categories = [
    { id: 'all', name: 'Tümü', icon: Grid },
    { id: 'fullscreen', name: 'Tam Ekran', icon: Maximize },
    { id: 'split', name: 'Bölünmüş', icon: Square },
    { id: 'grid', name: 'Grid', icon: Grid },
    { id: 'sidebar', name: 'Yan Panel', icon: Layers },
    { id: 'creative', name: 'Yaratıcı', icon: Layers }
  ];

  const filteredTemplates = layoutTemplates.filter(template => {
    // Category filter
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    
    // Orientation filter
    const isLandscape = template.dimensions.width >= template.dimensions.height;
    const matchesOrientation = selectedOrientation === 'all' ||
      (selectedOrientation === 'landscape' && isLandscape) ||
      (selectedOrientation === 'portrait' && !isLandscape);
    
    return matchesCategory && matchesOrientation;
  });

  // Load layouts, presets, and media on mount
  useEffect(() => {
    fetchLayouts();
    fetchLayoutPresets();
    fetchLayoutCategories();
    fetchMediaItems(); // ✅ MEDYALARI YÜKLEYİN!
    fetchPlaylists(); // ✅ PLAYLIST'LERİ DE YÜKLEYİN!
  }, [fetchLayouts, fetchLayoutPresets, fetchLayoutCategories, fetchMediaItems, fetchPlaylists]);

  // Track initial state for comparison
  const initialZonesRef = useRef<LayoutZone[]>([]);
  const initialLayoutNameRef = useRef<string>('');
  const historyPushedRef = useRef(false);

  // Check for unsaved changes
  useEffect(() => {
    if (viewMode === 'editor') {
      const hasChanges = 
        JSON.stringify(editorZones) !== JSON.stringify(initialZonesRef.current) ||
        layoutName !== initialLayoutNameRef.current;
      setHasUnsavedChanges(hasChanges);
      setHasUnsavedLayoutChanges(hasChanges);
    } else {
      setHasUnsavedChanges(false);
      setHasUnsavedLayoutChanges(false);
    }
  }, [editorZones, layoutName, viewMode, setHasUnsavedLayoutChanges]);

  // Set initial state when entering editor
  useEffect(() => {
    if (viewMode === 'editor' && editorZones.length === 0 && layoutName === '') {
      initialZonesRef.current = [];
      initialLayoutNameRef.current = '';
    }
  }, [viewMode]);

  // Warn before page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && viewMode === 'editor') {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, viewMode]);

  // Handle browser back button
  useEffect(() => {
    // Push history state when entering editor mode
    if (viewMode === 'editor' && !historyPushedRef.current) {
      window.history.pushState({ preventBack: true }, '');
      historyPushedRef.current = true;
    }

    // Reset history push flag when leaving editor
    if (viewMode !== 'editor' && historyPushedRef.current) {
      historyPushedRef.current = false;
    }

    const handlePopState = () => {
      if (viewMode === 'editor' && hasUnsavedChanges) {
        // Prevent navigation by pushing state again
        window.history.pushState({ preventBack: true }, '');
        
        // Show modal
        setShowUnsavedModal(true);
        setPendingNavigation(() => {
          // Navigate back function
          return () => {
            setHasUnsavedChanges(false);
            setHasUnsavedLayoutChanges(false);
            historyPushedRef.current = false;
            window.history.back();
          };
        });
      } else if (viewMode === 'editor' && !hasUnsavedChanges) {
        // No unsaved changes, allow navigation
        historyPushedRef.current = false;
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [hasUnsavedChanges, viewMode, setHasUnsavedLayoutChanges]);


  // Fetch widget instances
  const fetchWidgetInstances = useCallback(async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || (
        import.meta.env.MODE === 'production'
          ? '/api'
          : 'http://localhost:3001/api'
      );
      const response = await fetch(`${baseUrl}/widgets/instances`);
      if (response.ok) {
        const data = await response.json();
        setWidgetInstances(data);
      }
    } catch (error) {
      console.error('Error fetching widget instances:', error);
    }
  }, []);

  useEffect(() => {
    fetchWidgetInstances();
  }, [fetchWidgetInstances]);

  // Handle navigation away
  const handleNavigation = (callback: () => void) => {
    if (hasUnsavedChanges && viewMode === 'editor') {
      setPendingNavigation(() => callback);
      setShowUnsavedModal(true);
    } else {
      callback();
    }
  };

  const handleSaveAndExit = async () => {
    try {
      await saveLayout();
      if (pendingNavigation) {
        pendingNavigation();
        setPendingNavigation(null);
      }
      setShowUnsavedModal(false);
    } catch (error) {
      // Error is already handled
    }
  };

  const handleDiscardAndExit = () => {
    setHasUnsavedChanges(false);
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
    setShowUnsavedModal(false);
  };

  const createLayoutFromTemplate = (template: LayoutTemplate) => {
    handleNavigation(() => {
      setSelectedTemplate(template);
      const zones = [...template.zones];
      const name = template.name + ' Kopyası';
      
      // Set template dimensions and preset
      const { width, height } = template.dimensions;
      setCustomDimensions({ width, height });
      
      // Determine preset from template dimensions
      if (width === 1920 && height === 1080) {
        setLayoutPreset('landscape-hd');
      } else if (width === 1080 && height === 1920) {
        setLayoutPreset('portrait-hd');
      } else if (width === 3840 && height === 2160) {
        setLayoutPreset('landscape-4k');
      } else if (width === 2160 && height === 3840) {
        setLayoutPreset('portrait-4k');
      } else if (width === 1080 && height === 1080) {
        setLayoutPreset('square-hd');
      } else if (width === 2560 && height === 1080) {
        setLayoutPreset('ultrawide');
      } else {
        // Custom dimensions
        setLayoutPreset('custom');
      }
      
      setEditorZones(zones);
      setLayoutName(name);
      setEditingLayoutId(null);
      setViewMode('editor');
      initialZonesRef.current = JSON.parse(JSON.stringify(zones));
      initialLayoutNameRef.current = name;
    });
  };

  const editLayout = (layout: any) => {
    handleNavigation(() => {
      setSelectedTemplate(null);
      const zones = layout.zones.map((zone: any) => ({
        id: zone.id,
        x: zone.x,
        y: zone.y,
        width: zone.width,
        height: zone.height,
        type: zone.type,
        content: zone.content,
        mediaId: zone.mediaId,
        playlistId: zone.playlistId,
        widgetInstanceId: zone.widgetInstanceId,
        backgroundColor: zone.backgroundColor,
        textColor: zone.textColor,
        fontSize: zone.fontSize,
        fontFamily: zone.fontFamily,
        textAlign: zone.textAlign,
        opacity: zone.opacity,
        borderRadius: zone.borderRadius,
        borderWidth: zone.borderWidth,
        borderColor: zone.borderColor,
        style: zone.style
      }));
      setLayoutName(layout.name);
      setLayoutDescription(layout.description || '');
      setLayoutCategory(layout.category || 'custom');
      setLayoutBackgroundColor(layout.backgroundColor || '#000000');
      
      // Set dimensions and preset
      if (layout.dimensions) {
        setCustomDimensions({
          width: layout.dimensions.width,
          height: layout.dimensions.height
        });
        
        // Determine preset from dimensions
        const width = layout.dimensions.width;
        const height = layout.dimensions.height;
        
        if (width === 1920 && height === 1080) {
          setLayoutPreset('landscape-hd');
        } else if (width === 1080 && height === 1920) {
          setLayoutPreset('portrait-hd');
        } else if (width === 3840 && height === 2160) {
          setLayoutPreset('landscape-4k');
        } else if (width === 2160 && height === 3840) {
          setLayoutPreset('portrait-4k');
        } else if (width === 1080 && height === 1080) {
          setLayoutPreset('square-hd');
        } else if (width === 2560 && height === 1080) {
          setLayoutPreset('ultrawide');
        } else {
          // Custom dimensions
          setLayoutPreset('custom');
        }
      } else {
        setLayoutPreset('landscape-hd');
      }
      
      setEditorZones(zones);
      setEditingLayoutId(layout.id);
      setViewMode('editor');
      initialZonesRef.current = JSON.parse(JSON.stringify(zones));
      initialLayoutNameRef.current = layout.name;
    });
  };

  const addZone = useCallback((x: number, y: number) => {
    if (tool !== 'zone') return;

    const newZone: LayoutZone = {
      id: Date.now().toString(),
      x: Math.max(0, Math.min(80, x)),
      y: Math.max(0, Math.min(85, y)),
      width: 20,
      height: 15,
      type: 'media'
    };

    setEditorZones(prev => [...prev, newZone]);
    setSelectedZone(newZone.id);
    // Zone eklendikten sonra otomatik olarak Select aracına geç
    setTool('select');
  }, [tool]);

  const updateZone = (zoneId: string, updates: Partial<LayoutZone>) => {
    setEditorZones(prev => prev.map(zone =>
      zone.id === zoneId ? { ...zone, ...updates } : zone
    ));
  };

  const deleteZone = (zoneId: string) => {
    setEditorZones(prev => prev.filter(zone => zone.id !== zoneId));
    if (selectedZone === zoneId) {
      setSelectedZone(null);
    }
  };

  // Zone drag handlers
  const handleZoneMouseDown = useCallback((e: React.MouseEvent, zoneId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent canvas click when clicking on zone
    setShouldPreventCanvasClick(true);
    
    if (tool !== 'select') {
      setSelectedZone(zoneId);
      // Reset after a short delay to allow click to complete
      setTimeout(() => setShouldPreventCanvasClick(false), 100);
      return;
    }
    
    const zone = editorZones.find(z => z.id === zoneId);
    if (!zone) return;

    // Update ref immediately
    dragStateRef.current = { isDragging: true, hasDragged: false, draggedZone: zoneId };

    setIsDragging(true);
    setDraggedZone(zoneId);
    setSelectedZone(zoneId);
    setHasDragged(false);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      zoneX: zone.x,
      zoneY: zone.y
    });
  }, [tool, editorZones]);

  // Global mouse move handler
  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    
    // Handle dragging
    if (isDragging && draggedZone && dragStart) {
      const zone = editorZones.find(z => z.id === draggedZone);
      if (!zone) return;
  
      // Calculate pixel distance moved
      const pixelDeltaX = Math.abs(e.clientX - dragStart.x);
      const pixelDeltaY = Math.abs(e.clientY - dragStart.y);
      
      // Mark as dragged if moved more than 3 pixels
      if (!dragStateRef.current.hasDragged && (pixelDeltaX > 3 || pixelDeltaY > 3)) {
        dragStateRef.current.hasDragged = true;
        setHasDragged(true);
      }
  
      // Calculate delta in percentage
      const deltaX = ((e.clientX - dragStart.x) / rect.width) * 100;
      const deltaY = ((e.clientY - dragStart.y) / rect.height) * 100;
  
      // New position with boundaries
      const newX = Math.max(0, Math.min(100 - zone.width, dragStart.zoneX + deltaX));
      const newY = Math.max(0, Math.min(100 - zone.height, dragStart.zoneY + deltaY));
  
      // Update only the dragged zone
      setEditorZones(prev => prev.map(z =>
        z.id === draggedZone ? { ...z, x: newX, y: newY } : z
      ));
    }
    
    // Handle resizing
    if (isResizing && resizedZone && resizeStart) {
      const zone = editorZones.find(z => z.id === resizedZone);
      if (!zone) return;

      // Calculate delta in percentage
      const deltaX = ((e.clientX - resizeStart.x) / rect.width) * 100;
      const deltaY = ((e.clientY - resizeStart.y) / rect.height) * 100;

      // New size with boundaries (minimum 5% width/height, maximum 100%)
      const newWidth = Math.max(5, Math.min(100 - resizeStart.zoneX, resizeStart.zoneWidth + deltaX));
      const newHeight = Math.max(5, Math.min(100 - resizeStart.zoneY, resizeStart.zoneHeight + deltaY));

      // Update zone size
      setEditorZones(prev => prev.map(z => 
        z.id === resizedZone ? { ...z, width: newWidth, height: newHeight } : z
      ));
    }
  }, [isDragging, draggedZone, dragStart, isResizing, resizedZone, resizeStart, editorZones, hasDragged]);

  // Global mouse up handler
  const handleGlobalMouseUp = useCallback(() => {
    const didDrag = dragStateRef.current.hasDragged;
    
    // Reset drag ref
    dragStateRef.current = { isDragging: false, hasDragged: false, draggedZone: null };
    
    // Reset drag state
    setIsDragging(false);
    setDraggedZone(null);
    setDragStart(null);
    
    // Reset resize state
    setIsResizing(false);
    setResizedZone(null);
    setResizeStart(null);
    
    // If we actually dragged, prevent canvas click
    if (didDrag) {
      setShouldPreventCanvasClick(true);
      // Reset after a delay to allow any pending click events to be ignored
      setTimeout(() => {
        setShouldPreventCanvasClick(false);
        setHasDragged(false);
      }, 200);
    } else {
      // If we just clicked without dragging, prevent canvas click briefly
      setShouldPreventCanvasClick(true);
      setTimeout(() => {
        setShouldPreventCanvasClick(false);
        setHasDragged(false);
      }, 100);
    }
  }, []);

  // Resize handler
  const handleResizeMouseDown = useCallback((e: React.MouseEvent, zoneId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const zone = editorZones.find(z => z.id === zoneId);
    if (!zone) return;

    setIsResizing(true);
    setResizedZone(zoneId);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      zoneX: zone.x,
      zoneY: zone.y,
      zoneWidth: zone.width,
      zoneHeight: zone.height
    });
  }, [editorZones]);

  // Add/remove global event listeners
  useEffect(() => {
    if (isDragging || isResizing) {
      const mouseUpHandler = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        handleGlobalMouseUp();
      };
      
      // Use capture phase to catch mouseup before it reaches other elements
      document.addEventListener('mousemove', handleGlobalMouseMove, true);
      document.addEventListener('mouseup', mouseUpHandler, true);
      document.body.style.cursor = isResizing ? 'nwse-resize' : 'move';
      document.body.style.userSelect = 'none';

    return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove, true);
        document.removeEventListener('mouseup', mouseUpHandler, true);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    }
  }, [isDragging, isResizing, handleGlobalMouseMove, handleGlobalMouseUp]);

  // Canvas click handler - only for zone creation
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // Prevent if we just interacted with a zone
    if (shouldPreventCanvasClick) {
      return;
    }
    
    // Only create zone if zone tool is selected
    if (tool !== 'zone') return;
    
    // Check if click was on a zone element (prevent creating zone when clicking on existing zone)
    const target = e.target as HTMLElement;
    if (target.closest('[data-zone-id]')) {
      return;
    }
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    addZone(x, y);
  }, [tool, shouldPreventCanvasClick, addZone]);

  const saveLayout = async () => {
    // Validate layout name
    if (!layoutName.trim()) {
      toast.error('Layout ismi gereklidir');
      return;
    }

    // Check name uniqueness
    if (!validateLayoutName(layoutName.trim(), editingLayoutId || undefined)) {
      toast.error('Bu isimde bir layout zaten mevcut');
      return;
    }

    if (editorZones.length === 0) {
      toast.error('En az bir bölge eklemelisiniz');
      return;
    }

    try {
      // Get dimensions from preset or custom
      let dimensions = customDimensions;
      if (layoutPreset !== 'custom') {
        const presetDimensions = {
          'landscape-hd': { width: 1920, height: 1080 },
          'portrait-hd': { width: 1080, height: 1920 },
          'landscape-4k': { width: 3840, height: 2160 },
          'portrait-4k': { width: 2160, height: 3840 },
          'square-hd': { width: 1080, height: 1080 },
          'ultrawide': { width: 2560, height: 1080 }
        };
        dimensions = presetDimensions[layoutPreset as keyof typeof presetDimensions] || { width: 1920, height: 1080 };
      }

      // Determine orientation
      const orientation: 'landscape' | 'portrait' = dimensions.width >= dimensions.height ? 'landscape' : 'portrait';

      const layoutData = {
        name: layoutName.trim(),
        description: layoutDescription.trim() || `${editorZones.length} bölgeli özel tasarım`,
        template: 'custom' as const,
        thumbnail: null,
        category: layoutCategory,
        orientation,
        preset: layoutPreset,
        dimensions,
        backgroundColor: layoutBackgroundColor,
        zones: editorZones.map((zone, index) => ({
          id: zone.id,
          name: `Bölge ${index + 1}`,
          x: zone.x,
          y: zone.y,
          width: zone.width,
          height: zone.height,
          type: zone.type,
          content: zone.content,
          mediaId: zone.mediaId,
          playlistId: zone.playlistId,
          widgetInstanceId: zone.widgetInstanceId,
          backgroundColor: zone.backgroundColor,
          textColor: zone.textColor,
          fontSize: zone.fontSize,
          fontFamily: zone.fontFamily,
          textAlign: zone.textAlign,
          opacity: zone.opacity,
          borderRadius: zone.borderRadius,
          borderWidth: zone.borderWidth,
          borderColor: zone.borderColor,
          style: zone.style
        }))
      };

      if (editingLayoutId) {
        // Update existing layout
        await updateLayout(editingLayoutId, layoutData);
      } else {
        // Create new layout
        await addLayout(layoutData);
      }

      // Reset form
      setViewMode('gallery');
      setEditorZones([]);
      setLayoutName('');
      setLayoutDescription('');
      setLayoutCategory('custom');
      setLayoutPreset('landscape-hd');
      setCustomDimensions({ width: 1920, height: 1080 });
      setSelectedTemplate(null);
      setEditingLayoutId(null);
      setHasUnsavedChanges(false);
      initialZonesRef.current = [];
      initialLayoutNameRef.current = '';
    } catch (error) {
      // Error is already handled in store
    }
  };

  if (viewMode === 'gallery') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-text">Layout Tasarımcısı</h1>
            <p className="text-textSecondary mt-1">Ekran düzenlerinizi oluşturun ve yönetin</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              handleNavigation(() => {
                setViewMode('editor');
                setEditorZones([]);
                setSelectedTemplate(null);
                setLayoutName('Yeni Layout');
                initialZonesRef.current = [];
                initialLayoutNameRef.current = 'Yeni Layout';
              });
            }}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Sıfırdan Oluştur</span>
          </motion.button>
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center space-x-2 border-b border-border">
          <button
            onClick={() => setActiveTab('layouts')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'layouts'
                ? 'border-primary text-primary'
                : 'border-transparent text-textSecondary hover:text-text'
            }`}
          >
            Kayıtlı Layouts
            {layouts.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                {layouts.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'templates'
                ? 'border-primary text-primary'
                : 'border-transparent text-textSecondary hover:text-text'
            }`}
          >
            Şablonlar
          </button>
        </div>

        {/* Layouts Tab */}
        {activeTab === 'layouts' && (
          <div>
            {layouts.length === 0 ? (
              <div className="text-center py-16">
                <Layers className="w-20 h-20 mx-auto mb-4 text-textSecondary opacity-50" />
                <h2 className="text-2xl font-bold text-text mb-2">Henüz Layout Eklenmemiş</h2>
                <p className="text-textSecondary mb-6">İlk layout'unuzu oluşturun veya şablonlardan seçin</p>
                <div className="flex items-center justify-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      handleNavigation(() => {
                        setViewMode('editor');
                        setEditorZones([]);
                        setSelectedTemplate(null);
                        setLayoutName('Yeni Layout');
                        initialZonesRef.current = [];
                        initialLayoutNameRef.current = 'Yeni Layout';
                      });
                    }}
                    className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span>İlk Layout'u Oluştur</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab('templates')}
                    className="flex items-center space-x-2 px-6 py-3 bg-surface border border-border text-text rounded-xl hover:bg-background transition-colors"
                  >
                    <Grid className="w-5 h-5" />
                    <span>Şablonlardan Seç</span>
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {layouts.map((layout, index) => (
                <motion.div
                  key={layout.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-surface rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:shadow-primary/10 transition-all duration-300"
                >
                  {/* Custom Layout Preview */}
                  <div className="relative p-4">
                    <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden border border-border flex items-center justify-center">
                      {(() => {
                        const isPortrait = layout.dimensions && layout.dimensions.height > layout.dimensions.width;
                        
                        if (isPortrait) {
                          // Portrait layout - show smaller centered preview
                          return (
                            <div
                              className="relative bg-gray-800 rounded border border-gray-600"
                              style={{
                                width: '35%',
                                aspectRatio: `${layout.dimensions.width}/${layout.dimensions.height}`
                              }}
                            >
                              {layout.zones.map((zone) => {
                                const colors = zoneTypeColors[zone.type as keyof typeof zoneTypeColors] || zoneTypeColors.media;
                                const Icon = zoneTypeIcons[zone.type as keyof typeof zoneTypeIcons] || ImageIcon;
                                
                                return (
                                  <div
                                    key={zone.id}
                                    className={`absolute ${colors.bg} ${colors.border} border-2 rounded ${colors.text} flex items-center justify-center`}
                                    style={{
                                      left: `${zone.x}%`,
                                      top: `${zone.y}%`,
                                      width: `${zone.width}%`,
                                      height: `${zone.height}%`
                                    }}
                                  >
                                    <div className="text-center">
                                      <Icon className="w-3 h-3 mx-auto mb-1" />
                                      <div className="text-xs font-medium capitalize">{zone.type}</div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        } else {
                          // Landscape layout - show full width
                          return (
                            <>
                              {layout.zones.map((zone) => {
                                const colors = zoneTypeColors[zone.type as keyof typeof zoneTypeColors] || zoneTypeColors.media;
                                const Icon = zoneTypeIcons[zone.type as keyof typeof zoneTypeIcons] || ImageIcon;
                                
                                return (
                                  <div
                                    key={zone.id}
                                    className={`absolute ${colors.bg} ${colors.border} border-2 rounded ${colors.text} flex items-center justify-center`}
                                    style={{
                                      left: `${zone.x}%`,
                                      top: `${zone.y}%`,
                                      width: `${zone.width}%`,
                                      height: `${zone.height}%`
                                    }}
                                  >
                                    <div className="text-center">
                                      <Icon className="w-3 h-3 mx-auto mb-1" />
                                      <div className="text-xs font-medium capitalize">{zone.type}</div>
                                    </div>
                                  </div>
                                );
                              })}
                            </>
                          );
                        }
                      })()}
                    </div>
                    <div className="absolute top-6 left-6">
                      <span className="px-2 py-1 bg-primary text-white text-xs rounded-full">
                        {layout.zones.length} bölge
                      </span>
                    </div>
                  </div>

                  {/* Layout Info */}
                  <div className="px-4 pb-4">
                    <h3 className="font-semibold text-text mb-1">{layout.name}</h3>
                    <p className="text-sm text-textSecondary mb-2">{layout.description}</p>
                    <div className="text-xs text-textSecondary mb-2">
                      {new Date(layout.createdAt).toLocaleDateString('tr-TR')}
                    </div>
                    <div className="text-xs text-textSecondary mb-4 font-mono bg-background px-2 py-1 rounded">
                      ID: {layout.id}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => editLayout(layout)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Düzenle</span>
                      </button>
                      <button
                        onClick={() => {
                          const layoutWidth = layout.dimensions?.width || 1920;
                          const layoutHeight = layout.dimensions?.height || 1080;
                          const playerUrl = `http://localhost:5173/player.html?id=${layout.id}`;
                          window.open(playerUrl, '_blank', `width=${layoutWidth},height=${layoutHeight}`);
                        }}
                        className="p-2 bg-background hover:bg-border rounded-lg transition-colors"
                        title="Player'da Önizle"
                      >
                        <Eye className="w-4 h-4 text-textSecondary" />
                      </button>
                      <button 
                        onClick={async () => {
                          if (window.confirm(`"${layout.name}" layout'unu silmek istediğinizden emin misiniz?`)) {
                            try {
                              await deleteLayout(layout.id);
                            } catch (error) {
                              // Error is already handled in store
                            }
                          }
                        }}
                        className="p-2 bg-background hover:bg-red-500/20 rounded-lg transition-colors group"
                      >
                        <Trash2 className="w-4 h-4 text-textSecondary group-hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
              </div>
            )}
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="space-y-4">
              {/* Orientation Filter */}
              <div>
                <h3 className="text-sm font-medium text-textSecondary mb-3">Yönelim</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', name: 'Tümü', icon: Grid },
                    { id: 'landscape', name: 'Yatay', icon: Monitor },
                    { id: 'portrait', name: 'Dikey', icon: Monitor }
                  ].map(orientation => {
                    const Icon = orientation.icon;
                    return (
                      <motion.button
                        key={orientation.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedOrientation(orientation.id as any)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all text-sm ${
                          selectedOrientation === orientation.id
                            ? 'bg-primary text-white'
                            : 'bg-surface text-textSecondary hover:text-text border border-border'
                        }`}
                      >
                        <Icon className={`w-3 h-3 ${orientation.id === 'portrait' ? 'rotate-90' : ''}`} />
                        <span>{orientation.name}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-sm font-medium text-textSecondary mb-3">Kategori</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => {
                    const Icon = category.icon;
                    return (
                      <motion.button
                        key={category.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedCategory(category.id as any)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all text-sm ${
                          selectedCategory === category.id
                            ? 'bg-primary text-white'
                            : 'bg-surface text-textSecondary hover:text-text border border-border'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{category.name}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTemplates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-surface rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:shadow-primary/10 transition-all duration-300"
                >
                  {/* Template Preview */}
                  <div className="relative p-4">
                    <TemplatePreview template={template} />
                    <div className="absolute top-6 left-6">
                      <span className="px-2 py-1 bg-primary text-white text-xs rounded-full">
                        {template.zones.length} bölge
                      </span>
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className="px-4 pb-4">
                    <h3 className="font-semibold text-text mb-1">{template.name}</h3>
                    <p className="text-sm text-textSecondary mb-3">{template.description}</p>
                    
                    {/* Template Specs */}
                    <div className="flex items-center justify-between text-xs text-textSecondary mb-4">
                      <span>{template.dimensions.width}×{template.dimensions.height}</span>
                      <span className="capitalize">{template.category}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => createLayoutFromTemplate(template)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Düzenle</span>
                      </button>
                      <button
                        onClick={() => {
                          // Create a temporary layout from template for preview
                          const tempLayout = {
                            id: 'temp-' + template.id,
                            name: template.name,
                            zones: template.zones,
                            dimensions: template.dimensions
                          };
                          // Store temp layout in sessionStorage for preview
                          sessionStorage.setItem('tempLayout', JSON.stringify(tempLayout));
                          const playerUrl = `${window.location.origin}/player.html?layout=temp-${template.id}`;
                          const { width, height } = template.dimensions;
                          window.open(playerUrl, '_blank', `width=${width},height=${height},scrollbars=no,resizable=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no`);
                        }}
                        className="p-2 bg-background hover:bg-border rounded-lg transition-colors"
                        title={`${template.dimensions.width}x${template.dimensions.height} Şablon Önizleme`}
                      >
                        <Eye className="w-4 h-4 text-textSecondary" />
                      </button>
                      <button className="p-2 bg-background hover:bg-border rounded-lg transition-colors">
                        <Copy className="w-4 h-4 text-textSecondary" />
                      </button>
                      <button className="p-2 bg-background hover:bg-border rounded-lg transition-colors">
                        <ExternalLink className="w-4 h-4 text-textSecondary" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Editor Mode
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleNavigation(() => setViewMode('gallery'))}
            className="p-2 hover:bg-surface rounded-lg transition-colors"
          >
            <Grid className="w-5 h-5 text-textSecondary" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-text mb-2">Layout Editörü</h1>
            <div className="flex items-center gap-2">
              <label className="text-sm text-textSecondary whitespace-nowrap">Layout İsmi:</label>
              <input
                value={layoutName}
                onChange={(e) => setLayoutName(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-primary transition-colors"
                placeholder="Layout adını girin..."
              />
              <button
                onClick={() => setShowLayoutSettingsModal(true)}
                className="px-3 py-1.5 bg-background border border-border rounded-lg text-textSecondary hover:text-text hover:border-primary transition-colors text-sm"
                title="Layout Ayarları"
              >
                Ayarlar
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-surface border border-border rounded-xl overflow-hidden">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              className="p-2 hover:bg-background transition-colors"
            >
              <ZoomOut className="w-4 h-4 text-textSecondary" />
            </button>
            <div className="px-3 py-2 text-sm text-text border-l border-r border-border">
              {Math.round(zoom * 100)}%
            </div>
            <button
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
              className="p-2 hover:bg-background transition-colors"
            >
              <ZoomIn className="w-4 h-4 text-textSecondary" />
            </button>
          </div>
          <button
            onClick={saveLayout}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Kaydet</span>
          </button>
        </div>
      </motion.div>

      {/* Tools Bar - Top */}
          <div className="bg-surface rounded-xl border border-border p-4">
        <div className="flex items-center space-x-6 flex-wrap gap-4">
          {/* Main Tools */}
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-textSecondary mr-2">Araçlar:</span>
              <button
                onClick={() => setTool('select')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                  tool === 'select' ? 'bg-primary text-white' : 'bg-background hover:bg-border text-textSecondary'
                }`}
              >
              <MousePointer className="w-4 h-4" />
              <span className="text-sm">Seç</span>
              </button>
              <button
                onClick={() => setTool('zone')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                  tool === 'zone' ? 'bg-primary text-white' : 'bg-background hover:bg-border text-textSecondary'
                }`}
              >
              <Square className="w-4 h-4" />
              <span className="text-sm">Bölge</span>
              </button>
          </div>

          {/* Template Quick Access */}
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <span className="text-sm font-medium text-textSecondary mr-2 whitespace-nowrap">Hazır Şablonlar:</span>
            
            {/* Orientation Filter for Editor */}
            <div className="flex items-center space-x-1 mr-2">
              {[
                { id: 'all', name: 'Tümü', icon: Grid },
                { id: 'landscape', name: 'Yatay', icon: Monitor },
                { id: 'portrait', name: 'Dikey', icon: Monitor }
              ].map(orientation => {
                const Icon = orientation.icon;
                return (
                  <button
                    key={orientation.id}
                    onClick={() => setSelectedOrientation(orientation.id as any)}
                    className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-all ${
                      selectedOrientation === orientation.id
                        ? 'bg-primary text-white'
                        : 'bg-background text-textSecondary hover:text-text border border-border'
                    }`}
                    title={orientation.name}
                  >
                    <Icon className={`w-3 h-3 ${orientation.id === 'portrait' ? 'rotate-90' : ''}`} />
                    <span className="hidden sm:inline">{orientation.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto pb-2 flex-1">
              {filteredTemplates.map((template) => {
                const isPortrait = template.dimensions.height > template.dimensions.width;
                return (
                  <button
                    key={template.id}
                    onClick={() => {
                      // Set template dimensions and preset
                      const { width, height } = template.dimensions;
                      setCustomDimensions({ width, height });
                      
                      // Determine preset from template dimensions
                      if (width === 1920 && height === 1080) {
                        setLayoutPreset('landscape-hd');
                      } else if (width === 1080 && height === 1920) {
                        setLayoutPreset('portrait-hd');
                      } else if (width === 3840 && height === 2160) {
                        setLayoutPreset('landscape-4k');
                      } else if (width === 2160 && height === 3840) {
                        setLayoutPreset('portrait-4k');
                      } else if (width === 1080 && height === 1080) {
                        setLayoutPreset('square-hd');
                      } else if (width === 2560 && height === 1080) {
                        setLayoutPreset('ultrawide');
                      } else {
                        // Custom dimensions
                        setLayoutPreset('custom');
                      }
                      
                      setEditorZones(template.zones.map(zone => ({
                        ...zone,
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                        backgroundColor: undefined,
                        opacity: 1,
                        borderRadius: 0,
                        borderWidth: 2,
                        borderColor: undefined
                      })));
                      setSelectedZone(null);
                      setTool('select');
                    }}
                    className="group relative flex-shrink-0"
                    title={template.name}
                  >
                    <div
                      className="bg-gray-900 rounded border border-border overflow-hidden relative hover:border-primary transition-colors"
                      style={{
                        width: '80px',
                        height: isPortrait ? '120px' : '48px',
                        aspectRatio: isPortrait ? '2/3' : '5/3'
                      }}
                    >
                      {template.zones.map((zone) => {
                        const colors = zoneTypeColors[zone.type];
                        return (
                          <div
                            key={zone.id}
                            className={`absolute border ${colors.border} ${colors.bg} opacity-80`}
                            style={{
                              left: `${zone.x}%`,
                              top: `${zone.y}%`,
                              width: `${zone.width}%`,
                              height: `${zone.height}%`,
                              borderWidth: '1px'
                            }}
                          />
                        );
                      })}
                      {/* Orientation indicator */}
                      <div className="absolute top-1 right-1">
                        <Monitor className={`w-2 h-2 text-white/60 ${isPortrait ? 'rotate-90' : ''}`} />
                      </div>
                    </div>
                    <span className="block text-xs text-textSecondary mt-1 text-center group-hover:text-text transition-colors truncate w-20">
                      {template.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview Button */}
          <button
            onClick={() => {
              // Get dimensions from preset or custom
              let dimensions = customDimensions;
              if (layoutPreset !== 'custom') {
                const presetDimensions: Record<string, {width: number, height: number}> = {
                  'landscape-hd': { width: 1920, height: 1080 },
                  'portrait-hd': { width: 1080, height: 1920 },
                  'landscape-4k': { width: 3840, height: 2160 },
                  'portrait-4k': { width: 2160, height: 3840 },
                  'square-hd': { width: 1080, height: 1080 },
                  'ultrawide': { width: 2560, height: 1080 }
                };
                dimensions = presetDimensions[layoutPreset] || { width: 1920, height: 1080 };
              }

              if (editingLayoutId) {
                // Existing layout - use saved version
                const playerUrl = `http://localhost:5173/player.html?id=${editingLayoutId}`;
                window.open(playerUrl, '_blank', `width=${dimensions.width},height=${dimensions.height}`);
              } else {
                // New layout - create temporary preview
                if (editorZones.length === 0) {
                  toast.error('Önizleme için en az bir bölge eklemelisiniz');
                  return;
                }

                // Create temporary layout object
                const tempLayout = {
                  id: 'temp-preview-' + Date.now(),
                  name: layoutName || 'Geçici Önizleme',
                  description: layoutDescription || 'Geçici önizleme layout\'u',
                  dimensions,
                  backgroundColor: layoutBackgroundColor,
                  zones: editorZones.map((zone, index) => ({
                    id: zone.id,
                    name: `Bölge ${index + 1}`,
                    x: zone.x,
                    y: zone.y,
                    width: zone.width,
                    height: zone.height,
                    type: zone.type,
                    content: zone.content,
                    mediaId: zone.mediaId,
                    playlistId: zone.playlistId,
                    widgetInstanceId: zone.widgetInstanceId,
                    backgroundColor: zone.backgroundColor,
                    textColor: zone.textColor,
                    fontSize: zone.fontSize,
                    fontFamily: zone.fontFamily,
                    textAlign: zone.textAlign,
                    opacity: zone.opacity,
                    borderRadius: zone.borderRadius,
                    borderWidth: zone.borderWidth,
                    borderColor: zone.borderColor,
                    style: zone.style
                  }))
                };

                // Store temp layout in sessionStorage for preview
                sessionStorage.setItem('tempLayout', JSON.stringify(tempLayout));
                const playerUrl = `http://localhost:5173/player.html?layout=temp-preview-${Date.now()}`;
                window.open(playerUrl, '_blank', `width=${dimensions.width},height=${dimensions.height}`);
              }
            }}
            className="px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 flex-shrink-0 bg-background hover:bg-border text-textSecondary"
            title="Player'da Önizle"
          >
            <Eye className="w-4 h-4" />
            <span className="text-sm">Önizleme</span>
          </button>
            </div>
          </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Region Settings - Left Side (Always Visible) */}
        <div className="lg:col-span-1">
          <div className="bg-surface rounded-xl border border-border p-4 space-y-4 sticky top-6">
            <h3 className="font-semibold text-text mb-4">Region Settings</h3>
            {selectedZone ? (() => {
                const zone = editorZones.find(z => z.id === selectedZone);
              if (!zone) return (
                <div className="text-center py-8 text-textSecondary">
                  <p>Bölge bulunamadı</p>
                </div>
              );
                
                return (
                  <div className="space-y-4">
                    {/* Zone Type */}
                    <div>
                      <label className="text-sm font-medium text-textSecondary block mb-2">Bölge Türü</label>
                      <select
                        value={zone.type}
                        onChange={(e) => updateZone(selectedZone, { type: e.target.value as any })}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-primary transition-colors"
                      >
                        <option value="media">Medya</option>
                        <option value="text">Metin</option>
                        <option value="clock">Saat</option>
                        <option value="weather">Hava Durumu</option>
                        <option value="rss">RSS Feed</option>
                        <option value="widgets">Widgets</option>
                        <option value="playlist">Playlist</option>
                      </select>
                    </div>

                    {/* Content Selection */}
                    {zone.type === 'media' && (
                      <div>
                        <label className="text-sm font-medium text-textSecondary block mb-2">İçerik Seç</label>
                        <button
                          onClick={() => setShowMediaModal(true)}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text hover:border-primary transition-colors flex items-center justify-between"
                        >
                          <span className="text-sm">
                            {zone.mediaId 
                              ? mediaItems.find(m => m.id === zone.mediaId)?.name || 'İçerik seçin...'
                              : 'İçerik seçin...'
                            }
                          </span>
                          <ImageIcon className="w-4 h-4 text-textSecondary" />
                        </button>
                        {zone.mediaId && (
                          <button
                            onClick={() => updateZone(selectedZone, { mediaId: undefined })}
                            className="mt-2 text-xs text-error hover:underline"
                          >
                            Seçimi kaldır
                          </button>
                        )}
                      </div>
                    )}

                    {zone.type === 'playlist' && (
                      <div>
                        <label className="text-sm font-medium text-textSecondary block mb-2">Playlist Seç</label>
                        <button
                          onClick={() => setShowPlaylistModal(true)}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text hover:border-primary transition-colors flex items-center justify-between"
                        >
                          <span className="text-sm">
                            {zone.playlistId 
                              ? playlists.find(p => p.id === zone.playlistId)?.name || 'Playlist seçin...'
                              : 'Playlist seçin...'
                            }
                          </span>
                          <List className="w-4 h-4 text-textSecondary" />
                        </button>
                        {zone.playlistId && (
                          <button
                            onClick={() => updateZone(selectedZone, { playlistId: undefined })}
                            className="mt-2 text-xs text-error hover:underline"
                          >
                            Seçimi kaldır
                          </button>
                        )}
                      </div>
                    )}

                    {zone.type === 'widgets' && (
                      <div>
                        <label className="text-sm font-medium text-textSecondary block mb-2">Widget Seç</label>
                        <button
                          onClick={() => setShowWidgetModal(true)}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text hover:border-primary transition-colors flex items-center justify-between"
                        >
                          <span>{zone.widgetInstanceId ? 'Widget Seçildi' : 'Widget Seçin'}</span>
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        {zone.widgetInstanceId && (
                          <button
                            onClick={() => updateZone(selectedZone, { widgetInstanceId: undefined })}
                            className="mt-2 w-full px-3 py-2 bg-error/10 border border-error/30 rounded-lg text-error hover:bg-error/20 transition-colors flex items-center justify-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Widget'ı Kaldır
                          </button>
                        )}
                      </div>
                    )}

                    {zone.type === 'text' && (
                      <div>
                        <label className="text-sm font-medium text-textSecondary block mb-2">Metin İçeriği</label>
                        <textarea
                          value={zone.content || ''}
                          onChange={(e) => updateZone(selectedZone, { content: e.target.value })}
                          placeholder="Metin içeriğini girin..."
                          rows={3}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-primary transition-colors resize-none"
                        />
                      </div>
                    )}

                    {/* Background Color */}
                    <div>
                      <label className="text-sm font-medium text-textSecondary block mb-2">Arkaplan Rengi</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={zone.backgroundColor || '#000000'}
                          onChange={(e) => updateZone(selectedZone, { backgroundColor: e.target.value })}
                          className="w-12 h-10 rounded border border-border cursor-pointer"
                        />
                        <input
                          type="text"
                          value={zone.backgroundColor || '#000000'}
                          onChange={(e) => updateZone(selectedZone, { backgroundColor: e.target.value })}
                          placeholder="#000000"
                          className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                    </div>

                    {/* Text Color (for text zones) */}
                    {zone.type === 'text' && (
                      <div>
                        <label className="text-sm font-medium text-textSecondary block mb-2">Metin Rengi</label>
                        <div className="flex items-center space-x-2">
                        <input
                            type="color"
                            value={zone.textColor || '#ffffff'}
                            onChange={(e) => updateZone(selectedZone, { textColor: e.target.value })}
                            className="w-12 h-10 rounded border border-border cursor-pointer"
                          />
                          <input
                            type="text"
                            value={zone.textColor || '#ffffff'}
                            onChange={(e) => updateZone(selectedZone, { textColor: e.target.value })}
                            placeholder="#ffffff"
                            className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                      </div>
                    )}

                    {/* Font Size (for text zones) */}
                    {zone.type === 'text' && (
                      <div>
                        <label className="text-sm font-medium text-textSecondary block mb-2">
                          Font Boyutu: {zone.fontSize || 16}px
                        </label>
                        <input
                          type="range"
                          min="8"
                          max="72"
                          value={zone.fontSize || 16}
                          onChange={(e) => updateZone(selectedZone, { fontSize: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                    )}

                    {/* Text Align (for text zones) */}
                    {zone.type === 'text' && (
                      <div>
                        <label className="text-sm font-medium text-textSecondary block mb-2">Hizalama</label>
                        <select
                          value={zone.textAlign || 'left'}
                          onChange={(e) => updateZone(selectedZone, { textAlign: e.target.value as any })}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-primary transition-colors"
                        >
                          <option value="left">Sol</option>
                          <option value="center">Orta</option>
                          <option value="right">Sağ</option>
                        </select>
                      </div>
                    )}

                    {/* Opacity */}
                    <div>
                      <label className="text-sm font-medium text-textSecondary block mb-2">
                        Opaklık: {Math.round((zone.opacity || 1) * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={(zone.opacity || 1) * 100}
                        onChange={(e) => updateZone(selectedZone, { opacity: parseInt(e.target.value) / 100 })}
                        className="w-full"
                      />
                    </div>

                    {/* Border Radius */}
                    <div>
                      <label className="text-sm font-medium text-textSecondary block mb-2">
                        Köşe Yuvarlaklığı: {zone.borderRadius || 0}px
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={zone.borderRadius || 0}
                        onChange={(e) => updateZone(selectedZone, { borderRadius: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>

                    {/* Border */}
                    <div>
                      <label className="text-sm font-medium text-textSecondary block mb-2">Kenarlık</label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <label className="text-xs text-textSecondary w-16">Genişlik:</label>
                        <input
                          type="number"
                            min="0"
                            max="20"
                            value={zone.borderWidth || 0}
                            onChange={(e) => updateZone(selectedZone, { borderWidth: parseInt(e.target.value) || 0 })}
                            className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                        {zone.borderWidth && zone.borderWidth > 0 && (
                          <div className="flex items-center space-x-2">
                            <label className="text-xs text-textSecondary w-16">Renk:</label>
                            <input
                              type="color"
                              value={zone.borderColor || '#ffffff'}
                              onChange={(e) => updateZone(selectedZone, { borderColor: e.target.value })}
                              className="w-12 h-10 rounded border border-border cursor-pointer"
                            />
                            <input
                              type="text"
                              value={zone.borderColor || '#ffffff'}
                              onChange={(e) => updateZone(selectedZone, { borderColor: e.target.value })}
                              placeholder="#ffffff"
                              className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-primary transition-colors"
                            />
                    </div>
                        )}
                      </div>
                    </div>

                    {/* Delete Button */}
                    <div className="pt-4 border-t border-border">
                    <button
                      onClick={() => deleteZone(selectedZone)}
                        className="w-full px-4 py-2 bg-error text-white rounded-lg hover:bg-error/90 transition-colors flex items-center justify-center space-x-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Bölgeyi Sil</span>
                    </button>
                    </div>
                  </div>
                );
              })() : (
                <div className="text-center py-12 text-textSecondary">
                  <Square className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Bir bölge seçin</p>
                  <p className="text-xs mt-1 opacity-75">Bölge ayarlarını görmek için bir bölge seçin</p>
            </div>
          )}
            </div>
        </div>

        {/* Canvas */}
        <div className={`${showPreview ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="bg-surface rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-textSecondary">
                {(() => {
                  if (layoutPreset === 'custom') {
                    return `${customDimensions.width} × ${customDimensions.height}`;
                  }
                  const presets = {
                    'landscape-hd': '1920 × 1080',
                    'portrait-hd': '1080 × 1920',
                    'landscape-4k': '3840 × 2160',
                    'portrait-4k': '2160 × 3840',
                    'square-hd': '1080 × 1080',
                    'ultrawide': '2560 × 1080'
                  };
                  return presets[layoutPreset as keyof typeof presets] || '1920 × 1080';
                })()} Canvas
              </div>
              <div className="flex items-center space-x-2">
                <Monitor className="w-4 h-4 text-textSecondary" />
                <span className="text-sm text-textSecondary">
                  {(() => {
                    if (layoutPreset === 'custom') {
                      return customDimensions.width >= customDimensions.height ? 'Landscape' : 'Portrait';
                    }
                    const orientations = {
                      'landscape-hd': 'Landscape',
                      'portrait-hd': 'Portrait',
                      'landscape-4k': 'Landscape',
                      'portrait-4k': 'Portrait',
                      'square-hd': 'Square',
                      'ultrawide': 'Ultrawide'
                    };
                    return orientations[layoutPreset as keyof typeof orientations] || 'Landscape';
                  })()} Preview
                </span>
              </div>
            </div>
            
            <div
              ref={canvasRef}
              className="relative rounded-lg overflow-hidden select-none"
              style={{
                width: '100%',
                backgroundColor: layoutBackgroundColor,
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
                aspectRatio: (() => {
                  if (layoutPreset === 'custom') {
                    return `${customDimensions.width}/${customDimensions.height}`;
                  }
                  // Hardcoded aspect ratios for each preset
                  const ratios = {
                    'landscape-hd': '1920/1080',
                    'portrait-hd': '1080/1920',
                    'landscape-4k': '3840/2160',
                    'portrait-4k': '2160/3840',
                    'square-hd': '1080/1080',
                    'ultrawide': '2560/1080'
                  };
                  return ratios[layoutPreset as keyof typeof ratios] || '1920/1080';
                })()
              }}
              onClick={handleCanvasClick}
            >
              {editorZones.map((zone, index) => {
                const colors = zoneTypeColors[zone.type];
                const Icon = zoneTypeIcons[zone.type];
                const zoneNumber = index + 1;
                
                return (
                  <div
                    key={zone.id}
                    data-zone-id={zone.id}
                    className={`absolute transition-all ${
                      selectedZone === zone.id 
                        ? 'border-primary shadow-lg shadow-primary/25 ring-2 ring-primary/50' 
                        : `${colors.border} hover:border-primary hover:shadow-lg hover:shadow-primary/10`
                    } ${tool === 'select' ? 'cursor-move' : 'cursor-pointer'} ${
                      draggedZone === zone.id ? 'z-50 opacity-75' : ''
                    }`}
                    style={{
                      left: `${zone.x}%`,
                      top: `${zone.y}%`,
                      width: `${zone.width}%`,
                      height: `${zone.height}%`,
                      backgroundColor: zone.backgroundColor || 'transparent',
                      opacity: zone.opacity !== undefined ? zone.opacity : 1,
                      borderRadius: zone.borderRadius ? `${zone.borderRadius}px` : '4px',
                      borderWidth: zone.borderWidth ? `${zone.borderWidth}px` : '3px',
                      borderStyle: 'dashed',
                      borderColor: zone.borderWidth && zone.borderWidth > 0 
                        ? (zone.borderColor || colors.solid)
                        : (selectedZone === zone.id ? 'var(--primary)' : colors.solid)
                    }}
                    onMouseDown={(e) => handleZoneMouseDown(e, zone.id)}
                  >
                    {/* Zone Number Badge */}
                    <div 
                      className="absolute -top-3 -left-3 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold pointer-events-none z-10"
                      style={{
                        backgroundColor: colors.solid,
                        color: '#ffffff',
                        border: '2px solid var(--background)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}
                    >
                      {zoneNumber}
                    </div>

                    <div 
                      className={`absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden`}
                      style={{
                        color: zone.type === 'text' && zone.textColor ? zone.textColor : 'inherit',
                        fontSize: zone.type === 'text' && zone.fontSize ? `${zone.fontSize}px` : 'inherit',
                        textAlign: zone.type === 'text' && zone.textAlign ? zone.textAlign : 'center'
                      }}
                    >
                      {/* Media Content */}
                      {zone.type === 'media' && zone.mediaId && (() => {
                        const media = mediaItems.find(m => m.id === zone.mediaId);
                        if (!media) return null;
                        
                        if (media.type === 'image') {
                          return (
                            <img
                              src={media.url.startsWith('http') ? media.url : (media.url.startsWith('/') ? media.url : `/api${media.url}`)}
                              alt={media.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error('LayoutDesigner - Image load error:', media.url, media);
                                const img = e.target as HTMLImageElement;
                                img.style.display = 'none';
                                // Show error placeholder
                                const parent = img.parentElement;
                                if (parent && !parent.querySelector('.media-error')) {
                                  const errorDiv = document.createElement('div');
                                  errorDiv.className = 'media-error absolute inset-0 flex items-center justify-center bg-red-500/20 text-red-300 text-xs';
                                  errorDiv.textContent = 'Resim yüklenemedi';
                                  parent.appendChild(errorDiv);
                                }
                              }}
                            />
                          );
                        } else if (media.type === 'video') {
                          const videoUrl = media.url.startsWith('http') ? media.url : (media.url.startsWith('/') ? media.url : `/api${media.url}`);
                          
                          return (
                            <div className="w-full h-full relative bg-black/50 overflow-hidden">
                              <video
                                src={videoUrl}
                                className="w-full h-full object-cover"
                                autoPlay
                                loop
                                muted
                                playsInline
                                preload="metadata"
                                onError={(e) => {
                                  const video = e.target as HTMLVideoElement;
                                  console.error('LayoutDesigner - Video load error:', videoUrl, video.error);
                                  video.style.display = 'none';
                                  // Show error placeholder
                                  const parent = video.parentElement;
                                  if (parent && !parent.querySelector('.media-error')) {
                                    const errorDiv = document.createElement('div');
                                    errorDiv.className = 'media-error absolute inset-0 flex items-center justify-center bg-red-500/20 text-red-300 text-xs';
                                    errorDiv.textContent = 'Video yüklenemedi';
                                    parent.appendChild(errorDiv);
                                  }
                                }}
                                onLoadStart={() => {
                                  // Remove any existing error placeholders when video starts loading
                                  const video = document.querySelector(`video[src="${videoUrl}"]`);
                                  if (video?.parentElement) {
                                    const errorDiv = video.parentElement.querySelector('.media-error');
                                    if (errorDiv) errorDiv.remove();
                                  }
                                }}
                              />
                              {/* Video Overlay - Sadece hover'da görünür */}
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/0 hover:bg-black/40 transition-colors pointer-events-none">
                                <Video className="w-6 h-6 text-white/90 mb-1 opacity-0 hover:opacity-100 transition-opacity" />
                                <span className="text-xs text-white/90 truncate px-2 font-medium opacity-0 hover:opacity-100 transition-opacity">{media.name}</span>
                              </div>
                            </div>
                          );
                        } else if (media.type === 'audio') {
                          return (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-black/50">
                              <Music className="w-12 h-12 text-white/70 mb-2" />
                              <span className="text-xs text-white/70 truncate px-2">{media.name}</span>
                            </div>
                          );
                        }
                        return null;
                      })()}
                      
                      {/* Playlist Content */}
                      {zone.type === 'playlist' && zone.playlistId && (() => {
                        const playlist = playlists.find(p => p.id === zone.playlistId);
                        if (!playlist) return null;
                        
                        return (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-black/30 p-2">
                            <List className="w-8 h-8 text-white/70 mb-1" />
                            <span className="text-xs text-white/90 font-medium truncate w-full text-center">{playlist.name}</span>
                            <span className="text-xs text-white/60 mt-1">{playlist.items.length} öğe</span>
                          </div>
                        );
                      })()}
                      
                      {/* Widget Content */}
                      {zone.type === 'widgets' && zone.widgetInstanceId && (() => {
                        const instance = widgetInstances.find((w: any) => w.id === zone.widgetInstanceId);
                        if (!instance || !instance.template) {
                          return (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-black/30 p-2">
                              <span className="text-xs text-white/70">Widget bulunamadı</span>
                            </div>
                          );
                        }
                        
                        const configParam = encodeURIComponent(JSON.stringify(instance.config));
                        const baseUrl = import.meta.env.VITE_API_URL || (
                          import.meta.env.MODE === 'production'
                            ? ''
                            : 'http://localhost:3001'
                        );
                        const iframeUrl = `${baseUrl}${instance.template.htmlUrl}?config=${configParam}`;
                        
                        return (
                          <iframe
                            src={iframeUrl}
                            className="w-full h-full border-0"
                            title={instance.name}
                            sandbox="allow-scripts allow-same-origin"
                            style={{ pointerEvents: 'none' }}
                          />
                        );
                      })()}
                      
                      {/* Text Content */}
                      {zone.type === 'text' && zone.content ? (
                        <div className="p-2 w-full h-full flex items-center" style={{ 
                          justifyContent: zone.textAlign === 'left' ? 'flex-start' : zone.textAlign === 'right' ? 'flex-end' : 'center',
                          textAlign: zone.textAlign || 'center'
                        }}>
                          <span style={{ fontSize: zone.fontSize ? `${zone.fontSize}px` : '16px' }}>
                            {zone.content}
                          </span>
                        </div>
                      ) : null}
                      
                      {/* Widget Content */}
                      {zone.type === 'widgets' && zone.content ? (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <Icon className="w-8 h-8 mb-1" style={{ color: colors.solid }} />
                          <span className="text-xs font-medium capitalize" style={{ color: colors.solid }}>
                            {zone.content}
                          </span>
                        </div>
                      ) : null}
                      
                      {/* Default/Empty State - Show icon only if no content */}
                      {!(
                        (zone.type === 'media' && zone.mediaId) ||
                        (zone.type === 'playlist' && zone.playlistId) ||
                        (zone.type === 'text' && zone.content) ||
                        (zone.type === 'widgets' && zone.content)
                      ) && (
                        <div className="text-center">
                          <Icon className="w-6 h-6 mx-auto mb-1" style={{ color: colors.solid }} />
                          <div className="text-xs font-medium capitalize" style={{ color: colors.solid }}>
                            {zone.type}
                          </div>
                        </div>
                      )}
                    </div>
                    {selectedZone === zone.id && (
                      <>
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full border-2 border-white pointer-events-none"></div>
                        {tool === 'select' && (
                          <>
                          <div className="absolute top-1 right-1 opacity-75 pointer-events-none">
                            <Move className="w-3 h-3 text-white" />
                          </div>
                            {/* Resize handle - bottom right corner */}
                            <div
                              className="absolute bottom-0 right-0 w-5 h-5 bg-primary border-2 border-white rounded-tl-lg cursor-nwse-resize hover:bg-primary/80 transition-colors z-10 shadow-lg"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                handleResizeMouseDown(e, zone.id);
                              }}
                              style={{
                                transform: 'translate(50%, 50%)'
                              }}
                              title="Boyutu değiştir"
                            />
                          </>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
              
              {editorZones.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center text-white/60">
                    <Square className="w-12 h-12 mx-auto mb-3" />
                    <h3 className="text-lg font-medium mb-2">Canvas Boş</h3>
                    <p className="text-sm">Bölge aracını seçin ve tıklayarak bölge ekleyin</p>
                    {tool !== 'zone' && (
                      <button
                        onClick={() => setTool('zone')}
                        className="mt-3 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors pointer-events-auto"
                      >
                        Bölge Aracını Seç
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              {isDragging && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-primary text-white text-xs rounded pointer-events-none">
                  Sürükleniyor...
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-textSecondary">
                {editorZones.length} bölge • {
                  tool === 'zone' ? 'Tıklayarak bölge ekleyin' : 
                  'Bölgeleri seçin ve sürükleyin'
                }
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setEditorZones([]);
                    setSelectedZone(null);
                  }}
                  className="px-3 py-1 text-xs bg-background hover:bg-border rounded transition-colors text-textSecondary"
                >
                  Temizle
                </button>
                <button className="px-3 py-1 text-xs bg-background hover:bg-border rounded transition-colors text-textSecondary">
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Panel - Right Side */}
        {showPreview && (
          <div className="lg:col-span-1">
            <div className="bg-surface rounded-xl border border-border p-4 sticky top-6">
              <h3 className="font-semibold text-text mb-4">Önizleme</h3>
              <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden border border-border">
                {editorZones.map((zone) => {
                  const colors = zoneTypeColors[zone.type];
                  const Icon = zoneTypeIcons[zone.type];
                  
                  return (
                    <div
                      key={zone.id}
                      className="absolute border-2 overflow-hidden"
                      style={{
                        left: `${zone.x}%`,
                        top: `${zone.y}%`,
                        width: `${zone.width}%`,
                        height: `${zone.height}%`,
                        backgroundColor: zone.backgroundColor || 'transparent',
                        opacity: zone.opacity !== undefined ? zone.opacity : 1,
                        borderRadius: zone.borderRadius ? `${zone.borderRadius}px` : '0',
                        borderWidth: zone.borderWidth ? `${zone.borderWidth}px` : '2px',
                        borderStyle: 'solid',
                        borderColor: zone.borderWidth && zone.borderWidth > 0 
                          ? (zone.borderColor || '#ffffff')
                          : 'rgba(255, 255, 255, 0.3)',
                        color: zone.type === 'text' && zone.textColor ? zone.textColor : 'inherit',
                        fontSize: zone.type === 'text' && zone.fontSize ? `${zone.fontSize}px` : '12px',
                        textAlign: zone.type === 'text' && zone.textAlign ? zone.textAlign : 'center'
                      }}
                    >
                      {/* Media Content in Preview */}
                      {zone.type === 'media' && zone.mediaId && (() => {
                        const media = mediaItems.find(m => m.id === zone.mediaId);
                        if (!media) return null;
                        
                        if (media.type === 'image') {
                          return (
                            <img
                              src={media.url.startsWith('http') ? media.url : (media.url.startsWith('/') ? media.url : `/api${media.url}`)}
                              alt={media.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          );
                        } else if (media.type === 'video') {
                          return (
                            <div className="w-full h-full relative bg-black/50 overflow-hidden">
                              {media.thumbnail ? (
                                <img
                                  src={media.thumbnail.startsWith('http') ? media.thumbnail : (media.thumbnail.startsWith('/') ? media.thumbnail : `/api${media.thumbnail}`)}
                                  alt={media.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <video
                                  src={media.url.startsWith('http') ? media.url : (media.url.startsWith('/') ? media.url : `/api${media.url}`)}
                                  className="w-full h-full object-cover"
                                  muted
                                  playsInline
                                  preload="auto"
                                  onLoadedData={(e) => {
                                    const video = e.target as HTMLVideoElement;
                                    if (video.readyState >= 2) { // HAVE_CURRENT_DATA
                                      if (video.duration >= 3) {
                                        video.currentTime = 3;
                                      } else if (video.duration > 0) {
                                        video.currentTime = video.duration / 2;
                                      }
                                    }
                                  }}
                                  onSeeked={(e) => {
                                    const video = e.target as HTMLVideoElement;
                                    video.pause();
                                  }}
                                  onCanPlay={(e) => {
                                    const video = e.target as HTMLVideoElement;
                                    if (video.currentTime < 1 && video.duration >= 3) {
                                      video.currentTime = 3;
                                    }
                                  }}
                                  onTimeUpdate={(e) => {
                                    const video = e.target as HTMLVideoElement;
                                    if (video.currentTime >= 3 && !video.paused) {
                                      video.pause();
                                    }
                                  }}
                                  onError={(e) => {
                                    const video = e.target as HTMLVideoElement;
                                    console.error('Video load error:', video.error);
                                    video.style.display = 'none';
                                  }}
                                />
                              )}
                            </div>
                          );
                        } else if (media.type === 'audio') {
                          return (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-black/50">
                              <Music className="w-6 h-6 text-white/70 mb-1" />
                              <span className="text-xs text-white/70 truncate px-1">{media.name}</span>
                            </div>
                          );
                        }
                        return null;
                      })()}
                      
                      {/* Playlist Content in Preview */}
                      {zone.type === 'playlist' && zone.playlistId && (() => {
                        const playlist = playlists.find(p => p.id === zone.playlistId);
                        if (!playlist) return null;
                        
                        return (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-black/30 p-1">
                            <List className="w-5 h-5 text-white/70 mb-0.5" />
                            <span className="text-xs text-white/90 font-medium truncate w-full text-center">{playlist.name}</span>
                            <span className="text-xs text-white/60">{playlist.items.length} öğe</span>
                          </div>
                        );
                      })()}
                      
                      {/* Widget Content in Preview */}
                      {zone.type === 'widgets' && zone.widgetInstanceId && (() => {
                        const instance = widgetInstances.find((w: any) => w.id === zone.widgetInstanceId);
                        if (!instance || !instance.template) {
                          return (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-black/30 p-1">
                              <span className="text-xs text-white/70">Widget</span>
                            </div>
                          );
                        }
                        
                        const configParam = encodeURIComponent(JSON.stringify(instance.config));
                        const baseUrl = import.meta.env.VITE_API_URL || (
                          import.meta.env.MODE === 'production'
                            ? ''
                            : 'http://localhost:3001'
                        );
                        const iframeUrl = `${baseUrl}${instance.template.htmlUrl}?config=${configParam}`;
                        
                        return (
                          <iframe
                            src={iframeUrl}
                            className="w-full h-full border-0"
                            title={instance.name}
                            sandbox="allow-scripts allow-same-origin"
                            style={{ pointerEvents: 'none' }}
                          />
                        );
                      })()}
                      
                      {/* Text Content in Preview */}
                      {zone.type === 'text' && zone.content ? (
                        <div className="p-2 w-full h-full flex items-center" style={{ 
                          justifyContent: zone.textAlign === 'left' ? 'flex-start' : zone.textAlign === 'right' ? 'flex-end' : 'center',
                          textAlign: zone.textAlign || 'center'
                        }}>
                          <span>{zone.content}</span>
                        </div>
                      ) : null}
                      
                      {/* Widget Content in Preview */}
                      {zone.type === 'widgets' && zone.content ? (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <Icon className="w-4 h-4 mb-0.5" />
                          <span className="text-xs font-medium capitalize truncate w-full text-center px-1">
                            {zone.content}
                          </span>
                        </div>
                      ) : null}
                      
                      {/* Default/Empty State */}
                      {!(
                        (zone.type === 'media' && zone.mediaId) ||
                        (zone.type === 'playlist' && zone.playlistId) ||
                        (zone.type === 'text' && zone.content) ||
                        (zone.type === 'widgets' && zone.content)
                      ) && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <Icon className="w-4 h-4 mx-auto mb-1" />
                            <div className="text-xs font-medium capitalize">{zone.type}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {editorZones.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white/40 text-sm">
                      Bölge ekleyin
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 text-xs text-textSecondary">
                <div className="flex items-center justify-between mb-2">
                  <span>Bölge Sayısı:</span>
                  <span className="font-medium text-text">{editorZones.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Seçili Bölge:</span>
                  <span className="font-medium text-text">
                    {selectedZone ? editorZones.findIndex(z => z.id === selectedZone) + 1 : '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Widget Selection Modal */}
      <AnimatePresence>
        {showWidgetModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowWidgetModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface border border-border rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-text">Widget Seç</h3>
                  <button
                    onClick={() => setShowWidgetModal(false)}
                    className="p-2 rounded-lg hover:bg-background transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-textSecondary mt-1">
                  Bölgeye eklemek için bir widget seçin
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {widgetInstances.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📦</div>
                    <h4 className="text-lg font-bold text-text mb-2">Henüz widget yüklemediniz</h4>
                    <p className="text-textSecondary mb-4">
                      Widget marketplace'den widget ekleyerek başlayın
                    </p>
                    <button
                      onClick={() => {
                        setShowWidgetModal(false);
                        window.location.hash = '#/apps/marketplace';
                      }}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Marketplace'e Git
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {widgetInstances.map((instance: any) => (
                      <button
                        key={instance.id}
                        onClick={() => {
                          if (selectedZone) {
                            updateZone(selectedZone, { widgetInstanceId: instance.id });
                          }
                          setShowWidgetModal(false);
                        }}
                        className="p-4 border border-border rounded-xl hover:border-primary transition-all text-left group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                            {instance.template?.icon || '📦'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base font-bold text-text mb-1 truncate">
                              {instance.name}
                            </h4>
                            <p className="text-sm text-textSecondary truncate">
                              {instance.template?.name}
                            </p>
                            <p className="text-xs text-textSecondary mt-1">
                              v{instance.template?.version}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media Selection Modal */}
      <AnimatePresence>
        {showMediaModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowMediaModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-text">Medya Seç</h2>
                  <button
                    onClick={() => setShowMediaModal(false)}
                    className="p-2 hover:bg-background rounded-lg transition-colors"
                  >
                    <span className="text-2xl text-textSecondary">×</span>
                  </button>
                </div>
                
                {/* Search and Filter */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-textSecondary" />
                    <input
                      type="text"
                      placeholder="Medya ara..."
                      value={mediaSearchTerm}
                      onChange={(e) => setMediaSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-text placeholder-textSecondary focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <select
                    value={mediaFilterType}
                    onChange={(e) => setMediaFilterType(e.target.value as any)}
                    className="px-4 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="all">Tümü</option>
                    <option value="image">Resimler</option>
                    <option value="video">Videolar</option>
                    <option value="audio">Ses</option>
                  </select>
                </div>
              </div>

              {/* Media Grid */}
              <div className="flex-1 overflow-y-auto p-6">
                {(() => {
                  const filteredMedia = mediaItems.filter(item => {
                    const matchesSearch = item.name.toLowerCase().includes(mediaSearchTerm.toLowerCase()) ||
                                         item.tags.some(tag => tag.toLowerCase().includes(mediaSearchTerm.toLowerCase()));
                    const matchesType = mediaFilterType === 'all' || item.type === mediaFilterType;
                    return matchesSearch && matchesType;
                  });

                  if (filteredMedia.length === 0) {
                    return (
                      <div className="text-center py-12 text-textSecondary">
                        <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Medya bulunamadı</p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {filteredMedia.map((item) => {
                        const isSelected = selectedZone && editorZones.find(z => z.id === selectedZone)?.mediaId === item.id;
                        const MediaIcon = item.type === 'video' ? Video : item.type === 'audio' ? Music : ImageIcon;
                        
                        return (
                          <motion.button
                            key={item.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              if (selectedZone) {
                                updateZone(selectedZone, { mediaId: item.id });
                                setShowMediaModal(false);
                              }
                            }}
                            className={`relative aspect-video bg-background rounded-lg border-2 overflow-hidden transition-all group ${
                              isSelected 
                                ? 'border-primary ring-2 ring-primary/50' 
                                : 'border-border hover:border-primary'
                            }`}
                          >
                            {item.type === 'image' ? (
                              <img
                                src={item.url.startsWith('http') ? item.url : (item.url.startsWith('/') ? item.url : `/api${item.url}`)}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : item.type === 'video' ? (
                              <div className="w-full h-full relative bg-black/50">
                                {item.thumbnail ? (
                                  <img
                                    src={item.thumbnail.startsWith('http') ? item.thumbnail : (item.thumbnail.startsWith('/') ? item.thumbnail : `/api${item.thumbnail}`)}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Video className="w-12 h-12 text-white/50" />
                                  </div>
                                )}
                                {/* Video Overlay - Sadece hover'da görünür */}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors pointer-events-none">
                                  <Video className="w-10 h-10 text-white/90 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </div>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <MediaIcon className="w-12 h-12 text-textSecondary" />
                              </div>
                            )}
                            
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity">
                              <div className="absolute bottom-0 left-0 right-0 p-2">
                                <p className="text-white text-xs font-medium truncate">{item.name}</p>
                                <p className="text-white/70 text-xs capitalize">{item.type}</p>
                              </div>
                            </div>

                            {/* Selected Indicator */}
                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                                <span className="text-xs">✓</span>
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Playlist Selection Modal */}
      <AnimatePresence>
        {showPlaylistModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPlaylistModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-text">Playlist Seç</h2>
                  <button
                    onClick={() => setShowPlaylistModal(false)}
                    className="p-2 hover:bg-background rounded-lg transition-colors"
                  >
                    <span className="text-2xl text-textSecondary">×</span>
                  </button>
                </div>
              </div>

              {/* Playlist List */}
              <div className="flex-1 overflow-y-auto p-6">
                {playlists.length === 0 ? (
                  <div className="text-center py-12 text-textSecondary">
                    <List className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Playlist bulunamadı</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {playlists.map((playlist) => {
                      const isSelected = selectedZone && editorZones.find(z => z.id === selectedZone)?.playlistId === playlist.id;
                      
                      return (
                        <motion.button
                          key={playlist.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => {
                            if (selectedZone) {
                              updateZone(selectedZone, { playlistId: playlist.id });
                              setShowPlaylistModal(false);
                            }
                          }}
                          className={`w-full p-4 bg-background border-2 rounded-lg text-left transition-all ${
                            isSelected 
                              ? 'border-primary bg-primary/10' 
                              : 'border-border hover:border-primary'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-text">{playlist.name}</p>
                              <p className="text-sm text-textSecondary mt-1">
                                {playlist.items.length} öğe • {Math.floor(playlist.duration / 60)}:{(playlist.duration % 60).toString().padStart(2, '0')}
                              </p>
                            </div>
                            {isSelected && (
                              <div className="bg-primary text-white rounded-full p-1">
                                <span className="text-xs">✓</span>
                              </div>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layout Settings Modal */}
      <AnimatePresence>
        {showLayoutSettingsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowLayoutSettingsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-text">Layout Ayarları</h2>
                  <button
                    onClick={() => setShowLayoutSettingsModal(false)}
                    className="p-2 hover:bg-background rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-textSecondary" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-text">Temel Bilgiler</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-2">
                      Layout İsmi *
                    </label>
                    <input
                      type="text"
                      value={layoutName}
                      onChange={(e) => setLayoutName(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-primary transition-colors"
                      placeholder="Layout adını girin..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-2">
                      Açıklama
                    </label>
                    <textarea
                      value={layoutDescription}
                      onChange={(e) => setLayoutDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-primary transition-colors resize-none"
                      placeholder="Layout açıklaması..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-2">
                      Kategori
                    </label>
                    <select
                      value={layoutCategory}
                      onChange={(e) => setLayoutCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-primary transition-colors"
                    >
                      {layoutCategories.map(category => (
                        <option key={category} value={category}>
                          {category === 'fullscreen' ? 'Tam Ekran' :
                           category === 'split' ? 'Bölünmüş' :
                           category === 'grid' ? 'Grid' :
                           category === 'sidebar' ? 'Yan Panel' :
                           category === 'creative' ? 'Yaratıcı' :
                           category === 'dashboard' ? 'Dashboard' :
                           category === 'ticker' ? 'Ticker' :
                           'Özel'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Dimensions */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-text">Boyutlar</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-2">
                      Preset Seçin
                    </label>
                    <select
                      value={layoutPreset}
                      onChange={(e) => setLayoutPreset(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-primary transition-colors"
                    >
                      <option value="landscape-hd">Landscape HD (1920x1080)</option>
                      <option value="portrait-hd">Portrait HD (1080x1920)</option>
                      <option value="landscape-4k">Landscape 4K (3840x2160)</option>
                      <option value="portrait-4k">Portrait 4K (2160x3840)</option>
                      <option value="square-hd">Square HD (1080x1080)</option>
                      <option value="ultrawide">Ultrawide (2560x1080)</option>
                      <option value="custom">Custom</option>
                      {Object.entries(layoutPresets).map(([key, preset]) => (
                        <option key={key} value={key}>
                          {preset.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {layoutPreset === 'custom' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-textSecondary mb-2">
                          Genişlik (px)
                        </label>
                        <input
                          type="number"
                          value={customDimensions.width}
                          onChange={(e) => setCustomDimensions(prev => ({
                            ...prev,
                            width: parseInt(e.target.value) || 1920
                          }))}
                          min="320"
                          max="7680"
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-textSecondary mb-2">
                          Yükseklik (px)
                        </label>
                        <input
                          type="number"
                          value={customDimensions.height}
                          onChange={(e) => setCustomDimensions(prev => ({
                            ...prev,
                            height: parseInt(e.target.value) || 1080
                          }))}
                          min="240"
                          max="4320"
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  {/* Current dimensions display */}
                  <div className="p-3 bg-background rounded-lg border border-border">
                    <div className="text-sm text-textSecondary mb-1">Mevcut Boyutlar:</div>
                    <div className="text-text font-medium">
                      {(() => {
                        if (layoutPreset === 'custom') {
                          return `${customDimensions.width} × ${customDimensions.height}`;
                        }
                        const presets = {
                          'landscape-hd': '1920 × 1080',
                          'portrait-hd': '1080 × 1920',
                          'landscape-4k': '3840 × 2160',
                          'portrait-4k': '2160 × 3840',
                          'square-hd': '1080 × 1080',
                          'ultrawide': '2560 × 1080'
                        };
                        return presets[layoutPreset as keyof typeof presets] || '1920 × 1080';
                      })()} px
                    </div>
                    <div className="text-xs text-textSecondary mt-1">
                      Oran: {(() => {
                        if (layoutPreset === 'custom') {
                          return customDimensions.width >= customDimensions.height ? 'Landscape' : 'Portrait';
                        }
                        const orientations = {
                          'landscape-hd': 'Landscape',
                          'portrait-hd': 'Portrait',
                          'landscape-4k': 'Landscape',
                          'portrait-4k': 'Portrait',
                          'square-hd': 'Square',
                          'ultrawide': 'Ultrawide'
                        };
                        return orientations[layoutPreset as keyof typeof orientations] || 'Landscape';
                      })()}
                    </div>
  
                  </div>
                </div>

                {/* Canvas Background Color */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-text">Canvas Arka Plan</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-2">
                      Canvas Arka Plan Rengi
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={layoutBackgroundColor}
                        onChange={(e) => setLayoutBackgroundColor(e.target.value)}
                        className="w-12 h-10 rounded border border-border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={layoutBackgroundColor}
                        onChange={(e) => setLayoutBackgroundColor(e.target.value)}
                        placeholder="#000000"
                        className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <p className="text-xs text-textSecondary mt-1">
                      Bu renk layout'un arka planında (tüm bölgelerin arkasında) görünecektir
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-border">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowLayoutSettingsModal(false)}
                    className="flex-1 px-4 py-3 border border-border rounded-xl text-textSecondary hover:text-text transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={() => setShowLayoutSettingsModal(false)}
                    className="flex-1 px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                  >
                    Ayarları Kaydet
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unsaved Changes Modal */}
      <AnimatePresence>
        {showUnsavedModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUnsavedModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-bold text-text mb-2">Kaydedilmemiş Değişiklikler</h2>
              <p className="text-textSecondary mb-6">
                Yaptığınız değişiklikler kaydedilmedi. Çıkmadan önce kaydetmek ister misiniz?
              </p>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowUnsavedModal(false)}
                  className="flex-1 px-4 py-3 border border-border rounded-xl text-textSecondary hover:text-text transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleDiscardAndExit}
                  className="flex-1 px-4 py-3 bg-background border border-border rounded-xl text-text hover:bg-border transition-colors"
                >
                  Kaydetmeden Çık
                </button>
                <button
                  onClick={handleSaveAndExit}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                >
                  Kaydet ve Çık
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
