import type { Locale } from "./copy";

/** Structured page content that is longer than a label but still copy. */

export const LAYERS: Record<Locale, { tag: string; items: string[] }[]> = {
  en: [
    { tag: "Experience", items: ["Families", "Schools", "Events", "Speaker & Media", "Apparel", "Partners"] },
    { tag: "Modules", items: ["Event OS", "Content OS", "Public Presence", "Relationship", "Commerce", "Impact"] },
    {
      tag: "Foundation",
      items: [
        "Identity & Access",
        "Contact & Relationship",
        "Consent & Child Safety",
        "Content & Assets",
        "Events & Participation",
        "Automation",
        "Analytics & Impact",
        "Audit",
      ],
    },
    { tag: "Platform", items: ["Next.js on Vercel", "PostgreSQL (Supabase)", "Zoom", "Stripe", "Resend"] },
  ],
  es: [
    { tag: "Experiencia", items: ["Familias", "Escuelas", "Eventos", "Conferencias y prensa", "Ropa", "Aliados"] },
    { tag: "Módulos", items: ["Sistema de eventos", "Sistema de contenido", "Presencia pública", "Relaciones", "Comercio", "Impacto"] },
    {
      tag: "Fundamento",
      items: [
        "Identidad y acceso",
        "Contactos y relaciones",
        "Consentimiento y protección infantil",
        "Contenido y materiales",
        "Eventos y participación",
        "Automatización",
        "Analítica e impacto",
        "Auditoría",
      ],
    },
    { tag: "Plataforma", items: ["Next.js en Vercel", "PostgreSQL (Supabase)", "Zoom", "Stripe", "Resend"] },
  ],
};

export const TABLES: Record<Locale, { group: string; names: string[] }[]> = {
  en: [
    { group: "Identity & relationships", names: ["person", "organization", "household", "child_profile", "role_assignment", "consent", "interaction"] },
    { group: "Events & participation", names: ["event", "event_session", "registration", "attendance", "event_message", "exception_item"] },
    { group: "Content & publishing", names: ["content_asset", "content_derivative", "approval", "publication", "publication_metric"] },
  ],
  es: [
    { group: "Identidad y relaciones", names: ["person", "organization", "household", "child_profile", "role_assignment", "consent", "interaction"] },
    { group: "Eventos y participación", names: ["event", "event_session", "registration", "attendance", "event_message", "exception_item"] },
    { group: "Contenido y publicación", names: ["content_asset", "content_derivative", "approval", "publication", "publication_metric"] },
  ],
};

