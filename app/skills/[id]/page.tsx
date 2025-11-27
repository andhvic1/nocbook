'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase'
import { SkillForm } from '@/components/skills/SkillForm'
import { Button } from '@/components/ui/Button'
import { Skill } from '@/types'
import {
    ArrowLeft,
    Edit,
    Trash2,
    Calendar,
    Clock,
    TrendingUp,
    BookOpen,
    Tag,
    FileText,
    Star,
    Zap,
    AlertTriangle,
    Flame,
    ExternalLink,
    Youtube
} from 'lucide-react'
import Link from 'next/link'

const levelConfig: Record<string, { color: string; bgColor: string; label: string }> = {
    beginner: {
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-500/10',
        label: 'Beginner'
    },
    intermediate: {
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        label: 'Intermediate'
    },
    advanced: {
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-500/10',
        label: 'Advanced'
    },
    expert: {
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-500/10',
        label: 'Expert'
    },
}

const difficultyConfig: Record<string, { icon: any; color: string; bgColor: string; label: string }> = {
    easy: {
        icon: Zap,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-500/10',
        label: 'Easy'
    },
    medium: {
        icon: AlertTriangle,
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        label: 'Medium'
    },
    hard: {
        icon: Flame,
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-500/10',
        label: 'Hard'
    },
    insane: {
        icon: Flame,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-500/10',
        label: 'Insane'
    },
}

const categoryColors: Record<string, string> = {
    'web': 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    'mobile': 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    'iot': 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    'ai': 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
    'devops': 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    'data': 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    'embedded': 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
    'design': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    'soft-skill': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
}

const resourceIcons: Record<string, any> = {
    youtube: Youtube,
    course: BookOpen,
    documentation: FileText,
    article: FileText,
    book: BookOpen,
    other: ExternalLink,
}

