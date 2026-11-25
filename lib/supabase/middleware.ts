import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase session and protects admin surfaces:
 *  - /admin/*      -> must be signed in AND listed in admin_profiles
 *                     (the page layout re-checks server-side as defense in depth)
 *  - /api/admin/*  -> 401 JSON unless signed in AND listed in admin_profiles
 *                     (every route handler ALSO calls requireAdminApi())
 *
 * The admin_profiles lookup uses the user's own session, so RLS applies: only
 * a real admin can see rows in that table, so a non-admin always gets "no row".
 */
export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Let server layouts know which path is being rendered (used to exempt /admin/login).
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-skydra-pathname", pathname);

  let response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: requestHeaders } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request: { headers: requestHeaders } });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");
  const isLoginPage = pathname.startsWith("/admin/login");

  // Public pages only need the session refreshed (cheap), no admin lookup.
  if (!isAdminPage && !isAdminApi) {
    await supabase.auth.getUser();
    return response;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("admin_profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    isAdmin = !!profile;
  }

  if (isAdminApi) {
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access required." },
        { status: user ? 403 : 401 }
      );
    }
    return response;
  }

  if (isLoginPage) {
    // Only bounce real admins away from the login page (a signed-in non-admin must be able to sign out / retry).
    if (isAdmin) return NextResponse.redirect(new URL("/admin", request.url));
    return response;
  }

  if (!user) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!isAdmin) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("error", "forbidden");
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
