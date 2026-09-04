import { Schema, SchemaType } from "@google/generative-ai";

export const assessmentSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    match_reasons: {
      type: SchemaType.ARRAY,
      description: "Array of positive statements about why this item fits the user context.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          statement: {
            type: SchemaType.STRING,
            description: "The positive statement/finding."
          },
          evidence_ids: {
            type: SchemaType.ARRAY,
            description: "Array of evidence IDs from the provided evidence list that support this statement.",
            items: { type: SchemaType.STRING }
          }
        },
        required: ["statement", "evidence_ids"]
      }
    },
    considerations: {
      type: SchemaType.ARRAY,
      description: "Array of conditional warnings or things to consider. MUST be phrased conditionally e.g. 'If X matters to you...'",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          condition: {
            type: SchemaType.STRING,
            description: "The condition, e.g. 'If you are sensitive to scratchy fabrics...'"
          },
          implication: {
            type: SchemaType.STRING,
            description: "The implication based on evidence, e.g. '...reviewers note the zari work can be abrasive.'"
          },
          evidence_ids: {
            type: SchemaType.ARRAY,
            description: "Array of evidence IDs from the provided evidence list that support this consideration.",
            items: { type: SchemaType.STRING }
          }
        },
        required: ["condition", "implication", "evidence_ids"]
      }
    },
    unknowns: {
      type: SchemaType.ARRAY,
      description: "Array of statements acknowledging what cannot be determined from the evidence.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          statement: {
            type: SchemaType.STRING,
            description: "What is unknown."
          },
          missing_information: {
            type: SchemaType.STRING,
            description: "Why it is missing or what would be needed to know."
          }
        },
        required: ["statement", "missing_information"]
      }
    },
    question_to_resolve: {
      type: SchemaType.STRING,
      description: "A single, focused question for the user to help resolve their main hesitation."
    },
    evidence_completeness: {
      type: SchemaType.STRING,
      description: "High, medium, or low based on how much of the required context was found in the evidence.",
      enum: ["high", "medium", "low"]
    }
  },
  required: ["match_reasons", "considerations", "unknowns", "question_to_resolve", "evidence_completeness"]
};
