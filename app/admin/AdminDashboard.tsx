"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaPalette,
  FaHome,
  FaUserAlt,
  FaBriefcase,
  FaLaptopCode,
  FaProjectDiagram,
  FaImages,
  FaNewspaper,
  FaEnvelope,
  FaListOl,
  FaSignOutAlt,
  FaEye,
  FaUndo,
  FaSave,
  FaCheckCircle,
  FaExclamationCircle,
  FaTrash,
  FaImage,
  FaPlus,
  FaEyeSlash,
} from "react-icons/fa";
import { createClient } from "../../lib/supabase/client";
import {
  DEFAULT_SETTINGS,
  BUILTIN_SECTION_KEYS,
  type SiteSettings,
  type BuiltinSectionKey,
} from "../../types/settings";
import PreviewOverlay from "./PreviewOverlay";
import {
  inputClass,
  labelClass,
  FieldRow,
  StringListEditor,
  KeyValueListEditor,
  ServiceItemsEditor,
  SkillItemsEditor,
  ProjectItemsEditor,
  TypographyRoleEditor,
} from "./editors";
import type { TypographyStyle } from "../../types/settings";

// Etiqueta fija de cada sección incorporada, solo para identificarla en el
// panel (el NOMBRE que ve el visitante ahora es 100% editable por sección,
// ver *_title / *_section_title más abajo).
const SECTION_LABELS: Record<BuiltinSectionKey, string> = {
  about: "Sobre mí",
  services: "Servicios",
  stack: "Habilidades y Especialidades",
  banner: "Banner / Slider",
  projects: "Proyectos",
  news: "Noticias",
  contact: "Contacto",
};

// Para cada sección incorporada: en qué campo de settings vive su título
// visible, y qué flag controla si se muestra en el home. Así el tab
// "Secciones y orden" puede mostrar/editar/ocultar cualquier sección sin
// tener que saber sus detalles internos.
const SECTION_TITLE_FIELD: Partial<Record<BuiltinSectionKey, keyof SiteSettings>> = {
  about: "about_section_title",
  services: "services_title",
  stack: "stack_title",
  projects: "projects_title",
  news: "news_title",
  contact: "contact_title",
};

const SECTION_VISIBILITY_FIELD: Record<BuiltinSectionKey, keyof SiteSettings> = {
  about: "show_about",
  services: "show_services",
  stack: "show_stack",
  banner: "show_banner",
  projects: "show_projects",
  news: "show_news",
  contact: "show_contact",
};

