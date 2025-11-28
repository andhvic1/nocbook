'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Task, Subtask } from '@/types'
import {
    Trash2,
    MoreVertical,
    Eye,
    Edit,
    Calendar,
    Clock,
    AlertCircle,
    CheckCircle2,
    Circle,
    Flame,
    Tag,
    Repeat,
    Link2,
    Play,
    Pause
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface TaskCardProps {
    task: Task
    subtasks?: Subtask[]
    onDelete: () => void
    onStatusChange?: (status: Task['status']) => void
}

const categoryConfig: Record<Task['category'], { color: string; bgColor: string; label: string }> = {
    school: {
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-500/10',
        label: 'School'
    },
    content: {
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-500/10',
        label: 'Content'
    },
    project: {
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-500/10',
        label: 'Project'
    },
    personal: {
        color: 'text-pink-600 dark:text-pink-400',
        bgColor: 'bg-pink-500/10',
        label: 'Personal'
    },
    learning: {
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-500/10',
        label: 'Learning'
    },
    work: {
        color: 'text-indigo-600 dark:text-indigo-400',
        bgColor: 'bg-indigo-500/10',
        label: 'Work'
    },
    health: {
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-500/10',
        label: 'Health'
    },
    other: {
        color: 'text-gray-600 dark:text-gray-400',
        bgColor: 'bg-gray-500/10',
        label: 'Other'
    },
}

const priorityConfig: Record<Task['priority'], { color: string; icon: any; label: string }> = {
    low: {
        color: 'text-gray-600 dark:text-gray-400',
        icon: Circle,
        label: 'Low'
    },
    medium: {
        color: 'text-yellow-600 dark:text-yellow-400',
        icon: AlertCircle,
        label: 'Medium'
    },
    high: {
        color: 'text-orange-600 dark:text-orange-400',
        icon: Flame,
        label: 'High'
    },
    urgent: {
        color: 'text-red-600 dark:text-red-400',
        icon: Flame,
        label: 'Urgent'
    },
}

const statusConfig: Record<Task['status'], { color: string; label: string }> = {
    'not-started': {
        color: 'text-gray-600 dark:text-gray-400',
        label: 'Not Started'
    },
    'in-progress': {
        color: 'text-blue-600 dark:text-blue-400',
        label: 'In Progress'
    },
    'done': {
        color: 'text-green-600 dark:text-green-400',
        label: 'Done'
    },
    'blocked': {
        color: 'text-red-600 dark:text-red-400',
        label: 'Blocked'
    },
    'cancelled': {
        color: 'text-gray-600 dark:text-gray-400',
        label: 'Cancelled'
    },
}

export function TaskCard({ task, subtasks = [], onDelete, onStatusChange }: TaskCardProps) {
    const [showMenu, setShowMenu] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const categoryColor = categoryConfig[task.category]?.color || 'text-gray-600'
    const categoryBgColor = categoryConfig[task.category]?.bgColor || 'bg-gray-500/10'
    const categoryLabel = categoryConfig[task.category]?.label || task.category

    const PriorityIcon = priorityConfig[task.priority]?.icon || Circle
    const priorityColor = priorityConfig[task.priority]?.color || 'text-gray-600'
    const priorityLabel = priorityConfig[task.priority]?.label || task.priority

    const statusColor = statusConfig[task.status]?.color || 'text-gray-600'
    const statusLabel = statusConfig[task.status]?.label || task.status

    const handleDelete = async () => {
        setDeleting(true)
        try {
            const response = await fetch(`/tasks/${task.id}`, {
                method: 'DELETE',
            })

            if (!response.ok) throw new Error('Failed to delete')
            onDelete()
        } catch (error) {
            alert('Failed to delete task')
        } finally {
            setDeleting(false)
            setShowDeleteConfirm(false)
        }
    }

    const formatDate = (dateString?: string) => {
        if (! dateString) return null
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const formatTime = (timeString?: string) => {
        if (!timeString) return null
        const [hours, minutes] = timeString.split(':')
        const hour = parseInt(hours)
        const ampm = hour >= 12 ?  'PM' : 'AM'
        const displayHour = hour % 12 || 12
        return `${displayHour}:${minutes} ${ampm}`
    }

    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done'
    const completedSubtasks = subtasks.filter(s => s.is_completed). length

    return (
        <div className={`bg-cardBg dark:bg-cardBg-dark border-2 rounded-xl p-4 
      hover:border-primary dark:hover:border-primary-dark transition-all duration-200 group relative ${
            task.status === 'done' ? 'opacity-60' : ''
        } ${
            isOverdue ? 'border-red-500/50 dark:border-red-400/50' : 'border-border dark:border-border-dark'
        }`}>

            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                    <Link href={`/tasks/${task. id}`}>
                        <div className="flex items-start gap-2 mb-2">
                            {/* Status Checkbox */}
                            <button
                                onClick={(e) => {
                                    e.preventDefault()
                                    const newStatus = task.status === 'done' ? 'not-started' : 'done'
                                    onStatusChange?.(newStatus)
                                }}
                                className="mt-0.5 flex-shrink-0"
                            >
                                {task. status === 'done' ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                                ) : (
                                    <Circle className="w-5 h-5 text-text-secondary dark:text-text-darkSecondary hover:text-primary dark:hover:text-primary-dark transition-colors" />
                                )}
                            </button>

                            <h3 className={`text-base font-semibold text-text dark:text-text-dark hover:text-primary 
                dark:hover:text-primary-dark transition-colors line-clamp-2 cursor-pointer ${
                                task.status === 'done' ? 'line-through' : ''
                            }`}>
                                {task.title}
                            </h3>
                        </div>
                    </Link>

                    <div className="flex flex-wrap gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${categoryBgColor} ${categoryColor}`}>
              {categoryLabel}
            </span>

                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium flex items-center gap-1 ${priorityColor} bg-current/10`}>
              <PriorityIcon className="w-3 h-3" />
                            {priorityLabel}
            </span>

                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${statusColor} bg-current/10`}>
              {statusLabel}
            </span>

                        {task.is_recurring && (
                            <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center gap-1">
                <Repeat className="w-3 h-3" />
                                {task.recurrence_pattern}
              </span>
                        )}

                        {isOverdue && (
                            <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400">
                Overdue
              </span>
                        )}
                    </div>
                </div>

                {/* Menu Button */}
                <div className="relative ml-3">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 text-text-secondary dark:text-text-darkSecondary hover:text-text dark:hover:text-text-dark
              hover:bg-background dark:hover:bg-background-dark rounded-lg transition-colors"
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>

                    {/* Dropdown Menu */}
                    {showMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowMenu(false)}
                            />
                            <div className="absolute right-0 top-full mt-2 w-48 bg-cardBg dark:bg-cardBg-dark
                border-2 border-border dark:border-border-dark rounded-xl shadow-lg z-20 overflow-hidden">
                                <Link
                                    href={`/tasks/${task.id}`}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-background dark:hover:bg-background-dark
                    text-text dark:text-text-dark transition-colors text-sm"
                                    onClick={() => setShowMenu(false)}
                                >
                                    <Eye className="w-4 h-4" />
                                    <span>View Details</span>
                                </Link>
                                <Link
                                    href={`/tasks/${task.id}?edit=true`}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-background dark:hover:bg-background-dark
                    text-text dark:text-text-dark transition-colors text-sm"
                                    onClick={() => setShowMenu(false)}
                                >
                                    <Edit className="w-4 h-4" />
                                    <span>Edit Task</span>
                                </Link>
                                <div className="border-t border-border dark:border-border-dark" />
                                <button
                                    onClick={() => {
                                        setShowMenu(false)
                                        setShowDeleteConfirm(true)
                                    }}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-950
                    text-red-600 dark:text-red-400 transition-colors w-full text-sm"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Delete Task</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Description */}
            {task.description && (
                <p className="text-sm text-text-secondary dark:text-text-darkSecondary line-clamp-2 mb-3">
                    {task.description}
                </p>
            )}

            {/* Progress Bar */}
            <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-text-secondary dark:text-text-darkSecondary mb-1">
                    <span>Progress</span>
                    <span className="font-medium">{task.progress}%</span>
                </div>
                <div className="w-full h-2 bg-background dark:bg-background-dark rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary dark:bg-primary-dark transition-all duration-300 rounded-full"
                        style={{ width: `${task.progress}%` }}
                    />
                </div>
            </div>

            {/* Subtasks */}
            {subtasks.length > 0 && (
                <div className="mb-3 p-2 bg-background dark:bg-background-dark rounded-lg">
                    <div className="flex items-center gap-2 text-xs text-text-secondary dark:text-text-darkSecondary">
                        <CheckCircle2 className="w-3. 5 h-3.5" />
                        <span>{completedSubtasks} / {subtasks.length} subtasks completed</span>
                    </div>
                </div>
            )}

            {/* Footer Info */}
            <div className="flex items-center justify-between text-xs text-text-secondary dark:text-text-darkSecondary pt-3 border-t border-border dark:border-border-dark">
                <div className="flex items-center gap-3">
                    {/* Due Date */}
                    {task.due_date && (
                        <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : ''}`}>
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{formatDate(task.due_date)}</span>
                            {task.due_time && (
                                <span className="flex items-center gap-0.5">
                  <Clock className="w-3 h-3 ml-1" />
                                    {formatTime(task.due_time)}
                </span>
                            )}
                        </div>
                    )}

                    {/* Time Estimate */}
                    {task. estimated_time && task.estimated_time > 0 && (
                        <div className="flex items-center gap-1">
                            <Clock className="w-3. 5 h-3.5" />
                            <span>{Math.floor(task.estimated_time / 60)}h {task.estimated_time % 60}m</span>
                        </div>
                    )}

                    {/* Linked Items */}
                    {(task.skill_id || task.project_id || task.event_id) && (
                        <div className="flex items-center gap-1">
                            <Link2 className="w-3.5 h-3.5" />
                            <span>Linked</span>
                        </div>
                    )}
                </div>

                {/* Tags Preview */}
                {task.tags && task.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" />
                        <span>{task.tags.length}</span>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark
            rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-2">
                            Delete Task?
                        </h3>
                        <p className="text-text-secondary dark:text-text-darkSecondary mb-6">
                            Are you sure you want to delete "{task.title}"? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={deleting}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleDelete}
                                loading={deleting}
                                disabled={deleting}
                                className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}