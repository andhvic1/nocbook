'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase'
import { PeopleCard } from '@/components/people/PeopleCard'
import { Button } from '@/components/ui/Button'
import { Plus, Users as UsersIcon, Search, Filter, X } from 'lucide-react'
import Link from 'next/link'
import type { Person } from '@/types'

export default function PeoplePage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [people, setPeople] = useState<Person[]>([])
    const [filteredPeople, setFilteredPeople] = useState<Person[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedRole, setSelectedRole] = useState('')
    const [selectedTag, setSelectedTag] = useState('')
    const [showMobileFilters, setShowMobileFilters] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login')
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (user) {
            fetchPeople()
        }
    }, [user])

    useEffect(() => {
        filterPeople()
    }, [people, searchTerm, selectedRole, selectedTag])

    const fetchPeople = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('people')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setPeople(data || [])
        } catch (error) {
            console.error('Error fetching people:', error)
        } finally {
            setLoading(false)
        }
    }

    const filterPeople = () => {
        let filtered = [...people]

        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(person =>
                person.name.toLowerCase().includes(term) ||
                person.profession?.toLowerCase().includes(term) ||
                person.skills?.some(skill => skill.toLowerCase().includes(term)) ||
                person.tags?.some(tag => tag.toLowerCase().includes(term))
            )
        }

        if (selectedRole) {
            filtered = filtered.filter(person => person.role === selectedRole)
        }

        if (selectedTag) {
            filtered = filtered.filter(person => person.tags?.includes(selectedTag))
        }

        setFilteredPeople(filtered)
    }

    const handlePersonDeleted = () => {
        fetchPeople()
    }

    const clearFilters = () => {
        setSearchTerm('')
        setSelectedRole('')
        setSelectedTag('')
        setShowMobileFilters(false)
    }

    const roles = Array.from(new Set(people.map(p => p.role).filter(Boolean))) as string[]
    const tags = Array.from(new Set(people.flatMap(p => p.tags || [])))
    const hasActiveFilters = searchTerm || selectedRole || selectedTag
    const activeFilterCount = [searchTerm, selectedRole, selectedTag].filter(Boolean).length

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-primary-dark mx-auto mb-4"></div>
                    <p className="text-text-secondary dark:text-text-darkSecondary">Loading people...</p>
                </div>
            </div>
        )
    }

    if (!user) return null

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl md:text-3xl font-bold text-text dark:text-text-dark mb-1">
                            People Database
                        </h1>
                        <p className="text-text-secondary dark:text-text-darkSecondary text-sm">
                            {people.length} {people.length === 1 ? 'person' : 'people'} in your network
                        </p>
                    </div>
                    <Link href="/people/new" className="flex-shrink-0">
                        <Button variant="primary" size="sm" className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Add Person</span>
                        </Button>
                    </Link>
                </div>

                {/* Mobile: Compact Search + Filter Button */}
                <div className="lg:hidden flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary dark:text-text-darkSecondary" />
                        <input
                            type="text"
                            placeholder="Search people..."
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
                                Role
                            </label>
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border-2 border-border dark:border-border-dark
                  bg-background dark:bg-background-dark text-text dark:text-text-dark
                  focus:outline-none focus:border-primary dark:focus:border-primary-dark"
                            >
                                <option value="">All Roles</option>
                                {roles.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-text dark:text-text-dark mb-1">
                                Tag
                            </label>
                            <select
                                value={selectedTag}
                                onChange={(e) => setSelectedTag(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border-2 border-border dark:border-border-dark
                  bg-background dark:bg-background-dark text-text dark:text-text-dark
                  focus:outline-none focus:border-primary dark:focus:border-primary-dark"
                            >
                                <option value="">All Tags</option>
                                {tags.map(tag => (
                                    <option key={tag} value={tag}>{tag}</option>
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

            {/* Desktop: Stats (Hidden on Mobile) */}
            <div className="hidden md:grid grid-cols-3 gap-4">
                <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-4">
                    <p className="text-text-secondary dark:text-text-darkSecondary text-sm mb-1">Total People</p>
                    <p className="text-3xl font-bold text-text dark:text-text-dark">{people.length}</p>
                </div>
                <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-4">
                    <p className="text-text-secondary dark:text-text-darkSecondary text-sm mb-1">Roles</p>
                    <p className="text-3xl font-bold text-text dark:text-text-dark">{roles.length}</p>
                </div>
                <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-4">
                    <p className="text-text-secondary dark:text-text-darkSecondary text-sm mb-1">Tags</p>
                    <p className="text-3xl font-bold text-text dark:text-text-dark">{tags.length}</p>
                </div>
            </div>

            {/* Desktop: Layout with Sidebar */}
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
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
                    bg-background dark:bg-background-dark text-text dark:text-text-dark
                    focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors
                    placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                                    Role
                                </label>
                                <select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
                    bg-background dark:bg-background-dark text-text dark:text-text-dark
                    focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                                >
                                    <option value="">All Roles</option>
                                    {roles.map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                                    Tag
                                </label>
                                <select
                                    value={selectedTag}
                                    onChange={(e) => setSelectedTag(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
                    bg-background dark:bg-background-dark text-text dark:text-text-dark
                    focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                                >
                                    <option value="">All Tags</option>
                                    {tags.map(tag => (
                                        <option key={tag} value={tag}>{tag}</option>
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

                {/* People Grid */}
                <div className="lg:col-span-3">
                    {filteredPeople.length > 0 ? (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm text-text-secondary dark:text-text-darkSecondary">
                                    {filteredPeople.length} of {people.length} people
                                </p>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2 md:gap-6">
                                {filteredPeople.map(person => (
                                    <PeopleCard
                                        key={person.id}
                                        person={person}
                                        onDelete={handlePersonDeleted}
                                    />
                                ))}
                            </div>
                        </>
                    ) : people.length === 0 ? (
                        <div className="text-center py-12 bg-cardBg dark:bg-cardBg-dark border-2 border-dashed
              border-border dark:border-border-dark rounded-xl">
                            <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary-dark/10
                flex items-center justify-center mx-auto mb-4">
                                <UsersIcon className="w-8 h-8 text-primary dark:text-primary-dark" />
                            </div>
                            <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-2">
                                No people yet
                            </h3>
                            <p className="text-text-secondary dark:text-text-darkSecondary mb-6 text-sm px-4">
                                Start building your network by adding your first person
                            </p>
                            <Link href="/people/new">
                                <Button variant="primary" className="inline-flex items-center gap-2">
                                    <Plus className="w-5 h-5" />
                                    Add Your First Person
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-cardBg dark:bg-cardBg-dark border-2 border-dashed
              border-border dark:border-border-dark rounded-xl">
                            <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary-dark/10
                flex items-center justify-center mx-auto mb-4">
                                <UsersIcon className="w-8 h-8 text-text-secondary dark:text-text-darkSecondary" />
                            </div>
                            <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-2">
                                No results found
                            </h3>
                            <p className="text-text-secondary dark:text-text-darkSecondary text-sm px-4">
                                Try adjusting your filters or search term
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}