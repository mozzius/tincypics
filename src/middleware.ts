import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const slug = request.nextUrl.pathname;

  console.log("[middleware]", slug);

  if (slug !== "/") {
    const redirect = request.nextUrl.clone();
    redirect.pathname = `/api/redirect${slug}`;
    console.log(`[middleware] redirecting to ${redirect.pathname}`);
    return NextResponse.rewrite(redirect);
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/i/:slug?",
};
