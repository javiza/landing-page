"use client";

// Traductor automático de Google (el mismo widget que usa la extensión
// "Google Translate" del navegador, pero embebido directo en la página).
// Traduce TODO el contenido visible del sitio, incluido lo que el
// administrador escribe en el panel (títulos, descripciones, proyectos,
// etc.), a diferencia del selector de idioma propio que solo traduce los
// textos fijos de la interfaz.

import { useEffect } from "react";

declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement: any;
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

// Cambia el idioma del widget de Google desde afuera (por ejemplo, cuando
// el visitante toca una bandera del selector propio). Internamente Google
// arma un <select class="goog-te-combo"> oculto; cambiarle el valor y
// disparar el evento "change" es la forma en que cualquier sitio controla
// el widget de forma programática. Como el widget puede tardar unos
// instantes en cargar/montarse, reintenta varias veces antes de rendirse.
export function setGoogleTranslateLanguage(lang: string) {
  const trySet = () => {
    const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
    if (combo && combo.value !== lang) {
      combo.value = lang;
      combo.dispatchEvent(new Event("change"));
      return true;
    }
    return Boolean(combo);
  };

  if (trySet()) return;

  let attempts = 0;
  const interval = setInterval(() => {
    attempts += 1;
    if (trySet() || attempts > 20) clearInterval(interval);
  }, 300);
}

export default function GoogleTranslate({ pageLanguage = "es" }: { pageLanguage?: string }) {
  useEffect(() => {
    // Evita cargar el script dos veces si el componente se vuelve a montar.
    if (document.getElementById("google-translate-script")) return;

    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage,
            autoDisplay: false,
            layout: 0, // SIMPLE: solo un select, sin la barra completa de Google
          },
          "google_translate_element"
        );
      }
    };

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }, [pageLanguage]);

  return (
    <>
      {/* Ajustes de estilo para que el widget de Google se vea integrado con
          el diseño del sitio en vez del recuadro genérico que trae por
          defecto (y para que no empuje toda la página hacia abajo cuando
          se activa una traducción). */}
      <style>{`
        body { top: 0 !important; }
        .goog-te-banner-frame { display: none !important; }
        .goog-te-gadget { font-size: 0 !important; line-height: 0 !important; }
        .goog-te-gadget .goog-te-combo {
          font-size: 13px !important;
          line-height: normal !important;
          padding: 8px 12px !important;
          border-radius: 9999px !important;
          border: 1px solid var(--card-border, #ddd) !important;
          background-color: var(--card, #fff) !important;
          color: var(--foreground, #111) !important;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15) !important;
          cursor: pointer !important;
        }
      `}</style>
      <div
        id="google_translate_element"
        className="fixed top-20 left-5 z-50"
        title="Traducir con Google"
      />
    </>
  );
}
