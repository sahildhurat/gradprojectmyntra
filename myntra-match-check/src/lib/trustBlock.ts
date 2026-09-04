import { Product, TrustBlock, TrustBlockItem } from "../data/types";

export function assembleTrustBlock(product: Product): TrustBlock {
  const items: TrustBlockItem[] = [];
  const { verification } = product;

  // 1. Brand Authorization
  if (verification.brandAuthorised) {
    items.push({
      icon: "check",
      text: "Brand-authorised seller",
      type: "verification"
    });
  }

  // 2. Verified Purchases (Only if >= 50% per edge cases rule 2.2)
  if (verification.verifiedPurchaseShare >= 0.5) {
    const percentage = Math.round(verification.verifiedPurchaseShare * 100);
    items.push({
      icon: "check",
      text: `${percentage}% of reviews from verified purchases`,
      type: "verification"
    });
  }

  // 3. Style Code
  if (verification.styleCode !== null) {
    items.push({
      icon: "check",
      text: "Style code matches brand catalogue",
      type: "verification"
    });
  }

  // 4. Platform Protection Floor (Always present)
  if (verification.returnsWindow) {
    items.push({
      icon: "shield",
      text: `${verification.returnsWindow} returns`,
      type: "platform"
    });
  }
  
  if (verification.refundProtection) {
    items.push({
      icon: "shield",
      text: "Myntra refund protection",
      type: "platform"
    });
  }

  if (verification.exchangePolicy) {
    items.push({
      icon: "shield",
      text: "Exchange policy available",
      type: "platform"
    });
  }

  return { items };
}
