export type SkillItem = { name: string; icon: string };
export type StackFact = { label: string; value: string };
export type ServiceItem = { title: string; description: string };
export type ProjectItem = {
  title: string;
  description: string;
  link?: string;
  linkLabel?: string;
  color?: string;
};

// Sección 100% personalizada creada desde el panel: título libre +
// texto libre. Se identifica con un id único que no cambia aunque se
// renombre el título (así "section_order" no se rompe al renombrar).
export type CustomSection = {
  id: string;
  title: string;
  content: string;
};

export type SiteSettings = {
  // Identidad del sitio
  favicon_url: string;
  browser_tab_title: string;
  site_name: string;
  meta_description: string;

  // Colores
  primary_color: string;
  secondary_color: string;
  background_light: string;
  background_dark: string;

  // Fondo de las tarjetas/módulos, independiente del fondo de página,
  // para que no se confundan entre sí.
  card_bg_light: string;
  card_bg_dark: string;

  // Color del texto (tipografía), por tema.
  text_color_light: string;
  text_color_dark: string;

  // Tipografía
  font_family: "geist" | "inter" | "poppins" | "roboto";

  // Color del texto del efecto de líneas del hero.
  hero_terminal_text_color: string;

  // Botones: TODOS los botones "sólidos" del sitio (portada, servicios,
  // enlaces, proyectos, formulario) comparten estos valores.
  button_bg_color: string;
  button_text_color: string;
  button_shape: "full" | "rounded" | "square";

  // Modo oscuro / efectos visuales
  default_theme: "light" | "dark";
  enable_effects: boolean; // partículas de fondo + animaciones extra

  // Fondos opcionales adicionales a las partículas. Independientes entre
  // sí: se pueden combinar libremente o dejar todos vacíos/apagados.
  hero_bg_image_url: string; // imagen de fondo solo detrás del hero/inicio
  hero_bg_overlay_opacity: number; // 0 a 1, oscurece la imagen del hero para que se lea el texto
  page_bg_image_url: string; // imagen de fondo fija detrás de toda la página
  page_bg_image_opacity: number; // 0 a 1, qué tan visible es la imagen de fondo completa

  // Hero
  hero_title: string;
  hero_subtitle: string;
  hero_terminal_lines: string[];
  hero_button_primary_label: string;
  hero_button_primary_href: string;
  hero_button_secondary_label: string;
  hero_button_secondary_href: string;
  logo_light_url: string;
  logo_dark_url: string;
  // Ancho del logo en píxeles (el alto se ajusta solo para no deformarlo).
  logo_width: number;

  // Banner / Slider (imágenes con texto opcional)
  banner_images: { url: string; caption?: string }[];

  // Sobre mí / Sobre el negocio
  about_section_title: string; // título de la sección completa
  about_title: string;
  about_text: string;
  about_highlights: string[]; // recuadros opcionales (frases destacadas), 100% editables por el admin
  about_soft_skills_title: string;
  about_soft_skills: string[];
  about_stack_title: string;
  about_stack_facts: StackFact[];
  about_focus_label: string;
  about_focus_text: string;
  about_social_title: string;

  // Servicios
  services_title: string;
  services_description: string;
  services_items: ServiceItem[];
  services_cta_label: string;
  services_cta_href: string;

  // Habilidades / Especialidades (grid de íconos, aplica a cualquier rubro)
  stack_title: string;
  stack_items: SkillItem[];

  // Proyectos / Casos / Trabajos realizados
  projects_title: string;
  projects_items: ProjectItem[];

  // Contacto
  contact_title: string;

  // Redes / enlaces profesionales
  github_url: string;
  linkedin_url: string;

  // Footer
  footer_text: string;
  footer_bg_color: string; // color de fondo del footer
  footer_text_color: string; // color del texto del footer

  // Noticias / novedades (opcional, se muestran si hay al menos una)
  news_title: string; // título de la sección completa
  news: { title: string; content: string; date?: string }[];

  // Visibilidad de secciones (todo opcional, como pidió el usuario)
  show_about: boolean;
  show_services: boolean;
  show_stack: boolean;
  show_projects: boolean;
  show_news: boolean;
  show_banner: boolean;
  show_contact: boolean;

  // Secciones 100% personalizadas agregadas desde el panel (además de
  // las fijas de arriba). Se pueden crear, renombrar y eliminar todas
  // las que se quiera.
  custom_sections: CustomSection[];

  // Orden y ubicación de TODOS los módulos del home. Incluye las claves
  // fijas ("about", "services", "stack", "banner", "projects", "news",
  // "contact") y, para las personalizadas, "custom:<id>". Cualquier
  // sección visible que no aparezca aquí se agrega al final.
  section_order: string[];

  // Alineación de cada sección dentro de la página (izquierda, centro o
  // derecha). Usa las mismas claves que section_order. Una sección sin
  // entrada acá se muestra centrada.
  section_align: Record<string, "left" | "center" | "right">;
};

