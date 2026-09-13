import { createClient } from "../lib/supabase/server";
import { DEFAULT_SETTINGS, type SiteSettings } from "../types/settings";
import HomeClient from "./HomeClient";

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
