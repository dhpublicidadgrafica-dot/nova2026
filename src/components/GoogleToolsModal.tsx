import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart3,
  Tag,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Save,
  RotateCcw,
  Sparkles,
  Activity,
  FileText,
  Check,
  X,
  ShieldCheck,
  Play,
  Terminal,
  HelpCircle,
  Zap
} from 'lucide-react';
import {
  getGoogleConfig,
  saveGoogleConfig,
  sendTestEvent,
  subscribeToEventHistory,
  AnalyticsEventLog,
  GoogleSuiteConfig
} from '../services/analytics';

interface GoogleToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GoogleToolsModal({ isOpen, onClose }: GoogleToolsModalProps) {
  const [config, setConfig] = useState<GoogleSuiteConfig>(getGoogleConfig());
  const [activeTab, setActiveTab] = useState<'status' | 'analytics' | 'tagmanager' | 'searchconsole' | 'logs'>('status');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [eventLogs, setEventLogs] = useState<AnalyticsEventLog[]>([]);

  useEffect(() => {
    if (isOpen) {
      setConfig(getGoogleConfig());
    }
  }, [isOpen]);

  useEffect(() => {
    const unsubscribe = subscribeToEventHistory((logs) => {
      setEventLogs(logs);
    });
    return unsubscribe;
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveGoogleConfig(config);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    const defaultConfig = saveGoogleConfig({
      gaMeasurementId: 'G-2V03PTR10S',
      gtmContainerId: 'GTM-PZFVRVJD',
      searchConsoleCode: 'UXeoqnpWKG6kHkNBD15bAWtB0X3ZayqnnbMAAbtB8Hk',
      enabled: true,
      debugMode: true,
      autoTrackPageViews: true,
      autoTrackConversions: true,
    });
    setConfig(defaultConfig);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-bold">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Google Marketing & SEO Suite
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Integrado
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Google Analytics 4 • Google Tag Manager • Google Search Console
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-800 bg-slate-900/60 overflow-x-auto text-sm">
            <button
              onClick={() => setActiveTab('status')}
              className={`px-4 py-2.5 font-medium rounded-t-xl transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
                activeTab === 'status'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Activity className="w-4 h-4" />
              Estado y Pruebas
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2.5 font-medium rounded-t-xl transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Google Analytics (GA4)
            </button>
            <button
              onClick={() => setActiveTab('tagmanager')}
              className={`px-4 py-2.5 font-medium rounded-t-xl transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
                activeTab === 'tagmanager'
                  ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Tag className="w-4 h-4" />
              Google Tag Manager
            </button>
            <button
              onClick={() => setActiveTab('searchconsole')}
              className={`px-4 py-2.5 font-medium rounded-t-xl transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
                activeTab === 'searchconsole'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Search className="w-4 h-4" />
              Search Console & Sitemap
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2.5 font-medium rounded-t-xl transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
                activeTab === 'logs'
                  ? 'border-purple-500 text-purple-400 bg-purple-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Terminal className="w-4 h-4" />
              DataLayer en Vivo ({eventLogs.length})
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {savedSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-sm flex items-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                <span>
                  <strong>¡Configuración guardada exitosamente!</strong> Las etiquetas y códigos se han sincronizado en tiempo real en la aplicación.
                </span>
              </motion.div>
            )}

            {/* TAB: STATUS */}
            {activeTab === 'status' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Card 1: GA4 */}
                  <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                          <BarChart3 className="w-5 h-5" />
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
                          Activo
                        </span>
                      </div>
                      <h3 className="font-semibold text-white">Google Analytics 4</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Mide visitas, páginas vistas, conversiones de clientes y comportamiento.
                      </p>
                      <div className="mt-3 p-2 bg-slate-900 rounded-lg text-xs font-mono text-slate-300 break-all">
                        {config.gaMeasurementId || 'No configurado'}
                      </div>
                    </div>
                    <button
                      onClick={() => sendTestEvent('ga4')}
                      className="mt-4 w-full py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" /> Enviar Test GA4
                    </button>
                  </div>

                  {/* Card 2: GTM */}
                  <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                          <Tag className="w-5 h-5" />
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
                          DataLayer OK
                        </span>
                      </div>
                      <h3 className="font-semibold text-white">Google Tag Manager</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Dispara píxeles de Meta, TikTok, Google Ads y etiquetas sin tocar código.
                      </p>
                      <div className="mt-3 p-2 bg-slate-900 rounded-lg text-xs font-mono text-slate-300 break-all">
                        {config.gtmContainerId || 'No configurado'}
                      </div>
                    </div>
                    <button
                      onClick={() => sendTestEvent('gtm')}
                      className="mt-4 w-full py-2 px-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" /> Enviar Trigger GTM
                    </button>
                  </div>

                  {/* Card 3: Search Console */}
                  <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                          <Search className="w-5 h-5" />
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
                          Indexable
                        </span>
                      </div>
                      <h3 className="font-semibold text-white">Search Console</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Indexación orgánica de Google, SEO técnico y sitemap XML automático.
                      </p>
                      <div className="mt-3 p-2 bg-slate-900 rounded-lg text-xs font-mono text-slate-300 truncate">
                        {config.searchConsoleCode || 'Token no asignado'}
                      </div>
                    </div>
                    <a
                      href="/sitemap.xml"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 w-full py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" /> Ver sitemap.xml
                    </a>
                  </div>
                </div>

                {/* Automation Summary */}
                <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-800/50">
                  <h4 className="text-sm font-semibold text-indigo-300 flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-indigo-400" />
                    Eventos Automáticos Configurados en la App:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 mt-3">
                    <div className="flex items-center gap-2 p-2 bg-slate-900/60 rounded-xl">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span><strong>virtual_page_view:</strong> Cambio de rutas SPA</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-slate-900/60 rounded-xl">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span><strong>generate_lead:</strong> Envío de formulario de cotización</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-slate-900/60 rounded-xl">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span><strong>schedule_appointment:</strong> Reserva en Google Calendar</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-slate-900/60 rounded-xl">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span><strong>whatsapp_click:</strong> Clics de contacto comercial</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-slate-900/60 rounded-xl">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span><strong>view_portfolio_item:</strong> Apertura de proyectos en modal</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-slate-900/60 rounded-xl">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span><strong>view_service_detail:</strong> Exploración de servicios</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: GOOGLE ANALYTICS 4 */}
            {activeTab === 'analytics' && (
              <form onSubmit={handleSave} className="space-y-6">
                <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white text-base flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-amber-400" />
                        ID de Medición de Google Analytics 4 (GA4)
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Formato: <code className="text-amber-300">G-XXXXXXXXXX</code>
                      </p>
                    </div>
                    <a
                      href="https://analytics.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      Ir a Google Analytics <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Ingresa tu ID de Medición GA4:
                    </label>
                    <input
                      type="text"
                      value={config.gaMeasurementId}
                      onChange={(e) => setConfig({ ...config, gaMeasurementId: e.target.value.trim() })}
                      placeholder="G-B740XXXXXX"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.autoTrackPageViews}
                        onChange={(e) => setConfig({ ...config, autoTrackPageViews: e.target.checked })}
                        className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
                      />
                      Seguimiento automático de vistas de página (Page Views SPA)
                    </label>
                  </div>
                </div>

                {/* Instruction Box */}
                <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 text-xs text-slate-300 space-y-2">
                  <h4 className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4" /> ¿Cómo obtener tu ID de Medición en Google Analytics?
                  </h4>
                  <ol className="list-decimal pl-5 space-y-1 text-slate-400">
                    <li>Entra en <a href="https://analytics.google.com" target="_blank" rel="noreferrer" className="text-amber-400 underline">analytics.google.com</a> con tu cuenta Google.</li>
                    <li>Ve a <strong>Administrar (Engranaje)</strong> &gt; <strong>Flujos de datos</strong> &gt; Pestaña <strong>Web</strong>.</li>
                    <li>Selecciona tu flujo de datos web y copia el código que empieza por <code>G-</code>.</li>
                    <li>Pégalo en el campo superior y presiona <strong>"Guardar Configuración"</strong>.</li>
                  </ol>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => sendTestEvent('ga4')}
                    className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 text-amber-400" />
                    Probar Evento GA4
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-xs shadow-lg shadow-orange-500/20 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Guardar Configuración GA4
                  </button>
                </div>
              </form>
            )}

            {/* TAB: GOOGLE TAG MANAGER */}
            {activeTab === 'tagmanager' && (
              <form onSubmit={handleSave} className="space-y-6">
                <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white text-base flex items-center gap-2">
                        <Tag className="w-5 h-5 text-blue-400" />
                        ID de Contenedor de Google Tag Manager (GTM)
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Formato: <code className="text-blue-300">GTM-XXXXXXX</code>
                      </p>
                    </div>
                    <a
                      href="https://tagmanager.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      Ir a Tag Manager <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Ingresa tu ID de Contenedor GTM:
                    </label>
                    <input
                      type="text"
                      value={config.gtmContainerId}
                      onChange={(e) => setConfig({ ...config, gtmContainerId: e.target.value.trim() })}
                      placeholder="GTM-59NXXXX"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.autoTrackConversions}
                        onChange={(e) => setConfig({ ...config, autoTrackConversions: e.target.checked })}
                        className="rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500"
                      />
                      Emitir conversiones de negocio a dataLayer (Lead, Agenda, WhatsApp)
                    </label>
                  </div>
                </div>

                {/* Instruction Box */}
                <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 text-xs text-slate-300 space-y-2">
                  <h4 className="font-semibold text-blue-300 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4" /> ¿Cómo obtener tu Contenedor GTM?
                  </h4>
                  <ol className="list-decimal pl-5 space-y-1 text-slate-400">
                    <li>Entra en <a href="https://tagmanager.google.com" target="_blank" rel="noreferrer" className="text-blue-400 underline">tagmanager.google.com</a>.</li>
                    <li>Crea una cuenta o selecciona tu contenedor web para el sitio.</li>
                    <li>En la parte superior derecha verás tu ID que inicia con <code>GTM-</code>.</li>
                    <li>Pégalo aquí para que todos los eventos personalizados se sincronicen con tu dataLayer.</li>
                  </ol>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => sendTestEvent('gtm')}
                    className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 text-blue-400" />
                    Probar Push a DataLayer
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold text-xs shadow-lg shadow-blue-500/20 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Guardar Configuración GTM
                  </button>
                </div>
              </form>
            )}

            {/* TAB: SEARCH CONSOLE */}
            {activeTab === 'searchconsole' && (
              <form onSubmit={handleSave} className="space-y-6">
                <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white text-base flex items-center gap-2">
                        <Search className="w-5 h-5 text-emerald-400" />
                        Verificación de Google Search Console
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Token de etiqueta HTML o archivo de verificación
                      </p>
                    </div>
                    <a
                      href="https://search.google.com/search-console"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      Ir a Search Console <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Código de verificación meta (google-site-verification):
                    </label>
                    <input
                      type="text"
                      value={config.searchConsoleCode}
                      onChange={(e) => setConfig({ ...config, searchConsoleCode: e.target.value.trim() })}
                      placeholder="e.g. abc123456789xyz"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Generated Meta Tag preview */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>Etiqueta HTML inyectada en &lt;head&gt;:</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(`<meta name="google-site-verification" content="${config.searchConsoleCode}" />`, 'meta')}
                        className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                      >
                        {copiedKey === 'meta' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedKey === 'meta' ? 'Copiado' : 'Copiar'}
                      </button>
                    </div>
                    <code className="text-xs font-mono text-emerald-300 break-all">
                      &lt;meta name="google-site-verification" content="{config.searchConsoleCode}" /&gt;
                    </code>
                  </div>
                </div>

                {/* Sitemap and Robots technical endpoints */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        Sitemap XML
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Indexación automática de 12 URLs
                      </div>
                    </div>
                    <a
                      href="/sitemap.xml"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-1"
                    >
                      Abrir <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        Robots.txt
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Directivas de rastreo para bots de Google
                      </div>
                    </div>
                    <a
                      href="/robots.txt"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-1"
                    >
                      Abrir <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Instructions */}
                <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 text-xs text-slate-300 space-y-2">
                  <h4 className="font-semibold text-emerald-300 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4" /> Pasos para verificar tu sitio en Google Search Console:
                  </h4>
                  <ol className="list-decimal pl-5 space-y-1 text-slate-400">
                    <li>Entra en <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer" className="text-emerald-400 underline">search.google.com/search-console</a>.</li>
                    <li>Agrega tu propiedad como <strong>Prefijo de la URL</strong> o <strong>Dominio</strong>.</li>
                    <li>Selecciona el método de verificación: <strong>Etiqueta HTML</strong>.</li>
                    <li>Copia el valor del atributo <code>content</code> y pégalo arriba.</li>
                    <li>En el menú lateral de Search Console, ve a <strong>Sitemaps</strong> y envía: <code>sitemap.xml</code>.</li>
                  </ol>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Guardar Verificación Search Console
                  </button>
                </div>
              </form>
            )}

            {/* TAB: LIVE LOGS */}
            {activeTab === 'logs' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    Monitoreo en tiempo real de llamadas a <code>window.gtag</code> y <code>window.dataLayer.push</code>.
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => sendTestEvent('conversion')}
                      className="py-1 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition"
                    >
                      Disparar Conversión Lead
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs max-h-[380px] overflow-y-auto space-y-2">
                  {eventLogs.length === 0 ? (
                    <div className="text-slate-500 py-8 text-center italic">
                      No hay eventos registrados aún. Navega por el sitio o pulsa un botón de prueba.
                    </div>
                  ) : (
                    eventLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1 hover:border-slate-700 transition"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">{log.timestamp}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold ${
                                log.type === 'page_view'
                                  ? 'bg-blue-500/20 text-blue-300'
                                  : log.type === 'conversion'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-purple-500/20 text-purple-300'
                              }`}
                            >
                              {log.type}
                            </span>
                            <span className="text-white font-semibold">{log.name}</span>
                          </div>
                          <span className="text-emerald-400 text-[10px] flex items-center gap-1">
                            <Check className="w-3 h-3" /> {log.status}
                          </span>
                        </div>
                        <div className="text-slate-300 text-[11px] overflow-x-auto bg-black/40 p-1.5 rounded">
                          {JSON.stringify(log.payload)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
            <button
              onClick={handleReset}
              className="py-1.5 px-3 rounded-lg text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Restablecer valores recomendados
            </button>
            <button
              onClick={onClose}
              className="py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
