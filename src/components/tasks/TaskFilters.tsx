'use client'

import { useState } from 'react'
import { Filter, SortAsc, Search, X } from 'lucide-react'

interface TaskFiltersProps {
  onFilterChange: (filters: {
    category: string
    priority: string
    status: string
    sortBy: string
    searchQuery: string
  }) => void
  taskCounts: {
    total: number
    completed: number
    pending: number
  }
}

export default function TaskFilters({ onFilterChange, taskCounts }: TaskFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    category: 'All',
    priority: 'All',
    status: 'All',
    sortBy: 'created_at',
    searchQuery: ''
  })

  const updateFilter = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const defaultFilters = {
      category: 'All',
      priority: 'All',
      status: 'All',
      sortBy: 'created_at',
      searchQuery: ''
    }
    setFilters(defaultFilters)
    onFilterChange(defaultFilters)
  }

  const hasActiveFilters = filters.category !== 'All' || filters.priority !== 'All' || 
                          filters.status !== 'All' || filters.searchQuery !== ''

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={filters.searchQuery}
          onChange={(e) => updateFilter('searchQuery', e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5C946E] focus:border-transparent"
        />
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors ${
              showFilters ? 'bg-[#5C946E] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span className="text-sm">Filters</span>
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-1 text-xs text-gray-500 hover:text-red-600 transition-colors"
            >
              <X className="h-3 w-3" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Task Counts */}
        <div className="flex items-center space-x-4 text-xs text-gray-600">
          <span>Total: {taskCounts.total}</span>
          <span>Pending: {taskCounts.pending}</span>
          <span>Done: {taskCounts.completed}</span>
        </div>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          {/* Category Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#5C946E]"
            >
              <option value="All">All Categories</option>
              <option value="Work">Work</option>
              <option value="Study">Study</option>
              <option value="Personal">Personal</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => updateFilter('priority', e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#5C946E]"
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">🚨 Urgent</option>
              <option value="High">⬆️ High</option>
              <option value="Medium">➡️ Medium</option>
              <option value="Low">⬇️ Low</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#5C946E]"
            >
              <option value="All">All Tasks</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#5C946E]"
            >
              <option value="created_at">Date Created</option>
              <option value="due_date">Due Date</option>
              <option value="priority">Priority</option>
              <option value="difficulty">Difficulty</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}