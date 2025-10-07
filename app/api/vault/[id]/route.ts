import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Vault } from "@/lib/vault";
import jwt from "jsonwebtoken";



export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  try {
    await connectDB();
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    const data = await req.json();
    const { id } = context.params;

    const updated = await Vault.findOneAndUpdate(
      { _id: id, userId: decoded.id },
      data,
      { new: true }
    );

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    console.error("Vault PUT error:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  try {
    await connectDB();
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    const { id } = context.params;

    await Vault.findOneAndDelete({ _id: id, userId: decoded.id });

    return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
  } catch (err) {
    console.error("Vault DELETE error:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
