"use client";

import { useState } from "react";
import { LANGUAGES, type LangCode } from "../../lib/i18n";

export default function LanguageSwitcher({
  lang,
  onChange,
  label,
}: {
  lang: LangCode;
  onChange: (next: LangCode) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  return (
    <div className="fixed top-5 left-5 z-50">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={label}
        title={label}
        className="p-3 rounded-full shadow-lg bg-card border border-card-border text-foreground hover:scale-110 transition-all flex items-center gap-1"
      >
        <span className="text-lg leading-none">{current.flag}</span>
      </button>

      {open && (
        <>
          {/* Capa invisible para cerrar el menú al hacer click afuera */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 mt-2 z-50 bg-card border border-card-border rounded-xl shadow-lg overflow-hidden min-w-[9rem]">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  onChange(l.code);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition ${
                  l.code === lang
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100 dark:hover:bg-white/5 text-foreground"
                }`}
              >
                <span>{l.flag}</span> {l.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
