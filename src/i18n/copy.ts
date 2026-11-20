/**
 * All user-facing copy, in both languages.
 *
 * Kept in one typed object rather than scattered JSON so that adding a
 * string in English and forgetting the Spanish is a compile error, not a
 * discovery in front of a Spanish-speaking parent. Blueprint v0.1 §7 asks
 * for multilingual by default; this is what "by default" has to mean.
 */

export const LOCALES = ["en", "es"] as const;
export type Locale = (typeof LOCALES)[number];

export function isLocale(v: string): v is Locale {
  return (LOCALES as readonly string[]).includes(v);
}

export function other(locale: Locale): Locale {
  return locale === "en" ? "es" : "en";
}

const en = {
  nav: {
    foundation: "Foundation",
    impact: "Impact",
    content: "Content",
    admin: "Staff console",
    register: "Register",
    schools: "Schools",
    feedback: "Your review",
    switch: "Español",
  },

  home: {
    eyebrow: "I AM 4 Kids · Platform Foundation",
    title: "One foundation. Every experience in the vision sits on top of it.",
    lede:
      "The blueprint describes a kids’ empowerment universe: a show, characters, toys, games, books, apparel. Those are six products. They are also six chances to build six disconnected databases. This is what stops that happening: one record for every family, one place events and content are managed from, and a child who is counted and celebrated but never contacted.",
    ctaRegister: "See a family register",
    ctaVision: "The vision this serves",
    ctaImpact: "See the impact dashboard",

    decisionEyebrow: "The decision everything else depends on",
    decisionTitle: "A child is a record, not a user.",
    decisionBody:
      "COPPA attaches the moment a child can log in or be reached directly. Rather than build a consent apparatus around child accounts, we removed the trigger. A child profile has no email address, no login, no phone number. There is no column to put one in. Every experience in the blueprint still works. The parent is the one we talk to.",
    decisionFooter: "Enforced by the schema, not by a rule someone has to remember.",

    stackTitle: "How it stacks",
    stackLede:
      "Modules never read each other’s tables. They share the foundation. That is the difference between a platform and a folder of tools.",

    tablesTitle: "What is already built",
    tablesLede:
      "Eighteen tables across six migrations, with row-level security on the child records. This is committed code running against a live database, not a diagram.",

    weeksTitle: "The first thirty days",
    weeksLede: "Each week ends with something you can use, not something you can read about.",
    inProgress: "in progress",

    decisionsTitle: "Decisions on the record",
    decisionsLede:
      "Blueprint §8 asks for a decision log. Here it is, and it stays current. Each one names what we chose, and what would make us revisit it.",

    ownershipEyebrow: "Ownership",
    ownershipTitle: "Every account is created in I AM 4 Kids’ name.",
    ownershipBody:
      "The repository, the hosting, the database, the email sender, the social accounts. All owned by I AM 4 Kids, with TechFides added as an administrator who can be removed on a Tuesday afternoon without anything breaking. Never the reverse. That is a condition of the work, not a favour.",

    footer:
      "Built by TechFides for I AM 4 Kids. Foundation: architecture, schema and access model. Not a public site.",
  },

  impact: {
    eyebrow: "I AM 4 Kids · Impact",
    title: "What the platform can prove.",
    lede:
      "Every number here is a live count from the database. Nothing is typed in, nothing is estimated, and nothing can be quietly adjusted. Today they read zero, because today is day one. That is exactly why they will mean something in ninety days.",
    families: "Families",
    children: "Children reached",
    guardians: "Guardians",
    schools: "Schools & districts",
    sessionsHeld: "Sessions held",
    sessionsUpcoming: "Sessions scheduled",
    registrations: "Registrations",
    attended: "Attended",
    noShows: "No-shows",
    attendanceRate: "Attendance rate",
    consents: "Consents on record",
    contentAssets: "Content assets",
    published: "Pieces published",
    awaitingApproval: "Awaiting approval",
    openExceptions: "Open exceptions",
    groupReach: "Reach",
    groupEvents: "Events",
    groupTrust: "Trust & safety",
    groupContent: "Content",
    liveNote: "Live from the database",
    offlineNote:
      "The database is not connected to this deployment yet, so these read as unavailable rather than as zero. A dashboard that invents a number is worse than one that admits it cannot see.",
    trackTitle: "Track record",
    trackLede:
      "Results I AM 4 Kids has confirmed and approved, with the evidence on file. The live counts below start from the day this platform opened.",
    whyZero: "Why every number is zero",
    whyZeroBody:
      "Because these numbers only count what actually happens on this platform, and it is new. An earlier TechFides demo system was filled with sample schools, sample contracts and a sample $45,000 pilot to show the layout. None of that came from I AM 4 Kids, and none of your real history was ever stored here or removed. Your real accomplishments belong in Atlas, recorded with their evidence, so they can be shown accurately.",
  },

  content: {
    eyebrow: "I AM 4 Kids · Content OS",
    title: "One recording becomes a post for each of your channels. Nothing publishes without you.",
    lede:
      "Paste a transcript, a talk, a voice note, anything you have already said. The platform drafts it for every channel. Then it stops, and waits for a name.",
    inputLabel: "Source material",
    placeholder:
      "Paste a session transcript or a few paragraphs of something you have already said…",
    sample: "Use a sample",
    sampleNote: "The sample is your own wording from the iam4kids.com home page.",
    channelsNote:
      "You chose Facebook and LinkedIn, so those are the only channels drafted. Instagram, X, TikTok, YouTube and email stay switched off until you decide to add them.",
    guardrailsTitle: "What every draft is held to",
    guardrailsSource:
      "Your guardrails, in your words, from your feedback on October 15. You can change them in Atlas in the staff console.",
    generate: "Draft for every channel",
    clear: "Clear",
    empty: "Paste something above and the drafts appear here.",
    tooShort: "Give it a couple of sentences to work with.",
    gateTitle: "The approval gate",
    gateBody:
      "Every draft below is held. Approve one and it moves to the publishing queue; reject it and it goes back. The decision is recorded against your name and the wording you saw, not inferred later from a status field. This gate is not a formality. For a children’s charity it is the product.",
    approve: "Approve",
    reject: "Reject",
    approved: "Approved, queued to publish",
    rejected: "Rejected, returned to drafting",
    pending: "Awaiting approval",
    apiMode: "Publishes by API",
    handoffMode: "Manual handoff",
    handoffWhy:
      "This platform restricts automated posting. The queue hands you the finished piece instead of pretending it published.",
    honest:
      "Drafting here runs on rules, not a language model. Enough to show the shape and the gate. The model plugs into this same pipeline in Week 3, and the gate does not move.",
    charCount: "characters",
  },

  admin: {
    eyebrow: "I AM 4 Kids · Staff",
    title: "The screen your team runs an event from.",
    lede:
      "No engineer, no spreadsheet, no one asking who has the list. Sessions, registrations, attendance, and the failures that would otherwise stay invisible until the night itself.",
    upcoming: "Upcoming sessions",
    noSessions: "No sessions scheduled.",
    registrations: "Registrations",
    noRegistrations: "No registrations yet.",
    exceptions: "Exception queue",
    noExceptions: "Nothing failing. This queue is meant to be empty.",
    exceptionsLede:
      "A bounced confirmation is a family who will not turn up and will never tell you why. It surfaces here in seconds, tied to the registration, instead of being discovered on the night.",
    capacity: "capacity",
    registered: "registered",
    starts: "Starts",
    guardian: "Guardian",
    child: "Child",
    when: "When",
    status: "Status",
    locked: "Staff data is locked",
    lockedBody:
      "This screen reads guardian names, children and registrations, so it needs the database credentials that the public pages deliberately do not use. Add the service role key to this deployment and the screen fills in. Until then it shows you the shape and none of the people, which is the correct failure.",
  },

  register: {
    title: "Save your family’s place",
    subtitle: "Be Great! Family Reset. The parent registers, the whole family attends.",
    guardianName: "Parent or guardian name",
    email: "Email",
    childFirstName: "Child’s first name",
    childAge: "Child’s age",
    consent:
      "I am the parent or legal guardian and I consent to I AM 4 Kids contacting me about this session. My child does not create an account and will not be contacted directly.",
    submit: "Reserve our place",
    error: "Please complete every field and confirm guardian consent.",
    confirmTitle: "You’re in.",
    confirmBody:
      "Your family’s place is saved for {when}. The I AM 4 Kids team will email the joining link to {email} before the session.",
    waitlistTitle: "You’re on the waiting list.",
    waitlistBody:
      "This session is full, so we have added your family to the waiting list for {when}. If a place opens, we will tell you at {email}.",
    nextSession: "Next session",
    noDateTitle: "The Family Reset is taking a short break.",
    noDateBody:
      "We are preparing a new format. Leave your details on the Get Started page and we will let you know as soon as new dates open.",
    noDateError: "This session is no longer open. Please reload the page for the next date.",
    previewNote:
      "Preview mode: database credentials are not set on this deployment, so nothing was saved.",
    back: "Back to the platform",
    sending: "One moment…",
  },

  feedback: {
    eyebrow: "I AM 4 Kids · Your review",
    title: "Tell us where this is right, and where it is not.",
    lede:
      "Six short sections. Answer what you have a view on and skip the rest. A half-filled form beats a meeting nobody wrote down. Everything you write here is recorded against the work, not lost in a thread.",
    time: "About five minutes. Nothing is required except your name.",

    s1: "1. You",
    name: "Your name",
    role: "Your role",
    rolePlaceholder: "Founder, I AM 4 Kids",

    s2: "2. The vision",
    s2lede:
      "You described a kids’ empowerment universe. The question is not whether we built something. It is whether we built something that serves that.",
    visionServes: "Does what you are looking at serve the vision as you described it?",
    visionServesPlaceholder: "Where it lands, and where it misses.",
    visionMissing: "What is in your vision that you do not see here yet?",
    visionMissingPlaceholder:
      "The show, the characters, the books, the apparel, the school programme. Anything we have not accounted for.",

    s3: "3. The public site",
    s3lede: "The site families and schools see first.",
    websiteLikes: "What is working?",
    websiteChanges: "What would you change?",
    websiteChangesPlaceholder: "Wording, images, order of the page, anything that feels off-brand.",

    s4: "4. The platform",
    s4lede:
      "The foundation, the registration flow, the impact dashboard, the content screen, the staff console.",
    platformLikes: "What is working?",
    platformChanges: "What is not right?",
    platformChangesPlaceholder:
      "Be blunt. Something that is wrong now is cheap. The same thing in three months is not.",
    hopes: "What else do you hope to see?",
    hopesPlaceholder: "Things you expected, things you have thought of since, things you want next.",

    s5: "5. Timing",
    s5lede: "The date matters less than what is driving it. Tell us both.",
    goLiveDate: "Target go-live date",
    goLiveDriver: "What is driving that date?",
    goLiveDriverPlaceholder:
      "School year, a launch event, a funder deadline, a season. Whatever is really behind it.",
    priority: "If only one thing could be finished first, which?",
    priorityChoose: "Choose one",
    pEvents: "Events: registration, reminders, attendance",
    pContent: "Content: one recording into many pieces",
    pSchools: "Schools: rosters and school programs",
    pImpact: "Impact reporting: what we can prove to funders",
    pPublicSite: "The public site: what families see first",
    pNotSure: "Not sure yet",

    s6: "6. Rules and approvals",
    s6lede:
      "Three answers we need before anything is drafted or published in your name. They are quicker to write than to discuss.",
    approver: "Who approves content when you are not available?",
    approverPlaceholder: "A name, or “nobody, it waits for me”.",
    guardrails: "What must the AI never say or do in your name?",
    guardrailsPlaceholder:
      "Words you never use, claims you never make, anything about children that is off limits.",
    channels: "Which two channels matter most first?",
    channelsPlaceholder: "For example: Facebook and email. Or LinkedIn and Instagram.",
    anythingElse: "Anything else",
    anythingElsePlaceholder: "Whatever did not fit above.",

    submit: "Send my feedback",
    sending: "Sending…",
    needName: "Please add your name so we know whose view this is.",
    failed: "That did not send. Try once more, and if it still fails, email it to Jacques.",
    thanksTitle: "Thank you. This is recorded.",
    thanksBody:
      "Your answers are saved against the project, with today’s date. Nothing here disappears into an inbox. We will work from it and come back to you on each point.",
    thanksNext: "Back to the platform",
    savedLocal:
      "Saved locally. The database was not reachable, so a copy is on screen below. Please send it to Jacques so nothing is lost.",
  },
};

