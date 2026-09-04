import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config({ path: "d:/Grad Project/myntra-match-check/.env.local" });

async function main() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  
  const modelsToTest = ["gemini-3.6-flash"];
  
  for (const m of modelsToTest) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const res = await model.generateContent("Hello");
      console.log(`Success with ${m}:`, res.response.text());
    } catch (e: any) {
      console.error(`Failed with ${m}:`, e.message);
    }
  }
}
main();
