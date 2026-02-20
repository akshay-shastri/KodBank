import { NextResponse } from "next/server"
import { z } from "zod"
import dbConnect from "@/lib/dbConnect"
import Account from "@/models/Account"
import Transaction from "@/models/Transaction"
import { getUserFromRequest } from "@/lib/getUserFromRequest"
import { successResponse, errorResponse } from "@/lib/apiResponse"
import { log } from "@/lib/logger"

const depositSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be greater than zero")
    .max(1_000_000, "Deposit limit exceeded"),
})

export async function POST(req: Request) {
  let userId: string | null = null;
  try {
    await dbConnect()

    const decoded = getUserFromRequest(req);
    userId = decoded.userId;

    const body = await req.json()
    const parsedData = depositSchema.parse(body)

    const account = await Account.findOneAndUpdate(
      { userId },
      { $inc: { balance: parsedData.amount } },
      { new: true }
    )

    if (!account) {
      log(userId, "deposit", "error", { reason: "account_not_found" });
      return errorResponse("Account not found", 404, "ACCOUNT_NOT_FOUND");
    }

    await Transaction.create({
      userId,
      type: "deposit",
      amount: parsedData.amount,
    })

    log(userId, "deposit", "success", { amount: parsedData.amount });
    return successResponse({ balance: account.balance }, "Deposit successful");
  } catch (error: any) {
    log(userId, "deposit", "error", { error: error.message });

    if (error.message === "UNAUTHORIZED" || error.message === "INVALID_TOKEN") {
      return errorResponse("Unauthorized", 401, error.message);
    }

    if (error.name === "ZodError") {
      return errorResponse(error.errors[0].message, 400, "VALIDATION_ERROR");
    }

    return errorResponse("Deposit failed", 400, "DEPOSIT_ERROR");
  }
}