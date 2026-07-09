import { NextResponse, type NextRequest } from "next/server";

const hiddenProductPrefixes = [
  "/assessment",
  "/coach",
  "/complete",
  "/design-system",
  "/growth-report",
  "/history",
  "/learning-path",
  "/lessons",
  "/paths",
  "/profile"
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const shouldHide = hiddenProductPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!shouldHide) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/practice", request.url));
}

export const config = {
  matcher: ["/((?!api|.*\\..*).*)"]
};
