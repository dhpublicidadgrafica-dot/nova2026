import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Globe,
  ShoppingBag,
  Cpu,
  Code2,
  Award,
  ArrowRight,
  Menu,
  X,
  Check,
  Star,
  Calendar,
  MessageSquare,
  Phone,
  MapPin,
  Mail,
  ChevronDown,
  CheckCircle,
  HelpCircle,
  DollarSign,
  ExternalLink,
  Search,
  MessageCircle,
  Clock,
  ArrowUpRight,
  Users,
  Briefcase,
  History,
  TrendingUp,
  ShieldCheck,
  Lightbulb,
  CheckCircle2,
  Target,
  Eye,
  Video,
  Lock,
  Info,
  Image as ImageIcon,
  BarChart3,
  FileText
} from 'lucide-react';

import { ServiceId, ServiceDetail, PortfolioItem, BlogArticle, ChatMessage } from './types';
import {
  SERVICES_DATA,
  PORTFOLIO_DATA,
  METHOD_DATA,
  TECHNOLOGIES_DATA,
  TESTIMONIALS_DATA,
  BLOG_DATA,
  ACCORDION_FAQ_DATA
} from './data';
import ChameleonCanvas from './components/ChameleonCanvas';
import ChameleonVideoPlayer from './components/ChameleonVideoPlayer';
import GoogleCalendarHub from './components/GoogleCalendarHub';
import GoogleToolsModal from './components/GoogleToolsModal';
import {
  initGoogleSuite,
  trackPageView,
  trackEvent,
  trackContactLead,
  trackAppointmentScheduled,
  trackWhatsAppClick,
  trackPortfolioInteraction
} from './services/analytics';

export type PageType = ServiceId | 'inicio' | 'nosotros' | 'contacto' | 'blog' | 'portafolio' | 'agenda';

export const PAGE_TO_PATH: Record<PageType, string> = {
  inicio: '/',
  nosotros: '/nosotros',
  branding: '/servicios/brandingdemarca',
  web: '/servicios/paginaswebcorporativas',
  ecommerce: '/servicios/tiendasonline',
  ai: '/servicios/agentesia',
  software: '/servicios/softwareamedida',
  merch: '/servicios/merchandising',
  portafolio: '/servicios/portafolio',
  contacto: '/servicios/contacto',
  blog: '/servicios/blog',
  agenda: '/agenda',
};

export const getPageFromPath = (path: string): PageType => {
  const cleanPath = path.toLowerCase().replace(/\/$/, '') || '/';
  
  if (cleanPath === '/nosotros') return 'nosotros';
  if (cleanPath === '/agenda' || cleanPath === '/calendar' || cleanPath === '/servicios/calendar') return 'agenda';
  if (cleanPath === '/servicios/brandingdemarca' || cleanPath === '/branding') return 'branding';
  if (cleanPath === '/servicios/paginaswebcorporativas' || cleanPath === '/web') return 'web';
  if (cleanPath === '/servicios/tiendasonline' || cleanPath === '/ecommerce') return 'ecommerce';
  if (cleanPath === '/servicios/agentesia' || cleanPath === '/ai') return 'ai';
  if (cleanPath === '/servicios/softwareamedida' || cleanPath === '/software') return 'software';
  if (cleanPath === '/servicios/merchandising' || cleanPath === '/merch') return 'merch';
  if (cleanPath === '/servicios/portafolio' || cleanPath === '/portafolio') return 'portafolio';
  if (cleanPath === '/servicios/contacto' || cleanPath === '/contacto') return 'contacto';
  if (cleanPath === '/servicios/blog' || cleanPath === '/blog') return 'blog';
  
  return 'inicio';
};

