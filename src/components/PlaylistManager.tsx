import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Plus, 
  Edit, 
  Trash2, 
  Shuffle, 
  Repeat,
  ArrowUp,
  ArrowDown,
  FileImage,
  Video
} from 'lucide-react';
import { useStore } from '../store/useStore';

export default function PlaylistManager() {
  const { playlists, mediaItems } = useStore();
  const [selectedPlaylist, setSelectedPlaylist] = useState(playlists[0]);
  const [isPlaying, setIsPlaying] = useState(false);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-text">Playlist Yönetimi</h1>
          <p className="text-textSecondary mt-1">Medya listelerinizi oluşturun ve düzenleyin</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Yeni Playlist</span>
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Playlist List */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-text mb-4">Playlist'ler</h2>
          <div className="space-y-3">
            {playlists.map((playlist) => (
              <motion.div
                key={playlist.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedPlaylist(playlist)}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  selectedPlaylist?.id === playlist.id
                    ? 'bg-primary/10 border-primary border'
                    : 'bg-surface border border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-text">{playlist.name}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPlaying(!isPlaying);
                    }}
                    className="p-1 hover:bg-primary/20 rounded transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 text-primary" />
                    ) : (
                      <Play className="w-4 h-4 text-primary" />
                    )}
                  </button>
                </div>
                <p className="text-sm text-textSecondary mb-2">{playlist.description}</p>
                <div className="flex items-center justify-between text-xs text-textSecondary">
                  <span>{playlist.items.length} öğe</span>
                  <span>{formatDuration(playlist.duration || 0)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Playlist Details */}
        <div className="lg:col-span-2">
          {selectedPlaylist && (
            <div className="space-y-6">
              {/* Playlist Info */}
              <div className="bg-surface rounded-xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-text">{selectedPlaylist.name}</h2>
                    <p className="text-textSecondary">{selectedPlaylist.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-background rounded-lg transition-colors">
                      <Edit className="w-5 h-5 text-textSecondary" />
                    </button>
                    <button className="p-2 hover:bg-background rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5 text-textSecondary" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-text">{selectedPlaylist.items.length}</div>
                    <div className="text-sm text-textSecondary">Medya</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-text">{formatDuration(selectedPlaylist.duration || 0)}</div>
                    <div className="text-sm text-textSecondary">Süre</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Repeat className={`w-5 h-5 ${selectedPlaylist.loop ? 'text-primary' : 'text-textSecondary'}`} />
                    </div>
                    <div className="text-sm text-textSecondary">Döngü</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Shuffle className={`w-5 h-5 ${selectedPlaylist.shuffle ? 'text-primary' : 'text-textSecondary'}`} />
                    </div>
                    <div className="text-sm text-textSecondary">Karıştır</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    <span>{isPlaying ? 'Duraklat' : 'Oynat'}</span>
                  </motion.button>
                  <button className="px-4 py-2 bg-surface border border-border text-text rounded-xl hover:bg-background transition-colors">
                    Önizleme
                  </button>
                </div>
              </div>

              {/* Playlist Items */}
              <div className="bg-surface rounded-xl border border-border">
                <div className="px-6 py-4 border-b border-border">
                  <h3 className="font-semibold text-text">Medya Listesi</h3>
                </div>
                <div className="divide-y divide-border">
                  {selectedPlaylist.items.map((item, index) => {
                    const mediaItem = mediaItems.find(m => m.id === item.mediaId);
                    if (!mediaItem) return null;

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="px-6 py-4 hover:bg-background/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-background rounded-lg flex items-center justify-center flex-shrink-0">
                            {mediaItem.type === 'image' ? (
                              <FileImage className="w-4 h-4 text-textSecondary" />
                            ) : (
                              <Video className="w-4 h-4 text-textSecondary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-text truncate">{mediaItem.name}</div>
                            <div className="text-sm text-textSecondary">
                              {formatDuration(item.duration)} • {item.transition} geçiş
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="p-1 hover:bg-primary/10 rounded transition-colors">
                              <ArrowUp className="w-4 h-4 text-textSecondary" />
                            </button>
                            <button className="p-1 hover:bg-primary/10 rounded transition-colors">
                              <ArrowDown className="w-4 h-4 text-textSecondary" />
                            </button>
                            <button className="p-1 hover:bg-error/10 rounded transition-colors">
                              <Trash2 className="w-4 h-4 text-textSecondary hover:text-error" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
