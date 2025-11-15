import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Eye } from 'lucide-react';
import { WidgetTemplate, WidgetConfigField } from '../types';

interface WidgetConfigModalProps {
  template: WidgetTemplate;
  initialConfig: Record<string, any>;
  onSave: (name: string, config: Record<string, any>) => void;
  onClose: () => void;
  isEdit?: boolean;
  initialName?: string;
}

const WidgetConfigModal: React.FC<WidgetConfigModalProps> = ({
  template,
  initialConfig,
  onSave,
  onClose,
  isEdit = false,
  initialName
}) => {
  const [widgetName, setWidgetName] = useState(initialName || template.name);
  const [config, setConfig] = useState<Record<string, any>>(initialConfig);
  const [showPreview, setShowPreview] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Update iframe when config changes
  useEffect(() => {
    if (iframeRef.current && showPreview) {
      const configParam = encodeURIComponent(JSON.stringify(config));
      const url = `http://localhost:3001${template.htmlUrl}?config=${configParam}`;
      iframeRef.current.src = url;
    }
  }, [config, template.htmlUrl, showPreview]);

  const handleConfigChange = (key: string, value: any) => {
    setConfig(prev => {
      const newConfig = { ...prev, [key]: value };
      
      // Özel mantık: popularCity seçilince city alanına yaz
      if (key === 'popularCity' && value) {
        newConfig.city = value;
      }
      
      return newConfig;
    });
  };

  const handleSave = () => {
    onSave(widgetName, config);
  };

  const renderConfigField = (field: WidgetConfigField) => {
    const value = config[field.key] ?? field.default;

    switch (field.type) {
      case 'text':
      case 'url':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleConfigChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
            required={field.required}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleConfigChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            required={field.required}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleConfigChange(field.key, parseFloat(e.target.value))}
            min={field.min}
            max={field.max}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
            required={field.required}
          />
        );

      case 'color':
        return (
          <div className="flex gap-2">
            <input
              type="color"
              value={value}
              onChange={(e) => handleConfigChange(field.key, e.target.value)}
              className="w-16 h-10 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => handleConfigChange(field.key, e.target.value)}
              className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        );

      case 'toggle':
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleConfigChange(field.key, e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-background peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleConfigChange(field.key, e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
            required={field.required}
          >
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-surface border border-border rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold text-text flex items-center gap-2">
              <span className="text-3xl">{template.icon}</span>
              {template.name} - Yapılandırma
            </h2>
            <p className="text-textSecondary mt-1">{template.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-background transition-colors text-textSecondary hover:text-text"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Configuration Panel */}
          <div className="w-1/2 p-6 overflow-y-auto border-r border-border">
            <div className="space-y-6">
              {/* Widget Name */}
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Widget Adı *
                </label>
                <input
                  type="text"
                  value={widgetName}
                  onChange={(e) => setWidgetName(e.target.value)}
                  placeholder="Örn: Ana Ekran Saati"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <p className="text-xs text-textSecondary mt-1">
                  Bu widget'ı tanımlamak için kullanılacak ad
                </p>
              </div>

              {/* Configuration Fields */}
              {template.configSchema.map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-text mb-2">
                    {field.label} {field.required && '*'}
                  </label>
                  {renderConfigField(field)}
                  {field.description && (
                    <p className="text-xs text-textSecondary mt-1">{field.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Live Preview Panel */}
          <div className="w-1/2 p-6 bg-background flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-text flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Canlı Önizleme
              </h3>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-3 py-1 text-sm bg-surface border border-border rounded-lg hover:bg-background transition-colors text-text"
              >
                {showPreview ? 'Gizle' : 'Göster'}
              </button>
            </div>

            {showPreview ? (
              <div className="flex-1 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden border-2 border-border">
                <iframe
                  ref={iframeRef}
                  className="w-full h-full"
                  title="Widget Preview"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-textSecondary">
                <div className="text-center">
                  <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Önizleme gizlendi</p>
                </div>
              </div>
            )}

            <div className="mt-4 p-3 bg-surface/50 rounded-lg">
              <p className="text-xs text-textSecondary">
                💡 Widget'ınız Raspberry Pi, Windows PC, LG TV ve tüm platformlarda aynı şekilde görünecektir.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-border rounded-xl text-textSecondary hover:text-text hover:bg-background transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            disabled={!widgetName.trim()}
            className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {isEdit ? 'Güncelle' : 'Kaydet & Yükle'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WidgetConfigModal;
