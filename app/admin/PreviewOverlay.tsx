"use client";

import { useState } from "react";
import { FaTimes, FaDesktop, FaMobileAlt } from "react-icons/fa";
import HomeClient from "../HomeClient";
import type { SiteSettings } from "../../types/settings";

export default function PreviewOverlay({
  settings,
  onClose,
}: {
  settings: SiteSettings;
  onClose: () => void;
}) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex flex-col">
      {/* BARRA SUPERIOR */}
      <div className="z-[110] flex items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-white dark:bg-[#0f0a24] border-b border-gray-200 dark:border-purple-800/60 shadow-md">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-purple-200">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            Vista previa en vivo
          </span>
          <span className="hidden sm:inline text-xs text-gray-500 dark:text-gray-400">
            Estos cambios aún no se han guardado
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 rounded-full p-1">
            <button
              onClick={() => setDevice("desktop")}
              className={`px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 transition ${
                device === "desktop"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-300"
              }`}
            >
              <FaDesktop size={11} /> Escritorio
            </button>
            <button
              onClick={() => setDevice("mobile")}
              className={`px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 transition ${
                device === "mobile"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-300"
              }`}
            >
              <FaMobileAlt size={11} /> Móvil
            </button>
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-full border border-red-400 text-red-500 hover:bg-red-500 hover:text-white transition"
          >
            <FaTimes size={12} /> Cerrar
          </button>
        </div>
      </div>

      {/* LIENZO DE VISTA PREVIA */}
      <div className="flex-1 overflow-y-auto bg-gray-200 dark:bg-black/40 py-6">
        <div
          className={`mx-auto bg-background shadow-2xl transition-all duration-300 ${
            device === "mobile" ? "w-[390px] rounded-[2rem] overflow-hidden" : "w-full"
          }`}
        >
          <HomeClient settings={settings} />
        </div>
      </div>
    </div>
  );
}
