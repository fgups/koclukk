import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/giris",
  "/kayit",
  "/auth",
  "/net-hesaplayici",
  "/universiteler",
  "/api/yokatlas",
  "/sifremi-unuttum",
  "/sifre-sifirla",
];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getSession() reads the JWT from cookies without a network round-trip to
  // Supabase Auth on every request (unlike getUser()). This is safe here because
  // middleware only decides whether to show a redirect for UX; every actual data
  // read/write is independently re-authorized by Postgres RLS using the same JWT.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some(
    (path) => pathname === path || (path !== "/" && pathname.startsWith(path)),
  );

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/giris";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && (pathname === "/giris" || pathname === "/kayit")) {
    const url = request.nextUrl.clone();
    url.pathname = "/panel";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
