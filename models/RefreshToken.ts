import mongoose from "mongoose";

const RefreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String, // hashed token
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    revoked: {
      type: Boolean,
      default: false,
    },
    ipAddress: {
      type: String,
    },
    deviceInfo: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.RefreshToken ||
  mongoose.model("RefreshToken", RefreshTokenSchema);