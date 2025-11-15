import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Monitor,
  Image,
  Layout,
  List,
  Calendar,
  Layers,
  BarChart3,
  Users,
  Menu,
  Home,
  Grid3x3
} from 'lucide-react';
import { useStore } from '../store/useStore';

const Sidebar = () => {
  const { sidebarCollapsed, toggleSidebar, hasUnsavedLayoutChanges, setHasUnsavedLayoutChanges } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [showUnsavedModal, setShowUnsavedModal] = React.useState(false);
  const [pendingPath, setPendingPath] = React.useState<string | null>(null);

  const handleNavigation = (path: string) => {
    if (hasUnsavedLayoutChanges && location.pathname === '/layouts') {
      setPendingPath(path);
      setShowUnsavedModal(true);
    } else {
      navigate(path);
    }
  };

  const handleDiscardAndNavigate = () => {
    setHasUnsavedLayoutChanges(false);
    if (pendingPath) {
      navigate(pendingPath);
      setPendingPath(null);
    }
    setShowUnsavedModal(false);
  };

  const handleSaveAndNavigate = () => {
    // Navigate to layouts page first, then user can save there
    setShowUnsavedModal(false);
    if (pendingPath) {
      // Store the pending path to navigate after save
      navigate('/layouts');
      // Note: User will need to save manually in LayoutDesigner
      // We could add a flag to auto-trigger save, but for now this is simpler
      setTimeout(() => {
        if (pendingPath) {
          navigate(pendingPath);
          setPendingPath(null);
        }
      }, 100);
    }
  };

  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard', color: 'text-primary' },
    { path: '/devices', icon: Monitor, label: 'Cihazlar', color: 'text-secondary' },
    { path: '/media', icon: Image, label: 'Medya', color: 'text-accent' },
    { path: '/layouts', icon: Layout, label: 'Layout', color: 'text-success' },
    { path: '/playlists', icon: List, label: 'Playlist', color: 'text-warning' },
    { path: '/scheduler', icon: Calendar, label: 'Zamanlama', color: 'text-error' },
    { path: '/apps', icon: Grid3x3, label: 'Uygulamalar', color: 'text-accent' },
    { path: '/overlays', icon: Layers, label: 'Overlay', color: 'text-primary' },
    { path: '/reports', icon: BarChart3, label: 'Raporlar', color: 'text-secondary' },
    { path: '/users', icon: Users, label: 'Kullanıcılar', color: 'text-accent' }
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 80 : 280 }}
      className="fixed left-0 top-0 h-full bg-surface border-r border-border z-30 flex flex-col"
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Monitor className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-text">CreatiWall</h1>
              <p className="text-xs text-textSecondary">Digital Signage</p>
            </div>
          </motion.div>
        )}
        
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-background transition-colors text-textSecondary hover:text-text"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <li key={item.path}>
                {location.pathname === '/layouts' && hasUnsavedLayoutChanges ? (
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all group relative w-full text-left ${
                      isActive
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'hover:bg-background text-textSecondary hover:text-text'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : item.color}`} />
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="font-medium"
                      >
                        {item.label}
                      </motion.span>
                    )}
                    
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute right-0 w-1 h-8 bg-primary rounded-l-full"
                      />
                    )}
                  </button>
                ) : (
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all group relative ${
                      isActive
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'hover:bg-background text-textSecondary hover:text-text'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : item.color}`} />
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="font-medium"
                      >
                        {item.label}
                      </motion.span>
                    )}
                    
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute right-0 w-1 h-8 bg-primary rounded-l-full"
                      />
                    )}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="w-8 h-8 bg-gradient-to-br from-success to-accent rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">A</span>
          </div>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="text-sm font-medium text-text">Admin User</p>
              <p className="text-xs text-textSecondary">Süper Admin</p>
            </motion.div>
          )}
        </div>
      </div>

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
                  onClick={handleDiscardAndNavigate}
                  className="flex-1 px-4 py-3 bg-background border border-border rounded-xl text-text hover:bg-border transition-colors"
                >
                  Kaydetmeden Çık
                </button>
                <button
                  onClick={handleSaveAndNavigate}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                >
                  Kaydet ve Çık
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
};

export default Sidebar;
