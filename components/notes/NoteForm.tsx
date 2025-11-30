'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Note, NoteType, Skill, Project, Event, Task } from '@/types'
import { Button } from '@/components/ui/Button'
import { X, Plus, Trash2, Link2, FileText, Image, Code } from 'lucide-react'
import { createClient } from '@/lib/supabase'

interface NoteFormProps {
    note?: Note
    skills?: Skill[]
    projects?: Project[]
    events?: Event[]
    tasks?: Task[]
}

const noteTypes: { value: NoteType; label: string }[] = [
    { value: 'formula', label: 'Formula' },
    { value: 'tutorial', label: 'Tutorial' },
    { value: 'concept', label: 'Concept' },
    { value: 'troubleshooting', label: 'Troubleshooting' },
    { value: 'reference', label: 'Reference' },
    { value: 'code-snippet', label: 'Code Snippet' },
    { value: 'other', label: 'Other' },
]

// Common categories based on the spec
const commonCategories = [
    'Mathematics',
    'Programming',
    'IoT',
    'Hardware',
    'ESP32',
    'Python',
    'JavaScript',
    'API',
    'Database',
    'Networking',
    'Soldering',
    'Electronics',
    'Algorithm',
    'Data Structure',
    'Web Development',
    'Mobile Development',
    'Other'
]

