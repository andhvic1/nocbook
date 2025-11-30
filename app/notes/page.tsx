'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase'
import { NoteCard } from '@/components/notes/NoteCard'
import { Button } from '@/components/ui/Button'
import { Note } from '@/types'
import {
    Plus,
    Search,
    Filter,
    X,
    BookOpen,
    Pin,
    Star,
    Eye,
    TrendingUp,
    Tag as TagIcon,
    FileText
} from 'lucide-react'
import Link from 'next/link'

export default function NotesPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [notes, setNotes] = useState<Note[]>([])
    const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
    const [loading, setLoading] = useState(true)

    // Filters
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    const [selectedType, setSelectedType] = useState('')
    const [showPinnedOnly, setShowPinnedOnly] = useState(false)
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
    const [showMobileFilters, setShowMobileFilters] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        if (! authLoading && !user) {
            router.push('/login')
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (user) {
            fetchNotes()
        }
    }, [user])

    useEffect(() => {
        filterNotes()
    }, [notes, searchTerm, selectedCategory, selectedType, showPinnedOnly, showFavoritesOnly])

    const fetchNotes = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('notes')
                .select('*')
                .order('is_pinned', { ascending: false })
                .order('updated_at', { ascending: false })

            if (error) throw error
            setNotes(data || [])
        } catch (error) {
            console.error('Error fetching notes:', error)
        } finally {
            setLoading(false)
        }
    }

    const filterNotes = () => {
        let filtered = [... notes]

        // Search filter (full-text search would be better, but client-side for now)
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(note =>
                note.title.toLowerCase(). includes(term) ||
                note.content.toLowerCase().includes(term) ||
                note.category.toLowerCase().includes(term) ||
                note.tags?. some(tag => tag.toLowerCase(). includes(term))
            )
        }

        // Category filter
        if (selectedCategory) {
            filtered = filtered.filter(note => note.category === selectedCategory)
        }

        // Type filter
        if (selectedType) {
            filtered = filtered.filter(note => note.note_type === selectedType)
        }

        // Pinned filter
        if (showPinnedOnly) {
            filtered = filtered.filter(note => note.is_pinned)
        }

        // Favorites filter
        if (showFavoritesOnly) {
            filtered = filtered.filter(note => note.is_favorite)
        }

        setFilteredNotes(filtered)
    }

    const handleNoteDeleted = () => {
        fetchNotes()
    }

    const handleTogglePin = async (noteId: string, currentValue: boolean) => {
        try {
            const { error } = await supabase
                .from('notes')
                .update({ is_pinned: !currentValue })
                .eq('id', noteId)

            if (error) throw error
            fetchNotes()
        } catch (error) {
            console.error('Error toggling pin:', error)
            alert('Failed to toggle pin')
        }
    }

    const handleToggleFavorite = async (noteId: string, currentValue: boolean) => {
        try {
            const { error } = await supabase
                . from('notes')
                .update({ is_favorite: !currentValue })
                .eq('id', noteId)

            if (error) throw error
            fetchNotes()
        } catch (error) {
            console.error('Error toggling favorite:', error)
            alert('Failed to toggle favorite')
        }
    }

    const clearFilters = () => {
        setSearchTerm('')
        setSelectedCategory('')
        setSelectedType('')
        setShowPinnedOnly(false)
        setShowFavoritesOnly(false)
        setShowMobileFilters(false)
    }

    // Statistics
    const stats = {
        total: notes.length,
        pinned: notes.filter(n => n.is_pinned).length,
        favorites: notes.filter(n => n.is_favorite).length,
        totalViews: notes.reduce((sum, n) => sum + n.view_count, 0),
        categories: new Set(notes.map(n => n.category)). size,
    }

    // Get all unique tags
    const allTags = Array.from(
        new Set(notes.flatMap(n => n.tags || []))
    ). sort()

    // Top tags (most used)
    const tagCounts = notes.reduce((acc, note) => {
        note.tags?.forEach(tag => {
            acc[tag] = (acc[tag] || 0) + 1
        })
        return acc
    }, {} as Record<string, number>)

    const topTags = Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)

    const categories = Array.from(new Set(notes.map(n => n. category))).sort()
    const noteTypes = ['rumus', 'tutorial', 'konsep', 'troubleshooting', 'reference', 'code-snippet', 'other']

    const hasActiveFilters = searchTerm || selectedCategory || selectedType || showPinnedOnly || showFavoritesOnly
    const activeFilterCount = [searchTerm, selectedCategory, selectedType, showPinnedOnly, showFavoritesOnly].filter(Boolean).length

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-primary-dark mx-auto mb-4"></div>
                    <p className="text-text-secondary dark:text-text-darkSecondary">Loading notes...</p>
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
                            Notes Library
                        </h1>
                        <p className="text-text-secondary dark:text-text-darkSecondary text-sm">
                            {notes.length} {notes.length === 1 ?  'note' : 'notes'} • {stats.totalViews} total views
                        </p>
                    </div>
                    <Link href="/notes/new" className="flex-shrink-0">
                        <Button variant="primary" size="sm" className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Add Note</span>
                        </Button>
                    </Link>
                </div>

                {/* Mobile: Compact Search + Filter Button */}
                <div className="lg:hidden flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary dark:text-text-darkSecondary" />
                        <input
                            type="text"
                            placeholder="Search notes..."
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
                                Type
                            </label>
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border-2 border-border dark:border-border-dark
                  bg-background dark:bg-background-dark text-text dark:text-text-dark
                  focus:outline-none focus:border-primary dark:focus:border-primary-dark"
                            >
                                <option value="">All Types</option>
                                {noteTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-background dark:hover:bg-background-dark transition-colors">
                            <input
                                type="checkbox"
                                checked={showPinnedOnly}
                                onChange={(e) => setShowPinnedOnly(e.target.checked)}
                                className="w-4 h-4"
                            />
                            <span className="text-sm text-text dark:text-text-dark">Pinned only</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-background dark:hover:bg-background-dark transition-colors">
                            <input
                                type="checkbox"
                                checked={showFavoritesOnly}
                                onChange={(e) => setShowFavoritesOnly(e. target.checked)}
                                className="w-4 h-4"
                            />
                            <span className="text-sm text-text dark:text-text-dark">Favorites only</span>
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

            {/* Stats Cards */}
            <div className="relative -mx-4 px-4 md:mx-0 md:px-0">
                <div className="flex md:grid md:grid-cols-5 gap-3 overflow-x-auto pb-2 md:pb-0 snap-x snap-mandatory scrollbar-hide">
                    <div className="flex-shrink-0 w-32 md:w-auto snap-start bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1. 5 bg-blue-500/10 rounded-lg">
                                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <p className="text-text-secondary dark:text-text-darkSecondary text-xs">Total</p>
                        </div>
                        <p className="text-xl font-bold text-text dark:text-text-dark">{stats.total}</p>
                    </div>

                    <div className="flex-shrink-0 w-32 md:w-auto snap-start bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-yellow-500/10 rounded-lg">
                                <Pin className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <p className="text-text-secondary dark:text-text-darkSecondary text-xs">Pinned</p>
                        </div>
                        <p className="text-xl font-bold text-text dark:text-text-dark">{stats.pinned}</p>
                    </div>

                    <div className="flex-shrink-0 w-32 md:w-auto snap-start bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-red-500/10 rounded-lg">
                                <Star className="w-4 h-4 text-red-600 dark:text-red-400" />
                            </div>
                            <p className="text-text-secondary dark:text-text-darkSecondary text-xs">Favorites</p>
                        </div>
                        <p className="text-xl font-bold text-text dark:text-text-dark">{stats.favorites}</p>
                    </div>

                    <div className="flex-shrink-0 w-32 md:w-auto snap-start bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-green-500/10 rounded-lg">
                                <Eye className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </div>
                            <p className="text-text-secondary dark:text-text-darkSecondary text-xs">Views</p>
                        </div>
                        <p className="text-xl font-bold text-text dark:text-text-dark">{stats.totalViews}</p>
                    </div>

                    <div className="flex-shrink-0 w-32 md:w-auto snap-start bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-purple-500/10 rounded-lg">
                                <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <p className="text-text-secondary dark:text-text-darkSecondary text-xs">Categories</p>
                        </div>
                        <p className="text-xl font-bold text-text dark:text-text-dark">{stats.categories}</p>
                    </div>
                </div>
            </div>

            {/* Main Layout */}
            <div className="grid lg:grid-cols-4 gap-6">
                {/* Desktop Filter Sidebar */}
                <div className="hidden lg:block lg:col-span-1">
                    <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark
            rounded-xl p-6 sticky top-24 space-y-6">
                        <div className="flex items-center justify-between">
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
                                    Type
                                </label>
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target. value)}
                                    className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
                    bg-background dark:bg-background-dark text-text dark:text-text-dark
                    focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                                >
                                    <option value="">All Types</option>
                                    {noteTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg hover:bg-background
                dark:hover:bg-background-dark transition-colors">
                                <input
                                    type="checkbox"
                                    checked={showPinnedOnly}
                                    onChange={(e) => setShowPinnedOnly(e.target. checked)}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm text-text dark:text-text-dark">Show pinned only</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg hover:bg-background
                dark:hover:bg-background-dark transition-colors">
                                <input
                                    type="checkbox"
                                    checked={showFavoritesOnly}
                                    onChange={(e) => setShowFavoritesOnly(e. target.checked)}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm text-text dark:text-text-dark">Show favorites only</span>
                            </label>

                            {hasActiveFilters && (
                                <div className="pt-3 border-t border-border dark:border-border-dark">
                                    <p className="text-xs text-text-secondary dark:text-text-darkSecondary">
                                        {activeFilterCount} active filter(s)
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Top Tags Cloud */}
                        {topTags.length > 0 && (
                            <div className="pt-6 border-t border-border dark:border-border-dark">
                                <h4 className="text-sm font-semibold text-text dark:text-text-dark mb-3 flex items-center gap-2">
                                    <TagIcon className="w-4 h-4" />
                                    Top Tags
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {topTags.map(([tag, count]) => (
                                        <button
                                            key={tag}
                                            onClick={() => setSearchTerm(tag)}
                                            className="px-2 py-1 bg-primary/10 text-primary dark:text-primary-dark rounded text-xs
                        hover:bg-primary/20 transition-colors"
                                        >
                                            #{tag} ({count})
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Notes Grid */}
                <div className="lg:col-span-3">
                    {filteredNotes.length > 0 ? (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm text-text-secondary dark:text-text-darkSecondary">
                                    {filteredNotes. length} of {notes.length} notes
                                </p>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2 md:gap-6">
                                {filteredNotes.map(note => (
                                    <NoteCard
                                        key={note.id}
                                        note={note}
                                        onDelete={handleNoteDeleted}
                                        onTogglePin={() => handleTogglePin(note. id, note.is_pinned)}
                                        onToggleFavorite={() => handleToggleFavorite(note.id, note.is_favorite)}
                                    />
                                ))}
                            </div>
                        </>
                    ) : notes.length === 0 ? (
                        <div className="text-center py-12 bg-cardBg dark:bg-cardBg-dark border-2 border-dashed
              border-border dark:border-border-dark rounded-xl">
                            <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary-dark/10
                flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="w-8 h-8 text-primary dark:text-primary-dark" />
                            </div>
                            <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-2">
                                No notes yet
                            </h3>
                            <p className="text-text-secondary dark:text-text-darkSecondary mb-6 text-sm px-4">
                                Start building your knowledge base with your first note
                            </p>
                            <Link href="/notes/new">
                                <Button variant="primary" className="inline-flex items-center gap-2">
                                    <Plus className="w-5 h-5" />
                                    Create Your First Note
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