import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Cette fonction peut être modifiée pour vérifier un token JWT, une session, etc.
const isAuthenticated = (request: NextRequest) => {
  // Pour l'instant, on utilise un simple cookie
  // Vous pouvez remplacer par votre logique d'authentification
  const token = request.cookies.get("auth-token")?.value;
  return !!token;
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes qui ne nécessitent pas d'authentification
  const publicRoutes = [
    "/login",
    "/register",
    "/api/auth",
    "/api/webhook", // Routes de webhook pour N8N
    "/api/chat", // Routes de chat
  ];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Si l'utilisateur n'est pas connecté et tente d'accéder à une route protégée
  if (!isAuthenticated(request) && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Si l'utilisateur est connecté et tente d'accéder à la page login
  if (isAuthenticated(request) && pathname === "/login") {
    const homeUrl = new URL("/", request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
