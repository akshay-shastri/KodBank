import { NextResponse } from "next/server"
import { z } from "zod"
import mongoose from "mongoose"
import dbConnect from "@/lib/dbConnect"
import Account from "@/models/Account"
import Transaction from "@/models/Transaction"
import { getUserFromRequest } from "@/lib/getUserFromRequest"
import { successResponse, errorResponse } from "@/lib/apiResponse"
import { rateLimit } from "@/lib/rateLimit"
import { log } from "@/lib/logger"

const transferSchema = z.object({
  toAccount: z.string().length(10, "Account number must be exactly 10 digits"),
  amount: z.number().positive("Amount must be greater than zero").max(1_000_000, "Amount exceeds transfer limit"),
  idempotencyKey: z.string(),
})

export async function POST(req: Request) {
  const session = await mongoose.startSession()
  session.startTransaction()
  let userId: string | null = null;

  try {
    await dbConnect()

    // Rate limiting: 10 requests per minute
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(`transfer-${ip}`, 10, 60000)) {
      await session.abortTransaction();
      session.endSession();
      log(null, "transfer", "error", { reason: "rate_limit", ip });
      return errorResponse("Too many transfer attempts. Try again later.", 429, "RATE_LIMIT");
    }

    const decoded = getUserFromRequest(req);
    userId = decoded.userId;

    const body = await req.json()
    const parsedData = transferSchema.parse(body)

    const senderAccount = await Account.findOne({ userId }).session(session)

    if (!senderAccount) {
      await session.abortTransaction();
      session.endSession();
      log(userId, "transfer", "error", { reason: "sender_not_found" });
      return errorResponse("Sender account not found", 404, "SENDER_NOT_FOUND");
    }

    const recipientAccount = await Account.findOne({
      accountNumber: parsedData.toAccount,
    }).session(session)

    if (!recipientAccount) {
      await session.abortTransaction();
      session.endSession();
      log(userId, "transfer", "error", { reason: "recipient_not_found" });
      return errorResponse("Recipient account not found", 404, "RECIPIENT_NOT_FOUND");
    }

    if (senderAccount.accountNumber === recipientAccount.accountNumber) {
      await session.abortTransaction();
      session.endSession();
      log(userId, "transfer", "error", { reason: "same_account" });
      return errorResponse("Cannot transfer to same account", 400, "SAME_ACCOUNT");
    }

    if (senderAccount.balance < parsedData.amount) {
      await session.abortTransaction();
      session.endSession();
      log(userId, "transfer", "error", { reason: "insufficient_balance" });
      return errorResponse("Insufficient balance", 400, "INSUFFICIENT_BALANCE");
    }

    senderAccount.balance -= parsedData.amount
    recipientAccount.balance += parsedData.amount

    await senderAccount.save({ session })
    await recipientAccount.save({ session })

    await Transaction.create(
      [
        {
          userId,
          type: "transfer",
          amount: parsedData.amount,
          fromAccount: senderAccount.accountNumber,
          toAccount: recipientAccount.accountNumber,
          idempotencyKey: parsedData.idempotencyKey,
        },
        {
          userId: recipientAccount.userId,
          type: "transfer",
          amount: parsedData.amount,
          fromAccount: senderAccount.accountNumber,
          toAccount: recipientAccount.accountNumber,
        },
      ],
      { session }
    )

    await session.commitTransaction()
    session.endSession()

    log(userId, "transfer", "success", { amount: parsedData.amount, to: recipientAccount.accountNumber });
    return successResponse({}, "Transfer successful");
  } catch (error: any) {
    await session.abortTransaction()
    session.endSession()

    log(userId, "transfer", "error", { error: error.message });

    if (error.message === "UNAUTHORIZED" || error.message === "INVALID_TOKEN") {
      return errorResponse("Unauthorized", 401, error.message);
    }

    if (error.name === "ZodError") {
      return errorResponse(error.errors[0].message, 400, "VALIDATION_ERROR");
    }

    return errorResponse(error.message || "Transfer failed", 400, "TRANSFER_ERROR");
  }
}