export const WEEKS: Record<Locale, { week: string; title: string; done: string[] }[]> = {
  en: [
    {
      week: "Week 1",
      title: "The spine goes in",
      done: [
        "Repository, hosting and database, all created in I AM 4 Kids’ name",
        "Eighteen tables migrated: identity, consent, events, content",
        "Row-level security live, so a child record cannot leak through an API bug",
        "One public registration form writing real records",
      ],
    },
    {
      week: "Week 2",
      title: "Events run themselves",
      done: [
        "Zoom link generated on registration, not by hand",
        "Confirmation, 24-hour and 1-hour reminders in the family’s own time zone",
        "Attendance written back from Zoom after every session",
        "Failed sends surface as exceptions in seconds, not on the night",
      ],
    },
    {
      week: "Week 3",
      title: "One recording becomes ten pieces",
      done: [
        "Upload a session recording; derivatives are drafted from it",
        "Nothing publishes without a named human approval",
        "API publishing where it is reliable, an honest queue where it is not",
        "Brand and voice rules enforced on every draft",
      ],
    },
    {
      week: "Week 4",
      title: "You can see it, and you own it",
      done: [
        "Impact dashboard: families reached, sessions held, attendance, schools served",
        "Admin console for staff, no engineer needed to run an event",
        "Access handover: every credential in I AM 4 Kids’ name, TechFides removable",
        "Decision log current, architecture documented in the repository",
      ],
    },
  ],
  es: [
    {
      week: "Semana 1",
      title: "Se instala la columna vertebral",
      done: [
        "Repositorio, alojamiento y base de datos, todos creados a nombre de I AM 4 Kids",
        "Dieciocho tablas migradas: identidad, consentimiento, eventos, contenido",
        "Seguridad a nivel de fila activa, para que un fallo de la API no pueda exponer el registro de un niño",
        "Un formulario público de inscripción que escribe registros reales",
      ],
    },
    {
      week: "Semana 2",
      title: "Los eventos se gestionan solos",
      done: [
        "El enlace de Zoom se genera al inscribirse, no a mano",
        "Confirmación y recordatorios de 24 horas y 1 hora, en la zona horaria de cada familia",
        "La asistencia vuelve desde Zoom después de cada sesión",
        "Los envíos fallidos aparecen como incidencias en segundos, no la noche del evento",
      ],
    },
    {
      week: "Semana 3",
      title: "Una grabación se convierte en diez piezas",
      done: [
        "Suba la grabación de una sesión; de ahí se redactan las versiones para cada canal",
        "Nada se publica sin la aprobación de una persona con nombre y apellido",
        "Publicación por API donde es fiable, y una cola honesta donde no lo es",
        "Las reglas de marca y de voz se aplican a cada borrador",
      ],
    },
    {
      week: "Semana 4",
      title: "Puede verlo, y es suyo",
      done: [
        "Panel de impacto: familias alcanzadas, sesiones realizadas, asistencia, escuelas atendidas",
        "Consola de administración para el equipo, sin necesidad de un ingeniero para dirigir un evento",
        "Entrega de accesos: cada credencial a nombre de I AM 4 Kids, con TechFides retirable",
        "Registro de decisiones al día y arquitectura documentada en el repositorio",
      ],
    },
  ],
};

export const DECISIONS: Record<Locale, { n: number; d: string; why: string }[]> = {
  en: [
    { n: 1, d: "Children are records, not users", why: "COPPA attaches the moment a child can log in or be contacted. So they can do neither." },
    { n: 2, d: "PostgreSQL is the system of record", why: "Households, school rosters and one-person-many-roles do not fit a stock CRM." },
    { n: 3, d: "Event OS built, not bought", why: "Events must feed one contact record and one impact report. Eventbrite cannot." },
    { n: 4, d: "Security lives in the database", why: "An application bug must not be able to expose a child record." },
    { n: 5, d: "Publish by API where reliable, queue elsewhere", why: "An honest handoff beats a silent failure on TikTok or YouTube." },
    { n: 6, d: "Consent is append-only", why: "You must be able to prove what someone agreed to, in what wording, and when." },
    { n: 7, d: "English and Spanish from the first commit", why: "Retro-fitting language routing is a rebuild, not a setting. This page is the proof." },
  ],
  es: [
    { n: 1, d: "Los niños son registros, no usuarios", why: "COPPA se activa en cuanto un niño puede iniciar sesión o ser contactado. Así que no puede hacer ninguna de las dos cosas." },
    { n: 2, d: "PostgreSQL es el sistema de registro", why: "Los hogares, las listas escolares y una persona con varios roles no caben en un CRM de catálogo." },
    { n: 3, d: "El sistema de eventos se construye, no se compra", why: "Los eventos deben alimentar un solo registro de contacto y un solo informe de impacto. Eventbrite no puede." },
    { n: 4, d: "La seguridad vive en la base de datos", why: "Un fallo en la aplicación no debe poder exponer el registro de un niño." },
    { n: 5, d: "Publicar por API donde sea fiable, y encolar donde no", why: "Una entrega honesta es mejor que un fallo silencioso en TikTok o YouTube." },
    { n: 6, d: "El consentimiento sólo se añade, nunca se sobrescribe", why: "Hay que poder demostrar a qué accedió alguien, con qué texto exacto y cuándo." },
    { n: 7, d: "Inglés y español desde el primer commit", why: "Añadir el enrutamiento de idiomas después es reconstruir, no configurar. Esta página es la prueba." },
  ],
};
