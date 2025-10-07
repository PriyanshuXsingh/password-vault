import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User, verifyPassword } from "@/lib/auth";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    return NextResponse.json({ token, email: user.email }, { status: 200 });
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
