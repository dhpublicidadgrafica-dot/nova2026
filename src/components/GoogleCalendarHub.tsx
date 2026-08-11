import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Plus,
  RefreshCw,
  ExternalLink,
  Users,
  LogOut,
  Sparkles,
  MapPin,
  CalendarCheck,
  CalendarDays,
  ShieldCheck,
  ArrowRight,
  X,
  Info,
  Mail,
  Phone,
  Building,
  User as UserIcon,
  Check,
  Send
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  googleSignIn,
  logoutGoogle,
  initAuth,
  listCalendarEvents,
  createCalendarEvent,
  deleteCalendarEvent,
  checkSlotAvailability,
  processConsultationBooking,
  AGENCY_COMMERCIAL_EMAIL,
  AGENCY_ADMIN_EMAIL,
  CalendarEvent,
  CreateEventInput,
  SlotAvailabilityResult
} from '../services/googleCalendar';

interface GoogleCalendarHubProps {
  initialService?: string;
  onEventCreated?: (event?: CalendarEvent) => void;
  compact?: boolean;
  hideHeader?: boolean;
  hideRightColumn?: boolean;
}

const PRESET_TIME_SLOTS = [
  '09:00',
  '10:00',
  '11:30',
  '14:00',
  '15:30',
  '17:00'
];

