'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Task, TaskCategory, TaskPriority, TaskStatus, RecurrencePattern, Skill, Project, Event, Subtask } from '@/types'
import { Button } from '@/components/ui/Button'
import { X, Plus, Trash2, Link2, Calendar, Clock, Repeat } from 'lucide-react'
import { createClient } from '@/lib/supabase'

interface TaskFormProps {
    task?: Task
    existingSubtasks?: Subtask[]
    skills?: Skill[]
    projects?: Project[]
    events?: Event[]
}

const categories: { value: TaskCategory; label: string }[] = [
    { value: 'school', label: 'School' },
    { value: 'content', label: 'Content' },
    { value: 'project', label: 'Project' },
    { value: 'personal', label: 'Personal' },
    { value: 'learning', label: 'Learning' },
    { value: 'work', label: 'Work' },
    { value: 'health', label: 'Health' },
    { value: 'other', label: 'Other' },
]

const priorities: { value: TaskPriority; label: string }[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
]

const statuses: { value: TaskStatus; label: string }[] = [
    { value: 'not-started', label: 'Not Started' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
    { value: 'blocked', label: 'Blocked' },
    { value: 'cancelled', label: 'Cancelled' },
]

const recurrencePatterns: { value: RecurrencePattern; label: string }[] = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
]

