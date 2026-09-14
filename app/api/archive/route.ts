import { NextResponse } from "next/server";
import { getAllArchived } from "@/lib/storage";

export async function GET() {
  const potatoes = await getAllArchived();
  return NextResponse.json({ potatoes });
}
