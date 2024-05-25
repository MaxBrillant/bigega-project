"use server";

export async function getEnvironmentVariables(value: string) {
  if (value === "SUPABASE_URL") {
    return process.env.SUPABASE_URL as string;
  }
  if (value === "SUPABASE_KEY") {
    return process.env.SUPABASE_KEY as string;
  }
  if (value === "AFRIPAY_APP_ID") {
    return process.env.AFRIPAY_APP_ID as string;
  }
  if (value === "AFRIPAY_APP_SECRET") {
    return process.env.AFRIPAY_APP_SECRET as string;
  }
}
