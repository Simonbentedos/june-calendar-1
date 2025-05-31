"use client"

import { Button } from "@/components/ui/button"
import { Plus, Search, Menu } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar"
import LogoutDropdown from "./LogoutDropdown"

export default function CalendarHeader({ 
  user, 
  currentView, 
  setCurrentView, 
  formatDateRange, 
  onAddEvent, 
  onLogout,
  showMobileSearch,
  setShowMobileSearch,
  setSidebarOpen 
}) {  return (
    <div className="border-b border-gray-200 p-2 sm:p-4 flex items-center justify-between flex-shrink-0 font-sans min-w-0 overflow-x-auto relative z-30">
      <div className="flex items-center space-x-2 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden flex-shrink-0"
          onClick={() => setShowMobileSearch(!showMobileSearch)}
        >
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="md:hidden flex-shrink-0" onClick={() => setSidebarOpen(true)}>
          <Menu className="h-4 w-4" />
        </Button>
        <div className="flex items-center space-x-2 min-w-0">
          <h1 className="text-base sm:text-lg md:text-xl font-semibold truncate" style={{ minWidth: '120px' }}>
            {formatDateRange()}
          </h1>
        </div>
      </div>

      <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4 flex-shrink-0">
        <div className="flex bg-gray-100 rounded-md p-1 flex-shrink-0">
          <Button
            variant={currentView === "day" ? "default" : "ghost"}
            size="sm"
            onClick={() => setCurrentView("day")}
            className={`text-xs px-2 sm:px-4 py-1 w-12 sm:w-16 font-medium flex-shrink-0 ${currentView === "day" ? "bg-blue-500 text-white" : ""}`}
          >
            Day
          </Button>
          <Button
            variant={currentView === "week" ? "default" : "ghost"}
            size="sm"
            onClick={() => setCurrentView("week")}
            className={`text-xs px-2 sm:px-4 py-1 w-12 sm:w-16 font-medium flex-shrink-0 ${currentView === "week" ? "bg-blue-500 text-white" : ""}`}
          >
            Week
          </Button>
          <Button
            variant={currentView === "month" ? "default" : "ghost"}
            size="sm"
            onClick={() => setCurrentView("month")}
            className={`text-xs px-2 sm:px-4 py-1 w-12 sm:w-16 font-medium flex-shrink-0 ${currentView === "month" ? "bg-blue-500 text-white" : ""}`}
          >
            Month
          </Button>
        </div>

        <Button
          className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 flex-shrink-0"
          onClick={onAddEvent}
        >
          <Plus className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Add event</span>
          <span className="sm:hidden">Add</span>
        </Button>

        <LogoutDropdown user={user} onLogout={onLogout} />
      </div>
    </div>
  )
}
