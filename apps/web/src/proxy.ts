import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "learnify_token";

const GUEST_ONLY = ["/login", "/signup", "/forgot-password"];
const PROTECTED = [
  "/my-learning",
  "/instructor",
  "/admin",
  "/profile",
  "/settings",
];

const ROLE_GUARDS: { prefix: string; roles: readonly string[] }[] = [
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/instructor", roles: ["instructor", "admin"] },
];

interface SessionPayload {
  id: string;
  role?: string;
}

async function getSession(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return {
      id: String(payload.id ?? ""),
      role: typeof payload.role === "string" ? payload.role : undefined,
    };
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await getSession(req);
  const hasCookie = Boolean(req.cookies.get(COOKIE_NAME));

  if (session && GUEST_ONLY.some((p) => pathname.startsWith(p))) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (!session && PROTECTED.some((p) => pathname.startsWith(p))) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (session) {
    const guard = ROLE_GUARDS.find((g) => pathname.startsWith(g.prefix));
    if (guard && !guard.roles.includes(session.role ?? "")) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  if (hasCookie && !session) {
    const response = NextResponse.next();
    response.cookies.delete(COOKIE_NAME);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};