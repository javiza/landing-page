// Selector de idioma del portafolio (visitante). Traduce el texto FIJO de
// la interfaz (botones, placeholders, mensajes del formulario, etc.).
// El contenido que el administrador escribe en el panel (títulos,
// descripciones, servicios, proyectos...) se muestra tal como fue
// ingresado, ya que ese texto es 100% libre y editable por el dueño del
// sitio; traducirlo automáticamente requeriría guardar una versión por
// idioma de cada campo, lo que puede agregarse más adelante si se
// necesita.

export type LangCode = "es" | "en" | "pt" | "hi";

export const LANGUAGES: { code: LangCode; label: string; flag: string }[] = [
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
];

type Dict = Record<string, string>;

export const TRANSLATIONS: Record<LangCode, Dict> = {
  es: {
    theme_toggle: "Cambiar tema",
    language_toggle: "Cambiar idioma",
    prev_image: "Imagen anterior",
    next_image: "Imagen siguiente",
    go_to_image: "Ir a la imagen",
    project_alt: "Proyecto",
    logo_alt: "Logo",
    form_name: "Tu nombre",
    form_email: "Tu correo",
    form_message: "Mensaje...",
    form_submit: "Enviar mensaje",
    form_sending: "Enviando...",
    form_success: "¡Mensaje enviado!",
    form_error: "Error al enviar.",
    back_to_top: "Volver arriba",
    news_expand_image: "Ampliar imagen de la noticia",
    close_image: "Cerrar",
  },
  en: {
    theme_toggle: "Toggle theme",
    language_toggle: "Change language",
    prev_image: "Previous image",
    next_image: "Next image",
    go_to_image: "Go to image",
    project_alt: "Project",
    logo_alt: "Logo",
    form_name: "Your name",
    form_email: "Your email",
    form_message: "Message...",
    form_submit: "Send message",
    form_sending: "Sending...",
    form_success: "Message sent!",
    form_error: "Something went wrong.",
    back_to_top: "Back to top",
    news_expand_image: "Enlarge news image",
    close_image: "Close",
  },
  pt: {
    theme_toggle: "Alternar tema",
    language_toggle: "Mudar idioma",
    prev_image: "Imagem anterior",
    next_image: "Próxima imagem",
    go_to_image: "Ir para a imagem",
    project_alt: "Projeto",
    logo_alt: "Logo",
    form_name: "Seu nome",
    form_email: "Seu e-mail",
    form_message: "Mensagem...",
    form_submit: "Enviar mensagem",
    form_sending: "Enviando...",
    form_success: "Mensagem enviada!",
    form_error: "Erro ao enviar.",
    back_to_top: "Voltar ao topo",
    news_expand_image: "Ampliar imagem da notícia",
    close_image: "Fechar",
  },
  hi: {
    theme_toggle: "थीम बदलें",
    language_toggle: "भाषा बदलें",
    prev_image: "पिछली तस्वीर",
    next_image: "अगली तस्वीर",
    go_to_image: "तस्वीर पर जाएं",
    project_alt: "प्रोजेक्ट",
    logo_alt: "लोगो",
    form_name: "आपका नाम",
    form_email: "आपका ईमेल",
    form_message: "संदेश...",
    form_submit: "संदेश भेजें",
    form_sending: "भेजा जा रहा है...",
    form_success: "संदेश भेज दिया गया!",
    form_error: "भेजने में समस्या हुई।",
    back_to_top: "ऊपर जाएं",
    news_expand_image: "समाचार की तस्वीर बड़ी करें",
    close_image: "बंद करें",
  },
};

export const LANG_STORAGE_KEY = "portafolio_lang";

// Mapa simple de país/idioma del navegador -> uno de nuestros idiomas
// soportados. Si el idioma del visitante no está en la lista, se usa
// español por defecto.
export function detectDefaultLanguage(): LangCode {
  if (typeof navigator === "undefined") return "es";
  const raw = navigator.language || "es";
  const base = raw.toLowerCase().slice(0, 2);
  if (base === "en") return "en";
  if (base === "pt") return "pt";
  if (base === "hi") return "hi";
  return "es";
}

export function translate(lang: LangCode, key: string): string {
  return TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.es[key] ?? key;
}
