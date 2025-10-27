'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface AddTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (task: {
    title: string
    description: string
    category: 'Work' | 'Study' | 'Personal'
    difficulty: 1 | 2 | 3
  }) => void
}

export default function AddTaskModal({ isOpen, onClose, onAdd }: AddTaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<'Work' | 'Study' | 'Personal'>('Work')
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(1)
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium')
  const [dueDate, setDueDate] = useState('')
  const [estimatedMinutes, setEstimatedMinutes] = useState(30)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    try {
      await onAdd({
        title: title.trim(),
        description: description.trim(),
        category,
        difficulty,
      })
      
      // Reset form
      setTitle('')
      setDescription('')
      setCategory('Work')
      setDifficulty(1)
      setPriority('Medium')
      setDueDate('')
      onClose()
    } catch (error) {
      console.error('Error adding task:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-dark-charcoal">Add New Task</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-charcoal mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Enter task title..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-charcoal mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Add a description (optional)..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-charcoal mb-2">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Work', 'Study', 'Personal'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                        category === cat
                          ? 'bg-accent text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-charcoal mb-2">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {([1, 2, 3] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setDifficulty(level)}
                      className={`py-3 px-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center ${
                        difficulty === level
                          ? 'bg-accent text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{level === 1 ? 'Easy' : level === 2 ? 'Medium' : 'Hard'}</span>
                        <div className="flex space-x-0.5 ml-1">
                          {[1, 2, 3].map((dot) => (
                            <div
                              key={dot}
                              className={`w-1.5 h-1.5 rounded-full ${
                                dot <= level
                                  ? difficulty === level
                                    ? 'bg-white'
                                    : 'bg-accent'
                                  : 'bg-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-charcoal mb-2">
                  Priority
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Low', 'Medium', 'High', 'Urgent'] as const).map((prio) => (
                    <button
                      key={prio}
                      type="button"
                      onClick={() => setPriority(prio)}
                      className={`py-2 px-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center ${
                        priority === prio
                          ? 'bg-accent text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {prio === 'Low' && '⬇️'} 
                      {prio === 'Medium' && '➡️'} 
                      {prio === 'High' && '⬆️'} 
                      {prio === 'Urgent' && '🚨'} 
                      {prio}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-charcoal mb-2">
                  Due Date (Optional)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!title.trim() || loading}
                  className="flex-1"
                >
                  {loading ? 'Adding...' : 'Add Task'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}