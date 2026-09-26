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

/* ---------------- Lista de habilidades con ícono (Stack / Seguridad) ---------------- */
export function SkillItemsEditor({
  items,
  onChange,
}: {
  items: SkillItem[];
  onChange: (next: SkillItem[]) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2 border border-gray-200 dark:border-purple-700/40 rounded-xl p-3 bg-gray-50/60 dark:bg-white/[0.03]"
          >
            <div className="text-xl text-blue-600 dark:text-purple-300 shrink-0">
              {getIcon(item.icon)}
            </div>
            <select
              value={item.icon}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...next[i], icon: e.target.value };
                onChange(next);
              }}
              className={inputClass + " w-32 shrink-0"}
            >
              {ICON_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
            <input
              value={item.name}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...next[i], name: e.target.value };
                onChange(next);
              }}
              placeholder="Nombre (ej: Docker)"
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
      </div>
      <AddButton
        onClick={() => onChange([...items, { name: "", icon: "code" }])}
        label="Agregar habilidad"
      />
    </div>
  );
}

/* ---------------- Lista de proyectos ---------------- */
export function ProjectItemsEditor({
  items,
  onChange,
}: {
  items: ProjectItem[];
  onChange: (next: ProjectItem[]) => void;
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
      ))}
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
        {hint && <p className="text-xs text-foreground/60 mt-0.5">{hint}</p>}
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
            <p className="text-xs text-foreground/60 break-all">
              Archivo actual: {value.custom_font_url}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
