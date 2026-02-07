import { NextRequest, NextResponse } from "next/server";
import { toggleFavorite } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    
    await toggleFavorite(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/prompts/favorite error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
