import { Cell, Pie, PieChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCompactCurrency, formatCurrency } from "@/lib/format"

// Categorical palette mirroring the --chart-1..5 tokens in index.css.
// Hardcoded (rather than read via CSS var()) because Recharts renders
// these as raw SVG presentation attributes, which don't reliably resolve
// CSS custom properties across browsers.
const CHART_COLORS = ["#0369A1", "#0EA5E9", "#38BDF8", "#0F172A", "#64748B", "#059669", "#D97706"]
const GRID_COLOR = "#E2E8F0" // matches --border
const AXIS_TEXT_COLOR = "#475569" // matches --muted-foreground

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-0.5 font-medium text-popover-foreground">{label ?? item.name}</p>
      <p className="font-semibold text-popover-foreground">{formatCurrency(item.value)}</p>
    </div>
  )
}

function ChartLegend({ data, colors }) {
  const total = data.reduce((sum, d) => sum + (Number(d.value) || 0), 0)
  return (
    <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5" aria-label="Chart legend">
      {data.map((entry, i) => (
        <li key={entry.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            aria-hidden="true"
            className="inline-block size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: colors[i % colors.length] }}
          />
          <span className="text-foreground">{entry.name}</span>
          <span>
            {formatCurrency(entry.value)}
            {total > 0 && ` (${Math.round((entry.value / total) * 100)}%)`}
          </span>
        </li>
      ))}
    </ul>
  )
}

/**
 * Reusable spending chart: a donut for proportional category breakdowns
 * (e.g. a project's spendingBreakdown) or a bar chart for comparisons
 * (e.g. budget vs spent, or spend by project type across an area).
 *
 * @param {{name:string,value:number}[]} data
 * @param {string} title
 * @param {string} [description]
 * @param {'pie'|'bar'} [variant]
 * @param {string[]} [colors]
 */
export default function SpendingChart({ data = [], title, description, variant = "bar", colors = CHART_COLORS, className }) {
  const hasData = data.length > 0 && data.some((d) => Number(d.value) > 0)

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <p className="flex h-64 items-center justify-center text-center text-sm text-muted-foreground">
            No spending data available yet.
          </p>
        ) : (
          <>
            <div className="h-64" aria-hidden="true">
              <ResponsiveContainer width="100%" height="100%">
                {variant === "pie" ? (
                  <PieChart>
                    <Tooltip content={<ChartTooltip />} />
                    <Pie
                      data={data}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="55%"
                      outerRadius="85%"
                      paddingAngle={2}
                      stroke="var(--card)"
                      strokeWidth={2}
                    >
                      {data.map((entry, i) => (
                        <Cell key={entry.name} fill={colors[i % colors.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                ) : (
                  <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke={GRID_COLOR} vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: AXIS_TEXT_COLOR }}
                      tickLine={false}
                      axisLine={{ stroke: GRID_COLOR }}
                      interval={0}
                      angle={data.length > 4 ? -20 : 0}
                      textAnchor={data.length > 4 ? "end" : "middle"}
                      height={data.length > 4 ? 48 : 28}
                    />
                    <YAxis
                      tickFormatter={formatCompactCurrency}
                      tick={{ fontSize: 12, fill: AXIS_TEXT_COLOR }}
                      tickLine={false}
                      axisLine={false}
                      width={56}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(3, 105, 161, 0.06)" }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={64}>
                      {data.map((entry, i) => (
                        <Cell key={entry.name} fill={colors[i % colors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
            {/* Text legend doubles as a screen-reader-friendly data summary. */}
            <ChartLegend data={data} colors={colors} />
          </>
        )}
      </CardContent>
    </Card>
  )
}