export function NoteForm({ note, skills = [], projects = [], events = [], tasks = [] }: NoteFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    // Form state
    const [title, setTitle] = useState(note?.title || '')
    const [content, setContent] = useState(note?.content || '')
    const [category, setCategory] = useState(note?.category || '')
    const [customCategory, setCustomCategory] = useState('')
    const [noteType, setNoteType] = useState<NoteType>(note?.note_type || 'concept')

    // Relations
    const [skillId, setSkillId] = useState(note?.skill_id || '')
    const [projectId, setProjectId] = useState(note?.project_id || '')
    const [eventId, setEventId] = useState(note?.event_id || '')
    const [taskId, setTaskId] = useState(note?.task_id || '')

    // Arrays
    const [tags, setTags] = useState<string[]>(note?.tags || [])
    const [tagInput, setTagInput] = useState('')

    const [attachments, setAttachments] = useState<string[]>(note?.attachments || [])
    const [attachmentInput, setAttachmentInput] = useState('')

    // Markdown helpers
    const [showPreview, setShowPreview] = useState(false)

    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()])
            setTagInput('')
        }
    }

    const handleRemoveTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag))
    }

    const handleAddAttachment = () => {
        if (attachmentInput.trim() && !attachments.includes(attachmentInput.trim())) {
            setAttachments([...attachments, attachmentInput.trim()])
            setAttachmentInput('')
        }
    }

    const handleRemoveAttachment = (index: number) => {
        setAttachments(attachments.filter((_, i) => i !== index))
    }

    // Markdown formatting helpers
    const insertMarkdown = (before: string, after: string = '') => {
        const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const selectedText = content.substring(start, end)
        const newText = content.substring(0, start) + before + selectedText + after + content.substring(end)

        setContent(newText)

        // Set cursor position
        setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
        }, 0)
    }

    const handleSubmit = async (e: React. FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const finalCategory = customCategory. trim() || category

            if (! finalCategory) {
                alert('Please select or enter a category')
                setLoading(false)
                return
            }

            const noteData = {
                user_id: user.id,
                title,
                content,
                category: finalCategory,
                note_type: noteType,
                skill_id: skillId || null,
                project_id: projectId || null,
                event_id: eventId || null,
                task_id: taskId || null,
                tags: tags.length > 0 ? tags : null,
                attachments: attachments.length > 0 ? attachments : null,
                is_pinned: note?.is_pinned || false,
                is_favorite: note?. is_favorite || false,
                updated_at: new Date().toISOString(),
            }

            if (note) {
                // Update existing note
                const { error } = await supabase
                    .from('notes')
                    . update(noteData)
                    . eq('id', note.id)

                if (error) throw error
            } else {
                // Create new note
                const { error } = await supabase
                    . from('notes')
                    .insert(noteData)

                if (error) throw error
            }

            router.push('/notes')
            router.refresh()
        } catch (error: any) {
            console.error('Error saving note:', error)
            alert(error.message || 'Failed to save note')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
                <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                    Note Title
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="e.g., MQTT vs HTTP - When to Use Each"
                    className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
            bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
            focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors
            placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary"
                />
            </div>

            {/* Category & Note Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                        Category
                    </label>
                    <select
                        value={category}
                        onChange={(e) => {
                            setCategory(e.target.value)
                            if (e.target.value !== 'custom') setCustomCategory('')
                        }}
                        required={!customCategory}
                        className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
              bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
              focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                    >
                        <option value="">Select category</option>
                        {commonCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="custom">+ Custom Category</option>
                    </select>

                    {category === 'custom' && (
                        <input
                            type="text"
                            value={customCategory}
                            onChange={(e) => setCustomCategory(e.target.value)}
                            placeholder="Enter custom category"
                            required
                            className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
                bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark mt-2
                focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors
                placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary"
                        />
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                        Note Type
                    </label>
                    <select
                        value={noteType}
                        onChange={(e) => setNoteType(e.target.value as NoteType)}
                        required
                        className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
                          bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
                          focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                    >
                        {noteTypes.map(type => (
                            <option key={type. value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Content Editor */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-text dark:text-text-dark">
                        Content * (Markdown supported)
                    </label>
                    <button
                        type="button"
                        onClick={() => setShowPreview(! showPreview)}
                        className="text-sm text-primary dark:text-primary-dark hover:underline"
                    >
                        {showPreview ? 'Edit' : 'Preview'}
                    </button>
                </div>

                {/* Markdown Toolbar */}
                {! showPreview && (
                    <div className="flex flex-wrap gap-2 mb-2 p-2 bg-background dark:bg-background-dark rounded-lg border border-border dark:border-border-dark">
                        <button
                            type="button"
                            onClick={() => insertMarkdown('**', '**')}
                            className="p-2 hover:bg-cardBg dark:hover:bg-cardBg-dark rounded transition-colors"
                            title="Bold"
                        >
                            <strong className="text-sm text-text dark:text-text-dark">B</strong>
                        </button>
                        <button
                            type="button"
                            onClick={() => insertMarkdown('*', '*')}
                            className="p-2 hover:bg-cardBg dark:hover:bg-cardBg-dark rounded transition-colors"
                            title="Italic"
                        >
                            <em className="text-sm text-text dark:text-text-dark">I</em>
                        </button>
                        <button
                            type="button"
                            onClick={() => insertMarkdown('`', '`')}
                            className="p-2 hover:bg-cardBg dark:hover:bg-cardBg-dark rounded transition-colors"
                            title="Inline Code"
                        >
                            <Code className="w-4 h-4 text-text dark:text-text-dark" />
                        </button>
                        <button
                            type="button"
                            onClick={() => insertMarkdown('```\n', '\n```')}
                            className="p-2 hover:bg-cardBg dark:hover:bg-cardBg-dark rounded transition-colors text-sm text-text dark:text-text-dark"
                            title="Code Block"
                        >
                            {'{ }'}
                        </button>
                        <button
                            type="button"
                            onClick={() => insertMarkdown('## ')}
                            className="p-2 hover:bg-cardBg dark:hover:bg-cardBg-dark rounded transition-colors text-sm text-text dark:text-text-dark"
                            title="Heading"
                        >
                            H
                        </button>
                        <button
                            type="button"
                            onClick={() => insertMarkdown('- ')}
                            className="p-2 hover:bg-cardBg dark:hover:bg-cardBg-dark rounded transition-colors text-sm text-text dark:text-text-dark"
                            title="List"
                        >
                            • List
                        </button>
                        <button
                            type="button"
                            onClick={() => insertMarkdown('[', '](url)')}
                            className="p-2 hover:bg-cardBg dark:hover:bg-cardBg-dark rounded transition-colors text-sm text-text dark:text-text-dark"
                            title="Link"
                        >
                            🔗
                        </button>
                    </div>
                )}

                {showPreview ?  (
                    <div className="w-full min-h-[300px] p-4 rounded-lg border-2 border-border dark:border-border-dark
            bg-cardBg dark:bg-cardBg-dark prose prose-sm dark:prose-invert max-w-none">
                        {content ?  (
                            <div dangerouslySetInnerHTML={{
                                __html: content
                                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                    .replace(/`(.*?)`/g, '<code class="bg-primary/10 px-1 rounded">$1</code>')
                                    .replace(/## (.*?)$/gm, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
                                    .replace(/### (.*?)$/gm, '<h3 class="text-lg font-bold mt-3 mb-2">$1</h3>')
                                    .replace(/^- (.*?)$/gm, '<li>$1</li>')
                                    .replace(/\n/g, '<br/>')
                            }} />
                        ) : (
                            <p className="text-text-secondary dark:text-text-darkSecondary">Nothing to preview... </p>
                        )}
                    </div>
                ) : (
                    <textarea
                        name="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        rows={15}
                        placeholder="Write your note here...  Markdown is supported!

Examples:
**bold text**
*italic text*
`inline code`
## Heading
- List item
[Link](https://example.com)"
                        className="w-full px-4 py-3 rounded-lg border-2 border-border dark:border-border-dark
              bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
              focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors
              placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary resize-none font-mono text-sm"
                    />
                )}
            </div>

            {/* Link to Resources */}
            <div className="space-y-4 p-4 bg-background dark:bg-background-dark rounded-lg border-2 border-border dark:border-border-dark">
                <h3 className="text-sm font-semibold text-text dark:text-text-dark flex items-center gap-2">
                    <Link2 className="w-4 h-4" />
                    Link to Resources (Optional)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-text-secondary dark:text-text-darkSecondary mb-1">
                            Skill
                        </label>
                        <select
                            value={skillId}
                            onChange={(e) => setSkillId(e.target.value)}
                            className="w-full px-3 py-2 text-sm rounded-lg border-2 border-border dark:border-border-dark
                bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
                focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                        >
                            <option value="">None</option>
                            {skills.map(skill => (
                                <option key={skill.id} value={skill.id}>{skill.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-text-secondary dark:text-text-darkSecondary mb-1">
                            Project
                        </label>
                        <select
                            value={projectId}
                            onChange={(e) => setProjectId(e. target.value)}
                            className="w-full px-3 py-2 text-sm rounded-lg border-2 border-border dark:border-border-dark
                bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
                focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                        >
                            <option value="">None</option>
                            {projects.map(project => (
                                <option key={project.id} value={project.id}>{project.title}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-text-secondary dark:text-text-darkSecondary mb-1">
                            Event
                        </label>
                        <select
                            value={eventId}
                            onChange={(e) => setEventId(e.target. value)}
                            className="w-full px-3 py-2 text-sm rounded-lg border-2 border-border dark:border-border-dark
                bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
                focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                        >
                            <option value="">None</option>
                            {events.map(event => (
                                <option key={event.id} value={event.id}>{event.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-text-secondary dark:text-text-darkSecondary mb-1">
                            Task
                        </label>
                        <select
                            value={taskId}
                            onChange={(e) => setTaskId(e.target. value)}
                            className="w-full px-3 py-2 text-sm rounded-lg border-2 border-border dark:border-border-dark
                bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
                focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                        >
                            <option value="">None</option>
                            {tasks.map(task => (
                                <option key={task.id} value={task.id}>{task.title}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Tags */}
            <div>
                <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                    Tags
                </label>
                <div className="flex gap-2 mb-2">
                    <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e. key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        placeholder="Add tag (without #) and press Enter"
                        className="flex-1 px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
              bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
              focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors
              placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary"
                    />
                    <Button type="button" onClick={handleAddTag} variant="outline">
                        Add
                    </Button>
                </div>
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {tags.map(tag => (
                            <span
                                key={tag}
                                className="px-3 py-1 bg-primary/10 text-primary dark:text-primary-dark rounded-full
                  text-sm flex items-center gap-2"
                            >
                #{tag}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveTag(tag)}
                                    className="hover:text-red-600 dark:hover:text-red-400"
                                >
                  <X className="w-3 h-3" />
                </button>
              </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Attachments */}
            <div>
                <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                    Attachments (Images, PDFs, Links)
                </label>
                <div className="flex gap-2 mb-3">
                    <input
                        type="url"
                        value={attachmentInput}
                        onChange={(e) => setAttachmentInput(e. target.value)}
                        onKeyPress={(e) => e. key === 'Enter' && (e.preventDefault(), handleAddAttachment())}
                        placeholder="Add URL and press Enter"
                        className="flex-1 px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
              bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
              focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors
              placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary"
                    />
                    <Button type="button" onClick={handleAddAttachment} variant="outline">
                        Add
                    </Button>
                </div>
                {attachments.length > 0 && (
                    <div className="space-y-2">
                        {attachments.map((url, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 p-2 bg-background dark:bg-background-dark rounded-lg
                  border border-border dark:border-border-dark"
                            >
                                <FileText className="w-4 h-4 text-text-secondary dark:text-text-darkSecondary flex-shrink-0" />
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 text-sm text-primary dark:text-primary-dark hover:underline truncate"
                                >
                                    {url}
                                </a>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveAttachment(index)}
                                    className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950
                    rounded transition-colors flex-shrink-0"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 justify-end pt-6 border-t border-border dark:border-border-dark">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    disabled={loading}
                >
                    {note ? 'Update Note' : 'Create Note'}
                </Button>
            </div>
        </form>
    )
}