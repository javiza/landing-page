"use client";

import { useState } from "react";
import { FaPlus, FaTrash, FaArrowUp, FaArrowDown, FaUpload } from "react-icons/fa";
import { ICON_OPTIONS, getIcon } from "../../lib/icons";
import {
  FONT_FAMILY_OPTIONS,
  type SkillItem,
  type StackFact,
  type ServiceItem,
  type ProjectItem,
  type TypographyStyle,
} from "../../types/settings";

export const inputClass =
  "border border-gray-300 dark:border-purple-700/60 bg-white dark:bg-[#0f0a24] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 p-3 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60 dark:focus:ring-purple-500/60 transition";

export const labelClass =
  "text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-purple-300/70";

export function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

function ItemShell({
  children,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  children: React.ReactNode;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  return (
    <div className="relative border border-gray-200 dark:border-purple-700/40 rounded-xl p-4 space-y-3 bg-gray-50/60 dark:bg-white/[0.03]">
      <div className="flex-1 space-y-3">{children}</div>
      <div className="flex items-center gap-2 pt-1">
        {onMoveUp && (
          <button
            type="button"
            onClick={onMoveUp}
            className="text-xs px-2 py-1 rounded-md border border-gray-300 dark:border-purple-700/50 hover:bg-gray-100 dark:hover:bg-white/5 transition"
            aria-label="Mover arriba"
          >
            <FaArrowUp size={11} />
          </button>
        )}
        {onMoveDown && (
          <button
            type="button"
            onClick={onMoveDown}
            className="text-xs px-2 py-1 rounded-md border border-gray-300 dark:border-purple-700/50 hover:bg-gray-100 dark:hover:bg-white/5 transition"
            aria-label="Mover abajo"
          >
            <FaArrowDown size={11} />
          </button>
        )}
        <button
          type="button"
          onClick={onRemove}
          className="ml-auto text-xs flex items-center gap-1 px-2 py-1 rounded-md border border-red-300 text-red-500 hover:bg-red-500 hover:text-white transition"
        >
          <FaTrash size={10} /> Eliminar
        </button>
      </div>
    </div>
  );
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 text-sm px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
    >
      <FaPlus size={11} /> {label}
    </button>
  );
}

/* ---------------- Lista de strings simples ---------------- */
export function StringListEditor({
  items,
  onChange,
  placeholder,
  addLabel,
}: {
  items: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  addLabel: string;
}) {
  return (
    <div className="space-y-3">
      {items.map((value, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            value={value}
            onChange={(e) => {
              const next = [...items];
              next[i] = e.target.value;
              onChange(next);
            }}
            placeholder={placeholder}
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            className="text-red-500 shrink-0"
            aria-label="Eliminar línea"
          >
            <FaTrash size={13} />
          </button>
        </div>
      ))}
      <AddButton onClick={() => onChange([...items, ""])} label={addLabel} />
    </div>
  );
}

/* ---------------- Lista de pares label/value (Stack técnico) ---------------- */
export function KeyValueListEditor({
  items,
  onChange,
}: {
  items: StackFact[];
  onChange: (next: StackFact[]) => void;
}) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            value={item.label}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...next[i], label: e.target.value };
              onChange(next);
            }}
            placeholder="Etiqueta (ej: Frontend)"
            className={inputClass + " sm:w-40"}
          />
          <input
            value={item.value}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...next[i], value: e.target.value };
              onChange(next);
            }}
            placeholder="Valor (ej: React, Next.js, Angular)"
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            className="text-red-500 shrink-0"
            aria-label="Eliminar"
          >
            <FaTrash size={13} />
          </button>
        </div>
      ))}
      <AddButton
        onClick={() => onChange([...items, { label: "", value: "" }])}
        label="Agregar dato"
      />
    </div>
  );
}

/* ---------------- Lista de servicios (título + descripción) ---------------- */
export function ServiceItemsEditor({
  items,
  onChange,
}: {
  items: ServiceItem[];
  onChange: (next: ServiceItem[]) => void;
}) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <ItemShell key={i} onRemove={() => onChange(items.filter((_, idx) => idx !== i))}>
          <input
            value={item.title}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...next[i], title: e.target.value };
              onChange(next);
            }}
            placeholder="Título del servicio"
            className={inputClass}
          />
          <textarea
            value={item.description}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...next[i], description: e.target.value };
              onChange(next);
            }}
            placeholder="Descripción"
            rows={2}
            className={inputClass}
          />
        </ItemShell>
      ))}
      <AddButton
        onClick={() => onChange([...items, { title: "", description: "" }])}
        label="Agregar servicio"
      />
    </div>
  );
}

