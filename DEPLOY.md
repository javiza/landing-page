# Guía de despliegue — Render + Supabase

Esta plantilla está pensada para venderse/arrendarse como landing page
personalizable a cualquier tipo de negocio o profesional (contador,
abogado, doctor, agencia, comercio, etc.). Cada cliente nuevo = un
proyecto de Supabase nuevo + un servicio de Render nuevo, usando este
mismo código.

## 0. Resumen del stack

- **Next.js** (App Router) — el sitio en sí.
- **Supabase** — base de datos (tabla `site_settings`), autenticación del
  panel de administración y almacenamiento de imágenes (logo, favicon,
  banner).
- **Render** — hosting del sitio (Web Service de Node).
- Todo el contenido (textos, colores, secciones visibles, imágenes,
  servicios, proyectos, etc.) se edita desde `/login/admin` sin tocar
  código.

## 1. Crear el proyecto en Supabase

1. Entra a [supabase.com](https://supabase.com) → **New project**.
2. Elige nombre, región (idealmente la más cercana a tus clientes) y
   contraseña de base de datos.
3. Cuando el proyecto esté listo, ve a **SQL Editor** → pega el
   contenido completo de [`supabase/schema.sql`](./supabase/schema.sql)
   → **Run**. Esto crea:
   - La tabla `site_settings` con una fila inicial y textos genéricos
     por defecto.
   - Las políticas de seguridad (RLS): cualquiera puede leer la
     configuración (para que el sitio público funcione), pero solo un
     usuario autenticado puede modificarla.
   - El bucket público `site-images` para las imágenes que se suban
     desde el panel.
4. Ve a **Authentication → Users → Add user** y crea el usuario admin
   (correo + contraseña) con el que el dueño del sitio va a entrar a
   `/login/admin`. Puedes crear uno por cada cliente si administras
   varios sitios.
5. Ve a **Project Settings → API** y copia:
   - **Project URL** → será `NEXT_PUBLIC_SUPABASE_URL`.
   - **anon public key** → será `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## 2. (Opcional) Formulario de contacto por correo

El endpoint `/app/api/contacto/route.ts` envía los mensajes del
formulario de contacto por Gmail. Si el cliente quiere usar este
formulario:

1. En la cuenta de Gmail que va a enviar los correos, activa la
   verificación en 2 pasos.
2. Genera una **contraseña de aplicación** en
   [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
3. Guarda esos valores para el paso 4 (`CONTACT_EMAIL_USER`,
   `CONTACT_EMAIL_PASS`, `CONTACT_EMAIL_TO`).

Si no vas a usar el formulario, simplemente no definas esas variables:
el endpoint responderá con un error controlado en vez de romper el
sitio.

## 3. Subir el código a un repositorio

Cada cliente puede compartir el mismo repositorio (con distintas
variables de entorno por sitio) o tener su propio fork. Lo más simple
para vender el servicio es:

```bash
git init
git add .
git commit -m "Landing page personalizable"
git remote add origin https://github.com/tu-usuario/tu-repo.git
git push -u origin main
```

## 4. Desplegar en Render

### Opción A — Blueprint (más rápido)

1. En Render → **New → Blueprint** → conecta el repositorio.
2. Render detecta [`render.yaml`](./render.yaml) y crea el servicio.
3. Ve a tu servicio → **Environment** y completa las variables que
   quedaron marcadas como "secret"/vacías:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (ej. `https://www.tunegocio.cl`, o la URL
     `.onrender.com` mientras no tengas dominio propio)
   - `CONTACT_EMAIL_USER`, `CONTACT_EMAIL_PASS`, `CONTACT_EMAIL_TO`
     (solo si usarás el formulario de contacto)
4. Guarda — Render vuelve a desplegar automáticamente con las nuevas
   variables.

### Opción B — Web Service manual

1. En Render → **New → Web Service** → conecta el repositorio.
2. Configura:
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
3. Agrega las mismas variables de entorno del paso anterior.
4. Deploy.

> Nota sobre el plan gratuito de Render: el servicio "se duerme" tras
> un rato de inactividad y tarda unos segundos en despertar con la
> primera visita. Para un sitio que no puede tener ese retraso (por
> ejemplo, un cliente que paga por el servicio), usa el plan Starter
> (siempre activo).

## 5. Verificar que todo funciona

1. Abre la URL que te dio Render (`https://tu-servicio.onrender.com`).
   Deberías ver la landing con los textos genéricos por defecto
   ("Tu Nombre o Negocio", etc.).
2. Entra a `/login/admin` con el usuario que creaste en Supabase.
3. Personaliza: colores, logo, textos del hero, servicios, "sobre
   mí/nosotros", proyectos/casos, redes sociales, footer, y qué
   secciones mostrar/ocultar y en qué orden.
4. Si activaste el formulario de contacto, envíate un mensaje de
   prueba desde el sitio público.

## 6. Dominio propio (opcional)

Ver [`GUIA-DOMINIO-CL.md`](./GUIA-DOMINIO-CL.md) para los pasos de
comprar un dominio `.cl` y apuntarlo a Render (aplica el mismo proceso,
con otro proveedor, para dominios `.com` u otros).

## 7. Replicar para un nuevo cliente

Para vender este mismo producto a otro cliente (otro contador, otro
doctor, etc.):

1. Repite el paso 1 (nuevo proyecto de Supabase).
2. Repite el paso 4 (nuevo servicio en Render, mismo repositorio o un
   fork, apuntando a las credenciales del nuevo proyecto de Supabase).
3. El cliente entra a su propio `/login/admin` y carga su propio
   contenido — no hay nada que tocar en el código.
