"use client"

import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar"
import { LogOut } from "lucide-react"
import { useState, useRef, useEffect } from "react"

export default function LogoutDropdown({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isClicked, setIsClicked] = useState(false)
  const [position, setPosition] = useState({ top: 0, right: 0 })
  const buttonRef = useRef(null)
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      })
    }
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isClicked && buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false)
        setIsClicked(false)
      }
    }

    if (isClicked) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isClicked])

  const handleMouseEnter = () => {
    if (!isClicked) {
      setIsOpen(true)
    }
  }

  const handleMouseLeave = () => {
    if (!isClicked) {
      setIsOpen(false)
    }
  }

  const handleClick = (e) => {
    e.stopPropagation()
    setIsClicked(true)
    setIsOpen(true)
  }

  return (
    <>      <div 
        className="relative flex-shrink-0"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        ref={buttonRef}
      >        <Avatar className="h-6 w-6 md:h-8 md:w-8 cursor-pointer">
          <AvatarImage src="https://cdn-icons-png.flaticon.com/512/3736/3736502.png" alt="User profile" />
          <AvatarFallback>{user?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
        </Avatar>
      </div>
      
      {isOpen && (        <div 
          className="fixed w-48 bg-white rounded-md shadow-lg border border-gray-200 transition-all duration-200 z-[9999]"
          style={{ 
            top: `${position.top}px`, 
            right: `${position.right}px` 
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="p-3 border-b border-gray-100">
            <p className="font-medium text-sm">{user?.username}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>          <button
            onClick={onLogout}
            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </button>
        </div>
      )}
    </>
  )
}
