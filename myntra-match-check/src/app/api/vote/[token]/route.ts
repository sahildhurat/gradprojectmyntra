import { NextResponse } from "next/server";
import { sharesStore } from "../../../../lib/store/sharesStore";
import { votesStore } from "../../../../lib/store/votesStore";
import { products } from "../../../../data/products";
import { Vote } from "../../../../data/types";
import { nanoid } from "nanoid";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const share = await sharesStore.get(token);
    
    if (!share) {
      return NextResponse.json({ error: "Share not found or expired" }, { status: 404 });
    }

    const product = products.find(p => p.id === share.productId);
    const votes = await votesStore.getByToken(token);

    return NextResponse.json({
      share,
      product,
      votes
    });
  } catch (error: any) {
    console.error("Error fetching vote data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const { response, comment } = body;

    if (!response) {
      return NextResponse.json({ error: "Missing vote response" }, { status: 400 });
    }

    const share = await sharesStore.get(token);
    if (!share) {
      return NextResponse.json({ error: "Share not found or expired" }, { status: 404 });
    }

    const vote: Vote = {
      id: nanoid(),
      shareToken: token,
      response,
      comment,
      createdAt: new Date().toISOString()
    };

    await votesStore.addVote(token, vote);

    return NextResponse.json({ success: true, vote });
  } catch (error: any) {
    console.error("Error casting vote:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
