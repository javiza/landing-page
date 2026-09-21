"use client";

import { useTheme } from "next-themes";
import { motion, AnimatePresence, type HTMLMotionProps } from "framer-motion";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { FaLink } from "react-icons/fa";

import BackgroundParticles from "./components/BackgroundParticles";
import { DEFAULT_SETTINGS, type SiteSettings } from "../types/settings";
import { getIcon } from "../lib/icons";

// Cuando enable_effects está apagado, estos wrappers renderizan un <div>/<a>
// plano en vez de un componente animado de framer-motion. Así el
// administrador puede desactivar partículas + animaciones sin que el resto
// del código tenga que duplicarse.
function MotionDiv({
  enabled,
  className,
  children,
  ...motionProps
}: { enabled: boolean; className?: string; children?: ReactNode } & HTMLMotionProps<"div">) {
  if (!enabled) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} {...motionProps}>
      {children}
    </motion.div>
  );
}

function MotionA({
  enabled,
  className,
  children,
  href,
  target,
  ...motionProps
}: { enabled: boolean; className?: string; children?: ReactNode; href: string; target?: string } & HTMLMotionProps<"a">) {
  if (!enabled)
    return (
      <a href={href} target={target} className={className}>
        {children}
      </a>
    );
  return (
    <motion.a href={href} target={target} className={className} {...motionProps}>
      {children}
    </motion.a>
  );
}

// Radio de borde real (px) según la "forma" de botón elegida en el panel.
const BUTTON_RADIUS: Record<SiteSettings["button_shape"], string> = {
  full: "9999px",
  rounded: "1rem",
  square: "0.25rem",
};

