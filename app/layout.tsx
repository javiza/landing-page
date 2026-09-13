import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { createClient } from "../lib/supabase/server";
import { DEFAULT_SETTINGS, type SiteSettings } from "../types/settings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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

  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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
