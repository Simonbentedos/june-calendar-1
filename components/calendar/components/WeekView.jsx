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

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default function WeekView({ 
  currentDate, 
  events, 
  searchTerm, 
  getEventPosition,
  handleEventClick,
  handleEventMouseEnter,
  handleEventMouseLeave,
  getEventTextColor,
  getDarkerShade,
  handleDateClick
}) {
  console.log("WeekView - events received:", events)
  console.log("WeekView - currentDate:", currentDate)
  
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

  const startOfWeek = new Date(currentDate)
  const day = currentDate.getDay()
  startOfWeek.setDate(currentDate.getDate() - day)

  return (
    <div className="flex-1 overflow-auto max-h-full">
      <div className="min-w-[600px] sm:min-w-[800px]">
        <div className="grid grid-cols-8 border-l border-gray-300 sticky top-0 bg-white z-20">
          <div className="border-r border-gray-300 h-12 sm:h-16"></div>          {daysOfWeek.map((day, index) => {
            const dayDate = new Date(startOfWeek)
            dayDate.setDate(startOfWeek.getDate() + index)
            return (
              <div 
                key={`day-header-${index}`} 
                className="p-2 sm:p-4 text-center font-medium text-sm border-r border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleDateClick && handleDateClick(dayDate.getDate())}
              >
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.slice(0, 3)}</span>
                <div className="text-lg font-bold mt-1">{dayDate.getDate().toString().padStart(2, "0")}</div>
              </div>
            )
          })}
        </div>        <div className="relative grid grid-cols-8 border-l border-gray-300" style={{ height: `${timeSlots.length * 64}px` }}>
          <div className="border-r border-gray-300">
            {timeSlots.map((time, index) => (
              <div key={`time-slot-${index}`} className={`border-b border-gray-300 h-16 text-xs text-gray-500 p-1 sm:p-2 text-right flex items-center justify-end ${index === 0 ? 'border-t border-gray-300' : ''}`}>
                <div>
                  <span className="hidden sm:inline">{time}</span>                  <span className="sm:hidden">
                    {time.split(":")[0]}
                    {time.includes("AM") ? "am" : "pm"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {daysOfWeek.map((day, dayIndex) => {
            const dayDate = new Date(startOfWeek)
            dayDate.setDate(startOfWeek.getDate() + dayIndex)
            const dayEvents = getEventsForDay(dayDate.getDate())

            return (
              <div key={`day-${dayIndex}`} className="border-r border-gray-300 relative min-w-[70px] sm:min-w-[100px]">
                {timeSlots.map((time, timeIndex) => {
                  const timeHour = timeIndex

                  return (
                    <div key={`day-${dayIndex}-time-${timeIndex}`} className={`border-b border-gray-300 h-16 relative ${timeIndex === 0 ? 'border-t border-gray-300' : ''}`}>
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
                            onMouseEnter={(e) => handleEventMouseEnter(event, e)}                            onMouseLeave={handleEventMouseLeave}
                            className="absolute rounded-md p-2 cursor-pointer hover:shadow-lg z-10 transform transition-all duration-200 hover:-translate-y-1 hover:scale-105"
                            style={{
                              top: `${topOffset}px`,
                              height: `${Math.max(40, height)}px`,
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
                              <span className="hidden sm:inline">
                                {formatEventTimeRange(event)}
                              </span>
                              <span className="sm:hidden">{event.startTime.split(" ")[0]}</span>
                            </div>
                            <div 
                              className="font-semibold text-sm truncate mt-0.5"
                              style={{ color: getEventTextColor(event.color) }}
                            >{event.title}</div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
