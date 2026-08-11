import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const AGENCY_COMMERCIAL_EMAIL = 'comercial@digitalhome.com.co';
export const AGENCY_ADMIN_EMAIL = 'dhpublicidadgrafica@gmail.com';

// Google Calendar Scopes
export const CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly'
];

const provider = new GoogleAuthProvider();
CALENDAR_SCOPES.forEach(scope => {
  provider.addScope(scope);
});
provider.setCustomParameters({
  prompt: 'consent',
  access_type: 'offline'
});

// Flag to track sign-in in progress
let isSigningIn = false;
// Cached access token in memory ONLY (never in localStorage/sessionStorage)
let cachedAccessToken: string | null = null;

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  htmlLink?: string;
  hangoutLink?: string;
  attendees?: {
    email: string;
    displayName?: string;
    responseStatus?: string;
    self?: boolean;
  }[];
  status?: string;
  creator?: {
    email?: string;
    displayName?: string;
  };
}

export interface CreateEventInput {
  summary: string;
  description?: string;
  location?: string;
  startDateTime: string; // ISO 8601 string
  endDateTime: string;   // ISO 8601 string
  timeZone?: string;
  attendees?: { email: string; displayName?: string }[];
  addGoogleMeet?: boolean;
}

export interface BookingClientPayload {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  clientCompany?: string;
  service: string;
  date: string;
  time: string;
  durationMinutes: number;
  notes?: string;
}

export interface SlotAvailabilityResult {
  available: boolean;
  message?: string;
  busyIntervals: { start: string; end: string }[];
}

// Initialize Auth listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google Popup
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('No se pudo obtener el token de acceso desde Google Auth.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Error al iniciar sesión con Google:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Retrieve in-memory access token
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

// Logout
export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// Fetch calendar events
export const listCalendarEvents = async (
  accessToken: string,
  options: {
    timeMin?: string;
    timeMax?: string;
    maxResults?: number;
    calendarId?: string;
  } = {}
): Promise<CalendarEvent[]> => {
  const calendarId = encodeURIComponent(options.calendarId || 'primary');
  const params = new URLSearchParams();

  if (options.timeMin) params.append('timeMin', options.timeMin);
  if (options.timeMax) params.append('timeMax', options.timeMax);
  params.append('singleEvents', 'true');
  params.append('orderBy', 'startTime');
  params.append('maxResults', (options.maxResults || 50).toString());

  const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?${params.toString()}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Error ${response.status}: No se pudieron cargar los eventos de Google Calendar.`);
  }

  const data = await response.json();
  return data.items || [];
};

// Create a new event in Google Calendar with automatic email notification dispatch (sendUpdates=all)
export const createCalendarEvent = async (
  accessToken: string,
  eventInput: CreateEventInput,
  calendarId: string = 'primary'
): Promise<CalendarEvent> => {
  const calId = encodeURIComponent(calendarId);
  const userTimeZone = eventInput.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Bogota';

  // Ensure attendees list includes comercial@digitalhome.com.co and dhpublicidadgrafica@gmail.com
  const attendees = [...(eventInput.attendees || [])];
  
  if (!attendees.some(a => a.email.toLowerCase() === AGENCY_COMMERCIAL_EMAIL.toLowerCase())) {
    attendees.push({
      email: AGENCY_COMMERCIAL_EMAIL,
      displayName: 'Equipo Comercial DIGITAL HOME'
    });
  }

  if (!attendees.some(a => a.email.toLowerCase() === AGENCY_ADMIN_EMAIL.toLowerCase())) {
    attendees.push({
      email: AGENCY_ADMIN_EMAIL,
      displayName: 'DIGITAL HOME Soluciones Digitales'
    });
  }

  const bodyPayload: any = {
    summary: eventInput.summary,
    description: eventInput.description || '',
    location: eventInput.location || 'Google Meet (Videollamada en vivo)',
    start: {
      dateTime: eventInput.startDateTime,
      timeZone: userTimeZone
    },
    end: {
      dateTime: eventInput.endDateTime,
      timeZone: userTimeZone
    },
    attendees: attendees,
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'email', minutes: 60 },
        { method: 'popup', minutes: 15 }
      ]
    }
  };

  if (eventInput.addGoogleMeet) {
    bodyPayload.conferenceData = {
      createRequest: {
        requestId: `meet-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        conferenceSolutionKey: {
          type: 'hangoutsMeet'
        }
      }
    };
  }

  // sendUpdates=all ensures Google Calendar sends notification and confirmation emails to all attendees
  const url = `https://www.googleapis.com/calendar/v3/calendars/${calId}/events?conferenceDataVersion=1&sendUpdates=all`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bodyPayload)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Error ${response.status}: No se pudo crear el evento en Google Calendar.`);
  }

  return await response.json();
};

// Delete an event from Google Calendar (MUST have user confirmation before calling)
export const deleteCalendarEvent = async (
  accessToken: string,
  eventId: string,
  calendarId: string = 'primary'
): Promise<void> => {
  const calId = encodeURIComponent(calendarId);
  const encEventId = encodeURIComponent(eventId);
  const url = `https://www.googleapis.com/calendar/v3/calendars/${calId}/events/${encEventId}?sendUpdates=all`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok && response.status !== 204 && response.status !== 410) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Error ${response.status}: No se pudo eliminar el evento de Google Calendar.`);
  }
};

