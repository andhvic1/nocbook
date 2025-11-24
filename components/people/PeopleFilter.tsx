'use client'

import { Search, X } from 'lucide-react'

interface PeopleFilterProps {
    searchTerm: string
    setSearchTerm: (value: string) => void
    selectedRole: string
    setSelectedRole: (value: string) => void
    selectedTag: string
    setSelectedTag: (value: string) => void
    roles: string[]
    tags: string[]
}

export function PeopleFilter({
                                 searchTerm,
                                 setSearchTerm,
                                 selectedRole,
                                 setSelectedRole,
                                 selectedTag,
                                 setSelectedTag,
                                 roles,
                                 tags
                             }: PeopleFilterProps) {
    const clearFilters = () => {
        setSearchTerm('')
        setSelectedRole('')
        setSelectedTag('')
    }

    const hasActiveFilters = searchTerm || selectedRole || selectedTag

    return (
        <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-4 md:p-6 sticky top-20 lg:top-24">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base md:text-lg font-semibold text-text dark:text-text-dark">
                    Filter & Search
                </h3>
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="text-xs md:text-sm text-text-secondary dark:text-text-darkSecondary hover:text-primary
              dark:hover:text-primary-dark transition-colors flex items-center gap-1"
                    >
                        <X className="w-3 h-3 md:w-4 md:h-4" />
                        Clear
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-text-secondary dark:text-text-darkSecondary" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 md:pl-10 pr-4 py-2 text-sm md:text-base rounded-lg border-2 border-border dark:border-border-dark
              bg-background dark:bg-background-dark text-text dark:text-text-dark
              focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors
              placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary"
                    />
                </div>

                {/* Role Filter */}
                <div>
                    <label className="block text-xs md:text-sm font-medium text-text dark:text-text-dark mb-2">
                        Role
                    </label>
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full px-3 md:px-4 py-2 text-sm md:text-base rounded-lg border-2 border-border dark:border-border-dark
              bg-background dark:bg-background-dark text-text dark:text-text-dark
              focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                    >
                        <option value="">All Roles</option>
                        {roles.map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                </div>

                {/* Tag Filter */}
                <div>
                    <label className="block text-xs md:text-sm font-medium text-text dark:text-text-dark mb-2">
                        Tag
                    </label>
                    <select
                        value={selectedTag}
                        onChange={(e) => setSelectedTag(e.target.value)}
                        className="w-full px-3 md:px-4 py-2 text-sm md:text-base rounded-lg border-2 border-border dark:border-border-dark
              bg-background dark:bg-background-dark text-text dark:text-text-dark
              focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                    >
                        <option value="">All Tags</option>
                        {tags.map(tag => (
                            <option key={tag} value={tag}>{tag}</option>
                        ))}
                    </select>
                </div>

                {/* Active Filters Count */}
                {hasActiveFilters && (
                    <div className="pt-3 border-t border-border dark:border-border-dark">
                        <p className="text-xs text-text-secondary dark:text-text-darkSecondary">
                            {[searchTerm, selectedRole, selectedTag].filter(Boolean).length} active filter(s)
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}