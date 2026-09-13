# Guía: hosting, dominio .cl y nombres personalizados en Render

## 1. ¿Necesitas hosting pagado?

Tu portafolio es Next.js. Opciones reales, de menor a mayor esfuerzo:

- **Vercel** (recomendado para el portafolio): plan gratuito ya sirve para
  un portafolio personal. Solo pagas si necesitas más recursos o un plan Pro
  ($20 USD/mes) por ancho de banda alto o funciones avanzadas de equipo.
- **Render** (recomendado para este proyecto): tiene plan gratuito
  (se "duerme" tras inactividad) y planes pagados desde ~$7 USD/mes
  (Starter) que mantienen la app siempre activa, sin "cold start".
- **VPS propio** (DigitalOcean, Hetzner, etc.): más control, más trabajo de
  mantenimiento (~$5–6 USD/mes). Solo vale la pena si vas a alojar varios
  proyectos o necesitas configuraciones especiales.

Para empezar, **no necesitas pagar hosting**: puedes comprar solo el
dominio `.cl` y apuntarlo a Vercel/Render gratis. Pagas cuando el tráfico
o los "cold starts" te empiecen a molestar.

## 2. Comprar un dominio .cl

Los dominios `.cl` se compran a través de **NIC Chile** (https://www.nic.cl)
o revendedores autorizados (varían en precio y facilidad de uso):

- NIC Chile directo (~$8.500–12.000 CLP/año aprox., varía)
- Revendedores como HostGator Chile, GoDaddy (algunos no ofrecen .cl
  directo, verifica), o proveedores chilenos como EcoHosting o Ecuadorable.

Pasos generales:
1. Entra a nic.cl → "Inscribir dominio" → busca el nombre disponible
   (ej. `tunegocio.cl`).
2. Necesitas RUT (persona natural o empresa) para inscribirlo.
3. Paga (tarjeta o transferencia) y confirma por el correo de verificación.
4. Una vez inscrito, entras al panel de NIC Chile para gestionar los
   **registros DNS** del dominio.

## 3. Apuntar el dominio .cl a tu hosting

### Si usas Vercel (portafolio)
1. En Vercel → tu proyecto → **Settings → Domains** → agrega
   `tudominio.cl`.
2. Vercel te da valores DNS a configurar (normalmente un registro
   **A** apuntando a una IP, o un **CNAME** si usas subdominio como
   `www.tudominio.cl`).
3. En el panel de NIC Chile (o donde administres el DNS), agrega esos
   registros exactamente como los indica Vercel.
4. Espera la propagación DNS (minutos a 24 hrs). Vercel emite el
   certificado SSL (https) automáticamente.

### Si usas Render (recomendado)
1. En Render → tu servicio → **Settings → Custom Domain** → agrega
   `tudominio.cl` o un subdominio como `contacto.tudominio.cl`.
2. Render te entrega un registro **CNAME** (para subdominios) o
   instrucciones de **A/ALIAS** (para el dominio raíz).
3. Agrega ese registro en el DNS de tu dominio (NIC Chile).
4. Render valida el dominio y emite SSL automáticamente cuando el DNS
   propaga.

## 4. Renombrar la URL de tus apps (ej. "minegocio")

Hay dos cosas distintas — conviene no confundirlas:

**a) El nombre del servicio en Render** (ej. cambiar
`mi-negocio-abc12` por algo más corto): se puede renombrar el
servicio desde Render → tu servicio → Settings → "Name". Esto cambia
solo el nombre interno/visible en tu dashboard, pero **no cambia
automáticamente la URL `onrender.com`** en todos los casos — a veces
Render mantiene el sufijo original o genera uno nuevo con hash. Es decir,
renombrar el servicio no te garantiza una URL bonita tipo
`minegocio.onrender.com`; para eso el nombre debe estar disponible
como subdominio de onrender.com.

**b) Un dominio propio con el nombre real del negocio** (la forma
recomendada y profesional): esto es justo el paso 2 y 3 de arriba.
Compras `tunegocio.cl`, lo apuntas a tu servicio de Render (o
Vercel), y así tu app queda accesible en `www.tunegocio.cl` en vez
de la URL genérica de Render. Esta es la vía correcta si quieres que la
marca de tu negocio se vea en la URL — un dominio propio, no un
truco dentro de Render.

### Resumen práctico
- Si solo quieres una URL más bonita gratis → intenta renombrar el
  servicio en Render (puede o no funcionar según disponibilidad).
- Si quieres verte profesional para un cliente real (ej. la agencia de
  cliente real) → compra el dominio `.cl` con el nombre de la empresa y
  apúntalo al servicio en Render con un Custom Domain. Esta es la opción
  que de verdad "cambia el nombre" de forma confiable y además te da
  SSL y mejor percepción de marca.

## 5. Posicionamiento en buscadores (SEO) — próximos pasos manuales

El código ya deja listos: metadata completa, Open Graph, sitemap.xml,
robots.txt y datos estructurados. Para que Google realmente empiece a
mostrar el sitio, faltan pasos manuales que no se pueden automatizar
desde el código:

1. **Google Search Console** (search.google.com/search-console):
   agrega tu dominio, verifica la propiedad (Vercel/Render dan un
   registro TXT para esto) y envía tu `sitemap.xml`.
2. **Bing Webmaster Tools**: mismo proceso, menor prioridad pero gratis.
3. Consigue **backlinks**: que tu perfil de GitHub, LinkedIn y, si
   aplica, directorios de freelancers, enlacen a tu portafolio — eso
   ayuda más al posicionamiento que casi cualquier otra cosa al inicio.
4. Actualiza el contenido de vez en cuando (nuevos proyectos, blog
   corto) — Google prioriza sitios que se actualizan.
5. Ten paciencia: un sitio nuevo suele tardar semanas a un par de meses
   en empezar a indexarse y aparecer en resultados relevantes.