export default function SkillDetailPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const params = useParams()
    const skillId = params.id as string

    const [skill, setSkill] = useState<Skill | null>(null)
    const [loading, setLoading] = useState(true)
    const [editMode, setEditMode] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        if (!  authLoading && !user) {
            router.push('/login')
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (user && skillId) {
            fetchSkill()
        }
    }, [user, skillId])

    const fetchSkill = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('skills')
                .select('*')
                .eq('id', skillId)
                .single()

            if (error) throw error
            setSkill(data)
        } catch (error) {
            console.error('Error fetching skill:', error)
            router.push('/skills')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        setDeleting(true)
        try {
            const { error } = await supabase
                .from('skills')
                .delete()
                .eq('id', skillId)

            if (error) throw error
            router.push('/skills')
        } catch (error) {
            console.error('Error deleting skill:', error)
            alert('Failed to delete skill')
        } finally {
            setDeleting(false)
            setShowDeleteConfirm(false)
        }
    }

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-primary-dark mx-auto mb-4"></div>
                    <p className="text-text-secondary dark:text-text-darkSecondary">Loading skill...</p>
                </div>
            </div>
        )
    }

    if (!  user || ! skill) return null

    const levelColor = levelConfig[skill.level]?.color || 'text-gray-600'
    const levelBgColor = levelConfig[skill. level]?.bgColor || 'bg-gray-500/10'
    const levelLabel = levelConfig[skill.level]?.label || skill.level

    const DifficultyIcon = difficultyConfig[skill.difficulty]?.icon || Zap
    const difficultyColor = difficultyConfig[skill.difficulty]?.color || 'text-gray-600'
    const difficultyBgColor = difficultyConfig[skill.difficulty]?.bgColor || 'bg-gray-500/10'
    const difficultyLabel = difficultyConfig[skill. difficulty]?.label || skill.difficulty

    const daysSincePracticed = skill. last_practiced
        ? Math.floor((new Date(). getTime() - new Date(skill.last_practiced).getTime()) / (1000 * 60 * 60 * 24))
        : null

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
                                Edit Skill
                            </h1>
                            <p className="text-text-secondary dark:text-text-darkSecondary text-sm mt-1">
                                Update your skill details
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6 md:p-8">
                    <SkillForm skill={skill} />
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
                        href="/skills"
                        className="p-2 hover:bg-cardBg dark:hover:bg-cardBg-dark rounded-lg transition-colors flex-shrink-0"
                    >
                        <ArrowLeft className="w-5 h-5 text-text dark:text-text-dark" />
                    </Link>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl md:text-3xl font-bold text-text dark:text-text-dark mb-3">
                            {skill.name}
                            {skill.is_featured && (
                                <Star className="inline-block w-6 h-6 ml-2 text-yellow-500 fill-yellow-500" />
                            )}
                        </h1>
                        <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${
                  categoryColors[skill.category] || categoryColors['web']
              }`}>
                {skill.category}
              </span>
                            <span className="px-3 py-1 rounded-lg text-sm font-medium bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20">
                {skill.skill_type}
              </span>
                            <span className={`px-3 py-1 rounded-lg text-sm font-medium ${levelBgColor} ${levelColor}`}>
                Level: {levelLabel}
              </span>
                            <span className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-2 ${difficultyBgColor} ${difficultyColor}`}>
                <DifficultyIcon className="w-4 h-4" />
                                {difficultyLabel}
              </span>
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
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    {skill.description && (
                        <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-3 flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Description
                            </h2>
                            <p className="text-text-secondary dark:text-text-darkSecondary whitespace-pre-wrap">
                                {skill.description}
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
                            <span className="text-2xl font-bold text-text dark:text-text-dark">
                {skill.progress}%
              </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
                            <div
                                className={`h-4 rounded-full transition-all duration-300 flex items-center justify-end pr-2 ${
                                    skill.progress === 100
                                        ? 'bg-green-500'
                                        : 'bg-primary dark:bg-primary-dark'
                                }`}
                                style={{ width: `${skill. progress}%` }}
                            >
                                {skill.progress > 10 && (
                                    <span className="text-xs font-semibold text-white">
                    {skill.progress}%
                  </span>
                                )}
                            </div>
                        </div>
                        {skill.progress === 100 && (
                            <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-2">
                                🎉 Mastered!
                            </p>
                        )}
                    </div>

                    {/* Practice Hours - HIGHLIGHT!    */}
                    {skill.practice_hours > 0 && (
                        <div className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary-dark/10 dark:to-primary-dark/5
              border-2 border-primary/20 dark:border-primary-dark/20 rounded-xl p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-1 flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-primary dark:text-primary-dark" />
                                        Practice Time
                                    </h2>
                                    <p className="text-sm text-text-secondary dark:text-text-darkSecondary">
                                        Total hours invested
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-4xl font-bold text-primary dark:text-primary-dark">
                                        {skill.practice_hours}
                                    </p>
                                    <p className="text-sm text-text-secondary dark:text-text-darkSecondary">
                                        hours
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Learning Resources */}
                    {skill.resources && skill.resources.length > 0 && (
                        <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-4 flex items-center gap-2">
                                <BookOpen className="w-5 h-5" />
                                Learning Resources ({skill.resources.length})
                            </h2>
                            <div className="space-y-3">
                                {skill.resources.map((resource, index) => {
                                    const Icon = resourceIcons[resource.type] || ExternalLink
                                    return (
                                        <a
                                            key={index}
                                            href={resource.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-start gap-3 p-4 bg-background dark:bg-background-dark rounded-lg
                        hover:bg-primary/5 dark:hover:bg-primary-dark/5 border border-border dark:border-border-dark
                        hover:border-primary/50 dark:hover:border-primary-dark/50 transition-all group"
                                        >
                                            <Icon className="w-5 h-5 text-text-secondary dark:text-text-darkSecondary
                        group-hover:text-primary dark:group-hover:text-primary-dark transition-colors flex-shrink-0 mt-0.  5" />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-text dark:text-text-dark group-hover:text-primary
                          dark:group-hover:text-primary-dark transition-colors">
                                                    {resource. title}
                                                </p>
                                                <p className="text-xs text-text-secondary dark:text-text-darkSecondary mt-1 truncate">
                                                    {resource. url}
                                                </p>
                                                <span className="inline-block mt-2 px-2 py-0.5 bg-background dark:bg-cardBg-dark rounded text-xs
                          text-text-secondary dark:text-text-darkSecondary">
                          {resource.type}
                        </span>
                                            </div>
                                            <ExternalLink className="w-4 h-4 text-text-secondary dark:text-text-darkSecondary flex-shrink-0" />
                                        </a>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    {skill.tags && skill.tags. length > 0 && (
                        <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-3 flex items-center gap-2">
                                <Tag className="w-5 h-5" />
                                Tags
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {skill. tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1.  5 bg-primary/10 text-primary dark:text-primary-dark rounded-full text-sm font-medium"
                                    >
                    {tag}
                  </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    {skill.notes && (
                        <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-3 flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Notes
                            </h2>
                            <p className="text-text-secondary dark:text-text-darkSecondary whitespace-pre-wrap">
                                {skill.notes}
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Column - Metadata */}
                <div className="space-y-6">
                    {/* Timeline */}
                    <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Timeline
                        </h2>
                        <div className="space-y-3">
                            {skill.learning_since && (
                                <div>
                                    <p className="text-xs text-text-secondary dark:text-text-darkSecondary mb-1">Learning Since</p>
                                    <p className="text-sm text-text dark:text-text-dark font-medium">
                                        {new Date(skill.learning_since). toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            )}
                            {skill.last_practiced && (
                                <div>
                                    <p className="text-xs text-text-secondary dark:text-text-darkSecondary mb-1">Last Practiced</p>
                                    <p className={`text-sm font-medium ${
                                        daysSincePracticed && daysSincePracticed > 30
                                            ? 'text-orange-600 dark:text-orange-400'
                                            : 'text-text dark:text-text-dark'
                                    }`}>
                                        {new Date(skill.last_practiced).  toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                        {daysSincePracticed !== null && (
                                            <span className="block text-xs mt-1">
                        ({daysSincePracticed === 0 ? 'Today' : `${daysSincePracticed} days ago`})
                      </span>
                                        )}
                                    </p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs text-text-secondary dark:text-text-darkSecondary mb-1">Added</p>
                                <p className="text-sm text-text dark:text-text-dark font-medium">
                                    {new Date(skill.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Projects Using This Skill */}
                    {skill.projects_count > 0 && (
                        <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-3">
                                Projects
                            </h2>
                            <div className="text-center py-4">
                                <p className="text-4xl font-bold text-primary dark:text-primary-dark mb-2">
                                    {skill.projects_count}
                                </p>
                                <p className="text-sm text-text-secondary dark:text-text-darkSecondary">
                                    {skill.projects_count === 1 ? 'project uses' : 'projects use'} this skill
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Quick Stats */}
                    <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-4">
                            Quick Stats
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-text-secondary dark:text-text-darkSecondary">Level</span>
                                <span className={`text-sm font-medium ${levelColor}`}>{levelLabel}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-text-secondary dark:text-text-darkSecondary">Difficulty</span>
                                <span className={`text-sm font-medium ${difficultyColor}`}>{difficultyLabel}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-text-secondary dark:text-text-darkSecondary">Progress</span>
                                <span className="text-sm font-medium text-text dark:text-text-dark">{skill.progress}%</span>
                            </div>
                            {skill.practice_hours > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-text-secondary dark:text-text-darkSecondary">Practice Hours</span>
                                    <span className="text-sm font-medium text-primary dark:text-primary-dark">{skill.practice_hours}h</span>
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
                            Delete Skill?
                        </h3>
                        <p className="text-text-secondary dark:text-text-darkSecondary mb-6">
                            Are you sure you want to delete "{skill.name}"? This action cannot be undone.
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