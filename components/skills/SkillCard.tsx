'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Skill } from '@/types'
import {
    Trash2,
    MoreVertical,
    Eye,
    Edit,
    ExternalLink,
    BookOpen,
    Youtube,
    FileText,
    Star,
    TrendingUp,
    Calendar,
    Clock,
    Zap,
    AlertTriangle,
    Flame
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface SkillCardProps {
    skill: Skill
    onDelete: () => void
}

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
    'web': 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    'mobile': 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    'iot': 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    'ai': 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
    'devops': 'bg-red-500/10 text-red-600 dark:text-red-400',
    'data': 'bg-green-500/10 text-green-600 dark:text-green-400',
    'embedded': 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    'design': 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    'soft-skill': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
}

const resourceIcons: Record<string, any> = {
    youtube: Youtube,
    course: BookOpen,
    documentation: FileText,
    article: FileText,
    book: BookOpen,
    other: ExternalLink,
}

export function SkillCard({ skill, onDelete }: SkillCardProps) {
    const [showMenu, setShowMenu] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const levelColor = levelConfig[skill.level]?.color || 'text-gray-600'
    const levelBgColor = levelConfig[skill.level]?.bgColor || 'bg-gray-500/10'
    const levelLabel = levelConfig[skill.level]?.label || skill.level

    const DifficultyIcon = difficultyConfig[skill.difficulty]?.icon || Zap
    const difficultyColor = difficultyConfig[skill.difficulty]?.color || 'text-gray-600'
    const difficultyBgColor = difficultyConfig[skill.difficulty]?.bgColor || 'bg-gray-500/10'
    const difficultyLabel = difficultyConfig[skill. difficulty]?.label || skill.difficulty

    const handleDelete = async () => {
        setDeleting(true)
        try {
            const response = await fetch(`/skills/${skill.id}`, {
                method: 'DELETE',
            })

            if (! response.ok) throw new Error('Failed to delete')
            onDelete()
        } catch (error) {
            alert('Failed to delete skill')
        } finally {
            setDeleting(false)
            setShowDeleteConfirm(false)
        }
    }

    const daysSincePracticed = skill.last_practiced
        ? Math.floor((new Date().getTime() - new Date(skill.last_practiced).getTime()) / (1000 * 60 * 60 * 24))
        : null

    return (
        <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6
      hover:border-primary dark:hover:border-primary-dark transition-all duration-200 group relative">

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                    <Link href={`/skills/${skill. id}`}>
                        <h3 className="text-lg font-semibold text-text dark:text-text-dark hover:text-primary
              dark:hover:text-primary-dark transition-colors mb-2 line-clamp-1 cursor-pointer">
                            {skill. name}
                            {skill.is_featured && (
                                <Star className="inline-block w-4 h-4 ml-2 text-yellow-500 fill-yellow-500" />
                            )}
                        </h3>
                    </Link>
                    <div className="flex flex-wrap gap-2 mb-3">
            <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                categoryColors[skill.category] || categoryColors['web']
            }`}>
              {skill.category}
            </span>
                        <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-500/10 text-gray-600 dark:text-gray-400">
              {skill.skill_type}
            </span>
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
                                    href={`/skills/${skill.id}`}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-background dark:hover:bg-background-dark
                    text-text dark:text-text-dark transition-colors"
                                    onClick={() => setShowMenu(false)}
                                >
                                    <Eye className="w-4 h-4" />
                                    <span className="text-sm">View Details</span>
                                </Link>
                                <Link
                                    href={`/skills/${skill.id}`}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-background dark:hover:bg-background-dark
                    text-text dark:text-text-dark transition-colors"
                                    onClick={() => setShowMenu(false)}
                                >
                                    <Edit className="w-4 h-4" />
                                    <span className="text-sm">Edit Skill</span>
                                </Link>
                                <div className="border-t border-border dark:border-border-dark" />
                                <button
                                    onClick={() => {
                                        setShowMenu(false)
                                        setShowDeleteConfirm(true)
                                    }}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-950
                    text-red-600 dark:text-red-400 transition-colors w-full"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span className="text-sm">Delete Skill</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Description */}
            {skill.description && (
                <p className="text-sm text-text-secondary dark:text-text-darkSecondary mb-4 line-clamp-2">
                    {skill.description}
                </p>
            )}

            {/* Level & Difficulty Badges */}
            <div className="flex gap-2 mb-4">
                <div className={`flex items-center gap-1. 5 px-3 py-1. 5 rounded-lg ${levelBgColor}`}>
          <span className={`text-xs font-medium ${levelColor}`}>
            Level: {levelLabel}
          </span>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${difficultyBgColor}`}>
                    <DifficultyIcon className={`w-3. 5 h-3.5 ${difficultyColor}`} />
                    <span className={`text-xs font-medium ${difficultyColor}`}>
            {difficultyLabel}
          </span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-text dark:text-text-dark flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Progress
          </span>
                    <span className="text-sm font-semibold text-text dark:text-text-dark">
            {skill.progress}%
          </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                            skill.progress === 100
                                ? 'bg-green-500'
                                : 'bg-primary dark:bg-primary-dark'
                        }`}
                        style={{ width: `${skill.progress}%` }}
                    />
                </div>
            </div>

            {/* Practice Hours */}
            {skill.practice_hours > 0 && (
                <div className="mb-4 p-3 bg-primary/5 dark:bg-primary-dark/5 rounded-lg border border-primary/20 dark:border-primary-dark/20">
                    <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text dark:text-text-dark flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary dark:text-primary-dark" />
              Practice Time
            </span>
                        <span className="text-lg font-bold text-primary dark:text-primary-dark">
              {skill.practice_hours}h
            </span>
                    </div>
                </div>
            )}

            {/* Resources */}
            {skill.resources && skill.resources.length > 0 && (
                <div className="mb-4">
                    <p className="text-xs text-text-secondary dark:text-text-darkSecondary mb-2">
                        Resources ({skill.resources.length})
                    </p>
                    <div className="flex flex-wrap gap-1">
                        {skill.resources. slice(0, 3).map((resource, index) => {
                            const Icon = resourceIcons[resource.type] || ExternalLink
                            return (
                                <a
                                    key={index}
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2 py-1 bg-background dark:bg-background-dark rounded text-xs
                    text-text-secondary dark:text-text-darkSecondary hover:text-primary
                    dark:hover:text-primary-dark transition-colors flex items-center gap-1"
                                    onClick={(e) => e.stopPropagation()}
                                    title={resource.title}
                                >
                                    <Icon className="w-3 h-3" />
                                    <span className="max-w-[100px] truncate">{resource. title}</span>
                                </a>
                            )
                        })}
                        {skill.resources.length > 3 && (
                            <span className="px-2 py-1 text-xs text-text-secondary dark:text-text-darkSecondary">
                +{skill.resources.length - 3}
              </span>
                        )}
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-border dark:border-border-dark">
                <div className="flex items-center gap-4">
                    {/* Learning Since */}
                    {skill.learning_since && (
                        <div className="flex items-center gap-1 text-xs text-text-secondary dark:text-text-darkSecondary">
                            <Calendar className="w-3 h-3" />
                            <span>Since {new Date(skill.learning_since). getFullYear()}</span>
                        </div>
                    )}

                    {/* Last Practiced */}
                    {daysSincePracticed !== null && (
                        <div className={`flex items-center gap-1 text-xs ${
                            daysSincePracticed > 30
                                ? 'text-orange-600 dark:text-orange-400'
                                : 'text-text-secondary dark:text-text-darkSecondary'
                        }`}>
                            <TrendingUp className="w-3 h-3" />
                            <span>
                {daysSincePracticed === 0
                    ? 'Today'
                    : `${daysSincePracticed}d ago`
                }
              </span>
                        </div>
                    )}
                </div>

                {/* Projects Count */}
                {skill.projects_count > 0 && (
                    <div className="text-xs text-text-secondary dark:text-text-darkSecondary">
                        {skill.projects_count} {skill.projects_count === 1 ? 'project' : 'projects'}
                    </div>
                )}
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