import { Link } from "react-router-dom"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-start px-4 py-16 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-2 max-w-prose text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link to="/" className={cn(buttonVariants({ variant: "default" }), "mt-6")}>
        Back to home
      </Link>
    </div>
  )
}
