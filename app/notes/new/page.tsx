'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase'
import { NoteForm } from '@/components/notes/NoteForm'
import { Skill, Project, Event, Task } from '@/types'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewNotePage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [skills, setSkills] = useState<Skill[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    const [events, setEvents] = useState<Event[]>([])
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)

    const supabase = createClient()

    useEffect(() => {
        if (!  authLoading && ! user) {
            router.push('/login')
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (user) {
            fetchRelatedData()
        }
    }, [user])

    const fetchRelatedData = async () => {
        try {
            setLoading(true)

            // Fetch skills
            const { data: skillsData } = await supabase
                . from('skills')
                .select('*')
                .order('name', { ascending: true })

            // Fetch projects
            const { data: projectsData } = await supabase
                .from('projects')
                .select('*')
                .order('title', { ascending: true })

            // Fetch events
            const { data: eventsData } = await supabase
                .from('events')
                .select('*')
                .order('name', { ascending: true })

            // Fetch tasks
            const { data: tasksData } = await supabase
                .from('tasks')
                .select('*')
                .order('title', { ascending: true })

            setSkills(skillsData || [])
            setProjects(projectsData || [])
            setEvents(eventsData || [])
            setTasks(tasksData || [])
        } catch (error) {
            console. error('Error fetching related data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-primary-dark mx-auto mb-4"></div>
                    <p className="text-text-secondary dark:text-text-darkSecondary">Loading... </p>
                </div>
            </div>
        )
    }

    if (! user) return null

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/notes"
                    className="p-2 hover:bg-cardBg dark:hover:bg-cardBg-dark rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-text dark:text-text-dark" />
                </Link>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-text dark:text-text-dark">
                        Create New Note
                    </h1>
                    <p className="text-text-secondary dark:text-text-darkSecondary text-sm mt-1">
                        Add knowledge to your personal library
                    </p>
                </div>
            </div>

            <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6 md:p-8">
                <NoteForm
                    skills={skills}
                    projects={projects}
                    events={events}
                    tasks={tasks}
                />
            </div>
        </div>
    )
}