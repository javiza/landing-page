import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Poppins, Roboto } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { createClient } from "../lib/supabase/server";
import { DEFAULT_SETTINGS, type SiteSettings } from "../types/settings";

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

// Las 4 opciones del selector de tipografía del panel admin. next/font
// exige que las fuentes se declaren de forma estática, así que se cargan
// las cuatro y se elige cuál queda activa vía la variable CSS --font-site.
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

const FONT_VAR: Record<SiteSettings["font_family"], string> = {
  geist: "var(--font-geist-sans)",
  inter: "var(--font-inter)",
  poppins: "var(--font-poppins)",
  roboto: "var(--font-roboto)",
};

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

  // Colores, tipografía y color de texto guardados en Supabase, aplicados
  // como variables CSS en :root/.dark para que globals.css (vía
  // @theme inline) los convierta en utilidades reales: bg-background,
  // text-foreground, bg-card, bg-brand, font-sans. Van en un <style> del
  // <head> porque body, que pinta el fondo, es ancestro del contenido.
  // Todo es color plano; el fondo de las tarjetas (--card-bg) es propio,
  // independiente del fondo de página.
  const cssVars = `
    :root {
      --background: ${settings.background_light};
      --foreground: ${settings.text_color_light};
      --brand-primary: ${settings.primary_color};
      --brand-secondary: ${settings.secondary_color};
      --card-bg: ${settings.card_bg_light};
      --font-site: ${FONT_VAR[settings.font_family] ?? FONT_VAR.geist};
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
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${poppins.variable} ${roboto.variable} antialiased`}
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
