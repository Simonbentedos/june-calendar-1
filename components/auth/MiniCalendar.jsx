"use client"

const daysOfWeekShort = ["S", "M", "T", "W", "T", "F", "S"]

export default function MiniCalendar({ onDateClick, events, currentDate }) {
  const daysInMonth = 30
  const firstDayOfMonth = new Date(2025, 5, 1).getDay()
  
  // Filter events for search
  const filteredEvents = events || []

  const renderMiniCalendar = () => {
    const days = []

    // Previous month days
    for (let i = 0; i < firstDayOfMonth; i++) {
      const prevMonthDays = new Date(2025, 5, 0).getDate()
      const day = prevMonthDays - (firstDayOfMonth - i - 1)
      days.push(
        <div key={`prev-${day}`} className="text-gray-300 text-sm p-1 text-center">
          {day}
        </div>
      )
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      // Check if this day is the currently selected date
      const isSelectedDate = currentDate && 
        currentDate.getFullYear() === 2025 && 
        currentDate.getMonth() === 5 && 
        currentDate.getDate() === day
      
      // Check if this day is today (actual current date)
      const today = new Date()
      const isToday = today.getFullYear() === 2025 && 
        today.getMonth() === 5 && 
        today.getDate() === day
      
      const hasEvents = filteredEvents.some((event) => {
        const eventDate = new Date(event.date + "T00:00:00")
        return eventDate.getDate() === day && eventDate.getMonth() === 5
      })

      days.push(
        <div
          key={day}
          onClick={() => onDateClick(day)}
          className={`text-sm p-1 text-center cursor-pointer hover:bg-gray-100 relative ${
            isSelectedDate ? "bg-blue-500 text-white rounded-full" : 
            isToday ? "bg-gray-200 text-gray-900 rounded-full" : ""
          }`}
        >
          {day}
          {hasEvents && !isSelectedDate && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
          )}
          {hasEvents && isSelectedDate && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
          )}
        </div>
      )
    }

    return days
  }

  return (
    <div className="mb-6">
      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeekShort.map((day, index) => (
          <div key={`day-header-${index}`} className="text-xs text-gray-500 text-center p-1">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">{renderMiniCalendar()}</div>
    </div>
  )
}
