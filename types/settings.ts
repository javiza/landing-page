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

  // Tipografía
  font_family: "geist" | "inter" | "poppins" | "roboto";

  // Modo oscuro / efectos visuales
  default_theme: "light" | "dark";
  enable_effects: boolean; // partículas de fondo + animaciones extra

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

  // Banner / Slider (imágenes con texto opcional)
  banner_images: { url: string; caption?: string }[];

  // Sobre mí / Sobre el negocio
  about_title: string;
  about_text: string;
  about_highlight: string;
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

  // Noticias / novedades (opcional, se muestran si hay al menos una)
  news: { title: string; content: string; date?: string }[];

  // Visibilidad de secciones (todo opcional, como pidió el usuario)
  show_about: boolean;
  show_services: boolean;
  show_stack: boolean;
  show_projects: boolean;
  show_news: boolean;
  show_banner: boolean;
  show_contact: boolean;

  // Orden de las secciones principales en el home
  section_order: (
    | "about"
    | "services"
    | "stack"
    | "projects"
    | "news"
    | "contact"
  )[];
};

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

  font_family: "geist",

  default_theme: "light",
  enable_effects: true,

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

  banner_images: [],

  about_title: "Sobre mí / Sobre nosotros",
  about_text:
    "Cuenta aquí quién eres, a qué te dedicas y qué te diferencia. Este texto se edita desde el panel de administración y se adapta a cualquier profesión o negocio.",
  about_highlight: "Tu especialidad o valor diferencial",
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

  news: [],

  show_about: true,
  show_services: true,
  show_stack: true,
  show_projects: true,
  show_news: false,
  show_banner: false,
  show_contact: true,

  section_order: ["about", "services", "stack", "projects", "news", "contact"],
};
