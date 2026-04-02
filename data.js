// ============================================================
// DATOS DE EJEMPLO — Plataforma Mentores (Mockup)
// Editar estos objetos para cambiar los datos de la demo.
// ============================================================

const TENANT = {
  name: "Emin Ingeniería",
  slug: "emin",
  logo: "EMIN",
  primaryColor: "#2563EB",
  reminderFrequency: "semanal",
  nonComplianceThreshold: 2,
  consultantEmail: "rodrigo@comite.cl",
  schedulingUrl: "https://cal.com/rodrigo"
};

const USERS = [
  { id: 1, name: "Carolina Vega", email: "carolina@emin.cl", role: "admin", active: true },
  { id: 2, name: "Rodrigo Martínez", email: "rodrigo@comite.cl", role: "mentor", active: true },
  { id: 3, name: "Pedro Soto", email: "pedro@emin.cl", role: "mentor", active: true },
  { id: 4, name: "Miguel López", email: "miguel@emin.cl", role: "mentor", active: true },
  { id: 5, name: "Juanita Pérez", email: "juanita@emin.cl", role: "mentee", active: true },
  { id: 6, name: "Carlos Muñoz", email: "carlos@emin.cl", role: "mentee", active: true },
  { id: 7, name: "Ana Rojas", email: "ana@emin.cl", role: "mentee", active: true },
  { id: 8, name: "Sofía Torres", email: "sofia@emin.cl", role: "mentee", active: true },
  { id: 9, name: "María Torres", email: "maria.rrhh@emin.cl", role: "superuser", active: true }
];

const PAIRS = [
  { id: 1, mentorId: 2, menteeId: 5, active: true },
  { id: 2, mentorId: 2, menteeId: 6, active: true },
  { id: 3, mentorId: 3, menteeId: 7, active: true },
  { id: 4, mentorId: 4, menteeId: 8, active: true }
];

const SESSIONS = [
  { id: 1, pairId: 1, date: "2026-03-10", summary: "Primera sesión con Juanita. Definimos los objetivos del programa de mentoría para Q1. Conversamos sobre sus expectativas y áreas donde quiere desarrollarse. Acordamos reunirnos cada dos semanas.", createdBy: 2 },
  { id: 2, pairId: 1, date: "2026-03-21", summary: "Revisamos el avance del proyecto de tuberías. Juanita tiene buenas ideas pero necesita más confianza al presentarlas al equipo. Trabajamos en cómo estructurar sus argumentos técnicos.", createdBy: 2 },
  { id: 3, pairId: 1, date: "2026-03-28", summary: "Conversamos sobre las dificultades con el cálculo de la sección B. Revisamos juntos los planos y quedó más claro el enfoque. Juanita debe preparar una propuesta de solución para la próxima sesión.", createdBy: 2 },
  { id: 4, pairId: 2, date: "2026-03-15", summary: "Primera sesión con Carlos. Revisamos su rol actual y las habilidades que quiere fortalecer. Carlos tiene interés en liderar equipos a futuro.", createdBy: 2 },
  { id: 5, pairId: 2, date: "2026-03-29", summary: "Trabajamos en habilidades de comunicación con el equipo de obra. Carlos practicó cómo dar feedback constructivo usando casos reales de su semana.", createdBy: 2 },
  { id: 6, pairId: 2, date: "2026-04-01", summary: "Revisamos avance del proyecto de tuberías. Carlos mostró mejora en comunicación. Definimos compromisos para las próximas dos semanas.", createdBy: 2 },
  { id: 7, pairId: 3, date: "2026-03-12", summary: "Sesión inicial con Ana. Definimos foco en gestión de proyectos y manejo de proveedores.", createdBy: 3 }
];

const COMMITMENTS = [
  { id: 1, pairId: 1, description: "Definir objetivos Q2 con su jefatura", clientId: 5, assigneeId: 2, dueDate: "2026-03-15", dueTime: null, status: "cumplido", createdBy: 2 },
  { id: 2, pairId: 1, description: "Revisar feedback de evaluación de desempeño", clientId: 2, assigneeId: 5, dueDate: "2026-03-10", dueTime: null, status: "renegociado", createdBy: 2 },
  { id: 3, pairId: 1, description: "Completar informe de avance proyecto X", clientId: 2, assigneeId: 5, dueDate: "2026-03-28", dueTime: null, status: "vencido", createdBy: 2 },
  { id: 4, pairId: 1, description: "Revisar planos sección B y proponer solución", clientId: 2, assigneeId: 5, dueDate: "2026-04-05", dueTime: null, status: "vigente", createdBy: 2 },
  { id: 5, pairId: 1, description: "Enviar cotización a proveedor de materiales", clientId: 5, assigneeId: 5, dueDate: "2026-04-08", dueTime: null, status: "vigente", createdBy: 5 },
  { id: 6, pairId: 1, description: "Preparar presentación mensual para gerencia", clientId: 2, assigneeId: 5, dueDate: "2026-04-10", dueTime: "10:00", status: "vigente", createdBy: 2 },
  { id: 7, pairId: 2, description: "Practicar feedback constructivo con equipo de obra", clientId: 2, assigneeId: 6, dueDate: "2026-03-22", dueTime: null, status: "cumplido", createdBy: 2 },
  { id: 8, pairId: 2, description: "Leer capítulo 3 de libro de liderazgo", clientId: 2, assigneeId: 6, dueDate: "2026-03-29", dueTime: null, status: "cumplido", createdBy: 2 },
  { id: 9, pairId: 2, description: "Preparar plan de desarrollo personal Q2", clientId: 6, assigneeId: 6, dueDate: "2026-04-07", dueTime: null, status: "vigente", createdBy: 2 },
  { id: 10, pairId: 2, description: "Agendar reunión con jefatura para discutir metas", clientId: 2, assigneeId: 6, dueDate: "2026-04-12", dueTime: "15:00", status: "vigente", createdBy: 6 },
  { id: 11, pairId: 3, description: "Completar curso online de gestión de proyectos", clientId: 3, assigneeId: 7, dueDate: "2026-03-20", dueTime: null, status: "vencido", createdBy: 3 },
  { id: 12, pairId: 3, description: "Enviar reporte de seguimiento a proveedores", clientId: 3, assigneeId: 7, dueDate: "2026-03-25", dueTime: null, status: "vencido", createdBy: 3 },
  { id: 13, pairId: 3, description: "Preparar checklist de control de calidad", clientId: 7, assigneeId: 7, dueDate: "2026-04-09", dueTime: null, status: "vigente", createdBy: 3 }
];

const FILES = [
  { id: 1, name: "Guía de Mentoría 2026.pdf", description: "Material base del programa de mentoría", date: "2026-03-15", size: "2.4 MB" },
  { id: 2, name: "Presentación Kickoff.pptx", description: "Presentación de inicio del programa", date: "2026-03-10", size: "5.1 MB" },
  { id: 3, name: "Template Informe Mensual.xlsx", description: "Template para reportes mensuales de mentoría", date: "2026-03-10", size: "340 KB" },
  { id: 4, name: "Habilidades Blandas - Paper.pdf", description: "Artículo de referencia Harvard Business Review", date: "2026-03-01", size: "1.8 MB" },
  { id: 5, name: "Política de Mentoría Emin.pdf", description: "Política interna aprobada por RRHH", date: "2026-02-28", size: "890 KB" }
];
