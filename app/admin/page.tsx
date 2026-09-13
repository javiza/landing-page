import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import AdminDashboard from "./AdminDashboard";
import { DEFAULT_SETTINGS, type SiteSettings } from "../../types/settings";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // El middleware ya protege /admin, esto es una segunda capa de seguridad.
  if (!user) {
    redirect("/login/admin");
  }

  const { data } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  const settings: SiteSettings = data
    ? { ...DEFAULT_SETTINGS, ...data }
    : DEFAULT_SETTINGS;

  return <AdminDashboard initialSettings={settings} userEmail={user.email ?? ""} />;
}
