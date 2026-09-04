import { AnalyticsEvent } from "../data/types";
import { nanoid } from "nanoid";

// Generate a simple session ID for the user
const getSessionId = () => {
  if (typeof window === "undefined") return "server";
  let sid = sessionStorage.getItem("myntra_session_id");
  if (!sid) {
    sid = nanoid();
    sessionStorage.setItem("myntra_session_id", sid);
  }
  return sid;
};

export async function trackEvent(
  eventName: string,
  productId?: string,
  metadata?: Record<string, any>
) {
  const event: AnalyticsEvent = {
    sessionId: getSessionId(),
    eventName,
    productId,
    metadata,
    timestamp: new Date().toISOString()
  };

  try {
    if (typeof window === "undefined") return;
    
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
      keepalive: true // Ensures event fires even if navigating away
    });
  } catch (e) {
    console.warn("Failed to track event", eventName);
  }
}
