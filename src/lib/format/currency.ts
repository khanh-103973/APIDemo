/**
 * Currency formatting for Vietnam market (VND)
 */

export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Compact VND format for listing cards and filters (e.g. "5.5 tr/tháng")
 */
export function formatCompactVND(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1).replace(".0", "")} tỷ`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1).replace(".0", "")} tr`;
  }
  return formatVND(amount);
}
