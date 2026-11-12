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

interface MockAppointmentSeed {
  dayOffset: number;
  time: string;
  durationMinutes: number;
  contact: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  reason: string;
  notes?: string;
}

const seeds: MockAppointmentSeed[] = [
  { dayOffset: -6, time: '10:00', durationMinutes: 30, contact: 3, status: 'confirmed', reason: 'Primera consulta' },
  {
    dayOffset: -2,
    time: '16:30',
    durationMinutes: 45,
    contact: 5,
    status: 'cancelled',
    reason: 'Revisión de documentos',
    notes: 'Pidió reprogramar para el próximo mes.',
  },
  { dayOffset: 0, time: '09:00', durationMinutes: 30, contact: 0, status: 'confirmed', reason: 'Seguimiento' },
  { dayOffset: 0, time: '23:30', durationMinutes: 15, contact: 1, status: 'pending', reason: 'Llamada de cierre' },
  {
    dayOffset: 1,
    time: '11:15',
    durationMinutes: 60,
    contact: 2,
    status: 'pending',
    reason: 'Asesoría inicial',
    notes: 'Prefiere videollamada.',
  },
  {
    dayOffset: 3,
    time: '15:00',
    durationMinutes: 30,
    contact: 6,
    status: 'confirmed',
    reason: 'Entrega de resultados',
  },
  { dayOffset: 3, time: '17:00', durationMinutes: 45, contact: 4, status: 'pending', reason: 'Renovación de servicio' },
  { dayOffset: 8, time: '08:30', durationMinutes: 90, contact: 7, status: 'pending', reason: 'Taller de bienvenida' },
];

function isoDay(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Dates are relative to today so the demo always has past, present and future.
export function buildMockAppointments(): Record<string, unknown>[] {
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
      reason: seed.reason,
      ...(seed.notes ? { notes: seed.notes } : {}),
      createdById: 'demo-user',
      createdByName: 'Usuario Demo',
    };
  });
}