/* ---------------- Editor de logo (zoom / rotación / fondo) ----------------
   Modal simple para ajustar un logo recién subido o pegado por URL antes
   de guardarlo: acercar/alejar, rotar de a 90° y elegir un fondo (útil
   para logos con fondo blanco que necesitan verse bien en modo oscuro,
   por ejemplo). El resultado se "aplana" a una imagen cuadrada nueva. */
function LogoEditorModal({
  src,
  onCancel,
  onSave,
}: {
  src: string;
  onCancel: () => void;
  onSave: (dataUrl: string) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [bg, setBg] = useState<"transparent" | "white" | "custom">("transparent");
  const [customBg, setCustomBg] = useState("#ffffff");
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    setError(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const size = 320;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (bg === "white") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, size, size);
      } else if (bg === "custom") {
        ctx.fillStyle = customBg;
        ctx.fillRect(0, 0, size, size);
      }

      ctx.save();
      ctx.translate(size / 2, size / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      const scale = zoom;
      const ratio = Math.min(size / img.width, size / img.height) * scale;
      const w = img.width * ratio;
      const h = img.height * ratio;
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      ctx.restore();

      try {
        onSave(canvas.toDataURL("image/png"));
      } catch {
        setError(
          "No se pudo editar esta imagen porque viene de otro sitio (restricción del navegador). Descárgala y súbela desde tu dispositivo para poder editarla."
        );
      }
    };
    img.onerror = () => setError("No se pudo cargar la imagen para editarla.");
    img.src = src;
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#160f33] rounded-2xl p-5 w-full max-w-sm space-y-4 shadow-2xl">
        <h3 className="font-semibold">Editar logo</h3>

        <div
          className="w-full aspect-square rounded-xl border border-gray-200 dark:border-purple-700/40 flex items-center justify-center overflow-hidden"
          style={{
            backgroundColor:
              bg === "white" ? "#ffffff" : bg === "custom" ? customBg : "transparent",
            backgroundImage:
              bg === "transparent"
                ? "repeating-conic-gradient(#ddd 0% 25%, transparent 0% 50%) 0 0/16px 16px"
                : undefined,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt="Vista previa del logo"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              maxWidth: "80%",
              maxHeight: "80%",
              objectFit: "contain",
              transition: "transform 0.15s",
            }}
          />
        </div>

        <FieldRow label={`Zoom (${Math.round(zoom * 100)}%)`}>
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full"
          />
        </FieldRow>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
            className="text-xs px-3 py-2 rounded-lg border border-gray-300 dark:border-purple-700/50 hover:bg-gray-100 dark:hover:bg-white/5 transition"
          >
            ⟲ Rotar
          </button>
          <button
            type="button"
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="text-xs px-3 py-2 rounded-lg border border-gray-300 dark:border-purple-700/50 hover:bg-gray-100 dark:hover:bg-white/5 transition"
          >
            ⟳ Rotar
          </button>
        </div>

        <FieldRow label="Fondo del logo">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setBg("transparent")}
              className={`text-xs px-3 py-2 rounded-lg border transition ${bg === "transparent" ? "border-blue-500 bg-blue-500/10" : "border-gray-300 dark:border-purple-700/50"}`}
            >
              Transparente
            </button>
            <button
              type="button"
              onClick={() => setBg("white")}
              className={`text-xs px-3 py-2 rounded-lg border transition ${bg === "white" ? "border-blue-500 bg-blue-500/10" : "border-gray-300 dark:border-purple-700/50"}`}
            >
              Blanco
            </button>
            <button
              type="button"
              onClick={() => setBg("custom")}
              className={`text-xs px-3 py-2 rounded-lg border transition ${bg === "custom" ? "border-blue-500 bg-blue-500/10" : "border-gray-300 dark:border-purple-700/50"}`}
            >
              Color
            </button>
            {bg === "custom" && (
              <input
                type="color"
                value={customBg}
                onChange={(e) => setCustomBg(e.target.value)}
                className="w-9 h-9 cursor-pointer"
              />
            )}
          </div>
        </FieldRow>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="text-sm px-4 py-2 rounded-full border border-gray-300 dark:border-purple-700/50 hover:bg-gray-100 dark:hover:bg-white/5 transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="text-sm px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
          >
            Guardar logo
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Lista de habilidades con ícono (Stack / Seguridad) ----------------
   Cada habilidad usa, por defecto, uno de los íconos predefinidos. Si el
   que se necesita no está en la lista, se puede en su lugar subir un
   logo propio desde el dispositivo, pegar el link de una imagen, y
   ajustarlo (zoom / rotación / fondo) con un editor simple antes de
   guardarlo. */
