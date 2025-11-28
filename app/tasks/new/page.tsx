'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase'
import { TaskForm } from '@/components/tasks/TaskForm'
import { Skill, Project, Event } from '@/types'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewTaskPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [skills, setSkills] = useState<Skill[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)

    const supabase = createClient()

    useEffect(() => {
        if (! authLoading && !user) {
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
                .from('skills')
                .select('*')
                . order('name', { ascending: true })

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

            setSkills(skillsData || [])
            setProjects(projectsData || [])
            setEvents(eventsData || [])
        } catch (error) {
            console.error('Error fetching related data:', error)
        } finally {
            setLoading(false)
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

    if (!user) return null

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/tasks"
                    className="p-2 hover:bg-cardBg dark:hover:bg-cardBg-dark rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-text dark:text-text-dark" />
                </Link>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-text dark:text-text-dark">
                        Create New Task
                    </h1>
                    <p className="text-text-secondary dark:text-text-darkSecondary text-sm mt-1">
                        Add a new task to your to-do list
                    </p>
                </div>
            </div>

            <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6 md:p-8">
                <TaskForm
                    skills={skills}
                    projects={projects}
                    events={events}
                />
            </div>
        </div>
    )
}