/**
 * Google Suite Integration Service:
 * - Google Analytics 4 (GA4)
 * - Google Tag Manager (GTM)
 * - Google Search Console (GSC)
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

export interface GoogleSuiteConfig {
  gaMeasurementId: string;     // e.g. G-XXXXXXXXXX
  gtmContainerId: string;      // e.g. GTM-XXXXXXX
  searchConsoleCode: string;   // e.g. abc123VerificationToken
  enabled: boolean;
  debugMode: boolean;
  autoTrackPageViews: boolean;
  autoTrackConversions: boolean;
}

export interface AnalyticsEventLog {
  id: string;
  timestamp: string;
  type: 'page_view' | 'custom_event' | 'conversion' | 'gtm_push';
  name: string;
  payload: Record<string, any>;
  status: 'sent' | 'queued' | 'simulated';
}

const STORAGE_KEY = 'dh_nova_google_analytics_config';

// Initial defaults with user's verified Google Suite credentials
const DEFAULT_CONFIG: GoogleSuiteConfig = {
  gaMeasurementId: (import.meta.env.VITE_GA_MEASUREMENT_ID as string) || 'G-2V03PTR10S',
  gtmContainerId: (import.meta.env.VITE_GTM_ID as string) || 'GTM-PZFVRVJD',
  searchConsoleCode: (import.meta.env.VITE_GOOGLE_SEARCH_CONSOLE_CODE as string) || 'UXeoqnpWKG6kHkNBD15bAWtB0X3ZayqnnbMAAbtB8Hk',
  enabled: true,
  debugMode: true,
  autoTrackPageViews: true,
  autoTrackConversions: true,
};

let eventHistory: AnalyticsEventLog[] = [];
const eventListeners: Array<(events: AnalyticsEventLog[]) => void> = [];

function notifyListeners() {
  eventListeners.forEach(listener => {
    try {
      listener([...eventHistory]);
    } catch (e) {
      console.error('Error in analytics listener:', e);
    }
  });
}

/**
 * Retrieve current configuration from localStorage or defaults
 */
export function getGoogleConfig(): GoogleSuiteConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_CONFIG,
      ...parsed,
    };
  } catch (e) {
    console.warn('Failed to parse analytics config from localStorage:', e);
    return DEFAULT_CONFIG;
  }
}

/**
 * Save updated configuration to localStorage and dynamically reload tags
 */
export function saveGoogleConfig(newConfig: Partial<GoogleSuiteConfig>): GoogleSuiteConfig {
  const current = getGoogleConfig();
  const updated: GoogleSuiteConfig = { ...current, ...newConfig };
  
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save analytics config:', e);
    }
    // Re-initialize tags dynamically
    initGoogleSuite(updated);
  }

  logEvent({
    type: 'custom_event',
    name: 'google_suite_config_updated',
    payload: {
      gaMeasurementId: updated.gaMeasurementId,
      gtmContainerId: updated.gtmContainerId,
      searchConsoleCode: updated.searchConsoleCode,
      enabled: updated.enabled,
    },
    status: 'sent'
  });

  return updated;
}

/**
 * Initialize Google Tag Manager, GA4, and Google Search Console tags in the DOM
 */
export function initGoogleSuite(overrideConfig?: GoogleSuiteConfig) {
  if (typeof window === 'undefined') return;

  const config = overrideConfig || getGoogleConfig();
  if (!config.enabled) {
    console.log('[Google Suite] Analytics and tags are currently disabled in settings.');
    return;
  }

  // Ensure dataLayer exists
  window.dataLayer = window.dataLayer || [];

  // Setup gtag function
  if (!window.gtag) {
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
  }

  // 1. Google Search Console Meta Verification
  try {
    let metaGsc = document.querySelector('meta[name="google-site-verification"]');
    if (!metaGsc) {
      metaGsc = document.createElement('meta');
      metaGsc.setAttribute('name', 'google-site-verification');
      document.head.appendChild(metaGsc);
    }
    if (config.searchConsoleCode) {
      metaGsc.setAttribute('content', config.searchConsoleCode);
    }
  } catch (e) {
    console.error('Error updating Google Search Console meta tag:', e);
  }

  // 2. Google Tag Manager (GTM)
  if (config.gtmContainerId && config.gtmContainerId.startsWith('GTM-')) {
    const existingGtmScript = document.getElementById('gtm-script-tag');
    if (!existingGtmScript) {
      const script = document.createElement('script');
      script.id = 'gtm-script-tag';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${config.gtmContainerId}`;
      document.head.appendChild(script);

      window.dataLayer.push({
        'gtm.start': new Date().getTime(),
        event: 'gtm.js'
      });
    }

    // Update noscript iframe
    const noscript = document.getElementById('gtm-noscript');
    if (noscript) {
      noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${config.gtmContainerId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
    }
  }

  // 3. Google Analytics 4 (GA4)
  if (config.gaMeasurementId && config.gaMeasurementId.startsWith('G-')) {
    const existingGaScript = document.getElementById('ga4-script-tag');
    if (!existingGaScript) {
      const script = document.createElement('script');
      script.id = 'ga4-script-tag';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${config.gaMeasurementId}`;
      document.head.appendChild(script);

      window.gtag('config', config.gaMeasurementId, {
        send_page_view: false, // We control page_view for SPA routing
        debug_mode: config.debugMode,
      });
    } else {
      window.gtag('config', config.gaMeasurementId, {
        send_page_view: false,
        debug_mode: config.debugMode,
      });
    }
  }

  console.log('[Google Suite] Initialized successfully with:', {
    GA4: config.gaMeasurementId,
    GTM: config.gtmContainerId,
    SearchConsole: config.searchConsoleCode,
  });
}

