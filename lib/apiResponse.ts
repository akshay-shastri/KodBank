import { NextResponse } from "next/server";

export function successResponse(data: any, message = "Success", status = 200) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}

export function errorResponse(
  message: string,
  status = 400,
  errorCode?: string
) {
  return NextResponse.json(
    {
      success: false,
      message,
      errorCode: errorCode || "ERROR",
    },
    { status }
  );
}