// Carrusel animado del banner: cambia solo, con transición deslizante +
// zoom lento sobre la imagen activa, flechas, puntitos de navegación, y
// se pausa mientras el mouse está encima. Si el admin apagó los
// "efectos" del panel, se muestra una versión simple sin animación
// (solo cambia de imagen, sin transiciones ni zoom).
function AnimatedBanner({
  images,
  fx,
  accentColor,
  radius,
}: {
  images: { url: string; caption?: string }[];
  fx: boolean;
  accentColor: string;
  radius: string;
}) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const total = images.length;

  useEffect(() => {
    if (total <= 1 || paused) return;
    const id = setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % total);
    }, 4500);
    return () => clearInterval(id);
  }, [total, paused]);

  if (total === 0) return null;

  function goTo(next: number) {
    const wrapped = ((next % total) + total) % total;
    setDirection(next > index ? 1 : -1);
    setIndex(wrapped);
  }

  const current = images[index];

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div
      className="relative w-full max-w-4xl mx-auto"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="relative h-64 sm:h-80 md:h-96 overflow-hidden shadow-xl"
        style={{ borderRadius: radius }}
      >
        {fx ? (
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={index}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.55, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <motion.img
                src={current.url}
                alt={current.caption ?? ""}
                className="w-full h-full object-cover"
                initial={{ scale: 1 }}
                animate={{ scale: 1.08 }}
                transition={{ duration: 5, ease: "linear" }}
              />
              {current.caption && (
                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white text-center py-4 px-4 font-medium"
                >
                  {current.caption}
                </motion.p>
              )}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="absolute inset-0">
            <img
              src={current.url}
              alt={current.caption ?? ""}
              className="w-full h-full object-cover"
            />
            {current.caption && (
              <p className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-center py-3">
                {current.caption}
              </p>
            )}
          </div>
        )}

        {total > 1 && (
          <>
            <button
              onClick={() => goTo(index - 1)}
              aria-label="Imagen anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition text-lg"
            >
              ‹
            </button>
            <button
              onClick={() => goTo(index + 1)}
              aria-label="Imagen siguiente"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition text-lg"
            >
              ›
            </button>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Ir a la imagen ${i + 1}`}
              className="h-2.5 rounded-full transition-all"
              style={{
                width: i === index ? "1.75rem" : "0.625rem",
                backgroundColor: i === index ? accentColor : "rgba(150,150,150,0.4)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function HomeClient({ settings }: { settings: SiteSettings }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const fx = settings.enable_effects;

  // Estilo compartido por TODOS los botones "sólidos" del sitio (hero,
  // servicios, redes, proyectos, formulario de contacto). Se usa como
  // inline style (no clases de Tailwind) para que el color y la forma
  // sean 100% editables desde el panel y se vean también en la vista
  // previa en vivo del admin, sin depender de variables CSS globales.
  const btnRadius = BUTTON_RADIUS[settings.button_shape] ?? BUTTON_RADIUS.full;
  const btnStyle: React.CSSProperties = {
    backgroundColor: settings.button_bg_color,
    color: settings.button_text_color,
    borderRadius: btnRadius,
  };
  const btnOutlineStyle: React.CSSProperties = {
    borderColor: settings.button_bg_color,
    color: settings.button_bg_color,
    borderRadius: btnRadius,
    borderWidth: 2,
    borderStyle: "solid",
  };

  // Alineación de cada sección (izquierda / centro / derecha), definida
  // desde el panel en "Secciones y orden". Al alinear a un lado, la
  // sección se desplaza dentro de la página (no solo el texto), para
  // que realmente se pueda "acomodar" contra un borde u otro.
  function sectionAlignStyle(key: string): React.CSSProperties {
    const align = settings.section_align?.[key] ?? "center";
    if (align === "left") return { marginLeft: 0, marginRight: "auto", textAlign: "left" };
    if (align === "right") return { marginLeft: "auto", marginRight: 0, textAlign: "right" };
    return {};
  }

  const sectionVisible: Record<string, boolean> = {
    about: settings.show_about,
    services: settings.show_services,
    stack: settings.show_stack,
    banner: settings.show_banner && settings.banner_images.length > 0,
    projects: settings.show_projects,
    news: settings.show_news && settings.news.length > 0,
    contact: settings.show_contact,
  };

  // Cada sección fija se arma una sola vez acá. El orden real en el home
  // (más abajo) sale de settings.section_order, no del orden en que estas
  // constantes quedan escritas.
  const aboutSection = (
    <section
      key="about"
      className="px-8 py-20 max-w-6xl mx-auto"
      style={sectionAlignStyle("about")}
    >
      <h2
        className="title-section mb-12"
        style={{ textAlign: sectionAlignStyle("about").textAlign ?? "center" }}
      >
        <strong>{settings.about_section_title}</strong>
      </h2>

      <div className="grid md:grid-cols-2 gap-10">
        {/* COLUMNA IZQUIERDA */}
        <div className="card space-y-6">
          <h3 className="text-2xl font-semibold">{settings.about_title}</h3>

          <p className="text-foreground/75 leading-relaxed">{settings.about_text}</p>

          {settings.about_highlights && settings.about_highlights.length > 0 && (
            <div className="space-y-3">
              {settings.about_highlights.map((highlight, i) => (
                <div key={i} className="p-4 rounded-xl bg-brand-2/10 border border-brand-2/20">
                  <p className="text-foreground/85 leading-relaxed whitespace-pre-line">
                    {highlight}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* HABILIDADES BLANDAS */}
          {settings.about_soft_skills.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">{settings.about_soft_skills_title}</h4>
              <ul className="list-disc list-inside text-foreground/75 space-y-1">
                {settings.about_soft_skills.map((skill, i) => (
                  <li key={i}>{skill}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA */}
        <div className="card space-y-4">
          <h4 className="text-xl font-semibold mb-2">{settings.about_stack_title}</h4>

          <div className="space-y-3 text-foreground/75">
            {settings.about_stack_facts.map((fact, i) => (
              <p key={i}>
                <strong>{fact.label}:</strong> {fact.value}
              </p>
            ))}
          </div>

          {/* EXTRA DESTACADO */}
          {settings.about_focus_text && (
            <div className="mt-6 p-4 rounded-xl bg-brand-2/10 border border-brand-2/20">
              <p className="text-sm font-medium text-foreground/85">{settings.about_focus_label}</p>
              <p className="font-bold text-brand">{settings.about_focus_text}</p>
            </div>
          )}
          {settings.about_social_title && (
            <h2 className="text-xl font-semibold mb-2">{settings.about_social_title}</h2>
          )}

          <div className="flex flex-wrap justify-center gap-6">
            {settings.github_url && (
              <MotionA
                enabled={fx}
                href={settings.github_url}
                target="_blank"
                whileHover={{ scale: 1.08 }}
                className="flex items-center gap-3 px-6 py-3 shadow-lg"
                style={btnStyle}
              >
                <FaLink className="text-xl" /> Enlace 1
              </MotionA>
            )}

            {settings.linkedin_url && (
              <MotionA
                enabled={fx}
                href={settings.linkedin_url}
                target="_blank"
                whileHover={{ scale: 1.08 }}
                className="flex items-center gap-3 px-6 py-3 shadow-lg"
                style={btnStyle}
              >
                <FaLink className="text-xl" /> Enlace 2
              </MotionA>
            )}
          </div>
        </div>
      </div>
    </section>
  );

  const servicesSection = (
    <section
      key="services"
      className="px-8 py-20 max-w-6xl mx-auto"
      style={sectionAlignStyle("services")}
    >
      <h2
        className="title-section mb-4"
        style={{ textAlign: sectionAlignStyle("services").textAlign ?? "center" }}
      >
        {settings.services_title}
      </h2>
      {settings.services_description && (
        <p className="max-w-2xl mx-auto text-center text-foreground/75 mb-12 whitespace-pre-line">
          {settings.services_description}
        </p>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {settings.services_items.map((item, i) => (
          <MotionDiv enabled={fx} key={i} whileHover={{ scale: 1.04 }} className="card">
            <h3 className="text-xl font-semibold text-brand">{item.title}</h3>
            <p className="mt-3 text-foreground/85 whitespace-pre-line">{item.description}</p>
          </MotionDiv>
        ))}
      </div>

      {settings.services_cta_label && (
        <div className="flex justify-center mt-10">
          <a
            href={settings.services_cta_href || "#"}
            className="px-8 py-3 font-semibold shadow-lg hover:scale-105 transition-all"
            style={btnStyle}
          >
            {settings.services_cta_label}
          </a>
        </div>
      )}
    </section>
  );

  const stackSection = (
    <section
      key="stack"
      className="px-8 py-20 max-w-6xl mx-auto"
      style={sectionAlignStyle("stack")}
    >
      <h2
        className="title-section mb-12"
        style={{ textAlign: sectionAlignStyle("stack").textAlign ?? "center" }}
      >
        {settings.stack_title}
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {settings.stack_items.map((skill, i) => (
          <MotionDiv
            enabled={fx}
            key={i}
            whileHover={{ scale: 1.08, rotate: 1 }}
            className="flex flex-col items-center gap-2 
bg-card 
border border-card-border 
shadow-md hover:shadow-xl hover:-translate-y-1
transition duration-300 rounded-xl p-4"
          >
            <div className="text-4xl text-brand">{getIcon(skill.icon)}</div>
            <p className="font-semibold text-foreground">{skill.name}</p>
          </MotionDiv>
        ))}
      </div>
    </section>
  );

  const bannerSection = (
    <section
      key="banner"
      className="px-8 py-10 max-w-6xl mx-auto"
      style={sectionAlignStyle("banner")}
    >
      <AnimatedBanner
        images={settings.banner_images}
        fx={fx}
        accentColor={settings.primary_color}
        radius={btnRadius}
      />
    </section>
  );

  const newsSection = (
    <section
      key="news"
      className="px-8 py-20 max-w-6xl mx-auto"
      style={sectionAlignStyle("news")}
    >
      <h2
        className="title-section mb-12"
        style={{ textAlign: sectionAlignStyle("news").textAlign ?? "center" }}
      >
        {settings.news_title}
      </h2>
      <div className="grid md:grid-cols-2 gap-6">
        {settings.news.map((n, i) => (
          <div key={i} className="card">
            <h3 className="text-xl font-semibold text-brand">{n.title}</h3>
            {n.date && <p className="text-xs text-foreground/55 mt-1">{n.date}</p>}
            <p className="mt-3 text-foreground/85">{n.content}</p>
          </div>
        ))}
      </div>
    </section>
  );

  const projectsSection = (
    <section key="projects" id="proyectos" className="px-8 py-10">
      <h2
        className="title-section mb-12"
        style={{ textAlign: sectionAlignStyle("projects").textAlign }}
      >
        {settings.projects_title}
      </h2>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto"
        style={sectionAlignStyle("projects")}
      >
        {settings.projects_items.map((project, i) => (
          <MotionDiv enabled={fx} key={i} whileHover={{ scale: 1.04 }} className="card">
            <h3
              className="text-2xl font-semibold"
              style={project.color ? { color: project.color } : undefined}
            >
              {project.title}
            </h3>

            <p className="mt-3 text-foreground/85 whitespace-pre-line">{project.description}</p>

            {project.link && (
              <Link
                href={project.link}
                className="mt-5 inline-block px-5 py-2"
                style={btnStyle}
              >
                {project.linkLabel || "Ver Detalles →"}
              </Link>
            )}
          </MotionDiv>
        ))}
      </div>
    </section>
  );

  const contactSection = (
    <section
      key="contact"
      id="contacto"
      className="px-8 py-20 max-w-3xl mx-auto"
      style={sectionAlignStyle("contact")}
    >
      <h2
        className="title-section mb-12"
        style={{ textAlign: sectionAlignStyle("contact").textAlign ?? "center" }}
      >
        {settings.contact_title}
      </h2>
      <form
        className="card flex flex-col gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;

          const data = {
            nombre: form.nombre.value,
            email: form.email.value,
            mensaje: form.mensaje.value,
          };

          const res = await fetch("/api/contacto", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });

          alert(res.ok ? "Mensaje enviado!" : "Error al enviar.");
          form.reset();
        }}
      >
        <input
          name="nombre"
          placeholder="Tu nombre"
          required
          className="border border-card-border bg-card text-foreground placeholder-foreground/40 p-3 rounded-lg"
        />
        <input
          name="email"
          type="email"
          placeholder="Tu correo"
          required
          className="border border-card-border bg-card text-foreground placeholder-foreground/40 p-3 rounded-lg"
        />
        <textarea
          name="mensaje"
          rows={5}
          placeholder="Mensaje..."
          required
          className="border border-card-border bg-card text-foreground placeholder-foreground/40 p-3 rounded-lg"
        ></textarea>

        <button className="px-6 py-3" style={btnStyle}>
          Enviar mensaje
        </button>
      </form>
    </section>
  );

  const builtinSections: Record<string, ReactNode> = {
    about: aboutSection,
    services: servicesSection,
    stack: stackSection,
    banner: bannerSection,
    news: newsSection,
    projects: projectsSection,
    contact: contactSection,
  };

  // Todas las claves fijas visibles, en el orden guardado. Cualquier
  // clave fija que falte en section_order (sitios viejos que aún no la
  // tenían guardada) se agrega al final para no perderla del home.
  const orderedKeys = [...settings.section_order];
  for (const key of Object.keys(builtinSections)) {
    if (!orderedKeys.includes(key)) orderedKeys.push(key);
  }
  for (const custom of settings.custom_sections) {
    const key = `custom:${custom.id}`;
    if (!orderedKeys.includes(key)) orderedKeys.push(key);
  }

  const renderedSections = orderedKeys.map((key) => {
    if (key.startsWith("custom:")) {
      const id = key.slice("custom:".length);
      const custom = settings.custom_sections.find((c) => c.id === id);
      if (!custom) return null;
      return (
        <section
          key={key}
          className="px-8 py-20 max-w-6xl mx-auto"
          style={sectionAlignStyle(key)}
        >
          <h2
            className="title-section mb-8"
            style={{ textAlign: sectionAlignStyle(key).textAlign ?? "center" }}
          >
            {custom.title}
          </h2>
          <div className="card whitespace-pre-line text-foreground/85 leading-relaxed">
            {custom.content}
          </div>
        </section>
      );
    }

    if (sectionVisible[key] === false) return null;
    return builtinSections[key] ?? null;
  });

  const hasPageBg = Boolean(settings.page_bg_image_url);
  const hasHeroBg = Boolean(settings.hero_bg_image_url);

  return (
    // El color de fondo real ahora se fija por request en layout.tsx
    // (variables --background y --background-dark-base en :root/.dark),
    // que es de donde globals.css lo toma para pintar <body>. Poner un
    // --background aquí no hacía nada porque main es descendiente de
    // body, no al revés.
    <main className="min-h-screen bg-background text-foreground transition-colors duration-300 relative isolate">
      {/* FONDO DE PÁGINA COMPLETA (opcional, independiente de las partículas) */}
      {hasPageBg && (
        <div
          aria-hidden
          className="fixed inset-0 pointer-events-none bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: `url(${settings.page_bg_image_url})`,
            opacity: settings.page_bg_image_opacity,
            zIndex: -2,
          }}
        />
      )}

      {fx && <BackgroundParticles />}

      {/* BOTÓN DE TEMA */}
      <button
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="fixed top-5 right-5 p-3 rounded-full shadow-lg 
        bg-card
        border border-card-border
        text-foreground
        hover:scale-110 transition-all z-50"
      >
        {theme === "light" ? "🌙" : "✨"}
      </button>

      {/* HERO */}
      <section className="relative isolate flex flex-col items-center text-center pt-24 px-6 gap-4 overflow-hidden">
        {hasHeroBg && (
          <>
            <div
              aria-hidden
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${settings.hero_bg_image_url})`, zIndex: -1 }}
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-black"
              style={{ opacity: settings.hero_bg_overlay_opacity, zIndex: -1 }}
            />
          </>
        )}
        <MotionDiv
          enabled={fx}
          key={resolvedTheme} // 🔥 esto fuerza animación al cambiar tema
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* Tamaño editable desde el panel (logo_width, en px). El alto es
              automático para no deformar la imagen, y max-width evita que
              se salga de la pantalla en móvil. <img> plano (no next/image)
              para que también funcionen URLs pegadas de cualquier dominio. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolvedTheme === "dark" ? settings.logo_light_url : settings.logo_dark_url}
            alt="Logo"
            style={{
              width: `${settings.logo_width || DEFAULT_SETTINGS.logo_width}px`,
              maxWidth: "100%",
              height: "auto",
            }}
          />
        </MotionDiv>

        {/* TITULO PRINCIPAL */}
        <h2
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold max-w-3xl"
          style={{ color: settings.primary_color }}
        >
          {settings.hero_title}
        </h2>

        {/* LINEA MODERNA */}
        <div
          className="w-24 sm:w-40 md:w-56 lg:w-72 h-1 rounded-full mx-auto"
          style={{ backgroundColor: settings.primary_color }}
        ></div>
        {/* ESPECIALIZACIÓN */}
        {settings.hero_subtitle && (
          <p className="text-lg sm:text-xl font-bold text-foreground">{settings.hero_subtitle}</p>
        )}

        {/* TERMINAL EFFECT */}
        {settings.hero_terminal_lines.length > 0 && (
          <MotionDiv
            enabled={fx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-4 space-y-1"
          >
            {settings.hero_terminal_lines.map((line, i) => (
              <p key={i} className="font-mono" style={{ color: settings.hero_terminal_text_color }}>
                {line}
              </p>
            ))}
          </MotionDiv>
        )}

        {/* BOTONES */}
        <div className="flex gap-4 mt-6 flex-wrap justify-center">
          {settings.hero_button_primary_label && (
            <a
              href={settings.hero_button_primary_href || "#"}
              className="px-6 py-3 shadow-lg hover:scale-105 transition"
              style={btnStyle}
            >
              {settings.hero_button_primary_label}
            </a>
          )}

          {settings.hero_button_secondary_label && (
            <a
              href={settings.hero_button_secondary_href || "#"}
              className="px-6 py-3 transition hover:opacity-80"
              style={btnOutlineStyle}
            >
              {settings.hero_button_secondary_label}
            </a>
          )}
        </div>
      </section>

      {/* SECCIONES / MÓDULOS: orden y contenido 100% definidos desde el panel admin */}
      {renderedSections}

      {/* FOOTER */}
      <footer
        className="mt-20 w-full py-6 px-6"
        style={{
          backgroundColor: settings.footer_bg_color,
          color: settings.footer_text_color,
        }}
      >
        <div className="max-w-6xl mx-auto relative flex items-center justify-center">
          {/* TEXTO CENTRADO */}
          <p className="text-sm text-center">
            © {new Date().getFullYear()} {settings.footer_text}
          </p>

          {/* BOTÓN A LA DERECHA */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="absolute right-0 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition"
          >
            ↑
          </button>
        </div>
      </footer>
    </main>
  );
}
