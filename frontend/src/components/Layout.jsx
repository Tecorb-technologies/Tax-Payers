import { Outlet } from "react-router-dom"

import Navbar from "@/components/Navbar"
import Sidebar from "@/components/Sidebar"

export default function Layout() {
  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <Sidebar />

      <div className="flex min-h-dvh flex-1 flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
        >
          Skip to main content
        </a>

        <Navbar />

        <main id="main-content" className="flex-1">
          <Outlet />
        </main>

        <footer className="border-t border-border">
          <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted-foreground sm:px-6">
            Tax-Payers &mdash; public spending, made visible.
          </div>
        </footer>
      </div>
    </div>
  )
}
