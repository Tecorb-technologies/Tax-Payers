import { useEffect, useMemo } from "react"
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet"
import L from "leaflet"

import { cn } from "@/lib/utils"

// Leaflet's default marker icon references image assets by relative URL,
// which breaks under Vite's bundling (404s for marker-icon.png etc). Rather
// than importing and re-wiring those PNGs, every marker here uses a
// hand-built SVG "pin" divIcon — this sidesteps the asset-path issue
// entirely and lets us color-code pins per marker.
const iconCache = new Map()

function pinIcon(color) {
  const key = color || "default"
  if (iconCache.has(key)) return iconCache.get(key)

  const fill = color || "#0369A1"
  const icon = L.divIcon({
    className: "", // strip Leaflet's default divIcon box styling
    html: `
      <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg" role="presentation">
        <path d="M15 0C6.716 0 0 6.716 0 15c0 10.5 15 25 15 25s15-14.5 15-25C30 6.716 23.284 0 15 0z" fill="${fill}" stroke="white" stroke-width="1.5"/>
        <circle cx="15" cy="15" r="5.5" fill="white"/>
      </svg>
    `,
    iconSize: [30, 40],
    iconAnchor: [15, 38],
    popupAnchor: [0, -34],
  })
  iconCache.set(key, icon)
  return icon
}

/** Imperatively fits the map to all marker positions once they're known. */
function FitToMarkers({ markers }) {
  const map = useMap()

  useEffect(() => {
    if (!markers.length) return
    if (markers.length === 1) {
      map.setView([markers[0].position.lat, markers[0].position.lng], map.getZoom())
      return
    }
    const bounds = L.latLngBounds(markers.map((m) => [m.position.lat, m.position.lng]))
    map.fitBounds(bounds, { padding: [48, 48] })
  }, [map, markers])

  return null
}

/**
 * Reusable Leaflet map for both a multi-project/area overview and a
 * single-marker project detail view.
 *
 * @param {{lat:number,lng:number}} center
 * @param {number} zoom
 * @param {Array<{id:string, position:{lat:number,lng:number}, label:string, color?:string, onClick?:Function}>} markers
 * @param {Array<{color:string,label:string}>} [legend] - optional color-key rendered below the map
 * @param {boolean} [fitToMarkers] - auto-fit viewport to markers instead of using center/zoom
 * @param {string} [heightClassName] - Tailwind height classes for the map container
 */
export default function AreaMap({
  center,
  zoom = 13,
  markers = [],
  legend,
  fitToMarkers = false,
  heightClassName = "h-64 sm:h-80 md:h-96",
  className,
}) {
  const fallbackCenter = markers[0]?.position || { lat: 20.5937, lng: 78.9629 } // India centroid fallback
  const mapCenter = center || fallbackCenter

  const markerElements = useMemo(
    () =>
      markers.map((marker) => (
        <Marker
          key={marker.id}
          position={[marker.position.lat, marker.position.lng]}
          icon={pinIcon(marker.color)}
          keyboard
          eventHandlers={marker.onClick ? { click: () => marker.onClick(marker) } : undefined}
        >
          <Popup>
            <span className="text-sm font-medium">{marker.label}</span>
          </Popup>
        </Marker>
      )),
    [markers]
  )

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn("overflow-hidden rounded-xl ring-1 ring-border", heightClassName)}
        role="group"
        aria-label="Map"
      >
        <MapContainer
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={zoom}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {fitToMarkers && <FitToMarkers markers={markers} />}
          {markerElements}
        </MapContainer>
      </div>

      {legend && legend.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5" aria-label="Map marker legend">
          {legend.map((item) => (
            <li key={item.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                aria-hidden="true"
                className="inline-block size-2.5 rounded-full ring-1 ring-black/10"
                style={{ backgroundColor: item.color }}
              />
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
