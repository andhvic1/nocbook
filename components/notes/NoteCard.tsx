'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Note, NoteType } from '@/types'
import {
    Trash2,
    MoreVertical,
    Eye,
    Edit,
    Pin,
    Star,
    Calendar,
    Tag,
    Link2,
    FileText,
    Clock,
    TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface NoteCardProps {
    note: Note
    onDelete: () => void
    onTogglePin?: () => void
    onToggleFavorite?: () => void
}

const noteTypeConfig: Record<NoteType, { color: string; bgColor: string; label: string }> = {
    formula: {
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-500/10',
        label: 'Rumus'
    },
    tutorial: {
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-500/10',
        label: 'Tutorial'
    },
    concept: {
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-500/10',
        label: 'Konsep'
    },
    troubleshooting: {
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-500/10',
        label: 'Troubleshooting'
    },
    reference: {
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-500/10',
        label: 'Reference'
    },
    'code-snippet': {
        color: 'text-indigo-600 dark:text-indigo-400',
        bgColor: 'bg-indigo-500/10',
        label: 'Code Snippet'
    },
    other: {
        color: 'text-gray-600 dark:text-gray-400',
        bgColor: 'bg-gray-500/10',
        label: 'Other'
    },
}

export function NoteCard({ note, onDelete, onTogglePin, onToggleFavorite }: NoteCardProps) {
    const [showMenu, setShowMenu] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const typeConfig = noteTypeConfig[note. note_type] || noteTypeConfig.other
    const typeColor = typeConfig.color
    const typeBgColor = typeConfig.bgColor
    const typeLabel = typeConfig. label

    const handleDelete = async () => {
        setDeleting(true)
        try {
            const response = await fetch(`/notes/${note.id}`, {
                method: 'DELETE',
            })

            if (! response.ok) throw new Error('Failed to delete')
            onDelete()
        } catch (error) {
            alert('Failed to delete note')
        } finally {
            setDeleting(false)
            setShowDeleteConfirm(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    return (
        <div className={`bg-cardBg dark:bg-cardBg-dark border-2 rounded-xl p-4 
      hover:border-primary dark:hover:border-primary-dark transition-all duration-200 group relative ${
            note.is_pinned ? 'border-yellow-500/50 dark:border-yellow-400/50' : 'border-border dark:border-border-dark'
        }`}>

            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                    <Link href={`/notes/${note. id}`}>
                        <h3 className="text-base font-semibold text-text dark:text-text-dark hover:text-primary
                dark:hover:text-primary-dark transition-colors line-clamp-2 cursor-pointer mb-2">
                            {note.title}
                            {note.is_pinned && (
                                <Pin className="inline-block w-4 h-4 ml-2 text-yellow-600 dark:text-yellow-400 fill-yellow-600 dark:fill-yellow-400" />
                            )}
                        </h3>
                    </Link>

                    <div className="flex flex-wrap gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${typeBgColor} ${typeColor}`}>
                            {typeLabel}
                        </span>

                        <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-background dark:bg-background-dark text-text-secondary dark:text-text-darkSecondary">
                            {note.category}
                        </span>

                        {note.version > 1 && (
                            <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                v{note.version}
                            </span>
                        )}

                        {note.is_favorite && (
                            <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400 fill-yellow-600 dark:fill-yellow-400" />
                        )}
                    </div>
                </div>

                {/* Menu Button */}
                <div className="relative ml-3">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-1. 5 text-text-secondary dark:text-text-darkSecondary hover:text-text dark:hover:text-text-dark
              hover:bg-background dark:hover:bg-background-dark rounded-lg transition-colors"
                    >
                        <MoreVertical className="w-4 h-4" />
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
                                    href={`/notes/${note.id}`}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-background dark:hover:bg-background-dark
                    text-text dark:text-text-dark transition-colors text-sm"
                                    onClick={() => setShowMenu(false)}
                                >
                                    <Eye className="w-4 h-4" />
                                    <span>View Note</span>
                                </Link>
                                <Link
                                    href={`/notes/${note.id}?edit=true`}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-background dark:hover:bg-background-dark
                    text-text dark:text-text-dark transition-colors text-sm"
                                    onClick={() => setShowMenu(false)}
                                >
                                    <Edit className="w-4 h-4" />
                                    <span>Edit Note</span>
                                </Link>
                                {onTogglePin && (
                                    <button
                                        onClick={() => {
                                            onTogglePin()
                                            setShowMenu(false)
                                        }}
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-background dark:hover:bg-background-dark
                      text-text dark:text-text-dark transition-colors w-full text-sm"
                                    >
                                        <Pin className="w-4 h-4" />
                                        <span>{note.is_pinned ? 'Unpin' : 'Pin'}</span>
                                    </button>
                                )}
                                {onToggleFavorite && (
                                    <button
                                        onClick={() => {
                                            onToggleFavorite()
                                            setShowMenu(false)
                                        }}
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-background dark:hover:bg-background-dark
                      text-text dark:text-text-dark transition-colors w-full text-sm"
                                    >
                                        <Star className="w-4 h-4" />
                                        <span>{note.is_favorite ? 'Unfavorite' : 'Favorite'}</span>
                                    </button>
                                )}
                                <div className="border-t border-border dark:border-border-dark" />
                                <button
                                    onClick={() => {
                                        setShowMenu(false)
                                        setShowDeleteConfirm(true)
                                    }}
                                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-950
                    text-red-600 dark:text-red-400 transition-colors w-full text-sm"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Delete Note</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Excerpt */}
            {note.excerpt && (
                <p className="text-sm text-text-secondary dark:text-text-darkSecondary line-clamp-3 mb-3">
                    {note. excerpt}
                </p>
            )}

            {/* Tags */}
            {note.tags && note.tags. length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                    {note.tags.slice(0, 3).map((tag, index) => (
                        <span
                            key={index}
                            className="px-2 py-0.5 bg-primary/10 text-primary dark:text-primary-dark rounded text-xs"
                        >
                            #{tag}
                        </span>
                    ))}
                    {note.tags.length > 3 && (
                        <span className="px-2 py-0.5 text-xs text-text-secondary dark:text-text-darkSecondary">
                            +{note.tags.length - 3} more
                        </span>
                    )}
                </div>
            )}

            {/* Footer Info */}
            <div className="flex items-center justify-between text-xs text-text-secondary dark:text-text-darkSecondary pt-3 border-t border-border dark:border-border-dark">
                <div className="flex items-center gap-3">
                    {/* Updated Date */}
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3. 5 h-3.5" />
                        <span>{formatDate(note.updated_at)}</span>
                    </div>

                    {/* View Count */}
                    {note.view_count > 0 && (
                        <div className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            <span>{note. view_count}</span>
                        </div>
                    )}

                    {/* Linked Items */}
                    {(note.skill_id || note.project_id || note.event_id || note.task_id) && (
                        <div className="flex items-center gap-1">
                            <Link2 className="w-3.5 h-3.5" />
                            <span>Linked</span>
                        </div>
                    )}

                    {/* Attachments */}
                    {note.attachments && note.attachments.length > 0 && (
                        <div className="flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            <span>{note.attachments.length}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark
            rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-2">
                            Delete Note?
                        </h3>
                        <p className="text-text-secondary dark:text-text-darkSecondary mb-6">
                            Are you sure you want to delete "{note.title}"? This action cannot be undone.
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