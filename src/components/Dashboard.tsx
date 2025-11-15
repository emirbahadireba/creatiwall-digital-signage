import React from 'react';
import { motion } from 'framer-motion';
import { Monitor, Image, Play, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';

const Dashboard = () => {
  const { devices, mediaItems, playlists } = useStore();

  const stats = [
    {
      title: 'Aktif Cihazlar',
      value: devices.filter(d => d.status === 'online').length,
      total: devices.length,
      icon: Monitor,
      color: 'text-success',
      bgColor: 'bg-success/10',
      change: '+12%',
      changeColor: 'text-success'
    },
    {
      title: 'Medya Dosyaları',
      value: mediaItems.length,
      total: null,
      icon: Image,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      change: '+5%',
      changeColor: 'text-success'
    },
    {
      title: 'Aktif Playlist',
      value: playlists.filter(p => p.loop).length,
      total: playlists.length,
      icon: Play,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      change: '+8%',
      changeColor: 'text-success'
    },
    {
      title: 'Toplam İzlenme',
      value: '2.4K',
      total: null,
      icon: TrendingUp,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      change: '+15%',
      changeColor: 'text-success'
    }
  ];

  const recentActivity = [
    { type: 'device', message: 'Lobby Display cihazı çevrimiçi oldu', time: '2 dakika önce', icon: Monitor, color: 'text-success' },
    { type: 'media', message: 'Yeni video yüklendi: Tanıtım 2024', time: '15 dakika önce', icon: Image, color: 'text-primary' },
    { type: 'playlist', message: 'Ana Playlist güncellendi', time: '1 saat önce', icon: Play, color: 'text-accent' },
    { type: 'alert', message: 'Cafeteria TV bağlantısı kesildi', time: '2 saat önce', icon: AlertCircle, color: 'text-error' }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">Dashboard</h1>
          <p className="text-textSecondary mt-1">Digital signage sistemi genel bakış</p>
        </div>
        <div className="flex items-center space-x-2 text-textSecondary">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">{new Date().toLocaleDateString('tr-TR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-surface border border-border rounded-2xl p-6 hover:border-primary/30 transition-colors group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className={`text-sm font-medium ${stat.changeColor}`}>
                  {stat.change}
                </span>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-text">{stat.value}</span>
                  {stat.total && (
                    <span className="text-textSecondary">/ {stat.total}</span>
                  )}
                </div>
                <p className="text-sm text-textSecondary">{stat.title}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Status */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-surface border border-border rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text">Cihaz Durumu</h2>
            <button className="text-sm text-primary hover:text-primary/80 transition-colors">
              Tümünü Gör →
            </button>
          </div>
          
          <div className="space-y-4">
            {devices.map((device, index) => (
              <motion.div
                key={device.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center justify-between p-4 bg-background rounded-xl border border-border"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <Monitor className="w-8 h-8 text-textSecondary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-text">{device.name}</h3>
                    <p className="text-sm text-textSecondary">{device.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-textSecondary">{device.resolution}</span>
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
                    device.status === 'online' 
                      ? 'bg-success/10 text-success' 
                      : device.status === 'offline'
                      ? 'bg-error/10 text-error'
                      : 'bg-warning/10 text-warning'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      device.status === 'online' 
                        ? 'bg-success' 
                        : device.status === 'offline'
                        ? 'bg-error'
                        : 'bg-warning'
                    }`} />
                    <span className="capitalize">{device.status === 'online' ? 'Çevrimiçi' : device.status === 'offline' ? 'Çevrimdışı' : 'Bakım'}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-surface border border-border rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold text-text mb-6">Son Aktiviteler</h2>
          
          <div className="space-y-4">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-start space-x-3 p-3 rounded-xl hover:bg-background transition-colors"
                >
                  <div className={`p-2 rounded-lg bg-background ${activity.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text font-medium mb-1">{activity.message}</p>
                    <p className="text-xs text-textSecondary">{activity.time}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
