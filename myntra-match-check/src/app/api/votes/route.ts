import { NextResponse } from "next/server";
import { votesStore } from "../../../lib/store/votesStore";
import { sharesStore } from "../../../lib/store/sharesStore";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  try {
    const { shareToken, response, comment } = await req.json();

    const share = await sharesStore.get(shareToken);
    if (!share) {
      return NextResponse.json({ error: "Share not found or expired" }, { status: 404 });
    }

    if (new Date(share.expiresAt).getTime() < Date.now()) {
      return NextResponse.json({ error: "Share expired" }, { status: 403 });
    }

    const vote = {
      id: nanoid(),
      shareToken,
      response,
      comment,
      createdAt: new Date().toISOString()
    };

    await votesStore.addVote(shareToken, vote);

    return NextResponse.json({ success: true, voteId: vote.id });
  } catch (error) {
    console.error("Error submitting vote:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    const votes = await votesStore.getByToken(token);
    return NextResponse.json({ votes });
  } catch (error: any) {
    console.error("Error fetching votes:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
