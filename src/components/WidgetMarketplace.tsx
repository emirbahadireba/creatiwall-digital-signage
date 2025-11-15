import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, X, Eye, Download, Star, Clock, CloudRain, Rss, Files, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { WidgetTemplate } from '../types';
import WidgetConfigModal from './WidgetConfigModal';
import { api } from '../services/api';

const WidgetMarketplace = () => {
  const [templates, setTemplates] = useState<WidgetTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<WidgetTemplate | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const categories = [
    { id: 'all', label: 'Tümü', icon: Star },
    { id: 'time', label: 'Zaman', icon: Clock },
    { id: 'weather', label: 'Hava Durumu', icon: CloudRain },
    { id: 'data', label: 'Veri', icon: Rss },
    { id: 'social', label: 'Sosyal Medya', icon: Star },
    { id: 'interactive', label: 'İnteraktif', icon: Star },
    { id: 'custom', label: 'Özel', icon: Star }
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const data = await api.get<WidgetTemplate[]>('/widgets/templates');
      setTemplates(data);
    } catch (error: any) {
      console.error('Templates fetch error:', error);
      toast.error('Widget\'lar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleInstallWidget = (template: WidgetTemplate) => {
    setSelectedTemplate(template);
    setShowConfigModal(true);
  };

  const handleConfigSave = async (name: string, config: Record<string, unknown>) => {
    if (!selectedTemplate) return;

    try {
      await api.post('/widgets/instances', {
        templateId: selectedTemplate.id,
        name,
        config
      });

      toast.success('Widget başarıyla yüklendi!');
      setShowConfigModal(false);
      setSelectedTemplate(null);
    } catch (error: unknown) {
      console.error('Install widget error:', error);
      toast.error('Widget yüklenirken hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-textSecondary">Widget'lar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text mb-2">Uygulamalar</h1>
        <p className="text-textSecondary">Widget'larınızı yönetin ve yeni widget'lar keşfedin</p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => window.location.hash = '#/apps'}
          className="flex-1 px-6 py-4 bg-surface text-text rounded-xl hover:bg-background transition-all flex items-center justify-center gap-2 border-2 border-border hover:border-primary"
        >
          <Files className="w-5 h-5" />
          <span className="font-semibold">Kayıtlı Widgetlarım</span>
        </button>
        <button
          onClick={() => window.location.hash = '#/apps/marketplace'}
          className="flex-1 px-6 py-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 border-2 border-primary"
        >
          <ExternalLink className="w-5 h-5" />
          <span className="font-semibold">Widget Market</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-textSecondary" />
          <input
            type="text"
            placeholder="Widget ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-text placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(category => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                selectedCategory === category.id
                  ? 'bg-primary text-white'
                  : 'bg-surface text-textSecondary hover:bg-background'
              }`}
            >
              <Icon className="w-4 h-4" />
              {category.label}
            </button>
          );
        })}
      </div>

      {/* Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredTemplates.map(template => (
            <motion.div
              key={template.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-surface border border-border rounded-2xl overflow-hidden hover:border-primary transition-all group"
            >
              {/* Widget Icon/Thumbnail */}
              <div className="h-32 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative overflow-hidden">
                <span className="text-6xl">{template.icon}</span>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => handleInstallWidget(template)}
                    className="p-3 bg-primary rounded-full hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-5 h-5 text-white" />
                  </button>
                </div>
                {template.isPremium && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-accent rounded-lg text-xs font-bold text-white">
                    PRO
                  </div>
                )}
              </div>

              {/* Widget Info */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-text mb-1">{template.name}</h3>
                  <p className="text-sm text-textSecondary line-clamp-2">{template.description}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-textSecondary">
                  <span>v{template.version}</span>
                  <span>{template.author}</span>
                </div>

                {template.requirements && template.requirements.length > 0 && (
                  <div className="text-xs text-warning">
                    ⚠️ {template.requirements.join(', ')}
                  </div>
                )}

                <button
                  onClick={() => handleInstallWidget(template)}
                  className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Yükle & Yapılandır
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-textSecondary">Aradığınız kriterlere uygun widget bulunamadı.</p>
        </div>
      )}

      {/* Config Modal */}
      {showConfigModal && selectedTemplate && (
        <WidgetConfigModal
          template={selectedTemplate}
          initialConfig={selectedTemplate.defaultConfig}
          onSave={handleConfigSave}
          onClose={() => {
            setShowConfigModal(false);
            setSelectedTemplate(null);
          }}
        />
      )}
    </div>
  );
};

export default WidgetMarketplace;

