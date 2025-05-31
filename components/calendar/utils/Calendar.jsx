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
  getUpcomingEvents,
  getEventPosition,
  getEventTextColor,
  getDarkerShade
} from "./utils/calendarUtils"

export default function Calendar({ user, onLogout }) {
  const [currentView, setCurrentView] = useState("week")
  const [currentDate, setCurrentDate] = useState(new Date(2025, 5, 1)) // June 1, 2025
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

      if (error) throw error

      console.log("Raw events from DB:", events)
      const transformedEvents = transformEventsFromDB(events)
      console.log("Transformed events:", transformedEvents)
      setEvents(transformedEvents)
    } catch (error) {
      console.error("Error loading events:", error)
    } finally {
      setIsLoadingEvents(false)
    }
  }

  const handleDateClick = (day) => {
    // Create a new date for June 2025 with the selected day
    const newDate = new Date(2025, 5, day) // Month is 0-indexed, so 5 = June
    setCurrentDate(newDate)
    
    // Format date as YYYY-MM-DD for the form
    const formattedDate = `2025-06-${day.toString().padStart(2, "0")}`
    setSelectedDateForNewEvent(formattedDate)
    
    // Only switch to day view if coming from month view
    // Week view and day view should preserve their current view
    if (currentView === "month") {
      setCurrentView("day")
    }
    
    // Close sidebar on mobile after date selection
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }

  const handleEventClick = (event, e) => {
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

  const openEditModal = (event) => {
    setSelectedEvent(event)
    setShowEditModal(true)
    setPreviewEvent(null) // Close preview when opening edit modal
  }

  return (
    <div className="flex h-screen bg-white font-sans" style={{ minWidth: '800px' }}>
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <CalendarSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleDateClick={handleDateClick}
        events={events}
        isLoadingEvents={isLoadingEvents}
        handleEventClick={handleEventClick}
        handleEventMouseEnter={handleEventMouseEnter}
        handleEventMouseLeave={handleEventMouseLeave}
        currentDate={currentDate}
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
              events={getFilteredEvents(events, searchTerm)}
              searchTerm={searchTerm}
              getEventPosition={getEventPosition}
              handleEventClick={handleEventClick}
              handleEventMouseEnter={handleEventMouseEnter}
              handleEventMouseLeave={handleEventMouseLeave}
              getEventTextColor={getEventTextColor}
              getDarkerShade={getDarkerShade}
              handleDateClick={handleDateClick}
            />
          )}
          {currentView === "day" && (
            <DayView
              currentDate={currentDate}
              events={getFilteredEvents(events, searchTerm)}
              searchTerm={searchTerm}
              getEventPosition={getEventPosition}
              handleEventClick={handleEventClick}
              handleEventMouseEnter={handleEventMouseEnter}
              handleEventMouseLeave={handleEventMouseLeave}
              getEventTextColor={getEventTextColor}
              getDarkerShade={getDarkerShade}
            />
          )}
          {currentView === "month" && (
            <MonthView
              currentDate={currentDate}
              events={getFilteredEvents(events, searchTerm)}
              searchTerm={searchTerm}
              handleDateClick={handleDateClick}
              handleEventClick={handleEventClick}
              handleEventMouseEnter={handleEventMouseEnter}
              handleEventMouseLeave={handleEventMouseLeave}
              getEventTextColor={getEventTextColor}
              getDarkerShade={getDarkerShade}
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
