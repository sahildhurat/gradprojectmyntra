import { nanoid } from "nanoid";

export function generateShareToken(): string {
  return nanoid(12);
}

export function buildShareUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  return `${baseUrl}/share/${token}`;
}

export function buildWhatsAppLink(shareUrl: string, productName: string): string {
  const text = encodeURIComponent(`Could this work for me? Check out the ${productName} and let me know what you think: ${shareUrl}`);
  return `https://wa.me/?text=${text}`;
}

export function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() < Date.now();
}
