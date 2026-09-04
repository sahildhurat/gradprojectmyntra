import { generateAssessment } from "../src/lib/ai/assess";
import { products } from "../src/data/products";
import fs from "fs";
import path from "path";

async function runPregenerate() {
  console.log("Generating fallback assessments for 6 products...");
  
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is missing. Cannot run pregeneration.");
    process.exit(1);
  }

  const fallbacks: Record<string, any> = {};

  for (const product of products) {
    console.log(`Generating fallback for ${product.id}...`);
    // Neutral context
    const ctx = { occasion: "everyday", expectedWears: 15, hesitation: "worth_the_price" };
    const assessment = await generateAssessment(product, ctx as any);
    
    fallbacks[product.id] = assessment;
    await new Promise(r => setTimeout(r, 2000));
  }

  const outPath = path.join(process.cwd(), "fallbacks.json");
  fs.writeFileSync(outPath, JSON.stringify(fallbacks, null, 2));
  console.log(`\nSuccessfully generated fallbacks and saved to ${outPath}`);
  console.log("For a full production build, these should be embedded into src/data/products.ts.");
}

runPregenerate().catch(console.error);
