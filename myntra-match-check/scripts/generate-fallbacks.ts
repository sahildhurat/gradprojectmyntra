import { products } from "../src/data/products";
import { generateAssessment } from "../src/lib/ai/assess";
import { Check, Assessment } from "../src/data/types";
import * as fs from "fs";
import * as path from "path";

// Load env vars
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const dummyCheck = {
  id: "check_fallback",
  occasion: "everyday" as any,
  expectedWears: 10,
  hesitation: "worth_the_price" as any,
  timestamp: Date.now(),
};

async function main() {
  console.log("Checking API key...");
  if (!process.env.GEMINI_API_KEY) {
    console.error("No GEMINI_API_KEY found in .env.local!");
    process.exit(1);
  }

  const fallbacks: Record<string, Assessment> = {};
  let successCount = 0;

  for (const product of products) {
    console.log(`\nGenerating fallback for product: ${product.name} (${product.id})...`);
    
    // Temporarily clear any existing fallback to ensure a real generation
    const p = { ...product, fallbackAssessment: undefined };
    
    const assessment = await generateAssessment(p as any, dummyCheck);
    
    // If it's a fallback (due to API failure), don't inject it as real!
    if (assessment.isFallback) {
      console.error(`Failed to generate real assessment for ${product.id}. API returned fallback.`);
      continue;
    }
    
    // Ensure the generated one has isFallback set to true so the UI knows it's cached
    assessment.isFallback = true;
    
    fallbacks[product.id] = assessment;
    successCount++;
    console.log(`Success for ${product.id}`);
  }

  if (successCount === 0) {
    console.error("\nFailed to generate any real assessments. Is the API key valid?");
    process.exit(1);
  }

  // Read products.ts
  const productsPath = path.join(process.cwd(), "src", "data", "products.ts");
  let productsContent = fs.readFileSync(productsPath, "utf-8");

  // Inject each fallback into productsContent
  for (const [id, assessment] of Object.entries(fallbacks)) {
    // Regex to match the product object by id and find its fallbackAssessment key
    const regex = new RegExp(`(id:\\s*"${id}"[\\s\\S]*?fallbackAssessment:\\s*)null`, "g");
    
    // Stringify and format the assessment
    const formattedAssessment = JSON.stringify(assessment, null, 4)
      // Indent each line by 4 spaces (since it's inside an object)
      .replace(/\n/g, "\n    ");
      
    productsContent = productsContent.replace(regex, `$1${formattedAssessment}`);
  }

  fs.writeFileSync(productsPath, productsContent, "utf-8");
  console.log(`\nSuccessfully injected ${successCount} fallbacks into products.ts`);
}

main().catch(console.error);
