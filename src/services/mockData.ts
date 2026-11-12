// Everything here is invented for the offline demo. Never paste real people,
// companies or records into this file: the repository is public.

interface MockContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export const mockContacts: MockContact[] = [
  { id: 'contact-01', firstName: 'Lucía', lastName: 'Paredes Soto', email: 'lucia.paredes@example.com' },
  { id: 'contact-02', firstName: 'Mateo', lastName: 'Rivas León', email: 'mateo.rivas@example.com' },
  { id: 'contact-03', firstName: 'Valentina', lastName: 'Ortega Ruiz', email: 'valentina.ortega@example.com' },
  { id: 'contact-04', firstName: 'Julián', lastName: 'Cárdenas Mora', email: 'julian.cardenas@example.com' },
  { id: 'contact-05', firstName: 'Renata', lastName: 'Salinas Vega', email: 'renata.salinas@example.com' },
  { id: 'contact-06', firstName: 'Tomás', lastName: 'Herrera Díaz', email: 'tomas.herrera@example.com' },
  { id: 'contact-07', firstName: 'Camila', lastName: 'Núñez Prado', email: 'camila.nunez@example.com' },
  { id: 'contact-08', firstName: 'Emilio', lastName: 'Fuentes Lara', email: 'emilio.fuentes@example.com' },
];

type Text = { es: string; en: string };

interface MockAppointmentSeed {
  dayOffset: number;
  time: string;
  durationMinutes: number;
  contact: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  reason: Text;
  notes?: Text;
}

const seeds: MockAppointmentSeed[] = [
  {
    dayOffset: -6,
    time: '10:00',
    durationMinutes: 30,
    contact: 3,
    status: 'confirmed',
    reason: { es: 'Primera consulta', en: 'First consultation' },
  },
  {
    dayOffset: -2,
    time: '16:30',
    durationMinutes: 45,
    contact: 5,
    status: 'cancelled',
    reason: { es: 'Revisión de documentos', en: 'Document review' },
    notes: { es: 'Pidió reprogramar para el próximo mes.', en: 'Asked to reschedule for next month.' },
  },
  {
    dayOffset: 0,
    time: '09:00',
    durationMinutes: 30,
    contact: 0,
    status: 'confirmed',
    reason: { es: 'Seguimiento', en: 'Follow-up' },
  },
  {
    dayOffset: 0,
    time: '23:30',
    durationMinutes: 15,
    contact: 1,
    status: 'pending',
    reason: { es: 'Llamada de cierre', en: 'Closing call' },
  },
  {
    dayOffset: 1,
    time: '11:15',
    durationMinutes: 60,
    contact: 2,
    status: 'pending',
    reason: { es: 'Asesoría inicial', en: 'Initial advice session' },
    notes: { es: 'Prefiere videollamada.', en: 'Prefers a video call.' },
  },
  {
    dayOffset: 3,
    time: '15:00',
    durationMinutes: 30,
    contact: 6,
    status: 'confirmed',
    reason: { es: 'Entrega de resultados', en: 'Results handover' },
  },
  {
    dayOffset: 3,
    time: '17:00',
    durationMinutes: 45,
    contact: 4,
    status: 'pending',
    reason: { es: 'Renovación de servicio', en: 'Service renewal' },
  },
  {
    dayOffset: 8,
    time: '08:30',
    durationMinutes: 90,
    contact: 7,
    status: 'pending',
    reason: { es: 'Taller de bienvenida', en: 'Welcome workshop' },
  },
];

export const mockUserName = (language: string): string => (language === 'en' ? 'Demo User' : 'Usuario Demo');

function isoDay(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Dates are relative to today so the demo always has past, present and future.
export function buildMockAppointments(language: string): Record<string, unknown>[] {
  const lang = language === 'en' ? 'en' : 'es';
  return seeds.map((seed, index) => {
    const contact = mockContacts[seed.contact];
    return {
      _id: `appointment-${index + 1}`,
      _rev: '1-demo',
      contactId: contact.id,
      contactName: `${contact.firstName} ${contact.lastName}`,
      date: isoDay(seed.dayOffset),
      time: seed.time,
      durationMinutes: seed.durationMinutes,
      status: seed.status,
      reason: seed.reason[lang],
      ...(seed.notes ? { notes: seed.notes[lang] } : {}),
      createdById: 'demo-user',
      createdByName: mockUserName(language),
    };
  });
}