export function TaskForm({ task, existingSubtasks = [], skills = [], projects = [], events = [] }: TaskFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    // Form state
    const [title, setTitle] = useState(task?.title || '')
    const [description, setDescription] = useState(task?. description || '')
    const [category, setCategory] = useState<TaskCategory>(task?.category || 'personal')
    const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'medium')
    const [status, setStatus] = useState<TaskStatus>(task?.status || 'not-started')
    const [dueDate, setDueDate] = useState(task?.due_date ?  task.due_date. split('T')[0] : '')
    const [dueTime, setDueTime] = useState(task?.due_time || '')
    const [estimatedTime, setEstimatedTime] = useState(task?.estimated_time ?  Math.floor(task.estimated_time / 60) : 0)
    const [estimatedMinutes, setEstimatedMinutes] = useState(task?.estimated_time ? task.estimated_time % 60 : 0)
    const [progress, setProgress] = useState(task?.progress || 0)
    const [notes, setNotes] = useState(task?.notes || '')

    // Relations
    const [skillId, setSkillId] = useState(task?.skill_id || '')
    const [projectId, setProjectId] = useState(task?.project_id || '')
    const [eventId, setEventId] = useState(task?.event_id || '')

    // Recurrence
    const [isRecurring, setIsRecurring] = useState(task?.is_recurring || false)
    const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern | ''>(task?.recurrence_pattern || '')
    const [recurrenceEndDate, setRecurrenceEndDate] = useState(
        task?.recurrence_end_date ? task.recurrence_end_date.split('T')[0] : ''
    )

    // Arrays
    const [tags, setTags] = useState<string[]>(task?.tags || [])
    const [tagInput, setTagInput] = useState('')

    const [attachments, setAttachments] = useState<string[]>(task?.attachments || [])
    const [attachmentInput, setAttachmentInput] = useState('')

    // Subtasks
    const [subtasks, setSubtasks] = useState<Array<{ title: string; is_completed: boolean; order_index: number }>>(
        existingSubtasks. map((s, idx) => ({
            title: s.title,
            is_completed: s.is_completed,
            order_index: s.order_index || idx
        }))
    )
    const [subtaskInput, setSubtaskInput] = useState('')

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

    const handleAddSubtask = () => {
        if (subtaskInput.trim()) {
            setSubtasks([
                ...subtasks,
                {
                    title: subtaskInput. trim(),
                    is_completed: false,
                    order_index: subtasks.length
                }
            ])
            setSubtaskInput('')
        }
    }

    const handleRemoveSubtask = (index: number) => {
        setSubtasks(subtasks.filter((_, i) => i !== index))
    }

    const handleToggleSubtask = (index: number) => {
        setSubtasks(subtasks.map((s, i) =>
            i === index ? { ... s, is_completed: !s.is_completed } : s
        ))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const totalMinutes = (estimatedTime * 60) + estimatedMinutes

            const taskData = {
                user_id: user.id,
                title,
                description: description || null,
                notes: notes || null,
                category,
                priority,
                status,
                due_date: dueDate || null,
                due_time: dueTime || null,
                estimated_time: totalMinutes > 0 ? totalMinutes : null,
                actual_time_spent: task?.actual_time_spent || 0,
                progress,
                skill_id: skillId || null,
                project_id: projectId || null,
                event_id: eventId || null,
                is_recurring: isRecurring,
                recurrence_pattern: isRecurring ? recurrencePattern || null : null,
                recurrence_end_date: isRecurring && recurrenceEndDate ? recurrenceEndDate : null,
                tags: tags.length > 0 ? tags : null,
                attachments: attachments.length > 0 ? attachments : null,
                is_featured: task?.is_featured || false,
                updated_at: new Date().toISOString(),
            }

            let taskId = task?.id

            if (task) {
                // Update existing task
                const { error } = await supabase
                    .from('tasks')
                    . update(taskData)
                    . eq('id', task.id)

                if (error) throw error
            } else {
                // Create new task
                const { data, error } = await supabase
                    .from('tasks')
                    .insert(taskData)
                    .select()
                    .single()

                if (error) throw error
                taskId = data.id
            }

            // Update subtasks
            if (taskId) {
                // Delete existing subtasks
                await supabase
                    .from('subtasks')
                    .delete()
                    .eq('task_id', taskId)

                // Insert new subtasks
                if (subtasks.length > 0) {
                    const subtasksData = subtasks.map((subtask, index) => ({
                        task_id: taskId,
                        title: subtask.title,
                        is_completed: subtask.is_completed,
                        order_index: index
                    }))

                    const { error: subtasksError } = await supabase
                        .from('subtasks')
                        .insert(subtasksData)

                    if (subtasksError) throw subtasksError
                }
            }

            router.push('/tasks')
            router.refresh()
        } catch (error: any) {
            console.error('Error saving task:', error)
            alert(error.message || 'Failed to save task')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
                <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                    Task Title *
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="e.g., Belajar MTK - Integral"
                    className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
            bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
            focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors
            placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary"
                />
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                    Description
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="What's this task about?"
                    className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
            bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
            focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors
            placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary resize-none"
                />
            </div>

            {/* Category, Priority, Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                        Category *
                    </label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as TaskCategory)}
                        required
                        className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
              bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
              focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                    >
                        {categories. map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                        Priority *
                    </label>
                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as TaskPriority)}
                        required
                        className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
              bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
              focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                    >
                        {priorities.map(pri => (
                            <option key={pri.value} value={pri. value}>{pri.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                        Status *
                    </label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target. value as TaskStatus)}
                        required
                        className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
              bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
              focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                    >
                        {statuses.map(stat => (
                            <option key={stat.value} value={stat.value}>{stat.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Due Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-text dark:text-text-dark mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Due Date
                    </label>
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
              bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
              focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-text dark:text-text-dark mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Due Time
                    </label>
                    <input
                        type="time"
                        value={dueTime}
                        onChange={(e) => setDueTime(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
              bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
              focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                    />
                </div>
            </div>

            {/* Estimated Time */}
            <div>
                <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                    Estimated Time
                </label>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <input
                            type="number"
                            min="0"
                            value={estimatedTime}
                            onChange={(e) => setEstimatedTime(parseInt(e.target. value) || 0)}
                            placeholder="Hours"
                            className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
                bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
                focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                        />
                        <p className="text-xs text-text-secondary dark:text-text-darkSecondary mt-1">Hours</p>
                    </div>
                    <div>
                        <input
                            type="number"
                            min="0"
                            max="59"
                            value={estimatedMinutes}
                            onChange={(e) => setEstimatedMinutes(Math.min(59, parseInt(e.target.value) || 0))}
                            placeholder="Minutes"
                            className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
                bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
                focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                        />
                        <p className="text-xs text-text-secondary dark:text-text-darkSecondary mt-1">Minutes</p>
                    </div>
                </div>
            </div>

            {/* Progress */}
            <div>
                <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                    Progress: {progress}%
                </label>
                <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={progress}
                    onChange={(e) => setProgress(parseInt(e.target.value))}
                    className="w-full"
                />
                <div className="w-full h-2 bg-background dark:bg-background-dark rounded-full overflow-hidden mt-2">
                    <div
                        className="h-full bg-primary dark:bg-primary-dark transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Recurrence Toggle */}
            <div className="flex items-center gap-3 p-4 bg-purple-500/5 border-2 border-purple-500/20 rounded-lg">
                <input
                    type="checkbox"
                    id="is_recurring"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="w-4 h-4"
                />
                <label htmlFor="is_recurring" className="text-sm text-text dark:text-text-dark cursor-pointer flex items-center gap-2">
                    <Repeat className="w-4 h-4" />
                    This is a recurring task
                </label>
            </div>

            {/* Recurrence Settings */}
            {isRecurring && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-background dark:bg-background-dark rounded-lg border-2 border-border dark:border-border-dark">
                    <div>
                        <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                            Repeat Pattern
                        </label>
                        <select
                            value={recurrencePattern}
                            onChange={(e) => setRecurrencePattern(e.target.value as RecurrencePattern)}
                            className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
                bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
                focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                        >
                            <option value="">Select pattern</option>
                            {recurrencePatterns.map(pattern => (
                                <option key={pattern. value} value={pattern.value}>{pattern.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                            End Date (Optional)
                        </label>
                        <input
                            type="date"
                            value={recurrenceEndDate}
                            onChange={(e) => setRecurrenceEndDate(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
                bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
                focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                        />
                    </div>
                </div>
            )}

            {/* Link to Skill/Project/Event */}
            <div className="space-y-4 p-4 bg-background dark:bg-background-dark rounded-lg border-2 border-border dark:border-border-dark">
                <h3 className="text-sm font-semibold text-text dark:text-text-dark flex items-center gap-2">
                    <Link2 className="w-4 h-4" />
                    Link to Resources
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            {skills. map(skill => (
                                <option key={skill.id} value={skill.id}>{skill. name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-text-secondary dark:text-text-darkSecondary mb-1">
                            Project
                        </label>
                        <select
                            value={projectId}
                            onChange={(e) => setProjectId(e.target.value)}
                            className="w-full px-3 py-2 text-sm rounded-lg border-2 border-border dark:border-border-dark
                bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
                focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                        >
                            <option value="">None</option>
                            {projects.map(project => (
                                <option key={project. id} value={project.id}>{project.title}</option>
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
                </div>
            </div>

            {/* Subtasks */}
            <div>
                <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                    Subtasks ({subtasks.length})
                </label>
                <div className="flex gap-2 mb-3">
                    <input
                        type="text"
                        value={subtaskInput}
                        onChange={(e) => setSubtaskInput(e. target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
                        placeholder="Add a subtask and press Enter"
                        className="flex-1 px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
              bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
              focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors
              placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary"
                    />
                    <Button type="button" onClick={handleAddSubtask} variant="outline">
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>

                {subtasks.length > 0 && (
                    <div className="space-y-2">
                        {subtasks. map((subtask, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 p-3 bg-background dark:bg-background-dark rounded-lg
                  border border-border dark:border-border-dark"
                            >
                                <input
                                    type="checkbox"
                                    checked={subtask.is_completed}
                                    onChange={() => handleToggleSubtask(index)}
                                    className="w-4 h-4"
                                />
                                <p className={`flex-1 text-sm text-text dark:text-text-dark ${
                                    subtask.is_completed ? 'line-through opacity-60' : ''
                                }`}>
                                    {subtask.title}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveSubtask(index)}
                                    className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950
                    rounded transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
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
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        placeholder="Add tag and press Enter"
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
                {tag}
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
                    Attachments (Links)
                </label>
                <div className="flex gap-2 mb-3">
                    <input
                        type="url"
                        value={attachmentInput}
                        onChange={(e) => setAttachmentInput(e. target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAttachment())}
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

            {/* Notes */}
            <div>
                <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                    Notes
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target. value)}
                    rows={4}
                    placeholder="Additional notes..."
                    className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
            bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
            focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors
            placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary resize-none"
                />
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
                    {task ? 'Update Task' : 'Create Task'}
                </Button>
            </div>
        </form>
    )
}