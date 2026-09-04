import { NextResponse } from "next/server";
import { checksStore } from "../../../lib/store/checksStore";
import { sharesStore } from "../../../lib/store/sharesStore";
import { products } from "../../../data/products";
import { Share } from "../../../data/types";
import { nanoid } from "nanoid";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { checkId, shopperQuestion } = body;

    if (!checkId || !shopperQuestion) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const check = await checksStore.get(checkId);
    if (!check) {
      return NextResponse.json({ error: "Check not found" }, { status: 404 });
    }

    const product = products.find(p => p.id === check.productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const token = nanoid(10);
    const costPerWear = Math.round(product.price / check.expectedWears);
    
    // Pick the first consideration to highlight in the share card, if any
    const consideration = check.assessment?.considerations?.[0]?.implication || "";

    const share: Share = {
      token,
      checkId,
      shopperQuestion,
      productId: product.id,
      occasion: check.occasion,
      costPerWear,
      consideration,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    await sharesStore.set(token, share);

    return NextResponse.json({ token });
  } catch (error: any) {
    console.error("Error creating share:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
