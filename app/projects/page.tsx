'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { Button } from '@/components/ui/Button'
import { Project, Person } from '@/types'
import {
    Plus,
    Search,
    Filter,
    X,
    Briefcase,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertCircle
} from 'lucide-react'
import Link from 'next/link'

export default function ProjectsPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [projects, setProjects] = useState<Project[]>([])
    const [people, setPeople] = useState<Person[]>([])
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)

    // Filters
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    const [selectedStatus, setSelectedStatus] = useState('')
    const [selectedPriority, setSelectedPriority] = useState('')
    const [showMobileFilters, setShowMobileFilters] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        if (! authLoading && !user) {
            router.push('/login')
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (user) {
            fetchProjects()
            fetchPeople()
        }
    }, [user])

    useEffect(() => {
        filterProjects()
    }, [projects, searchTerm, selectedCategory, selectedStatus, selectedPriority])

    const fetchProjects = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setProjects(data || [])
        } catch (error) {
            console.error('Error fetching projects:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchPeople = async () => {
        try {
            const { data, error } = await supabase
                .from('people')
                . select('id, name')
                .order('name', { ascending: true })

            if (error) throw error
            setPeople(data || [])
        } catch (error) {
            console.error('Error fetching people:', error)
        }
    }

    const filterProjects = () => {
        let filtered = [... projects]

        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(project =>
                project.title.toLowerCase(). includes(term) ||
                project.description?. toLowerCase().includes(term) ||
                project.tags?. some(tag => tag.toLowerCase(). includes(term)) ||
                project.tech_stack?.some(tech => tech.toLowerCase().includes(term))
            )
        }

        if (selectedCategory) {
            filtered = filtered.filter(project => project.category === selectedCategory)
        }

        if (selectedStatus) {
            filtered = filtered.filter(project => project.status === selectedStatus)
        }

        if (selectedPriority) {
            filtered = filtered.filter(project => project.priority === selectedPriority)
        }

        setFilteredProjects(filtered)
    }

    const handleProjectDeleted = () => {
        fetchProjects()
    }

    const clearFilters = () => {
        setSearchTerm('')
        setSelectedCategory('')
        setSelectedStatus('')
        setSelectedPriority('')
        setShowMobileFilters(false)
    }

    // Statistics
    const stats = {
        total: projects.length,
        inProgress: projects.filter(p => p.status === 'in-progress').length,
        completed: projects.filter(p => p. status === 'completed').length,
        overdue: projects.filter(p =>
            p.deadline &&
            new Date(p.deadline) < new Date() &&
            p.status !== 'completed'
        ).length,
        avgProgress: projects.length > 0
            ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
            : 0,
    }

    const categories = Array.from(new Set(projects. map(p => p.category)))
    const statuses = Array. from(new Set(projects.map(p => p.status)))
    const priorities = Array.from(new Set(projects.map(p => p.priority)))
    const hasActiveFilters = searchTerm || selectedCategory || selectedStatus || selectedPriority
    const activeFilterCount = [searchTerm, selectedCategory, selectedStatus, selectedPriority].filter(Boolean).length

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-primary-dark mx-auto mb-4"></div>
                    <p className="text-text-secondary dark:text-text-darkSecondary">Loading projects...</p>
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
                            Project Tracker
                        </h1>
                        <p className="text-text-secondary dark:text-text-darkSecondary text-sm">
                            {projects.length} {projects.length === 1 ?  'project' : 'projects'} in total
                        </p>
                    </div>
                    <Link href="/projects/new" className="flex-shrink-0">
                        <Button variant="primary" size="sm" className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">New Project</span>
                        </Button>
                    </Link>
                </div>

                {/* Mobile: Compact Search + Filter Button */}
                <div className="lg:hidden flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary dark:text-text-darkSecondary" />
                        <input
                            type="text"
                            placeholder="Search projects..."
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
                                {statuses.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-text dark:text-text-dark mb-1">
                                Priority
                            </label>
                            <select
                                value={selectedPriority}
                                onChange={(e) => setSelectedPriority(e.target. value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border-2 border-border dark:border-border-dark
                  bg-background dark:bg-background-dark text-text dark:text-text-dark
                  focus:outline-none focus:border-primary dark:focus:border-primary-dark"
                            >
                                <option value="">All Priorities</option>
                                {priorities.map(priority => (
                                    <option key={priority} value={priority}>{priority}</option>
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

            {/* Stats Cards - Horizontal Scroll on Mobile */}
            <div className="relative -mx-4 px-4 md:mx-0 md:px-0">
                <div className="flex md:grid md:grid-cols-5 gap-3 overflow-x-auto pb-2 md:pb-0 snap-x snap-mandatory scrollbar-hide">
                    <div className="flex-shrink-0 w-36 md:w-auto snap-start bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-3 md:p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1. 5 md:p-2 bg-blue-500/10 rounded-lg">
                                <Briefcase className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <p className="text-text-secondary dark:text-text-darkSecondary text-xs">Total</p>
                        </div>
                        <p className="text-xl md:text-2xl font-bold text-text dark:text-text-dark">{stats.total}</p>
                    </div>

                    <div className="flex-shrink-0 w-36 md:w-auto snap-start bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-3 md:p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 md:p-2 bg-yellow-500/10 rounded-lg">
                                <Clock className="w-4 h-4 md:w-5 md:h-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <p className="text-text-secondary dark:text-text-darkSecondary text-xs">Active</p>
                        </div>
                        <p className="text-xl md:text-2xl font-bold text-text dark:text-text-dark">{stats. inProgress}</p>
                    </div>

                    <div className="flex-shrink-0 w-36 md:w-auto snap-start bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-3 md:p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 md:p-2 bg-green-500/10 rounded-lg">
                                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <p className="text-text-secondary dark:text-text-darkSecondary text-xs">Done</p>
                        </div>
                        <p className="text-xl md:text-2xl font-bold text-text dark:text-text-dark">{stats. completed}</p>
                    </div>

                    <div className="flex-shrink-0 w-36 md:w-auto snap-start bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-3 md:p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 md:p-2 bg-red-500/10 rounded-lg">
                                <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <p className="text-text-secondary dark:text-text-darkSecondary text-xs">Overdue</p>
                        </div>
                        <p className="text-xl md:text-2xl font-bold text-text dark:text-text-dark">{stats.overdue}</p>
                    </div>

                    <div className="flex-shrink-0 w-36 md:w-auto snap-start bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-3 md:p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 md:p-2 bg-purple-500/10 rounded-lg">
                                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <p className="text-text-secondary dark:text-text-darkSecondary text-xs">Avg Progress</p>
                        </div>
                        <p className="text-xl md:text-2xl font-bold text-text dark:text-text-dark">{stats. avgProgress}%</p>
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

                            <div>
                                <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                                    Category
                                </label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
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
                                    Status
                                </label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target. value)}
                                    className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
                    bg-background dark:bg-background-dark text-text dark:text-text-dark
                    focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                                >
                                    <option value="">All Statuses</option>
                                    {statuses.map(status => (
                                        <option key={status} value={status}>{status}</option>
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
                                    {priorities.map(priority => (
                                        <option key={priority} value={priority}>{priority}</option>
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

                {/* Projects Grid */}
                <div className="lg:col-span-3">
                    {filteredProjects.length > 0 ? (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm text-text-secondary dark:text-text-darkSecondary">
                                    {filteredProjects.length} of {projects.length} projects
                                </p>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2 md:gap-6">
                                {filteredProjects.map(project => (
                                    <ProjectCard
                                        key={project.id}
                                        project={project}
                                        people={people}
                                        onDelete={handleProjectDeleted}
                                    />
                                ))}
                            </div>
                        </>
                    ) : projects.length === 0 ? (
                        <div className="text-center py-12 bg-cardBg dark:bg-cardBg-dark border-2 border-dashed
              border-border dark:border-border-dark rounded-xl">
                            <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary-dark/10
                flex items-center justify-center mx-auto mb-4">
                                <Briefcase className="w-8 h-8 text-primary dark:text-primary-dark" />
                            </div>
                            <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-2">
                                No projects yet
                            </h3>
                            <p className="text-text-secondary dark:text-text-darkSecondary mb-6 text-sm px-4">
                                Start tracking your projects and see your progress here
                            </p>
                            <Link href="/projects/new">
                                <Button variant="primary" className="inline-flex items-center gap-2">
                                    <Plus className="w-5 h-5" />
                                    Create Your First Project
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