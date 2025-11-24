'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { TagInput } from '@/components/ui/TagInput'
import { ArrowLeft, Save, User, Tag, Globe, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import type { PersonFormData, Person } from '@/types'

export default function EditPersonPage() {
    const { user } = useAuth()
    const router = useRouter()
    const params = useParams()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState<PersonFormData>({
        name: '',
        profession: '',
        skills: [],
        role: '',
        tags: [],
        contacts: {
            instagram: '',
            whatsapp: '',
            linkedin: '',
            github: '',
            discord: '',
            email: '',
            phone: '',
            twitter: '',
            telegram: '',
            website: ''
        },
        notes: ''
    })

    useEffect(() => {
        if (user && params.id) {
            fetchPerson()
        }
    }, [user, params.id])

    const fetchPerson = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('people')
                .select('*')
                .eq('id', params.id)
                .single()

            if (error) throw error

            // Populate form with existing data
            setFormData({
                name: data.name || '',
                profession: data.profession || '',
                skills: data.skills || [],
                role: data.role || '',
                tags: data.tags || [],
                contacts: {
                    instagram: data.contacts?.instagram || '',
                    whatsapp: data.contacts?.whatsapp || '',
                    linkedin: data.contacts?.linkedin || '',
                    github: data.contacts?.github || '',
                    discord: data.contacts?.discord || '',
                    email: data.contacts?.email || '',
                    phone: data.contacts?.phone || '',
                    twitter: data.contacts?.twitter || '',
                    telegram: data.contacts?.telegram || '',
                    website: data.contacts?.website || ''
                },
                notes: data.notes || ''
            })
        } catch (error) {
            console.error('Error fetching person:', error)
            router.push('/people')
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            contacts: { ...prev.contacts, [name]: value }
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!user) {
            setError('You must be logged in')
            return
        }

        if (!formData.name.trim()) {
            setError('Name is required')
            return
        }

        setSaving(true)
        setError('')

        try {
            const cleanedContacts = Object.entries(formData.contacts).reduce((acc, [key, value]) => {
                if (value && value.trim() !== '') {
                    acc[key] = value.trim()
                }
                return acc
            }, {} as Record<string, string>)

            const { error: updateError } = await supabase
                .from('people')
                .update({
                    name: formData.name.trim(),
                    profession: formData.profession.trim() || null,
                    skills: formData.skills.length > 0 ? formData.skills : null,
                    role: formData.role.trim() || null,
                    tags: formData.tags.length > 0 ? formData.tags : null,
                    contacts: Object.keys(cleanedContacts).length > 0 ? cleanedContacts : null,
                    notes: formData.notes.trim() || null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', params.id)

            if (updateError) throw updateError

            router.push(`/people/${params.id}`)
            router.refresh()
        } catch (err: any) {
            console.error('Error updating person:', err)
            setError(err.message || 'Failed to update person')
        } finally {
            setSaving(false)
        }
    }

    const roleOptions = [
        'Friend',
        'Colleague',
        'Client',
        'Mentor',
        'Student',
        'Freelancer',
        'Business Partner',
        'Family',
        'Teacher',
        'Other'
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-primary-dark mx-auto mb-4"></div>
                    <p className="text-text-secondary dark:text-text-darkSecondary">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="space-y-4">
                <Link
                    href={`/people/${params.id}`}
                    className="inline-flex items-center gap-2 text-sm text-text-secondary dark:text-text-darkSecondary
            hover:text-primary dark:hover:text-primary-dark transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Details</span>
                </Link>

                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-text dark:text-text-dark mb-2">
                        Edit Person
                    </h1>
                    <p className="text-text-secondary dark:text-text-darkSecondary text-sm md:text-base">
                        Update information for {formData.name}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-4 md:mb-6">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary-dark/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary dark:text-primary-dark" />
                        </div>
                        <h2 className="text-lg md:text-xl font-semibold text-text dark:text-text-dark">
                            Basic Information
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <Input
                            label="Name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            required
                        />

                        <Input
                            label="Profession"
                            name="profession"
                            value={formData.profession}
                            onChange={handleInputChange}
                            placeholder="Software Engineer"
                        />

                        <div>
                            <label className="block text-sm font-medium mb-2 text-text dark:text-text-dark">
                                Role
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
                  bg-background dark:bg-background-dark text-text dark:text-text-dark
                  focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                            >
                                <option value="">Select a role...</option>
                                {roleOptions.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Skills & Tags */}
                <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-4 md:mb-6">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary-dark/10 flex items-center justify-center">
                            <Tag className="w-4 h-4 text-primary dark:text-primary-dark" />
                        </div>
                        <h2 className="text-lg md:text-xl font-semibold text-text dark:text-text-dark">
                            Skills & Tags
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <TagInput
                            label="Skills"
                            tags={formData.skills}
                            setTags={(skills) => setFormData(prev => ({ ...prev, skills }))}
                            placeholder="e.g., Python, IoT, Web Development"
                        />

                        <TagInput
                            label="Tags"
                            tags={formData.tags}
                            setTags={(tags) => setFormData(prev => ({ ...prev, tags }))}
                            placeholder="e.g., Tech, Content Creator, Mentor"
                        />
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-4 md:mb-6">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary-dark/10 flex items-center justify-center">
                            <Globe className="w-4 h-4 text-primary dark:text-primary-dark" />
                        </div>
                        <h2 className="text-lg md:text-xl font-semibold text-text dark:text-text-dark">
                            Contact Information
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <Input
                            label="Instagram"
                            name="instagram"
                            value={formData.contacts.instagram}
                            onChange={handleContactChange}
                            placeholder="@username"
                        />

                        <Input
                            label="WhatsApp"
                            name="whatsapp"
                            value={formData.contacts.whatsapp}
                            onChange={handleContactChange}
                            placeholder="081234567890"
                        />

                        <Input
                            label="LinkedIn"
                            name="linkedin"
                            value={formData.contacts.linkedin}
                            onChange={handleContactChange}
                            placeholder="username"
                        />

                        <Input
                            label="GitHub"
                            name="github"
                            value={formData.contacts.github}
                            onChange={handleContactChange}
                            placeholder="@username"
                        />

                        <Input
                            label="Discord"
                            name="discord"
                            value={formData.contacts.discord}
                            onChange={handleContactChange}
                            placeholder="username#1234"
                        />

                        <Input
                            label="Twitter"
                            name="twitter"
                            value={formData.contacts.twitter}
                            onChange={handleContactChange}
                            placeholder="@username"
                        />

                        <Input
                            label="Telegram"
                            name="telegram"
                            value={formData.contacts.telegram}
                            onChange={handleContactChange}
                            placeholder="@username"
                        />

                        <Input
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.contacts.email}
                            onChange={handleContactChange}
                            placeholder="email@example.com"
                        />

                        <Input
                            label="Phone"
                            name="phone"
                            value={formData.contacts.phone}
                            onChange={handleContactChange}
                            placeholder="081234567890"
                        />

                        <Input
                            label="Website"
                            name="website"
                            value={formData.contacts.website}
                            onChange={handleContactChange}
                            placeholder="https://example.com"
                        />
                    </div>
                </div>

                {/* Notes */}
                <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-4 md:mb-6">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary-dark/10 flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-primary dark:text-primary-dark" />
                        </div>
                        <h2 className="text-lg md:text-xl font-semibold text-text dark:text-text-dark">
                            Additional Notes
                        </h2>
                    </div>

                    <Textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Any additional information, how you met, projects together, etc..."
                        rows={6}
                    />
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500 dark:border-red-400
            text-red-500 dark:text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Submit Buttons */}
                <div className="sticky bottom-4 bg-cardBg dark:bg-cardBg-dark p-4 rounded-xl border-2
          border-border dark:border-border-dark shadow-lg flex gap-3 justify-end">
                    <Link href={`/people/${params.id}`}>
                        <Button type="button" variant="outline" size="sm">
                            Cancel
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        loading={saving}
                        className="flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
    )
}