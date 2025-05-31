"use client"

import { formatEventTimeRange } from "../../../lib/date-utils"
import { timeToMinutes } from "../../../lib/date-utils"

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default function MonthView({ 
  events, 
  searchTerm,
  handleDateClick,
  handleEventClick,
  handleEventMouseEnter,
  handleEventMouseLeave,
  getEventTextColor,
  getDarkerShade
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

  const getEventsForDay = (day, month = 5, year = 2025) => {
    const filteredEvents = getFilteredEvents()
    const dayEvents = []
    
    filteredEvents.forEach((event) => {
      const eventDate = new Date(event.date + "T00:00:00")
      const eventDay = eventDate.getDate()
      const eventMonth = eventDate.getMonth()
      const eventYear = eventDate.getFullYear()
      
      const startMinutes = timeToMinutes(event.startTime)
      const endMinutes = timeToMinutes(event.endTime)
      const isOvernightEvent = endMinutes < startMinutes
      
      // Check if event starts on this day
      if (eventDay === day && eventMonth === month && eventYear === year) {
        if (isOvernightEvent) {
          // For overnight events starting on this day, show from start time to midnight
          dayEvents.push({
            ...event,
            endTime: "11:59 PM",
            isOvernightPart: "start",
            originalStartTime: event.startTime,
            originalEndTime: event.endTime
          })
        } else {
          // Regular event
          dayEvents.push(event)
        }
      }
      
      // Check if this is an overnight event that continues from the previous day
      if (isOvernightEvent) {
        const nextDay = new Date(eventDate)
        nextDay.setDate(nextDay.getDate() + 1)
        
        if (nextDay.getDate() === day && nextDay.getMonth() === month && nextDay.getFullYear() === year) {
          // For overnight events continuing on this day, show from midnight to end time
          dayEvents.push({
            ...event,
            id: `${event.id}_overnight`,
            startTime: "12:00 AM",
            isOvernightPart: "end",
            originalStartTime: event.startTime,
            originalEndTime: event.endTime
          })
        }
      }
    })
    
    return dayEvents
  }

  const renderWeeks = () => {
    const daysInMonth = 30
    const weeks = []
    let currentWeek = []

    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDay(day)

      currentWeek.push(
        <div
          key={day}
          className="h-24 sm:h-32 border-r border-gray-200 p-1 cursor-pointer hover:bg-gray-50 overflow-hidden"
          onClick={() => handleDateClick(day)}
        >
          <div className="text-sm font-medium mb-1">{day.toString().padStart(2, "0")}</div>
          <div className="space-y-1">
            {dayEvents.slice(0, window.innerWidth < 640 ? 2 : 3).map((event) => (
              <div
                key={event.id}
                onClick={(e) => {
                  e.stopPropagation()
                  handleEventClick(event, e)
                }}
                onMouseEnter={(e) => {
                  e.stopPropagation()
                  handleEventMouseEnter(event, e)
                }}
                onMouseLeave={(e) => {
                  e.stopPropagation()
                  handleEventMouseLeave()
                }}                className="text-xs p-2 rounded-md truncate cursor-pointer hover:shadow-lg transform transition-all duration-200 hover:-translate-y-1 hover:scale-105"
                style={{ 
                  backgroundColor: event.color,
                  borderLeft: `3px solid ${getDarkerShade(event.color)}`,
                }}
              >
                <div 
                  className="font-medium text-xs"
                  style={{ color: getEventTextColor(event.color) }}
                >
                  <span className="hidden sm:inline">{formatEventTimeRange(event)}</span>
                  <span className="sm:hidden">{event.startTime.split(" ")[0]}</span>
                </div>
                <div 
                  className="font-semibold text-sm truncate mt-0.5"
                  style={{ color: getEventTextColor(event.color) }}
                >{event.title}</div>
              </div>
            ))}
            {dayEvents.length > (window.innerWidth < 640 ? 2 : 3) && (
              <div className="text-xs text-gray-500 p-1">
                +{dayEvents.length - (window.innerWidth < 640 ? 2 : 3)} more
              </div>
            )}
          </div>
        </div>,
      )

      if (currentWeek.length === 7 || day === daysInMonth) {
        weeks.push(
          <div key={`week-${weeks.length}`} className="grid grid-cols-7 border-b border-gray-200">
            {currentWeek}
          </div>,
        )
        currentWeek = []
      }
    }

    return weeks
  }

  const weeks = renderWeeks()

  return (
    <div className="flex-1 overflow-auto max-h-full">
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
        {daysOfWeek.map((day, index) => (
          <div key={`month-header-${index}`} className="p-2 sm:p-4 text-center font-medium text-sm border-r border-gray-200">
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.slice(0, 3)}</span>
          </div>
        ))}
      </div>
      <div>{weeks}</div>
    </div>
  )
}