const TABS = [
  { key: "identity", label: "Identidad y diseño", icon: <FaPalette /> },
  { key: "backgrounds", label: "Fondos y efectos", icon: <FaImage /> },
  { key: "hero", label: "Portada (Hero)", icon: <FaHome /> },
  { key: "about", label: "Sobre mí", icon: <FaUserAlt /> },
  { key: "services", label: "Servicios", icon: <FaBriefcase /> },
  { key: "stack", label: "Habilidades y Especialidades", icon: <FaLaptopCode /> },
  { key: "projects", label: "Proyectos", icon: <FaProjectDiagram /> },
  { key: "banner", label: "Banner / Slider", icon: <FaImages /> },
  { key: "news", label: "Noticias", icon: <FaNewspaper /> },
  { key: "contact", label: "Contacto y Footer", icon: <FaEnvelope /> },
  { key: "order", label: "Secciones y orden", icon: <FaListOl /> },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function AdminDashboard({
  initialSettings,
  userEmail,
}: {
  initialSettings: SiteSettings;
  userEmail: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [activeTab, setActiveTab] = useState<TabKey>("identity");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [bannerUrlInput, setBannerUrlInput] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  function set<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function uploadImage(file: File, label: string): Promise<string | null> {
    setUploading(label);
    const path = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("site-images")
      .upload(path, file, { upsert: true });

    setUploading(null);

    if (error) {
      setMessage({ text: `Error subiendo imagen: ${error.message}`, ok: false });
      return null;
    }

    const { data } = supabase.storage.from("site-images").getPublicUrl(path);
    return data.publicUrl;
  }

  // Sube un archivo de tipografía (.ttf/.otf/.woff/.woff2) a un bucket
  // aparte del de imágenes, para las tipografías propias que suba el
  // admin en el panel de Tipografía.
  async function uploadFontFile(file: File): Promise<string | null> {
    const path = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("site-fonts")
      .upload(path, file, { upsert: true });

    if (error) {
      setMessage({ text: `Error subiendo tipografía: ${error.message}`, ok: false });
      return null;
    }

    const { data } = supabase.storage.from("site-fonts").getPublicUrl(path);
    return data.publicUrl;
  }

  // Actualiza un rol de tipografía (site_title / headings / body) sin
  // pisar los demás.
  function setTypography(role: keyof SiteSettings["typography"], patch: Partial<TypographyStyle>) {
    setSettings((prev) => ({
      ...prev,
      typography: {
        ...prev.typography,
        [role]: { ...prev.typography[role], ...patch },
      },
    }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from("site_settings")
      .upsert({ id: 1, ...settings });

    setSaving(false);
    setMessage(
      error
        ? { text: `Error al guardar: ${error.message}`, ok: false }
        : { text: "Cambios guardados correctamente", ok: true }
    );

    // Sin esto, el home público seguía mostrando la config vieja hasta
    // el próximo deploy (ver export const dynamic = "force-dynamic" en
    // layout.tsx / page.tsx). router.refresh() vuelve a pedir el RSC
    // payload del layout raíz, que ahora sí se recalcula por request.
    if (!error) {
      router.refresh();
    }
  }

  function handleRestore() {
    const confirmed = window.confirm(
      "¿Restaurar todos los valores por defecto? Se perderá cualquier cambio no guardado. Esto NO se aplicará al sitio hasta que presiones «Guardar cambios»."
    );
    if (!confirmed) return;
    setSettings(DEFAULT_SETTINGS);
    setMessage({ text: "Valores por defecto restaurados (sin guardar aún)", ok: true });
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login/admin");
    router.refresh();
  }

  // section_order puede quedar desactualizado si el sitio se creó antes de
  // que existieran los módulos nuevos (banner, secciones personalizadas).
  // Este arreglo siempre tiene TODAS las claves, en el orden guardado y
  // con lo que falte agregado al final, para que el panel muestre y
  // reordene absolutamente todo.
  const fullOrder = [...settings.section_order];
  for (const key of BUILTIN_SECTION_KEYS) {
    if (!fullOrder.includes(key)) fullOrder.push(key);
  }
  for (const custom of settings.custom_sections) {
    const key = `custom:${custom.id}`;
    if (!fullOrder.includes(key)) fullOrder.push(key);
  }

  function moveSection(index: number, dir: -1 | 1) {
    const order = [...fullOrder];
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= order.length) return;
    [order[index], order[newIndex]] = [order[newIndex], order[index]];
    set("section_order", order);
  }

  // Mueve una sección directamente al principio o al final, sin tener
  // que ir flecha por flecha (útil para reordenar de abajo hacia arriba
  // o viceversa de una sola vez).
  function moveSectionToEdge(index: number, edge: "top" | "bottom") {
    const order = [...fullOrder];
    const [item] = order.splice(index, 1);
    if (edge === "top") order.unshift(item);
    else order.push(item);
    set("section_order", order);
  }

  // Alineación de una sección dentro de la página: centrada (por
  // defecto), o "imantada" a la izquierda o a la derecha.
  function setSectionAlign(key: string, align: "left" | "center" | "right") {
    setSettings((prev) => ({
      ...prev,
      section_align: { ...prev.section_align, [key]: align },
    }));
  }

  function addCustomSection() {
    const id = `sec-${Date.now().toString(36)}`;
    setSettings((prev) => ({
      ...prev,
      custom_sections: [
        ...prev.custom_sections,
        { id, title: "Nueva sección", content: "" },
      ],
      section_order: [...prev.section_order, `custom:${id}`],
    }));
  }

  function renameCustomSection(id: string, title: string) {
    setSettings((prev) => ({
      ...prev,
      custom_sections: prev.custom_sections.map((c) => (c.id === id ? { ...c, title } : c)),
    }));
  }

  function updateCustomSectionContent(id: string, content: string) {
    setSettings((prev) => ({
      ...prev,
      custom_sections: prev.custom_sections.map((c) => (c.id === id ? { ...c, content } : c)),
    }));
  }

  function deleteCustomSection(id: string) {
    const confirmed = window.confirm("¿Eliminar esta sección? Esta acción no se puede deshacer.");
    if (!confirmed) return;
    setSettings((prev) => ({
      ...prev,
      custom_sections: prev.custom_sections.filter((c) => c.id !== id),
      section_order: prev.section_order.filter((k) => k !== `custom:${id}`),
    }));
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ================= TOP BAR ================= */}
      <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-purple-800/50 bg-white/90 dark:bg-[#0b0722]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-500">
              Panel de Administración
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Sesión activa: <span className="font-medium">{userEmail}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-full border border-blue-500 text-blue-600 dark:text-blue-300 hover:bg-blue-600 hover:text-white transition"
            >
              <FaEye size={12} /> Vista previa
            </button>
            <button
              onClick={handleRestore}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-full border border-amber-400 text-amber-600 dark:text-amber-300 hover:bg-amber-500 hover:text-white transition"
            >
              <FaUndo size={12} /> Restaurar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 text-sm px-5 py-2 rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 hover:scale-[1.03] transition-all disabled:opacity-60 disabled:hover:scale-100"
            >
              <FaSave size={12} /> {saving ? "Guardando..." : "Guardar cambios"}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-full border border-red-400 text-red-500 hover:bg-red-500 hover:text-white transition"
            >
              <FaSignOutAlt size={12} /> Salir
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`max-w-7xl mx-auto px-4 sm:px-6 pb-3 -mt-1 flex items-center gap-2 text-sm font-medium ${
              message.ok ? "text-green-600 dark:text-green-400" : "text-red-500"
            }`}
          >
            {message.ok ? <FaCheckCircle /> : <FaExclamationCircle />} {message.text}
          </div>
        )}
      </header>

      {/* ================= CUERPO ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row gap-6">
        {/* NAV LATERAL */}
        <nav className="md:w-64 shrink-0">
          <div className="card p-2 md:sticky md:top-28">
            <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                    activeTab === tab.key
                      ? "bg-blue-600 text-white shadow"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                  }`}
                >
                  <span className="text-base">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* CONTENIDO DE LA PESTAÑA */}
        <main className="flex-1 min-w-0 space-y-6">
          {activeTab === "identity" && (
            <>
              <section className="card space-y-4">
                <h2 className="text-xl font-bold">🖼️ Favicon</h2>
                <p className="text-sm text-gray-500">
                  Es el ícono pequeño que aparece en la pestaña del navegador. Usa una
                  imagen cuadrada (.png o .ico) para mejores resultados.
                </p>
                <div className="flex items-start gap-4">
                  {settings.favicon_url && (
                    <img
                      src={settings.favicon_url}
                      alt="Favicon actual"
                      className="w-10 h-10 object-contain bg-white rounded border p-1 shrink-0"
                    />
                  )}
                  <div className="flex-1 space-y-4">
                    <div className="space-y-1.5">
                      <label className={labelClass}>Opción 1: subir desde tu dispositivo</label>
                      <label
                        htmlFor="favicon-file-input"
                        className={`flex items-center justify-center gap-2 text-sm px-4 py-3 rounded-lg border-2 border-dashed cursor-pointer transition ${
                          uploading === "favicon"
                            ? "border-gray-300 dark:border-purple-700/40 opacity-60 cursor-wait"
                            : "border-blue-400 dark:border-purple-500/60 text-blue-600 dark:text-purple-300 hover:bg-blue-50 dark:hover:bg-white/5"
                        }`}
                      >
                        {uploading === "favicon" ? "Subiendo..." : "📁 Elegir imagen desde el dispositivo"}
                      </label>
                      <input
                        id="favicon-file-input"
                        type="file"
                        accept="image/*"
                        disabled={uploading === "favicon"}
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const url = await uploadImage(file, "favicon");
                          if (url) set("favicon_url", url);
                          e.target.value = "";
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                      <span className="flex-1 h-px bg-gray-200 dark:bg-purple-700/30" />
                      o
                      <span className="flex-1 h-px bg-gray-200 dark:bg-purple-700/30" />
                    </div>
                    <FieldRow label="Opción 2: pegar una URL de imagen">
                      <input
                        value={settings.favicon_url}
                        onChange={(e) => set("favicon_url", e.target.value)}
                        placeholder="https://ejemplo.com/favicon.png"
                        className={inputClass}
                      />
                    </FieldRow>
                  </div>
                </div>
                <FieldRow label="Nombre del sitio / negocio (se usa en el título y en SEO)">
                  <input
                    value={settings.site_name}
                    onChange={(e) => set("site_name", e.target.value)}
                    className={inputClass}
                  />
                </FieldRow>
                <TypographyRoleEditor
                  label="Tipografía del nombre del sitio"
                  hint="Se aplica al título principal (nombre grande) que se ve en la portada. Tamaño, tipo de letra y una tipografía propia si la tienes."
                  value={settings.typography.site_title}
                  onChange={(patch) => setTypography("site_title", patch)}
                  allowInherit
                  showSize
                  showColor
                  onUploadFont={uploadFontFile}
                />
                <FieldRow label="Título de la pestaña del navegador">
                  <input
                    value={settings.browser_tab_title}
                    onChange={(e) => set("browser_tab_title", e.target.value)}
                    className={inputClass}
                  />
                </FieldRow>
                <FieldRow label="Descripción para buscadores (SEO)">
                  <textarea
                    value={settings.meta_description}
                    onChange={(e) => set("meta_description", e.target.value)}
                    rows={2}
                    className={inputClass}
                  />
                </FieldRow>
              </section>

              <section className="card space-y-4">
                <h2 className="text-xl font-bold">🎨 Colores</h2>
                <p className="text-sm text-foreground/60">
                  &quot;Fondo&quot; es el color de la página. &quot;Tarjetas&quot; es el
                  color de los recuadros/módulos que van encima (habilidades,
                  servicios, proyectos). Usa uno claramente distinto al
                  fondo de su mismo tema para que no se confundan.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {(
                    [
                      ["primary_color", "Primario"],
                      ["secondary_color", "Secundario"],
                      ["background_light", "Fondo claro"],
                      ["background_dark", "Fondo oscuro"],
                      ["card_bg_light", "Tarjetas (claro)"],
                      ["card_bg_dark", "Tarjetas (oscuro)"],
                      ["text_color_light", "Texto (claro)"],
                      ["text_color_dark", "Texto (oscuro)"],
                    ] as const
                  ).map(([key, label]) => (
                    <label key={key} className="flex flex-col items-center gap-2 text-sm">
                      {label}
                      <input
                        type="color"
                        value={settings[key]}
                        onChange={(e) => set(key, e.target.value)}
                        className="w-16 h-10 cursor-pointer"
                      />
                    </label>
                  ))}
                </div>
              </section>

              <section className="card space-y-4">
                <h2 className="text-xl font-bold">🔤 Tipografía</h2>
                <p className="text-sm text-foreground/60">
                  Más de una decena de tipografías para elegir, además de la opción de subir
                  la tuya propia. La tipografía del <strong>nombre del sitio</strong> se
                  edita más arriba, junto a ese campo; acá se configuran los{" "}
                  <strong>encabezados</strong> (títulos de cada sección: Sobre mí, Servicios,
                  Habilidades, Proyectos, etc.) y el <strong>texto general</strong> del sitio.
                  Si dejas un rol en &quot;Heredar&quot;, usa automáticamente la tipografía del
                  rol de abajo, así nada cambia hasta que elijas algo distinto.
                </p>
                <TypographyRoleEditor
                  label="Encabezados de sección"
                  hint="Títulos de todas las secciones del home (Sobre mí, Servicios, Habilidades, Proyectos, Noticias, Contacto, etc.)."
                  value={settings.typography.headings}
                  onChange={(patch) => setTypography("headings", patch)}
                  allowInherit
                  showColor
                  onUploadFont={uploadFontFile}
                />
                <TypographyRoleEditor
                  label="Texto general del sitio"
                  hint="Tipografía base de todo el sitio (párrafos y, salvo que los personalices arriba, también encabezados y nombre del sitio)."
                  value={settings.typography.body}
                  onChange={(patch) => setTypography("body", patch)}
                  allowInherit={false}
                  onUploadFont={uploadFontFile}
                />
              </section>

              <section className="card space-y-4">
                <h2 className="text-xl font-bold">🔘 Botones</h2>
                <p className="text-sm text-foreground/60">
                  Estos colores y esta forma se aplican a TODOS los botones del sitio:
                  portada, servicios, redes sociales, proyectos y el formulario de
                  contacto.
                </p>
                <div className="flex flex-wrap gap-6">
                  <label className="flex flex-col items-center gap-2 text-sm">
                    Color de fondo
                    <input
                      type="color"
                      value={settings.button_bg_color}
                      onChange={(e) => set("button_bg_color", e.target.value)}
                      className="w-16 h-10 cursor-pointer"
                    />
                  </label>
                  <label className="flex flex-col items-center gap-2 text-sm">
                    Color del texto
                    <input
                      type="color"
                      value={settings.button_text_color}
                      onChange={(e) => set("button_text_color", e.target.value)}
                      className="w-16 h-10 cursor-pointer"
                    />
                  </label>
                  <div className="flex flex-col gap-2 text-sm">
                    Forma
                    <div className="flex gap-2">
                      {(
                        [
                          ["full", "Redondeado"],
                          ["rounded", "Suave"],
                          ["square", "Cuadrado"],
                        ] as const
                      ).map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => set("button_shape", value)}
                          className={`px-4 py-2 text-xs border transition ${
                            settings.button_shape === value
                              ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-300"
                              : "border-gray-300 dark:border-purple-700/50 text-gray-500"
                          } ${
                            value === "full"
                              ? "rounded-full"
                              : value === "rounded"
                              ? "rounded-xl"
                              : "rounded-none"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="flex flex-col items-center gap-2 text-sm">
                    Vista previa
                    <span
                      className="px-5 py-2 text-sm"
                      style={{
                        backgroundColor: settings.button_bg_color,
                        color: settings.button_text_color,
                        borderRadius:
                          settings.button_shape === "full"
                            ? "9999px"
                            : settings.button_shape === "rounded"
                            ? "1rem"
                            : "0.25rem",
                      }}
                    >
                      Botón
                    </span>
                  </label>
                </div>
              </section>

              <section className="card space-y-4">
                <h2 className="text-xl font-bold">🌗 Modo oscuro y efectos</h2>
                <FieldRow label="Tema con el que se abre el sitio para nuevos visitantes">
                  <select
                    value={settings.default_theme}
                    onChange={(e) => set("default_theme", e.target.value as SiteSettings["default_theme"])}
                    className={inputClass + " sm:w-64"}
                  >
                    <option value="light">Claro</option>
                    <option value="dark">Oscuro</option>
                  </select>
                </FieldRow>
                <label className="flex items-center gap-3 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={settings.enable_effects}
                    onChange={(e) => set("enable_effects", e.target.checked)}
                    className="w-4 h-4"
                  />
                  Activar efectos visuales (partículas de fondo + animaciones)
                </label>
                <p className="text-xs text-gray-500">
                  Desactívalo si prefieres una versión más simple y liviana del sitio,
                  sin partículas animadas ni transiciones al pasar el mouse.
                </p>
              </section>

              <section className="card space-y-4">
                <h2 className="text-xl font-bold">🏷️ Logo</h2>
                <p className="text-sm text-gray-500">
                  Puedes subir la imagen desde tu dispositivo o pegar directamente una
                  URL. Se usan dos versiones: una para modo claro y otra para modo
                  oscuro (si solo tienes una, puedes repetir la misma URL en ambas).
                </p>

                <FieldRow label={`Tamaño del logo (${settings.logo_width}px de ancho)`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={60}
                      max={600}
                      step={10}
                      value={settings.logo_width}
                      onChange={(e) => set("logo_width", Number(e.target.value))}
                      className="w-full"
                    />
                    <input
                      type="number"
                      min={20}
                      max={1000}
                      value={settings.logo_width}
                      onChange={(e) => set("logo_width", Number(e.target.value) || 0)}
                      className={inputClass + " w-24"}
                    />
                  </div>
                </FieldRow>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="font-semibold text-sm">Logo para modo claro</p>
                    {settings.logo_dark_url && (
                      <img
                        src={settings.logo_dark_url}
                        alt="Logo modo claro"
                        style={{ width: `${Math.min(settings.logo_width, 260)}px`, height: "auto" }}
                        className="max-w-full bg-white rounded p-2"
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploading === "logo_light_mode"}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const url = await uploadImage(file, "logo_light_mode");
                        if (url) set("logo_dark_url", url);
                        e.target.value = "";
                      }}
                    />
                    {uploading === "logo_light_mode" && (
                      <p className="text-sm">Subiendo...</p>
                    )}
                    <input
                      value={settings.logo_dark_url}
                      onChange={(e) => set("logo_dark_url", e.target.value)}
                      placeholder="...o pega una URL de imagen"
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="font-semibold text-sm">Logo para modo oscuro</p>
                    {settings.logo_light_url && (
                      <img
                        src={settings.logo_light_url}
                        alt="Logo modo oscuro"
                        style={{ width: `${Math.min(settings.logo_width, 260)}px`, height: "auto" }}
                        className="max-w-full bg-gray-900 rounded p-2"
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploading === "logo_dark_mode"}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const url = await uploadImage(file, "logo_dark_mode");
                        if (url) set("logo_light_url", url);
                        e.target.value = "";
                      }}
                    />
                    {uploading === "logo_dark_mode" && (
                      <p className="text-sm">Subiendo...</p>
                    )}
                    <input
                      value={settings.logo_light_url}
                      onChange={(e) => set("logo_light_url", e.target.value)}
                      placeholder="...o pega una URL de imagen"
                      className={inputClass}
                    />
                  </div>
                </div>
              </section>
            </>
          )}

          {activeTab === "backgrounds" && (
            <>
              <section className="card space-y-4">
                <h2 className="text-xl font-bold">✨ Partículas animadas</h2>
                <label className="flex items-center gap-3 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={settings.enable_effects}
                    onChange={(e) => set("enable_effects", e.target.checked)}
                    className="w-4 h-4"
                  />
                  Activar partículas de fondo + animaciones
                </label>
                <p className="text-xs text-gray-500">
                  Este efecto es independiente de las imágenes de fondo de abajo: puedes
                  combinarlos, usar solo uno, o apagarlos todos.
                </p>
              </section>

              <section className="card space-y-4">
                <h2 className="text-xl font-bold">🖼️ Imagen de fondo del inicio (Hero)</h2>
                <p className="text-sm text-gray-500">
                  Opcional. Se muestra solo detrás de la portada, con una capa oscura
                  encima para que el título se siga leyendo bien.
                </p>
                {settings.hero_bg_image_url && (
                  <img
                    src={settings.hero_bg_image_url}
                    alt="Fondo del inicio"
                    className="w-full max-w-md h-40 object-cover rounded-xl"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading === "hero_bg"}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await uploadImage(file, "hero_bg");
                    if (url) set("hero_bg_image_url", url);
                    e.target.value = "";
                  }}
                />
                {uploading === "hero_bg" && <p className="text-sm">Subiendo...</p>}
                <FieldRow label="...o pega una URL de imagen">
                  <input
                    value={settings.hero_bg_image_url}
                    onChange={(e) => set("hero_bg_image_url", e.target.value)}
                    placeholder="https://ejemplo.com/fondo-inicio.jpg"
                    className={inputClass}
                  />
                </FieldRow>
                {settings.hero_bg_image_url && (
                  <>
                    <FieldRow label={`Oscurecer la imagen (${Math.round(settings.hero_bg_overlay_opacity * 100)}%)`}>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={settings.hero_bg_overlay_opacity}
                        onChange={(e) => set("hero_bg_overlay_opacity", Number(e.target.value))}
                        className="w-full"
                      />
                    </FieldRow>
                    <button
                      onClick={() => set("hero_bg_image_url", "")}
                      className="text-red-500 text-sm flex items-center gap-1"
                    >
                      <FaTrash size={11} /> Quitar imagen de fondo del inicio
                    </button>
                  </>
                )}
              </section>

              <section className="card space-y-4">
                <h2 className="text-xl font-bold">🌄 Imagen de fondo de toda la página</h2>
                <p className="text-sm text-gray-500">
                  Opcional. Queda fija detrás de todo el sitio mientras se hace scroll,
                  por encima del color de fondo y por debajo del contenido.
                </p>
                {settings.page_bg_image_url && (
                  <img
                    src={settings.page_bg_image_url}
                    alt="Fondo de la página"
                    className="w-full max-w-md h-40 object-cover rounded-xl"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading === "page_bg"}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await uploadImage(file, "page_bg");
                    if (url) set("page_bg_image_url", url);
                    e.target.value = "";
                  }}
                />
                {uploading === "page_bg" && <p className="text-sm">Subiendo...</p>}
                <FieldRow label="...o pega una URL de imagen">
                  <input
                    value={settings.page_bg_image_url}
                    onChange={(e) => set("page_bg_image_url", e.target.value)}
                    placeholder="https://ejemplo.com/fondo-pagina.jpg"
                    className={inputClass}
                  />
                </FieldRow>
                {settings.page_bg_image_url && (
                  <>
                    <FieldRow label={`Visibilidad de la imagen (${Math.round(settings.page_bg_image_opacity * 100)}%)`}>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={settings.page_bg_image_opacity}
                        onChange={(e) => set("page_bg_image_opacity", Number(e.target.value))}
                        className="w-full"
                      />
                    </FieldRow>
                    <button
                      onClick={() => set("page_bg_image_url", "")}
                      className="text-red-500 text-sm flex items-center gap-1"
                    >
                      <FaTrash size={11} /> Quitar imagen de fondo de la página
                    </button>
                  </>
                )}
              </section>
            </>
          )}

          {activeTab === "hero" && (
            <section className="card space-y-4">
              <h2 className="text-xl font-bold">🏠 Portada (Hero)</h2>
              <FieldRow label="Título principal">
                <input
                  value={settings.hero_title}
                  onChange={(e) => set("hero_title", e.target.value)}
                  className={inputClass}
                />
              </FieldRow>
              <FieldRow label="Slogan / subtítulo (déjalo vacío para ocultarlo)">
                <input
                  value={settings.hero_subtitle}
                  onChange={(e) => set("hero_subtitle", e.target.value)}
                  className={inputClass}
                />
              </FieldRow>

              <FieldRow label="Líneas del efecto terminal">
                <StringListEditor
                  items={settings.hero_terminal_lines}
                  onChange={(next) => set("hero_terminal_lines", next)}
                  placeholder="$ ejecutando_algo..."
                  addLabel="Agregar línea"
                />
              </FieldRow>

              <label className="flex items-center gap-3 text-sm">
                Color del texto de la terminal
                <input
                  type="color"
                  value={settings.hero_terminal_text_color}
                  onChange={(e) => set("hero_terminal_text_color", e.target.value)}
                  className="w-16 h-10 cursor-pointer"
                />
              </label>

              <div className="grid sm:grid-cols-2 gap-6 pt-2">
                <div className="space-y-3">
                  <p className={labelClass}>Botón principal</p>
                  <input
                    value={settings.hero_button_primary_label}
                    onChange={(e) => set("hero_button_primary_label", e.target.value)}
                    placeholder="Texto del botón (vacío = oculto)"
                    className={inputClass}
                  />
                  <input
                    value={settings.hero_button_primary_href}
                    onChange={(e) => set("hero_button_primary_href", e.target.value)}
                    placeholder="Enlace (ej: #proyectos)"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-3">
                  <p className={labelClass}>Botón secundario</p>
                  <input
                    value={settings.hero_button_secondary_label}
                    onChange={(e) => set("hero_button_secondary_label", e.target.value)}
                    placeholder="Texto del botón (vacío = oculto)"
                    className={inputClass}
                  />
                  <input
                    value={settings.hero_button_secondary_href}
                    onChange={(e) => set("hero_button_secondary_href", e.target.value)}
                    placeholder="Enlace (ej: #contacto)"
                    className={inputClass}
                  />
                </div>
              </div>
            </section>
          )}

          {activeTab === "about" && (
            <section className="card space-y-5">
              <label className="flex items-center gap-2 font-semibold">
                <input
                  type="checkbox"
                  checked={settings.show_about}
                  onChange={(e) => set("show_about", e.target.checked)}
                />
                Mostrar sección &quot;Sobre mí&quot;
              </label>

              <FieldRow label="Nombre de la sección (como aparece en el home)">
                <input
                  value={settings.about_section_title}
                  onChange={(e) => set("about_section_title", e.target.value)}
                  className={inputClass}
                />
              </FieldRow>

              <FieldRow label="Título del bloque principal (ej: Sobre nosotros)">
                <input
                  value={settings.about_title}
                  onChange={(e) => set("about_title", e.target.value)}
                  className={inputClass}
                />
              </FieldRow>
              <FieldRow label="Texto sobre ti">
                <textarea
                  value={settings.about_text}
                  onChange={(e) => set("about_text", e.target.value)}
                  rows={4}
                  className={inputClass}
                />
              </FieldRow>
              <FieldRow label="Recuadros destacados (opcional, agrega los que quieras)">
                <StringListEditor
                  items={settings.about_highlights}
                  onChange={(next) => set("about_highlights", next)}
                  placeholder="Ej: Más de 10 años de experiencia en el rubro"
                  addLabel="Agregar recuadro"
                />
              </FieldRow>

              <FieldRow label="Título del bloque de habilidades blandas">
                <input
                  value={settings.about_soft_skills_title}
                  onChange={(e) => set("about_soft_skills_title", e.target.value)}
                  className={inputClass}
                />
              </FieldRow>
              <FieldRow label="Habilidades blandas">
                <StringListEditor
                  items={settings.about_soft_skills}
                  onChange={(next) => set("about_soft_skills", next)}
                  placeholder="Ej: Trabajo en equipo"
                  addLabel="Agregar habilidad"
                />
              </FieldRow>

              <FieldRow label="Título del bloque de datos rápidos">
                <input
                  value={settings.about_stack_title}
                  onChange={(e) => set("about_stack_title", e.target.value)}
                  className={inputClass}
                />
              </FieldRow>
              <FieldRow label="Datos rápidos (etiqueta y valor)">
                <KeyValueListEditor
                  items={settings.about_stack_facts}
                  onChange={(next) => set("about_stack_facts", next)}
                />
              </FieldRow>

              <div className="grid sm:grid-cols-2 gap-4">
                <FieldRow label="Etiqueta del enfoque actual">
                  <input
                    value={settings.about_focus_label}
                    onChange={(e) => set("about_focus_label", e.target.value)}
                    className={inputClass}
                  />
                </FieldRow>
                <FieldRow label="Texto del enfoque actual (vacío = oculto)">
                  <input
                    value={settings.about_focus_text}
                    onChange={(e) => set("about_focus_text", e.target.value)}
                    className={inputClass}
                  />
                </FieldRow>
              </div>

              <FieldRow label="Título de la sección de redes">
                <input
                  value={settings.about_social_title}
                  onChange={(e) => set("about_social_title", e.target.value)}
                  className={inputClass}
                />
              </FieldRow>
              <div className="grid sm:grid-cols-2 gap-4">
                <FieldRow label="Enlace profesional / red social 1 (vacío = oculto)">
                  <input
                    value={settings.github_url}
                    onChange={(e) => set("github_url", e.target.value)}
                    placeholder="https://instagram.com/tu-negocio"
                    className={inputClass}
                  />
                </FieldRow>
                <FieldRow label="Enlace profesional / red social 2 (vacío = oculto)">
                  <input
                    value={settings.linkedin_url}
                    onChange={(e) => set("linkedin_url", e.target.value)}
                    placeholder="https://linkedin.com/in/tu-usuario"
                    className={inputClass}
                  />
                </FieldRow>
              </div>
            </section>
          )}

          {activeTab === "services" && (
            <section className="card space-y-4">
              <label className="flex items-center gap-2 font-semibold">
                <input
                  type="checkbox"
                  checked={settings.show_services}
                  onChange={(e) => set("show_services", e.target.checked)}
                />
                Mostrar sección &quot;Servicios&quot;
              </label>
              <FieldRow label="Título de la sección">
                <input
                  value={settings.services_title}
                  onChange={(e) => set("services_title", e.target.value)}
                  className={inputClass}
                />
              </FieldRow>
              <FieldRow label="Descripción">
                <textarea
                  value={settings.services_description}
                  onChange={(e) => set("services_description", e.target.value)}
                  rows={2}
                  className={inputClass}
                />
              </FieldRow>
              <FieldRow label="Servicios ofrecidos">
                <ServiceItemsEditor
                  items={settings.services_items}
                  onChange={(next) => set("services_items", next)}
                />
              </FieldRow>
              <div className="grid sm:grid-cols-2 gap-4">
                <FieldRow label="Texto del botón de llamado a la acción">
                  <input
                    value={settings.services_cta_label}
                    onChange={(e) => set("services_cta_label", e.target.value)}
                    className={inputClass}
                  />
                </FieldRow>
                <FieldRow label="Enlace del botón">
                  <input
                    value={settings.services_cta_href}
                    onChange={(e) => set("services_cta_href", e.target.value)}
                    className={inputClass}
                  />
                </FieldRow>
              </div>
            </section>
          )}

          {activeTab === "stack" && (
            <section className="card space-y-4">
              <label className="flex items-center gap-2 font-semibold">
                <input
                  type="checkbox"
                  checked={settings.show_stack}
                  onChange={(e) => set("show_stack", e.target.checked)}
                />
                Mostrar sección &quot;Habilidades y Especialidades&quot;
              </label>
              <FieldRow label="Título de la sección">
                <input
                  value={settings.stack_title}
                  onChange={(e) => set("stack_title", e.target.value)}
                  className={inputClass}
                />
              </FieldRow>
              <FieldRow label="Habilidades / especialidades">
                <SkillItemsEditor
                  items={settings.stack_items}
                  onChange={(next) => set("stack_items", next)}
                />
              </FieldRow>
            </section>
          )}

          {activeTab === "projects" && (
            <section className="card space-y-4">
              <label className="flex items-center gap-2 font-semibold">
                <input
                  type="checkbox"
                  checked={settings.show_projects}
                  onChange={(e) => set("show_projects", e.target.checked)}
                />
                Mostrar sección &quot;Proyectos&quot;
              </label>
              <FieldRow label="Título de la sección">
                <input
                  value={settings.projects_title}
                  onChange={(e) => set("projects_title", e.target.value)}
                  className={inputClass}
                />
              </FieldRow>
              <FieldRow label="Proyectos destacados">
                <ProjectItemsEditor
                  items={settings.projects_items}
                  onChange={(next) => set("projects_items", next)}
                />
              </FieldRow>
            </section>
          )}

          {activeTab === "banner" && (
            <section className="card space-y-4">
              <label className="flex items-center gap-2 font-semibold">
                <input
                  type="checkbox"
                  checked={settings.show_banner}
                  onChange={(e) => set("show_banner", e.target.checked)}
                />
                Mostrar banner / slider de imágenes
              </label>

              {settings.banner_images.map((img, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <img src={img.url} alt="" className="w-16 h-10 object-cover rounded" />
                  <input
                    value={img.caption ?? ""}
                    onChange={(e) => {
                      const next = [...settings.banner_images];
                      next[i] = { ...next[i], caption: e.target.value };
                      set("banner_images", next);
                    }}
                    placeholder="Texto de la imagen (opcional)"
                    className={inputClass}
                  />
                  <button
                    onClick={() =>
                      set(
                        "banner_images",
                        settings.banner_images.filter((_, idx) => idx !== i)
                      )
                    }
                    className="text-red-500 shrink-0"
                  >
                    <FaTrash size={13} />
                  </button>
                </div>
              ))}

              <input
                type="file"
                accept="image/*"
                disabled={uploading === "banner"}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const url = await uploadImage(file, "banner");
                  if (url) set("banner_images", [...settings.banner_images, { url }]);
                  e.target.value = "";
                }}
              />
              {uploading === "banner" && <p className="text-sm">Subiendo imagen...</p>}

              <div className="flex gap-2">
                <input
                  value={bannerUrlInput}
                  onChange={(e) => setBannerUrlInput(e.target.value)}
                  placeholder="...o pega una URL de imagen y presiona Agregar"
                  className={inputClass}
                />
                <button
                  onClick={() => {
                    const url = bannerUrlInput.trim();
                    if (!url) return;
                    set("banner_images", [...settings.banner_images, { url }]);
                    setBannerUrlInput("");
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm shrink-0"
                >
                  Agregar
                </button>
              </div>
            </section>
          )}

          {activeTab === "news" && (
            <section className="card space-y-4">
              <label className="flex items-center gap-2 font-semibold">
                <input
                  type="checkbox"
                  checked={settings.show_news}
                  onChange={(e) => set("show_news", e.target.checked)}
                />
                Mostrar sección de noticias
              </label>

              <FieldRow label="Nombre de la sección (como aparece en el home)">
                <input
                  value={settings.news_title}
                  onChange={(e) => set("news_title", e.target.value)}
                  className={inputClass}
                />
              </FieldRow>

              {settings.news.map((n, i) => (
                <div key={i} className="border border-gray-200 dark:border-purple-700/40 p-3 rounded-xl space-y-2">
                  <input
                    value={n.title}
                    onChange={(e) => {
                      const next = [...settings.news];
                      next[i] = { ...next[i], title: e.target.value };
                      set("news", next);
                    }}
                    placeholder="Título de la noticia"
                    className={inputClass}
                  />
                  <textarea
                    value={n.content}
                    onChange={(e) => {
                      const next = [...settings.news];
                      next[i] = { ...next[i], content: e.target.value };
                      set("news", next);
                    }}
                    placeholder="Contenido"
                    rows={2}
                    className={inputClass}
                  />
                  <input
                    value={n.date ?? ""}
                    onChange={(e) => {
                      const next = [...settings.news];
                      next[i] = { ...next[i], date: e.target.value };
                      set("news", next);
                    }}
                    placeholder="Fecha (opcional, ej: Marzo 2026)"
                    className={inputClass}
                  />
                  <button
                    onClick={() => set("news", settings.news.filter((_, idx) => idx !== i))}
                    className="text-red-500 text-sm flex items-center gap-1"
                  >
                    <FaTrash size={11} /> Eliminar noticia
                  </button>
                </div>
              ))}

              <button
                onClick={() =>
                  set("news", [...settings.news, { title: "", content: "" }])
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm"
              >
                + Agregar noticia
              </button>
            </section>
          )}

          {activeTab === "contact" && (
            <>
              <section className="card space-y-3">
                <label className="flex items-center gap-2 font-semibold">
                  <input
                    type="checkbox"
                    checked={settings.show_contact}
                    onChange={(e) => set("show_contact", e.target.checked)}
                  />
                  Mostrar sección &quot;Contacto&quot;
                </label>
                <FieldRow label="Título de la sección">
                  <input
                    value={settings.contact_title}
                    onChange={(e) => set("contact_title", e.target.value)}
                    className={inputClass}
                  />
                </FieldRow>
              </section>

              <section className="card space-y-3">
                <h2 className="text-xl font-bold">🦶 Footer</h2>
                <FieldRow label="Texto del footer">
                  <input
                    value={settings.footer_text}
                    onChange={(e) => set("footer_text", e.target.value)}
                    className={inputClass}
                  />
                </FieldRow>
                <div className="flex flex-wrap items-end gap-6">
                  <label className="flex flex-col items-center gap-2 text-sm">
                    Color de fondo
                    <input
                      type="color"
                      value={settings.footer_bg_color}
                      onChange={(e) => set("footer_bg_color", e.target.value)}
                      className="w-16 h-10 cursor-pointer"
                    />
                  </label>
                  <label className="flex flex-col items-center gap-2 text-sm">
                    Color del texto
                    <input
                      type="color"
                      value={settings.footer_text_color}
                      onChange={(e) => set("footer_text_color", e.target.value)}
                      className="w-16 h-10 cursor-pointer"
                    />
                  </label>
                  <div
                    className="px-5 py-3 text-sm rounded-lg"
                    style={{
                      backgroundColor: settings.footer_bg_color,
                      color: settings.footer_text_color,
                    }}
                  >
                    © {new Date().getFullYear()} {settings.footer_text}
                  </div>
                </div>
              </section>
            </>
          )}

          {activeTab === "order" && (
            <section className="card space-y-4">
              <h2 className="text-xl font-bold">📑 Secciones y orden del Home</h2>
              <p className="text-sm text-gray-500">
                Acá está TODO lo que puede aparecer en el home: cambia el orden con las
                flechas (o muévela directo al principio/final), elige si va alineada a
                la izquierda, al centro o a la derecha de la página, edita el nombre de
                cualquier sección, muéstrala/ocúltala, o elimínala por completo. También
                puedes agregar secciones nuevas con cualquier nombre y contenido, como
                la de &quot;Servicios&quot; pero totalmente a tu gusto.
              </p>
              <div className="space-y-2">
                {fullOrder.map((key, i) => {
                  const isCustom = key.startsWith("custom:");
                  const customId = isCustom ? key.slice("custom:".length) : null;
                  const custom = customId
                    ? settings.custom_sections.find((c) => c.id === customId)
                    : null;

                  if (isCustom && !custom) return null;

                  const builtinKey = isCustom ? null : (key as BuiltinSectionKey);
                  const titleField = builtinKey ? SECTION_TITLE_FIELD[builtinKey] : undefined;
                  const visibilityField = builtinKey
                    ? SECTION_VISIBILITY_FIELD[builtinKey]
                    : undefined;
                  const isVisible = isCustom
                    ? true
                    : Boolean(settings[visibilityField as keyof SiteSettings]);
                  const currentAlign = settings.section_align?.[key] ?? "center";

                  return (
                    <div
                      key={key}
                      className="flex flex-wrap items-center gap-3 border border-gray-200 dark:border-purple-700/40 rounded-lg px-3 py-2"
                    >
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => moveSectionToEdge(i, "top")}
                          className="px-2 py-1 rounded border border-gray-300 dark:border-purple-700/50 text-sm disabled:opacity-30"
                          disabled={i === 0}
                          aria-label="Mover al principio"
                          title="Mover al principio"
                        >
                          ⇈
                        </button>
                        <button
                          onClick={() => moveSection(i, -1)}
                          className="px-2 py-1 rounded border border-gray-300 dark:border-purple-700/50 text-sm disabled:opacity-30"
                          disabled={i === 0}
                          aria-label="Mover arriba"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveSection(i, 1)}
                          className="px-2 py-1 rounded border border-gray-300 dark:border-purple-700/50 text-sm disabled:opacity-30"
                          disabled={i === fullOrder.length - 1}
                          aria-label="Mover abajo"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => moveSectionToEdge(i, "bottom")}
                          className="px-2 py-1 rounded border border-gray-300 dark:border-purple-700/50 text-sm disabled:opacity-30"
                          disabled={i === fullOrder.length - 1}
                          aria-label="Mover al final"
                          title="Mover al final"
                        >
                          ⇊
                        </button>
                      </div>

                      {isCustom && custom ? (
                        <input
                          value={custom.title}
                          onChange={(e) => renameCustomSection(custom.id, e.target.value)}
                          className={inputClass + " flex-1 min-w-[10rem]"}
                          placeholder="Nombre de la sección"
                        />
                      ) : titleField ? (
                        <input
                          value={String(settings[titleField])}
                          onChange={(e) => set(titleField, e.target.value as never)}
                          className={inputClass + " flex-1 min-w-[10rem]"}
                          placeholder="Nombre de la sección"
                        />
                      ) : (
                        <span className="flex-1 min-w-[10rem] font-medium">
                          {SECTION_LABELS[builtinKey as BuiltinSectionKey]}
                        </span>
                      )}

                      <div className="flex gap-1 shrink-0" role="group" aria-label="Alineación">
                        {(
                          [
                            ["left", "⬅"],
                            ["center", "•"],
                            ["right", "➡"],
                          ] as const
                        ).map(([value, icon]) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setSectionAlign(key, value)}
                            title={
                              value === "left"
                                ? "Alinear a la izquierda"
                                : value === "right"
                                ? "Alinear a la derecha"
                                : "Centrar"
                            }
                            className={`px-2 py-1 rounded border text-sm transition ${
                              currentAlign === value
                                ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-300"
                                : "border-gray-300 dark:border-purple-700/50 text-gray-500"
                            }`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>

                      {!isCustom && (
                        <button
                          onClick={() =>
                            set(
                              visibilityField as keyof SiteSettings,
                              !isVisible as never
                            )
                          }
                          className={`shrink-0 flex items-center gap-2 text-xs px-3 py-1.5 rounded-full transition ${
                            isVisible
                              ? "bg-green-500/15 text-green-600 dark:text-green-400"
                              : "bg-gray-400/15 text-gray-500"
                          }`}
                        >
                          {isVisible ? <FaEye size={11} /> : <FaEyeSlash size={11} />}
                          {isVisible ? "Visible" : "Oculta"}
                        </button>
                      )}

                      {isCustom && custom && (
                        <button
                          onClick={() => deleteCustomSection(custom.id)}
                          className="shrink-0 flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-red-300 text-red-500 hover:bg-red-500 hover:text-white transition"
                        >
                          <FaTrash size={11} /> Eliminar
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Contenido de las secciones personalizadas */}
              {settings.custom_sections.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="font-semibold text-sm">Contenido de tus secciones personalizadas</h3>
                  {settings.custom_sections.map((c) => (
                    <div
                      key={c.id}
                      className="border border-gray-200 dark:border-purple-700/40 rounded-xl p-3 space-y-2 bg-gray-50/60 dark:bg-white/[0.03]"
                    >
                      <p className="text-xs text-gray-500">
                        Sección: <span className="font-medium">{c.title}</span>
                      </p>
                      <textarea
                        value={c.content}
                        onChange={(e) => updateCustomSectionContent(c.id, e.target.value)}
                        rows={3}
                        placeholder="Texto que se muestra en esta sección"
                        className={inputClass}
                      />
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={addCustomSection}
                className="flex items-center gap-2 text-sm px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
              >
                <FaPlus size={11} /> Agregar sección nueva
              </button>
            </section>
          )}

          <div className="flex justify-center pt-2 pb-10">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-10 py-4 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:scale-105 transition-all disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </main>
      </div>

      {showPreview && (
        <PreviewOverlay settings={settings} onClose={() => setShowPreview(false)} />
      )}
    </div>
  );
}
