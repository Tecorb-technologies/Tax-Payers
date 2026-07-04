// All currency in this app is INR. Two formatters: a precise one for
// headline totals/tooltips, and a compact one (lakh/crore) for tight
// spaces like chart axis ticks.
const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
})

const compactCurrencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  notation: "compact",
  maximumFractionDigits: 1,
})

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

export function formatCurrency(amount) {
  return currencyFormatter.format(Number(amount) || 0)
}

export function formatCompactCurrency(amount) {
  return compactCurrencyFormatter.format(Number(amount) || 0)
}

export function formatDate(dateString) {
  if (!dateString) return "—"
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return dateString
  return dateFormatter.format(date)
}

/** Percentage of budget spent, clamped to [0, 100] for progress-bar widths. */
export function spentPercent(spent, budget) {
  if (!budget) return 0
  return Math.min(100, Math.max(0, (Number(spent) / Number(budget)) * 100))
}
