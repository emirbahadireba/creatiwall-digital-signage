import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Video, Music, Plus, Search, Grid, List, Filter, Download, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';
import { generateVideoThumbnail } from '../utils/videoThumbnail';

const MediaLibrary = () => {
  const { mediaItems, uploadMediaFile, deleteMediaItem } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'audio'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [videoThumbnails, setVideoThumbnails] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');

  const filteredMedia = mediaItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'audio': return Music;
      default: return Image;
    }
  };

  const handleUpload = async (file: File, mediaData: { name?: string; type?: string; category?: string; tags?: string[] }) => {
    console.log('handleUpload called with:', { fileName: file.name, type: mediaData.type, fileType: file.type, size: file.size });
    
    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus('Dosya hazırlanıyor...');
    
    try {
      // Generate thumbnail for videos in frontend (no FFmpeg needed on server)
      let thumbnail: string | null = null;
      
      // Check both mediaData.type and file.type to be sure
      const isVideo = mediaData.type === 'video' || file.type.startsWith('video/');
      console.log('Is video?', isVideo, 'mediaData.type:', mediaData.type, 'file.type:', file.type);
      
      if (isVideo) {
        console.log('Video detected, starting thumbnail generation...');
        setUploadProgress(20);
        setUploadStatus('Video thumbnail oluşturuluyor...');
        
        try {
          console.log('Starting thumbnail generation for video:', file.name);
          toast.loading('Video thumbnail oluşturuluyor...', { id: 'thumbnail' });
          
          const videoUrl = URL.createObjectURL(file);
          console.log('Video URL created:', videoUrl);
          
          thumbnail = await generateVideoThumbnail(videoUrl, 3);
          
          URL.revokeObjectURL(videoUrl);
          
          if (thumbnail) {
            console.log('Thumbnail generated successfully, length:', thumbnail.length);
            toast.success('Thumbnail oluşturuldu!', { id: 'thumbnail' });
          } else {
            console.warn('Thumbnail generation returned null');
            toast.error('Thumbnail oluşturulamadı', { id: 'thumbnail' });
          }
        } catch (error) {
          console.error('Thumbnail generation failed:', error);
          toast.error('Thumbnail oluşturulamadı: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'), { id: 'thumbnail' });
          // Continue without thumbnail
        }
      } else {
        console.log('Not a video, skipping thumbnail generation');
      }

      console.log('Uploading file with thumbnail:', thumbnail ? 'Yes' : 'No');
      
      setUploadProgress(60);
      setUploadStatus('Dosya sunucuya yükleniyor...');
      
      // Upload file with thumbnail
      const newItem = await uploadMediaFile(file, {
        ...mediaData,
        ...(thumbnail && { thumbnail })
      });
      
      setUploadProgress(90);
      setUploadStatus('Upload tamamlanıyor...');
      
      // Store thumbnail in frontend state if generated
      if (thumbnail && newItem?.id) {
        console.log('Storing thumbnail in frontend state for item:', newItem.id);
        setVideoThumbnails(prev => ({
          ...prev,
          [newItem.id]: thumbnail
        }));
      }
      
      setShowUploadModal(false);
    } catch (error) {
      console.error('Upload error:', error);
      // Error is already handled in store
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`"${name}" dosyasını silmek istediğinizden emin misiniz?`)) {
      try {
        await deleteMediaItem(id);
      } catch (_error) {
        // Error is already handled in store
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">Medya Kütüphanesi</h1>
          <p className="text-textSecondary mt-1">Resim, video ve ses dosyalarınızı yönetin</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Medya Yükle</span>
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-textSecondary" />
          <input
            type="text"
            placeholder="Medya dosyası ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-text placeholder-textSecondary focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-textSecondary" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-3 bg-surface border border-border rounded-xl text-text focus:outline-none focus:border-primary transition-colors"
            >
              <option value="all">Tüm Türler</option>
              <option value="image">Resimler</option>
              <option value="video">Videolar</option>
              <option value="audio">Ses Dosyaları</option>
            </select>
          </div>
          
          <div className="flex items-center bg-surface border border-border rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-primary text-white' : 'text-textSecondary hover:text-text'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-primary text-white' : 'text-textSecondary hover:text-text'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Media Grid/List */}
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        : "space-y-4"
      }>
        <AnimatePresence>
          {filteredMedia.map((item, index) => {
            const MediaIcon = getMediaIcon(item.type);
            
            return viewMode === 'grid' ? (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                className="bg-surface border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all group"
              >
                <div className="relative aspect-video bg-background overflow-hidden">
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
                      {(videoThumbnails[item.id] || item.thumbnail) ? (
                        <img
                          src={videoThumbnails[item.id] || (item.thumbnail?.startsWith('http') ? item.thumbnail : (item.thumbnail?.startsWith('/') ? item.thumbnail : `/api${item.thumbnail}`))}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Thumbnail image load error for item:', item.id);
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                          onLoad={() => {
                            console.log('Thumbnail loaded successfully for item:', item.id);
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="w-12 h-12 text-white/50" />
                        </div>
                      )}
                      {/* Video Play Icon - Her zaman görünür */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-16 h-16 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <div className="w-0 h-0 border-l-[12px] border-l-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MediaIcon className="w-12 h-12 text-textSecondary" />
                    </div>
                  )}
                  
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex space-x-1">
                      <button className="p-2 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-black/70 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="p-2 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {item.duration && (
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 backdrop-blur-sm rounded text-white text-xs">
                      {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-medium text-text mb-1 truncate">{item.name}</h3>
                  <div className="flex items-center justify-between text-sm text-textSecondary">
                    <span className="capitalize">{item.type}</span>
                    <span>{formatFileSize(item.size)}</span>
                  </div>
                  
                  {item.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.tags.slice(0, 2).map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 2 && (
                        <span className="px-2 py-1 bg-background text-textSecondary text-xs rounded-full">
                          +{item.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-surface border border-border rounded-xl p-4 hover:border-primary/30 transition-all group"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-16 h-16 bg-background rounded-lg overflow-hidden">
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
                      <div className="w-full h-full relative">
                        {(videoThumbnails[item.id] || item.thumbnail) ? (
                          <img
                            src={videoThumbnails[item.id] || (item.thumbnail?.startsWith('http') ? item.thumbnail : (item.thumbnail?.startsWith('/') ? item.thumbnail : `/api${item.thumbnail}`))}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <video
                            src={item.url.startsWith('http') ? item.url : (item.url.startsWith('/') ? item.url : `/api${item.url}`)}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                            preload="auto"
                            onLoadedData={(e) => {
                              const video = e.target as HTMLVideoElement;
                              if (video.readyState >= 2) {
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
                        {/* Video Play Icon - List view için küçük */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <div className="w-0 h-0 border-l-[6px] border-l-white border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-0.5"></div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MediaIcon className="w-6 h-6 text-textSecondary" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-text mb-1 truncate">{item.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-textSecondary">
                      <span className="capitalize">{item.type}</span>
                      <span>{formatFileSize(item.size)}</span>
                      {item.duration && (
                        <span>{Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}</span>
                      )}
                      <span>{item.uploadDate.toLocaleDateString('tr-TR')}</span>
                    </div>
                    
                    {item.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex space-x-2">
                      <button className="p-2 rounded-lg hover:bg-background transition-colors">
                        <Download className="w-4 h-4 text-textSecondary hover:text-text" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="p-2 rounded-lg hover:bg-background transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-textSecondary hover:text-error" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-bold text-text mb-4">Medya Yükle</h2>
              
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const fileInput = (e.target as HTMLFormElement).querySelector('input[type="file"]') as HTMLInputElement;
                  const file = fileInput?.files?.[0];
                  
                  if (!file) {
                    toast.error('Lütfen bir dosya seçin');
                    return;
                  }

                  // Determine type from file - always use file type, ignore user selection
                  let fileType = 'image';
                  if (file.type.startsWith('video/')) fileType = 'video';
                  else if (file.type.startsWith('audio/')) fileType = 'audio';

                  console.log('Form submitted, detected file type:', fileType, 'file name:', file.name, 'file mime:', file.type);
                  
                  await handleUpload(file, {
                    name: formData.get('name') as string || file.name,
                    type: fileType, // Always use detected type, ignore user selection
                    category: (formData.get('category') as string) || undefined,
                    tags: (formData.get('tags') as string)?.split(',').map(tag => tag.trim()).filter(Boolean) || []
                  });
                }}
                className="space-y-4"
                encType="multipart/form-data"
              >
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Dosya Seç</label>
                  <input
                    type="file"
                    required
                    accept="image/*,video/*,audio/*"
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">Dosya Adı</label>
                  <input
                    type="text"
                    name="name"
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text focus:outline-none focus:border-primary"
                    placeholder="Otomatik olarak dosya adı kullanılacak"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Kategori</label>
                  <input
                    type="text"
                    name="category"
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text focus:outline-none focus:border-primary"
                    placeholder="Kategori (opsiyonel)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Etiketler (virgülle ayırın)</label>
                  <input
                    type="text"
                    name="tags"
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text focus:outline-none focus:border-primary"
                    placeholder="tanıtım, video, 2024"
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 px-4 py-3 border border-border rounded-xl text-textSecondary hover:text-text transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                  >
                    Yükle
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MediaLibrary;
