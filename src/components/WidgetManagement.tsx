import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Edit2, Trash2, Copy, ExternalLink, Files, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { WidgetInstance, WidgetTemplate } from '../types';
import WidgetConfigModal from './WidgetConfigModal';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const WidgetManagement = () => {
  const [instances, setInstances] = useState<(WidgetInstance & { template?: WidgetTemplate })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstance, setSelectedInstance] = useState<(WidgetInstance & { template?: WidgetTemplate }) | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInstances();
  }, []);

  const fetchInstances = async () => {
    setLoading(true);
    try {
      const data = await api.getWidgetInstances();
      setInstances(data);
    } catch (error: any) {
      console.error('Instances fetch error:', error);
      toast.error('Widget\'lar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleEditWidget = (instance: WidgetInstance & { template?: WidgetTemplate }) => {
    setSelectedInstance(instance);
    setShowConfigModal(true);
  };

  const handleConfigSave = async (name: string, config: Record<string, any>) => {
    if (!selectedInstance) return;

    try {
      await api.updateWidgetInstance(selectedInstance.id, { name, config });

      toast.success('Widget başarıyla güncellendi!');
      setShowConfigModal(false);
      setSelectedInstance(null);
      fetchInstances();
    } catch (error: any) {
      console.error('Update widget error:', error);
      toast.error('Widget güncellenirken hata oluştu');
    }
  };

  const handleDeleteWidget = async (id: string) => {
    if (!confirm('Bu widget\'ı silmek istediğinizden emin misiniz?')) return;

    try {
      await api.deleteWidgetInstance(id);

      toast.success('Widget başarıyla silindi!');
      fetchInstances();
    } catch (error: any) {
      console.error('Delete widget error:', error);
      toast.error('Widget silinirken hata oluştu');
    }
  };

  const handleDuplicateWidget = async (instance: WidgetInstance & { template?: WidgetTemplate }) => {
    try {
      await api.createWidgetInstance({
        templateId: instance.templateId,
        name: `${instance.name} (Kopya)`,
        config: instance.config
      });

      toast.success('Widget başarıyla kopyalandı!');
      fetchInstances();
    } catch (error: any) {
      console.error('Duplicate widget error:', error);
      toast.error('Widget kopyalanırken hata oluştu');
    }
  };

  const filteredInstances = instances.filter(instance =>
    instance.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    instance.template?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-textSecondary">Widget'larınız yükleniyor...</p>
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
          onClick={() => navigate('/apps')}
          className="flex-1 px-6 py-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 border-2 border-primary"
        >
          <Files className="w-5 h-5" />
          <span className="font-semibold">Kayıtlı Widgetlarım</span>
        </button>
        <button
          onClick={() => navigate('/apps/marketplace')}
          className="flex-1 px-6 py-4 bg-surface text-text rounded-xl hover:bg-background transition-all flex items-center justify-center gap-2 border-2 border-border hover:border-primary"
        >
          <ExternalLink className="w-5 h-5" />
          <span className="font-semibold">Widget Market</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-textSecondary" />
        <input
          type="text"
          placeholder="Widget ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-text placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {instances.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-2xl font-bold text-text mb-2">Henüz widget yüklemediniz</h3>
          <p className="text-textSecondary mb-6">Marketplace'den widget'lar ekleyerek başlayın</p>
          <button
            onClick={() => navigate('/apps/marketplace')}
            className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            İlk Widget'ınızı Yükleyin
          </button>
        </div>
      ) : (
        <>
          {/* Widget List */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredInstances.map(instance => (
                <motion.div
                  key={instance.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-surface border border-border rounded-2xl p-6 hover:border-primary transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Widget Icon */}
                      <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                        {instance.template?.icon || '📦'}
                      </div>

                      {/* Widget Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-text mb-1">{instance.name}</h3>
                        <p className="text-sm text-textSecondary mb-3">
                          {instance.template?.name} • v{instance.template?.version}
                        </p>
                        
                        {/* Config Preview */}
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(instance.config).slice(0, 3).map(([key, value]) => (
                            <span
                              key={key}
                              className="px-2 py-1 bg-background rounded-lg text-xs text-textSecondary"
                            >
                              {key}: {typeof value === 'boolean' ? (value ? 'Açık' : 'Kapalı') : String(value).slice(0, 20)}
                            </span>
                          ))}
                          {Object.keys(instance.config).length > 3 && (
                            <span className="px-2 py-1 bg-background rounded-lg text-xs text-textSecondary">
                              +{Object.keys(instance.config).length - 3} daha
                            </span>
                          )}
                        </div>

                        {/* Dates */}
                        <div className="mt-3 text-xs text-textSecondary">
                          Oluşturulma: {new Date(instance.createdAt).toLocaleDateString('tr-TR')} • 
                          Güncelleme: {new Date(instance.updatedAt).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditWidget(instance)}
                        className="p-2 rounded-lg hover:bg-background transition-colors text-textSecondary hover:text-primary"
                        title="Düzenle"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDuplicateWidget(instance)}
                        className="p-2 rounded-lg hover:bg-background transition-colors text-textSecondary hover:text-accent"
                        title="Kopyala"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteWidget(instance.id)}
                        className="p-2 rounded-lg hover:bg-background transition-colors text-textSecondary hover:text-error"
                        title="Sil"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredInstances.length === 0 && (
            <div className="text-center py-12">
              <p className="text-textSecondary">Aradığınız widget bulunamadı.</p>
            </div>
          )}
        </>
      )}

      {/* Edit Config Modal */}
      {showConfigModal && selectedInstance && selectedInstance.template && (
        <WidgetConfigModal
          template={selectedInstance.template}
          initialConfig={selectedInstance.config}
          initialName={selectedInstance.name}
          isEdit={true}
          onSave={handleConfigSave}
          onClose={() => {
            setShowConfigModal(false);
            setSelectedInstance(null);
          }}
        />
      )}
    </div>
  );
};

export default WidgetManagement;

