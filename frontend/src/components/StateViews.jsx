import { Loader2, TriangleAlert } from "lucide-react"

import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

/** Inline spinner + label for small loading regions. */
export function LoadingSpinner({ label = "Loading…", className }) {
  return (
    <div
      role="status"
      className={cn("flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground", className)}
    >
      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

/** Friendly error alert with an optional retry action. */
export function ErrorNotice({ title = "Couldn't load this page", message, onRetry, className }) {
  return (
    <Alert variant="destructive" className={cn("max-w-xl", className)}>
      <TriangleAlert aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <p>{message || "Something went wrong. Please try again."}</p>
        {onRetry && (
          <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
            Try again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}

/** Skeleton grid standing in for a row of project/area cards while loading. */
export function CardGridSkeleton({ count = 6, className }) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-xl border border-border bg-card p-4">
          <Skeleton className="h-5 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  )
}

/** Skeleton standing in for a map while its container/data is loading. */
export function MapSkeleton({ className }) {
  return <Skeleton className={cn("h-64 w-full rounded-xl sm:h-80 md:h-96", className)} />
}

/** Skeleton standing in for a chart card while loading. */
export function ChartSkeleton({ className }) {
  return (
    <div className={cn("space-y-3 rounded-xl border border-border bg-card p-4", className)}>
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

/** Simple centered empty-state message with optional supporting text. */
export function EmptyState({ title, description, className }) {
  return (
    <div className={cn("rounded-xl border border-dashed border-border p-10 text-center", className)}>
      <p className="font-heading text-base font-medium text-foreground">{title}</p>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
  )
}
