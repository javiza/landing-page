"use client";

import { useCallback, useEffect, useState } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import { useTheme } from "next-themes";
import type { Engine } from "tsparticles-engine";

export default function BackgroundParticles() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const initParticles = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <Particles
      id="galaxy"
      init={initParticles}
      options={{
        fullScreen: { enable: true, zIndex: -1 },
        background: { color: "transparent" },

        particles: {
          number: { value: isDark ? 140 : 70 },
          size: { value: isDark ? 2 : 1.4 },
          color: { value: isDark ? "#b99aff" : "#6d6cff" },
          opacity: { value: 0.65 },
          move: { enable: true, speed: isDark ? 0.5 : 0.25 },

          twinkle: {
            particles: {
              enable: true,
              frequency: 0.03,
              opacity: 1,
            },
          },

          links: { enable: false },
        },
      }}
    />
  );
}