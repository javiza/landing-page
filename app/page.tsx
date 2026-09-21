import { createClient } from "../lib/supabase/server";
import { DEFAULT_SETTINGS, type SiteSettings } from "../types/settings";
import HomeClient from "./HomeClient";

// Renderiza en cada request: sin esto los cambios guardados en el panel
// admin no se ven en producción hasta el próximo deploy.
export const dynamic = "force-dynamic";

export default async function Page() {
  let settings: SiteSettings = DEFAULT_SETTINGS;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (data) {
      settings = { ...DEFAULT_SETTINGS, ...data };
    }
  } catch {
    // Si Supabase no está configurado todavía, se usa el contenido por
    // defecto y el sitio se ve exactamente igual que antes.
  }

  return <HomeClient settings={settings} />;
}
