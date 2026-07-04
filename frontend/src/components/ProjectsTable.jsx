import { Link } from "react-router-dom"
import { MapPin } from "lucide-react"

import { cn } from "@/lib/utils"
import { formatCurrency, formatDate, spentPercent } from "@/lib/format"
import { getStatusMeta, getTypeMeta } from "@/lib/projectMeta"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/StateViews"

const TABLE_HEADERS = ["Project", "Budget / spent", "Timeline", "Status", "Location"]

function TableRowsSkeleton({ count = 6 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr key={i} className="border-b border-border last:border-0">
          {TABLE_HEADERS.map((header) => (
            <td key={header} className="px-4 py-3">
              <Skeleton className="h-4 w-full max-w-32" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

/**
 * Filterable table of projects spanning every area. Expects each project to
 * already carry `areaName`/`city` (see HomePage, which merges these in from
 * the /areas list so this component doesn't need to fetch anything itself).
 */
export default function ProjectsTable({ projects, loading }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full min-w-[42rem] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {TABLE_HEADERS.map((header) => (
              <th key={header} scope="col" className="px-4 py-3 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <TableRowsSkeleton />
          ) : projects.length === 0 ? (
            <tr>
              <td colSpan={TABLE_HEADERS.length} className="p-0">
                <EmptyState
                  className="rounded-none border-0"
                  title="No projects match your filters"
                  description="Try a different area, type, status, or search term."
                />
              </td>
            </tr>
          ) : (
            projects.map((project) => {
              const typeMeta = getTypeMeta(project.type)
              const statusMeta = getStatusMeta(project.status)
              const TypeIcon = typeMeta.icon
              const percent = spentPercent(project.spent, project.budget)
              const overBudget = Number(project.spent) > Number(project.budget)

              return (
                <tr key={project.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <Link
                      to={`/projects/${project.id}`}
                      className="font-medium text-foreground hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      {project.name}
                    </Link>
                    <div className="mt-1">
                      <Badge className={cn("gap-1", typeMeta.badgeClass)}>
                        <TypeIcon aria-hidden="true" className="size-3" />
                        {typeMeta.label}
                      </Badge>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="w-32">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn("h-full rounded-full", overBudget ? "bg-destructive" : "bg-accent")}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{formatCurrency(project.spent)}</span> of{" "}
                        {formatCurrency(project.budget)}
                      </p>
                    </div>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {formatDate(project.startDate)} – {formatDate(project.endDate)}
                  </td>

                  <td className="px-4 py-3">
                    <Badge className={statusMeta.badgeClass}>{statusMeta.label}</Badge>
                  </td>

                  <td className="px-4 py-3 text-muted-foreground">
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
                      {[project.areaName, project.city].filter(Boolean).join(", ") || "—"}
                    </span>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