export function SkillItemsEditor({
  items,
  onChange,
  uploadImage,
  uploading,
}: {
  items: SkillItem[];
  onChange: (next: SkillItem[]) => void;
  uploadImage?: (file: File, label: string) => Promise<string | null>;
  uploading?: string | null;
}) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [urlDraft, setUrlDraft] = useState<Record<number, string>>({});

  function updateItem(i: number, patch: Partial<SkillItem>) {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item, i) => {
          const uploadKey = `skill_logo_${i}`;
          return (
            <div
              key={i}
              className="flex flex-col gap-2 min-w-0 border border-gray-200 dark:border-purple-700/40 rounded-xl p-3 bg-gray-50/60 dark:bg-white/[0.03]"
            >
              <div className="flex items-center gap-2 min-w-0">
                {/* Selector de ícono: se envuelve en un contenedor de ancho
                    fijo con overflow-hidden porque un <select> nativo no
                    respeta el ancho de CSS cuando el texto de la opción es
                    largo (recorta feo o empuja al resto de la fila). El
                    cuadro de vista previa del ícono que iba aquí se quitó:
                    era redundante, ya que el emoji del select ya lo muestra. */}
                <div className="w-24 sm:w-28 shrink-0 overflow-hidden rounded-lg">
                  <select
                    value={item.icon}
                    onChange={(e) => updateItem(i, { icon: e.target.value })}
                    className={inputClass + " w-full"}
                    disabled={Boolean(item.custom_image_url)}
                    title={
                      item.custom_image_url
                        ? "Quita el logo personalizado para volver a elegir un ícono"
                        : undefined
                    }
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.key} value={opt.key}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  value={item.name}
                  onChange={(e) => updateItem(i, { name: e.target.value })}
                  placeholder="Nombre (ej: Docker)"
                  className={inputClass + " flex-1 min-w-0"}
                />
                <button
                  type="button"
                  onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                  className="text-red-500 shrink-0"
                  aria-label="Eliminar"
                >
                  <FaTrash size={13} />
                </button>
              </div>

              {/* ¿No está el ícono que buscas? Logo propio (subido, por
                  link, o editado) */}
              {!item.custom_image_url ? (
                <div className="space-y-1.5 pt-1 border-t border-gray-200 dark:border-purple-700/30">
                  <p className="text-[11px] text-[var(--admin-hint)]">
                    ¿No está el ícono que buscas? Usa tu propio logo:
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {uploadImage && (
                      <>
                        <label
                          htmlFor={`skill-logo-input-${i}`}
                          className={`flex items-center justify-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg border-2 border-dashed cursor-pointer transition ${
                            uploading === uploadKey
                              ? "border-gray-300 dark:border-purple-700/40 opacity-60 cursor-wait"
                              : "border-blue-400 dark:border-purple-500/60 text-blue-600 dark:text-purple-300 hover:bg-blue-50 dark:hover:bg-white/5"
                          }`}
                        >
                          <FaUpload size={9} />
                          {uploading === uploadKey ? "Subiendo..." : "Subir logo"}
                        </label>
                        <input
                          id={`skill-logo-input-${i}`}
                          type="file"
                          accept="image/*"
                          disabled={uploading === uploadKey}
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const url = await uploadImage(file, uploadKey);
                            if (url) updateItem(i, { custom_image_url: url });
                            e.target.value = "";
                          }}
                        />
                      </>
                    )}
                    <input
                      value={urlDraft[i] ?? ""}
                      onChange={(e) => setUrlDraft((d) => ({ ...d, [i]: e.target.value }))}
                      placeholder="...o pega una URL de imagen"
                      className={inputClass + " flex-1 min-w-[9rem] text-xs py-1.5"}
                    />
                    <button
                      type="button"
                      disabled={!urlDraft[i]}
                      onClick={() => {
                        updateItem(i, { custom_image_url: urlDraft[i] });
                        setUrlDraft((d) => ({ ...d, [i]: "" }));
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-purple-700/50 hover:bg-gray-100 dark:hover:bg-white/5 transition disabled:opacity-40"
                    >
                      Usar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 pt-1 border-t border-gray-200 dark:border-purple-700/30">
                  <button
                    type="button"
                    onClick={() => setEditingIndex(i)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-purple-700/50 hover:bg-gray-100 dark:hover:bg-white/5 transition"
                  >
                    ✏️ Editar logo
                  </button>
                  <button
                    type="button"
                    onClick={() => updateItem(i, { custom_image_url: "" })}
                    className="text-xs px-3 py-1.5 rounded-lg border border-red-300 text-red-500 hover:bg-red-500 hover:text-white transition"
                  >
                    Quitar logo
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <AddButton
        onClick={() => onChange([...items, { name: "", icon: "code" }])}
        label="Agregar habilidad"
      />

      {editingIndex !== null && items[editingIndex]?.custom_image_url && (
        <LogoEditorModal
          src={items[editingIndex].custom_image_url as string}
          onCancel={() => setEditingIndex(null)}
          onSave={(dataUrl) => {
            updateItem(editingIndex, { custom_image_url: dataUrl });
            setEditingIndex(null);
          }}
        />
      )}
    </div>
  );
}

/* ---------------- Lista de proyectos ---------------- */
export function ProjectItemsEditor({
  items,
  onChange,
  uploadImage,
  uploading,
}: {
  items: ProjectItem[];
  onChange: (next: ProjectItem[]) => void;
  uploadImage: (file: File, label: string) => Promise<string | null>;
  uploading: string | null;
}) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const uploadKey = `project_image_${i}`;
        return (
          <ItemShell key={i} onRemove={() => onChange(items.filter((_, idx) => idx !== i))}>
            <input
              value={item.title}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...next[i], title: e.target.value };
                onChange(next);
              }}
              placeholder="Título del proyecto"
              className={inputClass}
            />
            <textarea
              value={item.description}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...next[i], description: e.target.value };
                onChange(next);
              }}
              placeholder="Descripción"
              rows={2}
              className={inputClass}
            />

            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground/70">
                Imagen del proyecto (opcional)
              </p>
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.title || "Proyecto"}
                  className="w-full max-w-xs h-32 object-cover rounded-lg border border-gray-200 dark:border-purple-700/40"
                />
              )}
              <div className="flex items-center gap-2">
                <label
                  htmlFor={`project-image-input-${i}`}
                  className={`flex items-center justify-center gap-2 text-xs px-3 py-2 rounded-lg border-2 border-dashed cursor-pointer transition ${
                    uploading === uploadKey
                      ? "border-gray-300 dark:border-purple-700/40 opacity-60 cursor-wait"
                      : "border-blue-400 dark:border-purple-500/60 text-blue-600 dark:text-purple-300 hover:bg-blue-50 dark:hover:bg-white/5"
                  }`}
                >
                  <FaUpload size={10} />
                  {uploading === uploadKey ? "Subiendo..." : "Subir desde el dispositivo"}
                </label>
                <input
                  id={`project-image-input-${i}`}
                  type="file"
                  accept="image/*"
                  disabled={uploading === uploadKey}
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await uploadImage(file, uploadKey);
                    if (url) {
                      const next = [...items];
                      next[i] = { ...next[i], image_url: url };
                      onChange(next);
                    }
                    e.target.value = "";
                  }}
                />
              </div>
              <input
                value={item.image_url ?? ""}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...next[i], image_url: e.target.value };
                  onChange(next);
                }}
                placeholder="...o pega una URL de imagen"
                className={inputClass}
              />
              {item.image_url && (
                <button
                  type="button"
                  onClick={() => {
                    const next = [...items];
                    next[i] = { ...next[i], image_url: "" };
                    onChange(next);
                  }}
                  className="text-red-500 text-xs flex items-center gap-1"
                >
                  <FaTrash size={10} /> Quitar imagen
                </button>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <input
                value={item.link ?? ""}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...next[i], link: e.target.value };
                  onChange(next);
                }}
                placeholder="Enlace (opcional, ej: /proyecto_x)"
                className={inputClass}
              />
              <input
                value={item.linkLabel ?? ""}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...next[i], linkLabel: e.target.value };
                  onChange(next);
                }}
                placeholder="Texto del botón (ej: Ver Detalles →)"
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-foreground/70">
                Ubicación (opcional, ej: un proyecto de construcción, un local,
                un evento). Si la completas, se muestra un mapa de Google Maps
                en la tarjeta.
              </p>
              <input
                value={item.location ?? ""}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...next[i], location: e.target.value };
                  onChange(next);
                }}
                placeholder="Dirección o nombre del lugar (ej: Av. Siempre Viva 123, Santiago)"
                className={inputClass}
              />
              {item.location && (
                <button
                  type="button"
                  onClick={() => {
                    const next = [...items];
                    next[i] = { ...next[i], location: "" };
                    onChange(next);
                  }}
                  className="text-red-500 text-xs flex items-center gap-1"
                >
                  <FaTrash size={10} /> Quitar ubicación
                </button>
              )}
            </div>
            <label className="flex items-center gap-2 text-sm">
              Color del título
              <input
                type="color"
                value={item.color || "#2563eb"}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...next[i], color: e.target.value };
                  onChange(next);
                }}
                className="w-10 h-8 cursor-pointer"
              />
            </label>
          </ItemShell>
        );
      })}
      <AddButton
        onClick={() =>
          onChange([...items, { title: "", description: "", link: "", linkLabel: "" }])
        }
        label="Agregar proyecto"
      />
    </div>
  );
}

