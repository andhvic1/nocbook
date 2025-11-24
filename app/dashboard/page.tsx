'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Users, FolderKanban, Award, Calendar } from 'lucide-react'

export default function DashboardPage() {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
    }, [user, loading, router])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-textSecondary">Loading...</p>
                </div>
            </div>
        )
    }

    if (!user) return null

    const stats = [
        { icon: Users, label: 'People', value: '0', color: 'text-blue-500' },
        { icon: FolderKanban, label: 'Projects', value: '0', color: 'text-green-500' },
        { icon: Award, label: 'Skills', value: '0', color: 'text-purple-500' },
        { icon: Calendar, label: 'Events', value: '0', color: 'text-orange-500' },
    ]

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-text mb-2">
                    Welcome back, <span className="text-primary">{user.email}</span>
                </h1>
                <p className="text-textSecondary">Here's what's happening with your NocBook</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <div
                            key={stat.label}
                            className="bg-cardBg border-2 border-border rounded-xl p-6 hover:border-primary transition-colors"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <Icon className={`w-8 h-8 ${stat.color}`} />
                                <span className="text-3xl font-bold text-text">{stat.value}</span>
                            </div>
                            <p className="text-textSecondary font-medium">{stat.label}</p>
                        </div>
                    )
                })}
            </div>

            <div className="bg-cardBg border-2 border-border rounded-xl p-6">
                <h2 className="text-xl font-bold text-text mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button className="p-4 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left">
                        <p className="font-medium text-text">Add Person</p>
                        <p className="text-sm text-textSecondary mt-1">Add someone to your network</p>
                    </button>
                    <button className="p-4 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left">
                        <p className="font-medium text-text">New Project</p>
                        <p className="text-sm text-textSecondary mt-1">Start tracking a new project</p>
                    </button>
                    <button className="p-4 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left">
                        <p className="font-medium text-text">Log Event</p>
                        <p className="text-sm text-textSecondary mt-1">Record a workshop or seminar</p>
                    </button>
                    <button className="p-4 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left">
                        <p className="font-medium text-text">Daily Log</p>
                        <p className="text-sm text-textSecondary mt-1">Write today's entry</p>
                    </button>
                </div>
            </div>
        </div>
    )
}