export default function App() {
  // Page routing state mapped to clean independent URLs
  const [activePage, setActivePage] = useState<PageType>(() => {
    if (typeof window !== 'undefined') {
      return getPageFromPath(window.location.pathname);
    }
    return 'inicio';
  });
  const [hoveredService, setHoveredService] = useState<ServiceId | null>(null);

  // Sync with browser Back / Forward buttons (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const pageFromUrl = getPageFromPath(window.location.pathname);
      setActivePage(pageFromUrl);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Interaction / Modal States
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [budgetCalculatorOpen, setBudgetCalculatorOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [activeBlogModal, setActiveBlogModal] = useState<BlogArticle | null>(null);
  const [activeProjectModal, setActiveProjectModal] = useState<PortfolioItem | null>(null);
  const [modalViewTab, setModalViewTab] = useState<'interactive' | 'hd'>('interactive');
  const [googleToolsOpen, setGoogleToolsOpen] = useState(false);

  // Initialize Google Analytics, Tag Manager & Search Console
  useEffect(() => {
    initGoogleSuite();
  }, []);

  // Track virtual page views for GA4 & GTM dataLayer on page navigation
  useEffect(() => {
    const currentPath = PAGE_TO_PATH[activePage] || '/';
    const pageTitles: Record<PageType, string> = {
      inicio: 'Remix NOVA Soluciones Digitales | Transformación Digital & Software',
      nosotros: 'Nosotros | Remix NOVA Soluciones Digitales',
      branding: 'Branding de Marca | Remix NOVA',
      web: 'Páginas Web Corporativas | Remix NOVA',
      ecommerce: 'Tiendas Online | Remix NOVA',
      ai: 'Agentes IA | Remix NOVA',
      software: 'Software a Medida | Remix NOVA',
      merch: 'Merchandising & Packaging | Remix NOVA',
      portafolio: 'Portafolio de Proyectos | Remix NOVA',
      contacto: 'Contacto Estratégico | Remix NOVA',
      blog: 'Blog de Innovación & Tech | Remix NOVA',
      agenda: 'Agendar Asesoría Google Calendar | Remix NOVA',
    };
    const title = pageTitles[activePage] || 'Remix NOVA Soluciones Digitales';
    document.title = title;
    trackPageView(currentPath, title);
  }, [activePage]);

  const openProjectModal = (item: PortfolioItem) => {
    setModalViewTab('interactive');
    setActiveProjectModal(item);
    trackPortfolioInteraction(item.title, item.category);
  };

  const getEmbedUrl = (url?: string) => {
    if (!url) return '';
    if (url.includes('drive.google.com/file/d/')) {
      const match = url.match(/drive\.google\.com\/file\/d\/([^\/]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }
    return url;
  };

  // Filter States
  const [portfolioFilter, setPortfolioFilter] = useState<ServiceId | 'all'>('all');

  // Accordion FAQ states
  const [faqExpandedId, setFaqExpandedId] = useState<string | null>(null);

  // Interactive scheduler states
  const [selectedDate, setSelectedDate] = useState<string>('2026-07-20');
  const [selectedTime, setSelectedTime] = useState<string>('10:00 AM');
  const [schedulerService, setSchedulerService] = useState<string>('ai');
  const [schedulerStatus, setSchedulerStatus] = useState<{ success?: boolean; message?: string; loading?: boolean; googleCalendarUrl?: string }>({});

  // Budget Calculator States
  const [calculatorServices, setCalculatorServices] = useState<ServiceId[]>(['web']);
  const [calculatorComplexity, setCalculatorComplexity] = useState<number>(2); // 1-3
  const [calculatorSpeed, setCalculatorSpeed] = useState<string>('normal'); // normal, express
  const [calculatorResults, setCalculatorResults] = useState({ total: 1500, weeks: 4, roi: '6 meses' });

  // Chatbot states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      content: '¡Hola! Soy DIGITAL HOME AI, tu asesor experto. ¿En qué ecosistema digital puedo ayudarte hoy? Cuéntame sobre tus metas en branding, desarrollo web, automatización de IA o software a medida.',
      timestamp: 'Ahora'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Forms state
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', company: '', message: '', budget: '1500-5000' });
  const [contactStatus, setContactStatus] = useState<{ success?: boolean; message?: string; loading?: boolean }>({});
  const [schedulerForm, setSchedulerForm] = useState({ name: '', email: '', company: '', message: '' });

  // Handle navbar glow on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top when active page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileMenuOpen(false);
  }, [activePage]);

  // Scroll chat window to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  // Calculate budget when selections change
  useEffect(() => {
    const prices: Record<ServiceId, number> = {
      branding: 800,
      web: 1500,
      ecommerce: 2200,
      ai: 1800,
      software: 3500,
      merch: 600,
    };

    let base = calculatorServices.reduce((sum, id) => sum + (prices[id] || 0), 0);
    
    // Complexity multiplier
    if (calculatorComplexity === 1) base *= 0.85;
    if (calculatorComplexity === 3) base *= 1.3;

    // Speed multiplier
    let durationWeeks = Math.max(3, calculatorServices.length * 2);
    if (calculatorSpeed === 'express') {
      base *= 1.25;
      durationWeeks = Math.max(2, Math.round(durationWeeks * 0.6));
    }

    // ROI projection based on services
    let roiMonths = '6 meses';
    if (calculatorServices.includes('ai') || calculatorServices.includes('ecommerce')) {
      roiMonths = '3 - 4 meses';
    } else if (calculatorServices.includes('branding')) {
      roiMonths = '8 - 10 meses';
    }

    setCalculatorResults({
      total: Math.round(base),
      weeks: durationWeeks,
      roi: roiMonths
    });
  }, [calculatorServices, calculatorComplexity, calculatorSpeed]);

  // API Call: AI Agent chat handler
  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updatedMessages = [...chatMessages, { role: 'user' as const, content: userMessage, timestamp }];
    setChatMessages(updatedMessages);
    setChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages.map(m => ({ role: m.role, content: m.content })) })
      });
      const data = await response.json();
      
      if (response.ok) {
        setChatMessages(prev => [
          ...prev,
          { role: 'model', content: data.content, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);
      } else {
        throw new Error(data.error || 'No se pudo obtener respuesta');
      }
    } catch (err: any) {
      console.error(err);
      setChatMessages(prev => [
        ...prev,
        {
          role: 'model',
          content: 'Lo lamento, experimenté una interrupción en mi matriz cognitiva. Sin embargo, nuestro equipo humano está listo. ¿Te gustaría agendar una llamada directa?',
          timestamp: 'Ahora'
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // API Call: Booking submission
  const handleBookConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulerForm.name || !schedulerForm.email) {
      setSchedulerStatus({ success: false, message: 'Por favor, introduce tu nombre y correo.' });
      return;
    }

    setSchedulerStatus({ loading: true });

    try {
      const response = await fetch('/api/book-consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: schedulerForm.name,
          email: schedulerForm.email,
          company: schedulerForm.company,
          message: schedulerForm.message,
          service: schedulerService,
          date: selectedDate,
          time: selectedTime,
          source: 'Calendario Web',
          targetCommercialEmail: 'comercial@digitalhome.com.co'
        })
      });
      const data = await response.json();

      if (response.ok) {
        setSchedulerStatus({
          success: true,
          message: data.message,
          googleCalendarUrl: data.googleCalendarUrl
        });
        trackAppointmentScheduled({
          name: schedulerForm.name,
          service: schedulerService,
          date: selectedDate,
          time: selectedTime,
        });
        setSchedulerForm({ name: '', email: '', company: '', message: '' });
        // Close modal after delay if open
        setTimeout(() => {
          setBookingModalOpen(false);
          setSchedulerStatus({});
        }, 8000);
      } else {
        throw new Error(data.error || 'Ocurrió un error');
      }
    } catch (err: any) {
      setSchedulerStatus({ success: false, message: err.message || 'Error al conectar con el servidor.' });
    }
  };

  // API Call: Contact form submission
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      setContactStatus({ success: false, message: 'Por favor, llena los campos obligatorios.' });
      return;
    }

    setContactStatus({ loading: true });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });
      const data = await response.json();

      if (response.ok) {
        setContactStatus({ success: true, message: data.message });
        trackContactLead({
          name: contactForm.name,
          service: contactForm.budget || 'General',
          budget: contactForm.budget,
        });
        setContactForm({ name: '', email: '', phone: '', company: '', message: '', budget: '1500-5000' });
      } else {
        throw new Error(data.error || 'Error al enviar');
      }
    } catch (err: any) {
      setContactStatus({ success: false, message: err.message || 'Error al conectar con el servidor.' });
    }
  };

  // Quick prompt for AI chat
  const triggerQuickPrompt = (text: string) => {
    setChatInput(text);
    // Submit in next tick
    setTimeout(() => {
      const inputEl = document.getElementById('chat-input-form') as HTMLFormElement;
      if (inputEl) inputEl.requestSubmit();
    }, 50);
  };

  // Helper mapping icon names to Lucide icons
  const renderIcon = (name: string, colorClass: string) => {
    const props = { className: `w-6 h-6 ${colorClass}` };
    switch (name) {
      case 'Sparkles': return <Sparkles {...props} />;
      case 'Globe': return <Globe {...props} />;
      case 'ShoppingBag': return <ShoppingBag {...props} />;
      case 'Cpu': return <Cpu {...props} />;
      case 'Code2': return <Code2 {...props} />;
      case 'Award': return <Award {...props} />;
      default: return <Sparkles {...props} />;
    }
  };

  // Portfolio list filter
  const filteredPortfolio = portfolioFilter === 'all'
    ? PORTFOLIO_DATA
    : PORTFOLIO_DATA.filter(item => item.serviceId === portfolioFilter);

  // Standard Hero & Navbar page navigation with HTML5 History API
  const navigateToPage = (page: PageType, pushHistory = true) => {
    setActivePage(page);
    if (pushHistory && typeof window !== 'undefined') {
      const targetPath = PAGE_TO_PATH[page] || '/';
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ page }, '', targetPath);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Unified action: Automatically redirect user to the dedicated standalone scheduling page (/agenda)
  const handleAgendarAsesoria = () => {
    setBookingModalOpen(false);
    navigateToPage('agenda');
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  return (
    <div className="relative min-h-screen bg-brand-bg text-white font-sans overflow-x-hidden selection:bg-brand-blue/30 selection:text-white">
      
      {/* 1. Futuristic Background Light Orbs & Texture (Immersive UI Theme) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#0D6EFD] blur-[120px] opacity-20"></div>
        <div className="absolute bottom-[10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-[#7B2FF7] blur-[100px] opacity-15"></div>
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full bg-[#FF7A00] blur-[150px] opacity-10"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] invert"></div>
      </div>

      {/* 2. Glassmorphic Sticky Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'py-3 bg-[#060B16]/75 backdrop-blur-md border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.4)]'
            : 'py-5 bg-transparent border-b border-transparent'
        }`}
        id="navbar-root"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          
          {/* Brand Logo & Mascotte Link */}
          <button
            onClick={() => navigateToPage('inicio')}
            className="flex items-center gap-3 cursor-pointer group text-left"
            aria-label="Ir al inicio de DIGITAL HOME"
          >
            <div className="flex items-center gap-3">
              <img
                src="https://lh3.googleusercontent.com/d/1mFNeJcYcuTRybKq_Ox3jUoD6OnLgD0vX"
                alt="DIGITAL HOME"
                className="md:h-22 h-16 w-auto object-contain filter drop-shadow-[0_0_8px_rgba(13,110,253,0.3)] group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset.triedLocal) {
                    target.dataset.triedLocal = 'true';
                    target.src = '/assets/digital_home_logo.png';
                  } else {
                    target.style.display = 'none';
                    const fb = document.getElementById('header-logo-fallback');
                    if (fb) fb.style.display = 'flex';
                  }
                }}
              />
              <div id="header-logo-fallback" className="hidden items-center gap-3">
                <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-purple p-[1px]">
                  <div className="w-full h-full bg-brand-bg rounded-[11px] flex items-center justify-center">
                    <ArrowUpRight className="w-5 h-5 text-brand-blue" />
                  </div>
                </div>
                <div>
                  <span className="block text-lg font-bold tracking-wider text-white">DIGITAL HOME</span>
                  <span className="block text-[9px] font-mono tracking-widest text-[#D9D9D9] opacity-70">SOLUCIONES DIGITALES</span>
                </div>
              </div>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7" aria-label="Navegación principal">
            {[
              { id: 'inicio', label: 'Inicio' },
              { id: 'nosotros', label: 'Nosotros' },
              { id: 'servicios', label: 'Servicios', isDropdown: true },
              { id: 'portafolio', label: 'Portafolio' },
              { id: 'agenda', label: 'Agenda' },
              { id: 'contacto', label: 'Contacto' },
              { id: 'blog', label: 'Blog' }
            ].map((link) => {
              if (link.isDropdown) {
                return (
                  <div key={link.id} className="relative group">
                    <button
                      className="flex items-center gap-1 text-sm font-medium tracking-wide text-[#D9D9D9]/80 hover:text-white cursor-pointer py-1"
                      aria-label="Abrir submenú de servicios"
                    >
                      <span>{link.label}</span>
                      <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
                    </button>
                    <div className="absolute top-full right-0 mt-2 w-56 p-2 rounded-2xl glass-panel-heavy border border-white/10 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 shadow-2xl z-50">
                      {SERVICES_DATA.map((srv) => (
                        <a
                          key={srv.id}
                          href={PAGE_TO_PATH[srv.id]}
                          onClick={(e) => {
                            e.preventDefault();
                            navigateToPage(srv.id);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs text-[#D9D9D9] hover:text-white hover:bg-white/5 transition-colors duration-200 cursor-pointer flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: srv.color }} />
                          {srv.title}
                        </a>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <a
                  key={link.id}
                  href={PAGE_TO_PATH[link.id as PageType]}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToPage(link.id as PageType);
                  }}
                  className={`relative py-1 text-sm font-medium tracking-wide transition-colors duration-300 cursor-pointer ${
                    activePage === link.id
                      ? 'text-brand-blue'
                      : 'text-[#D9D9D9]/80 hover:text-white'
                  }`}
                >
                  {link.label}
                  {activePage === link.id && (
                    <motion.div
                      layoutId="active-nav-indicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-blue"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Header Action Button */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setGoogleToolsOpen(true)}
              className="p-2.5 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-amber-400 hover:text-amber-300 hover:border-amber-400/50 transition-all duration-300 cursor-pointer flex items-center gap-1.5"
              title="Google Analytics, Search Console & Tag Manager"
            >
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <span className="hidden lg:inline text-[11px] text-slate-300">Google Suite</span>
            </button>
            <button
              onClick={handleAgendarAsesoria}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide bg-gradient-to-r from-brand-blue to-brand-purple hover:shadow-[0_0_20px_rgba(13,110,253,0.3)] transition-all duration-300 cursor-pointer flex items-center gap-2 text-white"
            >
              <Calendar className="w-4 h-4" />
              <span>Agendar Asesoría</span>
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white/80 hover:text-white cursor-pointer"
            aria-label={mobileMenuOpen ? 'Cerrar menú móvil' : 'Abrir menú móvil'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 right-0 glass-panel-heavy border-b border-white/5 shadow-2xl z-40 px-6 py-8 md:hidden flex flex-col gap-5"
            >
              {[
                { id: 'inicio', label: 'Inicio' },
                { id: 'nosotros', label: 'Nosotros' },
                { id: 'servicios', label: 'Servicios', isDropdown: true },
                { id: 'portafolio', label: 'Portafolio' },
                { id: 'agenda', label: 'Agenda / Citas' },
                { id: 'contacto', label: 'Contacto' },
                { id: 'blog', label: 'Blog' }
              ].map((link) => {
                if (link.isDropdown) {
                  return (
                    <div key={link.id} className="py-2 border-b border-white/5 pb-3">
                      <span className="block text-base font-semibold text-[#D9D9D9] mb-3">{link.label}</span>
                      <div className="grid grid-cols-2 gap-3 pl-2">
                        {SERVICES_DATA.map((srv) => (
                          <a
                            key={srv.id}
                            href={PAGE_TO_PATH[srv.id]}
                            onClick={(e) => {
                              e.preventDefault();
                              navigateToPage(srv.id);
                              setMobileMenuOpen(false);
                            }}
                            className="text-left text-xs text-[#D9D9D9] hover:text-white flex items-center gap-1.5 py-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: srv.color }} />
                            {srv.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  );
                }

                return (
                  <a
                    key={link.id}
                    href={PAGE_TO_PATH[link.id as PageType]}
                    onClick={(e) => {
                      e.preventDefault();
                      navigateToPage(link.id as PageType);
                      setMobileMenuOpen(false);
                    }}
                    className={`text-left text-base font-semibold py-1 border-b border-white/5 pb-2 ${
                      activePage === link.id ? 'text-brand-blue' : 'text-[#D9D9D9]'
                    }`}
                  >
                    {link.label}
                  </a>
                );
              })}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setGoogleToolsOpen(true);
                }}
                className="w-full py-2.5 rounded-xl text-center text-xs font-semibold bg-slate-900 border border-slate-700 text-amber-400 flex items-center justify-center gap-2 cursor-pointer"
              >
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <span>Google Suite (Analytics, GTM & Search Console)</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleAgendarAsesoria();
                }}
                className="w-full mt-1 py-3 rounded-xl text-center text-sm font-semibold bg-gradient-to-r from-brand-blue to-brand-purple cursor-pointer text-white"
              >
                Agendar Asesoría
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 3. Main Views Section */}
      <main className="pt-24 pb-16">
        <AnimatePresence mode="wait">
          
          {/* HOME VIEW: INICIO */}
          {activePage === 'inicio' && (
            <motion.div
              key="page-inicio"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5 }}
            >
              {/* HERO SECTION */}
              <section className="max-w-7xl mx-auto px-4 md:px-8 pt-6 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center" id="hero-section">
                
                {/* Left Columns - Text content */}
                <div className="lg:col-span-7 flex flex-col gap-6 text-left items-start">

                  <motion.h1 
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-4xl sm:text-5xl lg:text-6.5xl font-bold tracking-tight leading-[1.1] text-white uppercase text-left"
                  >
                    Somos tu <br className="hidden sm:inline" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-brand-purple to-brand-orange">
                      aliado estratégico digital
                    </span>
                  </motion.h1>

                  <p className="text-base sm:text-lg text-[#D9D9D9]/80 max-w-xl leading-relaxed text-left">
                    Somos un aliado estratégico que combina branding, desarrollo web, comercio electrónico, inteligencia artificial, software a medida y merchandising para construir negocios preparados para el futuro.
                  </p>



                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-start gap-4 mt-2 w-full sm:w-auto">
                    <button
                      onClick={handleAgendarAsesoria}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-semibold tracking-wide bg-gradient-to-r from-brand-blue to-brand-purple hover:shadow-[0_0_30px_rgba(13,110,253,0.4)] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Agendar Asesoría</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Right Columns - Interactive Chameleon Mascot */}
                <div className="lg:col-span-5 flex justify-center items-center">
                  <ChameleonCanvas activeService="inicio" hoveredService={hoveredService} />
                </div>
              </section>

              {/* BRAND TRUST MARQUEE */}
              <section className="py-16 bg-[#6A1EB3] border-y border-white/10 overflow-hidden w-full mb-16">
                <div className="max-w-7xl mx-auto px-4 md:px-8 text-left flex flex-col gap-4 mb-12">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-mono tracking-widest text-white w-fit">
                    <span>NUESTRAS TECNOLOGÍAS</span>
                  </div>
                  <h2 className="text-3xl md:text-4.5xl font-bold tracking-tight text-white">
                    La vanguardia del desarrollo y la inteligencia artificial
                  </h2>
                  <p className="text-sm md:text-base text-white/80 max-w-2xl">
                    Diseñamos sistemas avanzados utilizando las herramientas líderes de la industria para garantizar escalabilidad, velocidad y automatización inteligente.
                  </p>
                </div>
                <div className="max-w-7xl mx-auto px-4 md:px-8 text-left">
                  
                  {/* White Carousel Container */}
                  <div className="relative w-full overflow-hidden py-4 px-2 bg-white rounded-2xl shadow-2xl border border-white/20">
                    {/* Fade gradients on left & right */}
                    <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                    <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
                    
                    <div className="flex animate-marquee gap-8 items-center">
                      {/* Repeat twice for continuous loop */}
                      {[...Array(2)].map((_, listIdx) => (
                        <div key={listIdx} className="flex gap-8 items-center shrink-0">
                          {['OpenAI', 'Google Gemini', 'ElevenLabs', 'N8N AI', 'JavaScript', 'Python', 'WooCommerce', 'Swift', 'Supabase', 'Vercel', 'HubSpot'].map((tech, techIdx) => (
                            <div 
                              key={`${listIdx}-${techIdx}`}
                              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-all duration-300 hover:scale-105 shadow-sm flex items-center gap-2 select-none shrink-0 group cursor-pointer"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-purple" />
                              <span className="text-xs md:text-sm font-bold tracking-wider text-slate-800 group-hover:text-brand-purple transition-colors duration-300">
                                {tech}
                              </span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* SERVICIOS BENTO SECTION */}
              <section className="w-full bg-[#E6E6E6] py-16 my-12 text-slate-900 shadow-inner" id="servicios-section">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                  <div className="text-left max-w-2xl mb-16 flex flex-col gap-4">
                    <h2 className="text-3xl md:text-4.5xl font-bold tracking-tight text-slate-900">
                      No vendemos herramientas. Desarrollamos imperios digitales.
                    </h2>
                    <p className="text-sm md:text-base text-slate-700 font-medium">
                      Cada uno de nuestros servicios está diseñado para interconectarse a la perfección, formando un ecosistema robusto e inteligente que potencia las conversiones.
                    </p>
                  </div>

                  {/* Bento Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {SERVICES_DATA.map((srv) => (
                      <div
                        key={srv.id}
                        onClick={() => navigateToPage(srv.id)}
                        onMouseEnter={() => setHoveredService(srv.id)}
                        onMouseLeave={() => setHoveredService(null)}
                        className="group relative rounded-3xl p-6 md:p-8 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 transition-all duration-300 flex flex-col justify-between cursor-pointer min-h-[300px] hover:-translate-y-1 shadow-md hover:shadow-xl"
                        style={{
                          boxShadow: hoveredService === srv.id ? `0 12px 35px -5px ${srv.color}40` : undefined,
                        }}
                        id={`service-bento-${srv.id}`}
                      >
                        {/* Top Bar with Icon & Mini Accent */}
                        <div className="flex items-center justify-between">
                          <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-md"
                            style={{ backgroundColor: srv.color }}
                          >
                            {renderIcon(srv.iconName, "text-white")}
                          </div>
                          <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                        </div>

                        {/* Content middle */}
                        <div className="mt-8 flex flex-col gap-2 text-left">
                          <h3 className="text-xl font-bold text-slate-900 transition-colors whitespace-pre-line">
                            {srv.title}
                          </h3>
                          <span className="text-xs font-mono font-bold tracking-wide" style={{ color: srv.color }}>
                            {srv.tagline.toUpperCase()}
                          </span>
                          <p className="text-xs md:text-sm text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                            {srv.description}
                          </p>
                        </div>



                        {/* Background Gradient Hover Light */}
                        <div
                          className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                          style={{
                            background: `radial-gradient(circle at 80% 20%, ${srv.color} 0%, transparent 60%)`,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* METODO DIGITAL HOME TIMELINE SECTION */}
              <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 border-t border-white/5" id="metodo-section">
                <div className="text-left max-w-2xl mb-16 flex flex-col gap-4">
                  <h2 className="text-3xl md:text-4.5xl font-bold tracking-tight text-white uppercase">
                    NUESTRA METODOLOGÍA
                  </h2>
                </div>

                {/* Timeline Grid */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
                  {/* Decorative line connector */}
                  <div className="hidden md:block absolute top-12 left-0 right-0 h-[1px] bg-gradient-to-r from-brand-blue via-brand-purple to-brand-orange opacity-20 z-0" />

                  {METHOD_DATA.map((step, i) => (
                    <div
                      key={step.step}
                      className="relative z-10 p-6 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all duration-300 text-left"
                    >
                      {/* Step index circle */}
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-bold text-lg mb-6 shadow-lg"
                        style={{
                          background: `linear-gradient(135deg, ${
                            i === 0 ? '#0D6EFD' : i === 1 ? '#22C55E' : i === 2 ? '#7B2FF7' : i === 3 ? '#FF7A00' : '#EF4444'
                          } 0%, rgba(6,11,22,0.8) 100%)`,
                          border: `1px solid ${
                            i === 0 ? '#0D6EFD' : i === 1 ? '#22C55E' : i === 2 ? '#7B2FF7' : i === 3 ? '#FF7A00' : '#EF4444'
                          }50`
                        }}
                      >
                        {step.step}
                      </div>

                      <h3 className="text-lg font-bold text-white mb-1">{step.name}</h3>
                      <span className="text-[10px] font-mono tracking-wider text-[#D9D9D9]/50 block mb-3 uppercase">
                        {step.tagline}
                      </span>
                      <p className="text-xs text-[#D9D9D9]/70 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* SECTIONS PORTFOLIO AND TECHS REMOVED FROM HOME PAGE */}



              {/* BIOMIMETIC 3D MASCOT COGNITIVE SHOWCASE */}
              <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 border-t border-white/5" id="home-biomimetic-mascot-section">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left">
                  <div className="lg:col-span-7 order-2 lg:order-1 flex justify-center">
                    <ChameleonVideoPlayer
                      videoSrc="/assets/chameleon_guardian_video.mp4"
                      posterSrc="/assets/chameleon_poster.png"
                      title="El Guardián KAMALEON de DIGITAL HOME"
                      subtitle="VIDEO INMERSIVO • GUARDIÁN BIOMIMÉTICO"
                    />
                  </div>

                  <div className="lg:col-span-5 flex flex-col gap-5 items-start text-left order-1 lg:order-2">
                    <h2 className="text-3xl md:text-4.5xl font-bold tracking-tight text-white leading-tight uppercase text-left">
                      EL GUARDIAN DE NUESTROS SISTEMAS
                    </h2>
                    <div className="flex flex-col gap-3 text-sm md:text-base text-[#D9D9D9]/80 leading-relaxed text-left">
                      <p>
                        Nuestro <span className="font-bold text-white">KAMALEON</span> representa la esencia de <span className="font-bold text-white">DIGITAL HOME</span>, la capacidad de adaptarse, innovar y evolucionar en un mundo impulsado por la tecnología.
                      </p>
                      <p>
                        Así como un <span className="font-bold text-white">KAMALEON</span> se adapta a su entorno para sobrevivir y destacar, nosotros desarrollamos soluciones digitales que permiten a las empresas transformarse, crecer y mantenerse competitivas frente a los constantes cambios del mercado.
                      </p>
                      <p className="font-medium text-white italic border-y border-brand-purple/60 py-2.5 px-4 my-1 text-left">
                        El KAMALEON no cambia para ocultarse; cambia para evolucionar.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* TESTIMONIALS */}
              <section className="w-full bg-[#6A1EB3] py-16 my-12 text-white border-y border-white/10 shadow-xl relative overflow-hidden" id="testimonios-section">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                  <div className="text-left max-w-xl mb-16 relative z-10">
                    <h2 className="text-3xl md:text-4.5xl font-bold tracking-tight text-white">Testimonios que avalan nuestra calidad</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    {TESTIMONIALS_DATA.map((t) => (
                      <div
                        key={t.id}
                        className="p-6 md:p-8 rounded-3xl bg-white hover:bg-slate-50 border border-white/20 flex flex-col justify-between text-left relative min-h-[320px] shadow-xl transition-all duration-300 group"
                      >
                        {/* Rating stars & Quote Icon */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {[...Array(t.rating)].map((_, idx) => (
                              <Star key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                          <span className="text-5xl font-serif text-slate-300 leading-none absolute top-6 right-8 group-hover:text-slate-400 transition-colors">“</span>
                        </div>

                        {/* Content text */}
                        <p className="text-xs md:text-sm text-slate-700 italic leading-relaxed mt-6 mb-8 flex-grow font-normal text-left">
                          "{t.content}"
                        </p>

                        {/* Author bottom panel */}
                        <div className="flex items-center gap-3 pt-4 border-t border-slate-200 text-left">
                          <img
                            src={t.avatarUrl}
                            alt={t.author}
                            className="w-10 h-10 rounded-full border border-slate-300 object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="text-left">
                            <h4 className="text-xs md:text-sm font-bold text-slate-900">{t.author}</h4>
                            <span className="text-[10px] font-mono tracking-wider block font-semibold text-[#6A1EB3]">
                              {t.role.toUpperCase()} - {t.company}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* CONTACTO & GOOGLE CALENDAR SCHEDULER SECTION */}
              <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 border-t border-white/5" id="contacto-section">
                {/* Google Calendar Hub Component */}
                <GoogleCalendarHub 
                  compact={true}
                  onEventCreated={() => {
                    console.log('Event booked via Google Calendar Hub');
                  }} 
                />
              </section>
            </motion.div>
          )}

          {/* INTERNAL PAGE: NOSOTROS */}
          {activePage === 'nosotros' && (
            <motion.div
              key="page-nosotros"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-7xl mx-auto px-4 md:px-8 py-8"
            >
              {/* Header */}
              <div className="text-left items-start max-w-3xl mb-16 flex flex-col gap-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-green/10 border border-brand-green/20 rounded-full text-xs font-mono tracking-widest text-brand-green w-fit">
                  <span>¿QUIÉNES SOMOS?</span>
                </div>
                <motion.h1 
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight uppercase text-left"
                >
                  Transformamos ideas en <br className="hidden sm:inline" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-brand-purple to-brand-green">
                    soluciones digitales
                  </span>
                </motion.h1>
                <p className="text-base sm:text-lg text-[#D9D9D9]/90 leading-relaxed mt-2 text-left">
                  En <strong>DIGITAL HOME</strong> ayudamos a empresas, emprendedores y marcas a crecer mediante soluciones digitales innovadoras. Combinamos <strong>branding, desarrollo web, comercio electrónico, inteligencia artificial, software a medida y merchandising</strong> para construir negocios preparados para el futuro.
                </p>
              </div>

              {/* Core MVV Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 text-left">
                <div className="p-8 rounded-3xl bg-white/[0.01] border border-white/5 flex flex-col items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center">
                    <Target className="w-6 h-6 text-brand-blue" />
                  </div>
                  <h3 className="text-lg font-bold text-white">MISIÓN</h3>
                  <p className="text-xs md:text-sm text-[#D9D9D9]/80 leading-relaxed">
                    Impulsar el crecimiento de empresas mediante soluciones digitales inteligentes que combinen creatividad, tecnología e innovación para generar resultados medibles.
                  </p>
                </div>
                <div className="p-8 rounded-3xl bg-white/[0.01] border border-white/5 flex flex-col items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center">
                    <Eye className="w-6 h-6 text-brand-purple" />
                  </div>
                  <h3 className="text-lg font-bold text-white">VISIÓN</h3>
                  <p className="text-xs md:text-sm text-[#D9D9D9]/80 leading-relaxed">
                    Convertirnos en una de las empresas líderes en transformación digital de Latinoamérica, reconocida por desarrollar marcas, plataformas digitales y soluciones de inteligencia artificial que ayuden a miles de empresas a evolucionar.
                  </p>
                </div>
                <div className="p-8 rounded-3xl bg-white/[0.01] border border-white/5 flex flex-col items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center">
                    <Lightbulb className="w-6 h-6 text-brand-orange" />
                  </div>
                  <h3 className="text-lg font-bold text-white">FILOSOFÍA</h3>
                  <p className="text-xs md:text-sm text-[#D9D9D9]/80 leading-relaxed">
                    Cada negocio tiene el potencial de crecer. Nosotros desarrollamos la tecnología para hacerlo posible.
                  </p>
                </div>
              </div>

              {/* Nuestros Valores (PDF) */}
              <div className="mb-16 text-left">
                <div className="mb-8 flex flex-col items-start">
                  <span className="text-[10px] font-mono tracking-widest text-brand-green uppercase block mb-1">NUESTROS VALORES</span>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">Principios que Guían Cada Proyecto</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                  {[
                    { title: 'INNOVACIÓN CONSTANTE', color: '#60AB26', desc: 'Exploramos continuamente las últimas tecnologías para brindar ventajas competitivas reales.' },
                    { title: 'CREATIVIDAD ESTRATÉGICA', color: '#F7AA03', desc: 'Diseños orientados a impactar, transmitir confianza y maximizar la conversión comercial.' },
                    { title: 'HONESTIDAD Y TRANSPARENCIA', color: '#DE4C00', desc: 'Relaciones claras, procesos abiertos y presupuestos transparentes sin costos ocultos.' },
                    { title: 'COMPROMISO CON LOS RESULTADOS', color: '#044FCD', desc: 'Nos enfocamos en métricas que aumentan ventas, automaticen flujos y hacen crecer tu negocio.' },
                    { title: 'TECNOLOGÍA AL SERVICIO DE LAS PERSONAS', color: '#6A1EB3', desc: 'Desarrollamos soluciones intuitivas y accesibles para que la tecnología trabaje a tu favor.' },
                    { title: 'MEJORA CONTINUA', color: '#FF1D1D', desc: 'Evaluamos y optimizamos cada entrega para superar estándares de calidad industrial.' },
                    { title: 'CERCANÍA CON NUESTROS CLIENTES', color: '#60AB26', desc: 'Acompañamiento personalizado en cada etapa de la transformación digital de tu empresa.' },
                    { title: 'SOPORTE Y EVOLUCIÓN', color: '#F7AA03', desc: 'Mantenemos tus plataformas seguras, actualizadas y listas para escalar sin límites.' }
                  ].map((val, idx) => (
                    <div key={idx} className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col items-start gap-2 hover:border-white/10 transition-colors">
                      <div className="w-2.5 h-2.5 rounded-full mb-1 mx-0" style={{ backgroundColor: val.color }} />
                      <h4 className="text-xs font-bold text-white tracking-wider uppercase">{val.title}</h4>
                      <p className="text-[11px] text-[#D9D9D9]/70 leading-relaxed">{val.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nuestro Enfoque (PDF) */}
              <div className="mb-16 p-8 sm:p-12 rounded-3xl bg-white/[0.02] border border-white/10 text-left relative overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-8 flex flex-col items-start">
                    <span className="text-[10px] font-mono tracking-widest text-brand-blue uppercase block mb-2">NUESTRO ENFOQUE</span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
                      "CREAMOS SISTEMAS COMPLETOS PARA HACER CRECER NEGOCIOS"
                    </h2>
                    <p className="text-xs sm:text-sm text-[#D9D9D9]/80 leading-relaxed">
                      En <strong>DIGITAL HOME</strong> diseñamos y desarrollamos páginas web empresariales de alto rendimiento, creadas a la medida para transmitir la solidez de tu marca, optimizar la experiencia de usuario y convertir visitantes en clientes potenciales. Integramos <strong>estructura intuitiva, diseño vanguardista, velocidad de carga ultrarrápida y optimización SEO</strong> para que tu empresa destaque con una presencia digital líder en el mercado.
                    </p>
                  </div>

                  <div className="lg:col-span-4 flex justify-center items-center">
                    <img
                      src="https://lh3.googleusercontent.com/d/1SapGxLCjMs_tyO_jTEOS8N_fyszRgFUB"
                      alt="Nuestro Enfoque - DIGITAL HOME"
                      className="w-auto h-auto max-h-[250px] max-w-full object-contain transition-transform duration-700 hover:scale-[1.02]"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </div>

              {/* Carrusel Dinámico de Clientes (CLIENTES) */}
              <div className="mb-16 text-left">
                <div className="mb-8 flex flex-col items-start">
                  <span className="text-[10px] font-mono tracking-widest text-brand-purple uppercase block mb-1">NUESTROS CLIENTES</span>
                  <h2 className="text-2xl md:text-3xl font-bold text-white uppercase">Empresas que Confían en Nosotros</h2>
                </div>

                <div className="relative w-full overflow-hidden py-4 rounded-2xl bg-white/[0.01] border border-white/5 backdrop-blur-sm">
                  {/* Left & Right gradient masks for smooth fade edges */}
                  <div className="absolute left-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-r from-[#060B16] to-transparent z-10 pointer-events-none" />
                  <div className="absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-l from-[#060B16] to-transparent z-10 pointer-events-none" />

                  {/* Motion Ticker Carousel */}
                  <div className="flex overflow-hidden">
                    <motion.div
                      animate={{ x: ['0%', '-50%'] }}
                      transition={{
                        repeat: Infinity,
                        repeatType: 'loop',
                        ease: 'linear',
                        duration: 25,
                      }}
                      className="flex gap-6 items-center shrink-0 pr-6"
                    >
                      {[
                        { id: 'c1', name: 'ELEVEN INGENIERÍA', tag: 'Ingeniería & Tech', color: '#60AB26', avatar: 'https://lh3.googleusercontent.com/d/16LAP_YQpLymC-_8oFtpm2Q3IXUihCX6X' },
                        { id: 'c2', name: 'LOGICOMEX', tag: 'Logística & Comercio', color: '#044FCD', avatar: 'https://lh3.googleusercontent.com/d/1qhsPmcii__lJm_NAIyjs2lCm6RmN4pWc' },
                        { id: 'c3', name: 'RC TRANSPORTE', tag: 'Transporte Terrestre', color: '#FF1D1D', avatar: 'https://lh3.googleusercontent.com/d/1GZQpKIEVYLSlVzvuD2Igge4L8pyqedVb' },
                        { id: 'c4', name: 'C&C PRODUCCIONES', tag: 'Producción & Eventos', color: '#7B2FF7', avatar: 'https://lh3.googleusercontent.com/d/1FZgLNfovxIU1l12-4T--5luNfyyve5dp' },
                        { id: 'c5', name: 'VITAL FISH', tag: 'Acuicultura & Alimentos', color: '#DE4C00', avatar: 'https://lh3.googleusercontent.com/d/1NxJwo_TBqcaOmDMUoZnrin9hEOg03MNt' },
                        { id: 'c6', name: 'NOEMI COLOMBIA', tag: 'Moda & Retail', color: '#F7AA03', avatar: 'https://lh3.googleusercontent.com/d/1bnaCYc0NAHyEEqMZ3OcAdbR2nlYHLO_n' },
                        { id: 'c7', name: 'ADUACOL', tag: 'Aduanas & Comercio', color: '#044FCD', avatar: 'https://lh3.googleusercontent.com/d/1dTwqbxC-I3p3OdaGrkwBg68GOvAsk-0G' },
                        { id: 'c8', name: 'COLSEMILLAS', tag: 'Agro & Semillas', color: '#60AB26', avatar: 'https://lh3.googleusercontent.com/d/1zIkYONyZn3tGPETFWp9zzVEtVfq27zqr' },

                        // Duplicate set for seamless infinite loop
                        { id: 'c1-dup', name: 'ELEVEN INGENIERÍA', tag: 'Ingeniería & Tech', color: '#60AB26', avatar: 'https://lh3.googleusercontent.com/d/16LAP_YQpLymC-_8oFtpm2Q3IXUihCX6X' },
                        { id: 'c2-dup', name: 'LOGICOMEX', tag: 'Logística & Comercio', color: '#044FCD', avatar: 'https://lh3.googleusercontent.com/d/1qhsPmcii__lJm_NAIyjs2lCm6RmN4pWc' },
                        { id: 'c3-dup', name: 'RC TRANSPORTE', tag: 'Transporte Terrestre', color: '#FF1D1D', avatar: 'https://lh3.googleusercontent.com/d/1GZQpKIEVYLSlVzvuD2Igge4L8pyqedVb' },
                        { id: 'c4-dup', name: 'C&C PRODUCCIONES', tag: 'Producción & Eventos', color: '#7B2FF7', avatar: 'https://lh3.googleusercontent.com/d/1FZgLNfovxIU1l12-4T--5luNfyyve5dp' },
                        { id: 'c5-dup', name: 'VITAL FISH', tag: 'Acuicultura & Alimentos', color: '#DE4C00', avatar: 'https://lh3.googleusercontent.com/d/1NxJwo_TBqcaOmDMUoZnrin9hEOg03MNt' },
                        { id: 'c6-dup', name: 'NOEMI COLOMBIA', tag: 'Moda & Retail', color: '#F7AA03', avatar: 'https://lh3.googleusercontent.com/d/1bnaCYc0NAHyEEqMZ3OcAdbR2nlYHLO_n' },
                        { id: 'c7-dup', name: 'ADUACOL', tag: 'Aduanas & Comercio', color: '#044FCD', avatar: 'https://lh3.googleusercontent.com/d/1dTwqbxC-I3p3OdaGrkwBg68GOvAsk-0G' },
                        { id: 'c8-dup', name: 'COLSEMILLAS', tag: 'Agro & Semillas', color: '#60AB26', avatar: 'https://lh3.googleusercontent.com/d/1zIkYONyZn3tGPETFWp9zzVEtVfq27zqr' },
                      ].map((client: any, idx) => {
                        const IconComponent = client.icon;
                        return (
                          <div
                            key={`${client.id}-${idx}`}
                            className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-white/20 transition-all duration-300 shrink-0 group min-w-[240px]"
                          >
                            {client.avatar ? (
                              <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20 bg-white/10 p-0.5 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-brand-blue/50 transition-all duration-300">
                                <img
                                  src={client.avatar}
                                  alt={client.name}
                                  className="w-full h-full rounded-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            ) : (
                              <div
                                className="w-12 h-12 rounded-full flex items-center justify-center border border-white/20 shrink-0 group-hover:scale-105 transition-transform duration-300"
                                style={{ backgroundColor: `${client.color}20`, borderColor: `${client.color}40` }}
                              >
                                {IconComponent && <IconComponent className="w-5 h-5" style={{ color: client.color }} />}
                              </div>
                            )}
                            <div className="text-left">
                              <h4 className="text-xs font-bold text-white tracking-wider uppercase group-hover:text-brand-blue transition-colors">
                                {client.name}
                              </h4>
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Quick Call to Action */}
              <div className="rounded-3xl bg-gradient-to-r from-brand-blue/30 via-brand-purple/20 to-transparent border border-white/10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-left">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Hablemos de tu proyecto</h3>
                  <p className="text-xs md:text-sm text-[#D9D9D9]/80 max-w-xl leading-relaxed">
                    Escríbenos a <strong>comercial@digitalhome.com.co</strong> o comunícate vía WhatsApp al <strong>(+57) 322 613 87 73</strong> para iniciar la transformación digital de tu marca.
                  </p>
                </div>
                <button
                  onClick={handleAgendarAsesoria}
                  className="px-6 py-3.5 rounded-xl text-xs font-bold bg-white text-brand-bg hover:opacity-90 transition-all duration-300 whitespace-nowrap cursor-pointer flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Agendar Asesoría</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* INTERNAL PAGES: SPECIFIC SERVICES VIEWS */}
          {SERVICES_DATA.some(s => s.id === activePage) && (() => {
            const service = SERVICES_DATA.find(s => s.id === activePage)!;
            const primaryPortfolio = PORTFOLIO_DATA.filter(p => p.serviceId === service.id);
            const fallbackPortfolio = PORTFOLIO_DATA.filter(p => p.serviceId !== service.id);
            const relatedPortfolio = (primaryPortfolio.length >= 3 
              ? primaryPortfolio 
              : [...primaryPortfolio, ...fallbackPortfolio]
            ).slice(0, 3);

            return (
              <motion.div
                key={`page-${service.id}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-7xl mx-auto px-4 md:px-8 py-8"
              >
                {/* 1. Service Hero */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16 text-left">
                  <div className="lg:col-span-7 flex flex-col gap-4">
                    <button
                      onClick={() => navigateToPage('inicio')}
                      className="text-xs font-mono text-brand-blue hover:underline mb-2 flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                      <span>VOLVER A INICIO</span>
                    </button>
                    
                    <span className="text-xs font-mono tracking-widest uppercase block" style={{ color: service.color }}>
                      {service.tagline}
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight whitespace-pre-line">
                      {service.title}
                    </h1>
                    <p className="text-sm md:text-base text-[#D9D9D9]/85 leading-relaxed mt-2">
                      {service.description}
                    </p>

                    <div className="flex gap-4 mt-4">
                      <button
                        onClick={handleAgendarAsesoria}
                        className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-blue to-brand-purple hover:opacity-95 cursor-pointer flex items-center gap-2"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Agendar Asesoría</span>
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-5 flex justify-center">
                    <ChameleonCanvas activeService={service.id} hoveredService={null} />
                  </div>
                </div>

                {/* Custom Showcase for Branding Service */}
                {service.id === 'branding' && (
                  <div className="mb-20 border-t border-white/5 pt-16 text-left">
                    <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-white/[0.01] p-4 group shadow-2xl">
                      <img
                        src="https://lh3.googleusercontent.com/d/1EbZkTDwzRrxGyinssNQ_CFaRXKckMs6Z"
                        alt="Ecosistema de Marca DIGITAL HOME - Branding Showcase"
                        className="w-full h-auto object-cover rounded-2xl transition-transform duration-700 hover:scale-[1.005]"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.dataset.triedFallback) {
                            target.dataset.triedFallback = 'true';
                            target.src = 'https://drive.google.com/thumbnail?id=1EbZkTDwzRrxGyinssNQ_CFaRXKckMs6Z&sz=w1600';
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6 sm:p-10 pointer-events-none">
                        <div>
                          <span className="text-xs font-mono text-brand-blue uppercase tracking-wider block mb-1">IDENTIDAD VISUAL CORPORATIVA</span>
                          <h4 className="text-lg sm:text-xl font-bold text-white">Manual de Identidad y Camaleón Oficial en 3D de DIGITAL HOME</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Custom Showcase for Web Service */}
                {service.id === 'web' && (
                  <div className="mb-20 border-t border-white/5 pt-16 text-left">
                    <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-white/[0.01] p-4 group shadow-2xl">
                      <img
                        src="https://lh3.googleusercontent.com/d/13_HTBZd3yRZ4WsMlmp0QNjZwq65Yt9tn"
                        alt="Desarrollo Web DIGITAL HOME - Showcase"
                        className="w-full h-auto object-cover rounded-2xl transition-transform duration-700 hover:scale-[1.005]"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.dataset.triedFallback) {
                            target.dataset.triedFallback = 'true';
                            target.src = 'https://drive.google.com/thumbnail?id=13_HTBZd3yRZ4WsMlmp0QNjZwq65Yt9tn&sz=w1600';
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6 sm:p-10 pointer-events-none">
                        <div>
                          <span className="text-xs font-mono text-brand-blue uppercase tracking-wider block mb-1">ALTA INGENIERÍA DIGITAL</span>
                          <h4 className="text-lg sm:text-xl font-bold text-white">Línea Oficial de Desarrollo de Ecosistemas Web DIGITAL HOME</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Custom Showcase for Ecommerce Service */}
                {service.id === 'ecommerce' && (
                  <div className="mb-20 border-t border-white/5 pt-16 text-left">
                    <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-white/[0.01] p-4 group shadow-2xl">
                      <img
                        src="https://lh3.googleusercontent.com/d/1hytoJvgqZJ4XbSAz5H6EGqi2Hl7_PUWV"
                        alt="Tienda Online DIGITAL HOME - Showcase"
                        className="w-full h-auto object-cover rounded-2xl transition-transform duration-700 hover:scale-[1.005]"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.dataset.triedFallback) {
                            target.dataset.triedFallback = 'true';
                            target.src = 'https://drive.google.com/thumbnail?id=1hytoJvgqZJ4XbSAz5H6EGqi2Hl7_PUWV&sz=w1600';
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6 sm:p-10 pointer-events-none">
                        <div>
                          <span className="text-xs font-mono text-brand-blue uppercase tracking-wider block mb-1">CONVERSIÓN EXTREMA</span>
                          <h4 className="text-lg sm:text-xl font-bold text-white">Línea Oficial de Tiendas Online y Pasarelas DIGITAL HOME</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Custom Showcase for AI Agent Service */}
                {service.id === 'ai' && (
                  <div className="mb-20 border-t border-white/5 pt-16 text-left">
                    <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-white/[0.01] p-4 group shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                      <img
                        src="https://lh3.googleusercontent.com/d/1HsB-L3GzSnzB3n7-gm5KUGrkhlqkkJKs"
                        alt="Agentes de Inteligencia Artificial DIGITAL HOME - Showcase"
                        className="w-full h-auto object-cover rounded-2xl transition-transform duration-700 hover:scale-[1.005]"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.dataset.triedFallback) {
                            target.dataset.triedFallback = 'true';
                            target.src = 'https://drive.google.com/thumbnail?id=1HsB-L3GzSnzB3n7-gm5KUGrkhlqkkJKs&sz=w1600';
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6 sm:p-10 pointer-events-none">
                        <div>
                          <span className="text-xs font-mono text-brand-blue uppercase tracking-wider block mb-1">AUTONOMÍA Y COMPUTACIÓN COGNITIVA</span>
                          <h4 className="text-lg sm:text-xl font-bold text-white">Línea Oficial de Agentes Cognitivos y Camaleón IA de DIGITAL HOME</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Custom Showcase for Software Service */}
                {service.id === 'software' && (
                  <div className="mb-20 border-t border-white/5 pt-16 text-left">
                    <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-white/[0.01] p-4 group shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                      <img
                        src="https://lh3.googleusercontent.com/d/1VjnWcjY0khfHcRbdpUqqbOKJeFdm1NcA"
                        alt="Software a Medida DIGITAL HOME - Showcase"
                        className="w-full h-auto object-cover rounded-2xl transition-transform duration-700 hover:scale-[1.005]"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.dataset.triedFallback) {
                            target.dataset.triedFallback = 'true';
                            target.src = 'https://drive.google.com/thumbnail?id=1VjnWcjY0khfHcRbdpUqqbOKJeFdm1NcA&sz=w1600';
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6 sm:p-10 pointer-events-none">
                        <div>
                          <span className="text-xs font-mono text-brand-blue uppercase tracking-wider block mb-1">ARQUITECTURA DE ALTO RENDIMIENTO</span>
                          <h4 className="text-lg sm:text-xl font-bold text-white">Línea Oficial de Plataformas y Desarrollo de Software DIGITAL HOME</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Custom Showcase for Merchandising Service */}
                {service.id === 'merch' && (
                  <div className="mb-20 border-t border-white/5 pt-16 text-left">
                    <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-white/[0.01] p-4 group shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                      <img
                        src="https://lh3.googleusercontent.com/d/1GQcKFlCaVY5Ofwolx0MoubLu-PFQJWwf"
                        alt="Merchandising Corporativo DIGITAL HOME - Showcase"
                        className="w-full h-auto object-cover rounded-2xl transition-transform duration-700 hover:scale-[1.005]"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.dataset.triedFallback) {
                            target.dataset.triedFallback = 'true';
                            target.src = 'https://drive.google.com/thumbnail?id=1GQcKFlCaVY5Ofwolx0MoubLu-PFQJWwf&sz=w1600';
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6 sm:p-10 pointer-events-none">
                        <div>
                          <span className="text-xs font-mono text-brand-red uppercase tracking-wider block mb-1">CALIDAD INDUSTRIAL PREMIUM</span>
                          <h4 className="text-lg sm:text-xl font-bold text-white">Línea Oficial de Merchandising y Packaging de DIGITAL HOME</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Core Benefits Grid */}
                <div className="mb-20">
                  <div className="text-left mb-10">
                    <span className="text-[10px] font-mono tracking-widest text-[#D9D9D9]/50 uppercase block mb-1">DIFERENCIADORES CLAVE</span>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">
                      {service.id === 'branding'
                        ? '¿Por qué elegir DIGITAL HOME para TU Branding?'
                        : service.id === 'web'
                        ? '¿Por qué elegir DIGITAL HOME para TU Página Web?'
                        : service.id === 'ecommerce'
                        ? '¿Por qué elegir DIGITAL HOME para TU Tienda Online?'
                        : service.id === 'ai'
                        ? '¿Por qué elegir DIGITAL HOME para TU Agente IA?'
                        : service.id === 'software'
                        ? '¿Por qué elegir DIGITAL HOME para TU Software EMPRESARIAL?'
                        : service.id === 'merch'
                        ? '¿Por qué elegir DIGITAL HOME para TU Merchandising?'
                        : `¿Por qué elegir DIGITAL HOME para ${service.title.replace('\n', ' ')}?`}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                    {service.benefits.map((benefit, idx) => (
                      <div key={idx} className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${service.color}15`, border: `1px solid ${service.color}30` }}
                        >
                          <Check className="w-5 h-5" style={{ color: service.color }} />
                        </div>
                        <h3 className="text-sm font-bold text-white">{benefit.title}</h3>
                        <p className="text-xs text-[#D9D9D9]/70 leading-relaxed">{benefit.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Specific Process Timeline */}
                <div 
                  className="mb-20 border-t pt-16 p-6 sm:p-8 rounded-3xl"
                  style={{
                    backgroundColor: `${service.color}15`,
                    borderColor: `${service.color}35`,
                    borderWidth: '1px'
                  }}
                >
                  <div className="text-left mb-10">
                    <span className="text-[10px] font-mono tracking-widest text-[#D9D9D9]/70 uppercase block mb-1 font-semibold">PROCESO TÉCNICO</span>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">El proceso de entrega</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
                    {service.process.map((p, idx) => (
                      <div 
                        key={idx} 
                        className="relative p-6 rounded-2xl flex flex-col gap-2"
                        style={{
                          backgroundColor: `${service.color}22`,
                          borderColor: `${service.color}45`,
                          borderWidth: '1px'
                        }}
                      >
                        <span className="text-4xl font-extrabold font-mono opacity-30 mb-2 block" style={{ color: service.color }}>{p.phase}</span>
                        <h3 className="text-sm font-bold text-white">{p.title}</h3>
                        <p className="text-xs text-[#D9D9D9]/80 leading-relaxed">{p.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Related Case Studies */}
                {relatedPortfolio.length > 0 && service.id !== 'ai' && service.id !== 'software' && (
                  <div className="mb-20 border-t border-white/5 pt-16 text-left">
                    <div className="mb-10">
                      <span className="text-[10px] font-mono tracking-widest text-[#D9D9D9]/50 uppercase block mb-1">HISTORIAS COMPARTIDAS</span>
                      <h2 className="text-2xl md:text-3xl font-bold text-white">Casos de Éxito en esta Área</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {relatedPortfolio.map(item => (
                        <div key={item.id} className="p-6 rounded-3xl bg-slate-200 border border-slate-300 flex flex-col gap-4 items-start shadow-md hover:shadow-lg transition-shadow">
                          <button
                            type="button"
                            onClick={() => openProjectModal(item)}
                            className="w-full aspect-video rounded-2xl overflow-hidden border border-slate-300 block group/img relative cursor-pointer text-left"
                            title={`Ver ${item.title}`}
                          >
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                const target = e.currentTarget;
                                if (!target.dataset.triedFallback && item.imageUrl.includes('lh3.googleusercontent.com/d/')) {
                                  const id = item.imageUrl.split('/d/')[1];
                                  if (id) {
                                    target.dataset.triedFallback = 'true';
                                    target.src = `https://drive.google.com/thumbnail?id=${id}&sz=w1600`;
                                  }
                                }
                              }}
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-bold">
                              <span>Ver Proyecto Completo</span>
                              <ExternalLink className="w-4 h-4" />
                            </div>
                          </button>
                          <div className="flex-grow w-full">
                            <span className="text-[9px] font-mono tracking-widest text-brand-purple font-bold block mb-1 uppercase">CLIENTE: {item.client}</span>
                            <button
                              type="button"
                              onClick={() => openProjectModal(item)}
                              className="text-lg font-bold text-slate-900 mb-2 hover:text-brand-purple transition-colors block text-left cursor-pointer"
                            >
                              {item.title}
                            </button>
                            <button
                              type="button"
                              onClick={() => openProjectModal(item)}
                              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-brand-purple text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm mt-1"
                            >
                              <Globe className="w-3.5 h-3.5" />
                              <span>Ver Proyecto en Visor</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}




              </motion.div>
            );
          })()}

          {/* INTERNAL PAGE: PORTAFOLIO COMPLETE */}
          {activePage === 'portafolio' && (
            <motion.div
              key="page-portafolio"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-7xl mx-auto px-4 md:px-8 py-8"
            >
              <div className="text-left max-w-2xl mb-12 flex flex-col gap-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-orange/10 border border-brand-orange/20 rounded-full text-xs font-mono tracking-widest text-brand-orange w-fit">
                  <span>PORTAFOLIO DE IMPACTO</span>
                </div>
                <h1 className="text-4xl font-extrabold text-white">Casos de éxito verificados</h1>
              </div>

              {/* Portfolio Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                {filteredPortfolio.map(item => (
                  <div
                    key={item.id}
                    className="group relative rounded-3xl overflow-hidden bg-white/[0.01] border border-white/10 flex flex-col hover:border-white/20 transition-all duration-300 text-left"
                  >
                    <button
                      type="button"
                      onClick={() => openProjectModal(item)}
                      className="w-full aspect-[16/9] overflow-hidden block group/img relative cursor-pointer text-left"
                      title={`Ver ${item.title}`}
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.dataset.triedFallback && item.imageUrl.includes('lh3.googleusercontent.com/d/')) {
                            const id = item.imageUrl.split('/d/')[1];
                            if (id) {
                              target.dataset.triedFallback = 'true';
                              target.src = `https://drive.google.com/thumbnail?id=${id}&sz=w1600`;
                            }
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-bold">
                        <span>Ver Proyecto / Imagen Completa HD</span>
                        <ExternalLink className="w-4 h-4" />
                      </div>
                    </button>
                    <div className="p-8 flex flex-col justify-between flex-grow">
                      <div>
                        <span className="text-[10px] font-mono tracking-wider text-brand-blue block mb-1">CLIENTE: {item.client.toUpperCase()}</span>
                        <button
                          type="button"
                          onClick={() => openProjectModal(item)}
                          className="text-xl font-bold text-white mb-3 hover:text-brand-blue transition-colors block text-left cursor-pointer"
                        >
                          {item.title}
                        </button>
                        <button
                          type="button"
                          onClick={() => openProjectModal(item)}
                          className="mt-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-brand-blue text-white text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer w-fit border border-white/10"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>Abrir Proyecto en Visor</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* INTERNAL PAGE: BLOG COMPLETE */}
          {activePage === 'blog' && (
            <motion.div
              key="page-blog"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-7xl mx-auto px-4 md:px-8 py-8"
            >
              <div className="text-left max-w-2xl mb-12 flex flex-col gap-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-yellow/10 border border-brand-yellow/20 rounded-full text-xs font-mono tracking-widest text-brand-yellow w-fit">
                  <span>CONOCIMIENTO ABIERTO</span>
                </div>
                <h1 className="text-4xl font-extrabold text-white">Blog de Innovación</h1>
                <p className="text-sm md:text-base text-[#D9D9D9]/80">
                  Explora las últimas tendencias en Inteligencia Artificial, branding corporativo, desarrollo web avanzado y optimización de conversión.
                </p>
              </div>

              {/* Blog Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {BLOG_DATA.map(article => (
                  <div
                    key={article.id}
                    onClick={() => setActiveBlogModal(article)}
                    className="group rounded-3xl overflow-hidden bg-white/[0.01] hover:bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all duration-300 text-left cursor-pointer flex flex-col shadow-xl"
                  >
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full aspect-[16/10] object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.dataset.triedFallback && article.imageUrl.includes('lh3.googleusercontent.com/d/')) {
                          const id = article.imageUrl.split('/d/')[1];
                          if (id) {
                            target.dataset.triedFallback = 'true';
                            target.src = `https://drive.google.com/thumbnail?id=${id}&sz=w1600`;
                          }
                        }
                      }}
                    />
                    <div className="p-6 flex flex-col justify-between flex-grow">
                      <div>
                        <div className="flex items-center justify-between mb-3 text-[10px] font-mono text-[#D9D9D9]/50">
                          <span className="px-2 py-0.5 bg-brand-blue/10 text-brand-blue border border-brand-blue/15 rounded-md uppercase font-bold">
                            {article.category}
                          </span>
                          <span>{article.date}</span>
                        </div>
                        <h3 className="text-lg font-bold text-white group-hover:text-brand-blue transition-colors duration-300 leading-snug mb-3">
                          {article.title}
                        </h3>
                        <p className="text-xs text-[#D9D9D9]/70 leading-relaxed mb-6 line-clamp-3">
                          {article.summary}
                        </p>
                      </div>
                      <span className="text-xs font-mono text-brand-blue group-hover:underline flex items-center gap-1.5 mt-auto">
                        <span>Leer artículo</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* INTERNAL PAGE: CONTACT COMPLETE */}
          {activePage === 'contacto' && (
            <motion.div
              key="page-contacto"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-7xl mx-auto px-4 md:px-8 py-8"
            >
              <div className="text-center max-w-2xl mx-auto mb-16">
                <span className="text-[10px] font-mono tracking-widest text-[#D9D9D9]/50 uppercase block mb-1">CONECTA CON NOSOTROS</span>
                <h1 className="text-4xl font-extrabold text-white">Cuéntanos sobre tu próximo proyecto</h1>
              </div>

              {/* Direct Grid with channels */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left mb-16">
                <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col gap-3">
                  <Mail className="w-6 h-6 text-brand-blue" />
                  <h3 className="text-sm font-bold text-white">Correo Corporativo</h3>
                  <a href="mailto:comercial@digitalhome.com.co" className="text-xs font-mono text-brand-blue hover:underline">
                    comercial@digitalhome.com.co
                  </a>
                </div>

                <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col gap-3">
                  <Phone className="w-6 h-6 text-brand-green" />
                  <h3 className="text-sm font-bold text-white">WhatsApp de Soporte</h3>
                  <a href="https://wa.me/573226138773" target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-brand-green hover:underline">
                    (+57) 3226138773
                  </a>
                </div>

                <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col gap-3">
                  <MapPin className="w-6 h-6 text-brand-purple" />
                  <h3 className="text-sm font-bold text-white">Nuestras Oficinas</h3>
                  <span className="text-xs font-mono text-brand-purple">Carrera 65B No. 2-73 / Medellin / Colombia</span>
                </div>
              </div>

              {/* High Quality Normal Contact Form (Moved from Home Page) */}
              <div className="max-w-4xl mx-auto rounded-3xl border border-white/10 bg-white/[0.01] p-6 md:p-8 text-left shadow-2xl relative mb-16">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-brand-purple" />
                    <h3 className="text-lg font-bold text-white">Escríbenos</h3>
                  </div>
                </div>

                <form onSubmit={handleContactSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-[#D9D9D9]/50 uppercase mb-1.5">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="Ej: Sofía Valenzuela"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand-purple"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-[#D9D9D9]/50 uppercase mb-1.5">Correo Corporativo *</label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="sofia@tuempresa.com"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand-purple"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-[#D9D9D9]/50 uppercase mb-1.5 font-mono">Teléfono / WhatsApp</label>
                    <input
                      type="tel"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      placeholder="Ej: +56 9 1234 5678"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand-purple"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-[#D9D9D9]/50 uppercase mb-1.5">Nombre de la Empresa</label>
                    <input
                      type="text"
                      value={contactForm.company}
                      onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                      placeholder="Ej: Aura Digital Corp"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand-purple"
                    />
                  </div>



                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-mono text-[#D9D9D9]/50 uppercase mb-1.5">Cuéntanos sobre tu Visión *</label>
                    <textarea
                      required
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Describe brevemente tus requerimientos y metas de conversión..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand-purple resize-none"
                    />
                  </div>

                  {contactStatus.message && (
                    <div className={`md:col-span-2 p-4 rounded-xl text-xs font-semibold ${contactStatus.success ? 'bg-brand-green/10 text-brand-green border border-brand-green/20' : 'bg-brand-red/10 text-brand-red border border-brand-red/20'}`}>
                      {contactStatus.message}
                    </div>
                  )}

                  <div className="md:col-span-2 mt-2">
                    <button
                      type="submit"
                      disabled={contactStatus.loading}
                      className="w-full py-3.5 rounded-xl text-xs font-bold tracking-wider text-white bg-gradient-to-r from-brand-blue via-brand-purple to-brand-orange hover:shadow-[0_0_25px_rgba(13,110,253,0.4)] hover:opacity-95 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 shadow-xl"
                    >
                      {contactStatus.loading ? (
                        <div className="w-4 h-4 border-2 border-brand-bg/30 border-t-brand-bg rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Enviar Propuesta de Proyecto</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>


            </motion.div>
          )}

          {/* INTERNAL PAGE: AGENDA & GOOGLE CALENDAR */}
          {activePage === 'agenda' && (
            <motion.div
              key="page-agenda"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-7xl mx-auto px-4 md:px-8 py-12"
            >


              {/* Main Interactive Calendar Hub */}
              <GoogleCalendarHub
                hideHeader={true}
                hideRightColumn={true}
                onEventCreated={() => {
                  console.log('Event booked via Agenda Page');
                }}
              />

              {/* Tips for the discovery session */}
              <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-white/[0.02] to-white/[0.01] border border-white/10 text-left">
                <h3 className="text-lg font-bold text-white mb-3">¿Cómo preparar tu sesión de consultoría técnica?</h3>
                <p className="text-xs text-[#D9D9D9]/70 mb-6 leading-relaxed max-w-3xl">
                  Para aprovechar al máximo los 30 minutos de diagnóstico gratuito con nuestros ingenieros y arquitectos de soluciones, te recomendamos tener a mano:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs text-[#D9D9D9]/80">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-brand-blue font-mono font-bold block mb-1">01. Objetivos</span>
                    <span>Metas clave de conversión, ventas o automatización de tu negocio.</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-brand-purple font-mono font-bold block mb-1">02. Stack Actual</span>
                    <span>Herramientas, CRM, plataformas web o bases de datos en uso.</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-brand-orange font-mono font-bold block mb-1">03. Referencias</span>
                    <span>Sitios web, aplicaciones o experiencias visuales de referencia.</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-brand-green font-mono font-bold block mb-1">04. Plazos</span>
                    <span>Tiempos estimados de lanzamiento y presupuesto proyectado.</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* 4. Glassmorphic Footer */}
      <footer className="border-t border-white/10 bg-[#060B16] relative z-20 py-16 text-left" id="footer-root">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-12">
          
          {/* Logo panel */}
          <div className="md:col-span-4 flex flex-col gap-4 items-center md:items-start text-center md:text-left">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigateToPage('inicio');
              }}
              className="flex items-center justify-center md:justify-start gap-3 cursor-pointer w-full md:w-auto"
            >
              <img
                src="https://lh3.googleusercontent.com/d/1mFNeJcYcuTRybKq_Ox3jUoD6OnLgD0vX"
                alt="DIGITAL HOME"
                className="md:h-18 h-13 w-auto object-contain filter drop-shadow-[0_0_8px_rgba(13,110,253,0.3)] hover:scale-105 transition-transform duration-300 mx-auto md:mx-0"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset.triedLocal) {
                    target.dataset.triedLocal = 'true';
                    target.src = '/assets/digital_home_logo.png';
                  } else {
                    target.style.display = 'none';
                    const fb = document.getElementById('footer-logo-fallback');
                    if (fb) fb.style.display = 'flex';
                  }
                }}
              />
              <div id="footer-logo-fallback" className="hidden items-center justify-center md:justify-start gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-blue to-brand-purple p-[1px]">
                  <div className="w-full h-full bg-brand-bg rounded-[7px] flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4 text-brand-blue" />
                  </div>
                </div>
                <span className="text-lg font-bold tracking-wider text-white">DIGITAL HOME</span>
              </div>
            </a>
          </div>

          {/* Quick links */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <h4 className="text-xs font-mono tracking-widest text-[#D9D9D9]/50 uppercase">Menú</h4>
            {[
              { id: 'inicio', label: 'Inicio' },
              { id: 'nosotros', label: 'Nosotros' },
              { id: 'portafolio', label: 'Portafolio' },
              { id: 'agenda', label: 'Agenda / Agendar Cita' },
              { id: 'blog', label: 'Blog' },
              { id: 'contacto', label: 'Contacto' },
            ].map(link => (
              <a
                key={link.id}
                href={PAGE_TO_PATH[link.id as PageType]}
                onClick={(e) => {
                  e.preventDefault();
                  navigateToPage(link.id as PageType);
                }}
                className="text-xs text-[#D9D9D9]/80 hover:text-white transition-colors duration-200 text-left cursor-pointer"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Services list */}
          <div className="md:col-span-3 flex flex-col gap-3">
            <h4 className="text-xs font-mono tracking-widest text-[#D9D9D9]/50 uppercase">Servicios</h4>
            {SERVICES_DATA.map(srv => (
              <a
                key={srv.id}
                href={PAGE_TO_PATH[srv.id]}
                onClick={(e) => {
                  e.preventDefault();
                  navigateToPage(srv.id);
                }}
                className="text-xs text-[#D9D9D9]/80 hover:text-white transition-colors duration-200 text-left cursor-pointer flex items-center gap-1.5"
              >
                <span className="w-1 h-1 rounded-full" style={{ backgroundColor: srv.color }} />
                <span>{srv.title}</span>
              </a>
            ))}
          </div>

          {/* Contact footer */}
          <div className="md:col-span-3 flex flex-col gap-3 text-xs text-[#D9D9D9]/80">
            <h4 className="text-xs font-mono tracking-widest text-[#D9D9D9]/50 uppercase">Contacto</h4>
            <a href="mailto:comercial@digitalhome.com.co" className="flex items-center gap-2 hover:text-white transition-colors">
              <Mail className="w-4 h-4 text-brand-blue" />
              <span>comercial@digitalhome.com.co</span>
            </a>
            <a href="https://wa.me/573226138773" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
              <Phone className="w-4 h-4 text-brand-green" />
              <span>(+57) 322 613 87 73</span>
            </a>
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-purple shrink-0" />
              <span>Carrera 65B No. 2-73 / Medellin / Colombia</span>
            </span>
          </div>
        </div>

        {/* Sub-footer: Google Suite, SEO & Legal */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#D9D9D9]/60">
          <div>
            © {new Date().getFullYear()} NOVA Soluciones Digitales & DIGITAL HOME. Todos los derechos reservados.
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setGoogleToolsOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-white transition flex items-center gap-2 cursor-pointer shadow-sm group"
              title="Configuración de Google Analytics, Search Console y Tag Manager"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <BarChart3 className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-[11px]">Google Suite (Analytics, GTM & SEO)</span>
            </button>
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#D9D9D9]/60 hover:text-white text-[11px] transition flex items-center gap-1"
            >
              <FileText className="w-3 h-3" /> Sitemap
            </a>
            <a
              href="/robots.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#D9D9D9]/60 hover:text-white text-[11px] transition flex items-center gap-1"
            >
              <ShieldCheck className="w-3 h-3" /> Robots.txt
            </a>
          </div>
        </div>
      </footer>

      {/* 5. Floating Action Speed Dials (CRO Actions) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        {/* Google Suite Manager Floating Trigger */}
        <button
          onClick={() => setGoogleToolsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-slate-900 to-indigo-950 text-amber-400 border border-slate-700/80 hover:border-amber-400 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer group relative backdrop-blur-md"
          aria-label="Google Suite (Analytics, GTM, Search Console)"
          title="Google Suite: Analytics, Tag Manager & Search Console"
        >
          <BarChart3 className="w-6 h-6 text-amber-400 group-hover:rotate-6 transition-transform" />
          <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900 animate-pulse"></span>
          <span className="absolute right-full mr-3 px-2.5 py-1 bg-[#060B16]/95 border border-white/10 rounded-md text-[10px] font-mono tracking-wider text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
            GOOGLE SUITE & SEO
          </span>
        </button>

        {/* WhatsApp Direct */}
        <a
          href="https://wa.me/573226138773"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackWhatsAppClick('floating_button')}
          className="w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer group relative overflow-hidden"
          aria-label="Hablar directo por WhatsApp"
        >
          <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
          </svg>
          <span className="absolute right-full mr-3 px-2 py-1 bg-[#060B16]/95 border border-white/10 rounded-md text-[10px] font-mono tracking-wider text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            HABLAR CON ASESOR
          </span>
        </a>
      </div>

      {/* 6. AI Agent Chatbot Panel (Glassmorphism Slideover) */}
      <AnimatePresence>
        {aiChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-[90%] sm:w-[400px] h-[550px] glass-panel-heavy rounded-3xl border border-white/10 z-40 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
          >
            {/* Header chat */}
            <div className="p-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-purple flex items-center justify-center text-white relative">
                  <Cpu className="w-4 h-4" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-brand-green border border-[#060B16]" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-bold text-white">DIGITAL HOME AI Consultant</h4>
                  <span className="text-[9px] font-mono text-brand-green tracking-widest block uppercase">ONLINE · GEMINI 3.5</span>
                </div>
              </div>
              <button onClick={() => setAiChatOpen(false)} className="p-1 text-[#D9D9D9]/60 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages Panel */}
            <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-4 text-left">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-brand-blue text-white rounded-tr-none'
                      : 'bg-white/[0.04] text-[#D9D9D9]/90 border border-white/5 rounded-tl-none'
                  }`}>
                    {msg.content.split('\n').map((line, idx) => (
                      <span key={idx} className="block mt-1">{line}</span>
                    ))}
                  </div>
                  <span className="text-[8px] font-mono text-[#D9D9D9]/40 mt-1">{msg.timestamp}</span>
                </div>
              ))}
              {chatLoading && (
                <div className="self-start p-3 rounded-2xl bg-white/[0.04] border border-white/5 rounded-tl-none flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick Consultation Presets (CRO) */}
            <div className="px-4 py-2 border-t border-white/5 bg-white/[0.01] flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none">
              <button
                onClick={() => triggerQuickPrompt('¿Cuál es su tarifa estimada para desarrollo web Next.js?')}
                className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-[9px] font-mono text-[#D9D9D9]/70 cursor-pointer"
              >
                TARIFAS WEB
              </button>
              <button
                onClick={() => triggerQuickPrompt('Sugiéreme un Agente IA para mi WhatsApp')}
                className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-[9px] font-mono text-[#D9D9D9]/70 cursor-pointer"
              >
                AGENTE WHATSAPP IA
              </button>
              <button
                onClick={() => triggerQuickPrompt('¿Cómo garantizan el posicionamiento de SEO?')}
                className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-[9px] font-mono text-[#D9D9D9]/70 cursor-pointer"
              >
                MÉTODO SEO
              </button>
            </div>

            {/* Send chat form */}
            <form id="chat-input-form" onSubmit={handleSendChatMessage} className="p-3 border-t border-white/5 bg-[#060B16] flex gap-2">
              <input
                type="text"
                required
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Pregunta sobre tarifas, SEO, agentes IA..."
                className="flex-grow px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand-blue"
              />
              <button
                type="submit"
                className="px-3 rounded-xl bg-white text-[#060B16] font-bold text-xs flex items-center justify-center cursor-pointer"
                aria-label="Enviar mensaje a DIGITAL HOME AI"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. DIGITAL QUOTE BUDGET CALCULATOR MODAL (CRO feature) */}
      <AnimatePresence>
        {budgetCalculatorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBudgetCalculatorOpen(false)}
              className="absolute inset-0 bg-brand-bg/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-brand-bg/95 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl z-10 text-left max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setBudgetCalculatorOpen(false)}
                className="absolute top-4 right-4 p-1 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer"
                aria-label="Cerrar cotizador"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-6 h-6 text-brand-green" />
                <h3 className="text-xl font-bold text-white">Cotizador de Ecosistemas Digitales</h3>
              </div>
              <p className="text-xs text-[#D9D9D9]/70 mb-6">
                Construye el ecosistema digital para tu marca. Ajusta variables de complejidad y obtén estimaciones inmediatas de presupuesto, tiempo y ROI.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                
                {/* Left selectors inside modal */}
                <div className="flex flex-col gap-5">
                  <div>
                    <label className="block text-[10px] font-mono text-[#D9D9D9]/50 uppercase mb-2">1. SELECCIONAR MÓDULOS DE INTERÉS</label>
                    <div className="flex flex-col gap-2">
                      {SERVICES_DATA.map(srv => {
                        const isSelected = calculatorServices.includes(srv.id);
                        return (
                          <button
                            key={srv.id}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                if (calculatorServices.length > 1) {
                                  setCalculatorServices(calculatorServices.filter(id => id !== srv.id));
                                }
                              } else {
                                setCalculatorServices([...calculatorServices, srv.id]);
                              }
                            }}
                            className={`w-full text-left p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all duration-200 flex items-center justify-between ${
                              isSelected
                                ? 'bg-white/[0.04] border-white/40 text-white'
                                : 'bg-white/[0.01] border-white/5 text-[#D9D9D9]/70 hover:bg-white/[0.02]'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: srv.color }} />
                              {srv.title}
                            </span>
                            {isSelected ? <CheckCircle2 className="w-4 h-4 text-brand-blue" /> : <div className="w-4 h-4 rounded-full border border-white/15" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Complexity range selector */}
                  <div>
                    <label className="block text-[10px] font-mono text-[#D9D9D9]/50 uppercase mb-2">2. COMPLEJIDAD DEL SISTEMA ({calculatorComplexity === 1 ? 'Mínimo' : calculatorComplexity === 2 ? 'Premium / Completo' : 'Corporativo / Enterprise'})</label>
                    <input
                      type="range"
                      min="1"
                      max="3"
                      value={calculatorComplexity}
                      onChange={(e) => setCalculatorComplexity(parseInt(e.target.value))}
                      className="w-full accent-brand-blue"
                    />
                    <div className="flex justify-between text-[9px] font-mono text-[#D9D9D9]/40 mt-1">
                      <span>BÁSICO</span>
                      <span>PREMIUM</span>
                      <span>ENTERPRISE</span>
                    </div>
                  </div>

                  {/* Speed toggle */}
                  <div>
                    <label className="block text-[10px] font-mono text-[#D9D9D9]/50 uppercase mb-2">3. VELOCIDAD DE ENTREGA REQUERIDA</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCalculatorSpeed('normal')}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${
                          calculatorSpeed === 'normal'
                            ? 'bg-brand-blue/20 border-brand-blue text-white'
                            : 'bg-[#060B16] border-white/5 text-[#D9D9D9]'
                        }`}
                      >
                        Estándar (Continuo)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCalculatorSpeed('express')}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${
                          calculatorSpeed === 'express'
                            ? 'bg-brand-orange/20 border-brand-orange text-white'
                            : 'bg-[#060B16] border-white/5 text-[#D9D9D9]'
                        }`}
                      >
                        Express / Prioritario
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right outcomes inside modal */}
                <div className="flex flex-col justify-between p-6 rounded-2xl bg-white/[0.02] border border-white/5 relative">
                  <div>
                    <span className="text-[10px] font-mono tracking-wider text-[#D9D9D9]/50 block mb-1">PROYECCIÓN DE PROPUESTA</span>
                    <h4 className="text-sm font-bold text-white mb-6">Cotización en Tiempo Real</h4>
                    
                    <div className="flex flex-col gap-4">
                      <div>
                        <span className="text-[10px] font-mono text-[#D9D9D9]/40 uppercase block">Inversión Estimada</span>
                        <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple">
                          ${calculatorResults.total.toLocaleString()} USD
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                        <div>
                          <span className="text-[10px] font-mono text-[#D9D9D9]/40 uppercase block">Tiempo estimado</span>
                          <span className="text-sm font-bold text-white">{calculatorResults.weeks} semanas</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-[#D9D9D9]/40 uppercase block">ROI proyectado</span>
                          <span className="text-sm font-bold text-white">{calculatorResults.roi}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Quote form directly */}
                  <div className="border-t border-white/5 pt-6 mt-6">
                    <button
                      onClick={() => {
                        // Pre-populate contact message and proceed to form
                        setContactForm({
                          ...contactForm,
                          message: `Hola DIGITAL HOME. He cotizado un ecosistema digital compuesto por: ${calculatorServices.join(', ')}. Presupuesto estimado calculado: $${calculatorResults.total} USD, con plazo de ${calculatorResults.weeks} semanas.`
                        });
                        setBudgetCalculatorOpen(false);
                        navigateToPage('contacto');
                        // Scroll to contact form
                        setTimeout(() => {
                          document.getElementById('contacto-section')?.scrollIntoView({ behavior: 'smooth' });
                        }, 500);
                      }}
                      className="w-full py-3.5 rounded-xl text-xs font-bold text-brand-bg bg-white hover:bg-white/95 text-center cursor-pointer shadow-lg"
                    >
                      Solicitar Esta Cotización
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. SINGLE BLOG ARTICLE VIEW MODAL */}
      <AnimatePresence>
        {activeBlogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveBlogModal(null)}
              className="absolute inset-0 bg-brand-bg/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-[#060B16] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl z-10 text-left max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setActiveBlogModal(null)}
                className="absolute top-4 right-4 p-1 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer"
                aria-label="Cerrar artículo"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <span className="px-2 py-0.5 bg-brand-blue/10 text-brand-blue border border-brand-blue/15 rounded-md text-[10px] font-mono font-bold uppercase">
                  {activeBlogModal.category}
                </span>
                <span className="text-[10px] font-mono text-[#D9D9D9]/50 ml-4">{activeBlogModal.date}</span>
                <h2 className="text-xl md:text-2xl font-bold text-white mt-3 leading-snug">{activeBlogModal.title}</h2>
              </div>

              <img src={activeBlogModal.imageUrl} alt={activeBlogModal.title} className="w-full aspect-[16/9] object-cover rounded-2xl border border-white/10 mb-6" referrerPolicy="no-referrer" />

              <div className="text-xs md:text-sm text-[#D9D9D9]/85 leading-relaxed space-y-4">
                <p>{activeBlogModal.content}</p>
                <p>Nuestra agencia está plenamente capacitada para implementar cada uno de estos hallazgos y metodologías técnicas en tu marca o negocio. Si deseas profundizar en el tema o iniciar tu propia transformación corporativa, ponte en contacto directo.</p>
              </div>

              <div className="border-t border-white/5 pt-6 mt-8 flex justify-end">
                <button
                  onClick={() => {
                    setActiveBlogModal(null);
                    handleAgendarAsesoria();
                  }}
                  className="px-6 py-3 rounded-xl text-xs font-bold text-brand-bg bg-white hover:bg-white/95 cursor-pointer flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Agendar Asesoría</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 9. EMBEDDED PROJECT / DOCUMENT VIEWER MODAL */}
      <AnimatePresence>
        {activeProjectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveProjectModal(null)}
              className="absolute inset-0 bg-brand-bg/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-6xl bg-[#060B16] border border-white/15 rounded-3xl p-3 sm:p-5 md:p-6 shadow-2xl z-10 text-left flex flex-col h-[92vh] max-h-[920px] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/10 shrink-0">
                <div className="flex flex-col gap-1 pr-2 overflow-hidden">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 bg-brand-blue/10 text-brand-blue border border-brand-blue/20 rounded-md text-[10px] font-mono font-bold uppercase">
                      CLIENTE: {activeProjectModal.client}
                    </span>
                    <span className="text-[10px] font-mono text-[#D9D9D9]/50 uppercase">
                      {activeProjectModal.category}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-xl md:text-2xl font-bold text-white truncate">
                    {activeProjectModal.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {activeProjectModal.projectUrl && (
                    <a
                      href={activeProjectModal.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-colors flex items-center gap-1.5"
                      title="Abrir en pestaña externa"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Pestaña externa</span>
                    </a>
                  )}
                  <button
                    onClick={() => setActiveProjectModal(null)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                    aria-label="Cerrar visor"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Simulated Browser Address Bar & Mode Tabs */}
              <div className="mt-3 px-3 py-2 bg-[#02050D] border border-white/10 rounded-2xl flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs">
                {/* Dots & URL Bar */}
                <div className="flex items-center gap-2 flex-grow overflow-hidden">
                  <div className="hidden sm:flex items-center gap-1.5 mr-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block"></span>
                  </div>
                  <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg flex items-center gap-2 text-[#D9D9D9]/70 font-mono text-[11px] truncate flex-grow max-w-md">
                    <Lock className="w-3 h-3 text-green-400 shrink-0" />
                    <span className="truncate">{activeProjectModal.projectUrl || activeProjectModal.title}</span>
                  </div>
                </div>

                {/* Switcher Controls */}
                <div className="flex items-center gap-1 shrink-0 bg-white/5 p-1 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setModalViewTab('interactive')}
                    className={`px-3 py-1 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      modalViewTab === 'interactive'
                        ? 'bg-brand-blue text-white shadow-md font-bold'
                        : 'text-[#D9D9D9]/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Sitio / Doc Interactivo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalViewTab('hd')}
                    className={`px-3 py-1 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      modalViewTab === 'hd'
                        ? 'bg-brand-blue text-white shadow-md font-bold'
                        : 'text-[#D9D9D9]/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Captura HD</span>
                  </button>
                </div>
              </div>

              {/* View Content Area */}
              <div className="flex-grow my-3 rounded-2xl overflow-hidden border border-white/10 bg-slate-950 relative flex flex-col">
                {modalViewTab === 'interactive' && activeProjectModal.projectUrl ? (
                  activeProjectModal.projectUrl.includes('drive.google.com') ? (
                    <div className="w-full h-full relative flex flex-col">
                      <iframe
                        src={getEmbedUrl(activeProjectModal.projectUrl)}
                        title={activeProjectModal.title}
                        className="w-full h-full border-0 bg-white"
                        allow="autoplay; encrypted-media; picture-in-picture; clipboard-write"
                      />
                    </div>
                  ) : (
                    /* Live Website Interactive Card (Solves ERR_BLOCKED_BY_RESPONSE) */
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#080E1C] to-[#03060E] relative overflow-y-auto">
                      {/* Background Screenshot with Overlay */}
                      <div className="absolute inset-0 opacity-20 filter blur-sm pointer-events-none">
                        <img
                          src={activeProjectModal.imageUrl}
                          alt={activeProjectModal.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="relative z-10 max-w-2xl w-full text-center flex flex-col items-center gap-5 p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-2xl">
                        {/* Live Status Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span>SITIO WEB EN PRODUCCIÓN ACTIVA</span>
                        </div>

                        {/* Title & Domain */}
                        <div>
                          <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                            {activeProjectModal.title}
                          </h3>
                          <p className="text-xs font-mono text-brand-blue flex items-center justify-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{activeProjectModal.projectUrl}</span>
                          </p>
                        </div>

                        {/* Mockup Preview Card */}
                        <div className="w-full aspect-[16/9] max-h-56 rounded-2xl overflow-hidden border border-white/15 shadow-xl group relative">
                          <img
                            src={activeProjectModal.imageUrl}
                            alt={activeProjectModal.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                            <span className="text-xs font-semibold text-white/90">Vista previa interactiva HD</span>
                          </div>
                        </div>

                        {/* Explanation Notice regarding X-Frame-Options */}
                        <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-[#D9D9D9]/80 text-left flex items-start gap-2.5">
                          <Info className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                          <p className="leading-relaxed">
                            Por políticas de seguridad del servidor del cliente (<strong>X-Frame-Options / CORS</strong>), las páginas web activas no admiten visualización incrustada dentro de marcos externos. Puedes explorar el sitio web directamente en vivo o ver la captura en alta resolución.
                          </p>
                        </div>

                        {/* CTA Action Buttons */}
                        <div className="flex flex-wrap items-center justify-center gap-3 w-full pt-2">
                          <a
                            href={activeProjectModal.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white font-bold text-xs md:text-sm transition-all shadow-lg shadow-brand-blue/25 flex items-center gap-2 cursor-pointer"
                          >
                            <Globe className="w-4 h-4" />
                            <span>Abrir {activeProjectModal.client} en Vivo</span>
                            <ExternalLink className="w-4 h-4" />
                          </a>

                          <button
                            type="button"
                            onClick={() => setModalViewTab('hd')}
                            className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer border border-white/15"
                          >
                            <ImageIcon className="w-4 h-4" />
                            <span>Ver Captura HD</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 overflow-auto bg-slate-900/60">
                    <img
                      src={activeProjectModal.imageUrl}
                      alt={activeProjectModal.title}
                      className="max-w-full max-h-[72vh] object-contain rounded-xl shadow-2xl border border-white/10"
                      referrerPolicy="no-referrer"
                    />
                    <span className="mt-3 text-xs font-mono text-[#D9D9D9]/60">Captura de pantalla HD oficial - {activeProjectModal.client}</span>
                  </div>
                )}
              </div>

              {/* Modal Footer Details */}
              <div className="pt-3 border-t border-white/10 shrink-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                <div className="flex-grow">
                  <p className="text-[#D9D9D9]/80 line-clamp-2">{activeProjectModal.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="px-3 py-1 rounded-lg bg-brand-blue/10 border border-brand-blue/20 text-brand-blue font-semibold flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{activeProjectModal.result}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 9. GENERAL APPOINTMENT BOOKING DIALOG MODAL */}
      <AnimatePresence>
        {bookingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBookingModalOpen(false)}
              className="absolute inset-0 bg-brand-bg/85 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-[#060B16] border border-white/10 rounded-3xl p-6 shadow-2xl z-10 text-left overflow-hidden"
            >
              <button
                onClick={() => setBookingModalOpen(false)}
                className="absolute top-4 right-4 p-1 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer"
                aria-label="Cerrar calendario"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-brand-blue" />
                <h3 className="text-lg font-bold text-white">Agendar Asesoría</h3>
              </div>
              <p className="text-xs text-[#D9D9D9]/70 mb-4">
                Programa tu videollamada de descubrimiento técnico gratuita de 15 minutos en Google Meet.
              </p>

              {/* Direct Google Calendar Hub shortcut */}
              <div className="mb-4 p-3 rounded-2xl bg-brand-blue/10 border border-brand-blue/30 flex items-center justify-between gap-3">
                <div className="text-left">
                  <span className="text-[10px] font-mono text-brand-blue uppercase font-bold block">Sincronización en Vivo</span>
                  <span className="text-xs text-white">¿Deseas gestionar citas directamente con tu cuenta de Google?</span>
                </div>
                <button
                  type="button"
                  onClick={handleAgendarAsesoria}
                  className="px-3 py-1.5 rounded-xl bg-brand-blue hover:bg-brand-blue/80 text-white font-bold text-[10px] whitespace-nowrap cursor-pointer transition-all shadow-md flex items-center gap-1.5 shrink-0"
                >
                  <Calendar className="w-3 h-3" />
                  <span>Agendar Asesoría</span>
                </button>
              </div>

              <form onSubmit={handleBookConsultation} className="flex flex-col gap-4">
                {/* Service selector */}
                <div>
                  <label className="block text-[10px] font-mono text-[#D9D9D9]/50 uppercase mb-1.5">Ecosistema de Interés</label>
                  <select
                    value={schedulerService}
                    onChange={(e) => setSchedulerService(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none"
                  >
                    <option value="branding" className="text-[#010715] bg-white">Branding de Marca</option>
                    <option value="web" className="text-[#010715] bg-white">Páginas Web Corporativas</option>
                    <option value="ecommerce" className="text-[#010715] bg-white">Tiendas Online</option>
                    <option value="ai" className="text-[#010715] bg-white">Agentes IA</option>
                    <option value="software" className="text-[#010715] bg-white">Software a Medida</option>
                    <option value="merch" className="text-[#010715] bg-white">Merchandising</option>
                  </select>
                </div>

                {/* Date/Time selectors */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-[#D9D9D9]/50 uppercase mb-1.5">Seleccionar Fecha</label>
                    <select
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none"
                    >
                      <option value="2026-07-20" className="text-[#010715] bg-white">Lunes, 20 Jul</option>
                      <option value="2026-07-21" className="text-[#010715] bg-white">Martes, 21 Jul</option>
                      <option value="2026-07-22" className="text-[#010715] bg-white">Miércoles, 22 Jul</option>
                      <option value="2026-07-23" className="text-[#010715] bg-white">Jueves, 23 Jul</option>
                      <option value="2026-07-24" className="text-[#010715] bg-white">Viernes, 24 Jul</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-[#D9D9D9]/50 uppercase mb-1.5">Seleccionar Hora</label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none"
                    >
                      <option value="09:00 AM" className="text-[#010715] bg-white">09:00 AM (EST)</option>
                      <option value="10:00 AM" className="text-[#010715] bg-white">10:00 AM (EST)</option>
                      <option value="11:30 AM" className="text-[#010715] bg-white">11:30 AM (EST)</option>
                      <option value="02:00 PM" className="text-[#010715] bg-white">02:00 PM (EST)</option>
                      <option value="03:30 PM" className="text-[#010715] bg-white">03:30 PM (EST)</option>
                    </select>
                  </div>
                </div>

                {/* Form fields */}
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    placeholder="Tu nombre completo *"
                    required
                    value={schedulerForm.name}
                    onChange={(e) => setSchedulerForm({ ...schedulerForm, name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white"
                  />
                  <input
                    type="email"
                    placeholder="Tu correo electrónico *"
                    required
                    value={schedulerForm.email}
                    onChange={(e) => setSchedulerForm({ ...schedulerForm, email: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Empresa (Opcional)"
                    value={schedulerForm.company}
                    onChange={(e) => setSchedulerForm({ ...schedulerForm, company: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white"
                  />
                </div>

                {schedulerStatus.message && (
                  <div className={`p-3.5 rounded-xl text-xs flex flex-col gap-2 font-medium ${schedulerStatus.success ? 'bg-brand-green/10 text-brand-green border border-brand-green/30' : 'bg-brand-red/10 text-brand-red border border-brand-red/30'}`}>
                    <span>{schedulerStatus.message}</span>
                    {schedulerStatus.googleCalendarUrl && (
                      <a
                        href={schedulerStatus.googleCalendarUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-green text-brand-bg font-bold text-[11px] self-start hover:opacity-90 transition-opacity"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Añadir a Google Calendar</span>
                      </a>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={schedulerStatus.loading}
                  className="w-full mt-2 py-3.5 rounded-xl text-xs font-bold bg-gradient-to-r from-brand-blue to-brand-purple text-white cursor-pointer shadow-lg"
                >
                  Agendar Asesoría
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. Google Suite Modal: Analytics, Tag Manager & Search Console */}
      <GoogleToolsModal
        isOpen={googleToolsOpen}
        onClose={() => setGoogleToolsOpen(false)}
      />

    </div>
  );
}

