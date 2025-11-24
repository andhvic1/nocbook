'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Briefcase, Tag, Eye, Edit2, Trash2 } from 'lucide-react'
import type { Person } from '@/types'
import { ContactButton } from './ContactButton'
import { DropdownMenu, DropdownItem } from '@/components/ui/DropdownMenu'
import { createClient } from '@/lib/supabase'

interface PeopleCardProps {
    person: Person
    onDelete?: () => void
}

export function PeopleCard({ person, onDelete }: PeopleCardProps) {
    const router = useRouter()
    const supabase = createClient()
    const [deleting, setDeleting] = useState(false)

    const initials = person.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    // Get available contacts
    const availableContacts = person.contacts
        ? Object.entries(person.contacts).filter(([_, value]) => value && value.trim() !== '')
        : []

    const handleView = (e: React.MouseEvent) => {
        e.stopPropagation()
        router.push(`/people/${person.id}`)
    }

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation()
        router.push(`/people/${person.id}/edit`)
    }

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation()

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

            if (onDelete) {
                onDelete()
            }
        } catch (error) {
            console.error('Error deleting person:', error)
            alert('Failed to delete person')
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className={`group bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark 
      rounded-xl p-4 md:p-6 hover:border-primary dark:hover:border-primary-dark 
      hover:shadow-lg transition-all duration-200 ${deleting ? 'opacity-50 pointer-events-none' : ''}`}>

            {/* Header: Avatar + Name + Dropdown */}
            <div className="flex items-start gap-3 md:gap-4 mb-4">
                {/* Avatar & Name - Clickable to detail */}
                <Link href={`/people/${person.id}`} className="flex items-start gap-3 md:gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/20 dark:bg-primary-dark/20
            flex items-center justify-center flex-shrink-0">
            <span className="text-lg md:text-xl font-bold text-primary dark:text-primary-dark">
              {initials}
            </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base md:text-lg font-bold text-text dark:text-text-dark group-hover:text-primary
              dark:group-hover:text-primary-dark transition-colors truncate">
                            {person.name}
                        </h3>
                        {person.profession && (
                            <div className="flex items-center gap-1 text-text-secondary dark:text-text-darkSecondary text-xs md:text-sm mt-1">
                                <Briefcase className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                                <span className="truncate">{person.profession}</span>
                            </div>
                        )}
                    </div>
                </Link>

                {/* Dropdown Menu */}
                <DropdownMenu>
                    <DropdownItem
                        onClick={handleView}
                        icon={<Eye className="w-4 h-4" />}
                        label="View Details"
                    />
                    <DropdownItem
                        onClick={handleEdit}
                        icon={<Edit2 className="w-4 h-4" />}
                        label="Edit"
                    />
                    <div className="border-t border-border dark:border-border-dark my-1" />
                    <DropdownItem
                        onClick={handleDelete}
                        icon={<Trash2 className="w-4 h-4" />}
                        label="Delete"
                        variant="danger"
                    />
                </DropdownMenu>
            </div>

            {/* Role */}
            {person.role && (
                <div className="mb-3">
          <span className="inline-flex items-center gap-1 px-2 md:px-3 py-1 rounded-full text-xs font-medium
            bg-accent/20 dark:bg-accent-dark/20 text-accent dark:text-accent-dark">
            <User className="w-3 h-3" />
              {person.role}
          </span>
                </div>
            )}

            {/* Skills */}
            {person.skills && person.skills.length > 0 && (
                <div className="mb-3">
                    <div className="flex flex-wrap gap-2">
                        {person.skills.slice(0, 3).map((skill, idx) => (
                            <span
                                key={idx}
                                className="px-2 py-1 text-xs rounded-md bg-primary/10 dark:bg-primary-dark/10
                  text-primary dark:text-primary-dark"
                            >
                {skill}
              </span>
                        ))}
                        {person.skills.length > 3 && (
                            <span className="px-2 py-1 text-xs rounded-md bg-gray-100 dark:bg-gray-800
                text-text-secondary dark:text-text-darkSecondary">
                +{person.skills.length - 3}
              </span>
                        )}
                    </div>
                </div>
            )}

            {/* Tags */}
            {person.tags && person.tags.length > 0 && (
                <div className="mb-3">
                    <div className="flex items-center gap-1 text-text-secondary dark:text-text-darkSecondary text-xs md:text-sm">
                        <Tag className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                        <span className="truncate">{person.tags.slice(0, 2).join(', ')}{person.tags.length > 2 && '...'}</span>
                    </div>
                </div>
            )}

            {/* Contacts - CLICKABLE! */}
            {availableContacts.length > 0 && (
                <div className="pt-3 border-t border-border dark:border-border-dark">
                    <p className="text-xs text-text-secondary dark:text-text-darkSecondary mb-2 font-medium">
                        Quick Contact:
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {availableContacts.slice(0, 5).map(([type, value]) => (
                            <ContactButton
                                key={type}
                                type={type as any}
                                value={value as string}
                                size="sm"
                            />
                        ))}
                        {availableContacts.length > 5 && (
                            <span className="text-xs text-text-secondary dark:text-text-darkSecondary px-2 py-1">
                +{availableContacts.length - 5} more
              </span>
                        )}
                    </div>
                </div>
            )}

            {availableContacts.length === 0 && (
                <div className="pt-3 border-t border-border dark:border-border-dark">
                    <p className="text-xs text-text-secondary dark:text-text-darkSecondary text-center">
                        No contacts available
                    </p>
                </div>
            )}
        </div>
    )
}