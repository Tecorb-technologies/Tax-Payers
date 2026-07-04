import { useMemo } from "react"

import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/format"
import { EmptyState } from "@/components/StateViews"

/**
 * Vertical "what's new" feed for a project's `updates`, most recent first.
 * @param {{date:string,title:string,note:string}[]} updates
 */
export default function ProjectTimeline({ updates = [], className }) {
  const sorted = useMemo(
    () => [...updates].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [updates]
  )

  if (!sorted.length) {
    return (
      <EmptyState
        title="No updates yet"
        description="Check back for progress notes and development changes on this project."
        className={className}
      />
    )
  }

  return (
    <ol className={cn("relative space-y-6 border-l border-border pl-6", className)}>
      {sorted.map((update, index) => (
        <li key={`${update.date}-${update.title}`} className="relative">
          <span
            aria-hidden="true"
            className={cn(
              "absolute top-1 -left-[calc(1.5rem+4.5px)] size-2.5 rounded-full ring-4 ring-background",
              index === 0 ? "bg-accent" : "bg-muted-foreground/50"
            )}
          />
          <time dateTime={update.date} className="block text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {formatDate(update.date)}
            {index === 0 && <span className="ml-2 rounded-full bg-accent/10 px-1.5 py-0.5 text-accent normal-case">Latest</span>}
          </time>
          <h3 className="mt-1 font-heading text-sm font-semibold text-foreground">{update.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{update.note}</p>
        </li>
      ))}
    </ol>
  )
}
