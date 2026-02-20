import jwt from "jsonwebtoken";

export function getUserFromRequest(req: Request): { userId: string } {
  // Read token from httpOnly cookie
  const cookieHeader = req.headers.get("cookie") || "";
  const token = cookieHeader
    .split("; ")
    .find((row) => row.startsWith("accessToken="))
    ?.split("=")[1];

  if (!token || !process.env.JWT_SECRET) {
    throw new Error("UNAUTHORIZED");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      userId: string;
    };
    return decoded;
  } catch (error) {
    throw new Error("INVALID_TOKEN");
  }
}
