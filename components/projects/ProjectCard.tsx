'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Project, Person } from '@/types'
import {
    Trash2,
    Calendar,
    Users,
    ExternalLink,
    Github,
    Clock,
    AlertCircle,
    CheckCircle2,
    Lightbulb,
    Pause,
    XCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ProjectCardProps {
    project: Project
    people: Person[]
    onDelete: () => void
}

const categoryColors: Record<string, string> = {
    school: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    competition: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    personal: 'bg-green-500/10 text-green-600 dark:text-green-400',
    client: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    startup: 'bg-red-500/10 text-red-600 dark:text-red-400',
    web: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    iot: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    ai: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
    mobile: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    api: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
}

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
    idea: { icon: Lightbulb, color: 'text-gray-500', label: 'Idea' },
    planning: { icon: Clock, color: 'text-blue-500', label: 'Planning' },
    'in-progress': { icon: AlertCircle, color: 'text-yellow-500', label: 'In Progress' },
    'on-hold': { icon: Pause, color: 'text-orange-500', label: 'On Hold' },
    completed: { icon: CheckCircle2, color: 'text-green-500', label: 'Completed' },
    cancelled: { icon: XCircle, color: 'text-red-500', label: 'Cancelled' },
}

const priorityColors: Record<string, string> = {
    low: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
    medium: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    high: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    urgent: 'bg-red-500/10 text-red-600 dark:text-red-400',
}

export function ProjectCard({ project, people, onDelete }: ProjectCardProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const StatusIcon = statusConfig[project.status]?. icon || AlertCircle
    const statusColor = statusConfig[project.status]?.color || 'text-gray-500'

    const teamMembers = people.filter(p => project.team_members?. includes(p.id))

    const isOverdue = project.deadline && new Date(project.deadline) < new Date() && project.status !== 'completed'

    const handleDelete = async () => {
        setDeleting(true)
        try {
            const response = await fetch(`/projects/${project.id}`, {
                method: 'DELETE',
            })

            if (! response.ok) throw new Error('Failed to delete')
            onDelete()
        } catch (error) {
            alert('Failed to delete project')
        } finally {
            setDeleting(false)
            setShowDeleteConfirm(false)
        }
    }

    return (
        <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6
      hover:border-primary dark:hover:border-primary-dark transition-all duration-200 group relative">

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                    <Link href={`/projects/${project. id}`}>
                        <h3 className="text-lg font-semibold text-text dark:text-text-dark hover:text-primary
              dark:hover:text-primary-dark transition-colors mb-2 line-clamp-2">
                            {project.title}
                        </h3>
                    </Link>
                    <div className="flex flex-wrap gap-2 mb-3">
            <span className={`px-2 py-1 rounded-md text-xs font-medium ${categoryColors[project.category]}`}>
              {project.category}
            </span>
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${priorityColors[project.priority]}`}>
              {project.priority}
            </span>
                    </div>
                </div>

                <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="ml-3 p-2 text-text-secondary dark:text-text-darkSecondary hover:text-red-600
            dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Description */}
            {project.description && (
                <p className="text-sm text-text-secondary dark:text-text-darkSecondary mb-4 line-clamp-2">
                    {project.description}
                </p>
            )}

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <StatusIcon className={`w-4 h-4 ${statusColor}`} />
                        <span className="text-sm font-medium text-text dark:text-text-dark">
              {statusConfig[project.status]?.label}
            </span>
                    </div>
                    <span className="text-sm font-semibold text-text dark:text-text-dark">
            {project.progress}%
          </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                        className="bg-primary dark:bg-primary-dark h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                    />
                </div>
            </div>

            {/* Tech Stack */}
            {project.tech_stack && project.tech_stack.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                    {project.tech_stack.slice(0, 4).map((tech, index) => (
                        <span
                            key={index}
                            className="px-2 py-1 bg-background dark:bg-background-dark rounded text-xs
                text-text-secondary dark:text-text-darkSecondary"
                        >
              {tech}
            </span>
                    ))}
                    {project.tech_stack.length > 4 && (
                        <span className="px-2 py-1 text-xs text-text-secondary dark:text-text-darkSecondary">
              +{project.tech_stack.length - 4}
            </span>
                    )}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-border dark:border-border-dark">
                <div className="flex items-center gap-4">
                    {/* Deadline */}
                    {project.deadline && (
                        <div className={`flex items-center gap-1 text-xs ${
                            isOverdue ? 'text-red-600 dark:text-red-400' : 'text-text-secondary dark:text-text-darkSecondary'
                        }`}>
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(project.deadline).toLocaleDateString()}</span>
                        </div>
                    )}

                    {/* Team Members */}
                    {teamMembers.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-text-secondary dark:text-text-darkSecondary">
                            <Users className="w-3 h-3" />
                            <span>{teamMembers.length}</span>
                        </div>
                    )}
                </div>

                {/* Links */}
                <div className="flex items-center gap-2">
                    {project.github_url && (
                        <a
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1. 5 text-text-secondary dark:text-text-darkSecondary hover:text-primary
                dark:hover:text-primary-dark transition-colors"
                        >
                            <Github className="w-4 h-4" />
                        </a>
                    )}
                    {project. demo_url && (
                        <a
                            href={project.demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-text-secondary dark:text-text-darkSecondary hover:text-primary
                dark:hover:text-primary-dark transition-colors"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark
            rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-2">
                            Delete Project?
                        </h3>
                        <p className="text-text-secondary dark:text-text-darkSecondary mb-6">
                            Are you sure you want to delete "{project.title}"? This action cannot be undone.
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