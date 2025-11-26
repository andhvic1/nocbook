'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase'
import { SkillCard } from '@/components/skills/SkillCard'
import { Button } from '@/components/ui/Button'
import { Skill } from '@/types'
import {
    Plus,
    Search,
    Filter,
    X,
    Brain,
    TrendingUp,
    Clock,
    Target,
    Zap
} from 'lucide-react'
import Link from 'next/link'

export default function SkillsPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [skills, setSkills] = useState<Skill[]>([])
    const [filteredSkills, setFilteredSkills] = useState<Skill[]>([])
    const [loading, setLoading] = useState(true)

    // Filters
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    const [selectedType, setSelectedType] = useState('')
    const [selectedLevel, setSelectedLevel] = useState('')
    const [selectedDifficulty, setSelectedDifficulty] = useState('')
    const [showMobileFilters, setShowMobileFilters] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        if (! authLoading && !user) {
            router.push('/login')
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (user) {
            fetchSkills()
        }
    }, [user])

    useEffect(() => {
        filterSkills()
    }, [skills, searchTerm, selectedCategory, selectedType, selectedLevel, selectedDifficulty])

    const fetchSkills = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('skills')
                . select('*')
                .order('is_featured', { ascending: false })
                .order('practice_hours', { ascending: false })

            if (error) throw error
            setSkills(data || [])
        } catch (error) {
            console.error('Error fetching skills:', error)
        } finally {
            setLoading(false)
        }
    }

    const filterSkills = () => {
        let filtered = [... skills]

        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(skill =>
                skill.name.toLowerCase().includes(term) ||
                skill.description?. toLowerCase().includes(term) ||
                skill.tags?.some(tag => tag.toLowerCase().includes(term))
            )
        }

        if (selectedCategory) {
            filtered = filtered.filter(skill => skill.category === selectedCategory)
        }

        if (selectedType) {
            filtered = filtered.filter(skill => skill.skill_type === selectedType)
        }

        if (selectedLevel) {
            filtered = filtered.filter(skill => skill.level === selectedLevel)
        }

        if (selectedDifficulty) {
            filtered = filtered.filter(skill => skill.difficulty === selectedDifficulty)
        }

        setFilteredSkills(filtered)
    }

    const handleSkillDeleted = () => {
        fetchSkills()
    }

    const clearFilters = () => {
        setSearchTerm('')
        setSelectedCategory('')
        setSelectedType('')
        setSelectedLevel('')
        setSelectedDifficulty('')
        setShowMobileFilters(false)
    }

    // Statistics - THE GOOD STUFF!
    const stats = {
        total: skills.length,
        totalHours: skills.reduce((sum, s) => sum + s.practice_hours, 0),
        avgProgress: skills.length > 0
            ? Math.round(skills.reduce((sum, s) => sum + s.progress, 0) / skills.length)
            : 0,
        expertCount: skills.filter(s => s.level === 'expert').length,
        inProgress: skills.filter(s => s.progress > 0 && s.progress < 100). length,
    }

    const categories = Array.from(new Set(skills. map(s => s.category)))
    const types = Array.from(new Set(skills.map(s => s.skill_type)))
    const levels = Array.from(new Set(skills.map(s => s.level)))
    const difficulties = Array.from(new Set(skills.map(s => s.difficulty)))
    const hasActiveFilters = searchTerm || selectedCategory || selectedType || selectedLevel || selectedDifficulty
    const activeFilterCount = [searchTerm, selectedCategory, selectedType, selectedLevel, selectedDifficulty].filter(Boolean).length

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-primary-dark mx-auto mb-4"></div>
                    <p className="text-text-secondary dark:text-text-darkSecondary">Loading skills...</p>
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
                            Skills Tracker
                        </h1>
                        <p className="text-text-secondary dark:text-text-darkSecondary text-sm">
                            {skills.length} {skills.length === 1 ?  'skill' : 'skills'} • {stats.totalHours} hours practiced
                        </p>
                    </div>
                    <Link href="/skills/new" className="flex-shrink-0">
                        <Button variant="primary" size="sm" className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Add Skill</span>
                        </Button>
                    </Link>
                </div>

                {/* Mobile: Compact Search + Filter Button */}
                <div className="lg:hidden flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary dark:text-text-darkSecondary" />
                        <input
                            type="text"
                            placeholder="Search skills..."
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
                                onChange={(e) => setSelectedCategory(e. target.value)}
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
                                onChange={(e) => setSelectedType(e. target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border-2 border-border dark:border-border-dark
                  bg-background dark:bg-background-dark text-text dark:text-text-dark
                  focus:outline-none focus:border-primary dark:focus:border-primary-dark"
                            >
                                <option value="">All Types</option>
                                {types. map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-text dark:text-text-dark mb-1">
                                Level
                            </label>
                            <select
                                value={selectedLevel}
                                onChange={(e) => setSelectedLevel(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border-2 border-border dark:border-border-dark
                  bg-background dark:bg-background-dark text-text dark:text-text-dark
                  focus:outline-none focus:border-primary dark:focus:border-primary-dark"
                            >
                                <option value="">All Levels</option>
                                {levels.map(level => (
                                    <option key={level} value={level}>{level}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-text dark:text-text-dark mb-1">
                                Difficulty
                            </label>
                            <select
                                value={selectedDifficulty}
                                onChange={(e) => setSelectedDifficulty(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border-2 border-border dark:border-border-dark
                  bg-background dark:bg-background-dark text-text dark:text-text-dark
                  focus:outline-none focus:border-primary dark:focus:border-primary-dark"
                            >
                                <option value="">All Difficulties</option>
                                {difficulties.map(diff => (
                                    <option key={diff} value={diff}>{diff}</option>
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
                                <Brain className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <p className="text-text-secondary dark:text-text-darkSecondary text-xs">Total</p>
                        </div>
                        <p className="text-xl md:text-2xl font-bold text-text dark:text-text-dark">{stats.total}</p>
                    </div>

                    <div className="flex-shrink-0 w-36 md:w-auto snap-start bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-3 md:p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 md:p-2 bg-purple-500/10 rounded-lg">
                                <Clock className="w-4 h-4 md:w-5 md:h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <p className="text-text-secondary dark:text-text-darkSecondary text-xs">Hours</p>
                        </div>
                        <p className="text-xl md:text-2xl font-bold text-text dark:text-text-dark">{stats.totalHours}h</p>
                    </div>

                    <div className="flex-shrink-0 w-36 md:w-auto snap-start bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-3 md:p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 md:p-2 bg-green-500/10 rounded-lg">
                                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <p className="text-text-secondary dark:text-text-darkSecondary text-xs">Avg Progress</p>
                        </div>
                        <p className="text-xl md:text-2xl font-bold text-text dark:text-text-dark">{stats.avgProgress}%</p>
                    </div>

                    <div className="flex-shrink-0 w-36 md:w-auto snap-start bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-3 md:p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 md:p-2 bg-orange-500/10 rounded-lg">
                                <Target className="w-4 h-4 md:w-5 md:h-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <p className="text-text-secondary dark:text-text-darkSecondary text-xs">Expert</p>
                        </div>
                        <p className="text-xl md:text-2xl font-bold text-text dark:text-text-dark">{stats.expertCount}</p>
                    </div>

                    <div className="flex-shrink-0 w-36 md:w-auto snap-start bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-3 md:p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 md:p-2 bg-yellow-500/10 rounded-lg">
                                <Zap className="w-4 h-4 md:w-5 md:h-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <p className="text-text-secondary dark:text-text-darkSecondary text-xs">Learning</p>
                        </div>
                        <p className="text-xl md:text-2xl font-bold text-text dark:text-text-dark">{stats. inProgress}</p>
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
                                    {types.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                                    Level
                                </label>
                                <select
                                    value={selectedLevel}
                                    onChange={(e) => setSelectedLevel(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
                    bg-background dark:bg-background-dark text-text dark:text-text-dark
                    focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                                >
                                    <option value="">All Levels</option>
                                    {levels.map(level => (
                                        <option key={level} value={level}>{level}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                                    Difficulty
                                </label>
                                <select
                                    value={selectedDifficulty}
                                    onChange={(e) => setSelectedDifficulty(e.target. value)}
                                    className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
                    bg-background dark:bg-background-dark text-text dark:text-text-dark
                    focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                                >
                                    <option value="">All Difficulties</option>
                                    {difficulties.map(diff => (
                                        <option key={diff} value={diff}>{diff}</option>
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

                {/* Skills Grid */}
                <div className="lg:col-span-3">
                    {filteredSkills.length > 0 ? (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm text-text-secondary dark:text-text-darkSecondary">
                                    {filteredSkills.length} of {skills.length} skills
                                </p>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2 md:gap-6">
                                {filteredSkills.map(skill => (
                                    <SkillCard
                                        key={skill.id}
                                        skill={skill}
                                        onDelete={handleSkillDeleted}
                                    />
                                ))}
                            </div>
                        </>
                    ) : skills.length === 0 ? (
                        <div className="text-center py-12 bg-cardBg dark:bg-cardBg-dark border-2 border-dashed
              border-border dark:border-border-dark rounded-xl">
                            <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary-dark/10
                flex items-center justify-center mx-auto mb-4">
                                <Brain className="w-8 h-8 text-primary dark:text-primary-dark" />
                            </div>
                            <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-2">
                                No skills yet
                            </h3>
                            <p className="text-text-secondary dark:text-text-darkSecondary mb-6 text-sm px-4">
                                Start tracking your learning journey and build your skill portfolio
                            </p>
                            <Link href="/skills/new">
                                <Button variant="primary" className="inline-flex items-center gap-2">
                                    <Plus className="w-5 h-5" />
                                    Add Your First Skill
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