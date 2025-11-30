'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase'
import { NoteForm } from '@/components/notes/NoteForm'
import { Button } from '@/components/ui/Button'
import { Note, NoteVersion, Skill, Project, Event, Task } from '@/types'
import {
    ArrowLeft,
    Edit,
    Trash2,
    Pin,
    Star,
    Calendar,
    Eye,
    Tag,
    Link2,
    FileText,
    ExternalLink,
    History,
    Clock,
    X
} from 'lucide-react'
import Link from 'next/link'

const noteTypeConfig: Record<Note['note_type'], { color: string; bgColor: string; label: string; icon: string }> = {
    formula: { color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-500/10', label: 'Formula', icon: '📐' },
    tutorial: { color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-500/10', label: 'Tutorial', icon: '📚' },
    concept: { color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-500/10', label: 'Concept', icon: '💡' },
    troubleshooting: { color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-500/10', label: 'Troubleshooting', icon: '🔧' },
    reference: { color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-500/10', label: 'Reference', icon: '📖' },
    'code-snippet': { color: 'text-indigo-600 dark:text-indigo-400', bgColor: 'bg-indigo-500/10', label: 'Code Snippet', icon: '💻' },
    other: { color: 'text-gray-600 dark:text-gray-400', bgColor: 'bg-gray-500/10', label: 'Other', icon: '📝' },
}

export default function NoteDetailPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const params = useParams()
    const noteId = params.id as string

    const [note, setNote] = useState<Note | null>(null)
    const [versions, setVersions] = useState<NoteVersion[]>([])
    const [skill, setSkill] = useState<Skill | null>(null)
    const [project, setProject] = useState<Project | null>(null)
    const [event, setEvent] = useState<Event | null>(null)
    const [task, setTask] = useState<Task | null>(null)

    const [skills, setSkills] = useState<Skill[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    const [events, setEvents] = useState<Event[]>([])
    const [tasks, setTasks] = useState<Task[]>([])

    const [loading, setLoading] = useState(true)
    const [editMode, setEditMode] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [showVersions, setShowVersions] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        if (! authLoading && !user) {
            router.push('/login')
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (user && noteId) {
            fetchNote()
            fetchRelatedData()
        }
    }, [user, noteId])

    // Check URL for edit parameter on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location. search)
            if (urlParams.get('edit') === 'true') {
                setEditMode(true)
            }
        }
    }, [])

    // Increment view count
    useEffect(() => {
        if (note && ! editMode) {
            incrementViewCount()
        }
    }, [note, editMode])

    const incrementViewCount = async () => {
        try {
            await supabase
                .from('notes')
                .update({ view_count: (note?.view_count || 0) + 1 })
                .eq('id', noteId)
        } catch (error) {
            console.error('Error incrementing view count:', error)
        }
    }

    const fetchNote = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('notes')
                .select('*')
                .eq('id', noteId)
                .single()

            if (error) throw error
            setNote(data)

            // Fetch versions
            const { data: versionsData, error: versionsError } = await supabase
                .from('note_versions')
                .select('*')
                .eq('note_id', noteId)
                .order('version_number', { ascending: false })

            if (versionsError) throw versionsError
            setVersions(versionsData || [])

            // Fetch related skill
            if (data.skill_id) {
                const { data: skillData } = await supabase
                    . from('skills')
                    .select('*')
                    .eq('id', data.skill_id)
                    .single()
                setSkill(skillData)
            }

            // Fetch related project
            if (data. project_id) {
                const { data: projectData } = await supabase
                    .from('projects')
                    .select('*')
                    .eq('id', data.project_id)
                    .single()
                setProject(projectData)
            }

            // Fetch related event
            if (data.event_id) {
                const { data: eventData } = await supabase
                    .from('events')
                    . select('*')
                    .eq('id', data.event_id)
                    .single()
                setEvent(eventData)
            }

            // Fetch related task
            if (data.task_id) {
                const { data: taskData } = await supabase
                    .from('tasks')
                    .select('*')
                    .eq('id', data. task_id)
                    .single()
                setTask(taskData)
            }
        } catch (error) {
            console. error('Error fetching note:', error)
            router.push('/notes')
        } finally {
            setLoading(false)
        }
    }

    const fetchRelatedData = async () => {
        try {
            const { data: skillsData } = await supabase
                .from('skills')
                .select('*')
                .order('name', { ascending: true })

            const { data: projectsData } = await supabase
                . from('projects')
                .select('*')
                .order('title', { ascending: true })

            const { data: eventsData } = await supabase
                .from('events')
                . select('*')
                .order('name', { ascending: true })

            const { data: tasksData } = await supabase
                .from('tasks')
                .select('*')
                . order('title', { ascending: true })

            setSkills(skillsData || [])
            setProjects(projectsData || [])
            setEvents(eventsData || [])
            setTasks(tasksData || [])
        } catch (error) {
            console.error('Error fetching related data:', error)
        }
    }

    const handleDelete = async () => {
        setDeleting(true)
        try {
            const { error } = await supabase
                .from('notes')
                .delete()
                .eq('id', noteId)

            if (error) throw error
            router.push('/notes')
        } catch (error) {
            console.error('Error deleting note:', error)
            alert('Failed to delete note')
        } finally {
            setDeleting(false)
            setShowDeleteConfirm(false)
        }
    }

    const handleTogglePin = async () => {
        if (! note) return
        try {
            const { error } = await supabase
                .from('notes')
                .update({ is_pinned: !note. is_pinned })
                . eq('id', noteId)

            if (error) throw error
            setNote({ ...note, is_pinned: !note.is_pinned })
        } catch (error) {
            console. error('Error toggling pin:', error)
            alert('Failed to toggle pin')
        }
    }

    const handleToggleFavorite = async () => {
        if (!note) return
        try {
            const { error } = await supabase
                .from('notes')
                .update({ is_favorite: !note.is_favorite })
                .eq('id', noteId)

            if (error) throw error
            setNote({ ...note, is_favorite: !note.is_favorite })
        } catch (error) {
            console.error('Error toggling favorite:', error)
            alert('Failed to toggle favorite')
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const renderMarkdown = (content: string) => {
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            . replace(/`(.*?)`/g, '<code class="bg-primary/10 px-1. 5 py-0.5 rounded text-sm font-mono">$1</code>')
            .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-background dark:bg-background-dark p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm font-mono">$2</code></pre>')
            .replace(/^## (.*?)$/gm, '<h2 class="text-2xl font-bold mt-6 mb-3 text-text dark:text-text-dark">$1</h2>')
            .replace(/^### (.*?)$/gm, '<h3 class="text-xl font-bold mt-5 mb-2 text-text dark:text-text-dark">$1</h3>')
            .replace(/^#### (.*?)$/gm, '<h4 class="text-lg font-semibold mt-4 mb-2 text-text dark:text-text-dark">$1</h4>')
            .replace(/^- (.*?)$/gm, '<li class="ml-4">$1</li>')
            . replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary dark:text-primary-dark hover:underline">$1</a>')
            .replace(/\n/g, '<br/>')
    }

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-primary-dark mx-auto mb-4"></div>
                    <p className="text-text-secondary dark:text-text-darkSecondary">Loading note...</p>
                </div>
            </div>
        )
    }

    if (!user || !note) return null

    const typeConfig = noteTypeConfig[note. note_type] || noteTypeConfig.other
    const typeColor = typeConfig.color
    const typeBgColor = typeConfig.bgColor
    const typeLabel = typeConfig. label
    const typeIcon = typeConfig.icon

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
                                Edit Note
                            </h1>
                            <p className="text-text-secondary dark:text-text-darkSecondary text-sm mt-1">
                                Update your note (v{note.version + 1})
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6 md:p-8">
                    <NoteForm
                        note={note}
                        skills={skills}
                        projects={projects}
                        events={events}
                        tasks={tasks}
                    />
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
                        href="/notes"
                        className="p-2 hover:bg-cardBg dark:hover:bg-cardBg-dark rounded-lg transition-colors flex-shrink-0"
                    >
                        <ArrowLeft className="w-5 h-5 text-text dark:text-text-dark" />
                    </Link>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-3">
                            <span className="text-4xl flex-shrink-0">{typeIcon}</span>
                            <div className="flex-1 min-w-0">
                                <h1 className="text-2xl md:text-3xl font-bold text-text dark:text-text-dark mb-3">
                                    {note.title}
                                    {note.is_pinned && (
                                        <Pin className="inline-block w-6 h-6 ml-2 text-yellow-600 dark:text-yellow-400 fill-yellow-600 dark:fill-yellow-400" />
                                    )}
                                    {note.is_favorite && (
                                        <Star className="inline-block w-6 h-6 ml-2 text-yellow-600 dark:text-yellow-400 fill-yellow-600 dark:fill-yellow-400" />
                                    )}
                                </h1>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-lg text-sm font-medium ${typeBgColor} ${typeColor}`}>
                {typeLabel}
              </span>
                            <span className="px-3 py-1 rounded-lg text-sm font-medium bg-background dark:bg-background-dark text-text dark:text-text-dark">
                {note.category}
              </span>
                            {note.version > 1 && (
                                <button
                                    onClick={() => setShowVersions(!showVersions)}
                                    className="px-3 py-1 rounded-lg text-sm font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400
                    hover:bg-purple-500/20 transition-colors flex items-center gap-1"
                                >
                                    <History className="w-4 h-4" />
                                    Version {note.version}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleTogglePin}
                        className="flex items-center gap-2"
                    >
                        <Pin className={`w-4 h-4 ${note.is_pinned ? 'fill-current' : ''}`} />
                        <span className="hidden sm:inline">{note.is_pinned ?  'Unpin' : 'Pin'}</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleToggleFavorite}
                        className="flex items-center gap-2"
                    >
                        <Star className={`w-4 h-4 ${note.is_favorite ? 'fill-current' : ''}`} />
                        <span className="hidden sm:inline">{note.is_favorite ?  'Unfav' : 'Fav'}</span>
                    </Button>
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

            {/* Versions Modal */}
            {showVersions && versions.length > 0 && (
                <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-text dark:text-text-dark flex items-center gap-2">
                            <History className="w-5 h-5" />
                            Version History ({versions.length} previous versions)
                        </h2>
                        <button
                            onClick={() => setShowVersions(false)}
                            className="text-text-secondary dark:text-text-darkSecondary hover:text-text dark:hover:text-text-dark"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {versions.map((version) => (
                            <div
                                key={version.id}
                                className="p-4 bg-background dark:bg-background-dark rounded-lg border border-border dark:border-border-dark"
                            >
                                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-text dark:text-text-dark">
                    Version {version.version_number}
                  </span>
                                    <span className="text-xs text-text-secondary dark:text-text-darkSecondary flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                                        {formatDate(version.created_at)}
                  </span>
                                </div>
                                <p className="text-sm text-text-secondary dark:text-text-darkSecondary line-clamp-2">
                                    {version.title}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Content */}
                    <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                        <div
                            className="prose prose-sm dark:prose-invert max-w-none text-text dark:text-text-dark"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(note.content) }}
                        />
                    </div>

                    {/* Linked Resources */}
                    {(skill || project || event || task) && (
                        <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-4 flex items-center gap-2">
                                <Link2 className="w-5 h-5" />
                                Linked Resources
                            </h2>
                            <div className="space-y-3">
                                {skill && (
                                    <Link
                                        href={`/skills/${skill.id}`}
                                        className="flex items-center gap-3 p-3 bg-background dark:bg-background-dark rounded-lg
                      hover:bg-primary/5 dark:hover:bg-primary-dark/5 border border-border dark:border-border-dark
                      hover:border-primary/50 dark:hover:border-primary-dark/50 transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary-dark/10
                      flex items-center justify-center flex-shrink-0">
                                            <span className="text-lg">🎯</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-text-secondary dark:text-text-darkSecondary">Skill</p>
                                            <p className="font-medium text-text dark:text-text-dark group-hover:text-primary
                        dark:group-hover:text-primary-dark transition-colors truncate">
                                                {skill. name}
                                            </p>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-text-secondary dark:text-text-darkSecondary flex-shrink-0" />
                                    </Link>
                                )}

                                {project && (
                                    <Link
                                        href={`/projects/${project.id}`}
                                        className="flex items-center gap-3 p-3 bg-background dark:bg-background-dark rounded-lg
                      hover:bg-primary/5 dark:hover:bg-primary-dark/5 border border-border dark:border-border-dark
                      hover:border-primary/50 dark:hover:border-primary-dark/50 transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary-dark/10
                      flex items-center justify-center flex-shrink-0">
                                            <span className="text-lg">📦</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-text-secondary dark:text-text-darkSecondary">Project</p>
                                            <p className="font-medium text-text dark:text-text-dark group-hover:text-primary
                        dark:group-hover:text-primary-dark transition-colors truncate">
                                                {project.title}
                                            </p>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-text-secondary dark:text-text-darkSecondary flex-shrink-0" />
                                    </Link>
                                )}

                                {event && (
                                    <Link
                                        href={`/events/${event.id}`}
                                        className="flex items-center gap-3 p-3 bg-background dark:bg-background-dark rounded-lg
                      hover:bg-primary/5 dark:hover:bg-primary-dark/5 border border-border dark:border-border-dark
                      hover:border-primary/50 dark:hover:border-primary-dark/50 transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary-dark/10
                      flex items-center justify-center flex-shrink-0">
                                            <span className="text-lg">📅</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-text-secondary dark:text-text-darkSecondary">Event</p>
                                            <p className="font-medium text-text dark:text-text-dark group-hover:text-primary
                        dark:group-hover:text-primary-dark transition-colors truncate">
                                                {event.name}
                                            </p>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-text-secondary dark:text-text-darkSecondary flex-shrink-0" />
                                    </Link>
                                )}

                                {task && (
                                    <Link
                                        href={`/tasks/${task.id}`}
                                        className="flex items-center gap-3 p-3 bg-background dark:bg-background-dark rounded-lg
                      hover:bg-primary/5 dark:hover:bg-primary-dark/5 border border-border dark:border-border-dark
                      hover:border-primary/50 dark:hover:border-primary-dark/50 transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary-dark/10
                      flex items-center justify-center flex-shrink-0">
                                            <span className="text-lg">✅</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-text-secondary dark:text-text-darkSecondary">Task</p>
                                            <p className="font-medium text-text dark:text-text-dark group-hover:text-primary
                        dark:group-hover:text-primary-dark transition-colors truncate">
                                                {task.title}
                                            </p>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-text-secondary dark:text-text-darkSecondary flex-shrink-0" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Attachments */}
                    {note. attachments && note.attachments. length > 0 && (
                        <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Attachments ({note.attachments.length})
                            </h2>
                            <div className="space-y-2">
                                {note.attachments.map((url, index) => (
                                    <a
                                        key={index}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 bg-background dark:bg-background-dark rounded-lg
                      hover:bg-primary/5 dark:hover:bg-primary-dark/5 border border-border dark:border-border-dark
                      hover:border-primary/50 dark:hover:border-primary-dark/50 transition-all group"
                                    >
                                        <FileText className="w-4 h-4 text-text-secondary dark:text-text-darkSecondary flex-shrink-0" />
                                        <p className="flex-1 text-sm text-primary dark:text-primary-dark group-hover:underline truncate">
                                            {url}
                                        </p>
                                        <ExternalLink className="w-4 h-4 text-text-secondary dark:text-text-darkSecondary flex-shrink-0" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    {note.tags && note.tags.length > 0 && (
                        <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-3 flex items-center gap-2">
                                <Tag className="w-5 h-5" />
                                Tags
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {note. tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1. 5 bg-primary/10 text-primary dark:text-primary-dark rounded-full text-sm font-medium"
                                    >
                    #{tag}
                  </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Quick Info */}
                <div className="space-y-6">
                    {/* Note Stats */}
                    <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-4">
                            Note Info
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-text-secondary dark:text-text-darkSecondary">Views</span>
                                <span className="text-sm font-medium text-text dark:text-text-dark flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                                    {note.view_count}
                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-text-secondary dark:text-text-darkSecondary">Version</span>
                                <span className="text-sm font-medium text-text dark:text-text-dark">{note.version}</span>
                            </div>
                            {note.is_pinned && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-text-secondary dark:text-text-darkSecondary">Pinned</span>
                                    <Pin className="w-4 h-4 text-yellow-600 dark:text-yellow-400 fill-current" />
                                </div>
                            )}
                            {note.is_favorite && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-text-secondary dark:text-text-darkSecondary">Favorite</span>
                                    <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400 fill-current" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-4">
                            Timeline
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-text-secondary dark:text-text-darkSecondary mb-1 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Created
                                </p>
                                <p className="text-sm text-text dark:text-text-dark font-medium">
                                    {formatDate(note.created_at)}
                                </p>
                            </div>
                            {note.updated_at !== note.created_at && (
                                <div>
                                    <p className="text-xs text-text-secondary dark:text-text-darkSecondary mb-1 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        Last Updated
                                    </p>
                                    <p className="text-sm text-text dark:text-text-dark font-medium">
                                        {formatDate(note.updated_at)}
                                    </p>
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
                            Delete Note?
                        </h3>
                        <p className="text-text-secondary dark:text-text-darkSecondary mb-6">
                            Are you sure you want to delete "{note.title}"? All {versions.length} versions will be lost.  This action cannot be undone.
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