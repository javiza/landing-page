import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Inter,
  Poppins,
  Roboto,
  Montserrat,
  Lato,
  Open_Sans,
  Nunito,
  Raleway,
  Work_Sans,
  Source_Sans_3,
  DM_Sans,
  Space_Grotesk,
  Playfair_Display,
  Merriweather,
  Oswald,
} from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { createClient } from "../lib/supabase/server";
import { DEFAULT_SETTINGS, type SiteSettings } from "../types/settings";
import { FONT_VAR, resolveTypographyFont } from "../lib/fonts";

// El home lee configuración desde Supabase (cookies()), así que debe
// renderizarse en cada request. Sin esto Next lo congela como estático
// desde el build y los cambios guardados en el panel admin no se ven
// en producción hasta el próximo deploy.
export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Las opciones del selector de tipografía del panel admin (nombre del
// sitio, encabezados y texto general). next/font exige que las fuentes
// se declaren de forma estática, así que se cargan TODAS y se elige
// cuál queda activa por cada rol vía variables CSS (--font-site,
// --font-heading), ver FONT_VAR en lib/fonts.ts.
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "600", "800"],
});
const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "600", "800"],
});
const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});
const openSans = Open_Sans({ variable: "--font-open-sans", subsets: ["latin"] });
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "800"],
});
const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  weight: ["400", "600", "800"],
});
const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["400", "600", "800"],
});
const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "600", "800"],
});
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "800"],
});
const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});
const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

// Configura esta variable de entorno (NEXT_PUBLIC_SITE_URL) con el dominio
// final de cada sitio que se arriende. Si no está definida, se usa un
// valor de desarrollo local para que el proyecto siga funcionando.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Lee la configuración del sitio de forma segura: si Supabase no está
// disponible todavía, se usan los valores por defecto y el sitio se ve
// exactamente igual que antes.
async function getSettings(): Promise<SiteSettings> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    return data ? { ...DEFAULT_SETTINGS, ...data } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const title = settings.browser_tab_title || DEFAULT_SETTINGS.browser_tab_title;
  const siteName = settings.site_name || DEFAULT_SETTINGS.site_name;
  const description = settings.meta_description || DEFAULT_SETTINGS.meta_description;
  const ogImage = settings.logo_dark_url || "/logo-dark.png";

  return {
    metadataBase: new URL(SITE_URL),

    title: {
      default: title,
      template: `%s | ${siteName}`,
    },

    description,

    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,

    alternates: {
      canonical: "/",
    },

    icons: {
      icon: settings.favicon_url || "/favicon.ico",
      shortcut: settings.favicon_url || "/favicon.ico",
    },

    openGraph: {
      title,
      description,
      url: SITE_URL,
      siteName,
      locale: "es_CL",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 500,
          height: 300,
          alt: siteName,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const siteName = settings.site_name || DEFAULT_SETTINGS.site_name;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: SITE_URL,
    sameAs: [settings.github_url, settings.linkedin_url].filter(Boolean),
  };

  // Tipografía: cada rol puede quedar en "inherit" (usar el rol de abajo)
  // o fijar una tipografía propia. La cadena es site_title -> headings ->
  // body -> Geist, así que por defecto (todo en "inherit"/"geist") el
  // sitio se ve exactamente igual que antes de tener este control.
  const typography = settings.typography ?? DEFAULT_SETTINGS.typography;
  const bodyFont = resolveTypographyFont(typography.body, FONT_VAR.geist);
  const headingFont = resolveTypographyFont(typography.headings, bodyFont);
  const headingColor = typography.headings.color || "inherit";

  // @font-face para las tipografías propias subidas desde el panel (una
  // por rol como máximo). Se deduplican por nombre de familia por si dos
  // roles usan el mismo archivo subido.
  const customFonts = [typography.site_title, typography.headings, typography.body].filter(
    (t) => t.font_family === "custom" && t.custom_font_url && t.custom_font_name
  );
  const seenFontNames = new Set<string>();
  const fontFaceRules = customFonts
    .filter((t) => {
      if (seenFontNames.has(t.custom_font_name)) return false;
      seenFontNames.add(t.custom_font_name);
      return true;
    })
    .map(
      (t) => `
    @font-face {
      font-family: "${t.custom_font_name}";
      src: url("${t.custom_font_url}");
      font-display: swap;
    }`
    )
    .join("\n");

  // Colores, tipografía y color de texto guardados en Supabase, aplicados
  // como variables CSS en :root/.dark para que globals.css (vía
  // @theme inline) los convierta en utilidades reales: bg-background,
  // text-foreground, bg-card, bg-brand, font-sans. Van en un <style> del
  // <head> porque body, que pinta el fondo, es ancestro del contenido.
  // Todo es color plano; el fondo de las tarjetas (--card-bg) es propio,
  // independiente del fondo de página.
  const cssVars = `
    ${fontFaceRules}
    :root {
      --background: ${settings.background_light};
      --foreground: ${settings.text_color_light};
      --brand-primary: ${settings.primary_color};
      --brand-secondary: ${settings.secondary_color};
      --card-bg: ${settings.card_bg_light};
      --font-site: ${bodyFont};
      --font-heading: ${headingFont};
      --heading-color: ${headingColor};
    }
    .dark {
      --background: ${settings.background_dark};
      --foreground: ${settings.text_color_dark};
      --card-bg: ${settings.card_bg_dark};
    }
  `;

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: cssVars }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${poppins.variable} ${roboto.variable} ${montserrat.variable} ${lato.variable} ${openSans.variable} ${nunito.variable} ${raleway.variable} ${workSans.variable} ${sourceSans.variable} ${dmSans.variable} ${spaceGrotesk.variable} ${playfair.variable} ${merriweather.variable} ${oswald.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers defaultTheme={settings.default_theme}>{children}</Providers>
      </body>
    </html>
  );
}
