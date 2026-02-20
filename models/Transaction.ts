import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["deposit", "withdraw", "transfer"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    fromAccount: {
      type: String,
    },
    toAccount: {
      type: String,
    },

    // 🔐 Idempotency key (for transfer safety)
    idempotencyKey: {
      type: String,
      index: true,
    },
  },
  { timestamps: true }
);

// Compound unique index (only one transfer per key per user)
TransactionSchema.index(
  { userId: 1, idempotencyKey: 1 },
  { unique: true, sparse: true }
);

export default mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);