import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, MapPin, Search, X } from "lucide-react"

import { getData, getErrorMessage } from "@/lib/api"
import { useFetch } from "@/hooks/useFetch"
import { formatCurrency, spentPercent } from "@/lib/format"
import { PROJECT_STATUSES, PROJECT_TYPES, getStatusMeta, getTypeMeta } from "@/lib/projectMeta"
import { cn } from "@/lib/utils"

import ChatPanel from "@/components/ChatPanel"
import ProjectsTable from "@/components/ProjectsTable"
import SpendingChart from "@/components/SpendingChart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { CardGridSkeleton, ChartSkeleton, ErrorNotice } from "@/components/StateViews"

/** One area's live budget/spend rollup, derived client-side from /projects. */
function AreaSpendingCard({ area, totalBudget, totalSpent, projectCount, counts }) {
  const percent = spentPercent(totalSpent, totalBudget)
  const overBudget = totalBudget > 0 && totalSpent > totalBudget

  const breakdownParts = [
    counts["in-progress"] > 0 && `${counts["in-progress"]} in progress`,
    counts.completed > 0 && `${counts.completed} completed`,
    counts.planned > 0 && `${counts.planned} planned`,
  ].filter(Boolean)

  return (
    <Link
      to={`/areas/${area.id}`}
      className="block rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Card className="group h-full cursor-pointer transition-all hover:shadow-md hover:ring-accent/40">
        <CardHeader className="gap-1">
          <div className="flex items-center justify-between gap-2">
            <CardTitle>{area.name}</CardTitle>
            <ArrowRight
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
            />
          </div>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin aria-hidden="true" className="size-3.5" />
            {area.city}, {area.state}
          </p>
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
                <span className="font-medium text-foreground">{formatCurrency(totalSpent)}</span> spent
              </span>
              <span>of {formatCurrency(totalBudget)}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {projectCount} project{projectCount === 1 ? "" : "s"}
            {breakdownParts.length > 0 && ` · ${breakdownParts.join(" · ")}`}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function HomePage() {
  const {
    data: stats,
    loading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useFetch(() => getData("/stats"), [])

  const {
    data: areas,
    loading: areasLoading,
    error: areasError,
    refetch: refetchAreas,
  } = useFetch(() => getData("/areas"), [])

  const {
    data: projects,
    loading: projectsLoading,
    error: projectsError,
    refetch: refetchProjects,
  } = useFetch(() => getData("/projects"), [])

  const [areaFilter, setAreaFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [search, setSearch] = useState("")

  const areasById = useMemo(() => {
    const map = {}
    ;(areas || []).forEach((area) => {
      map[area.id] = area
    })
    return map
  }, [areas])

  // Attach area name/city to each project once so both the table and the
  // filters below work off the same enriched list.
  const projectsWithArea = useMemo(() => {
    return (projects || []).map((project) => ({
      ...project,
      areaName: areasById[project.areaId]?.name,
      city: areasById[project.areaId]?.city,
    }))
  }, [projects, areasById])

  // Budget allocation by type — computed client-side because /stats'
  // spendByType is spend-based, not budget-based.
  const budgetByTypeData = useMemo(() => {
    const totals = {}
    ;(projects || []).forEach((project) => {
      const label = getTypeMeta(project.type).label
      totals[label] = (totals[label] || 0) + Number(project.budget || 0)
    })
    return Object.entries(totals)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({ name, value }))
  }, [projects])

  const budgetVsSpentData = useMemo(() => {
    if (!stats) return []
    return [
      { name: "Budget", value: stats.totalBudget },
      { name: "Spent", value: stats.totalSpent },
    ]
  }, [stats])

  // Group the already-fetched project list by area rather than firing an
  // extra request per area — this page already has every project in hand.
  const areaSpending = useMemo(() => {
    if (!areas || !projects) return []
    return areas.map((area) => {
      const areaProjects = projects.filter((project) => project.areaId === area.id)
      const totalBudget = areaProjects.reduce((sum, p) => sum + Number(p.budget || 0), 0)
      const totalSpent = areaProjects.reduce((sum, p) => sum + Number(p.spent || 0), 0)
      const counts = { planned: 0, "in-progress": 0, completed: 0 }
      areaProjects.forEach((p) => {
        if (counts[p.status] !== undefined) counts[p.status] += 1
      })
      return { area, totalBudget, totalSpent, projectCount: areaProjects.length, counts }
    })
  }, [areas, projects])

  const filteredProjects = useMemo(() => {
    const q = search.trim().toLowerCase()
    return projectsWithArea.filter((project) => {
      if (areaFilter !== "all" && project.areaId !== areaFilter) return false
      if (typeFilter !== "all" && project.type !== typeFilter) return false
      if (statusFilter !== "all" && project.status !== statusFilter) return false
      if (q && !project.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [projectsWithArea, areaFilter, typeFilter, statusFilter, search])

  const hasActiveFilters =
    areaFilter !== "all" || typeFilter !== "all" || statusFilter !== "all" || search.trim() !== ""

  function clearFilters() {
    setAreaFilter("all")
    setTypeFilter("all")
    setStatusFilter("all")
    setSearch("")
  }

  const overviewLoading = statsLoading || projectsLoading
  const overviewError = statsError || projectsError

  const areaSpendingLoading = areasLoading || projectsLoading
  const areaSpendingError = areasError || projectsError

  return (
    <div className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6 sm:py-12">
      <div className="max-w-2xl">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          See where public money is going
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          A live view of budgets, spending, and progress across every tracked area — road,
          building, bridge, park, and utility projects included.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Left column: dashboard content */}
        <div className="space-y-10">
          {/* KPI + chart row */}
          <section aria-label="Budget overview" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {overviewLoading ? (
              <>
                <ChartSkeleton />
                <ChartSkeleton />
              </>
            ) : overviewError ? (
              <ErrorNotice
                message={getErrorMessage(overviewError)}
                onRetry={() => {
                  refetchStats()
                  refetchProjects()
                }}
                className="sm:col-span-2"
              />
            ) : (
              <>
                <SpendingChart
                  title={
                    <span className="font-heading text-3xl font-semibold text-foreground">
                      {formatCurrency(stats?.totalBudget)}
                    </span>
                  }
                  description={`${stats?.projectCount ?? 0} projects · budget allocation by type`}
                  variant="pie"
                  data={budgetByTypeData}
                />
                <SpendingChart
                  title="Budget vs. spent"
                  description="Approved budget compared to amount spent to date, across every area"
                  variant="bar"
                  data={budgetVsSpentData}
                />
              </>
            )}
          </section>

          {/* Spending by area */}
          <section aria-label="Spending by area">
            <h2 className="font-heading text-xl font-semibold text-foreground">Spending by area</h2>
            <div className="mt-4">
              {areaSpendingLoading ? (
                <CardGridSkeleton count={3} />
              ) : areaSpendingError ? (
                <ErrorNotice
                  message={getErrorMessage(areaSpendingError)}
                  onRetry={() => {
                    refetchAreas()
                    refetchProjects()
                  }}
                />
              ) : areaSpending.length === 0 ? (
                <p className="text-sm text-muted-foreground">No areas are available yet.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {areaSpending.map((entry) => (
                    <AreaSpendingCard key={entry.area.id} {...entry} />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Active projects */}
          <section aria-label="Active projects">
            <h2 className="font-heading text-xl font-semibold text-foreground">Active projects</h2>

            <div className="mt-4 flex flex-wrap items-end gap-3">
              <div className="flex min-w-40 flex-col gap-1.5">
                <Label htmlFor="area-filter">Area</Label>
                <Select value={areaFilter} onValueChange={setAreaFilter}>
                  <SelectTrigger id="area-filter" className="w-full">
                    <SelectValue placeholder="All areas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All areas</SelectItem>
                    {(areas || []).map((area) => (
                      <SelectItem key={area.id} value={area.id}>
                        {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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

            <div className="mt-6">
              {projectsError ? (
                <ErrorNotice message={getErrorMessage(projectsError)} onRetry={refetchProjects} />
              ) : (
                <ProjectsTable projects={filteredProjects} loading={projectsLoading || areasLoading} />
              )}
            </div>
          </section>
        </div>

        {/* Right column: persistent AI assistant */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <ChatPanel title="TaxPayers Assistant" />
        </aside>
      </div>
    </div>
  )
}
