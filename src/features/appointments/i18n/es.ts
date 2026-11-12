import { commonEs } from '@/i18n/common/es';

export const appointmentsEs = {
  ...commonEs,
  title: 'Agenda de citas',
  newAppointment: 'Nueva cita',
  scope: {
    label: 'Periodo',
    upcoming: 'Próximas',
    past: 'Pasadas',
  },
  status: {
    filterLabel: 'Filtrar por estado',
    all: 'Todas',
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    cancelled: 'Cancelada',
  },
  statusPlural: {
    pending: 'Pendientes',
    confirmed: 'Confirmadas',
    cancelled: 'Canceladas',
  },
  day: {
    today: 'Hoy',
    tomorrow: 'Mañana',
    yesterday: 'Ayer',
  },
  duration: (minutes: number) => `${minutes} min`,
  createdBy: (name: string) => `Reservada por ${name}`,
  card: {
    confirm: 'Confirmar',
    cancelAppointment: 'Cancelar cita',
    more: (name: string) => `Más acciones para la cita de ${name}`,
    reopen: 'Reactivar',
    edit: 'Editar cita',
    insert: 'Insertar confirmación en el mensaje',
    viewContact: 'Ver contacto',
    calendar: 'Agregar a Google Calendar',
    delete: 'Eliminar cita',
    deleteQuestion: '¿Eliminar esta cita?',
    deleteConfirm: 'Eliminar',
    keep: 'Conservar',
  },
  emptyAgenda: {
    title: 'Todavía no hay citas',
    description: 'Cuando reserves la primera cita, aparecerá aquí agrupada por día.',
  },
  emptyUpcoming: {
    title: 'No hay citas próximas',
    description: 'Las citas que reserves de hoy en adelante aparecerán aquí.',
  },
  emptyPast: {
    title: 'No hay citas pasadas',
    description: 'Aquí verás las citas cuya hora ya pasó.',
  },
  emptyFiltered: {
    title: 'Ninguna cita con ese estado',
    description: 'Prueba con otro estado o revisa el otro periodo.',
    clear: 'Ver todas',
  },
  form: {
    createTitle: 'Nueva cita',
    editTitle: 'Editar cita',
    contact: 'Contacto',
    contactPlaceholder: 'Nombre de la persona',
    contactHint: 'Escribe para buscar entre tus contactos o deja el nombre tal cual.',
    contactLinked: 'Vinculada a un contacto',
    contactSuggestions: 'Contactos que coinciden',
    contactsUnavailable: 'Esta aplicación no tiene acceso a los contactos. Escribe el nombre de la persona.',
    date: 'Fecha',
    time: 'Hora',
    duration: 'Duración',
    reason: 'Motivo',
    reasonPlaceholder: 'Por ejemplo: primera consulta',
    notes: 'Notas',
    notesPlaceholder: 'Detalles que conviene recordar',
    optional: 'opcional',
    required: 'Completa este campo.',
    saveError: 'No se pudo guardar la cita. Inténtalo de nuevo.',
    create: 'Reservar cita',
    saving: 'Guardando…',
  },
  notice: {
    inserted: 'El texto quedó en el mensaje. Revísalo antes de enviarlo.',
    insertedOutside: 'Dentro de una conversación, este texto se inserta en el mensaje:',
    platformOnly: 'Esta acción funciona al abrir la aplicación dentro de la plataforma.',
    actionError: 'No se pudo guardar el cambio. Inténtalo de nuevo.',
    conflict: 'Otra persona cambió esta cita. La agenda se actualizó; revísala y vuelve a intentarlo.',
    dismiss: 'Cerrar aviso',
  },
  message: {
    confirmed: (name: string, day: string, time: string) =>
      `Hola ${name}, tu cita quedó confirmada para el ${day} a las ${time}.`,
    pending: (name: string, day: string, time: string) =>
      `Hola ${name}, reservamos tu cita para el ${day} a las ${time}. ¿Nos confirmas tu asistencia?`,
    cancelled: (name: string, day: string, time: string) =>
      `Hola ${name}, tu cita del ${day} a las ${time} fue cancelada. Si quieres reprogramarla, escríbenos por aquí.`,
    reason: (reason: string) => `Motivo: ${reason}.`,
    duration: (minutes: number) => `Duración aproximada: ${minutes} minutos.`,
  },
  calendarTitle: (name: string) => `Cita con ${name}`,
};

export type AppointmentsTranslations = typeof appointmentsEs;
