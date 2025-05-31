"use client"

import { MapPin, Info } from "lucide-react"
import { formatEventTimeRange } from "../../../lib/date-utils"

export default function EventTooltip({ event, position }) {
  if (!event || !position) return null

  return (
    <div
      className="fixed z-50 bg-white rounded-md shadow-lg border border-gray-200 p-2 text-xs w-48"
      style={{
        left: `${position.x + 10}px`,
        top: `${position.y + 10}px`,
      }}
    >
      <div className="font-medium text-gray-900">{event.title}</div>
      <div className="text-gray-600 mt-1">
        {formatEventTimeRange(event)}
      </div>
      {event.location && (
        <div className="text-gray-600 mt-1 flex items-center">
          <MapPin size={10} className="mr-1" /> {event.location}
        </div>
      )}
      <div className="text-blue-500 mt-1 flex items-center">
        <Info size={10} className="mr-1" /> Click for details
      </div>
    </div>
  )
}
