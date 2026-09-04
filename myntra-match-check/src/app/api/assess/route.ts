import { NextResponse } from "next/server";
import { products } from "../../../data/products";
import { generateAssessment } from "../../../lib/ai/assess";
import { checksStore } from "../../../lib/store/checksStore";
import { Check } from "../../../data/types";
import { nanoid } from "nanoid";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, occasion, expectedWears, hesitation, usualSize, priorFitIssue } = body;

    if (!productId || !occasion || !expectedWears || !hesitation) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const product = products.find(p => p.id === productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Prepare context for the AI
    const context: Partial<Check> = {
      occasion,
      expectedWears,
      hesitation,
      usualSize,
      priorFitIssue
    };

    // Call the AI Pipeline (this handles timeouts and fallback logic internally)
    const assessment = await generateAssessment(product, context);

    // Save to store
    const checkId = nanoid();
    const newCheck: Check = {
      id: checkId,
      anonymousUserId: "anon_" + nanoid(10), // In a real app, this comes from the client
      productId,
      occasion,
      expectedWears,
      hesitation,
      usualSize,
      priorFitIssue,
      assessment,
      createdAt: new Date().toISOString()
    };

    await checksStore.set(checkId, newCheck);

    return NextResponse.json({ checkId });
  } catch (error: any) {
    console.error("Error in /api/assess POST:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const checkId = url.searchParams.get("checkId");

    if (!checkId) {
      return NextResponse.json({ error: "Missing checkId" }, { status: 400 });
    }

    const check = await checksStore.get(checkId);
    if (!check) {
      return NextResponse.json({ error: "Check not found" }, { status: 404 });
    }

    return NextResponse.json(check);
  } catch (error: any) {
    console.error("Error in /api/assess GET:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
