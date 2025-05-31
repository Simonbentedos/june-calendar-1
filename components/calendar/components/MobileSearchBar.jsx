"use client"

import { Input } from "../../ui/input"
import { Search } from "lucide-react"

export default function MobileSearchBar({ searchTerm, setSearchTerm }) {
  return (
    <div className="md:hidden border-b border-gray-200 p-4">
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
  )
}
