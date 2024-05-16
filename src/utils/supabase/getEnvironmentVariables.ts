"use server";

export async function getSupabaseEnvironmentVariables(value: string) {
  if (value === "SUPABASE_URL") {
    return process.env.SUPABASE_URL as string;
  }
  if (value === "SUPABASE_KEY") {
    return process.env.SUPABASE_KEY as string;
  }
}
