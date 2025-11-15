import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useStore } from './store/useStore';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import DeviceManagement from './components/DeviceManagement';
import MediaLibrary from './components/MediaLibrary';
import LayoutDesigner from './components/LayoutDesigner';
import PlaylistManager from './components/PlaylistManager';
import Scheduler from './components/Scheduler';
import WidgetMarketplace from './components/WidgetMarketplace';
import WidgetManagement from './components/WidgetManagement';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffc000] mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffc000] mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Main App Content Component
const AppContent: React.FC = () => {
  const { sidebarCollapsed, theme, fetchAll } = useStore();
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    // Fetch all data on app load only if authenticated
    if (isAuthenticated) {
      fetchAll();
    }
  }, [fetchAll, isAuthenticated]);

  useEffect(() => {
    // Initialize theme
    document.documentElement.className = theme;
  }, [theme]);

  return (
    <div className={`min-h-screen bg-background transition-colors duration-300 ${theme}`}>
      <Router>
        <Routes>
          {/* Public Routes - full screen without sidebar */}
          <Route path="/landing" element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          } />
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          
          {/* Protected Routes - Main app with sidebar */}
          <Route path="/*" element={
            <ProtectedRoute>
              <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Header />
                  <main
                    className={`flex-1 overflow-auto pt-16 transition-all duration-300`}
                    style={{
                      marginLeft: sidebarCollapsed ? '80px' : '280px',
                      transition: 'margin-left 300ms ease'
                    }}
                  >
                    <div className="p-6">
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/devices" element={<DeviceManagement />} />
                        <Route path="/media" element={<MediaLibrary />} />
                        <Route path="/layouts" element={<LayoutDesigner />} />
                        <Route path="/playlists" element={<PlaylistManager />} />
                        <Route path="/scheduler" element={<Scheduler />} />
                        <Route path="/apps" element={<WidgetManagement />} />
                        <Route path="/apps/marketplace" element={<WidgetMarketplace />} />
                        <Route path="/overlays" element={
                          <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                              <div className="text-6xl mb-4">🎨</div>
                              <h2 className="text-2xl font-bold text-text mb-2">Overlay & Widgets</h2>
                              <p className="text-textSecondary">Bu özellik yakında kullanıma sunulacak</p>
                            </div>
                          </div>
                        } />
                        <Route path="/reports" element={
                          <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                              <div className="text-6xl mb-4">📊</div>
                              <h2 className="text-2xl font-bold text-text mb-2">Raporlar</h2>
                              <p className="text-textSecondary">Bu özellik yakında kullanıma sunulacak</p>
                            </div>
                          </div>
                        } />
                        <Route path="/users" element={
                          <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                              <div className="text-6xl mb-4">👥</div>
                              <h2 className="text-2xl font-bold text-text mb-2">Kullanıcı Yönetimi</h2>
                              <p className="text-textSecondary">Bu özellik yakında kullanıma sunulacak</p>
                            </div>
                          </div>
                        } />
                      </Routes>
                    </div>
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--surface)',
            color: 'var(--text)',
            border: '1px solid var(--border)'
          }
        }}
      />
    </div>
  );
};

// Root App Component with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
