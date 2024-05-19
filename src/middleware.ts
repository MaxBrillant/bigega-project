import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const url = new URL(req.url);

  const response = NextResponse.next();
  response.headers.set("x-pathname", url.href);

  const acceptLanguageHeader = req.headers.get("accept-language");
  let language = "en"; // Default to English

  // Check if the Accept-Language header contains 'fr'
  if (acceptLanguageHeader && acceptLanguageHeader.includes("fr")) {
    language = "fr";
  }

  response.headers.set("language", language);

  const cookieStore = cookies();
  const storedLanguage = cookieStore.get("language");

  if (!storedLanguage) {
    // Set the cookie with the detected language
    response.cookies.set("language", language, {
      path: "/",
    });
  }

  return response;
}

// Ensure the middleware is only called for relevant paths.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)", "/start", "/[id]"],
};
