'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Skill, SkillCategory, SkillType, SkillLevel, SkillDifficulty } from '@/types'
import { Button } from '@/components/ui/Button'
import { X, Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'

interface SkillFormProps {
    skill?: Skill
}

const categories: { value: SkillCategory; label: string; emoji: string }[] = [
    { value: 'web', label: 'Web Development', emoji: '🌐' },
    { value: 'mobile', label: 'Mobile', emoji: '📱' },
    { value: 'iot', label: 'IoT', emoji: '🔌' },
    { value: 'ai', label: 'AI/ML', emoji: '🤖' },
    { value: 'devops', label: 'DevOps', emoji: '🚀' },
    { value: 'data', label: 'Data Science', emoji: '📊' },
    { value: 'embedded', label: 'Embedded Systems', emoji: '⚡' },
    { value: 'design', label: 'Design', emoji: '🎨' },
    { value: 'soft-skill', label: 'Soft Skills', emoji: '🧠' },
]

const skillTypes: { value: SkillType; label: string; emoji: string }[] = [
    { value: 'language', label: 'Programming Language', emoji: '💻' },
    { value: 'framework', label: 'Framework', emoji: '🏗️' },
    { value: 'library', label: 'Library', emoji: '📚' },
    { value: 'tool', label: 'Tool', emoji: '🔧' },
    { value: 'platform', label: 'Platform', emoji: '☁️' },
    { value: 'hardware', label: 'Hardware', emoji: '⚙️' },
    { value: 'soft-skill', label: 'Soft Skill', emoji: '🧠' },
]

const levels: { value: SkillLevel; label: string; description: string }[] = [
    { value: 'beginner', label: 'Beginner', description: 'Just started learning' },
    { value: 'intermediate', label: 'Intermediate', description: 'Can build basic projects' },
    { value: 'advanced', label: 'Advanced', description: 'Can handle complex tasks' },
    { value: 'expert', label: 'Expert', description: 'Master level proficiency' },
]

const difficulties: { value: SkillDifficulty; label: string; description: string }[] = [
    { value: 'easy', label: 'Easy', description: 'Quick to learn' },
    { value: 'medium', label: 'Medium', description: 'Moderate learning curve' },
    { value: 'hard', label: 'Hard', description: 'Steep learning curve' },
    { value: 'insane', label: 'Insane 💀', description: 'Extremely challenging' },
]

const resourceTypes = [
    { value: 'youtube', label: 'YouTube' },
    { value: 'course', label: 'Online Course' },
    { value: 'documentation', label: 'Documentation' },
    { value: 'article', label: 'Article' },
    { value: 'book', label: 'Book' },
    { value: 'other', label: 'Other' },
]

export function SkillForm({ skill }: SkillFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    // Form state
    const [name, setName] = useState(skill?.name || '')
    const [category, setCategory] = useState<SkillCategory>(skill?.category || 'web')
    const [skillType, setSkillType] = useState<SkillType>(skill?.skill_type || 'language')
    const [level, setLevel] = useState<SkillLevel>(skill?.level || 'beginner')
    const [difficulty, setDifficulty] = useState<SkillDifficulty>(skill?.difficulty || 'medium')
    const [progress, setProgress] = useState(skill?.progress || 0)
    const [practiceHours, setPracticeHours] = useState(skill?.practice_hours || 0)
    const [description, setDescription] = useState(skill?.description || '')
    const [iconUrl, setIconUrl] = useState(skill?.icon_url || '')
    const [learningSince, setLearningSince] = useState(
        skill?.learning_since ? skill.learning_since.split('T')[0] : ''
    )
    const [lastPracticed, setLastPracticed] = useState(
        skill?.last_practiced ? skill.last_practiced.split('T')[0] : ''
    )
    const [notes, setNotes] = useState(skill?.notes || '')
    const [isFeatured, setIsFeatured] = useState(skill?.is_featured || false)

    // Arrays
    const [tags, setTags] = useState<string[]>(skill?.tags || [])
    const [tagInput, setTagInput] = useState('')

    // Resources
    const [resources, setResources] = useState<Array<{
        title: string
        url: string
        type: string
        completed: boolean
    }>>(skill?.resources?.map(r => ({ ...r, completed: r.completed ?? false })) || [])
    const [showResourceForm, setShowResourceForm] = useState(false)
    const [newResource, setNewResource] = useState({
        title: '',
        url: '',
        type: 'youtube',
        completed: false
    })

    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()])
            setTagInput('')
        }
    }

    const handleRemoveTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag))
    }

    const handleAddResource = () => {
        if (newResource.title.trim() && newResource.url.trim()) {
            setResources([...resources, { ...newResource }])
            setNewResource({ title: '', url: '', type: 'youtube', completed: false })
            setShowResourceForm(false)
        }
    }

    const handleRemoveResource = (index: number) => {
        setResources(resources.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React. FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const skillData = {
                user_id: user.id,
                name,
                category,
                skill_type: skillType,
                level,
                difficulty,
                progress,
                practice_hours: practiceHours,
                description: description || null,
                icon_url: iconUrl || null,
                learning_since: learningSince || null,
                last_practiced: lastPracticed || null,
                notes: notes || null,
                tags: tags.length > 0 ? tags : null,
                resources: resources.length > 0 ? resources : null,
                is_featured: isFeatured,
                updated_at: new Date().toISOString(),
            }

            if (skill) {
                // Update existing skill
                const { error } = await supabase
                    .from('skills')
                    .update(skillData)
                    .eq('id', skill. id)

                if (error) throw error
            } else {
                // Create new skill
                const { error } = await supabase
                    .from('skills')
                    .insert(skillData)

                if (error) throw error
            }

            router.push('/skills')
            router.refresh()
        } catch (error: any) {
            console.error('Error saving skill:', error)
            alert(error.message || 'Failed to save skill')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name & Icon */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                        Skill Name *
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="e.g., Python, React, ESP32"
                        className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
              bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
              focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors
              placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                        Icon/Emoji
                    </label>
                    <input
                        type="text"
                        value={iconUrl}
                        onChange={(e) => setIconUrl(e.target.value)}
                        placeholder="🐍"
                        maxLength={10}
                        className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
              bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark text-center text-2xl
              focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                    />
                </div>
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                    Description
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e. target.value)}
                    rows={3}
                    placeholder="What is this skill about?"
                    className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
            bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
            focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors
            placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary resize-none"
                />
            </div>

            {/* Category & Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                        Category *
                    </label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as SkillCategory)}
                        required
                        className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
              bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
              focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                    >
                        {categories. map(cat => (
                            <option key={cat.value} value={cat.value}>
                                {cat.emoji} {cat.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                        Skill Type *
                    </label>
                    <select
                        value={skillType}
                        onChange={(e) => setSkillType(e.target.value as SkillType)}
                        required
                        className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
              bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
              focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                    >
                        {skillTypes.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.emoji} {type. label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Level & Difficulty - SEPARATED!   */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                        Your Level *
                    </label>
                    <div className="space-y-2">
                        {levels.map(lvl => (
                            <label
                                key={lvl.value}
                                className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                    level === lvl.value
                                        ? 'border-primary dark:border-primary-dark bg-primary/5 dark:bg-primary-dark/5'
                                        : 'border-border dark:border-border-dark hover:border-primary/50 dark:hover:border-primary-dark/50'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="level"
                                    value={lvl.value}
                                    checked={level === lvl.value}
                                    onChange={(e) => setLevel(e.target.value as SkillLevel)}
                                    className="mt-1"
                                />
                                <div>
                                    <p className="font-medium text-text dark:text-text-dark text-sm">{lvl.label}</p>
                                    <p className="text-xs text-text-secondary dark:text-text-darkSecondary">{lvl.description}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                        Difficulty *
                    </label>
                    <div className="space-y-2">
                        {difficulties.map(diff => (
                            <label
                                key={diff.value}
                                className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                    difficulty === diff.value
                                        ? 'border-primary dark:border-primary-dark bg-primary/5 dark:bg-primary-dark/5'
                                        : 'border-border dark:border-border-dark hover:border-primary/50 dark:hover:border-primary-dark/50'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="difficulty"
                                    value={diff. value}
                                    checked={difficulty === diff.value}
                                    onChange={(e) => setDifficulty(e.target.value as SkillDifficulty)}
                                    className="mt-1"
                                />
                                <div>
                                    <p className="font-medium text-text dark:text-text-dark text-sm">{diff.label}</p>
                                    <p className="text-xs text-text-secondary dark:text-text-darkSecondary">{diff.description}</p>
                                </div>
                            </label>
                        ))}
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
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mt-2">
                    <div
                        className={`h-3 rounded-full transition-all ${
                            progress === 100 ? 'bg-green-500' : 'bg-primary dark:bg-primary-dark'
                        }`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Practice Hours - BIG FEATURE!  */}
            <div>
                <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                    Practice Hours
                </label>
                <div className="relative">
                    <input
                        type="number"
                        min="0"
                        value={practiceHours}
                        onChange={(e) => setPracticeHours(parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
              bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
              focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary dark:text-text-darkSecondary">
            hours
          </span>
                </div>
                <p className="text-xs text-text-secondary dark:text-text-darkSecondary mt-1">
                    Track how many hours you've practiced this skill
                </p>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                        Learning Since
                    </label>
                    <input
                        type="date"
                        value={learningSince}
                        onChange={(e) => setLearningSince(e. target.value)}
                        className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
              bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
              focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                        Last Practiced
                    </label>
                    <input
                        type="date"
                        value={lastPracticed}
                        onChange={(e) => setLastPracticed(e.target.value)}
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

            {/* Resources */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-text dark:text-text-dark">
                        Learning Resources
                    </label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowResourceForm(! showResourceForm)}
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Resource
                    </Button>
                </div>

                {/* Add Resource Form */}
                {showResourceForm && (
                    <div className="mb-4 p-4 bg-background dark:bg-background-dark rounded-lg border-2 border-border dark:border-border-dark space-y-3">
                        <input
                            type="text"
                            value={newResource. title}
                            onChange={(e) => setNewResource({ ...newResource, title: e. target.value })}
                            placeholder="Resource title"
                            className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
                bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
                focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                        />
                        <input
                            type="url"
                            value={newResource.url}
                            onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                            placeholder="https://..."
                            className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
                bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
                focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                        />
                        <div className="flex gap-2">
                            <select
                                value={newResource.type}
                                onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                                className="flex-1 px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
                  bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
                  focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                            >
                                {resourceTypes.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                            <Button type="button" onClick={handleAddResource} variant="primary" size="sm">
                                Add
                            </Button>
                            <Button
                                type="button"
                                onClick={() => setShowResourceForm(false)}
                                variant="outline"
                                size="sm"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}

                {/* Resources List */}
                {resources.length > 0 && (
                    <div className="space-y-2">
                        {resources.map((resource, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 p-3 bg-background dark:bg-background-dark rounded-lg
                  border border-border dark:border-border-dark"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-text dark:text-text-dark truncate">
                                        {resource.title}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={resource.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-primary dark:text-primary-dark hover:underline truncate"
                                        >
                                            {resource.url}
                                        </a>
                                        <span className="text-xs text-text-secondary dark:text-text-darkSecondary">
                      ({resource.type})
                    </span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveResource(index)}
                                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950
                    rounded-lg transition-colors"
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
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="Additional notes about this skill..."
                    className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
            bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
            focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors
            placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary resize-none"
                />
            </div>

            {/* Featured */}
            <div className="flex items-center gap-3 p-4 bg-yellow-500/5 border-2 border-yellow-500/20 rounded-lg">
                <input
                    type="checkbox"
                    id="featured"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4"
                />
                <label htmlFor="featured" className="text-sm text-text dark:text-text-dark cursor-pointer">
                    ⭐ Mark as featured skill (show on portfolio/profile)
                </label>
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
                    {skill ?  'Update Skill' : 'Create Skill'}
                </Button>
            </div>
        </form>
    )
}