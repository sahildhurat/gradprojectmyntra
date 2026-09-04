export function calculateCostPerWear(price: number, expectedWears: number): number {
  return Math.round(price / Math.max(expectedWears, 1));
}
