import { NextResponse } from "next/server";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import RefreshToken from "@/models/RefreshToken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET not defined");
}

export async function POST(req) {
  try {
    await connectDB();

    const { refreshToken } = await req.json();

    if (!refreshToken) {
      return NextResponse.json(
        { message: "Refresh token required" },
        { status: 400 }
      );
    }

    // Hash incoming refresh token
    const hashedToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const storedToken = await RefreshToken.findOne({
      token: hashedToken,
    });

    if (!storedToken) {
      return NextResponse.json(
        { message: "Invalid refresh token" },
        { status: 401 }
      );
    }

    if (storedToken.revoked) {
      return NextResponse.json(
        { message: "Token revoked" },
        { status: 401 }
      );
    }

    if (storedToken.expiresAt < new Date()) {
      return NextResponse.json(
        { message: "Refresh token expired" },
        { status: 401 }
      );
    }

    // 🔥 ROTATION STARTS HERE

    // Revoke old token
    storedToken.revoked = true;
    await storedToken.save();

    // Generate new refresh token
    const newRefreshTokenPlain = crypto.randomBytes(64).toString("hex");

    const newRefreshTokenHashed = crypto
      .createHash("sha256")
      .update(newRefreshTokenPlain)
      .digest("hex");

    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + 7);

    await RefreshToken.create({
      userId: storedToken.userId,
      token: newRefreshTokenHashed,
      expiresAt: newExpiry,
      ipAddress: storedToken.ipAddress,
      deviceInfo: storedToken.deviceInfo,
    });

    // Issue new access token
    const newAccessToken = jwt.sign(
      { userId: storedToken.userId },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    return NextResponse.json(
      {
        accessToken: newAccessToken,
        refreshToken: newRefreshTokenPlain,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Refresh Error:", error);
    return NextResponse.json(
      { message: "Refresh failed" },
      { status: 500 }
    );
  }
}