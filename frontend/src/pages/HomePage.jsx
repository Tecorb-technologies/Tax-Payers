import { useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowRight, MapPin } from "lucide-react"

import { getData, getErrorMessage } from "@/lib/api"
import { useFetch } from "@/hooks/useFetch"
import AreaMap from "@/components/AreaMap"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { CardGridSkeleton, ErrorNotice, MapSkeleton } from "@/components/StateViews"

function AreaCard({ area }) {
  return (
    <Link
      to={`/areas/${area.id}`}
      className="block rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Card className="group h-full cursor-pointer transition-all hover:shadow-md hover:ring-accent/40">
        <CardHeader className="gap-1">
          <h2 className="font-heading text-lg font-semibold text-foreground">{area.name}</h2>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin aria-hidden="true" className="size-3.5" />
            {area.city}, {area.state}
          </p>
        </CardHeader>
        <CardContent>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-accent">
            View spending
            <ArrowRight aria-hidden="true" className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const { data: areas, loading, error, refetch } = useFetch(() => getData("/areas"), [])

  const markers = useMemo(
    () =>
      (areas || []).map((area) => ({
        id: area.id,
        position: area.center,
        label: `${area.name}, ${area.city}`,
        color: "#0369A1",
        onClick: () => navigate(`/areas/${area.id}`),
      })),
    [areas, navigate]
  )

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="max-w-2xl">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          See where public money is going
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Pick an area to explore road, building, bridge, park, and utility projects — with real
          budgets, spending, and progress updates.
        </p>
      </div>

      <div className="mt-8">
        {loading ? (
          <MapSkeleton />
        ) : error ? (
          <ErrorNotice message={getErrorMessage(error)} onRetry={refetch} />
        ) : (
          <AreaMap center={{ lat: 20.5937, lng: 78.9629 }} zoom={5} markers={markers} fitToMarkers />
        )}
      </div>

      <div className="mt-10">
        <h2 className="font-heading text-xl font-semibold text-foreground">Areas</h2>
        <div className="mt-4">
          {loading ? (
            <CardGridSkeleton count={3} />
          ) : error ? null : areas?.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {areas.map((area) => (
                <AreaCard key={area.id} area={area} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No areas are available yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
