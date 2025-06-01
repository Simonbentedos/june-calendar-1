"use client"

import React from "react"
import { formatEventTimeRange } from "../../../lib/date-utils"
import { timeToMinutes } from "../../../lib/date-utils"

const timeSlots = [
  "12:00 AM", "01:00 AM", "02:00 AM", "03:00 AM", "04:00 AM", "05:00 AM",
  "06:00 AM", "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
  "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM", "11:00 PM",
]

export default function DayView({ 
  currentDate, 
  events, 
  searchTerm,
  getEventPosition,
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

  const dayEvents = getEventsForDay(currentDate.getDate())

  return (
    <div className="flex-1 overflow-auto max-h-full">
      <div className="relative" style={{ height: `${timeSlots.length * 64}px` }}>
        {timeSlots.map((time, index) => {
          const timeHour = index

          return (            <div key={`time-${index}`} className="border-b border-gray-200 h-16 relative flex">
              <div className="w-20 sm:w-24 text-xs text-gray-500 p-2 sm:p-3 text-right border-r border-gray-200 flex-shrink-0 flex items-center justify-end">
                <div>
                  <span className="hidden sm:inline">{time}</span>                  <span className="sm:hidden">
                    {time.split(":")[0]}
                    {time.includes("AM") ? "am" : "pm"}
                  </span>
                </div>
              </div>
              <div className="flex-1 relative">
                {dayEvents.map((event) => {
                  const { topOffset, height, startHour, width, leftOffset } = getEventPosition(
                    event.startTime,
                    event.endTime,
                    dayEvents,
                    event.id,
                  )

                  if (startHour !== timeHour) return null

                  return (
                    <div
                      key={event.id}
                      onClick={(e) => handleEventClick(event, e)}
                      onMouseEnter={(e) => handleEventMouseEnter(event, e)}                      onMouseLeave={(e) => handleEventMouseLeave}
                      className="absolute rounded-md p-2 cursor-pointer hover:shadow-lg z-10 transform transition-all duration-200 hover:-translate-y-1 hover:scale-105"
                      style={{
                        top: `${topOffset}px`,
                        height: `${Math.max(50, height)}px`,
                        width: width,
                        left: leftOffset,
                        backgroundColor: event.color,
                        borderLeft: `3px solid ${getDarkerShade(event.color)}`,
                      }}
                    >
                      <div 
                        className="font-medium text-xs leading-tight"
                        style={{ color: getEventTextColor(event.color) }}
                      >
                        {formatEventTimeRange(event)}
                      </div>
                      <div 
                        className="font-semibold text-sm truncate mt-1"
                        style={{ color: getEventTextColor(event.color) }}
                      >{event.title}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
