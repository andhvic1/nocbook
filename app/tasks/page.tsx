'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase'
import { TaskCard } from '@/components/tasks/TaskCard'
import { Button } from '@/components/ui/Button'
import { Task, Subtask, TaskStatus } from '@/types'
import {
    Plus,
    Search,
    Filter,
    X,
    CheckCircle2,
    Clock,
    AlertCircle,
    ListTodo,
    TrendingUp,
    Flame
} from 'lucide-react'
import Link from 'next/link'

type TimelineFilter = 'all' | 'today' | 'week' | 'month' | 'overdue'

export default function TasksPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [tasks, setTasks] = useState<Task[]>([])
    const [taskSubtasks, setTaskSubtasks] = useState<Record<string, Subtask[]>>({})
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)

    // Filters
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    const [selectedPriority, setSelectedPriority] = useState('')
    const [selectedStatus, setSelectedStatus] = useState('')
    const [timelineFilter, setTimelineFilter] = useState<TimelineFilter>('all')
    const [showMobileFilters, setShowMobileFilters] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        if (! authLoading && !user) {
            router.push('/login')
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (user) {
            fetchTasks()
        }
    }, [user])

    useEffect(() => {
        filterTasks()
    }, [tasks, searchTerm, selectedCategory, selectedPriority, selectedStatus, timelineFilter])

    const fetchTasks = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('tasks')
                . select('*')
                .order('priority', { ascending: false })
                .order('due_date', { ascending: true })

            if (error) throw error
            setTasks(data || [])

            // Fetch subtasks for each task
            if (data) {
                const subtasksMap: Record<string, Subtask[]> = {}

                for (const task of data) {
                    const { data: subtasksData, error: subtasksError } = await supabase
                        .from('subtasks')
                        .select('*')
                        .eq('task_id', task.id)
                        .order('order_index', { ascending: true })

                    if (! subtasksError && subtasksData) {
                        subtasksMap[task.id] = subtasksData
                    }
                }

                setTaskSubtasks(subtasksMap)
            }
        } catch (error) {
            console.error('Error fetching tasks:', error)
        } finally {
            setLoading(false)
        }
    }

    const getTimelineRange = (filter: TimelineFilter) => {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

        switch (filter) {
            case 'today':
                return {
                    start: today,
                    end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
                }
            case 'week':
                const weekStart = new Date(today)
                weekStart.setDate(today.getDate() - today.getDay())
                const weekEnd = new Date(weekStart)
                weekEnd.setDate(weekStart.getDate() + 7)
                return { start: weekStart, end: weekEnd }
            case 'month':
                const monthStart = new Date(now. getFullYear(), now.getMonth(), 1)
                const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
                return { start: monthStart, end: monthEnd }
            case 'overdue':
                return { start: new Date(0), end: today }
            default:
                return null
        }
    }

    const filterTasks = () => {
        let filtered = [... tasks]

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(task =>
                task.title.toLowerCase(). includes(term) ||
                task.description?. toLowerCase().includes(term) ||
                task.tags?.some(tag => tag.toLowerCase().includes(term))
            )
        }

        // Category filter
        if (selectedCategory) {
            filtered = filtered.filter(task => task.category === selectedCategory)
        }

        // Priority filter
        if (selectedPriority) {
            filtered = filtered.filter(task => task.priority === selectedPriority)
        }

        // Status filter
        if (selectedStatus) {
            filtered = filtered.filter(task => task.status === selectedStatus)
        }

        // Timeline filter
        if (timelineFilter !== 'all') {
            if (timelineFilter === 'overdue') {
                const now = new Date()
                filtered = filtered.filter(task =>
                    task.due_date &&
                    new Date(task.due_date) < now &&
                    task.status !== 'done'
                )
            } else {
                const range = getTimelineRange(timelineFilter)
                if (range) {
                    filtered = filtered.filter(task => {
                        const dueDate = task.due_date ? new Date(task.due_date) : null
                        if (! dueDate) return false
                        return dueDate >= range.start && dueDate <= range.end
                    })
                }
            }
        }

        setFilteredTasks(filtered)
    }

    const handleTaskDeleted = () => {
        fetchTasks()
    }

    const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
        try {
            const { error } = await supabase
                .from('tasks')
                .update({
                    status: newStatus,
                    progress: newStatus === 'done' ? 100 : undefined,
                    completed_at: newStatus === 'done' ? new Date().toISOString() : null
                })
                .eq('id', taskId)

            if (error) throw error
            fetchTasks()
        } catch (error) {
            console.error('Error updating task status:', error)
            alert('Failed to update task status')
        }
    }

    const clearFilters = () => {
        setSearchTerm('')
        setSelectedCategory('')
        setSelectedPriority('')
        setSelectedStatus('')
        setTimelineFilter('all')
        setShowMobileFilters(false)
    }

    // Statistics
    const stats = {
        total: tasks.length,
        notStarted: tasks.filter(t => t.status === 'not-started').length,
        inProgress: tasks.filter(t => t.status === 'in-progress').length,
        done: tasks.filter(t => t.status === 'done').length,
        overdue: tasks.filter(t =>
            t.due_date &&
            new Date(t.due_date) < new Date() &&
            t.status !== 'done'
        ).length,
        highPriority: tasks.filter(t => t.priority === 'high' || t.priority === 'urgent'). length,
    }

    const categories = Array.from(new Set(tasks. map(t => t.category)))
    const priorities = ['low', 'medium', 'high', 'urgent']
    const statuses = ['not-started', 'in-progress', 'done', 'blocked', 'cancelled']

    const hasActiveFilters = searchTerm || selectedCategory || selectedPriority || selectedStatus || timelineFilter !== 'all'
    const activeFilterCount = [searchTerm, selectedCategory, selectedPriority, selectedStatus, timelineFilter !== 'all'].filter(Boolean). length

    const timelineOptions: { value: TimelineFilter; label: string }[] = [
        { value: 'all', label: 'All' },
        { value: 'today', label: 'Today' },
        { value: 'week', label: 'This Week' },
        { value: 'month', label: 'This Month' },
        { value: 'overdue', label: 'Overdue' },
    ]

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-primary-dark mx-auto mb-4"></div>
                    <p className="text-text-secondary dark:text-text-darkSecondary">Loading tasks...</p>
                </div>
            </div>
        )
    }

    if (! user) return null

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl md:text-3xl font-bold text-text dark:text-text-dark mb-1">
                            Tasks & To-Do
                        </h1>
                        <p className="text-text-secondary dark:text-text-darkSecondary text-sm">
                            {tasks.length} {tasks.length === 1 ?  'task' : 'tasks'} • {stats.done} completed
                        </p>
                    </div>
                    <Link href="/tasks/new" className="flex-shrink-0">
                        <Button variant="primary" size="sm" className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Add Task</span>
                        </Button>
                    </Link>
                </div>

                {/* Mobile: Compact Search + Filter Button */}
                <div className="lg:hidden flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary dark:text-text-darkSecondary" />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border-2 border-border dark:border-border-dark
                bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
                focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors
                placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary"
                        />
                    </div>
                    <button
                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                        className="relative px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
              bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
              hover:border-primary dark:hover:border-primary-dark transition-colors flex items-center gap-2"
                    >
                        <Filter className="w-4 h-4" />
                        {activeFilterCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary dark:bg-primary-dark
                text-white text-xs rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
                        )}
                    </button>
                </div>

                {/* Mobile: Filter Dropdown */}
                {showMobileFilters && (
                    <div className="lg:hidden bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark
            rounded-xl p-4 space-y-3 animate-in slide-in-from-top duration-200">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-text dark:text-text-dark text-sm">Filters</h3>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="text-xs text-primary dark:text-primary-dark hover:underline flex items-center gap-1"
                                >
                                    <X className="w-3 h-3" />
                                    Clear all
                                </button>
                            )}
                        </div>

                        {/* Timeline Filter - Mobile */}
                        <div>
                            <label className="block text-xs font-medium text-text dark:text-text-dark mb-1">
                                Timeline
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {timelineOptions.map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => setTimelineFilter(option.value)}
                                        className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                                            timelineFilter === option.value
                                                ? 'bg-primary dark:bg-primary-dark text-white'
                                                : 'bg-background dark:bg-background-dark text-text dark:text-text-dark border border-border dark:border-border-dark'
                                        }`}
                                    >
                                        {option. label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-text dark:text-text-dark mb-1">
                                Category
                            </label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border-2 border-border dark:border-border-dark
                  bg-background dark:bg-background-dark text-text dark:text-text-dark
                  focus:outline-none focus:border-primary dark:focus:border-primary-dark"
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-text dark:text-text-dark mb-1">
                                Priority
                            </label>
                            <select
                                value={selectedPriority}
                                onChange={(e) => setSelectedPriority(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border-2 border-border dark:border-border-dark
                  bg-background dark:bg-background-dark text-text dark:text-text-dark
                  focus:outline-none focus:border-primary dark:focus:border-primary-dark"
                            >
                                <option value="">All Priorities</option>
                                {priorities. map(pri => (
                                    <option key={pri} value={pri}>{pri}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-text dark:text-text-dark mb-1">
                                Status
                            </label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border-2 border-border dark:border-border-dark
                  bg-background dark:bg-background-dark text-text dark:text-text-dark
                  focus:outline-none focus:border-primary dark:focus:border-primary-dark"
                            >
                                <option value="">All Statuses</option>
                                {statuses.map(stat => (
                                    <option key={stat} value={stat}>{stat}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={() => setShowMobileFilters(false)}
                            className="w-full py-2 bg-primary dark:bg-primary-dark text-white rounded-lg text-sm font-medium
                hover:opacity-90 transition-opacity"
                        >
                            Apply Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Stats Cards */}
            <div className="relative -mx-4 px-4 md:mx-0 md:px-0">
                <div className="flex md:grid md:grid-cols-6 gap-3 overflow-x-auto pb-2 md:pb-0 snap-x snap-mandatory scrollbar-hide">
                    <div className="flex-shrink-0 w-32 md:w-auto snap-start bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1. 5 bg-blue-500/10 rounded-lg">
                                <ListTodo className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <p className="text-text-secondary dark:text-text-darkSecondary text-xs">Total</p>
                        </div>
                        <p className="text-xl font-bold text-text dark:text-text-dark">{stats.total}</p>
                    </div>

                    <div className="flex-shrink-0 w-32 md:w-auto snap-start bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-gray-500/10 rounded-lg">
                                <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </div>
                            <p className="text-text-secondary dark:text-text-darkSecondary text-xs">Not Started</p>
                        </div>
                        <p className="text-xl font-bold text-text dark:text-text-dark">{stats.notStarted}</p>
                    </div>

                    <div className="flex-shrink-0 w-32 md:w-auto snap-start bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-blue-500/10 rounded-lg">
                                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <p className="text-text-secondary dark:text-text-darkSecondary text-xs">In Progress</p>
                        </div>
                        <p className="text-xl font-bold text-text dark:text-text-dark">{stats.inProgress}</p>
                    </div>

                    <div className="flex-shrink-0 w-32 md:w-auto snap-start bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1. 5 bg-green-500/10 rounded-lg">
                                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </div>
                            <p className="text-text-secondary dark:text-text-darkSecondary text-xs">Done</p>
                        </div>
                        <p className="text-xl font-bold text-text dark:text-text-dark">{stats.done}</p>
                    </div>

                    <div className="flex-shrink-0 w-32 md:w-auto snap-start bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-red-500/10 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                            </div>
                            <p className="text-text-secondary dark:text-text-darkSecondary text-xs">Overdue</p>
                        </div>
                        <p className="text-xl font-bold text-text dark:text-text-dark">{stats.overdue}</p>
                    </div>

                    <div className="flex-shrink-0 w-32 md:w-auto snap-start bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-orange-500/10 rounded-lg">
                                <Flame className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                            </div>
                            <p className="text-text-secondary dark:text-text-darkSecondary text-xs">Priority</p>
                        </div>
                        <p className="text-xl font-bold text-text dark:text-text-dark">{stats.highPriority}</p>
                    </div>
                </div>
            </div>

            {/* Main Layout */}
            <div className="grid lg:grid-cols-4 gap-6">
                {/* Desktop Filter Sidebar */}
                <div className="hidden lg:block lg:col-span-1">
                    <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark
            rounded-xl p-6 sticky top-24">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-text dark:text-text-dark">
                                Filter & Search
                            </h3>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-text-secondary dark:text-text-darkSecondary hover:text-primary
                    dark:hover:text-primary-dark transition-colors flex items-center gap-1"
                                >
                                    <X className="w-4 h-4" />
                                    Clear
                                </button>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary dark:text-text-darkSecondary" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e. target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
                    bg-background dark:bg-background-dark text-text dark:text-text-dark
                    focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors
                    placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary"
                                />
                            </div>

                            {/* Timeline Filter - Desktop */}
                            <div>
                                <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                                    Timeline
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {timelineOptions.map(option => (
                                        <button
                                            key={option.value}
                                            onClick={() => setTimelineFilter(option.value)}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                                timelineFilter === option.value
                                                    ?  'bg-primary dark:bg-primary-dark text-white'
                                                    : 'bg-background dark:bg-background-dark text-text dark:text-text-dark hover:bg-primary/10 dark:hover:bg-primary-dark/10'
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                                    Category
                                </label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target. value)}
                                    className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
                    bg-background dark:bg-background-dark text-text dark:text-text-dark
                    focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                                    Priority
                                </label>
                                <select
                                    value={selectedPriority}
                                    onChange={(e) => setSelectedPriority(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
                    bg-background dark:bg-background-dark text-text dark:text-text-dark
                    focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                                >
                                    <option value="">All Priorities</option>
                                    {priorities.map(pri => (
                                        <option key={pri} value={pri}>{pri}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                                    Status
                                </label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
                    bg-background dark:bg-background-dark text-text dark:text-text-dark
                    focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                                >
                                    <option value="">All Statuses</option>
                                    {statuses.map(stat => (
                                        <option key={stat} value={stat}>{stat}</option>
                                    ))}
                                </select>
                            </div>

                            {hasActiveFilters && (
                                <div className="pt-3 border-t border-border dark:border-border-dark">
                                    <p className="text-xs text-text-secondary dark:text-text-darkSecondary">
                                        {activeFilterCount} active filter(s)
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tasks Grid */}
                <div className="lg:col-span-3">
                    {filteredTasks.length > 0 ? (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm text-text-secondary dark:text-text-darkSecondary">
                                    {filteredTasks.length} of {tasks.length} tasks
                                </p>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2 md:gap-6">
                                {filteredTasks.map(task => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        subtasks={taskSubtasks[task.id] || []}
                                        onDelete={handleTaskDeleted}
                                        onStatusChange={(status) => handleStatusChange(task. id, status)}
                                    />
                                ))}
                            </div>
                        </>
                    ) : tasks.length === 0 ? (
                        <div className="text-center py-12 bg-cardBg dark:bg-cardBg-dark border-2 border-dashed
              border-border dark:border-border-dark rounded-xl">
                            <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary-dark/10
                flex items-center justify-center mx-auto mb-4">
                                <ListTodo className="w-8 h-8 text-primary dark:text-primary-dark" />
                            </div>
                            <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-2">
                                No tasks yet
                            </h3>
                            <p className="text-text-secondary dark:text-text-darkSecondary mb-6 text-sm px-4">
                                Start organizing your life with your first task
                            </p>
                            <Link href="/tasks/new">
                                <Button variant="primary" className="inline-flex items-center gap-2">
                                    <Plus className="w-5 h-5" />
                                    Create Your First Task
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-cardBg dark:bg-cardBg-dark border-2 border-dashed
              border-border dark:border-border-dark rounded-xl">
                            <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary-dark/10
                flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-text-secondary dark:text-text-darkSecondary" />
                            </div>
                            <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-2">
                                No results found
                            </h3>
                            <p className="text-text-secondary dark:text-text-darkSecondary text-sm px-4 mb-4">
                                Try adjusting your filters or search term
                            </p>
                            {hasActiveFilters && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="inline-flex items-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}