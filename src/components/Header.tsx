import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, Sun, Moon, Settings, LogOut, User } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { theme, toggleTheme, sidebarCollapsed } = useStore();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <motion.header
      className="fixed top-0 right-0 h-16 bg-surface/80 backdrop-blur-xl border-b border-border z-20 flex items-center justify-between px-6"
      style={{ left: sidebarCollapsed ? '80px' : '280px' }}
      initial={false}
      animate={{ left: sidebarCollapsed ? '80px' : '280px' }}
    >
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-textSecondary" />
          <input
            type="text"
            placeholder="Cihaz, medya veya layout ara..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-text placeholder-textSecondary focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-background transition-colors text-textSecondary hover:text-text"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-lg hover:bg-background transition-colors text-textSecondary hover:text-text relative">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
          </span>
        </button>

        {/* Settings */}
        <button className="p-2 rounded-lg hover:bg-background transition-colors text-textSecondary hover:text-text">
          <Settings className="w-5 h-5" />
        </button>

        {/* User Info & Logout */}
        <div className="flex items-center space-x-3 pl-4 border-l border-border">
          {/* User Avatar */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-text">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-textSecondary">{user?.role}</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-error/10 transition-colors text-textSecondary hover:text-error group"
            title="Çıkış Yap"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
