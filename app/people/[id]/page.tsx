'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { ContactButton } from '@/components/people/ContactButton'
import {
    ArrowLeft,
    Edit2,
    Trash2,
    User,
    Briefcase,
    Tag,
    Globe,
    MessageSquare,
    Calendar
} from 'lucide-react'
import Link from 'next/link'
import type { Person } from '@/types'

export default function PersonDetailPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const params = useParams()
    const supabase = createClient()

    const [person, setPerson] = useState<Person | null>(null)
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login')
        }
    }, [user, authLoading, router])

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
            setPerson(data)
        } catch (error) {
            console.error('Error fetching person:', error)
            router.push('/people')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!person) return

        if (!confirm(`Are you sure you want to delete ${person.name}? This action cannot be undone.`)) {
            return
        }

        setDeleting(true)

        try {
            const { error } = await supabase
                .from('people')
                .delete()
                .eq('id', person.id)

            if (error) throw error

            router.push('/people')
            router.refresh()
        } catch (error) {
            console.error('Error deleting person:', error)
            alert('Failed to delete person')
            setDeleting(false)
        }
    }

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-primary-dark mx-auto mb-4"></div>
                    <p className="text-text-secondary dark:text-text-darkSecondary">Loading...</p>
                </div>
            </div>
        )
    }

    if (!user || !person) return null

    const initials = person.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    const availableContacts = person.contacts
        ? Object.entries(person.contacts).filter(([_, value]) => value && value.trim() !== '')
        : []

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="space-y-4">
                <Link
                    href="/people"
                    className="inline-flex items-center gap-2 text-sm text-text-secondary dark:text-text-darkSecondary
            hover:text-primary dark:hover:text-primary-dark transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Back to People</span>
                </Link>

                {/* Profile Header */}
                <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                        {/* Avatar */}
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/20 dark:bg-primary-dark/20
              flex items-center justify-center flex-shrink-0">
              <span className="text-3xl md:text-4xl font-bold text-primary dark:text-primary-dark">
                {initials}
              </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl md:text-3xl font-bold text-text dark:text-text-dark mb-2">
                                {person.name}
                            </h1>

                            {person.profession && (
                                <div className="flex items-center gap-2 text-text-secondary dark:text-text-darkSecondary mb-3">
                                    <Briefcase className="w-4 h-4 flex-shrink-0" />
                                    <span>{person.profession}</span>
                                </div>
                            )}

                            {person.role && (
                                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium
                  bg-accent/20 dark:bg-accent-dark/20 text-accent dark:text-accent-dark mb-3">
                                    <User className="w-4 h-4" />
                                    {person.role}
                                </div>
                            )}

                            <div className="flex items-center gap-2 text-xs text-text-secondary dark:text-text-darkSecondary mt-4">
                                <Calendar className="w-3 h-3" />
                                <span>Added {formatDate(person.created_at)}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                            <Link href={`/people/${person.id}/edit`} className="flex-1 sm:flex-initial">
                                <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-2">
                                    <Edit2 className="w-4 h-4" />
                                    Edit
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDelete}
                                loading={deleting}
                                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 text-red-500 dark:text-red-400
                  border-red-500 dark:border-red-400 hover:bg-red-500/10"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Skills */}
            {person.skills && person.skills.length > 0 && (
                <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary-dark/10 flex items-center justify-center">
                            <Tag className="w-4 h-4 text-primary dark:text-primary-dark" />
                        </div>
                        <h2 className="text-lg md:text-xl font-semibold text-text dark:text-text-dark">
                            Skills
                        </h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {person.skills.map((skill, idx) => (
                            <span
                                key={idx}
                                className="px-3 py-1.5 text-sm rounded-lg bg-primary/10 dark:bg-primary-dark/10
                  text-primary dark:text-primary-dark font-medium"
                            >
                {skill}
              </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Tags */}
            {person.tags && person.tags.length > 0 && (
                <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary-dark/10 flex items-center justify-center">
                            <Tag className="w-4 h-4 text-primary dark:text-primary-dark" />
                        </div>
                        <h2 className="text-lg md:text-xl font-semibold text-text dark:text-text-dark">
                            Tags
                        </h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {person.tags.map((tag, idx) => (
                            <span
                                key={idx}
                                className="px-3 py-1.5 text-sm rounded-lg bg-accent/10 dark:bg-accent-dark/10
                  text-accent dark:text-accent-dark font-medium"
                            >
                {tag}
              </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Contact Information */}
            {availableContacts.length > 0 && (
                <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary-dark/10 flex items-center justify-center">
                            <Globe className="w-4 h-4 text-primary dark:text-primary-dark" />
                        </div>
                        <h2 className="text-lg md:text-xl font-semibold text-text dark:text-text-dark">
                            Contact Information
                        </h2>
                    </div>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {availableContacts.map(([type, value]) => (
                            <ContactButton
                                key={type}
                                type={type as any}
                                value={value as string}
                                size="md"
                                showLabel={true}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Notes */}
            {person.notes && (
                <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary-dark/10 flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-primary dark:text-primary-dark" />
                        </div>
                        <h2 className="text-lg md:text-xl font-semibold text-text dark:text-text-dark">
                            Notes
                        </h2>
                    </div>
                    <p className="text-text dark:text-text-dark whitespace-pre-wrap leading-relaxed">
                        {person.notes}
                    </p>
                </div>
            )}

            {/* Empty State for No Additional Info */}
            {!person.skills?.length && !person.tags?.length && !availableContacts.length && !person.notes && (
                <div className="text-center py-12 bg-cardBg dark:bg-cardBg-dark border-2 border-dashed
          border-border dark:border-border-dark rounded-xl">
                    <p className="text-text-secondary dark:text-text-darkSecondary mb-4">
                        No additional information available
                    </p>
                    <Link href={`/people/${person.id}/edit`}>
                        <Button variant="outline" size="sm" className="inline-flex items-center gap-2">
                            <Edit2 className="w-4 h-4" />
                            Add More Details
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    )
}