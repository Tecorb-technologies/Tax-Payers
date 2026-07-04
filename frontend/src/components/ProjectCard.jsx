import { forwardRef } from "react"
import { Link } from "react-router-dom"
import { MapPin } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, spentPercent } from "@/lib/format"
import { getStatusMeta, getTypeMeta } from "@/lib/projectMeta"

/**
 * Compact, clickable summary of a project. Navigates to /projects/:id.
 * Forwards its ref so callers (e.g. AreaPage) can scroll a specific card
 * into view when its map marker is clicked.
 */
const ProjectCard = forwardRef(function ProjectCard({ project, highlighted = false, className, id }, ref) {
  const typeMeta = getTypeMeta(project.type)
  const statusMeta = getStatusMeta(project.status)
  const TypeIcon = typeMeta.icon
  const percent = spentPercent(project.spent, project.budget)
  const overBudget = Number(project.spent) > Number(project.budget)

  return (
    <Link
      ref={ref}
      id={id}
      to={`/projects/${project.id}`}
      className={cn(
        "block rounded-xl transition-shadow focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
    >
      <Card
        className={cn(
          "h-full cursor-pointer transition-all hover:shadow-md hover:ring-accent/40",
          highlighted && "ring-2 ring-accent"
        )}
      >
        <CardHeader className="gap-2">
          <h3 className="font-heading text-base leading-snug font-semibold text-foreground">{project.name}</h3>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge className={cn("gap-1", typeMeta.badgeClass)}>
              <TypeIcon aria-hidden="true" className="size-3" />
              {typeMeta.label}
            </Badge>
            <Badge className={statusMeta.badgeClass}>{statusMeta.label}</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full", overBudget ? "bg-destructive" : "bg-accent")}
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                <span className="font-medium text-foreground">{formatCurrency(project.spent)}</span> spent
              </span>
              <span>of {formatCurrency(project.budget)}</span>
            </div>
          </div>

          {(project.city || project.areaName) && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin aria-hidden="true" className="size-3.5" />
              {[project.areaName, project.city].filter(Boolean).join(", ")}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
})

export default ProjectCard
