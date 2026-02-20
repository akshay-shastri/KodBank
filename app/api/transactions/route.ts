import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import { getUserFromRequest } from "@/lib/getUserFromRequest";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export async function GET(req: Request) {
  try {
    await connectDB();

    const decoded = getUserFromRequest(req);
    const userId = decoded.userId;

    const { searchParams } = new URL(req.url);
    
    const parsedPage = parseInt(searchParams.get("page") || "1");
    const parsedLimit = parseInt(searchParams.get("limit") || "10");
    
    const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
    const limit = Number.isNaN(parsedLimit) || parsedLimit < 1 ? 10 : Math.min(50, parsedLimit);
    
    const type = searchParams.get("type");
    const sortParam = searchParams.get("sort");
    const sortOrder = sortParam === "asc" ? 1 : -1;

    if (type && !["deposit", "withdraw", "transfer"].includes(type)) {
      return errorResponse("Invalid transaction type", 400);
    }

    const filter: any = { userId: new mongoose.Types.ObjectId(userId) };

    if (type) {
      filter.type = type;
    }

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .select("type amount fromAccount toAccount createdAt")
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Transaction.countDocuments(filter),
    ]);

    const pages = total === 0 ? 1 : Math.ceil(total / limit);

    return successResponse(
      {
        transactions,
        total,
        page,
        pages,
      },
      "Transactions fetched",
      200
    );
  } catch (error) {
    return errorResponse("Failed to fetch transactions", 500);
  }
}
