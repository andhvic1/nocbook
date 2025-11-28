'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase'
import { EventForm } from '@/components/events/EventForm'
import { Button } from '@/components/ui/Button'
import { Event, Person } from '@/types'
import {
    ArrowLeft,
    Edit,
    Trash2,
    Calendar,
    MapPin,
    Building,
    DollarSign,
    Award,
    Users,
    FileText,
    Tag,
    Star,
    ExternalLink,
    Lightbulb,
    BookOpen,
    Youtube,
    Link as LinkIcon,
    Globe,
    Clock,
    Info
} from 'lucide-react'
import Link from 'next/link'

const eventTypeConfig: Record<string, { color: string; bgColor: string; label: string }> = {
    seminar: {
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-500/10',
        label: 'Seminar'
    },
    workshop: {
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-500/10',
        label: 'Workshop'
    },
    competition: {
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-500/10',
        label: 'Competition'
    },
    meetup: {
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-500/10',
        label: 'Meetup'
    },
    conference: {
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-500/10',
        label: 'Conference'
    },
}

const materialIcons: Record<string, any> = {
    pdf: FileText,
    slides: FileText,
    video: Youtube,
    notes: FileText,
    link: LinkIcon,
}

export default function EventDetailPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const params = useParams()
    const eventId = params.id as string

    const [event, setEvent] = useState<Event | null>(null)
    const [people, setPeople] = useState<Person[]>([])
    const [attendees, setAttendees] = useState<Person[]>([])
    const [materials, setMaterials] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [editMode, setEditMode] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        if (! authLoading && !user) {
            router.push('/login')
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (user && eventId) {
            fetchEvent()
            fetchPeople()
        }
    }, [user, eventId])

    // Check URL for edit parameter on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location. search)
            if (urlParams.get('edit') === 'true') {
                setEditMode(true)
            }
        }
    }, [])

    const fetchEvent = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('id', eventId)
                .single()

            if (error) throw error
            setEvent(data)

            // Fetch attendees
            const { data: eventPeople, error: peopleError } = await supabase
                .from('event_people')
                .select('person_id, people(*)')
                .eq('event_id', eventId)

            if (peopleError) throw peopleError
            setAttendees(eventPeople?.map(ep => ep.people).filter(Boolean).flat() || [])

            // Fetch materials
            const { data: eventMaterials, error: materialsError } = await supabase
                .from('event_materials')
                .select('*')
                .eq('event_id', eventId)
                .order('created_at', { ascending: true })

            if (materialsError) throw materialsError
            setMaterials(eventMaterials || [])
        } catch (error) {
            console.error('Error fetching event:', error)
            router.push('/events')
        } finally {
            setLoading(false)
        }
    }

    const fetchPeople = async () => {
        try {
            const { data, error } = await supabase
                .from('people')
                .select('*')
                .order('name', { ascending: true })

            if (error) throw error
            setPeople(data || [])
        } catch (error) {
            console.error('Error fetching people:', error)
        }
    }

    const handleDelete = async () => {
        setDeleting(true)
        try {
            const { error } = await supabase
                .from('events')
                .delete()
                .eq('id', eventId)

            if (error) throw error
            router.push('/events')
        } catch (error) {
            console.error('Error deleting event:', error)
            alert('Failed to delete event')
        } finally {
            setDeleting(false)
            setShowDeleteConfirm(false)
        }
    }

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-primary-dark mx-auto mb-4"></div>
                    <p className="text-text-secondary dark:text-text-darkSecondary">Loading event...</p>
                </div>
            </div>
        )
    }

    if (!user || !event) return null

    const typeColor = eventTypeConfig[event.event_type]?.color || 'text-gray-600'
    const typeBgColor = eventTypeConfig[event.event_type]?.bgColor || 'bg-gray-500/10'
    const typeLabel = eventTypeConfig[event. event_type]?.label || event.event_type

    const formatDate = (dateString?: string) => {
        if (! dateString) return null
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatTime = (timeString?: string) => {
        if (!timeString) return null
        const [hours, minutes] = timeString.split(':')
        const hour = parseInt(hours)
        const ampm = hour >= 12 ? 'PM' : 'AM'
        const displayHour = hour % 12 || 12
        return `${displayHour}:${minutes} ${ampm}`
    }

    const isPast = event.end_date
        ? new Date(event. end_date) < new Date()
        : event.start_date
            ? new Date(event.start_date) < new Date()
            : false

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
                                Edit Event
                            </h1>
                            <p className="text-text-secondary dark:text-text-darkSecondary text-sm mt-1">
                                Update your event details
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6 md:p-8">
                    <EventForm event={event} people={people} />
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
                        href="/events"
                        className="p-2 hover:bg-cardBg dark:hover:bg-cardBg-dark rounded-lg transition-colors flex-shrink-0"
                    >
                        <ArrowLeft className="w-5 h-5 text-text dark:text-text-dark" />
                    </Link>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl md:text-3xl font-bold text-text dark:text-text-dark mb-3">
                            {event.name}
                            {event.is_featured && (
                                <Star className="inline-block w-6 h-6 ml-2 text-yellow-500 fill-yellow-500" />
                            )}
                        </h1>
                        <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-lg text-sm font-medium ${typeBgColor} ${typeColor}`}>
                {typeLabel}
              </span>
                            {event.is_online ?  (
                                <span className="px-3 py-1 rounded-lg text-sm font-medium bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  Online Event
                </span>
                            ) : (
                                <span className="px-3 py-1 rounded-lg text-sm font-medium bg-gray-500/10 text-gray-600 dark:text-gray-400">
                  On-site Event
                </span>
                            )}
                            {event.cost === 0 ?  (
                                <span className="px-3 py-1 rounded-lg text-sm font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                  Free Event
                </span>
                            ) : (
                                <span className="px-3 py-1 rounded-lg text-sm font-medium bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                                    {event.cost. toLocaleString()}
                </span>
                            )}
                            {isPast && (
                                <span className="px-3 py-1 rounded-lg text-sm font-medium bg-gray-500/10 text-gray-600 dark:text-gray-400">
                  Past Event
                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
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

            {/* Main Content */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Event Details Card */}
                    <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-4">
                            Event Details
                        </h2>
                        <div className="space-y-4">
                            {/* Date & Time */}
                            {(event.start_date || event. end_date) && (
                                <div className="flex items-start gap-3">
                                    <Calendar className="w-5 h-5 text-text-secondary dark:text-text-darkSecondary flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {event.start_date && (
                                                <p className="text-sm font-medium text-text dark:text-text-dark">
                                                    {formatDate(event. start_date)}
                                                </p>
                                            )}
                                            {event.start_time && (
                                                <span className="flex items-center gap-1 text-sm text-text-secondary dark:text-text-darkSecondary">
                          <Clock className="w-4 h-4" />
                                                    {formatTime(event.start_time)}
                        </span>
                                            )}
                                        </div>
                                        {event.end_date && event.end_date !== event.start_date && (
                                            <div className="flex items-center gap-2 flex-wrap mt-2">
                                                <p className="text-sm text-text-secondary dark:text-text-darkSecondary">
                                                    to {formatDate(event.end_date)}
                                                </p>
                                                {event.end_time && (
                                                    <span className="flex items-center gap-1 text-sm text-text-secondary dark:text-text-darkSecondary">
                            <Clock className="w-4 h-4" />
                                                        {formatTime(event.end_time)}
                          </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Location - Online or Venue */}
                            {event.is_online ?  (
                                event.meeting_url && (
                                    <div className="flex items-start gap-3">
                                        <Globe className="w-5 h-5 text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-text-secondary dark:text-text-darkSecondary mb-1">
                                                Meeting Link
                                            </p>
                                            <a
                                                href={event.meeting_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-primary dark:text-primary-dark hover:underline flex items-center gap-1 break-all"
                                            >
                                                {event.meeting_url}
                                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                            </a>
                                        </div>
                                    </div>
                                )
                            ) : (
                                event.venue && (
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-text-secondary dark:text-text-darkSecondary flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-text-secondary dark:text-text-darkSecondary mb-1">
                                                Venue
                                            </p>
                                            <p className="text-sm text-text dark:text-text-dark">{event.venue}</p>
                                        </div>
                                    </div>
                                )
                            )}

                            {/* Organizer */}
                            {event.organizer && (
                                <div className="flex items-start gap-3">
                                    <Building className="w-5 h-5 text-text-secondary dark:text-text-darkSecondary flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-text-secondary dark:text-text-darkSecondary mb-1">
                                            Organizer
                                        </p>
                                        <p className="text-sm text-text dark:text-text-dark">{event.organizer}</p>
                                    </div>
                                </div>
                            )}

                            {/* Cost */}
                            <div className="flex items-start gap-3">
                                <DollarSign className="w-5 h-5 text-text-secondary dark:text-text-darkSecondary flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-xs font-medium text-text-secondary dark:text-text-darkSecondary mb-1">
                                        Cost
                                    </p>
                                    <p className="text-sm text-text dark:text-text-dark">
                                        {event.cost === 0 ? 'Free' : `$${event.cost.toLocaleString()}`}
                                    </p>
                                </div>
                            </div>

                            {/* Event Links */}
                            {(event.registration_url || event.event_info_url) && (
                                <div className="pt-4 border-t border-border dark:border-border-dark">
                                    <p className="text-xs font-medium text-text-secondary dark:text-text-darkSecondary mb-3">
                                        Event Links
                                    </p>
                                    <div className="space-y-2">
                                        {event.registration_url && (
                                            <a
                                                href={event.registration_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-sm text-primary dark:text-primary-dark hover:underline"
                                            >
                                                <LinkIcon className="w-4 h-4" />
                                                Registration Link
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                        {event.event_info_url && (
                                            <a
                                                href={event.event_info_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-sm text-primary dark:text-primary-dark hover:underline"
                                            >
                                                <Info className="w-4 h-4" />
                                                Event Information
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Certificate */}
                            {event.certificate_url && (
                                <div className="pt-4 border-t border-border dark:border-border-dark">
                                    <a
                                        href={event.certificate_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg hover:bg-yellow-500/10 transition-colors"
                                    >
                                        <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-text dark:text-text-dark">
                                                View Certificate
                                            </p>
                                            <p className="text-xs text-text-secondary dark:text-text-darkSecondary">
                                                Click to open certificate
                                            </p>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-text-secondary dark:text-text-darkSecondary" />
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Key Insights */}
                    {event.important_insights && event.important_insights.length > 0 && (
                        <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-4 flex items-center gap-2">
                                <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                Key Insights ({event.important_insights.length})
                            </h2>
                            <div className="space-y-3">
                                {event.important_insights.map((insight, index) => (
                                    <div
                                        key={index}
                                        className="flex gap-3 p-4 bg-primary/5 dark:bg-primary-dark/5 rounded-lg border border-primary/10 dark:border-primary-dark/10"
                                    >
                    <span className="text-primary dark:text-primary-dark font-semibold min-w-[24px]">
                      {index + 1}.
                    </span>
                                        <p className="text-sm text-text dark:text-text-dark">{insight}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* People Met */}
                    {attendees.length > 0 && (
                        <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                People Met ({attendees.length})
                            </h2>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {attendees.map(person => (
                                    <Link
                                        key={person.id}
                                        href={`/people/${person.id}`}
                                        className="flex items-center gap-3 p-3 bg-background dark:bg-background-dark rounded-lg
                      hover:bg-primary/5 dark:hover:bg-primary-dark/5 border border-border dark:border-border-dark
                      hover:border-primary/50 dark:hover:border-primary-dark/50 transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary-dark/10
                      flex items-center justify-center text-primary dark:text-primary-dark font-semibold flex-shrink-0">
                                            {person.name.charAt(0). toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-text dark:text-text-dark group-hover:text-primary
                        dark:group-hover:text-primary-dark transition-colors truncate">
                                                {person. name}
                                            </p>
                                            {person.profession && (
                                                <p className="text-xs text-text-secondary dark:text-text-darkSecondary truncate">
                                                    {person. profession}
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Materials */}
                    {materials.length > 0 && (
                        <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-4 flex items-center gap-2">
                                <BookOpen className="w-5 h-5" />
                                Materials ({materials.length})
                            </h2>
                            <div className="space-y-3">
                                {materials.map((material) => {
                                    const Icon = materialIcons[material.type] || LinkIcon
                                    return (
                                        <a
                                            key={material.id}
                                            href={material. url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-start gap-3 p-4 bg-background dark:bg-background-dark rounded-lg
                        hover:bg-primary/5 dark:hover:bg-primary-dark/5 border border-border dark:border-border-dark
                        hover:border-primary/50 dark:hover:border-primary-dark/50 transition-all group"
                                        >
                                            <Icon className="w-5 h-5 text-text-secondary dark:text-text-darkSecondary
                        group-hover:text-primary dark:group-hover:text-primary-dark transition-colors flex-shrink-0 mt-0.5" />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-text dark:text-text-dark group-hover:text-primary
                          dark:group-hover:text-primary-dark transition-colors">
                                                    {material.title}
                                                </p>
                                                {material.url && (
                                                    <p className="text-xs text-text-secondary dark:text-text-darkSecondary mt-1 truncate">
                                                        {material. url}
                                                    </p>
                                                )}
                                                <span className="inline-block mt-2 px-2 py-0.5 bg-background dark:bg-cardBg-dark rounded text-xs
                          text-text-secondary dark:text-text-darkSecondary">
                          {material.type}
                        </span>
                                            </div>
                                            <ExternalLink className="w-4 h-4 text-text-secondary dark:text-text-darkSecondary flex-shrink-0" />
                                        </a>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    {event.tags && event.tags.length > 0 && (
                        <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-3 flex items-center gap-2">
                                <Tag className="w-5 h-5" />
                                Tags
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {event. tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1. 5 bg-primary/10 text-primary dark:text-primary-dark rounded-full text-sm font-medium"
                                    >
                    {tag}
                  </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    {event.notes && (
                        <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-3 flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Notes
                            </h2>
                            <p className="text-text-secondary dark:text-text-darkSecondary whitespace-pre-wrap">
                                {event.notes}
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Column - Quick Info */}
                <div className="space-y-6">
                    {/* Quick Stats */}
                    <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-4">
                            Quick Stats
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-text-secondary dark:text-text-darkSecondary">Type</span>
                                <span className={`text-sm font-medium ${typeColor}`}>{typeLabel}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-text-secondary dark:text-text-darkSecondary">Format</span>
                                <span className={`text-sm font-medium ${event.is_online ? 'text-cyan-600 dark:text-cyan-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  {event.is_online ? 'Online' : 'On-site'}
                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-text-secondary dark:text-text-darkSecondary">Cost</span>
                                <span className="text-sm font-medium text-text dark:text-text-dark">
                  {event.cost === 0 ? 'Free' : `$${event.cost.toLocaleString()}`}
                </span>
                            </div>
                            {attendees.length > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-text-secondary dark:text-text-darkSecondary">People Met</span>
                                    <span className="text-sm font-medium text-text dark:text-text-dark">{attendees.length}</span>
                                </div>
                            )}
                            {materials.length > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-text-secondary dark:text-text-darkSecondary">Materials</span>
                                    <span className="text-sm font-medium text-text dark:text-text-dark">{materials.length}</span>
                                </div>
                            )}
                            {event.important_insights && event.important_insights.length > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-text-secondary dark:text-text-darkSecondary">Insights</span>
                                    <span className="text-sm font-medium text-text dark:text-text-dark">
                    {event.important_insights.length}
                  </span>
                                </div>
                            )}
                            {event.certificate_url && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-text-secondary dark:text-text-darkSecondary">Certificate</span>
                                    <Award className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
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
                                <p className="text-xs text-text-secondary dark:text-text-darkSecondary mb-1">Added</p>
                                <p className="text-sm text-text dark:text-text-dark font-medium">
                                    {new Date(event.created_at). toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                            {event.updated_at !== event.created_at && (
                                <div>
                                    <p className="text-xs text-text-secondary dark:text-text-darkSecondary mb-1">Last Updated</p>
                                    <p className="text-sm text-text dark:text-text-dark font-medium">
                                        {new Date(event.updated_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
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
                            Delete Event?
                        </h3>
                        <p className="text-text-secondary dark:text-text-darkSecondary mb-6">
                            Are you sure you want to delete "{event.name}"? This action cannot be undone.
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