function logEvent(event: Omit<AnalyticsEventLog, 'id' | 'timestamp'>) {
  const newLog: AnalyticsEventLog = {
    ...event,
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toLocaleTimeString('es-CO', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };
  eventHistory = [newLog, ...eventHistory.slice(0, 49)];
  notifyListeners();
}

/**
 * Track virtual page views across SPA navigation
 */
export function trackPageView(path: string, title?: string) {
  const config = getGoogleConfig();
  if (!config.enabled || !config.autoTrackPageViews) return;

  const pageTitle = title || document.title;
  const pageLocation = typeof window !== 'undefined' ? window.location.href : path;

  // 1. Google Analytics 4
  if (typeof window !== 'undefined' && window.gtag && config.gaMeasurementId) {
    window.gtag('event', 'page_view', {
      page_title: pageTitle,
      page_location: pageLocation,
      page_path: path,
    });
  }

  // 2. Google Tag Manager dataLayer
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'virtual_page_view',
      page_path: path,
      page_title: pageTitle,
      timestamp: new Date().toISOString()
    });
  }

  logEvent({
    type: 'page_view',
    name: 'page_view',
    payload: { path, title: pageTitle },
    status: 'sent'
  });
}

/**
 * Track custom events in both GA4 and GTM
 */
export function trackEvent(eventName: string, params: Record<string, any> = {}) {
  const config = getGoogleConfig();
  if (!config.enabled) return;

  const eventPayload = {
    ...params,
    timestamp: new Date().toISOString(),
  };

  // 1. Dispatch to GA4
  if (typeof window !== 'undefined' && window.gtag && config.gaMeasurementId) {
    window.gtag('event', eventName, eventPayload);
  }

  // 2. Dispatch to GTM dataLayer
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...eventPayload,
    });
  }

  logEvent({
    type: 'custom_event',
    name: eventName,
    payload: params,
    status: 'sent'
  });
}

/**
 * Pre-configured conversion triggers
 */
export function trackContactLead(data: { name: string; service: string; budget?: string }) {
  trackEvent('generate_lead', {
    client_name: data.name,
    service_interest: data.service,
    budget_range: data.budget || 'standard',
    source: 'contact_form_cro',
  });
}

export function trackAppointmentScheduled(data: { name: string; service: string; date: string; time: string }) {
  trackEvent('schedule_appointment', {
    client_name: data.name,
    service: data.service,
    appointment_date: data.date,
    appointment_time: data.time,
    channel: 'google_calendar_hub',
  });
}

export function trackWhatsAppClick(source: string) {
  trackEvent('whatsapp_click', {
    source: source,
    action: 'contact_initiated',
  });
}

export function trackServiceExploration(serviceId: string, serviceTitle: string) {
  trackEvent('view_service_detail', {
    service_id: serviceId,
    service_title: serviceTitle,
  });
}

export function trackPortfolioInteraction(projectName: string, category: string) {
  trackEvent('view_portfolio_item', {
    item_name: projectName,
    item_category: category,
  });
}

/**
 * Send a test event to verify GA4 or GTM connectivity
 */
export function sendTestEvent(type: 'ga4' | 'gtm' | 'conversion') {
  const testNames = {
    ga4: 'test_ga4_ping',
    gtm: 'test_gtm_datalayer_event',
    conversion: 'test_conversion_lead',
  };
  trackEvent(testNames[type], {
    test_id: `test_${Date.now()}`,
    source: 'google_suite_control_panel',
    message: 'Evento de prueba emitido satisfactoriamente',
  });
}

export function getEventHistory(): AnalyticsEventLog[] {
  return [...eventHistory];
}

export function subscribeToEventHistory(listener: (events: AnalyticsEventLog[]) => void): () => void {
  eventListeners.push(listener);
  listener([...eventHistory]);
  return () => {
    const idx = eventListeners.indexOf(listener);
    if (idx !== -1) eventListeners.splice(idx, 1);
  };
}
