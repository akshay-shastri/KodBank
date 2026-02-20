import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const accessToken = request.cookies.get("accessToken")?.value

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register")
  const isDashboardRoute = pathname.startsWith("/dashboard")

  // If accessing dashboard routes → require valid JWT
  if (isDashboardRoute) {
    if (!accessToken) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    try {
      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET not defined")
      }

      jwt.verify(accessToken, process.env.JWT_SECRET)

      // Token valid → allow request
      return NextResponse.next()
    } catch (error) {
      // Invalid or expired token → clear cookie + redirect
      const response = NextResponse.redirect(new URL("/login", request.url))

      response.cookies.set("accessToken", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        expires: new Date(0),
        path: "/",
      })

      return response
    }
  }

  // If logged in user tries to access login/register → redirect to dashboard
  if (isAuthPage && accessToken) {
    try {
      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET not defined")
      }

      jwt.verify(accessToken, process.env.JWT_SECRET)

      return NextResponse.redirect(new URL("/dashboard", request.url))
    } catch {
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
}