/**
 * The shape English defines. No `as const` on `en`: literal types would make
 * every Spanish string a type error rather than a translation. Structure is
 * still enforced: a key present in English and missing in Spanish fails the
 * build, which is the whole point of keeping both in one file.
 */
type Copy = typeof en;

const es: Copy = {
  nav: {
    foundation: "Fundamento",
    impact: "Impacto",
    content: "Contenido",
    admin: "Consola del equipo",
    register: "Inscribirse",
    schools: "Escuelas",
    feedback: "Su valoración",
    switch: "English",
  },

  home: {
    eyebrow: "I AM 4 Kids · Fundamento de la plataforma",
    title: "Un solo fundamento. Toda la visión se apoya en él.",
    lede:
      "El plano describe un universo de empoderamiento infantil: una serie, personajes, juguetes, videojuegos, libros, ropa. Son seis productos. También son seis oportunidades de construir seis bases de datos incomunicadas. Esto es lo que impide que eso ocurra: un solo registro por familia, un solo lugar desde donde se gestionan los eventos y el contenido, y un niño al que se cuenta y se celebra, pero al que nunca se contacta.",
    ctaRegister: "Ver a una familia inscribirse",
    ctaVision: "La visión a la que sirve",
    ctaImpact: "Ver el panel de impacto",

    decisionEyebrow: "La decisión de la que depende todo lo demás",
    decisionTitle: "Un niño es un registro, no un usuario.",
    decisionBody:
      "COPPA se activa en el momento en que un niño puede iniciar sesión o ser contactado directamente. En lugar de construir todo un aparato de consentimiento alrededor de las cuentas infantiles, eliminamos el detonante. El perfil de un niño no tiene correo, ni inicio de sesión, ni teléfono. No existe la columna donde ponerlo. Toda la visión del plano sigue funcionando: el padre o la madre es con quien hablamos.",
    decisionFooter:
      "Lo garantiza el esquema de la base de datos, no una regla que alguien tenga que recordar.",

    stackTitle: "Cómo se apila",
    stackLede:
      "Los módulos nunca leen las tablas de los demás. Comparten el fundamento. Esa es la diferencia entre una plataforma y una carpeta llena de herramientas.",

    tablesTitle: "Lo que ya está construido",
    tablesLede:
      "Dieciocho tablas en seis migraciones, con seguridad a nivel de fila sobre los registros de los niños. Esto es código publicado que corre contra una base de datos real, no un diagrama.",

    weeksTitle: "Los primeros treinta días",
    weeksLede: "Cada semana termina con algo que puede usar, no con algo que puede leer.",
    inProgress: "en curso",

    decisionsTitle: "Decisiones registradas",
    decisionsLede:
      "La sección §8 del plano pide un registro de decisiones. Aquí está, y se mantiene al día. Cada una dice qué elegimos y qué nos haría replantearlo.",

    ownershipEyebrow: "Propiedad",
    ownershipTitle: "Cada cuenta se crea a nombre de I AM 4 Kids.",
    ownershipBody:
      "El repositorio, el alojamiento, la base de datos, el servicio de correo, las redes sociales: todo es propiedad de I AM 4 Kids, con TechFides añadido como administrador que puede ser retirado un martes por la tarde sin que nada se rompa. Nunca al revés. Es una condición del trabajo, no un favor.",

    footer:
      "Construido por TechFides para I AM 4 Kids. Fundamento: arquitectura, esquema y modelo de acceso. No es un sitio público.",
  },

  impact: {
    eyebrow: "I AM 4 Kids · Impacto",
    title: "Lo que la plataforma puede demostrar.",
    lede:
      "Cada número aquí es un conteo en vivo de la base de datos. Nada se escribe a mano, nada se estima y nada se puede ajustar en silencio. Hoy marcan cero, porque hoy es el primer día: precisamente por eso van a significar algo dentro de noventa días.",
    families: "Familias",
    children: "Niños alcanzados",
    guardians: "Padres y tutores",
    schools: "Escuelas y distritos",
    sessionsHeld: "Sesiones realizadas",
    sessionsUpcoming: "Sesiones programadas",
    registrations: "Inscripciones",
    attended: "Asistieron",
    noShows: "No asistieron",
    attendanceRate: "Tasa de asistencia",
    consents: "Consentimientos vigentes",
    contentAssets: "Materiales de contenido",
    published: "Piezas publicadas",
    awaitingApproval: "Esperando aprobación",
    openExceptions: "Incidencias abiertas",
    groupReach: "Alcance",
    groupEvents: "Eventos",
    groupTrust: "Confianza y protección",
    groupContent: "Contenido",
    liveNote: "En vivo desde la base de datos",
    offlineNote:
      "La base de datos todavía no está conectada a este despliegue, así que estos valores aparecen como no disponibles en lugar de como cero. Un panel que inventa un número es peor que uno que admite que no puede verlo.",
    trackTitle: "Trayectoria",
    trackLede:
      "Resultados que I AM 4 Kids ha confirmado y aprobado, con la evidencia archivada. Los conteos en vivo de abajo empiezan el día en que abrió esta plataforma.",
    whyZero: "Por qué todo está en cero",
    whyZeroBody:
      "Porque estas cifras solo cuentan lo que de verdad ocurre en esta plataforma, y es nueva. Un sistema de demostración anterior de TechFides se llenó con escuelas, contratos y un piloto de 45.000 dólares de ejemplo, solo para mostrar el diseño. Nada de eso venía de I AM 4 Kids, y ninguna parte de su historia real se guardó aquí ni se eliminó. Sus logros reales pertenecen a Atlas, registrados con su evidencia, para poder mostrarlos con precisión.",
  },

  content: {
    eyebrow: "I AM 4 Kids · Sistema de contenido",
    title: "Una grabación se convierte en una publicación para cada uno de sus canales. Nada se publica sin usted.",
    lede:
      "Pegue una transcripción, una charla, una nota de voz: cualquier cosa que ya haya dicho. La plataforma redacta la versión de cada canal. Después se detiene y espera un nombre.",
    inputLabel: "Material de origen",
    placeholder:
      "Pegue aquí la transcripción de una sesión o unos párrafos de algo que ya haya dicho…",
    sample: "Usar un ejemplo",
    sampleNote: "El ejemplo es su propio texto de la página de inicio de iam4kids.com.",
    channelsNote:
      "Usted eligió Facebook y LinkedIn, así que solo se redactan esos canales. Instagram, X, TikTok, YouTube y el correo siguen desactivados hasta que decida añadirlos.",
    guardrailsTitle: "Las reglas que cumple cada borrador",
    guardrailsSource:
      "Sus reglas, con sus palabras, de su valoración del 15 de octubre. Puede cambiarlas en Atlas, en la consola del equipo.",
    generate: "Redactar para cada canal",
    clear: "Limpiar",
    empty: "Pegue algo arriba y los borradores aparecerán aquí.",
    tooShort: "Déle un par de frases con las que trabajar.",
    gateTitle: "La puerta de aprobación",
    gateBody:
      "Cada borrador de abajo está retenido. Si aprueba uno, pasa a la cola de publicación; si lo rechaza, vuelve a redacción. La decisión queda registrada con su nombre y con el texto exacto que usted vio, no deducida después de un campo de estado. Esta puerta no es un trámite. Para una organización dedicada a la infancia, es el producto.",
    approve: "Aprobar",
    reject: "Rechazar",
    approved: "Aprobado, en cola para publicar",
    rejected: "Rechazado, devuelto a redacción",
    pending: "Esperando aprobación",
    apiMode: "Publica por API",
    handoffMode: "Entrega manual",
    handoffWhy:
      "Esta plataforma restringe la publicación automática. La cola le entrega la pieza terminada en lugar de fingir que se publicó.",
    honest:
      "Aquí la redacción funciona con reglas, no con un modelo de lenguaje: lo justo para mostrar la forma y la puerta de aprobación. El modelo se conecta a esta misma tubería en la semana 3, y la puerta no se mueve.",
    charCount: "caracteres",
  },

  admin: {
    eyebrow: "I AM 4 Kids · Equipo",
    title: "La pantalla desde la que su equipo dirige un evento.",
    lede:
      "Sin ingenieros, sin hojas de cálculo, sin nadie preguntando quién tiene la lista. Sesiones, inscripciones, asistencia y los fallos que de otro modo seguirían invisibles hasta la noche misma.",
    upcoming: "Próximas sesiones",
    noSessions: "No hay sesiones programadas.",
    registrations: "Inscripciones",
    noRegistrations: "Todavía no hay inscripciones.",
    exceptions: "Cola de incidencias",
    noExceptions: "Nada está fallando. Esta cola está hecha para estar vacía.",
    exceptionsLede:
      "Una confirmación rebotada es una familia que no va a venir y que nunca le dirá por qué. Aparece aquí en segundos, ligada a la inscripción, en vez de descubrirse la noche del evento.",
    capacity: "aforo",
    registered: "inscritos",
    starts: "Comienza",
    guardian: "Padre o tutor",
    child: "Niño",
    when: "Cuándo",
    status: "Estado",
    locked: "Los datos del equipo están protegidos",
    lockedBody:
      "Esta pantalla lee nombres de tutores, niños e inscripciones, así que necesita las credenciales de base de datos que las páginas públicas deliberadamente no usan. Añada la clave de servicio a este despliegue y la pantalla se completa. Hasta entonces le muestra la forma y a ninguna persona, que es el fallo correcto.",
  },

  register: {
    title: "Reserve el lugar de su familia",
    subtitle:
      "Be Great! Family Reset. Se inscribe el padre o la madre, asiste toda la familia.",
    guardianName: "Nombre del padre, madre o tutor",
    email: "Correo electrónico",
    childFirstName: "Nombre del niño o la niña",
    childAge: "Edad del niño o la niña",
    consent:
      "Soy el padre, la madre o el tutor legal y doy mi consentimiento para que I AM 4 Kids me contacte sobre esta sesión. Mi hijo o hija no crea ninguna cuenta y no será contactado directamente.",
    submit: "Reservar nuestro lugar",
    error: "Complete todos los campos y confirme el consentimiento del tutor.",
    confirmTitle: "Listo, ya están dentro.",
    confirmBody:
      "El lugar de su familia está reservado para el {when}. El equipo de I AM 4 Kids enviará el enlace para unirse a {email} antes de la sesión.",
    waitlistTitle: "Están en la lista de espera.",
    waitlistBody:
      "Esta sesión está completa, así que hemos añadido a su familia a la lista de espera del {when}. Si se libera un lugar, se lo diremos en {email}.",
    nextSession: "Próxima sesión",
    noDateTitle: "El Family Reset está en una breve pausa.",
    noDateBody:
      "Estamos preparando un nuevo formato. Deje sus datos en la página Comenzar y le avisaremos en cuanto haya nuevas fechas.",
    noDateError: "Esta sesión ya no está abierta. Vuelva a cargar la página para ver la próxima fecha.",
    previewNote:
      "Modo de vista previa: las credenciales de la base de datos no están configuradas en este despliegue, así que no se guardó nada.",
    back: "Volver a la plataforma",
    sending: "Un momento…",
  },

  feedback: {
    eyebrow: "I AM 4 Kids · Su valoración",
    title: "Díganos dónde acertamos y dónde no.",
    lede:
      "Seis secciones breves. Conteste aquello sobre lo que tenga una opinión y salte el resto: un formulario a medias vale más que una reunión que nadie anotó. Todo lo que escriba aquí queda registrado junto al trabajo, no perdido en un correo.",
    time: "Unos cinco minutos. Lo único obligatorio es su nombre.",

    s1: "1. Usted",
    name: "Su nombre",
    role: "Su cargo",
    rolePlaceholder: "Fundador, I AM 4 Kids",

    s2: "2. La visión",
    s2lede:
      "Usted describió un universo de empoderamiento infantil. La pregunta no es si construimos algo. Es si construimos algo que sirva a esa visión.",
    visionServes: "¿Lo que está viendo sirve a la visión tal como usted la describió?",
    visionServesPlaceholder: "En qué acierta y en qué se queda corto.",
    visionMissing: "¿Qué hay en su visión que todavía no ve aquí?",
    visionMissingPlaceholder:
      "La serie, los personajes, los libros, la ropa, el programa escolar. Cualquier cosa que no hayamos contemplado.",

    s3: "3. El sitio público",
    s3lede: "Lo primero que ven las familias y las escuelas.",
    websiteLikes: "¿Qué está funcionando?",
    websiteChanges: "¿Qué cambiaría?",
    websiteChangesPlaceholder:
      "Textos, imágenes, el orden de la página, cualquier cosa que no suene a su marca.",

    s4: "4. La plataforma",
    s4lede:
      "El fundamento, el flujo de inscripción, el panel de impacto, la pantalla de contenido y la consola del equipo.",
    platformLikes: "¿Qué está funcionando?",
    platformChanges: "¿Qué no está bien?",
    platformChangesPlaceholder:
      "Sea directo. Algo que está mal hoy sale barato. Lo mismo dentro de tres meses, no.",
    hopes: "¿Qué más espera ver?",
    hopesPlaceholder:
      "Cosas que esperaba, cosas que se le han ocurrido después, cosas que quiere a continuación.",

    s5: "5. Plazos",
    s5lede: "La fecha importa menos que lo que hay detrás. Cuéntenos las dos cosas.",
    goLiveDate: "Fecha objetivo de lanzamiento",
    goLiveDriver: "¿Qué determina esa fecha?",
    goLiveDriverPlaceholder:
      "El curso escolar, un evento de lanzamiento, el plazo de un donante, una temporada. Lo que de verdad haya detrás.",
    priority: "Si sólo pudiera terminarse una cosa primero, ¿cuál sería?",
    priorityChoose: "Elija una",
    pEvents: "Eventos: inscripción, recordatorios, asistencia",
    pContent: "Contenido: una grabación convertida en muchas piezas",
    pSchools: "Escuelas: listas y programas escolares",
    pImpact: "Informes de impacto: lo que podemos demostrar a los donantes",
    pPublicSite: "El sitio público: lo primero que ven las familias",
    pNotSure: "Todavía no lo sé",

    s6: "6. Reglas y aprobaciones",
    s6lede:
      "Tres respuestas que necesitamos antes de redactar o publicar nada en su nombre. Se escriben más rápido de lo que se discuten.",
    approver: "¿Quién aprueba el contenido cuando usted no está disponible?",
    approverPlaceholder: "Un nombre, o «nadie, que espere a que yo lo vea».",
    guardrails: "¿Qué no debe decir ni hacer nunca la IA en su nombre?",
    guardrailsPlaceholder:
      "Palabras que usted nunca usa, afirmaciones que nunca hace, cualquier cosa sobre los niños que esté fuera de límites.",
    channels: "¿Qué dos canales importan más al principio?",
    channelsPlaceholder: "Por ejemplo: Facebook y correo. O LinkedIn e Instagram.",
    anythingElse: "Cualquier otra cosa",
    anythingElsePlaceholder: "Lo que no haya cabido arriba.",

    submit: "Enviar mi valoración",
    sending: "Enviando…",
    needName: "Añada su nombre para saber de quién es esta valoración.",
    failed:
      "No se pudo enviar. Inténtelo una vez más y, si sigue fallando, envíeselo a Jacques por correo.",
    thanksTitle: "Gracias. Queda registrado.",
    thanksBody:
      "Sus respuestas quedan guardadas junto al proyecto, con la fecha de hoy. Nada de esto desaparece en una bandeja de entrada. Trabajaremos a partir de ello y le responderemos punto por punto.",
    thanksNext: "Volver a la plataforma",
    savedLocal:
      "Guardado localmente: no se pudo alcanzar la base de datos, así que abajo tiene una copia en pantalla. Envíesela a Jacques para que no se pierda nada.",
  },
};

export const COPY: Record<Locale, Copy> = { en, es };

export function t(locale: string): Copy {
  return isLocale(locale) ? COPY[locale] : COPY.en;
}
