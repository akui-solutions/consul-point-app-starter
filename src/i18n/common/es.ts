export const commonEs = {
  loading: 'Cargando…',
  error: {
    title: 'No se pudo cargar la información',
    description:
      'Revisa tu conexión e inténtalo de nuevo. Si el problema sigue, avisa a quien administra la aplicación.',
    retry: 'Intentar de nuevo',
  },
  sessionExpired: {
    title: 'La sesión terminó',
    description: 'Por seguridad, la sesión de la aplicación se cierra tras un tiempo. Vuelve a abrirla para continuar.',
    retry: 'Reintentar',
  },
  noContext: {
    title: 'Abre esta aplicación desde la plataforma',
    description: 'Aquí no hay una sesión activa. Ábrela desde el menú de aplicaciones o desde una conversación.',
  },
  empty: {
    title: 'Sin resultados',
    description: 'No se encontraron elementos.',
  },
  demo: {
    note: 'Datos de ejemplo. Nada de lo que hagas aquí se guarda.',
  },
  actions: {
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    close: 'Cerrar',
    confirm: 'Confirmar',
    back: 'Volver',
  },
};

export type CommonTranslations = typeof commonEs;
