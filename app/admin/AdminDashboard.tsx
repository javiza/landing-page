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
} from "react-icons/fa";
import { createClient } from "../../lib/supabase/client";
import { DEFAULT_SETTINGS, type SiteSettings } from "../../types/settings";
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
} from "./editors";

const SECTION_LABELS: Record<string, string> = {
  about: "Sobre mí",
  services: "Servicios",
  stack: "Habilidades y Especialidades",
  projects: "Proyectos",
  news: "Noticias",
  contact: "Contacto",
};

const TABS = [
  { key: "identity", label: "Identidad y diseño", icon: <FaPalette /> },
  { key: "hero", label: "Portada (Hero)", icon: <FaHome /> },
  { key: "about", label: "Sobre mí", icon: <FaUserAlt /> },
  { key: "services", label: "Servicios", icon: <FaBriefcase /> },
  { key: "stack", label: "Habilidades y Especialidades", icon: <FaLaptopCode /> },
  { key: "projects", label: "Proyectos", icon: <FaProjectDiagram /> },
  { key: "banner", label: "Banner / Slider", icon: <FaImages /> },
  { key: "news", label: "Noticias", icon: <FaNewspaper /> },
  { key: "contact", label: "Contacto y Footer", icon: <FaEnvelope /> },
  { key: "order", label: "Orden de secciones", icon: <FaListOl /> },
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

  function moveSection(index: number, dir: -1 | 1) {
    const order = [...settings.section_order];
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= order.length) return;
    [order[index], order[newIndex]] = [order[newIndex], order[index]];
    set("section_order", order);
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {(
                    [
                      ["primary_color", "Primario"],
                      ["secondary_color", "Secundario"],
                      ["background_light", "Fondo claro"],
                      ["background_dark", "Fondo oscuro"],
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

              <section className="card space-y-3">
                <h2 className="text-xl font-bold">🔤 Tipografía</h2>
                <select
                  value={settings.font_family}
                  onChange={(e) => set("font_family", e.target.value as SiteSettings["font_family"])}
                  className={inputClass + " sm:w-64"}
                >
                  <option value="geist">Geist (actual)</option>
                  <option value="inter">Inter</option>
                  <option value="poppins">Poppins</option>
                  <option value="roboto">Roboto</option>
                </select>
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

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="font-semibold text-sm">Logo para modo claro</p>
                    {settings.logo_dark_url && (
                      <img
                        src={settings.logo_dark_url}
                        alt="Logo modo claro"
                        className="h-16 object-contain bg-white rounded p-2"
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
                        className="h-16 object-contain bg-gray-900 rounded p-2"
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

              <FieldRow label="Título (ej: FullStack Developer)">
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
              <FieldRow label="Frase destacada (especialización actual)">
                <input
                  value={settings.about_highlight}
                  onChange={(e) => set("about_highlight", e.target.value)}
                  className={inputClass}
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

              <FieldRow label="Título del bloque de stack técnico">
                <input
                  value={settings.about_stack_title}
                  onChange={(e) => set("about_stack_title", e.target.value)}
                  className={inputClass}
                />
              </FieldRow>
              <FieldRow label="Datos del stack técnico">
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
              </section>
            </>
          )}

          {activeTab === "order" && (
            <section className="card space-y-3">
              <h2 className="text-xl font-bold">📑 Orden de las secciones del Home</h2>
              <p className="text-sm text-gray-500">
                Usa las flechas para cambiar el orden en que aparecen en la página. La
                visibilidad de cada sección se controla en su propia pestaña.
              </p>
              <div className="space-y-2">
                {settings.section_order.filter((key) => key in SECTION_LABELS).map((key, i) => (
                  <div
                    key={key}
                    className="flex items-center gap-3 border border-gray-200 dark:border-purple-700/40 rounded-lg px-3 py-2"
                  >
                    <button
                      onClick={() => moveSection(i, -1)}
                      className="px-2 py-1 rounded border border-gray-300 dark:border-purple-700/50 text-sm disabled:opacity-30"
                      disabled={i === 0}
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveSection(i, 1)}
                      className="px-2 py-1 rounded border border-gray-300 dark:border-purple-700/50 text-sm disabled:opacity-30"
                      disabled={i === settings.section_order.length - 1}
                    >
                      ↓
                    </button>
                    <span className="flex-1 font-medium">{SECTION_LABELS[key]}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        settings[(`show_${key}` as unknown) as keyof SiteSettings]
                          ? "bg-green-500/15 text-green-600 dark:text-green-400"
                          : "bg-gray-400/15 text-gray-500"
                      }`}
                    >
                      {settings[(`show_${key}` as unknown) as keyof SiteSettings]
                        ? "Visible"
                        : "Oculta"}
                    </span>
                  </div>
                ))}
              </div>
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
