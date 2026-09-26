import type { BuiltinFontKey, TypographyStyle } from "../types/settings";

// Une cada key del catálogo (types/settings.ts) con la variable CSS que
// define next/font/google en layout.tsx. Vive en un archivo aparte
// (sin "use client") para poder importarse tanto desde el layout
// (Server Component) como desde HomeClient (Client Component).
export const FONT_VAR: Record<BuiltinFontKey, string> = {
  geist: "var(--font-geist-sans)",
  inter: "var(--font-inter)",
  poppins: "var(--font-poppins)",
  roboto: "var(--font-roboto)",
  montserrat: "var(--font-montserrat)",
  lato: "var(--font-lato)",
  opensans: "var(--font-open-sans)",
  nunito: "var(--font-nunito)",
  raleway: "var(--font-raleway)",
  worksans: "var(--font-work-sans)",
  sourcesans: "var(--font-source-sans)",
  dmsans: "var(--font-dm-sans)",
  spacegrotesk: "var(--font-space-grotesk)",
  playfair: "var(--font-playfair)",
  merriweather: "var(--font-merriweather)",
  oswald: "var(--font-oswald)",
};

// Resuelve el valor final de font-family en CSS para un rol de
// tipografía. "fallback" es lo que corresponde usar cuando el rol está
// en "inherit" (o no tiene tipografía subida todavía en el caso
// "custom"), para que la cadena site_title -> headings -> body siempre
// termine en algo válido.
export function resolveTypographyFont(style: TypographyStyle, fallback: string): string {
  if (style.font_family === "custom") {
    return style.custom_font_name ? `"${style.custom_font_name}"` : fallback;
  }
  if (!style.font_family || style.font_family === "inherit") return fallback;
  return FONT_VAR[style.font_family] ?? fallback;
}
