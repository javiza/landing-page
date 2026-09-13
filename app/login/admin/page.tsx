"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "../../../lib/supabase/client";
import { FaEye, FaEyeSlash, FaLock, FaEnvelope } from "react-icons/fa";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError("Correo o contraseña incorrectos.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-background text-foreground relative overflow-hidden">
      {/* Resplandor decorativo de fondo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(37,99,235,0.35) 0%, rgba(147,51,234,0.25) 45%, transparent 70%)",
        }}
      />

      <motion.form
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        onSubmit={handleSubmit}
        className="card w-full max-w-sm flex flex-col gap-5 relative z-10 !p-8"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xl shadow-lg">
            <FaLock />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-blue-600 dark:text-purple-300">
              Panel de Administración
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Acceso exclusivo para el administrador del sitio.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="email"
              placeholder="Correo"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 dark:border-purple-700/60 bg-white dark:bg-[#0f0a24] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 p-3 pl-10 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60 dark:focus:ring-purple-500/60 transition"
            />
          </div>

          <div className="relative">
            <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 dark:border-purple-700/60 bg-white dark:bg-[#0f0a24] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 p-3 pl-10 pr-11 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60 dark:focus:ring-purple-500/60 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 text-center bg-red-500/10 border border-red-500/30 rounded-lg py-2 px-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold shadow-lg hover:scale-[1.02] transition-all disabled:opacity-60 disabled:hover:scale-100"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </motion.form>
    </main>
  );
}
