import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Vault } from "@/lib/vault";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    await connectDB();
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    const items = await Vault.find({ userId: decoded.id });

    return NextResponse.json(items, { status: 200 });
  } catch (err: any) {
    console.error("Vault GET error:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    const data = await req.json();

    const newItem = new Vault({ ...data, userId: decoded.id });
    await newItem.save();

    return NextResponse.json(newItem, { status: 201 });
  } catch (err: any) {
    console.error("Vault POST error:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
