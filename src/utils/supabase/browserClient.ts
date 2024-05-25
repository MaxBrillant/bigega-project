import { createBrowserClient } from "@supabase/ssr";
import { getEnvironmentVariables } from "./getEnvironmentVariables";

export async function CreateBrowserClient() {
  const SUPABASE_URL = await getEnvironmentVariables("SUPABASE_URL");
  const SUPABASE_KEY = await getEnvironmentVariables("SUPABASE_KEY");

  return createBrowserClient(SUPABASE_URL as string, SUPABASE_KEY as string);
}
