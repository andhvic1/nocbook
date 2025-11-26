'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Project, Person, ProjectCategory, ProjectStatus, ProjectPriority } from '@/types'
import { Button } from '@/components/ui/Button'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase'

interface ProjectFormProps {
    project?: Project
    people: Person[]
}

const categories: { value: ProjectCategory; label: string }[] = [
    { value: 'school', label: 'School' },
    { value: 'competition', label: 'Competition' },
    { value: 'personal', label: 'Personal' },
    { value: 'client', label: 'Client' },
    { value: 'startup', label: 'Startup' },
    { value: 'web', label: 'Web' },
    { value: 'iot', label: 'IoT' },
    { value: 'ai', label: 'AI' },
    { value: 'mobile', label: 'Mobile' },
    { value: 'api', label: 'API' },
]

const statuses: { value: ProjectStatus; label: string }[] = [
    { value: 'idea', label: 'Idea' },
    { value: 'planning', label: 'Planning' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'on-hold', label: 'On Hold' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
]

const priorities: { value: ProjectPriority; label: string }[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
]

export function ProjectForm({ project, people }: ProjectFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    // Form state
    const [title, setTitle] = useState(project?.title || '')
    const [description, setDescription] = useState(project?.description || '')
    const [category, setCategory] = useState<ProjectCategory>(project?.category || 'personal')
    const [status, setStatus] = useState<ProjectStatus>(project?.status || 'idea')
    const [priority, setPriority] = useState<ProjectPriority>(project?.priority || 'medium')
    const [progress, setProgress] = useState(project?.progress || 0)
    const [deadline, setDeadline] = useState(project?.deadline ?  project.deadline.split('T')[0] : '')
    const [startDate, setStartDate] = useState(project?.start_date ? project.start_date.split('T')[0] : '')
    const [githubUrl, setGithubUrl] = useState(project?.github_url || '')
    const [demoUrl, setDemoUrl] = useState(project?.demo_url || '')
    const [notes, setNotes] = useState(project?.notes || '')

    // Arrays
    const [tags, setTags] = useState<string[]>(project?.tags || [])
    const [tagInput, setTagInput] = useState('')
    const [techStack, setTechStack] = useState<string[]>(project?.tech_stack || [])
    const [techInput, setTechInput] = useState('')
    const [selectedTeam, setSelectedTeam] = useState<string[]>(project?.team_members || [])

    // Auto complete when status is completed
    useEffect(() => {
        if (status === 'completed' && progress < 100) {
            setProgress(100)
        }
    }, [status])

    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()])
            setTagInput('')
        }
    }

    const handleRemoveTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag))
    }

    const handleAddTech = () => {
        if (techInput.trim() && !techStack.includes(techInput.trim())) {
            setTechStack([...techStack, techInput.trim()])
            setTechInput('')
        }
    }

    const handleRemoveTech = (tech: string) => {
        setTechStack(techStack.filter(t => t !== tech))
    }

    const toggleTeamMember = (personId: string) => {
        if (selectedTeam.includes(personId)) {
            setSelectedTeam(selectedTeam.filter(id => id !== personId))
        } else {
            setSelectedTeam([...selectedTeam, personId])
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const projectData = {
                user_id: user.id,
                title,
                description: description || null,
                category,
                status,
                priority,
                progress,
                deadline: deadline || null,
                start_date: startDate || null,
                completed_at: status === 'completed' ? new Date().toISOString() : null,
                github_url: githubUrl || null,
                demo_url: demoUrl || null,
                notes: notes || null,
                tags: tags. length > 0 ? tags : null,
                tech_stack: techStack.length > 0 ?  techStack : null,
                team_members: selectedTeam.length > 0 ? selectedTeam : null,
                updated_at: new Date().toISOString(),
            }

            if (project) {
                // Update existing project
                const { error } = await supabase
                    .from('projects')
                    . update(projectData)
                    . eq('id', project.id)

                if (error) throw error
            } else {
                // Create new project
                const { error } = await supabase
                    . from('projects')
                    .insert(projectData)

                if (error) throw error
            }

            router.push('/projects')
            router.refresh()
        } catch (error: any) {
            console.error('Error saving project:', error)
            alert(error.message || 'Failed to save project')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
                <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                    Project Title *
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="My Awesome Project"
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
                    placeholder="What's this project about?"
                    className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
            bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
            focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors
            placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary resize-none"
                />
            </div>

            {/* Category, Status, Priority - Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                        Category *
                    </label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as ProjectCategory)}
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
                        Status *
                    </label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as ProjectStatus)}
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

                <div>
                    <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                        Priority *
                    </label>
                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as ProjectPriority)}
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
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                    <div
                        className="bg-primary dark:bg-primary-dark h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Dates - Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                        Start Date
                    </label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
              bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
              focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                        Deadline
                    </label>
                    <input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e. target.value)}
                        className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
              bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
              focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                    />
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

            {/* Tech Stack */}
            <div>
                <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                    Tech Stack
                </label>
                <div className="flex gap-2 mb-2">
                    <input
                        type="text"
                        value={techInput}
                        onChange={(e) => setTechInput(e.target. value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTech())}
                        placeholder="Add technology and press Enter"
                        className="flex-1 px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
              bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
              focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors
              placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary"
                    />
                    <Button type="button" onClick={handleAddTech} variant="outline">
                        Add
                    </Button>
                </div>
                {techStack.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {techStack.map(tech => (
                            <span
                                key={tech}
                                className="px-3 py-1 bg-background dark:bg-background-dark rounded-lg
                  text-sm flex items-center gap-2 border border-border dark:border-border-dark"
                            >
                {tech}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveTech(tech)}
                                    className="hover:text-red-600 dark:hover:text-red-400"
                                >
                  <X className="w-3 h-3" />
                </button>
              </span>
                        ))}
                    </div>
                )}
            </div>

            {/* URLs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                        GitHub URL
                    </label>
                    <input
                        type="url"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target. value)}
                        placeholder="https://github.com/username/repo"
                        className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
              bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
              focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors
              placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                        Demo URL
                    </label>
                    <input
                        type="url"
                        value={demoUrl}
                        onChange={(e) => setDemoUrl(e.target. value)}
                        placeholder="https://demo.example.com"
                        className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
              bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
              focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors
              placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary"
                    />
                </div>
            </div>

            {/* Team Members */}
            <div>
                <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                    Team Members ({selectedTeam.length})
                </label>
                {people.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto
            p-4 bg-background dark:bg-background-dark rounded-lg border-2 border-border dark:border-border-dark">
                        {people.map(person => (
                            <label
                                key={person.id}
                                className="flex items-center gap-2 p-2 rounded hover:bg-cardBg dark:hover:bg-cardBg-dark
                  cursor-pointer transition-colors"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedTeam. includes(person.id)}
                                    onChange={() => toggleTeamMember(person.id)}
                                    className="w-4 h-4 text-primary focus:ring-primary rounded"
                                />
                                <span className="text-sm text-text dark:text-text-dark">{person.name}</span>
                            </label>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-text-secondary dark:text-text-darkSecondary italic">
                        No people in your database.  Add people first!
                    </p>
                )}
            </div>

            {/* Notes */}
            <div>
                <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                    Notes
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="Additional notes about this project..."
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
                    {project ? 'Update Project' : 'Create Project'}
                </Button>
            </div>
        </form>
    )
}