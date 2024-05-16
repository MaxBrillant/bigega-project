import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnvironmentVariables } from "./getEnvironmentVariables";

export async function CreateBrowserClient() {
  const SUPABASE_URL = await getSupabaseEnvironmentVariables("SUPABASE_URL");
  const SUPABASE_KEY = await getSupabaseEnvironmentVariables("SUPABASE_KEY");

  return createBrowserClient(SUPABASE_URL as string, SUPABASE_KEY as string);
}
