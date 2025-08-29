// Paytable extracted from provided matrix (multipliers by hits for picks 1..10)
// Keys: picks -> { hits: multiplier }
export const PAYTABLE: Record<number, Record<number, number>> = {
  1: { 1: 3 },
  2: { 1: 1, 2: 9 },
  3: { 1: 1, 2: 2, 3: 16 },
  4: { 1: 0.5, 2: 2, 3: 6, 4: 12 },
  5: { 1: 0.5, 2: 1, 3: 3, 4: 15, 5: 50 },
  6: { 1: 0.5, 2: 1, 3: 2, 4: 3, 5: 30, 6: 75 },
  7: { 1: 0.5, 2: 0.5, 3: 1, 4: 6, 5: 12, 6: 36, 7: 100 },
  8: { 1: 0.5, 2: 0.5, 3: 1, 4: 3, 5: 6, 6: 19, 7: 90, 8: 720 },
  9: { 1: 0.5, 2: 0.5, 3: 1, 4: 2, 5: 4, 6: 8, 7: 20, 8: 80, 9: 1200 },
  10: { 1: 0, 2: 0, 3: 1, 4: 2, 5: 3, 6: 8, 7: 26, 8: 500, 9: 1500, 10: 10000 },
}

export function getPayoutMultiplier(picks: number, hits: number): number {
  const table = PAYTABLE[picks]
  if (!table) return 0
  return table[hits] || 0
}


