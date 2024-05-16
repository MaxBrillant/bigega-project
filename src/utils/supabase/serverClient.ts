import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export function CreateServerClient() {
  const cookieStore = cookies();
  const SUPABASE_URL = process.env.SUPABASE_URL as string;
  const SUPABASE_KEY = process.env.SUPABASE_KEY as string;

  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.set({ name, value: "", ...options });
      },
    },
  });
}