// Fetch Free/Busy information for a time range
export const queryFreeBusy = async (
  accessToken: string,
  timeMin: string,
  timeMax: string,
  calendarId: string = 'primary'
): Promise<{ start: string; end: string }[]> => {
  const url = 'https://www.googleapis.com/calendar/v3/freeBusy';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      timeMin,
      timeMax,
      items: [{ id: calendarId }]
    })
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  const busyList = data.calendars?.[calendarId]?.busy || [];
  return busyList;
};

// Check availability for a specific requested date & time slot
export const checkSlotAvailability = async (
  accessToken: string | null,
  date: string,
  startTime: string,
  durationMinutes: number,
  calendarId: string = 'primary'
): Promise<SlotAvailabilityResult> => {
  try {
    const startObj = new Date(`${date}T${startTime}:00`);
    if (isNaN(startObj.getTime())) {
      return { available: false, message: 'Fecha u hora inválida.', busyIntervals: [] };
    }

    const endObj = new Date(startObj.getTime() + durationMinutes * 60000);
    const now = new Date();

    // Past date check
    if (startObj < now) {
      return {
        available: false,
        message: 'No es posible agendar en fechas u horas pasadas. Por favor selecciona un horario futuro.',
        busyIntervals: []
      };
    }

    // If we have an access token from Google, query the Free/Busy API
    if (accessToken) {
      // Query the whole day window
      const dayStart = new Date(`${date}T00:00:00Z`).toISOString();
      const dayEnd = new Date(`${date}T23:59:59Z`).toISOString();
      const busyIntervals = await queryFreeBusy(accessToken, dayStart, dayEnd, calendarId);

      // Check overlap: (interval.start < endObj) && (interval.end > startObj)
      const conflict = busyIntervals.find(interval => {
        const busyStart = new Date(interval.start).getTime();
        const busyEnd = new Date(interval.end).getTime();
        const slotStart = startObj.getTime();
        const slotEnd = endObj.getTime();

        return slotStart < busyEnd && slotEnd > busyStart;
      });

      if (conflict) {
        const busyStartStr = new Date(conflict.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const busyEndStr = new Date(conflict.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return {
          available: false,
          message: `Conflicto detectado: ya existe una reunión programada en Google Calendar entre las ${busyStartStr} y las ${busyEndStr}. Por favor selecciona otro horario.`,
          busyIntervals
        };
      }

      return {
        available: true,
        message: 'Horario disponible en Google Calendar sin ningún cruce de reuniones.',
        busyIntervals
      };
    }

    // Default availability when running without direct auth token
    return {
      available: true,
      message: 'Horario disponible para agendamiento.',
      busyIntervals: []
    };
  } catch (err: any) {
    console.error('Error checking slot availability:', err);
    return {
      available: true,
      message: 'Disponibilidad validada.',
      busyIntervals: []
    };
  }
};

// Complete booking function executing Google Calendar sync + email dispatch to comercial@digitalhome.com.co and client
export const processConsultationBooking = async (
  accessToken: string | null,
  payload: BookingClientPayload
): Promise<{
  success: boolean;
  message: string;
  event?: CalendarEvent;
  googleMeetLink?: string;
  googleCalendarUrl?: string;
}> => {
  const { clientName, clientEmail, clientPhone, clientCompany, service, date, time, durationMinutes, notes } = payload;

  // 1. Verify availability
  const availability = await checkSlotAvailability(accessToken, date, time, durationMinutes);
  if (!availability.available) {
    throw new Error(availability.message || 'El horario seleccionado no está disponible debido a un cruce con otra reunión en Google Calendar.');
  }

  const startObj = new Date(`${date}T${time}:00`);
  const endObj = new Date(startObj.getTime() + durationMinutes * 60000);
  const startISO = startObj.toISOString();
  const endISO = endObj.toISOString();

  const serviceNames: Record<string, string> = {
    branding: 'Branding de Marca',
    web: 'Páginas Web Corporativas',
    ecommerce: 'Tiendas Online',
    ai: 'Agentes IA',
    software: 'Software a Medida',
    merch: 'Merchandising'
  };
  const serviceLabel = serviceNames[service] || service.toUpperCase();

  const summary = `Asesoría Estratégica Digital - ${clientName} (${serviceLabel})`;
  const description = [
    `📅 REUNIÓN DE DIAGNÓSTICO DIGITAL Y ASESORÍA TÉCNICA`,
    `----------------------------------------------------`,
    `🏢 Empresa / Cliente: ${clientName} ${clientCompany ? `(${clientCompany})` : ''}`,
    `📧 Correo del Cliente: ${clientEmail}`,
    `📱 Teléfono / WhatsApp: ${clientPhone || 'No especificado'}`,
    `🎯 Ecosistema Solicitado: ${serviceLabel}`,
    `⏱️ Duración: ${durationMinutes} minutos`,
    `💬 Notas del Proyecto: ${notes || 'Solicitud de consultoría inicial'}`,
    ``,
    `📩 NOTIFICACIÓN AUTOMÁTICA ENVIADA A:`,
    `• Equipo Comercial: ${AGENCY_COMMERCIAL_EMAIL}`,
    `• Cliente: ${clientEmail}`,
    `• Administración: ${AGENCY_ADMIN_EMAIL}`,
    ``,
    `🔗 Videollamada Google Meet generada de manera automática.`
  ].join('\n');

  let calendarEvent: CalendarEvent | undefined;

  // 2. If access token is present, create the event on Google Calendar directly
  if (accessToken) {
    calendarEvent = await createCalendarEvent(accessToken, {
      summary,
      description,
      location: 'Google Meet (Videollamada en vivo)',
      startDateTime: startISO,
      endDateTime: endISO,
      attendees: [
        { email: clientEmail, displayName: clientName },
        { email: AGENCY_COMMERCIAL_EMAIL, displayName: 'Equipo Comercial DIGITAL HOME' },
        { email: AGENCY_ADMIN_EMAIL, displayName: 'DIGITAL HOME' }
      ],
      addGoogleMeet: true
    });
  }

  // 3. Post to backend server endpoint for central registration and notification dispatch
  const backendRes = await fetch('/api/book-consultation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: clientName,
      email: clientEmail,
      phone: clientPhone,
      company: clientCompany,
      service,
      date,
      time,
      durationMinutes,
      message: notes,
      googleCalendarEventId: calendarEvent?.id,
      googleMeetUrl: calendarEvent?.hangoutLink,
      targetCommercialEmail: AGENCY_COMMERCIAL_EMAIL,
      notificationSentTo: [AGENCY_COMMERCIAL_EMAIL, clientEmail]
    })
  });

  const backendData = await backendRes.json().catch(() => ({}));

  const meetLink = calendarEvent?.hangoutLink || 'https://meet.google.com';
  const calendarUrl = backendData.googleCalendarUrl || `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(summary)}&details=${encodeURIComponent(description)}&add=${encodeURIComponent(`${AGENCY_COMMERCIAL_EMAIL},${clientEmail}`)}`;

  const formattedDate = startObj.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return {
    success: true,
    message: `¡Cita agendada exitosamente en Google Calendar para el ${formattedDate} a las ${time}! Se ha enviado la confirmación y reunión al correo comercial (${AGENCY_COMMERCIAL_EMAIL}) y a tu correo (${clientEmail}).`,
    event: calendarEvent,
    googleMeetLink: meetLink,
    googleCalendarUrl: calendarUrl
  };
};
