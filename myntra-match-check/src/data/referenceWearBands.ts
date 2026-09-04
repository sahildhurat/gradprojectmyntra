import { Occasion } from "./types";

export interface WearBand {
  min: number;
  max: number;
  label: string;
}

export const referenceWearBands: Record<Occasion, WearBand> = {
  everyday: { min: 20, max: 50, label: "Everyday basics are typically worn 20–50+ times" },
  college: { min: 15, max: 40, label: "College wear is typically worn 15–40 times" },
  work: { min: 15, max: 40, label: "Workwear is typically worn 15–40 times" },
  date: { min: 5, max: 15, label: "Date outfits are typically worn 5–15 times" },
  wedding_event: { min: 2, max: 6, label: "Wedding and event wear is typically worn 2–6 times" },
  travel: { min: 8, max: 25, label: "Travel wear is typically worn 8–25 times" },
};
