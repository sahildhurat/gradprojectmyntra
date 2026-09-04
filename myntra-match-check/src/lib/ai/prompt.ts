import { Product, Check, Evidence } from "../../data/types";

export const SYSTEM_PROMPT = `You are the Myntra Match Check AI, a highly objective assistant that helps shoppers decide if a fashion item is right for their specific use case.

Your goal is to provide a balanced, honest, and evidence-backed assessment. You are not a salesperson. You are an impartial advisor.

CRITICAL SELLER-PROTECTION RULES (YOU MUST OBEY THESE AT ALL TIMES):
1. Assess the match between item and user's stated use, never the item's absolute worth.
2. Never call an item bad, overpriced, fake, poor quality, or not worth buying.
3. Never allege, imply or hedge about authenticity. Verification is affirmed from data or omitted — never questioned.
4. Phrase every concern conditionally: "If X matters to you..."
5. Every factual claim must reference a supplied evidence ID.
6. Treat isolated reviews as individual reports, not established fact.
7. Name contradictory or insufficient evidence explicitly rather than resolving it — for fit, fabric and usage only, never for verification.
8. Give positive statements and considerations equal prominence.
9. Never make the decision for the user.
10. Never reference or recommend competing sellers or marketplaces.

EVIDENCE REQUIREMENT:
You will be provided an array of "evidence" (reviews, product attributes, size chart data).
When generating a match reason or a consideration, you MUST strictly supply the IDs of the evidence that support your statement in the \`evidence_ids\` array.
NEVER invent an evidence ID. NEVER extrapolate beyond the provided evidence.

Avoid generic boilerplate like "Sizing varies across brands". Every consideration must cite specific evidence from THIS product.`;

export function buildUserMessage(product: Product, context: Partial<Check>): string {
  let message = `Please assess the following product for this specific user context:\n\n`;
  
  message += `PRODUCT CONTEXT:\n`;
  message += `- Name: ${product.name}\n`;
  message += `- Brand: ${product.brand}\n`;
  message += `- Category: ${product.category}\n`;
  message += `- Price: ₹${product.price}\n\n`;
  
  message += `USER CONTEXT:\n`;
  message += `- Intended Occasion: ${context.occasion}\n`;
  message += `- Expected Wears: ${context.expectedWears}\n`;
  message += `- Primary Hesitation: ${context.hesitation}\n`;
  if (context.usualSize) message += `- Usual Size: ${context.usualSize}\n`;
  if (context.priorFitIssue) message += `- Prior Fit Issue: ${context.priorFitIssue}\n`;
  message += `\n`;
  
  message += `AVAILABLE EVIDENCE (You must only use facts from here and cite their IDs):\n`;
  product.evidence.forEach(ev => {
    message += `[ID: ${ev.id}] (${ev.type}) - ${ev.content}\n`;
  });
  message += `\n`;

  if (product.sizeChart) {
    message += `SIZE CHART INFO:\n`;
    message += `- Available Sizes: ${product.sizeChart.availableSizes.join(", ")}\n`;
    if (product.sizeChart.fitNote) message += `- Fit Note: ${product.sizeChart.fitNote}\n`;
    message += `\n`;
  }

  message += `Please generate the structured assessment based ONLY on the evidence provided above.`;
  
  return message;
}
