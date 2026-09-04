import { Product, TrustBlock, TrustBlockItem } from "../data/types";

export function assembleTrustBlock(product: Product): TrustBlock {
  const items: TrustBlockItem[] = [];
  const { verification } = product;

  // 1. Brand Authorization
  if (verification.brandAuthorised) {
    items.push({
      iconType: "check",
      text: "Brand-authorised seller",
      isVerification: true
    });
  }

  // 2. Verified Purchases (Only if >= 50% per edge cases rule 2.2)
  if (verification.verifiedPurchaseShare >= 0.5) {
    const percentage = Math.round(verification.verifiedPurchaseShare * 100);
    items.push({
      iconType: "check",
      text: `${percentage}% of reviews from verified purchases`,
      isVerification: true
    });
  }

  // 3. Style Code
  if (verification.styleCode !== null) {
    items.push({
      iconType: "check",
      text: "Style code matches brand catalogue",
      isVerification: true
    });
  }

  // 4. Platform Protection Floor (Always present)
  if (verification.returnsWindow) {
    items.push({
      iconType: "shield",
      text: `${verification.returnsWindow} returns`,
      isVerification: false
    });
  }
  
  if (verification.refundProtection) {
    items.push({
      iconType: "shield",
      text: "Myntra refund protection",
      isVerification: false
    });
  }

  if (verification.exchangePolicy) {
    items.push({
      iconType: "shield",
      text: "Exchange policy available",
      isVerification: false
    });
  }

  return { items };
}
