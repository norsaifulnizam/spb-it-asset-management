import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase isn't configured, skip the auth refresh and pass through.
  // Without this guard createServerClient throws "Your project's URL and Key
  // are required", crashing the edge middleware on every route (500
  // MIDDLEWARE_INVOCATION_FAILED).
  if (!url || !anonKey) {
    return supabaseResponse;
  }

  try {
    let response = supabaseResponse;
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });

    // Refresh session and keep the register behind the real staff login.
    const { data: { user } } = await supabase.auth.getUser();
    const isLogin = request.nextUrl.pathname === "/login";
    if (!user && !isLogin) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.search = "";
      return NextResponse.redirect(loginUrl);
    }
    if (user && isLogin) {
      const appUrl = request.nextUrl.clone();
      appUrl.pathname = "/";
      appUrl.search = "";
      return NextResponse.redirect(appUrl);
    }
    return response;
  } catch {
    // Never let an auth hiccup crash the entire edge middleware
    return supabaseResponse;
  }
}
