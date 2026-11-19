/**
 * The website concierge: scripted, grounded answers only.
 *
 * Every answer below comes from what is already published on the site.
 * Nothing is generated, so the concierge cannot invent a price, a date or
 * a promise. Two checks run before anything else:
 *
 *   1. Safety. A message that sounds like someone in danger gets 911 and
 *      988 straight away and raises an urgent alert for the team.
 *   2. Children. Mark's rule is that I AM 4 Kids never talks directly with
 *      children. A message that sounds like a child gets a kind answer
 *      that sends them to a grown-up, and nothing else.
 */
export type Flag = "crisis" | "child" | "handoff" | null;
export interface Answer {
  reply: string;
  flag: Flag;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’']/g, "'");

const CRISIS = [
  /suicid/, /kill (him|her|my|them)sel/, /\bkill myself\b/, /want(s)? to die/, /wants? to end (it|his life|her life|my life)/,
  /hurt(ing)? (him|her|my|them)sel/, /self[- ]?harm/, /\bcutting\b/, /overdos/, /\babus(e|ed|ing)\b/, /molest/,
  /\bhit(s|ting)? me\b/, /\bunsafe\b/, /\bin danger\b/, /\bemergency\b/, /\b911\b/,
  /matarse/, /matarme/, /quiere morir/, /quiero morir/, /hacerse dano/, /hacerme dano/, /lastimarse/, /lastimarme/,
  /\babuso\b/, /maltrat/, /\bpeligro\b/, /emergencia/,
];

const CHILD = [
  /\bi('?m| am) (\d|1[0-2])\b/, /\bi('?m| am) (\d|1[0-2]) (years|yrs|year)/, /\bmy (mom|mommy|dad|daddy|teacher) (said|says|won't|wont|is)\b/,
  /\bi('?m| am) in (\d|1st|2nd|3rd|4th|5th|6th|first|second|third|fourth|fifth|sixth) grade\b/,
  /\btengo (\d|1[0-2]) anos\b/, /\bmi (mama|papa|maestra|maestro) (dice|dijo|no me)\b/,
];

const SPANISH = /\b(hola|que|programa|programas|precio|precios|escuela|escuelas|nino|ninos|hijo|hija|gracias|como|cuanto|cuando|donde|quiero|tengo|familia|espanol|ayuda|usted|para)\b|[¿¡ñ]/;

export function detectLocale(message: string, pageLocale: "en" | "es"): "en" | "es" {
  const m = norm(message);
  if (/programs in english|in english\??$/.test(m)) return "en";
  if (SPANISH.test(m) || /[¿¡ñáéíóú]/.test(message.toLowerCase())) return "es";
  if (/\b(the|what|how|much|school|program|price|when|where|who|is|are|my|do|you)\b/.test(m)) return "en";
  return pageLocale;
}

type Topic = { test: RegExp; en: string; es: string; flag?: Flag };

const CONTACT_EN = "Leave your details on the Get Started page and a real person follows up within one business day.";
const CONTACT_ES = "Deja tus datos en la página Comenzar y una persona del equipo te contacta en un día hábil.";

const TOPICS: Topic[] = [
  {
    test: /(talk|speak|chat) (to|with) (a |an )?(person|human|someone|real)|call me|phone number|human|hablar con (una )?persona|llamar|llamenme|telefono/,
    en: `Of course. ${CONTACT_EN} You can open it with the "Talk to a person" link below.`,
    es: `Claro. ${CONTACT_ES} Puedes abrirla con el enlace "Hablar con una persona" de abajo.`,
    flag: "handoff",
  },
  {
    test: /school|principal|teacher|educator|district|classroom|assembly|escuela|director|maestr|educador|distrito|asamblea/,
    en: "For schools there are two options. Program Only is $2,500 per school: a complete, school-led implementation. Program + Live Launch Day is $6,500 per school and adds a live schoolwide launch with founder Mark Papadas. Travel outside Central Florida is billed separately. The Schools page has the details and a short form to start a conversation.",
    es: "Para escuelas hay dos opciones. Solo Programa cuesta $2,500 por escuela: una implementación completa dirigida por la escuela. Programa + Día de Lanzamiento en Vivo cuesta $6,500 por escuela e incluye un lanzamiento en vivo con el fundador Mark Papadas. Los viajes fuera del centro de Florida se cobran aparte. La página Escuelas tiene los detalles y un formulario corto.",
  },
  {
    test: /roundtable|mastermind|academy|academia/,
    en: "The Roundtable is $99 a month: a family mastermind with live sessions with Mark Papadas every two weeks, expert guests, and the full Family Pack included. The price is locked in for life. The Academy is $4,995 a year and adds weekly expert sessions. Anything you have already paid is credited when you upgrade.",
    es: "El Roundtable cuesta $99 al mes: un mastermind familiar con sesiones en vivo con Mark Papadas cada dos semanas, expertos invitados y el Family Pack completo incluido. El precio queda congelado de por vida. La Academia cuesta $4,995 al año y añade sesiones semanales con expertos. Todo lo que ya pagaste se acredita al subir de nivel.",
  },
  {
    test: /reset|sunday|webinar|free|training|domingo|gratis|gratuito|seminario/,
    en: "The Sunday Night Family Reset is a free 45-minute live experience for parents, educators, and anyone who wants to empower kids, every other Sunday at 7 PM Eastern. You can reserve a free seat from the home page.",
    es: "El Sunday Night Family Reset es una experiencia gratuita de 45 minutos en vivo para padres, educadores y cualquiera que quiera empoderar a los niños, cada dos domingos a las 7 PM hora del Este. Puedes reservar tu lugar gratis desde la página de inicio.",
  },
  {
    test: /family pack|price|pricing|cost|how much|program|age|year[- ]old|kid|child|son|daughter|precio|cuesta|cuanto|programa|edad|anos|nino|hijo|hija/,
    en: "For families there are three paths. The Family Pack is $495 for a 4-week experience that starts the first Monday of every month, with 10 families per cohort. The Roundtable is $99 a month and includes the Family Pack. The Academy is $4,995 a year. Programs are designed for kids ages 7 to 12, with parents in the journey. There is also a free Sunday Night Family Reset. Which one should I tell you more about?",
    es: "Para familias hay tres caminos. El Family Pack cuesta $495 por una experiencia de 4 semanas que empieza el primer lunes de cada mes, con 10 familias por grupo. El Roundtable cuesta $99 al mes e incluye el Family Pack. La Academia cuesta $4,995 al año. Los programas están pensados para niños de 7 a 12 años, con los padres en el camino. También hay un Sunday Night Family Reset gratuito. ¿Sobre cuál te cuento más?",
  },
  {
    test: /mark|papadas|founder|who (started|runs|is behind)|fundador/,
    en: "I AM 4 Kids was founded by Mark Papadas, an award-winning speaker and author with over two decades in personal development, including work alongside Zig Ziglar and Brian Tracy. The Founder page tells his story.",
    es: "I AM 4 Kids fue fundado por Mark Papadas, conferencista galardonado y autor con más de dos décadas en desarrollo personal, incluyendo trabajo junto a Zig Ziglar y Brian Tracy. La página El Fundador cuenta su historia.",
  },
  {
    test: /framework|method|steps|how does it work|what is i am|metodo|pasos|como funciona/,
    en: "The I AM 4 Kids framework is five steps from belief to action: Identity (who I believe I am), Beliefs (what I believe is possible), Actions (the habits I practice), Confidence (the courage to keep trying) and Impact (using my strengths to help others).",
    es: "El método I AM 4 Kids son cinco pasos de la creencia a la acción: Identidad (quién creo que soy), Creencias (lo que creo posible), Acciones (los hábitos que practico), Confianza (el valor de seguir intentando) e Impacto (usar mis fortalezas para ayudar a otros).",
  },
  {
    test: /spanish|espanol|en espanol/,
    en: "Yes, you can write to us in Spanish and the whole site is available in Spanish. To find out which programs run in Spanish, leave your details on the Get Started page and choose Spanish as your language.",
    es: "Sí. Puedes escribirnos en español y todo el sitio está en español. Para saber qué programas se ofrecen en español, deja tus datos en la página Comenzar y elige español como idioma.",
  },
  {
    test: /contact|email|reach|get started|sign up|enroll|register|contacto|correo|inscrib|registr|comenzar/,
    en: CONTACT_EN,
    es: CONTACT_ES,
  },
  {
    test: /^(hi|hello|hey|good (morning|afternoon|evening)|hola|buenas|buenos dias)\b/,
    en: "Hello! I can help with family programs, school options, pricing, or the free Sunday Family Reset. What would you like to know?",
    es: "¡Hola! Te ayudo con programas familiares, opciones para escuelas, precios o el Family Reset gratuito del domingo. ¿Qué te gustaría saber?",
  },
];

export function answer(message: string, pageLocale: "en" | "es"): Answer & { locale: "en" | "es" } {
  const m = norm(message);
  const locale = detectLocale(message, pageLocale);
  const es = locale === "es";

  const child = CHILD.some((r) => r.test(m));
  if (CRISIS.some((r) => r.test(m))) {
    const reply = child
      ? es
        ? "Gracias por contarlo. Por favor dile ahora mismo a un adulto de confianza. Si alguien está en peligro, llama al 911. También puedes llamar o enviar un mensaje al 988, a cualquier hora."
        : "Thank you for telling us. Please tell a grown-up you trust right now. If anyone is in danger, call 911. You can also call or text 988, any time."
      : es
        ? "Si alguien está en peligro inmediato, llama al 911 ahora. Para una crisis emocional o pensamientos de hacerse daño, llama o envía un mensaje al 988 (Línea de Crisis y Suicidio, 24 horas, en español). Soy un asistente automático, así que acabo de avisar a nuestro equipo para que una persona revise esta conversación."
        : "If anyone is in immediate danger, please call 911 now. For an emotional crisis or thoughts of self-harm, call or text 988 (the Suicide & Crisis Lifeline, 24/7, Spanish available). I'm an automated assistant, so I've alerted our team so a person can review this conversation.";
    return { reply, flag: "crisis", locale };
  }
  if (child) {
    return {
      reply: es
        ? "¡Gracias por escribir! Este chat es para adultos. Pídele a tu mamá, tu papá u otro adulto de confianza que nos escriba contigo. Y recuerda: ¡tú eres grande!"
        : "Thanks for writing! This chat is for grown-ups. Please ask a parent or another adult you trust to write to us with you. And remember: you are great!",
      flag: "child",
      locale,
    };
  }

  for (const t of TOPICS) {
    if (t.test.test(m)) return { reply: es ? t.es : t.en, flag: t.flag ?? null, locale };
  }
  return {
    reply: es
      ? `Buena pregunta. Una persona del equipo puede darte una respuesta completa. ${CONTACT_ES}`
      : `Good question. A person on our team can give you a complete answer. ${CONTACT_EN}`,
    flag: null,
    locale,
  };
}
