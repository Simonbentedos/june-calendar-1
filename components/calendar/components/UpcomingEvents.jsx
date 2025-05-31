"use client"

import { formatEventTimeRange } from "../../../lib/date-utils"

export default function UpcomingEvents({ 
  events, 
  isLoading, 
  searchTerm, 
  onEventClick, 
  onEventMouseEnter, 
  onEventMouseLeave 
}) {
  const getFilteredEvents = () => {
    if (!searchTerm.trim()) {
      return events
    }
    const searchTermLower = searchTerm.toLowerCase()
    return events.filter(
      (event) =>
        event.title.toLowerCase().includes(searchTermLower) ||
        event.description?.toLowerCase().includes(searchTermLower) ||
        (event.attendee && event.attendee.toLowerCase().includes(searchTermLower))
    )
  }

  const getUpcomingEvents = () => {
    const today = new Date()
    const filteredEvents = getFilteredEvents()

    return filteredEvents
      .filter((event) => {
        const eventDate = new Date(event.date + "T00:00:00")
        return eventDate >= today
      })
      .sort((a, b) => new Date(a.date + "T00:00:00") - new Date(b.date + "T00:00:00"))
      .slice(0, 10)
  }

  if (isLoading) {
    return (
      <div className="text-gray-500 text-sm flex items-center">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
        Loading events...
      </div>
    )
  }

  const upcomingEvents = getUpcomingEvents()

  if (upcomingEvents.length === 0) {
    return <div className="text-gray-500 text-sm">No upcoming events. Add an event to see it here.</div>
  }

  const groupedEvents = upcomingEvents.reduce((groups, event) => {
    const eventDate = new Date(event.date + "T00:00:00")
    const dateKey = eventDate.toDateString()
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(event)
    return groups
  }, {})

  return Object.entries(groupedEvents).map(([dateKey, dayEvents]) => (
    <div key={dateKey} className="mb-4">
      <h3 className="font-semibold text-sm mb-2">
        {new Date(dateKey).toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
        })}
      </h3>      {dayEvents.map((event) => (
        <div
          key={event.id}
          className="mb-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
          onClick={(e) => onEventClick(event, e)}
          onMouseEnter={(e) => onEventMouseEnter(event, e)}
          onMouseLeave={onEventMouseLeave}
        >
          <div className="flex items-start">
            <div className="w-2 h-2 rounded-full inline-block mr-2 mt-1" style={{ backgroundColor: event.color }}></div>
            <div className="flex-1">
              <div className="text-xs text-gray-600 mb-1">
                {formatEventTimeRange(event)}
              </div>
              <div className="text-sm font-medium">{event.title}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  ))
}
