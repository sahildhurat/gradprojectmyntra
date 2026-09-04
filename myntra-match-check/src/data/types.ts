export type Occasion = "everyday" | "college" | "work" | "date" | "wedding_event" | "travel";
export type Hesitation = "worth_the_price" | "will_it_fit" | "trust_listing" | "will_i_wear_it" | "right_for_occasion";
export type FitIssue = "too_tight" | "too_loose" | "inconsistent" | "no_issues";
export type WorthItAnswer = "yes" | "not_sure" | "no";
export type DoubtResolution = "yes" | "partly" | "no";
export type FinalDecision = "buy" | "inner_circle" | "keep_later" | "remove";
export type VoteResponse = "works_for_you" | "only_if" | "not_for_this_use" | "not_sure";

export interface ProductAttribute {
  id: string;
  name: string;
  value: string;
}

export interface Evidence {
  id: string;
  type: "review" | "product_attribute" | "size_chart" | "rating_aggregate" | "brand_verification";
  content: string;
  source?: string;
  rating?: number;
}

export interface Verification {
  brandAuthorised: boolean;
  verifiedPurchaseShare: number; // 0 to 1
  styleCode: string | null;
  returnsWindow: number; // in days
  refundProtection: boolean;
  exchangePolicy: boolean;
}

export interface SizeChart {
  availableSizes: string[];
  measurements: Record<string, Record<string, string>>; // e.g. "M": { "chest": "40in", "length": "28in" }
  fitNote?: string;
}

export interface MatchReason {
  statement: string;
  evidence_ids: string[];
}

export interface Consideration {
  condition: string;
  implication: string;
  evidence_ids: string[];
}

export interface Unknown {
  statement: string;
  missing_information: string;
}

export interface Assessment {
  match_reasons: MatchReason[];
  considerations: Consideration[];
  unknowns: Unknown[];
  question_to_resolve: string;
  evidence_completeness: "high" | "medium" | "low";
}

export interface TrustBlockItem {
  icon: string;
  text: string;
  type: "verification" | "platform";
}

export interface TrustBlock {
  items: TrustBlockItem[];
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  rating: number;
  ratingCount: number;
  savedDaysAgo: number;
  attributes: ProductAttribute[];
  evidence: Evidence[];
  verification: Verification;
  sizeChart?: SizeChart;
  fallbackAssessment: Assessment | null;
}

export interface Check {
  id: string;
  anonymousUserId: string;
  productId: string;
  occasion: Occasion;
  expectedWears: number;
  hesitation: Hesitation;
  usualSize?: string;
  priorFitIssue?: FitIssue;
  assessment?: Assessment;
  doubtResolved?: DoubtResolution;
  finalDecision?: FinalDecision;
  createdAt: string;
  trustBlock?: TrustBlock;
}

export interface Share {
  token: string;
  checkId: string;
  shopperQuestion: string;
  productId: string;
  occasion: Occasion;
  costPerWear: number;
  consideration?: string;
  expiresAt: string;
}

export interface Vote {
  id: string;
  shareToken: string;
  response: VoteResponse;
  comment?: string;
  createdAt: string;
}

export interface AnalyticsEvent {
  sessionId: string;
  eventName: string;
  productId?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}