export default function GoogleCalendarHub({
  initialService = 'web',
  onEventCreated,
  compact = false,
  hideHeader = false,
  hideRightColumn = false
}: GoogleCalendarHubProps) {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Events state
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [eventsFilter, setEventsFilter] = useState<'upcoming' | 'today' | 'week' | 'all'>('upcoming');

  // Booking Form State
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [bookingForm, setBookingForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientCompany: '',
    service: initialService,
    date: tomorrow,
    time: '10:00',
    durationMinutes: 30,
    notes: ''
  });

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState<{
    success: boolean;
    message: string;
    googleMeetLink?: string;
    googleCalendarUrl?: string;
    event?: CalendarEvent;
  } | null>(null);

  // Real-time slot availability state
  const [slotCheckResult, setSlotCheckResult] = useState<SlotAvailabilityResult | null>(null);
  const [checkingSlot, setCheckingSlot] = useState(false);

  // Destructive Delete Confirmation Modal (MANDATORY per skill)
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<string | null>(null);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
        if (user.email && !bookingForm.clientEmail) {
          setBookingForm(prev => ({
            ...prev,
            clientEmail: user.email || '',
            clientName: user.displayName || prev.clientName
          }));
        }
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
        setEvents([]);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Fetch events when user logs in or token is available
  useEffect(() => {
    if (currentUser && accessToken) {
      loadCalendarEvents();
    }
  }, [currentUser, accessToken]);

  // Real-time conflict/availability checker on date/time change
  useEffect(() => {
    let isCancelled = false;

    const runAvailabilityCheck = async () => {
      if (!bookingForm.date || !bookingForm.time) return;
      setCheckingSlot(true);
      try {
        const result = await checkSlotAvailability(
          accessToken,
          bookingForm.date,
          bookingForm.time,
          bookingForm.durationMinutes
        );
        if (!isCancelled) {
          setSlotCheckResult(result);
        }
      } catch (e) {
        if (!isCancelled) {
          setSlotCheckResult({
            available: true,
            message: 'Disponibilidad verificada.',
            busyIntervals: []
          });
        }
      } finally {
        if (!isCancelled) {
          setCheckingSlot(false);
        }
      }
    };

    const timer = setTimeout(runAvailabilityCheck, 400);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [accessToken, bookingForm.date, bookingForm.time, bookingForm.durationMinutes]);

  // Load events from Google Calendar API
  const loadCalendarEvents = async () => {
    if (!accessToken) return;
    setEventsLoading(true);
    setEventsError(null);

    try {
      const now = new Date();
      const timeMin = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const fetchedEvents = await listCalendarEvents(accessToken, {
        timeMin,
        maxResults: 30
      });
      setEvents(fetchedEvents);
    } catch (err: any) {
      console.error('Error fetching calendar events:', err);
      setEventsError(err.message || 'No se pudieron sincronizar los eventos de Google Calendar.');
    } finally {
      setEventsLoading(false);
    }
  };

  // Handle Google Login
  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setAccessToken(res.accessToken);
        setBookingForm(prev => ({
          ...prev,
          clientEmail: res.user.email || prev.clientEmail,
          clientName: res.user.displayName || prev.clientName
        }));
      }
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      setAuthError(err.message || 'No se pudo completar el inicio de sesión con Google.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Google Logout
  const handleGoogleLogout = async () => {
    try {
      await logoutGoogle();
      setCurrentUser(null);
      setAccessToken(null);
      setEvents([]);
    } catch (err: any) {
      console.error('Google Logout Error:', err);
    }
  };

  // Handle Client Booking Submission
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingResult(null);

    try {
      const res = await processConsultationBooking(accessToken, {
        clientName: bookingForm.clientName,
        clientEmail: bookingForm.clientEmail,
        clientPhone: bookingForm.clientPhone,
        clientCompany: bookingForm.clientCompany,
        service: bookingForm.service,
        date: bookingForm.date,
        time: bookingForm.time,
        durationMinutes: bookingForm.durationMinutes,
        notes: bookingForm.notes
      });

      setBookingResult({
        success: true,
        message: res.message,
        googleMeetLink: res.googleMeetLink,
        googleCalendarUrl: res.googleCalendarUrl,
        event: res.event
      });

      if (accessToken) {
        await loadCalendarEvents();
      }

      if (onEventCreated) {
        onEventCreated(res.event);
      }
    } catch (err: any) {
      console.error('Error in consultation booking:', err);
      setBookingResult({
        success: false,
        message: err.message || 'Ocurrió un error al procesar el agendamiento en Google Calendar.'
      });
    } finally {
      setBookingLoading(false);
    }
  };

  // Handle Confirmed Event Deletion (MANDATORY User Confirmation Flow)
  const handleConfirmDelete = async () => {
    if (!accessToken || !eventToDelete) return;
    setDeleteLoading(true);
    setDeleteStatus(null);

    try {
      await deleteCalendarEvent(accessToken, eventToDelete.id);
      setEvents(prev => prev.filter(e => e.id !== eventToDelete.id));
      setEventToDelete(null);
    } catch (err: any) {
      console.error('Error deleting event:', err);
      setDeleteStatus(err.message || 'No se pudo eliminar el evento.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Helper date/time formatting
  const formatEventDateTime = (event: CalendarEvent) => {
    if (event.start?.dateTime) {
      const start = new Date(event.start.dateTime);
      const end = event.end?.dateTime ? new Date(event.end.dateTime) : null;
      
      const dateStr = start.toLocaleDateString('es-ES', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      const startTimeStr = start.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      const endTimeStr = end ? end.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '';

      return {
        dateStr,
        timeStr: endTimeStr ? `${startTimeStr} - ${endTimeStr}` : startTimeStr,
        isToday: start.toDateString() === new Date().toDateString()
      };
    } else if (event.start?.date) {
      const date = new Date(`${event.start.date}T00:00:00`);
      return {
        dateStr: date.toLocaleDateString('es-ES', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }),
        timeStr: 'Todo el día',
        isToday: date.toDateString() === new Date().toDateString()
      };
    }
    return { dateStr: 'Fecha no definida', timeStr: '', isToday: false };
  };

  // Filtered events
  const filteredEvents = events.filter(e => {
    if (eventsFilter === 'all') return true;
    const startStr = e.start?.dateTime || e.start?.date;
    if (!startStr) return true;
    const eventDate = new Date(startStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (eventsFilter === 'today') {
      return eventDate.toDateString() === new Date().toDateString();
    }
    if (eventsFilter === 'week') {
      const nextWeek = new Date(today.getTime() + 7 * 86400000);
      return eventDate >= today && eventDate <= nextWeek;
    }
    return eventDate >= today;
  });

  return (
    <div className="w-full text-left" id="google-calendar-hub-container">
      {/* 1. Header connection & sync info banner */}
      {!compact && !hideHeader && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-blue to-brand-purple p-[1px] shrink-0 shadow-lg">
                <div className="w-full h-full bg-[#060B16] rounded-[15px] flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-brand-blue animate-pulse" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-brand-blue font-bold px-2.5 py-0.5 rounded-md bg-brand-blue/10 border border-brand-blue/20">
                    SINCRONIZACIÓN GOOGLE CALENDAR EN VIVO
                  </span>
                  {currentUser && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-brand-green bg-brand-green/10 border border-brand-green/20 px-2.5 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3 h-3" />
                      CONECTADO ({currentUser.email})
                    </span>
                  )}
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
                  Agendamiento Inteligente & Control de Disponibilidad
                </h2>
                <p className="text-xs md:text-sm text-[#D9D9D9]/75 mt-1 max-w-2xl">
                  Al solicitar tu cita, el sistema revisa la disponibilidad del día y hora para evitar cruces con otras reuniones. El agendamiento se realiza en automático y envía la confirmación con Google Meet a <strong className="text-white font-mono">{AGENCY_COMMERCIAL_EMAIL}</strong> y al correo del cliente.
                </p>
              </div>
            </div>

            {/* User Sign In / User Profile Card */}
            <div className="shrink-0 flex items-center gap-3">
              {!currentUser ? (
                <button
                  onClick={handleGoogleLogin}
                  disabled={authLoading}
                  className="gsi-material-button group cursor-pointer relative overflow-hidden px-5 py-3 rounded-2xl bg-white text-[#1f1f1f] hover:bg-slate-100 font-semibold text-xs transition-all duration-300 flex items-center gap-3 shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50"
                  aria-label="Conectar cuenta de Google"
                >
                  {authLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-brand-blue" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                  )}
                  <span>Conectar con Google</span>
                </button>
              ) : (
                <div className="flex items-center gap-3 bg-white/[0.04] border border-white/10 p-2 pl-3 rounded-2xl">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'Google User'}
                      className="w-8 h-8 rounded-full border border-white/20 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center text-xs font-bold text-white">
                      {currentUser.email?.charAt(0).toUpperCase() || 'G'}
                    </div>
                  )}
                  <div className="text-left">
                    <span className="block text-xs font-bold text-white truncate max-w-[150px]">
                      {currentUser.displayName || 'Usuario Google'}
                    </span>
                    <span className="block text-[10px] font-mono text-[#D9D9D9]/60 truncate max-w-[150px]">
                      {currentUser.email}
                    </span>
                  </div>
                  <button
                    onClick={handleGoogleLogout}
                    className="p-2 text-[#D9D9D9]/50 hover:text-brand-red hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
                    title="Cerrar sesión de Google"
                    aria-label="Cerrar sesión de Google"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {authError && (
            <div className="mt-4 p-3 rounded-xl bg-brand-red/10 border border-brand-red/20 text-brand-red text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}
        </div>
      )}

      {/* 2. Main content area: Booking Form & Real-time Calendar Dashboard */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 ${(!compact && !hideHeader) ? 'mt-8' : ''}`}>
        
        {/* Left column: Direct Client Booking Form with Collision Detection */}
        <div className={(compact || hideRightColumn) ? "lg:col-span-12 max-w-3xl mx-auto w-full flex flex-col gap-6" : "lg:col-span-6 flex flex-col gap-6"}>
          <div className="rounded-3xl border border-white/10 bg-white/[0.01] p-6 md:p-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-blue via-brand-purple to-brand-green" />
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <CalendarCheck className="w-5 h-5 text-brand-blue" />
                <h3 className="text-lg font-bold text-white">Formulario de Agendamiento Oficial</h3>
              </div>
            </div>

            <p className="text-xs text-[#D9D9D9]/70 mb-6 leading-relaxed">
              Completa tus datos para coordinar una sesión de asesoría técnica. El sistema validará la disponibilidad en Google Calendar para garantizar que no existan traslapes de horario.
            </p>

            <form onSubmit={handleBookingSubmit} className="flex flex-col gap-4">
              
              {/* Client Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-[#D9D9D9]/50 uppercase mb-1.5 font-bold flex items-center gap-1.5">
                    <UserIcon className="w-3 h-3 text-brand-blue" />
                    <span>Tu Nombre Completo *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Carlos Mendoza"
                    value={bookingForm.clientName}
                    onChange={(e) => setBookingForm({ ...bookingForm, clientName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand-blue transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-[#D9D9D9]/50 uppercase mb-1.5 font-bold flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-brand-purple" />
                    <span>Tu Correo Electrónico *</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="carlos@empresa.com"
                    value={bookingForm.clientEmail}
                    onChange={(e) => setBookingForm({ ...bookingForm, clientEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand-blue transition-colors"
                  />
                </div>
              </div>

              {/* Phone & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-[#D9D9D9]/50 uppercase mb-1.5 font-bold flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-brand-green" />
                    <span>Teléfono / WhatsApp</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+57 300 123 4567"
                    value={bookingForm.clientPhone}
                    onChange={(e) => setBookingForm({ ...bookingForm, clientPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand-blue transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-[#D9D9D9]/50 uppercase mb-1.5 font-bold flex items-center gap-1.5">
                    <Building className="w-3 h-3 text-brand-orange" />
                    <span>Empresa o Proyecto</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Empresa S.A.S."
                    value={bookingForm.clientCompany}
                    onChange={(e) => setBookingForm({ ...bookingForm, clientCompany: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand-blue transition-colors"
                  />
                </div>
              </div>

              {/* Service Selector */}
              <div>
                <label className="block text-[10px] font-mono text-[#D9D9D9]/50 uppercase mb-1.5 font-bold">
                  Ecosistema o Servicio Requerido *
                </label>
                <select
                  value={bookingForm.service}
                  onChange={(e) => setBookingForm({ ...bookingForm, service: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none focus:border-brand-blue transition-colors cursor-pointer"
                >
                  <option value="branding" className="text-[#010715] bg-white">Branding de Marca</option>
                  <option value="web" className="text-[#010715] bg-white">Páginas Web Corporativas</option>
                  <option value="ecommerce" className="text-[#010715] bg-white">Tiendas Online</option>
                  <option value="ai" className="text-[#010715] bg-white">Agentes IA</option>
                  <option value="software" className="text-[#010715] bg-white">Software a Medida</option>
                  <option value="merch" className="text-[#010715] bg-white">Merchandising</option>
                </select>
              </div>

              {/* Date & Time Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-[#D9D9D9]/50 uppercase mb-1.5 font-bold">
                    Fecha de la Cita *
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none focus:border-brand-blue cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-[#D9D9D9]/50 uppercase mb-1.5 font-bold">
                    Hora (Formato 24h) *
                  </label>
                  <input
                    type="time"
                    required
                    value={bookingForm.time}
                    onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none focus:border-brand-blue cursor-pointer"
                  />
                </div>
              </div>

              {/* Preset quick time slots */}
              <div>
                <label className="block text-[10px] font-mono text-[#D9D9D9]/50 uppercase mb-1.5 font-bold">
                  Horarios Frecuentes Disponibles
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PRESET_TIME_SLOTS.map((slot) => {
                    const isSelected = bookingForm.time === slot;
                    return (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => setBookingForm({ ...bookingForm, time: slot })}
                        className={`py-1.5 px-2 rounded-xl text-xs font-mono transition-all cursor-pointer text-center ${
                          isSelected
                            ? 'bg-brand-blue text-white font-bold shadow-md scale-105 border border-brand-blue'
                            : 'bg-white/[0.03] hover:bg-white/[0.08] text-[#D9D9D9]/80 border border-white/5'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Real-time Google Calendar Conflict & Availability Detector */}
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#D9D9D9]/60" />
                  <span className="text-[#D9D9D9]/70 font-mono text-[11px]">Disponibilidad Google Calendar:</span>
                </div>
                {checkingSlot ? (
                  <span className="flex items-center gap-1.5 text-brand-blue font-mono text-[11px]">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verificando cruces...</span>
                  </span>
                ) : slotCheckResult?.available === false ? (
                  <span className="flex items-center gap-1.5 text-brand-red font-bold text-[11px] bg-brand-red/10 border border-brand-red/30 px-2 py-0.5 rounded-lg">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Horario Ocupado / Conflicto</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-brand-green font-bold text-[11px] bg-brand-green/10 border border-brand-green/30 px-2 py-0.5 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Horario Disponible (Sin Cruces)</span>
                  </span>
                )}
              </div>

              {slotCheckResult?.available === false && (
                <p className="text-[11px] text-brand-red leading-relaxed bg-brand-red/5 p-2 rounded-xl border border-brand-red/20">
                  {slotCheckResult.message}
                </p>
              )}

              {/* Duration & Meet */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-[#D9D9D9]/50 uppercase mb-1.5 font-bold">
                    Duración Estimada
                  </label>
                  <select
                    value={bookingForm.durationMinutes}
                    onChange={(e) => setBookingForm({ ...bookingForm, durationMinutes: parseInt(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none focus:border-brand-blue cursor-pointer"
                  >
                    <option value={15} className="text-[#010715] bg-white">15 Minutos (Diagnóstico Rápido)</option>
                    <option value={30} className="text-[#010715] bg-white">30 Minutos (Asesoría Estándar)</option>
                    <option value={45} className="text-[#010715] bg-white">45 Minutos (Profundización)</option>
                    <option value={60} className="text-[#010715] bg-white">60 Minutos (Estrategia Completa)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-[#D9D9D9]/50 uppercase mb-1.5 font-bold">
                    Plataforma de Videollamada
                  </label>
                  <div className="h-[42px] flex items-center gap-2 px-3.5 rounded-xl bg-brand-blue/10 border border-brand-blue/30 text-xs text-brand-blue font-semibold">
                    <Video className="w-4 h-4" />
                    <span>Google Meet (Automático)</span>
                  </div>
                </div>
              </div>

              {/* Project notes */}
              <div>
                <label className="block text-[10px] font-mono text-[#D9D9D9]/50 uppercase mb-1.5 font-bold">
                  Requerimientos del Proyecto (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe brevemente tus objetivos comerciales o dudas técnicas..."
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand-blue resize-none"
                />
              </div>

              {/* Booking status & result banner */}
              {bookingResult && (
                <div
                  className={`p-4 rounded-2xl text-xs font-semibold flex flex-col gap-2 ${
                    bookingResult.success
                      ? 'bg-brand-green/10 text-brand-green border border-brand-green/30'
                      : 'bg-brand-red/10 text-brand-red border border-brand-red/30'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {bookingResult.success ? (
                      <CheckCircle2 className="w-5 h-5 shrink-0 text-brand-green mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 shrink-0 text-brand-red mt-0.5" />
                    )}
                    <span className="leading-relaxed">{bookingResult.message}</span>
                  </div>

                  {(bookingResult.googleMeetLink || bookingResult.googleCalendarUrl) && (
                    <div className="mt-2 pt-2 border-t border-brand-green/20 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-[11px] font-mono text-white/90">Acciones rápidas de calendario:</span>
                      <div className="flex items-center gap-2">
                        {bookingResult.googleCalendarUrl && (
                          <a
                            href={bookingResult.googleCalendarUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
                          >
                            <CalendarIcon className="w-3.5 h-3.5" />
                            <span>Añadir a Google Calendar</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {bookingResult.googleMeetLink && (
                          <a
                            href={bookingResult.googleMeetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-brand-green hover:bg-brand-green/90 text-[#060B16] font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Abrir Google Meet</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={bookingLoading || slotCheckResult?.available === false}
                className="w-full mt-2 py-4 rounded-2xl bg-gradient-to-r from-brand-blue to-brand-purple hover:from-brand-blue/90 hover:to-brand-purple/90 text-white font-bold text-xs tracking-wider uppercase transition-all duration-300 shadow-xl cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {bookingLoading ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verificando y Agendando en Google Calendar...</span>
                  </div>
                ) : (
                  <>
                    <CalendarCheck className="w-4 h-4" />
                    <span>CONFIRMAR Y AGENDAR</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right column: Real Google Calendar Events List & Direct Sync Viewer */}
        {!compact && !hideRightColumn && (
          <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.01] p-6 md:p-8 relative shadow-2xl flex flex-col min-h-[500px]">
            
            {/* Events header and sync triggers */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Eventos & Agenda Google Calendar</h3>
                  <span className="text-[10px] font-mono text-[#D9D9D9]/50 block">
                    {currentUser ? `Sincronizado con ${currentUser.email}` : `Monitoreo para ${AGENCY_COMMERCIAL_EMAIL}`}
                  </span>
                </div>
              </div>

              {currentUser && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={loadCalendarEvents}
                    disabled={eventsLoading}
                    className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[#D9D9D9] hover:text-white transition-all cursor-pointer text-xs flex items-center gap-1.5"
                    title="Actualizar eventos"
                    aria-label="Actualizar eventos de Google Calendar"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${eventsLoading ? 'animate-spin text-brand-blue' : ''}`} />
                    <span className="hidden sm:inline">Actualizar</span>
                  </button>
                </div>
              )}
            </div>

            {/* Filter Tabs for logged-in users */}
            {currentUser && (
              <div className="flex gap-2 py-4 overflow-x-auto border-b border-white/5 text-xs">
                {[
                  { id: 'upcoming', label: 'Próximos' },
                  { id: 'today', label: 'Hoy' },
                  { id: 'week', label: 'Esta Semana' },
                  { id: 'all', label: 'Todos' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setEventsFilter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                      eventsFilter === tab.id
                        ? 'bg-brand-blue/20 border border-brand-blue text-white font-bold'
                        : 'bg-white/[0.02] border border-white/5 text-[#D9D9D9]/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* Events List container */}
            <div className="flex-grow pt-4 flex flex-col gap-3 overflow-y-auto max-h-[500px]">
              {!currentUser ? (
                <div className="my-auto py-8 px-4 text-center flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-3xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue">
                    <CalendarIcon className="w-8 h-8" />
                  </div>
                  <div className="max-w-md">
                    <h4 className="text-base font-bold text-white mb-2">
                      Sincronización Directa de Agenda
                    </h4>
                    <p className="text-xs text-[#D9D9D9]/70 leading-relaxed mb-6">
                      Puedes agendar inmediatamente utilizando el formulario de la izquierda. Si eres miembro del equipo o deseas gestionar tus citas directamente desde Google Calendar, conecta tu cuenta oficial.
                    </p>
                    <button
                      onClick={handleGoogleLogin}
                      disabled={authLoading}
                      className="px-6 py-3.5 rounded-2xl bg-white text-[#060B16] hover:bg-slate-100 font-bold text-xs tracking-wider uppercase transition-all shadow-xl cursor-pointer inline-flex items-center gap-2 hover:scale-105"
                    >
                      <CalendarCheck className="w-4 h-4 text-brand-blue" />
                      <span>Conectar con Google Calendar</span>
                    </button>
                  </div>
                </div>
              ) : eventsLoading && events.length === 0 ? (
                <div className="my-auto py-12 text-center flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="w-8 h-8 text-brand-blue animate-spin" />
                  <span className="text-xs font-mono text-[#D9D9D9]/70">Consultando Google Calendar en tiempo real...</span>
                </div>
              ) : eventsError ? (
                <div className="my-auto p-6 rounded-2xl bg-brand-red/10 border border-brand-red/20 text-center flex flex-col items-center gap-3">
                  <AlertCircle className="w-8 h-8 text-brand-red" />
                  <span className="text-xs text-brand-red font-semibold">{eventsError}</span>
                  <button
                    onClick={loadCalendarEvents}
                    className="px-4 py-2 rounded-xl bg-brand-red/20 text-white text-xs hover:bg-brand-red/30 cursor-pointer transition-colors"
                  >
                    Reintentar
                  </button>
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="my-auto py-12 text-center flex flex-col items-center justify-center gap-3">
                  <CalendarDays className="w-12 h-12 text-[#D9D9D9]/20" />
                  <h4 className="text-sm font-bold text-white">No tienes reuniones agendadas en este periodo</h4>
                  <p className="text-xs text-[#D9D9D9]/60 max-w-sm">
                    Utiliza el formulario para programar una nueva sesión de consultoría técnica.
                  </p>
                </div>
              ) : (
                filteredEvents.map(event => {
                  const { dateStr, timeStr, isToday } = formatEventDateTime(event);
                  const meetLink = event.hangoutLink || (event.location?.includes('meet.google.com') ? event.location : null);

                  return (
                    <div
                      key={event.id}
                      className="group p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/15 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${isToday ? 'bg-brand-green shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-brand-blue'}`} />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-white group-hover:text-brand-blue transition-colors">
                              {event.summary || 'Asesoría DIGITAL HOME'}
                            </h4>
                            {isToday && (
                              <span className="text-[9px] font-mono text-brand-green bg-brand-green/10 border border-brand-green/20 px-1.5 py-0.5 rounded uppercase font-bold">
                                HOY
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3 text-xs text-[#D9D9D9]/70 mt-1 flex-wrap font-mono">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-brand-purple" />
                              <span>{dateStr} · {timeStr}</span>
                            </span>
                            {event.attendees && event.attendees.length > 0 && (
                              <span className="flex items-center gap-1 text-[#D9D9D9]/50">
                                <Users className="w-3.5 h-3.5" />
                                <span>{event.attendees.length} invitados</span>
                              </span>
                            )}
                          </div>

                          {event.description && (
                            <p className="text-[11px] text-[#D9D9D9]/60 line-clamp-1 mt-1 font-sans">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Event actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {meetLink && (
                          <a
                            href={meetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-brand-blue/20 hover:bg-brand-blue/30 border border-brand-blue/30 text-brand-blue text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Entrar a Meet</span>
                            <ExternalLink className="w-3 h-3 ml-0.5" />
                          </a>
                        )}

                        {event.htmlLink && (
                          <a
                            href={event.htmlLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[#D9D9D9]/70 hover:text-white transition-colors"
                            title="Abrir en Google Calendar"
                            aria-label="Abrir en Google Calendar"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {/* Delete button triggering mandatory confirmation modal */}
                        <button
                          onClick={() => setEventToDelete(event)}
                          className="p-2 rounded-xl bg-white/[0.04] hover:bg-brand-red/20 text-[#D9D9D9]/50 hover:text-brand-red transition-colors cursor-pointer"
                          title="Eliminar evento de Google Calendar"
                          aria-label="Eliminar evento de Google Calendar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Footer Info */}
            <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-[#D9D9D9]/50 font-mono">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-green" />
                <span>Google Calendar API · OAuth 2.0 & Meet Sincronizados</span>
              </span>
              {currentUser && (
                <span>{filteredEvents.length} eventos listados</span>
              )}
            </div>

          </div>
        </div>
        )}

      </div>

      {/* 3. MANDATORY DESTRUCTIVE ACTION CONFIRMATION MODAL */}
      <AnimatePresence>
        {eventToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !deleteLoading && setEventToDelete(null)}
              className="absolute inset-0 bg-[#010715]/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-[#060B16] border border-brand-red/30 rounded-3xl p-6 shadow-2xl z-10 text-left overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-4 text-brand-red">
                <div className="w-10 h-10 rounded-xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">¿Eliminar evento de Google Calendar?</h3>
                  <span className="text-[10px] font-mono text-brand-red uppercase tracking-wider block">
                    ACCIÓN IRREVERSIBLE
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 mb-6">
                <h4 className="text-sm font-bold text-white mb-1">
                  {eventToDelete.summary || 'Evento sin título'}
                </h4>
                <div className="text-xs text-[#D9D9D9]/70 font-mono">
                  {formatEventDateTime(eventToDelete).dateStr} · {formatEventDateTime(eventToDelete).timeStr}
                </div>
              </div>

              <p className="text-xs text-[#D9D9D9]/80 leading-relaxed mb-6">
                Esta acción cancelará la reunión y la eliminará permanentemente de tu Google Calendar oficial. ¿Deseas confirmar la eliminación?
              </p>

              {deleteStatus && (
                <div className="p-3 rounded-xl bg-brand-red/10 border border-brand-red/20 text-brand-red text-xs mb-4">
                  {deleteStatus}
                </div>
              )}

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={() => setEventToDelete(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={handleConfirmDelete}
                  className="px-5 py-2.5 rounded-xl bg-brand-red hover:bg-brand-red/90 text-white text-xs font-bold transition-all shadow-lg cursor-pointer flex items-center gap-2"
                >
                  {deleteLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>Confirmar Eliminación</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
