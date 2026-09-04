import { products } from "../src/data/products";
import { generateAssessment } from "../src/lib/ai/assess";
import { Check, Occasion, Hesitation, FitIssue } from "../src/data/types";
import fs from "fs";

// Polyfill process.env since we're running locally outside Next.js
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

interface Scenario {
  id: string;
  occasion: Occasion;
  expectedWears: number;
  hesitation: Hesitation;
  usualSize?: string;
  priorFitIssue?: FitIssue;
}

const scenarios: Scenario[] = [
  { id: "A", occasion: "everyday", expectedWears: 25, hesitation: "worth_the_price" },
  { id: "B", occasion: "wedding_event", expectedWears: 4, hesitation: "will_i_wear_it" },
  { id: "C", occasion: "work", expectedWears: 15, hesitation: "will_it_fit", usualSize: "M", priorFitIssue: "inconsistent" },
  { id: "D", occasion: "date", expectedWears: 8, hesitation: "trust_listing" },
];

async function runCalibration() {
  console.log("Starting Match Check AI Calibration...");
  if (!process.env.GEMINI_API_KEY) {
    console.error("Missing GEMINI_API_KEY in .env.local!");
    process.exit(1);
  }

  const results = [];
  let errorCount = 0;
  
  // To avoid hitting API rate limits, we'll process sequentially with a small delay
  for (const product of products) {
    console.log(`\n--- Product: ${product.name} [${product.id}] ---`);
    for (const scenario of scenarios) {
      console.log(`  Evaluating Scenario ${scenario.id} (${scenario.occasion})...`);
      
      const context: Partial<Check> = {
        occasion: scenario.occasion,
        expectedWears: scenario.expectedWears,
        hesitation: scenario.hesitation,
        usualSize: scenario.usualSize,
        priorFitIssue: scenario.priorFitIssue
      };

      try {
        const assessment = await generateAssessment(product, context);
        
        // Basic metrics calculation
        const validEvidenceIds = new Set(product.evidence.map(e => e.id));
        let failedIds = 0;
        
        assessment.match_reasons.forEach(r => {
          r.evidence_ids.forEach(id => { if (!validEvidenceIds.has(id)) failedIds++; });
        });
        assessment.considerations.forEach(c => {
          c.evidence_ids.forEach(id => { if (!validEvidenceIds.has(id)) failedIds++; });
        });

        results.push({
          productId: product.id,
          scenarioId: scenario.id,
          assessment,
          metrics: {
            objectionCount: assessment.considerations.length,
            failedEvidenceIds: failedIds, // Should be 0 due to our Evidence Guard!
            completeness: assessment.evidence_completeness
          }
        });

      } catch (err: any) {
        console.error(`    Failed: ${err.message}`);
        errorCount++;
      }

      // Respect rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log("\nCalibration Complete. Writing to calibration.json...");
  fs.writeFileSync("calibration.json", JSON.stringify(results, null, 2));

  // Print Summary
  const objections = results.filter(r => r.metrics.objectionCount > 0).length;
  const total = results.length;
  const failedIds = results.reduce((sum, r) => sum + r.metrics.failedEvidenceIds, 0);

  console.log(`\n===== CALIBRATION SUMMARY =====`);
  console.log(`Total Assessments: ${total}`);
  console.log(`Objection Rate: ${objections}/${total} (${Math.round((objections/total)*100)}%) - Target: 33-50%`);
  console.log(`Failed Evidence IDs: ${failedIds} - Target: 0 (Thanks to Evidence Guard)`);
  console.log(`Errors: ${errorCount}`);
  console.log(`===============================`);
}

runCalibration();
