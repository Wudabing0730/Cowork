import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'study-buddy-secret-change-in-production'
);

const protectedPaths = ['/dashboard', '/stats'];

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const isProtected = protectedPaths.some(p => pathname.startsWith(p));

  if (!isProtected) {
    // Redirect to dashboard if already logged in and on auth pages
    if (['/login', '/register'].includes(pathname)) {
      const token = req.cookies.get('sb-token')?.value;
      if (token) {
        try {
          await jwtVerify(token, JWT_SECRET);
          return NextResponse.redirect(new URL('/dashboard', req.url));
        } catch {}
      }
    }
    return NextResponse.next();
  }

  const token = req.cookies.get('sb-token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    await jwtVerify(token, JWT_SECRET);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/stats/:path*', '/login', '/register'],
};
