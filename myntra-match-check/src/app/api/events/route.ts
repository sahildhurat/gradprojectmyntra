import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const event = await req.json();
    
    // In a real app, this would push to Mixpanel, Amplitude, or BigQuery.
    // For the prototype, we just log it.
    console.log("[EVENT TRACKED]", JSON.stringify(event));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking event:", error);
    // Still return 200 so UI doesn't break if analytics fails
    return NextResponse.json({ success: false });
  }
}
