import { NextResponse } from "next/server"
import { z } from "zod"
import dbConnect from "@/lib/dbConnect"
import Account from "@/models/Account"
import Transaction from "@/models/Transaction"
import { getUserFromRequest } from "@/lib/getUserFromRequest"
import { successResponse, errorResponse } from "@/lib/apiResponse"
import { log } from "@/lib/logger"

const withdrawSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be greater than zero")
    .max(1_000_000, "Withdraw limit exceeded"),
})

export async function POST(req) {
  let userId = null;
  try {
    await dbConnect()

    const decoded = getUserFromRequest(req);
    userId = decoded.userId;

    const body = await req.json()
    const parsedData = withdrawSchema.parse(body)

    // 🔒 Atomic withdraw with balance check
    const account = await Account.findOneAndUpdate(
      {
        userId,
        balance: { $gte: parsedData.amount },
      },
      {
        $inc: { balance: -parsedData.amount },
      },
      { new: true }
    )

    if (!account) {
      log(userId, "withdraw", "error", { reason: "insufficient_balance" });
      return errorResponse("Insufficient balance", 400, "INSUFFICIENT_FUNDS");
    }

    await Transaction.create({
      userId,
      type: "withdraw",
      amount: parsedData.amount,
    })

    log(userId, "withdraw", "success", { amount: parsedData.amount });
    return successResponse({ balance: account.balance }, "Withdraw successful");
  } catch (error) {
    log(userId, "withdraw", "error", { error: error.message });

    if (error.message === "UNAUTHORIZED" || error.message === "INVALID_TOKEN") {
      return errorResponse("Unauthorized", 401, error.message);
    }

    if (error.name === "ZodError") {
      return errorResponse(error.errors[0].message, 400, "VALIDATION_ERROR");
    }

    return errorResponse("Withdraw failed", 400, "WITHDRAW_ERROR");
  }
}