"use client"

import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Search, X } from "lucide-react"
import KalendarLogo from "./KalendarLogo"
import MiniCalendar from "./MiniCalendar"
import UpcomingEvents from "./UpcomingEvents"

export default function CalendarSidebar({
  sidebarOpen,
  setSidebarOpen,
  searchTerm,
  setSearchTerm,
  handleDateClick,
  events,
  isLoadingEvents,
  handleEventClick,
  handleEventMouseEnter,
  handleEventMouseLeave,
  currentDate
}) {
  return (
    <div
      className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed md:relative z-50 w-64 h-full border-r border-gray-200 p-4 bg-white transition-transform duration-300 overflow-y-auto font-sans`}
    >
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <KalendarLogo />
          <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <MiniCalendar onDateClick={handleDateClick} events={events} currentDate={currentDate} />

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm"
              autoComplete="off"
            />
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Upcoming events</h3>
          <UpcomingEvents 
            events={events}
            isLoading={isLoadingEvents}
            searchTerm={searchTerm}
            onEventClick={handleEventClick}
            onEventMouseEnter={handleEventMouseEnter}
            onEventMouseLeave={handleEventMouseLeave}
          />
        </div>
      </div>
    </div>
  )
}