// Claves de las secciones fijas (no personalizadas) del home.
export const BUILTIN_SECTION_KEYS = [
  "about",
  "services",
  "stack",
  "banner",
  "projects",
  "news",
  "contact",
] as const;
export type BuiltinSectionKey = (typeof BUILTIN_SECTION_KEYS)[number];

// Valores por defecto = plantilla genérica en blanco.
// Pensada para que cualquier persona (vendedor, doctor, abogado, etc.)
// pueda arrendar esta landing page y personalizarla sin arrastrar
// contenido de un portafolio de desarrollador (útil para venderla a
// contadores, abogados, doctores, agencias, comercios, etc.).
export const DEFAULT_SETTINGS: SiteSettings = {
  favicon_url: "/favicon.ico",
  browser_tab_title: "Tu Nombre o Negocio | Landing Page",
  site_name: "Tu Nombre o Negocio",
  meta_description:
    "Sitio web profesional para presentar tus servicios, tu experiencia y tus datos de contacto.",

  primary_color: "#2563eb",
  secondary_color: "#9333ea",
  background_light: "#f5f7fa",
  background_dark: "#0b0722",

  card_bg_light: "#ffffff",
  card_bg_dark: "#171233", // un poco más claro que el fondo oscuro, para que se distinga

  text_color_light: "#0f0f0f",
  text_color_dark: "#f0eaff",

  font_family: "geist",

  hero_terminal_text_color: "#22c55e",

  button_bg_color: "#2563eb",
  button_text_color: "#ffffff",
  button_shape: "full",

  default_theme: "light",
  enable_effects: true,

  hero_bg_image_url: "",
  hero_bg_overlay_opacity: 0.55,
  page_bg_image_url: "",
  page_bg_image_opacity: 0.35,

  hero_title: "Tu Nombre o Negocio",
  hero_subtitle: "Una frase corta que resuma lo que ofreces",
  hero_terminal_lines: [
    "$ bienvenido_a_tu_sitio",
    "$ personaliza_cada_seccion",
    "$ listo_para_publicar ✓",
  ],
  hero_button_primary_label: "Ver Proyectos",
  hero_button_primary_href: "#proyectos",
  hero_button_secondary_label: "Contactar",
  hero_button_secondary_href: "#contacto",
  logo_light_url: "/logo-light.png",
  logo_dark_url: "/logo-dark.png",
  logo_width: 280,

  banner_images: [],

  about_section_title: "Sobre mí",
  about_title: "Sobre mí / Sobre nosotros",
  about_text:
    "Cuenta aquí quién eres, a qué te dedicas y qué te diferencia. Este texto se edita desde el panel de administración y se adapta a cualquier profesión o negocio.",
  about_highlights: [], // vacío por defecto: la sección es opcional
  about_soft_skills_title: "Fortalezas",
  about_soft_skills: [
    "Atención al cliente",
    "Puntualidad",
    "Comunicación efectiva",
    "Compromiso con la calidad",
  ],
  about_stack_title: "Datos rápidos",
  about_stack_facts: [
    { label: "Experiencia", value: "Años en el rubro" },
    { label: "Ubicación", value: "Ciudad, País" },
    { label: "Modalidad", value: "Presencial / Online" },
  ],
  about_focus_label: "Enfoque actual:",
  about_focus_text: "Describe brevemente en qué te estás enfocando ahora",
  about_social_title: "Redes y enlaces",

  services_title: "Servicios",
  services_description:
    "Describe brevemente los servicios o productos que ofreces a tus clientes.",
  services_items: [
    {
      title: "Nombre del servicio 1",
      description: "Describe en qué consiste este servicio y qué beneficio entrega.",
    },
    {
      title: "Nombre del servicio 2",
      description: "Describe en qué consiste este servicio y qué beneficio entrega.",
    },
    {
      title: "Nombre del servicio 3",
      description: "Describe en qué consiste este servicio y qué beneficio entrega.",
    },
  ],
  services_cta_label: "Solicitar información",
  services_cta_href: "#contacto",

  stack_title: "Habilidades y Especialidades",
  stack_items: [
    { icon: "code", name: "Especialidad 1" },
    { icon: "code", name: "Especialidad 2" },
    { icon: "code", name: "Especialidad 3" },
    { icon: "code", name: "Especialidad 4" },
  ],

  projects_title: "Proyectos y Casos Destacados",
  projects_items: [
    {
      title: "Nombre del proyecto o caso 1",
      description: "Describe brevemente en qué consistió y qué resultado obtuviste.",
    },
    {
      title: "Nombre del proyecto o caso 2",
      description: "Describe brevemente en qué consistió y qué resultado obtuviste.",
    },
  ],

  contact_title: "Contacto:",

  github_url: "",
  linkedin_url: "",

  footer_text: "Tu Nombre o Negocio",
  footer_bg_color: "#111827",
  footer_text_color: "#e5e7eb",

  news_title: "Noticias",
  news: [],

  custom_sections: [],

  show_about: true,
  show_services: true,
  show_stack: true,
  show_projects: true,
  show_news: false,
  show_banner: false,
  show_contact: true,

  section_order: ["about", "services", "stack", "banner", "news", "projects", "contact"],

  section_align: {},
};
