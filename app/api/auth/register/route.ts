import Account from "../../../../models/Account";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET() {
  return NextResponse.json({ message: "Use POST to register" });
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Generate simple random 10-digit account number
const accountNumber = Math.floor(
  1000000000 + Math.random() * 9000000000
).toString();

await Account.create({
  userId: newUser._id,
  accountNumber,
  balance: 0,
});


    return NextResponse.json(
  {
    message: "User registered successfully",
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    },
  },
  { status: 201 }
);

  } catch (error) {
    return NextResponse.json(
      { message: "Registration failed", error },
      { status: 500 }
    );
  }
}
