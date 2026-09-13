/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Las imágenes que se suben desde el panel de administración (logo,
    // favicon, banner) quedan alojadas en Supabase Storage, cuyo dominio
    // varía según el proyecto de cada cliente (algo así como
    // "xxxxxxx.supabase.co"). Este patrón comodín permite que next/image
    // sirva esas imágenes sin tener que tocar este archivo por cada sitio
    // que se despliegue.
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
};

module.exports = nextConfig;