/* ---------------- Editor de un rol de tipografía ----------------
   Se usa 3 veces (nombre del sitio, encabezados, texto general): tipo
   de letra (con opción de heredar y de subir una propia), tamaño (solo
   donde aplica) y color (solo donde aplica). */
export function TypographyRoleEditor({
  label,
  hint,
  value,
  onChange,
  allowInherit,
  showSize,
  showColor,
  onUploadFont,
}: {
  label: string;
  hint?: string;
  value: TypographyStyle;
  onChange: (next: Partial<TypographyStyle>) => void;
  allowInherit: boolean;
  showSize?: boolean;
  showColor?: boolean;
  onUploadFont: (file: File) => Promise<string | null>;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    const url = await onUploadFont(file);
    setUploading(false);
    if (!url) return;
    const guessedName = file.name.replace(/\.[^/.]+$/, "");
    onChange({
      font_family: "custom",
      custom_font_url: url,
      custom_font_name: value.custom_font_name || guessedName,
    });
  }

  return (
    <div className="space-y-3 border border-gray-200 dark:border-purple-700/40 rounded-xl p-4">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        {hint && <p className="text-xs text-[var(--admin-hint)] mt-0.5">{hint}</p>}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <FieldRow label="Tipo de tipografía">
          <select
            value={value.font_family}
            onChange={(e) => onChange({ font_family: e.target.value as TypographyStyle["font_family"] })}
            className={inputClass}
          >
            {allowInherit && <option value="inherit">Heredar (usar la de arriba)</option>}
            {FONT_FAMILY_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
            <option value="custom">Personalizada (subida)</option>
          </select>
        </FieldRow>

        {showSize && (
          <FieldRow label="Tamaño (px) — 0 = automático">
            <input
              type="number"
              min={0}
              max={160}
              value={value.font_size}
              onChange={(e) => onChange({ font_size: Number(e.target.value) || 0 })}
              className={inputClass}
            />
          </FieldRow>
        )}

        {showColor && (
          <FieldRow label="Color">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={value.color || "#000000"}
                onChange={(e) => onChange({ color: e.target.value })}
                className="w-12 h-10 cursor-pointer"
              />
              {value.color && (
                <button
                  type="button"
                  onClick={() => onChange({ color: "" })}
                  className="text-xs px-2 py-1 rounded-md border border-gray-300 dark:border-purple-700/50 hover:bg-gray-100 dark:hover:bg-white/5 transition"
                >
                  Restablecer
                </button>
              )}
            </div>
          </FieldRow>
        )}
      </div>

      {value.font_family === "custom" && (
        <div className="space-y-3 pt-1">
          <FieldRow label="Nombre para esta tipografía">
            <input
              value={value.custom_font_name}
              onChange={(e) => onChange({ custom_font_name: e.target.value })}
              placeholder="Ej: Mi Fuente Corporativa"
              className={inputClass}
            />
          </FieldRow>
          <label
            htmlFor={`font-file-${label}`}
            className={`flex items-center justify-center gap-2 text-sm px-4 py-3 rounded-lg border-2 border-dashed cursor-pointer transition ${
              uploading
                ? "border-gray-300 dark:border-purple-700/40 opacity-60 cursor-wait"
                : "border-blue-400 dark:border-purple-500/60 text-blue-600 dark:text-purple-300 hover:bg-blue-50 dark:hover:bg-white/5"
            }`}
          >
            <FaUpload size={12} />
            {uploading
              ? "Subiendo..."
              : value.custom_font_url
                ? "Reemplazar archivo de tipografía"
                : "Subir archivo de tipografía (.ttf, .otf, .woff, .woff2)"}
          </label>
          <input
            id={`font-file-${label}`}
            type="file"
            accept=".ttf,.otf,.woff,.woff2"
            disabled={uploading}
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              await handleFile(file);
              e.target.value = "";
            }}
          />
          {value.custom_font_url && (
            <p className="text-xs text-[var(--admin-hint)] break-all">
              Archivo actual: {value.custom_font_url}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
