"use client";

import { useTheme } from "next-themes";
import { motion, type HTMLMotionProps } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { FaLink } from "react-icons/fa";

import BackgroundParticles from "./components/BackgroundParticles";
import type { SiteSettings } from "../types/settings";
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

export default function HomeClient({ settings }: { settings: SiteSettings }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const fx = settings.enable_effects;

  const sectionVisible: Record<string, boolean> = {
    about: settings.show_about,
    services: settings.show_services,
    stack: settings.show_stack,
    projects: settings.show_projects,
    news: settings.show_news,
    contact: settings.show_contact,
  };

  return (
    <main
      className="min-h-screen bg-background text-foreground transition-colors duration-300"
      style={
        {
          "--background": resolvedTheme === "dark" ? settings.background_dark : settings.background_light,
        } as React.CSSProperties
      }
    >
      {fx && <BackgroundParticles />}

      {/* BOTÓN DE TEMA */}
      <button
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="fixed top-5 right-5 p-3 rounded-full shadow-lg 
        bg-white dark:bg-[#160b34]
        border border-gray-300 dark:border-purple-700
        text-gray-900 dark:text-purple-200
        hover:scale-110 transition-all z-50"
      >
        {theme === "light" ? "🌙" : "✨"}
      </button>


      {/* HERO */}
      <section className="flex flex-col items-center text-center pt-24 px-6 gap-4">
      <MotionDiv
        enabled={fx}
        key={resolvedTheme} // 🔥 esto fuerza animación al cambiar tema
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
  <Image
    src={resolvedTheme === "dark" ? settings.logo_light_url : settings.logo_dark_url}
    alt="Logo"
    width={500}
    height={300}
    priority
  />
</MotionDiv>



  {/* TITULO PRINCIPAL */}
  <h2
    className="text-4xl sm:text-5xl lg:text-6xl font-extrabold max-w-3xl text-transparent bg-clip-text"
    style={{
      backgroundImage: `linear-gradient(to right, ${settings.primary_color}, ${settings.secondary_color})`,
    }}
  >
    {settings.hero_title}
  </h2>

  {/* LINEA MODERNA */}
<div
  className="w-24 sm:w-40 md:w-56 lg:w-72 h-1 rounded-full mx-auto"
  style={{
    backgroundImage: `linear-gradient(to right, ${settings.primary_color}, ${settings.secondary_color})`,
  }}
></div>
  {/* ESPECIALIZACIÓN */}
  {settings.hero_subtitle && (
    <p className="text-lg sm:text-xl font-bold text-white-600 dark:text-dark-300">
      {settings.hero_subtitle}
    </p>
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
        <p key={i} className="font-mono text-green-500">
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
        className="px-6 py-3 bg-purple-600 text-white rounded-full shadow-lg hover:scale-105 transition"
      >
        {settings.hero_button_primary_label}
      </a>
    )}

    {settings.hero_button_secondary_label && (
      <a
        href={settings.hero_button_secondary_href || "#"}
        className="px-6 py-3 border border-purple-500 rounded-full hover:bg-purple-500 hover:text-white transition"
      >
        {settings.hero_button_secondary_label}
      </a>
    )}
  </div>

</section>
{/* SOBRE MI PRO */}
{sectionVisible.about && (
<section className="px-8 py-20 max-w-6xl mx-auto">
  <h2 className="title-section mb-12 text-center">
    <strong>Sobre mí</strong>
  </h2>

  <div className="grid md:grid-cols-2 gap-10">

    {/* COLUMNA IZQUIERDA */}
    <div className="card space-y-6">
      <h3 className="text-2xl font-semibold">
        {settings.about_title}
      </h3>

      <p className="text-gray-600 dark:text-dark-300 leading-relaxed">
        {settings.about_text}
      </p>

      {settings.about_highlight && (
        <p className="text-gray-600 dark:text-dark-300 leading-relaxed">
          Actualmente estoy especializándome en{" "}
          <span className="font-bold text-blue-600 dark:text-dark-300">
            {settings.about_highlight}
          </span>,
          fortaleciendo habilidades en análisis de vulnerabilidades y seguridad ofensiva.
        </p>
      )}

      {/* HABILIDADES BLANDAS */}
      {settings.about_soft_skills.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">{settings.about_soft_skills_title}</h4>
          <ul className="list-disc list-inside text-gray-600 dark:text-dark-300 space-y-1">
            {settings.about_soft_skills.map((skill, i) => (
              <li key={i}>{skill}</li>
            ))}
          </ul>
        </div>
      )}
    </div>

    {/* COLUMNA DERECHA */}
    <div className="card space-y-4">
      <h4 className="text-xl font-semibold mb-2">
        {settings.about_stack_title}
      </h4>

      <div className="space-y-3 text-gray-600 dark:text-dark-300">
        {settings.about_stack_facts.map((fact, i) => (
          <p key={i}><strong>{fact.label}:</strong> {fact.value}</p>
        ))}
      </div>

      {/* EXTRA DESTACADO */}
      {settings.about_focus_text && (
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-600/10 to-purple-500/10 border border-purple-500/20">
          <p className="text-sm font-medium text-gray-700 dark:text-dark-300">
            {settings.about_focus_label}
          </p>
          <p className="font-bold text-blue-600 dark:text-dark-300">
            {settings.about_focus_text}
          </p>
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
              className="flex items-center gap-3 px-6 py-3 
              bg-gray-900 dark:bg-gray-700 text-white 
              rounded-full shadow-lg"
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
              className="flex items-center gap-3 px-6 py-3 
              bg-blue-600 text-white rounded-full shadow-lg"
            >
              <FaLink className="text-xl" /> Enlace 2
            </MotionA>
          )}
        </div>
    </div>

  </div>
</section>
)}

{sectionVisible.services && (
     <section className="px-8 py-20 max-w-6xl mx-auto">
       <h2 className="title-section mb-4 text-center">{settings.services_title}</h2>
       {settings.services_description && (
         <p className="max-w-2xl mx-auto text-center text-gray-600 dark:text-dark-300 mb-12">
           {settings.services_description}
         </p>
       )}

       <div className="grid md:grid-cols-3 gap-6">
         {settings.services_items.map((item, i) => (
           <MotionDiv enabled={fx} key={i} whileHover={{ scale: 1.04 }} className="card">
             <h3 className="text-xl font-semibold text-blue-600 dark:text-purple-300">
               {item.title}
             </h3>
             <p className="mt-3 text-gray-700 dark:text-dark-300">
               {item.description}
             </p>
           </MotionDiv>
         ))}
       </div>

       {settings.services_cta_label && (
         <div className="flex justify-center mt-10">
           <a
             href={settings.services_cta_href || "#"}
             className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:scale-105 transition-all"
           >
             {settings.services_cta_label}
           </a>
         </div>
       )}
     </section>
)}

     {/* HABILIDADES Y ESPECIALIDADES */}
{sectionVisible.stack && (
<section className="px-8 py-20 max-w-6xl mx-auto">
  <h2 className="title-section mb-12">{settings.stack_title}</h2>

  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
    {settings.stack_items.map((skill, i) => (
      <MotionDiv
        enabled={fx}
        key={i}
        whileHover={{ scale: 1.08, rotate: 1 }}
        className="flex flex-col items-center gap-2 
bg-white dark:bg-[#160b34] 
border border-gray-200 dark:border-purple-700 
shadow-md hover:shadow-xl hover:-translate-y-1
transition duration-300 rounded-xl p-4"
      >
        <div className="text-4xl text-blue-600 dark:text-purple-300">
          {getIcon(skill.icon)}
        </div>

        <p className="font-semibold text-gray-800 dark:text-purple-200">
          {skill.name}
        </p>
      </MotionDiv>
    ))}
  </div>
</section>
)}

      {/* BANNER / SLIDER */}
      {settings.show_banner && settings.banner_images.length > 0 && (
        <section className="px-8 py-10 max-w-6xl mx-auto">
          <div className="flex gap-4 overflow-x-auto snap-x pb-4">
            {settings.banner_images.map((img, i) => (
              <div key={i} className="relative shrink-0 w-full sm:w-[600px] snap-center rounded-2xl overflow-hidden">
                <img src={img.url} alt={img.caption ?? ""} className="w-full h-64 object-cover" />
                {img.caption && (
                  <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-center py-2">
                    {img.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* NOTICIAS */}
      {settings.show_news && settings.news.length > 0 && (
        <section className="px-8 py-20 max-w-6xl mx-auto">
          <h2 className="title-section mb-12">Noticias</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {settings.news.map((n, i) => (
              <div key={i} className="card">
                <h3 className="text-xl font-semibold text-blue-600 dark:text-purple-300">
                  {n.title}
                </h3>
                {n.date && (
                  <p className="text-xs text-gray-500 mt-1">{n.date}</p>
                )}
                <p className="mt-3 text-gray-700 dark:text-dark-300">{n.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PROYECTOS */}
      {sectionVisible.projects && (
      <section id="proyectos" className="px-8 py-10">
        <h2 className="title-section mb-12">{settings.projects_title}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {settings.projects_items.map((project, i) => (
            <MotionDiv enabled={fx} key={i} whileHover={{ scale: 1.04 }} className="card">
              <h3
                className="text-2xl font-semibold"
                style={project.color ? { color: project.color } : undefined}
              >
                {project.title}
              </h3>

              <p className="mt-3 text-gray-700 dark:text-dark-300">
                {project.description}
              </p>

              {project.link && (
                <Link
                  href={project.link}
                  className="mt-5 inline-block px-5 py-2 bg-blue-600 text-white rounded-full"
                >
                  {project.linkLabel || "Ver Detalles →"}
                </Link>
              )}
            </MotionDiv>
          ))}
        </div>
      </section>
      )}

      {/* CONTACTO */}
      {sectionVisible.contact && (
      <section id="contacto" className="px-8 py-20 max-w-3xl mx-auto">
        <h2 className="title-section mb-12">{settings.contact_title}</h2>
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
            className="border border-gray-300 dark:border-purple-700/60 bg-white dark:bg-[#0f0a24] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 p-3 rounded-lg"
          />
          <input
            name="email"
            type="email"
            placeholder="Tu correo"
            required
            className="border border-gray-300 dark:border-purple-700/60 bg-white dark:bg-[#0f0a24] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 p-3 rounded-lg"
          />
          <textarea
            name="mensaje"
            rows={5}
            placeholder="Mensaje..."
            required
            className="border border-gray-300 dark:border-purple-700/60 bg-white dark:bg-[#0f0a24] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 p-3 rounded-lg"
          ></textarea>

          <button className="px-6 py-3 bg-blue-600 text-white rounded-full">
            Enviar mensaje
          </button>
        </form>
      </section>
      )}

   {/* FOOTER */}
<footer className="mt-20 w-full bg-gray-900 text-white py-6 px-6">
  <div className="max-w-6xl mx-auto relative flex items-center justify-center">

    {/* TEXTO CENTRADO */}
    <p className="text-sm text-gray-400 text-center">
      © {new Date().getFullYear()} {settings.footer_text}
    </p>

    {/* BOTÓN A LA DERECHA */}
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="absolute right-0 bg-blue-600 hover:bg-blue-700 p-3 rounded-full shadow-lg transition"
    >
      ↑
    </button>

  </div>
</footer>
    </main>
  );
}
