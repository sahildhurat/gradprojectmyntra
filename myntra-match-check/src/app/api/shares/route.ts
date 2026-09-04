import { NextResponse } from "next/server";
import { sharesStore } from "../../../lib/store/sharesStore";
import { checksStore } from "../../../lib/store/checksStore";
import { generateShareToken, buildShareUrl } from "../../../lib/shareToken";
import { calculateCostPerWear } from "../../../lib/costPerWear";
import { products } from "../../../data/products";

export async function POST(req: Request) {
  try {
    const { checkId, shopperQuestion } = await req.json();
    const check = await checksStore.get(checkId);

    if (!check) {
      return NextResponse.json({ error: "Check not found" }, { status: 404 });
    }

    const product = products.find(p => p.id === check.productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const token = generateShareToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h
    
    // First consideration if exists
    const consideration = check.assessment?.considerations?.[0];

    const shareUrl = buildShareUrl(token);

    await sharesStore.set(token, {
      token,
      checkId,
      shopperQuestion,
      productId: check.productId,
      occasion: check.occasion,
      costPerWear: calculateCostPerWear(product.price, check.expectedWears),
      consideration,
      expiresAt
    });

    return NextResponse.json({ token, shareUrl, expiresAt });
  } catch (error) {
    console.error("Error creating share:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const share = await sharesStore.get(token);
  if (!share) {
    return NextResponse.json({ error: "Share not found", expired: true }, { status: 404 });
  }

  if (new Date(share.expiresAt).getTime() < Date.now()) {
    return NextResponse.json({ error: "Share expired", expired: true }, { status: 403 });
  }

  return NextResponse.json(share);
}
