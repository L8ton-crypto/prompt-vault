import { NextRequest, NextResponse } from "next/server";
import { getPrompts, initDb, getCategories } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    await initDb();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    
    const prompts = await getPrompts(category, search);
    const categories = await getCategories();
    
    return NextResponse.json({ 
      prompts, 
      categories,
      total: prompts.length 
    });
  } catch (error) {
    console.error("GET /api/prompts error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
