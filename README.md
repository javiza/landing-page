# Landing page personalizable (multi-rubro)

Plantilla de landing page en **Next.js + Supabase**, pensada para
venderse o arrendarse a cualquier profesional o negocio: contadores,
abogados, doctores, agencias, comercios, etc.

Todo el contenido del sitio (textos, colores, logo, secciones visibles
y su orden, servicios, "sobre mí/nosotros", proyectos/casos, redes
sociales, footer, banner, noticias) se edita desde un **panel de
administración** (`/login/admin`) sin tocar código. Los valores por
defecto son textos neutros ("Tu Nombre o Negocio", "Describe aquí tus
servicios...") listos para que cada cliente los reemplace con lo suyo.

## Características

- Panel `/admin` protegido con Supabase Auth.
- Configuración guardada en la tabla `site_settings` de Supabase
  (una fila por sitio).
- Subida de imágenes (logo claro/oscuro, favicon, banner) a Supabase
  Storage.
- Modo claro/oscuro, partículas de fondo y animaciones activables u
  desactivables desde el panel.
- Secciones activables/desactivables y reordenables: Sobre mí/nosotros,
  Servicios, Habilidades/Especialidades, Proyectos/Casos, Noticias,
  Contacto.
- Formulario de contacto por correo (opcional, vía Gmail).
- SEO listo: metadata dinámica, Open Graph, `sitemap.xml`, `robots.txt`
  y datos estructurados (JSON-LD).

## Desarrollo local

```bash
npm install
cp .env.local.example .env.local   # completa tus credenciales de Supabase
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Variables de entorno

Ver [`.env.local.example`](./.env.local.example) para la lista completa
y comentada (Supabase, formulario de contacto y SEO).

## Desplegar en Render + Supabase

Guía paso a paso completa en [`DEPLOY.md`](./DEPLOY.md), incluyendo
cómo configurar Supabase (tabla, autenticación, storage), desplegar en
Render (con `render.yaml` o manualmente) y cómo replicar el proceso
para cada cliente nuevo.

## Dominio propio (.cl u otros)

Ver [`GUIA-DOMINIO-CL.md`](./GUIA-DOMINIO-CL.md).

## Stack técnico

- [Next.js](https://nextjs.org) (App Router)
- [Supabase](https://supabase.com) (base de datos, auth, storage)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/) + tsparticles
# landing-page
