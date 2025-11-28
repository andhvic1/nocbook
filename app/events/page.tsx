'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase'
import { EventCard } from '@/components/events/EventCard'
import { Button } from '@/components/ui/Button'
import { Event, Person } from '@/types'
import {
    Plus,
    Search,
    Filter,
    X,
    Calendar,
    TrendingUp,
    Users,
    Award,
    DollarSign
} from 'lucide-react'
import Link from 'next/link'

type TimelineFilter = 'all' | 'today' | 'week' | 'month' | 'year'

export default function EventsPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [events, setEvents] = useState<Event[]>([])
    const [people, setPeople] = useState<Person[]>([])
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)

    // Event counts (attendees & materials)
    const [eventCounts, setEventCounts] = useState<Record<string, { attendees: number; materials: number }>>({})

    // Filters
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedType, setSelectedType] = useState('')
    const [selectedYear, setSelectedYear] = useState('')
    const [timelineFilter, setTimelineFilter] = useState<TimelineFilter>('all') // NEW
    const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)
    const [showMobileFilters, setShowMobileFilters] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        if (!  authLoading && ! user) {
            router.push('/login')
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (user) {
            fetchEvents()
            fetchPeople()
        }
    }, [user])

    useEffect(() => {
        filterEvents()
    }, [events, searchTerm, selectedType, selectedYear, timelineFilter, showFeaturedOnly])

    const fetchEvents = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .order('is_featured', { ascending: false })
                .order('start_date', { ascending: false })

            if (error) throw error
            setEvents(data || [])

            // Fetch counts for each event
            if (data) {
                const counts: Record<string, { attendees: number; materials: number }> = {}

                for (const event of data) {
                    // Count attendees
                    const { count: attendeesCount } = await supabase
                        .from('event_people')
                        .select('*', { count: 'exact', head: true })
                        .eq('event_id', event.id)

                    // Count materials
                    const { count: materialsCount } = await supabase
                        .from('event_materials')
                        . select('*', { count: 'exact', head: true })
                        .eq('event_id', event.id)

                    counts[event.id] = {
                        attendees: attendeesCount || 0,
                        materials: materialsCount || 0
                    }
                }

                setEventCounts(counts)
            }
        } catch (error) {
            console.error('Error fetching events:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchPeople = async () => {
        try {
            const { data, error } = await supabase
                .from('people')
                . select('*')
                .order('name', { ascending: true })

            if (error) throw error
            setPeople(data || [])
        } catch (error) {
            console.error('Error fetching people:', error)
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
                weekStart.setDate(today.getDate() - today.getDay()) // Start of week (Sunday)
                const weekEnd = new Date(weekStart)
                weekEnd.setDate(weekStart.getDate() + 7)
                return { start: weekStart, end: weekEnd }
            case 'month':
                const monthStart = new Date(now. getFullYear(), now.getMonth(), 1)
                const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
                return { start: monthStart, end: monthEnd }
            case 'year':
                const yearStart = new Date(now.getFullYear(), 0, 1)
                const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59)
                return { start: yearStart, end: yearEnd }
            default:
                return null
        }
    }

    const filterEvents = () => {
        let filtered = [...  events]

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(event =>
                    event.name.toLowerCase(). includes(term) ||
                    event.venue?.toLowerCase(). includes(term) ||
                event.organizer?.toLowerCase().includes(term) ||
                event.tags?.some(tag => tag.toLowerCase().includes(term))
        )
        }

        // Type filter
        if (selectedType) {
            filtered = filtered.filter(event => event.event_type === selectedType)
        }

        // Year filter
        if (selectedYear) {
            filtered = filtered.filter(event => {
                const eventYear = event.start_date ?   new Date(event.start_date).getFullYear(). toString() : null
                return eventYear === selectedYear
            })
        }

        // Timeline filter - NEW!
        if (timelineFilter !== 'all') {
            const range = getTimelineRange(timelineFilter)
            if (range) {
                filtered = filtered. filter(event => {
                    const eventDate = event.start_date ? new Date(event.start_date) : null
                    if (!eventDate) return false
                    return eventDate >= range.start && eventDate <= range.end
                })
            }
        }

        // Featured filter
        if (showFeaturedOnly) {
            filtered = filtered.filter(event => event.is_featured)
        }

        setFilteredEvents(filtered)
    }

    const handleEventDeleted = () => {
        fetchEvents()
    }

    const clearFilters = () => {
        setSearchTerm('')
        setSelectedType('')
        setSelectedYear('')
        setTimelineFilter('all')
        setShowFeaturedOnly(false)
        setShowMobileFilters(false)
    }

    // Statistics
    const stats = {
        total: events.length,
        totalAttendees: Object.values(eventCounts).reduce((sum, counts) => sum + counts.attendees, 0),
        withCertificates: events.filter(e => e.certificate_url).length,
        totalSpent: events.reduce((sum, e) => sum + e.cost, 0),
        upcoming: events.filter(e => e.start_date && new Date(e.start_date) > new Date()). length,
    }

    const eventTypes = Array.from(new Set(events.  map(e => e.event_type)))
    const years = Array.from(new Set(events. map(e =>
        e.start_date ? new Date(e.start_date).getFullYear(). toString() : null
    ).  filter(Boolean))) as string[]

    const hasActiveFilters = searchTerm || selectedType || selectedYear || timelineFilter !== 'all' || showFeaturedOnly
    const activeFilterCount = [searchTerm, selectedType, selectedYear, timelineFilter !== 'all', showFeaturedOnly].filter(Boolean).length

    const timelineOptions: { value: TimelineFilter; label: string }[] = [
        { value: 'all', label: 'All Time' },
        { value: 'today', label: 'Today' },
        { value: 'week', label: 'This Week' },
        { value: 'month', label: 'This Month' },
        { value: 'year', label: 'This Year' },
    ]

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-primary-dark mx-auto mb-4"></div>
                    <p className="text-text-secondary dark:text-text-darkSecondary">Loading events...</p>
                </div>
            </div>
        )
    }

    if (!  user) return null

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl md:text-3xl font-bold text-text dark:text-text-dark mb-1">
                            Events & Workshops
                        </h1>
                        <p className="text-text-secondary dark:text-text-darkSecondary text-sm">
                            {events.length} {events.length === 1 ?   'event' : 'events'} • {stats.totalAttendees} connections made
                        </p>
                    </div>
                    <Link href="/events/new" className="flex-shrink-0">
                        <Button variant="primary" size="sm" className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Add Event</span>
                        </Button>
                    </Link>
                </div>

                {/* Mobile: Compact Search + Filter Button */}
                <div className="lg:hidden flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary dark:text-text-darkSecondary" />
                        <input
                            type="text"
                            placeholder="Search events..."
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
                            <label className="block text-xs font-medium text-text dark:text-text-dark mb-2">
                                Timeline
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {timelineOptions.map(option => (
                                    <button
                                        key={option. value}
                                        onClick={() => setTimelineFilter(option.value)}
                                        className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                                            timelineFilter === option.value
                                                ? 'bg-primary dark:bg-primary-dark text-white'
                                                : 'bg-background dark:bg-background-dark text-text dark:text-text-dark border border-border dark:border-border-dark'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-text dark:text-text-dark mb-1">
                                Event Type
                            </label>
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border-2 border-border dark:border-border-dark
          bg-background dark:bg-background-dark text-text dark:text-text-dark
          focus:outline-none focus:border-primary dark:focus:border-primary-dark"
                            >
                                <option value="">All Types</option>
                                {eventTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-text dark:text-text-dark mb-1">
                                Year
                            </label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e. target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border-2 border-border dark:border-border-dark
          bg-background dark:bg-background-dark text-text dark:text-text-dark
          focus:outline-none focus:border-primary dark:focus:border-primary-dark"
                            >
                                <option value="">All Years</option>
                                {years.sort((a, b) => parseInt(b) - parseInt(a)).map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-background dark:hover:bg-background-dark transition-colors">
                            <input
                                type="checkbox"
                                checked={showFeaturedOnly}
                                onChange={(e) => setShowFeaturedOnly(e. target.checked)}
                                className="w-4 h-4"
                            />
                            <span className="text-sm text-text dark:text-text-dark">Featured only</span>
                        </label>

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
                            <div className="p-1.  5 md:p-2 bg-blue-500/10 rounded-lg">
                                <Calendar className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <p className="text-text-secondary dark:text-text-darkSecondary text-xs">Total</p>
                        </div>
                        <p className="text-xl md:text-2xl font-bold text-text dark:text-text-dark">{stats.total}</p>
                    </div>

                    <div className="flex-shrink-0 w-36 md:w-auto snap-start bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-3 md:p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1. 5 md:p-2 bg-purple-500/10 rounded-lg">
                                <Users className="w-4 h-4 md:w-5 md:h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <p className="text-text-secondary dark:text-text-darkSecondary text-xs">People</p>
                        </div>
                        <p className="text-xl md:text-2xl font-bold text-text dark:text-text-dark">{stats.  totalAttendees}</p>
                    </div>

                    <div className="flex-shrink-0 w-36 md:w-auto snap-start bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-3 md:p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 md:p-2 bg-yellow-500/10 rounded-lg">
                                <Award className="w-4 h-4 md:w-5 md:h-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <p className="text-text-secondary dark:text-text-darkSecondary text-xs">Certificates</p>
                        </div>
                        <p className="text-xl md:text-2xl font-bold text-text dark:text-text-dark">{stats.withCertificates}</p>
                    </div>

                    <div className="flex-shrink-0 w-36 md:w-auto snap-start bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-3 md:p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1. 5 md:p-2 bg-green-500/10 rounded-lg">
                                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <p className="text-text-secondary dark:text-text-darkSecondary text-xs">Upcoming</p>
                        </div>
                        <p className="text-xl md:text-2xl font-bold text-text dark:text-text-dark">{stats. upcoming}</p>
                    </div>

                    <div className="flex-shrink-0 w-36 md:w-auto snap-start bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-3 md:p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 md:p-2 bg-red-500/10 rounded-lg">
                                <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <p className="text-text-secondary dark:text-text-darkSecondary text-xs">Spent</p>
                        </div>
                        <p className="text-xl md:text-2xl font-bold text-text dark:text-text-dark">
                            {stats.totalSpent === 0 ? 'Free' : `$${stats.totalSpent.  toLocaleString()}`}
                        </p>
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
                                    onChange={(e) => setSearchTerm(e.  target. value)}
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
                                            key={option. value}
                                            onClick={() => setTimelineFilter(option.value)}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                                timelineFilter === option.value
                                                    ? 'bg-primary dark:bg-primary-dark text-white'
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
                                    Event Type
                                </label>
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e. target.value)}
                                    className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
                    bg-background dark:bg-background-dark text-text dark:text-text-dark
                    focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                                >
                                    <option value="">All Types</option>
                                    {eventTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                                    Year
                                </label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
                    bg-background dark:bg-background-dark text-text dark:text-text-dark
                    focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                                >
                                    <option value="">All Years</option>
                                    {years.sort((a, b) => parseInt(b) - parseInt(a)).map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg hover:bg-background
                dark:hover:bg-background-dark transition-colors">
                                <input
                                    type="checkbox"
                                    checked={showFeaturedOnly}
                                    onChange={(e) => setShowFeaturedOnly(e.target.  checked)}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm text-text dark:text-text-dark">Show featured only</span>
                            </label>

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

                {/* Events Grid */}
                <div className="lg:col-span-3">
                    {filteredEvents.length > 0 ? (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm text-text-secondary dark:text-text-darkSecondary">
                                    {filteredEvents.length} of {events.length} events
                                </p>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2 md:gap-6">
                                {filteredEvents.map(event => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        people={people}
                                        attendeesCount={eventCounts[event.id]?.attendees || 0}
                                        materialsCount={eventCounts[event.id]?.materials || 0}
                                        onDelete={handleEventDeleted}
                                    />
                                ))}
                            </div>
                        </>
                    ) : events.length === 0 ? (
                        <div className="text-center py-12 bg-cardBg dark:bg-cardBg-dark border-2 border-dashed
              border-border dark:border-border-dark rounded-xl">
                            <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary-dark/10
                flex items-center justify-center mx-auto mb-4">
                                <Calendar className="w-8 h-8 text-primary dark:text-primary-dark" />
                            </div>
                            <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-2">
                                No events yet
                            </h3>
                            <p className="text-text-secondary dark:text-text-darkSecondary mb-6 text-sm px-4">
                                Start documenting your learning journey and networking activities
                            </p>
                            <Link href="/events/new">
                                <Button variant="primary" className="inline-flex items-center gap-2">
                                    <Plus className="w-5 h-5" />
                                    Add Your First Event
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