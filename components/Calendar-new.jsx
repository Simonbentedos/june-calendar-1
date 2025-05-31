// filepath: c:\Users\anton\Downloads\june-calendar\components\calendar\Calendar.jsx
"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"
import EventForm from "./EventForm"
import EventPreview from "./EventPreview"
import CalendarHeader from "./components/CalendarHeader"
import CalendarSidebar from "./components/CalendarSidebar"
import WeekView from "./components/WeekView"
import DayView from "./components/DayView"
import MonthView from "./components/MonthView"
import EventTooltip from "./components/EventTooltip"
import MobileSearchBar from "./components/MobileSearchBar"
import { 
  formatTime24h, 
  transformEventsFromDB,
  formatDateRange,
  getEventsForDay,
  getFilteredEvents,
  getUpcomingEvents
} from "./utils/calendarUtils"

export default function Calendar({ user, onLogout }) {
  const [currentView, setCurrentView] = useState("week")
  const [currentDate, setCurrentDate] = useState(new Date(2025, 5, 3))
  const [events, setEvents] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [previewEvent, setPreviewEvent] = useState(null)
  const [previewPosition, setPreviewPosition] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [isLoadingEvents, setIsLoadingEvents] = useState(true)
  const [tooltipEvent, setTooltipEvent] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState(null)
  const [selectedDateForNewEvent, setSelectedDateForNewEvent] = useState(null)

  // Load user's events from Supabase on component mount
  useEffect(() => {
    if (user) {
      loadEvents()
    }
  }, [user])

  const loadEvents = async () => {
    if (!user) return

    setIsLoadingEvents(true)
    try {
      const { data: events, error } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", user.id)
        .order("start_time", { ascending: true })

      if (error) {
        console.error("Error loading events:", error)
        return
      }

      // Transform events to match the frontend format
      const transformedEvents = transformEventsFromDB(events)
      setEvents(transformedEvents)
    } catch (error) {
      console.error("Error loading events:", error)
    } finally {
      setIsLoadingEvents(false)
    }
  }

  const handleDateClick = (day) => {
    const newDate = new Date(2025, 5, day)
    setCurrentDate(newDate)
    // Format date as YYYY-MM-DD for the form
    const formattedDate = `2025-06-${day.toString().padStart(2, "0")}`
    setSelectedDateForNewEvent(formattedDate)
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }

  const openEditModal = (event) => {
    // Close any open previews first
    setPreviewEvent(null)
    setTooltipEvent(null)

    const startTime24 = formatTime24h(event.startTime)
    const endTime24 = formatTime24h(event.endTime)

    setSelectedEvent({
      ...event,
      startTime: startTime24,
      endTime: endTime24,
    })
    setShowEditModal(true)
  }

  const handleEventClick = (event, e) => {
    e.stopPropagation()

    // Show preview instead of directly opening edit modal
    setPreviewEvent(event)
    setPreviewPosition({ x: e.clientX, y: e.clientY })

    // Hide any tooltip that might be showing
    setTooltipEvent(null)
  }

  const handleEventMouseEnter = (event, e) => {
    // Only show tooltip if we're not already showing a preview
    if (!previewEvent) {
      setTooltipEvent(event)
      setTooltipPosition({ x: e.clientX, y: e.clientY })
    }
  }

  const handleEventMouseLeave = () => {
    setTooltipEvent(null)
  }

  const handleAddEvent = () => {
    setShowAddModal(true)
    // If no specific date selected, use current date
    if (!selectedDateForNewEvent) {
      setSelectedDateForNewEvent(currentDate.toISOString().split("T")[0])
    }
  }

  return (
    <div className="flex h-screen bg-white font-sans" style={{ minWidth: '800px' }}>
      {/* Sidebar */}
      <CalendarSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        currentDate={currentDate}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        events={events}
        isLoadingEvents={isLoadingEvents}
        onDateClick={handleDateClick}
        onEventClick={handleEventClick}
        onEventMouseEnter={handleEventMouseEnter}
        onEventMouseLeave={handleEventMouseLeave}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0" style={{ minWidth: '600px' }}>
        {/* Header */}
        <CalendarHeader
          currentView={currentView}
          setCurrentView={setCurrentView}
          currentDate={currentDate}
          formatDateRange={() => formatDateRange(currentView, currentDate)}
          setSidebarOpen={setSidebarOpen}
          setShowMobileSearch={setShowMobileSearch}
          showMobileSearch={showMobileSearch}
          onAddEvent={handleAddEvent}
          user={user}
          onLogout={onLogout}
        />

        {/* Mobile Search Bar */}
        <MobileSearchBar
          showMobileSearch={showMobileSearch}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* Calendar Views */}
        <div className="flex-1 overflow-hidden font-sans">
          {currentView === "week" && (
            <WeekView
              currentDate={currentDate}
              events={() => getFilteredEvents(events, searchTerm)}
              getEventsForDay={(day) => getEventsForDay(events, day, 5, 2025, searchTerm)}
              onEventClick={handleEventClick}
              onEventMouseEnter={handleEventMouseEnter}
              onEventMouseLeave={handleEventMouseLeave}
            />
          )}
          {currentView === "day" && (
            <DayView
              currentDate={currentDate}
              getEventsForDay={() => getEventsForDay(events, currentDate.getDate(), 5, 2025, searchTerm)}
              onEventClick={handleEventClick}
              onEventMouseEnter={handleEventMouseEnter}
              onEventMouseLeave={handleEventMouseLeave}
            />
          )}
          {currentView === "month" && (
            <MonthView
              currentDate={currentDate}
              getEventsForDay={(day) => getEventsForDay(events, day, 5, 2025, searchTerm)}
              onDateClick={handleDateClick}
              onEventClick={handleEventClick}
              onEventMouseEnter={handleEventMouseEnter}
              onEventMouseLeave={handleEventMouseLeave}
            />
          )}
        </div>
      </div>

      {/* Event tooltip (quick preview on hover) */}
      {tooltipEvent && !previewEvent && (
        <EventTooltip event={tooltipEvent} position={tooltipPosition} />
      )}

      {/* Event preview (detailed preview on click) */}
      {previewEvent && (
        <EventPreview
          event={previewEvent}
          position={previewPosition}
          onClose={() => setPreviewEvent(null)}
          onEdit={openEditModal}
        />
      )}

      {/* Event Form Modals */}
      {showAddModal && (
        <EventForm
          user={user}
          onClose={() => {
            setShowAddModal(false)
            setSelectedDateForNewEvent(null)
          }}
          onEventSaved={loadEvents}
          selectedDate={selectedDateForNewEvent}
          existingEvents={events}
        />
      )}
      {showEditModal && (
        <EventForm
          user={user}
          event={selectedEvent}
          onClose={() => {
            setShowEditModal(false)
            setSelectedEvent(null)
          }}
          onEventSaved={loadEvents}
          isEdit={true}
          existingEvents={events}
        />
      )}
    </div>
  )
}
