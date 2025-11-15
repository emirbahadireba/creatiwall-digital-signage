import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Plus, Filter, Settings, Play, Power, RefreshCw, Trash2, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { DeviceData } from '../types/api';
import toast from 'react-hot-toast';

const DeviceManagement = () => {
  const { devices, addDevice, updateDevice, deleteDevice } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline' | 'maintenance'>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [filterSize, setFilterSize] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Get unique locations and sizes
  const locations = Array.from(new Set(devices.map(d => d.location).filter(Boolean)));
  const sizes = Array.from(new Set(devices.map(d => {
    const res = d.resolution?.split('x') || [];
    if (res.length === 2) {
      const width = parseInt(res[0]);
      if (width >= 3840) return '4K';
      if (width >= 1920) return 'Full HD';
      return 'HD';
    }
    return null;
  }).filter(Boolean) as string[]));
  
  // Calculate summary stats
  const onlineCount = devices.filter(d => d.status === 'online').length;
  const offlineCount = devices.filter(d => d.status === 'offline').length;
  const maintenanceCount = devices.filter(d => d.status === 'maintenance').length;
  const totalCount = devices.length;

  const filteredDevices = devices.filter(device => {
    const name = device.name || '';
    const location = device.location || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || device.status === filterStatus;
    const matchesLocation = filterLocation === 'all' || device.location === filterLocation;
    const matchesSize = filterSize === 'all' || (() => {
      const res = device.resolution?.split('x') || [];
      if (res.length === 2) {
        const width = parseInt(res[0]);
        if (filterSize === '4K' && width >= 3840) return true;
        if (filterSize === 'Full HD' && width >= 1920 && width < 3840) return true;
        if (filterSize === 'HD' && width < 1920) return true;
      }
      return false;
    })();
    return matchesSearch && matchesStatus && matchesLocation && matchesSize;
  });

  const handleAddDevice = async (deviceData: Omit<DeviceData, 'id'>) => {
    try {
      await addDevice({
      ...deviceData,
      lastSeen: new Date(),
    });
    setShowAddModal(false);
    } catch (_error) {
      // Error is already handled in store
    }
  };

  const toggleDeviceStatus = async (deviceId: string, currentStatus: string) => {
    try {
    const newStatus = currentStatus === 'online' ? 'offline' : 'online';
      await updateDevice(deviceId, { 
      status: newStatus as any,
      lastSeen: new Date()
    });
    } catch (_error) {
      // Error is already handled in store
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">Cihaz Yönetimi</h1>
          <p className="text-textSecondary mt-1">Digital signage cihazlarını yönetin ve izleyin</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Cihaz</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Monitor className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-700">{onlineCount}</p>
            <p className="text-sm text-green-600">Çevrimiçi</p>
          </div>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center space-x-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Monitor className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-700">{offlineCount}</p>
            <p className="text-sm text-gray-600">Çevrimdışı</p>
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center space-x-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Settings className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-700">{maintenanceCount}</p>
            <p className="text-sm text-yellow-600">Bakımda</p>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Monitor className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-700">{totalCount}</p>
            <p className="text-sm text-blue-600">Toplam</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-textSecondary" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 bg-surface border border-border rounded-lg text-text focus:outline-none focus:border-primary transition-colors"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="online">Çevrimiçi</option>
            <option value="offline">Çevrimdışı</option>
            <option value="maintenance">Bakımda</option>
          </select>
        </div>
        
        <select
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
          className="px-4 py-2 bg-surface border border-border rounded-lg text-text focus:outline-none focus:border-primary transition-colors"
        >
          <option value="all">Tüm Lokasyonlar</option>
          {locations.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
        
        <select
          value={filterSize}
          onChange={(e) => setFilterSize(e.target.value)}
          className="px-4 py-2 bg-surface border border-border rounded-lg text-text focus:outline-none focus:border-primary transition-colors"
        >
          <option value="all">Tüm Boyutlar</option>
          {sizes.map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
        
        {(filterStatus !== 'all' || filterLocation !== 'all' || filterSize !== 'all') && (
          <button
            onClick={() => {
              setFilterStatus('all');
              setFilterLocation('all');
              setFilterSize('all');
            }}
            className="px-4 py-2 text-sm text-textSecondary hover:text-text transition-colors flex items-center space-x-1"
          >
            <X className="w-4 h-4" />
            <span>Filtreleri Temizle</span>
          </button>
        )}
      </div>

      {/* Device Grid */}
      {filteredDevices.length === 0 ? (
        <div className="text-center py-12">
          <Monitor className="w-16 h-16 mx-auto mb-4 text-textSecondary opacity-50" />
          <p className="text-textSecondary text-lg mb-2">
            {devices.length === 0 
              ? 'Henüz cihaz eklenmemiş' 
              : 'Arama kriterlerinize uygun cihaz bulunamadı'}
          </p>
          {devices.length === 0 && (
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
            >
              İlk Cihazı Ekle
            </button>
          )}
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
            {filteredDevices.map((device, index) => {
              const resolution = device.resolution || '1920x1080';
              const [width, height] = resolution.split('x').map(Number);
              const diagonal = Math.sqrt(width * width + height * height) / 96;
              const screenSize = Math.round(diagonal);
              
              return (
            <motion.div
              key={device.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.1 }}
                  className={`relative rounded-xl p-4 border-2 transition-all ${
                    device.status === 'online' 
                      ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      device.status === 'online' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-400 text-white'
                  }`}>
                      {device.status === 'online' ? 'ONLİNE' : 'OFFLINE'}
                    </span>
                  </div>

                  {/* Monitor Icon - Smaller */}
                  <div className="flex justify-center mb-2">
                    <Monitor className={`w-10 h-10 ${
                      device.status === 'online' ? 'text-green-600' : 'text-gray-400'
                    }`} />
                  </div>

                  {/* Resolution and Size - Compact */}
                  <div className="text-center mb-2">
                    <p className="text-sm font-semibold text-gray-800">{resolution}</p>
                    <p className="text-xs text-gray-600">{screenSize}"</p>
                </div>
                
                  {/* Device Info - Compact */}
                  <div className="space-y-1 mb-2 text-xs">
                    <div>
                      <p className="text-gray-500">Cihaz Adı</p>
                      <p className="font-semibold text-gray-800">{device.name}</p>
              </div>
                    <div>
                      <p className="text-gray-500">Konum</p>
                      <p className="text-gray-700">{device.location}</p>
                </div>
                    <div>
                      <p className="text-gray-500">Player Tipi</p>
                      <p className="text-gray-700">CreatiWall Player</p>
                </div>
                    <div>
                      <p className="text-gray-500">IP Adresi</p>
                      <p className="text-gray-700">192.168.1.{100 + index}</p>
                </div>
              </div>

                  {/* Content Status - Compact */}
                  <div className={`mb-2 p-1.5 rounded text-center text-xs font-medium ${
                    device.currentPlaylistId 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-red-100 text-red-700'
                }`}>
                    {device.currentPlaylistId ? `▲ Liste${index + 1}` : '▲ No content assigned'}
                </div>
                
                  {/* Action Buttons - Smaller */}
                  <div className="flex items-center justify-center space-x-1.5">
                    <button className="p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors">
                      <Play className="w-3 h-3" />
                    </button>
                <button
                  onClick={() => toggleDeviceStatus(device.id, device.status)}
                      className="p-1.5 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                    >
                      <Power className="w-3 h-3" />
                    </button>
                    <button className="p-1.5 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors">
                      <RefreshCw className="w-3 h-3" />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm('Bu cihazı silmek istediğinize emin misiniz?')) {
                          await deleteDevice(device.id);
                        }
                      }}
                      className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <button className="p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors">
                      <Settings className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
              );
            })}
        </AnimatePresence>
      </div>
      )}

      {/* Add Device Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-bold text-text mb-4">Yeni Cihaz Ekle</h2>
              
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  handleAddDevice({
                    name: formData.get('name') as string,
                    location: formData.get('location') as string,
                    resolution: formData.get('resolution') as string,
                    orientation: formData.get('orientation') as 'landscape' | 'portrait',
                    status: 'offline'
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Cihaz Adı</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text focus:outline-none focus:border-primary"
                    placeholder="Örn: Lobby Display"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Konum</label>
                  <input
                    type="text"
                    name="location"
                    required
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text focus:outline-none focus:border-primary"
                    placeholder="Örn: Ana Giriş"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Çözünürlük</label>
                  <select
                    name="resolution"
                    required
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text focus:outline-none focus:border-primary"
                  >
                    <option value="1920x1080">1920x1080 (Full HD)</option>
                    <option value="3840x2160">3840x2160 (4K)</option>
                    <option value="1080x1920">1080x1920 (Portrait Full HD)</option>
                    <option value="2160x3840">2160x3840 (Portrait 4K)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Yönlendirme</label>
                  <select
                    name="orientation"
                    required
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text focus:outline-none focus:border-primary"
                  >
                    <option value="landscape">Yatay</option>
                    <option value="portrait">Dikey</option>
                  </select>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-3 border border-border rounded-xl text-textSecondary hover:text-text transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                  >
                    Ekle
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

export default DeviceManagement;
