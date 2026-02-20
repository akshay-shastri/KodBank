import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import { successResponse, errorResponse } from "@/lib/apiResponse"
import { rateLimit } from "@/lib/rateLimit"
import { log } from "@/lib/logger"

export async function POST(req: Request) {
  try {
    await dbConnect()

    // Rate limiting: 5 requests per minute
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(`login-${ip}`, 5, 60000)) {
      log(null, "login", "error", { reason: "rate_limit", ip });
      return errorResponse("Too many login attempts. Try again later.", 429, "RATE_LIMIT");
    }

    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return errorResponse("Email and password are required", 400, "MISSING_FIELDS");
    }

    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      throw new Error("JWT secrets are not defined in environment variables")
    }

    const user = await User.findOne({ email })

    if (!user) {
      log(null, "login", "error", { reason: "user_not_found", email });
      return errorResponse("Invalid credentials", 401, "INVALID_CREDENTIALS");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      log(user._id.toString(), "login", "error", { reason: "invalid_password" });
      return errorResponse("Invalid credentials", 401, "INVALID_CREDENTIALS");
    }

    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    )

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    )

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
    })

    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 15,
      path: "/",
    })

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    log(user._id.toString(), "login", "success", { email });
    return response
  } catch (error) {
    log(null, "login", "error", { error: error instanceof Error ? error.message : "unknown" });
    return errorResponse("Internal server error", 500, "SERVER_ERROR");
  }
}