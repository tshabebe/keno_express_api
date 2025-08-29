// Typical baseline paytable (multipliers by hits for picks 1..10)
// Values are illustrative mid-range; adjust per jurisdiction/product.
export const PAYTABLE: Record<number, Record<number, number>> = {
  1: { 1: 3 },
  2: { 2: 10 },
  3: { 3: 20 },
  4: { 4: 60, 3: 5 },
  5: { 5: 900, 4: 22, 3: 4 },
  6: { 6: 1800, 5: 80, 4: 10, 3: 2 },
  7: { 7: 6000, 6: 450, 5: 30, 4: 5, 3: 1 },
  8: { 8: 12000, 7: 1000, 6: 120, 5: 15, 4: 3 },
  9: { 9: 30000, 8: 2200, 7: 180, 6: 25, 5: 4 },
  10: { 10: 10000, 9: 2200, 8: 450, 7: 80, 6: 15, 5: 3 },
}

export function getPayoutMultiplier(picks: number, hits: number): number {
  const table = PAYTABLE[picks]
  if (!table) return 0
  return table[hits] || 0
}


