// =============================================================================
// Paisa Helpers — BDT ⇄ paisa conversion
// -----------------------------------------------------------------------------
// All prices in the DB are stored as integer paisa (1 BDT = 100 paisa) using
// BigInt to avoid floating-point rounding errors. These helpers convert
// between the two representations for API input/output.
// =============================================================================

/**
 * Convert BDT (taka) → integer paisa. Rounds to nearest paisa.
 *   bdtToPaisa(950)    → 95000n
 *   bdtToPaisa(12.50)  → 1250n
 */
export function bdtToPaisa(bdt: number): bigint {
  if (!Number.isFinite(bdt) || bdt < 0) {
    throw new Error(`Invalid BDT value: ${bdt}`);
  }
  return BigInt(Math.round(bdt * 100));
}

/**
 * Convert paisa (bigint or number) → BDT (taka) as a number.
 *   paisaToBdt(95000n)  → 950
 *   paisaToBdt(1250n)   → 12.5
 */
export function paisaToBdt(paisa: bigint | number): number {
  const p = typeof paisa === "bigint" ? Number(paisa) : paisa;
  return p / 100;
}

/**
 * Format paisa as a human-readable ৳ string.
 *   formatPaisaAsBdt(95000n)  → "৳950"
 *   formatPaisaAsBdt(1250n)   → "৳12.50"
 */
export function formatPaisaAsBdt(paisa: bigint | number): string {
  const bdt = paisaToBdt(paisa);
  const hasFractional = !Number.isInteger(bdt);
  return `৳${hasFractional ? bdt.toFixed(2) : bdt.toLocaleString("en-BD")}`;
}

/**
 * Multiply paisa by an integer quantity → total in paisa.
 */
export function multiplyPaisa(paisa: bigint, quantity: number): bigint {
  return paisa * BigInt(quantity);
}

/**
 * Sum paisa values.
 */
export function sumPaisa(...values: bigint[]): bigint {
  return values.reduce((acc, v) => acc + v, 0n);
}
