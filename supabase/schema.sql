-- =========================================================
-- Ejecutar esto en Supabase → SQL Editor
-- Este script es idempotente: sirve tanto para crear la base
-- desde cero como para migrar una base ya existente (agrega
-- solo las columnas que falten, sin tocar tus datos actuales).
--
-- Plantilla genérica: los valores por defecto ya NO son de un
-- portafolio de desarrollador, sino textos neutros pensados
-- para que cualquier rubro (salud, ventas, servicios legales,
-- etc.) los reemplace desde el panel de administración.
-- =========================================================

-- 1) Tabla de configuración del sitio (una sola fila, id = 1)
create table if not exists site_settings (
  id int primary key default 1,
  primary_color text default '#2563eb',
  secondary_color text default '#9333ea',
  background_light text default '#f5f7fa',
  background_dark text default '#0b0722',
  font_family text default 'geist',
  hero_title text default 'Tu Nombre o Negocio',
  hero_subtitle text default 'Una frase corta que resuma lo que ofreces',
  logo_light_url text default '/logo-light.png',
  logo_dark_url text default '/logo-dark.png',
  banner_images jsonb default '[]',
  about_title text default 'Sobre mí / Sobre nosotros',
  about_text text default '',
  about_highlight text default '',
  github_url text default '',
  linkedin_url text default '',
  footer_text text default 'Tu Nombre o Negocio',
  news jsonb default '[]',
  show_about boolean default true,
  show_services boolean default true,
  show_stack boolean default true,
  show_projects boolean default true,
  show_news boolean default false,
  show_banner boolean default false,
  show_contact boolean default true,
  section_order jsonb default '["about","services","stack","projects","news","contact"]',
  updated_at timestamptz default now()
);

-- 1.1) Migración: columnas nuevas del panel "control total del home".
-- Cada línea es segura de re-ejecutar (IF NOT EXISTS).
alter table site_settings add column if not exists favicon_url text default '/favicon.ico';
alter table site_settings add column if not exists browser_tab_title text default 'Tu Nombre o Negocio | Landing Page';
alter table site_settings add column if not exists site_name text default 'Tu Nombre o Negocio';
alter table site_settings add column if not exists meta_description text default 'Sitio web profesional para presentar tus servicios, tu experiencia y tus datos de contacto.';

alter table site_settings add column if not exists default_theme text default 'light';
alter table site_settings add column if not exists enable_effects boolean default true;

alter table site_settings add column if not exists hero_terminal_lines jsonb default
  '["$ bienvenido_a_tu_sitio","$ personaliza_cada_seccion","$ listo_para_publicar ✓"]';
alter table site_settings add column if not exists hero_button_primary_label text default 'Ver Proyectos';
alter table site_settings add column if not exists hero_button_primary_href text default '#proyectos';
alter table site_settings add column if not exists hero_button_secondary_label text default 'Contactar';
alter table site_settings add column if not exists hero_button_secondary_href text default '#contacto';

alter table site_settings add column if not exists about_soft_skills_title text default 'Fortalezas';
alter table site_settings add column if not exists about_soft_skills jsonb default
  '["Atención al cliente","Puntualidad","Comunicación efectiva","Compromiso con la calidad"]';
alter table site_settings add column if not exists about_stack_title text default 'Datos rápidos';
alter table site_settings add column if not exists about_stack_facts jsonb default '[]';
alter table site_settings add column if not exists about_focus_label text default 'Enfoque actual:';
alter table site_settings add column if not exists about_focus_text text default '';
alter table site_settings add column if not exists about_social_title text default 'Redes y enlaces';

alter table site_settings add column if not exists services_title text default 'Servicios';
alter table site_settings add column if not exists services_description text default '';
alter table site_settings add column if not exists services_items jsonb default '[]';
alter table site_settings add column if not exists services_cta_label text default 'Solicitar información';
alter table site_settings add column if not exists services_cta_href text default '#contacto';

alter table site_settings add column if not exists stack_title text default 'Habilidades y Especialidades';
alter table site_settings add column if not exists stack_items jsonb default '[]';

alter table site_settings add column if not exists projects_title text default 'Proyectos y Casos Destacados';
alter table site_settings add column if not exists projects_items jsonb default '[]';

alter table site_settings add column if not exists contact_title text default 'Contacto:';

-- Nota: si tu base de datos venía de una versión anterior con la sección
-- "Ciberseguridad", las columnas security_title / security_items /
-- show_security pueden seguir existiendo con datos antiguos. Ya no se usan
-- en la aplicación y puedes eliminarlas manualmente si quieres (opcional):
-- alter table site_settings drop column if exists security_title;
-- alter table site_settings drop column if exists security_items;
-- alter table site_settings drop column if exists show_security;

-- Fila inicial (si no existe)
insert into site_settings (id) values (1)
on conflict (id) do nothing;

-- 2) Seguridad a nivel de fila (RLS)
alter table site_settings enable row level security;

-- Cualquier visitante puede LEER la configuración (para que el home público funcione)
drop policy if exists "Lectura pública de site_settings" on site_settings;
create policy "Lectura pública de site_settings"
on site_settings for select
to anon, authenticated
using (true);

-- Solo un usuario autenticado (el admin) puede modificarla
drop policy if exists "Solo admin puede escribir site_settings" on site_settings;
create policy "Solo admin puede escribir site_settings"
on site_settings for insert
to authenticated
with check (true);

drop policy if exists "Solo admin puede actualizar site_settings" on site_settings;
create policy "Solo admin puede actualizar site_settings"
on site_settings for update
to authenticated
using (true)
with check (true);

-- 3) Bucket de almacenamiento para imágenes subidas desde el panel
-- (se reutiliza también para el favicon)
insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do nothing;

-- Cualquiera puede VER las imágenes (son públicas, es un sitio web)
drop policy if exists "Lectura pública de imágenes" on storage.objects;
create policy "Lectura pública de imágenes"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'site-images');

-- Solo un usuario autenticado puede subir/editar imágenes
drop policy if exists "Solo admin puede subir imágenes" on storage.objects;
create policy "Solo admin puede subir imágenes"
on storage.objects for insert
to authenticated
with check (bucket_id = 'site-images');

drop policy if exists "Solo admin puede actualizar imágenes" on storage.objects;
create policy "Solo admin puede actualizar imágenes"
on storage.objects for update
to authenticated
using (bucket_id = 'site-images');

-- =========================================================
-- Después de correr esto, crea tu usuario admin en:
-- Supabase → Authentication → Users → Add user
-- (usa el correo y contraseña con los que vas a iniciar sesión
-- en /login/admin)
-- =========================================================
