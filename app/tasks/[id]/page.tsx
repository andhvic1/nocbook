'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase'
import { TaskForm } from '@/components/tasks/TaskForm'
import { Button } from '@/components/ui/Button'
import { Task, Subtask, Skill, Project, Event } from '@/types'
import {
    ArrowLeft,
    Edit,
    Trash2,
    Calendar,
    Clock,
    AlertCircle,
    CheckCircle2,
    Circle,
    Flame,
    Tag,
    Repeat,
    Link2,
    ExternalLink,
    FileText,
    TrendingUp
} from 'lucide-react'
import Link from 'next/link'

const categoryConfig: Record<Task['category'], { color: string; bgColor: string; label: string }> = {
    school: { color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-500/10', label: 'School' },
    content: { color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-500/10', label: 'Content' },
    project: { color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-500/10', label: 'Project' },
    personal: { color: 'text-pink-600 dark:text-pink-400', bgColor: 'bg-pink-500/10', label: 'Personal' },
    learning: { color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-500/10', label: 'Learning' },
    work: { color: 'text-indigo-600 dark:text-indigo-400', bgColor: 'bg-indigo-500/10', label: 'Work' },
    health: { color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-500/10', label: 'Health' },
    other: { color: 'text-gray-600 dark:text-gray-400', bgColor: 'bg-gray-500/10', label: 'Other' },
}

const priorityConfig: Record<Task['priority'], { color: string; icon: any; label: string }> = {
    low: { color: 'text-gray-600 dark:text-gray-400', icon: Circle, label: 'Low' },
    medium: { color: 'text-yellow-600 dark:text-yellow-400', icon: AlertCircle, label: 'Medium' },
    high: { color: 'text-orange-600 dark:text-orange-400', icon: Flame, label: 'High' },
    urgent: { color: 'text-red-600 dark:text-red-400', icon: Flame, label: 'Urgent' },
}

const statusConfig: Record<Task['status'], { color: string; bgColor: string; label: string }> = {
    'not-started': { color: 'text-gray-600 dark:text-gray-400', bgColor: 'bg-gray-500/10', label: 'Not Started' },
    'in-progress': { color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-500/10', label: 'In Progress' },
    'done': { color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-500/10', label: 'Done' },
    'blocked': { color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-500/10', label: 'Blocked' },
    'cancelled': { color: 'text-gray-600 dark:text-gray-400', bgColor: 'bg-gray-500/10', label: 'Cancelled' },
}

export default function TaskDetailPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const params = useParams()
    const taskId = params.id as string

    const [task, setTask] = useState<Task | null>(null)
    const [subtasks, setSubtasks] = useState<Subtask[]>([])
    const [skill, setSkill] = useState<Skill | null>(null)
    const [project, setProject] = useState<Project | null>(null)
    const [event, setEvent] = useState<Event | null>(null)

    const [skills, setSkills] = useState<Skill[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    const [events, setEvents] = useState<Event[]>([])

    const [loading, setLoading] = useState(true)
    const [editMode, setEditMode] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        if (!authLoading && !user) {
            router. push('/login')
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (user && taskId) {
            fetchTask()
            fetchRelatedData()
        }
    }, [user, taskId])

    // Check URL for edit parameter on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location. search)
            if (urlParams.get('edit') === 'true') {
                setEditMode(true)
            }
        }
    }, [])

    const fetchTask = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                . eq('id', taskId)
                .single()

            if (error) throw error
            setTask(data)

            // Fetch subtasks
            const { data: subtasksData, error: subtasksError } = await supabase
                .from('subtasks')
                .select('*')
                .eq('task_id', taskId)
                .order('order_index', { ascending: true })

            if (subtasksError) throw subtasksError
            setSubtasks(subtasksData || [])

            // Fetch related skill
            if (data.skill_id) {
                const { data: skillData } = await supabase
                    . from('skills')
                    .select('*')
                    .eq('id', data.skill_id)
                    .single()
                setSkill(skillData)
            }

            // Fetch related project
            if (data. project_id) {
                const { data: projectData } = await supabase
                    .from('projects')
                    .select('*')
                    .eq('id', data.project_id)
                    .single()
                setProject(projectData)
            }

            // Fetch related event
            if (data.event_id) {
                const { data: eventData } = await supabase
                    .from('events')
                    . select('*')
                    .eq('id', data.event_id)
                    .single()
                setEvent(eventData)
            }
        } catch (error) {
            console.error('Error fetching task:', error)
            router.push('/tasks')
        } finally {
            setLoading(false)
        }
    }

    const fetchRelatedData = async () => {
        try {
            const { data: skillsData } = await supabase
                .from('skills')
                .select('*')
                .order('name', { ascending: true })

            const { data: projectsData } = await supabase
                . from('projects')
                .select('*')
                .order('title', { ascending: true })

            const { data: eventsData } = await supabase
                .from('events')
                . select('*')
                .order('name', { ascending: true })

            setSkills(skillsData || [])
            setProjects(projectsData || [])
            setEvents(eventsData || [])
        } catch (error) {
            console.error('Error fetching related data:', error)
        }
    }

    const handleDelete = async () => {
        setDeleting(true)
        try {
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', taskId)

            if (error) throw error
            router.push('/tasks')
        } catch (error) {
            console.error('Error deleting task:', error)
            alert('Failed to delete task')
        } finally {
            setDeleting(false)
            setShowDeleteConfirm(false)
        }
    }

    const formatDate = (dateString?: string) => {
        if (! dateString) return null
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
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

    const formatDuration = (minutes?: number) => {
        if (! minutes) return null
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        if (hours > 0 && mins > 0) return `${hours}h ${mins}m`
        if (hours > 0) return `${hours}h`
        return `${mins}m`
    }

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-primary-dark mx-auto mb-4"></div>
                    <p className="text-text-secondary dark:text-text-darkSecondary">Loading task...</p>
                </div>
            </div>
        )
    }

    if (!user || !task) return null

    const categoryColor = categoryConfig[task.category]?.color || 'text-gray-600'
    const categoryBgColor = categoryConfig[task.category]?.bgColor || 'bg-gray-500/10'
    const categoryLabel = categoryConfig[task.category]?.label || task.category

    const PriorityIcon = priorityConfig[task.priority]?.icon || Circle
    const priorityColor = priorityConfig[task.priority]?.color || 'text-gray-600'
    const priorityLabel = priorityConfig[task.priority]?.label || task.priority

    const statusColor = statusConfig[task.status]?.color || 'text-gray-600'
    const statusBgColor = statusConfig[task.status]?.bgColor || 'bg-gray-500/10'
    const statusLabel = statusConfig[task.status]?.label || task.status

    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done'
    const completedSubtasks = subtasks.filter(s => s.is_completed).length

    if (editMode) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setEditMode(false)}
                            className="p-2 hover:bg-cardBg dark:hover:bg-cardBg-dark rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-text dark:text-text-dark" />
                        </button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-text dark:text-text-dark">
                                Edit Task
                            </h1>
                            <p className="text-text-secondary dark:text-text-darkSecondary text-sm mt-1">
                                Update your task details
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6 md:p-8">
                    <TaskForm
                        task={task}
                        existingSubtasks={subtasks}
                        skills={skills}
                        projects={projects}
                        events={events}
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                    <Link
                        href="/tasks"
                        className="p-2 hover:bg-cardBg dark:hover:bg-cardBg-dark rounded-lg transition-colors flex-shrink-0"
                    >
                        <ArrowLeft className="w-5 h-5 text-text dark:text-text-dark" />
                    </Link>
                    <div className="flex-1 min-w-0">
                        <h1 className={`text-2xl md:text-3xl font-bold text-text dark:text-text-dark mb-3 ${
                            task.status === 'done' ? 'line-through opacity-60' : ''
                        }`}>
                            {task.title}
                        </h1>
                        <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-lg text-sm font-medium ${categoryBgColor} ${categoryColor}`}>
                {categoryLabel}
              </span>
                            <span className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1 ${priorityColor} bg-current/10`}>
                <PriorityIcon className="w-4 h-4" />
                                {priorityLabel}
              </span>
                            <span className={`px-3 py-1 rounded-lg text-sm font-medium ${statusBgColor} ${statusColor}`}>
                {statusLabel}
              </span>
                            {task.is_recurring && (
                                <span className="px-3 py-1 rounded-lg text-sm font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center gap-1">
                  <Repeat className="w-4 h-4" />
                                    {task.recurrence_pattern}
                </span>
                            )}
                            {isOverdue && (
                                <span className="px-3 py-1 rounded-lg text-sm font-medium bg-red-500/10 text-red-600 dark:text-red-400">
                  Overdue
                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditMode(true)}
                        className="flex items-center gap-2"
                    >
                        <Edit className="w-4 h-4" />
                        <span className="hidden sm:inline">Edit</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Delete</span>
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    {task.description && (
                        <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-3">
                                Description
                            </h2>
                            <p className="text-text-secondary dark:text-text-darkSecondary whitespace-pre-wrap">
                                {task.description}
                            </p>
                        </div>
                    )}

                    {/* Progress */}
                    <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-semibold text-text dark:text-text-dark flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                Progress
                            </h2>
                            <span className="text-2xl font-bold text-primary dark:text-primary-dark">
                {task.progress}%
              </span>
                        </div>
                        <div className="w-full h-4 bg-background dark:bg-background-dark rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary dark:bg-primary-dark transition-all duration-300 rounded-full"
                                style={{ width: `${task.progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Subtasks */}
                    {subtasks.length > 0 && (
                        <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-4 flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5" />
                                Subtasks ({completedSubtasks} / {subtasks.length})
                            </h2>
                            <div className="space-y-2">
                                {subtasks.map(subtask => (
                                    <div
                                        key={subtask.id}
                                        className="flex items-center gap-3 p-3 bg-background dark:bg-background-dark rounded-lg"
                                    >
                                        {subtask.is_completed ?  (
                                            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                                        ) : (
                                            <Circle className="w-5 h-5 text-text-secondary dark:text-text-darkSecondary flex-shrink-0" />
                                        )}
                                        <p className={`text-sm text-text dark:text-text-dark flex-1 ${
                                            subtask.is_completed ? 'line-through opacity-60' : ''
                                        }`}>
                                            {subtask.title}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Linked Resources */}
                    {(skill || project || event) && (
                        <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-4 flex items-center gap-2">
                                <Link2 className="w-5 h-5" />
                                Linked Resources
                            </h2>
                            <div className="space-y-3">
                                {skill && (
                                    <Link
                                        href={`/skills/${skill.id}`}
                                        className="flex items-center gap-3 p-3 bg-background dark:bg-background-dark rounded-lg
                      hover:bg-primary/5 dark:hover:bg-primary-dark/5 border border-border dark:border-border-dark
                      hover:border-primary/50 dark:hover:border-primary-dark/50 transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary-dark/10
                      flex items-center justify-center flex-shrink-0">
                                            <span className="text-lg">🎯</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-text-secondary dark:text-text-darkSecondary">Skill</p>
                                            <p className="font-medium text-text dark:text-text-dark group-hover:text-primary
                        dark:group-hover:text-primary-dark transition-colors truncate">
                                                {skill. name}
                                            </p>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-text-secondary dark:text-text-darkSecondary flex-shrink-0" />
                                    </Link>
                                )}

                                {project && (
                                    <Link
                                        href={`/projects/${project.id}`}
                                        className="flex items-center gap-3 p-3 bg-background dark:bg-background-dark rounded-lg
                      hover:bg-primary/5 dark:hover:bg-primary-dark/5 border border-border dark:border-border-dark
                      hover:border-primary/50 dark:hover:border-primary-dark/50 transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary-dark/10
                      flex items-center justify-center flex-shrink-0">
                                            <span className="text-lg">📦</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-text-secondary dark:text-text-darkSecondary">Project</p>
                                            <p className="font-medium text-text dark:text-text-dark group-hover:text-primary
                        dark:group-hover:text-primary-dark transition-colors truncate">
                                                {project.title}
                                            </p>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-text-secondary dark:text-text-darkSecondary flex-shrink-0" />
                                    </Link>
                                )}

                                {event && (
                                    <Link
                                        href={`/events/${event.id}`}
                                        className="flex items-center gap-3 p-3 bg-background dark:bg-background-dark rounded-lg
                      hover:bg-primary/5 dark:hover:bg-primary-dark/5 border border-border dark:border-border-dark
                      hover:border-primary/50 dark:hover:border-primary-dark/50 transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary-dark/10
                      flex items-center justify-center flex-shrink-0">
                                            <span className="text-lg">📅</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-text-secondary dark:text-text-darkSecondary">Event</p>
                                            <p className="font-medium text-text dark:text-text-dark group-hover:text-primary
                        dark:group-hover:text-primary-dark transition-colors truncate">
                                                {event.name}
                                            </p>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-text-secondary dark:text-text-darkSecondary flex-shrink-0" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Attachments */}
                    {task. attachments && task.attachments. length > 0 && (
                        <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Attachments ({task.attachments.length})
                            </h2>
                            <div className="space-y-2">
                                {task.attachments.map((url, index) => (
                                    <a
                                        key={index}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 bg-background dark:bg-background-dark rounded-lg
                      hover:bg-primary/5 dark:hover:bg-primary-dark/5 border border-border dark:border-border-dark
                      hover:border-primary/50 dark:hover:border-primary-dark/50 transition-all group"
                                    >
                                        <ExternalLink className="w-4 h-4 text-text-secondary dark:text-text-darkSecondary flex-shrink-0" />
                                        <p className="flex-1 text-sm text-primary dark:text-primary-dark group-hover:underline truncate">
                                            {url}
                                        </p>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                        <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-3 flex items-center gap-2">
                                <Tag className="w-5 h-5" />
                                Tags
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {task. tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1. 5 bg-primary/10 text-primary dark:text-primary-dark rounded-full text-sm font-medium"
                                    >
                    {tag}
                  </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    {task.notes && (
                        <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-3 flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Notes
                            </h2>
                            <p className="text-text-secondary dark:text-text-darkSecondary whitespace-pre-wrap">
                                {task.notes}
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Column - Quick Info */}
                <div className="space-y-6">
                    {/* Task Details */}
                    <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-4">
                            Task Details
                        </h2>
                        <div className="space-y-4">
                            {/* Due Date */}
                            {task. due_date && (
                                <div>
                                    <div className="flex items-center gap-2 text-text-secondary dark:text-text-darkSecondary mb-1">
                                        <Calendar className="w-4 h-4" />
                                        <p className="text-xs font-medium">Due Date</p>
                                    </div>
                                    <p className={`text-sm font-medium ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-text dark:text-text-dark'}`}>
                                        {formatDate(task.due_date)}
                                        {task.due_time && (
                                            <span className="block text-xs mt-1">
                        at {formatTime(task.due_time)}
                      </span>
                                        )}
                                    </p>
                                </div>
                            )}

                            {/* Estimated Time */}
                            {task.estimated_time && task.estimated_time > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 text-text-secondary dark:text-text-darkSecondary mb-1">
                                        <Clock className="w-4 h-4" />
                                        <p className="text-xs font-medium">Estimated Time</p>
                                    </div>
                                    <p className="text-sm font-medium text-text dark:text-text-dark">
                                        {formatDuration(task.estimated_time)}
                                    </p>
                                </div>
                            )}

                            {/* Actual Time Spent */}
                            {task. actual_time_spent > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 text-text-secondary dark:text-text-darkSecondary mb-1">
                                        <Clock className="w-4 h-4" />
                                        <p className="text-xs font-medium">Time Spent</p>
                                    </div>
                                    <p className="text-sm font-medium text-text dark:text-text-dark">
                                        {formatDuration(task.actual_time_spent)}
                                    </p>
                                </div>
                            )}

                            {/* Recurrence */}
                            {task. is_recurring && (
                                <div>
                                    <div className="flex items-center gap-2 text-text-secondary dark:text-text-darkSecondary mb-1">
                                        <Repeat className="w-4 h-4" />
                                        <p className="text-xs font-medium">Recurrence</p>
                                    </div>
                                    <p className="text-sm font-medium text-text dark:text-text-dark capitalize">
                                        {task.recurrence_pattern}
                                        {task.recurrence_end_date && (
                                            <span className="block text-xs text-text-secondary dark:text-text-darkSecondary mt-1">
                        Until {formatDate(task.recurrence_end_date)}
                      </span>
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-4">
                            Timeline
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-text-secondary dark:text-text-darkSecondary mb-1">Created</p>
                                <p className="text-sm text-text dark:text-text-dark font-medium">
                                    {new Date(task.created_at). toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                            {task.updated_at !== task.created_at && (
                                <div>
                                    <p className="text-xs text-text-secondary dark:text-text-darkSecondary mb-1">Last Updated</p>
                                    <p className="text-sm text-text dark:text-text-dark font-medium">
                                        {new Date(task.updated_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            )}
                            {task.completed_at && (
                                <div>
                                    <p className="text-xs text-text-secondary dark:text-text-darkSecondary mb-1">Completed</p>
                                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                                        {new Date(task. completed_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
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