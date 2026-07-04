import { useParams } from "react-router-dom"
import { Building2, Calendar, IndianRupee, Wallet } from "lucide-react"

import { getData, getErrorMessage } from "@/lib/api"
import { useFetch } from "@/hooks/useFetch"
import { formatCurrency, formatDate, spentPercent } from "@/lib/format"
import { getStatusMeta, getTypeMeta } from "@/lib/projectMeta"

import AreaMap from "@/components/AreaMap"
import ChatPanel from "@/components/ChatPanel"
import SpendingChart from "@/components/SpendingChart"
import ProjectTimeline from "@/components/ProjectTimeline"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ErrorNotice, MapSkeleton } from "@/components/StateViews"

function DetailStat({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" />
      <div>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  )
}

export default function ProjectPage() {
  const { id } = useParams()
  const { data: project, loading, error, refetch } = useFetch(() => getData(`/projects/${id}`), [id])

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-16 sm:px-6">
        <div className="h-8 w-2/3 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-1/3 animate-pulse rounded-md bg-muted" />
        <MapSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <ErrorNotice
          title="Couldn't load this project"
          message={getErrorMessage(error)}
          onRetry={refetch}
        />
      </div>
    )
  }

  const typeMeta = getTypeMeta(project.type)
  const statusMeta = getStatusMeta(project.status)
  const TypeIcon = typeMeta.icon
  const percent = spentPercent(project.spent, project.budget)
  const overBudget = Number(project.spent) > Number(project.budget)

  const breakdownData = (project.spendingBreakdown || []).map((entry) => ({
    name: entry.category,
    value: entry.amount,
  }))

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge className={typeMeta.badgeClass}>
          <TypeIcon aria-hidden="true" className="size-3" />
          {typeMeta.label}
        </Badge>
        <Badge className={statusMeta.badgeClass}>{statusMeta.label}</Badge>
      </div>

      <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {project.name}
      </h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DetailStat icon={Wallet} label="Budget" value={formatCurrency(project.budget)} />
        <DetailStat icon={IndianRupee} label="Spent" value={formatCurrency(project.spent)} />
        <DetailStat icon={Building2} label="Contractor" value={project.contractor || "—"} />
        <DetailStat
          icon={Calendar}
          label="Timeline"
          value={`${formatDate(project.startDate)} – ${formatDate(project.endDate)}`}
        />
      </div>

      <div className="mt-4 max-w-md">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={overBudget ? "h-full rounded-full bg-destructive" : "h-full rounded-full bg-accent"}
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {Math.round(percent)}% of budget spent
          {overBudget && <span className="ml-1 font-medium text-destructive">(over budget)</span>}
        </p>
      </div>

      {/* Description */}
      {project.description && (
        <section className="mt-8">
          <h2 className="font-heading text-lg font-semibold text-foreground">About this project</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {project.description}
          </p>
        </section>
      )}

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Spending breakdown */}
        <SpendingChart
          title="Spending breakdown"
          description="Where the money spent so far has gone"
          variant="pie"
          data={breakdownData}
        />

        {/* Location map */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent>
            <AreaMap
              center={project.location}
              zoom={15}
              markers={[
                {
                  id: project.id,
                  position: project.location,
                  label: project.name,
                  color: statusMeta.color,
                },
              ]}
              heightClassName="h-64"
            />
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <section className="mt-10">
        <h2 className="font-heading text-lg font-semibold text-foreground">Development updates</h2>
        <div className="mt-4">
          <ProjectTimeline updates={project.updates} />
        </div>
      </section>

      {/* ChatPanel mounts here - added in AI chat UI task */}
      <section className="mt-10">
        <h2 className="font-heading text-lg font-semibold text-foreground">Ask about this project</h2>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          Chat with an AI using your own provider to get quick answers about this project&apos;s
          budget, status, and updates.
        </p>
        <div className="mt-4 max-w-2xl">
          <ChatPanel projectId={project.id} />
        </div>
      </section>
    </div>
  )
}
