import { useEffect, useMemo, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { Search, X } from "lucide-react"

import { getData, getErrorMessage } from "@/lib/api"
import { useFetch } from "@/hooks/useFetch"
import { formatCurrency } from "@/lib/format"
import { PROJECT_STATUSES, PROJECT_TYPES, getStatusMeta, getTypeMeta } from "@/lib/projectMeta"

import AreaMap from "@/components/AreaMap"
import ProjectCard from "@/components/ProjectCard"
import SpendingChart from "@/components/SpendingChart"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CardGridSkeleton,
  ChartSkeleton,
  EmptyState,
  ErrorNotice,
  MapSkeleton,
} from "@/components/StateViews"

const STATUS_LEGEND = PROJECT_STATUSES.map((status) => ({
  color: getStatusMeta(status).color,
  label: getStatusMeta(status).label,
}))

function StatTile({ label, value }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-1 font-heading text-xl font-semibold text-foreground">{value}</p>
    </div>
  )
}

export default function AreaPage() {
  const { id } = useParams()
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [highlightedId, setHighlightedId] = useState(null)
  const cardRefs = useRef({})
  const highlightTimeout = useRef(null)

  const {
    data: area,
    loading: areaLoading,
    error: areaError,
    refetch: refetchArea,
  } = useFetch(() => getData(`/areas/${id}`), [id])

  const {
    data: projects,
    loading: projectsLoading,
    error: projectsError,
    refetch: refetchProjects,
  } = useFetch(() => getData("/projects", { params: { areaId: id } }), [id])

  const {
    data: stats,
    loading: statsLoading,
    error: statsError,
  } = useFetch(() => getData("/stats", { params: { areaId: id } }), [id])

  useEffect(() => () => clearTimeout(highlightTimeout.current), [])

  // Filtering is done client-side against the already-fetched project list:
  // each area holds only a handful of projects, so a refetch-per-filter
  // round trip would just add latency without a real benefit at this scale.
  const filteredProjects = useMemo(() => {
    if (!projects) return []
    const q = search.trim().toLowerCase()
    return projects.filter((project) => {
      if (typeFilter !== "all" && project.type !== typeFilter) return false
      if (statusFilter !== "all" && project.status !== statusFilter) return false
      if (q && !project.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [projects, typeFilter, statusFilter, search])

  const hasActiveFilters = typeFilter !== "all" || statusFilter !== "all" || search.trim() !== ""

  function clearFilters() {
    setTypeFilter("all")
    setStatusFilter("all")
    setSearch("")
  }

  function handleMarkerClick(marker) {
    setHighlightedId(marker.id)
    cardRefs.current[marker.id]?.scrollIntoView({ behavior: "smooth", block: "center" })
    clearTimeout(highlightTimeout.current)
    highlightTimeout.current = setTimeout(() => setHighlightedId(null), 2500)
  }

  const markers = useMemo(
    () =>
      (filteredProjects || []).map((project) => ({
        id: project.id,
        position: project.location,
        label: `${project.name} — ${getStatusMeta(project.status).label}`,
        color: getStatusMeta(project.status).color,
        onClick: handleMarkerClick,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filteredProjects]
  )

  const spendByTypeData = useMemo(() => {
    if (!stats?.spendByType) return []
    return Object.entries(stats.spendByType)
      .filter(([, value]) => value > 0)
      .map(([type, value]) => ({ name: getTypeMeta(type).label, value }))
  }, [stats])

  const budgetVsSpentData = useMemo(() => {
    if (!area?.summary) return []
    return [
      { name: "Budget", value: area.summary.totalBudget },
      { name: "Spent", value: area.summary.totalSpent },
    ]
  }, [area])

  if (areaError) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <ErrorNotice
          title="Couldn't load this area"
          message={getErrorMessage(areaError)}
          onRetry={refetchArea}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      {/* Header */}
      {areaLoading ? (
        <div className="space-y-3">
          <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-40 animate-pulse rounded-md bg-muted" />
        </div>
      ) : (
        <>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {area.name}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {area.city}, {area.state}
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:max-w-xl">
            <StatTile label="Total budget" value={formatCurrency(area.summary?.totalBudget)} />
            <StatTile label="Total spent" value={formatCurrency(area.summary?.totalSpent)} />
            <StatTile label="Projects" value={area.summary?.projectCount ?? "—"} />
          </div>
        </>
      )}

      {/* Map */}
      <section className="mt-8" aria-label="Project locations">
        {projectsLoading ? (
          <MapSkeleton />
        ) : projectsError ? (
          <ErrorNotice message={getErrorMessage(projectsError)} onRetry={refetchProjects} />
        ) : (
          <AreaMap
            center={area?.center}
            zoom={area?.zoom}
            markers={markers}
            legend={STATUS_LEGEND}
            fitToMarkers={markers.length > 0}
          />
        )}
      </section>

      {/* Charts */}
      <section className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2" aria-label="Spending summary">
        {statsLoading ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : statsError ? (
          <ErrorNotice message={getErrorMessage(statsError)} className="lg:col-span-2" />
        ) : (
          <>
            <SpendingChart
              title="Spend by project type"
              description="Total spent so far, grouped by project type"
              variant="bar"
              data={spendByTypeData}
            />
            <SpendingChart
              title="Budget vs. spent"
              description="Approved budget compared to amount spent to date"
              variant="bar"
              data={budgetVsSpentData}
            />
          </>
        )}
      </section>

      {/* Filters */}
      <section className="mt-10">
        <h2 className="font-heading text-xl font-semibold text-foreground">Projects</h2>

        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div className="flex min-w-40 flex-col gap-1.5">
            <Label htmlFor="type-filter">Type</Label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger id="type-filter" className="w-full">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {PROJECT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {getTypeMeta(type).label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex min-w-40 flex-col gap-1.5">
            <Label htmlFor="status-filter">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status-filter" className="w-full">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {PROJECT_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {getStatusMeta(status).label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex min-w-52 flex-1 flex-col gap-1.5">
            <Label htmlFor="project-search">Search</Label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="project-search"
                type="search"
                placeholder="Search projects by name…"
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
              <X aria-hidden="true" />
              Clear filters
            </Button>
          )}
        </div>

        {/* Project cards */}
        <div className="mt-6">
          {projectsLoading ? (
            <CardGridSkeleton />
          ) : projectsError ? null : filteredProjects.length === 0 ? (
            <EmptyState
              title="No projects match your filters"
              description="Try a different type, status, or search term."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  id={`project-card-${project.id}`}
                  ref={(el) => {
                    cardRefs.current[project.id] = el
                  }}
                  project={{ ...project, areaName: area?.name, city: area?.city }}
                  highlighted={highlightedId === project.id}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
