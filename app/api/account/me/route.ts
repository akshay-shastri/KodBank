import { NextResponse } from "next/server"
import jwt, { JwtPayload } from "jsonwebtoken"
import dbConnect from "@/lib/dbConnect"
import Account from "@/models/Account"

export async function GET(req: Request) {
  try {
    await dbConnect()

    const cookies = req.headers.get("cookie") || ""

    const accessToken = cookies
      .split("; ")
      .find(row => row.startsWith("accessToken="))
      ?.split("=")[1]

    const refreshToken = cookies
      .split("; ")
      .find(row => row.startsWith("refreshToken="))
      ?.split("=")[1]

    if (!refreshToken || !process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    let decoded: JwtPayload | null = null
    let newAccessToken = null

    try {
      if (!accessToken) throw new Error("No access token")

      decoded = jwt.verify(accessToken, process.env.JWT_SECRET) as JwtPayload
    } catch (error: any) {
      // Access token expired → verify refresh token
      if (error.name === "TokenExpiredError" || !accessToken) {
        try {
          const refreshDecoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
          ) as JwtPayload

          newAccessToken = jwt.sign(
            { userId: refreshDecoded.userId },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
          )

          decoded = refreshDecoded
        } catch {
          return NextResponse.json(
            { success: false, message: "Session expired" },
            { status: 401 }
          )
        }
      } else {
        return NextResponse.json(
          { success: false, message: "Invalid token" },
          { status: 401 }
        )
      }
    }

    const account = await Account.findOne({ userId: decoded.userId })

    if (!account) {
      return NextResponse.json(
        { success: false, message: "Account not found" },
        { status: 404 }
      )
    }

    const response = NextResponse.json({
      success: true,
      account,
    })

    if (newAccessToken) {
      response.cookies.set("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 15,
        path: "/",
      })
    }

    return response
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}