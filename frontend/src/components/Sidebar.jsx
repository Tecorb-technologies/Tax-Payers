import { Home, Landmark, Settings } from "lucide-react"
import { NavLink } from "react-router-dom"

import { cn } from "@/lib/utils"

// Only the two routes that actually exist get a rail icon — don't invent
// destinations that have no page behind them.
const SIDEBAR_LINKS = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/settings", label: "Settings", icon: Settings, end: false },
]

/**
 * Persistent dark icon-only navigation rail, visible from `md:` up.
 * On mobile, Navbar's hamburger Sheet remains the only nav UI.
 */
export default function Sidebar() {
  return (
    <aside className="hidden w-16 shrink-0 flex-col items-center border-r border-sidebar-border bg-sidebar py-4 md:flex">
      <NavLink
        to="/"
        aria-label="TaxPayers home"
        title="TaxPayers"
        className="flex size-10 shrink-0 items-center justify-center rounded-xl text-sidebar-ring transition-colors hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
      >
        <Landmark className="size-6" aria-hidden="true" />
      </NavLink>

      <nav aria-label="Primary" className="mt-8 flex flex-col items-center gap-2">
        {SIDEBAR_LINKS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            aria-label={label}
            title={label}
            className={({ isActive }) =>
              cn(
                "flex size-10 items-center justify-center rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                isActive
                  ? "bg-sidebar-accent text-sidebar-ring"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )
            }
          >
            <Icon className="size-5" aria-hidden="true" />
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
