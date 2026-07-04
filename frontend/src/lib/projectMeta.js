import { Building2, Road, TreePine, Waypoints, Zap } from "lucide-react"

export const PROJECT_TYPES = ["road", "building", "bridge", "park", "utility"]
export const PROJECT_STATUSES = ["planned", "in-progress", "completed"]

// Project *type* is shown with an icon + label, and a light categorical
// tint that's decorative reinforcement only (never the sole signal —
// the icon and text label always carry the meaning).
export const TYPE_META = {
  road: {
    label: "Road",
    icon: Road,
    badgeClass: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  },
  building: {
    label: "Building",
    icon: Building2,
    badgeClass: "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
  },
  bridge: {
    label: "Bridge",
    icon: Waypoints,
    badgeClass: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
  },
  park: {
    label: "Park",
    icon: TreePine,
    badgeClass: "bg-lime-100 text-lime-800 dark:bg-lime-950 dark:text-lime-300",
  },
  utility: {
    label: "Utility",
    icon: Zap,
    badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  },
}

// Project *status* is the map-pin color-coding dimension (see AreaMap):
// progress is the single most actionable signal for a citizen scanning a
// map of projects, and three well-separated hues stay legible at pin size
// (unlike five type colors would). Every pin/badge also carries a text
// label, so color is never the only cue.
export const STATUS_META = {
  planned: {
    label: "Planned",
    color: "#64748B",
    badgeClass: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
  "in-progress": {
    label: "In progress",
    color: "#0369A1",
    badgeClass: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  },
  completed: {
    label: "Completed",
    color: "#059669",
    badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  },
}

const FALLBACK_TYPE = { label: "Other", icon: Building2, badgeClass: "bg-muted text-muted-foreground" }
const FALLBACK_STATUS = { label: "Unknown", color: "#94A3B8", badgeClass: "bg-muted text-muted-foreground" }

export function getTypeMeta(type) {
  return TYPE_META[type] || { ...FALLBACK_TYPE, label: type || FALLBACK_TYPE.label }
}

export function getStatusMeta(status) {
  return STATUS_META[status] || { ...FALLBACK_STATUS, label: status || FALLBACK_STATUS.label }
}
